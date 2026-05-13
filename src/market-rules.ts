import type { Env } from './types';

export type MarketNftStatus = 'owned' | 'listed' | 'gift_pending' | 'burned';
export type MarketListingStatus = 'active' | 'sold' | 'cancelled';
export type MarketTransactionKind = 'primary_buy' | 'resale_buy' | 'gift_send' | 'gift_claim' | 'list' | 'cancel_listing';

export type MarketNftOwner = {
  instanceId: string;
  itemId: string;
  ownerUserId: string;
  status: MarketNftStatus;
  acquiredAt: string;
  updatedAt: string;
};

export type MarketListing = {
  listingId: string;
  instanceId: string;
  sellerUserId: string;
  priceNano: number;
  status: MarketListingStatus;
  createdAt: string;
  updatedAt: string;
};

export type MarketRuleConfig = {
  resaleFeeBps: number;
  giftFeeNano: number;
};

export type MarketFeeBreakdown = {
  priceNano: number;
  feeNano: number;
  sellerReceivesNano: number;
};

const DEFAULT_RESALE_FEE_BPS = 500;
const MAX_FEE_BPS = 3000;
const MARKET_RULE_CONFIG_KEY = 'admin:market-rule-config';

export async function ensureMarketRuleTables(env: Env): Promise<void> {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS market_nft_ownership (
    instance_id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL,
    owner_user_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'owned',
    acquired_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_market_nft_owner ON market_nft_ownership(owner_user_id, status)').run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_market_nft_item ON market_nft_ownership(item_id)').run();

  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS market_nft_listings (
    listing_id TEXT PRIMARY KEY,
    instance_id TEXT NOT NULL,
    seller_user_id TEXT NOT NULL,
    price_nano INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await env.DB.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_market_active_listing_instance ON market_nft_listings(instance_id) WHERE status = \'active\'').run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_market_active_listings ON market_nft_listings(status, created_at)').run();

  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS market_nft_transactions (
    transaction_id TEXT PRIMARY KEY,
    kind TEXT NOT NULL,
    instance_id TEXT,
    item_id TEXT,
    from_user_id TEXT,
    to_user_id TEXT,
    listing_id TEXT,
    price_nano INTEGER NOT NULL DEFAULT 0,
    fee_nano INTEGER NOT NULL DEFAULT 0,
    seller_receives_nano INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'completed',
    metadata_json TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_market_transactions_users ON market_nft_transactions(from_user_id, to_user_id, created_at)').run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_market_transactions_instance ON market_nft_transactions(instance_id, created_at)').run();
}

export async function getMarketRuleConfig(env: Env): Promise<MarketRuleConfig> {
  const saved = await env.BOT_CACHE.get(MARKET_RULE_CONFIG_KEY, 'json').catch(() => null) as Partial<MarketRuleConfig> | null;
  return {
    resaleFeeBps: normalizeFeeBps(saved?.resaleFeeBps ?? DEFAULT_RESALE_FEE_BPS),
    giftFeeNano: normalizeNano(saved?.giftFeeNano ?? 0),
  };
}

export async function setMarketRuleConfig(env: Env, input: Partial<MarketRuleConfig>): Promise<MarketRuleConfig> {
  const current = await getMarketRuleConfig(env);
  const next = {
    resaleFeeBps: normalizeFeeBps(input.resaleFeeBps ?? current.resaleFeeBps),
    giftFeeNano: normalizeNano(input.giftFeeNano ?? current.giftFeeNano),
  };
  await env.BOT_CACHE.put(MARKET_RULE_CONFIG_KEY, JSON.stringify(next));
  return next;
}

export function calculateMarketFee(priceNano: number, feeBps: number): MarketFeeBreakdown {
  const price = normalizeNano(priceNano);
  const fee = Math.floor(price * normalizeFeeBps(feeBps) / 10_000);
  return { priceNano: price, feeNano: fee, sellerReceivesNano: Math.max(0, price - fee) };
}

export async function assertCanListNft(env: Env, input: { instanceId: string; sellerUserId: string; priceNano: number }): Promise<MarketNftOwner> {
  await ensureMarketRuleTables(env);
  const owner = await readNftOwner(env, input.instanceId);
  const seller = cleanUserId(input.sellerUserId);
  if (!owner) throw new Error('NFT not found');
  if (owner.ownerUserId !== seller) throw new Error('Only the current owner can list this NFT');
  if (owner.status !== 'owned') throw new Error('NFT must be owned and unlocked before listing');
  if (normalizeNano(input.priceNano) <= 0) throw new Error('Listing price must be greater than zero');
  const activeListing = await readActiveListingForInstance(env, owner.instanceId);
  if (activeListing) throw new Error('NFT is already listed for sale');
  return owner;
}

export async function assertCanGiftNft(env: Env, input: { instanceId: string; fromUserId: string; toUserId: string }): Promise<MarketNftOwner> {
  await ensureMarketRuleTables(env);
  const owner = await readNftOwner(env, input.instanceId);
  const from = cleanUserId(input.fromUserId);
  const to = cleanUserId(input.toUserId);
  if (from === to) throw new Error('You cannot gift an NFT to yourself');
  if (!owner) throw new Error('NFT not found');
  if (owner.ownerUserId !== from) throw new Error('Only the current owner can gift this NFT');
  if (owner.status !== 'owned') throw new Error('NFT must be owned and unlocked before gifting');
  const activeListing = await readActiveListingForInstance(env, owner.instanceId);
  if (activeListing) throw new Error('Cancel the active listing before gifting this NFT');
  return owner;
}

export async function assertCanBuyListing(env: Env, input: { listingId: string; buyerUserId: string }): Promise<{ listing: MarketListing; owner: MarketNftOwner; fee: MarketFeeBreakdown }> {
  await ensureMarketRuleTables(env);
  const buyer = cleanUserId(input.buyerUserId);
  const listing = await readListing(env, input.listingId);
  if (!listing || listing.status !== 'active') throw new Error('Listing is not active');
  if (listing.sellerUserId === buyer) throw new Error('You cannot buy your own listing');
  const owner = await readNftOwner(env, listing.instanceId);
  if (!owner) throw new Error('NFT not found');
  if (owner.ownerUserId !== listing.sellerUserId) throw new Error('Listing seller no longer owns this NFT');
  if (owner.status !== 'listed') throw new Error('NFT is not locked for this listing');
  const config = await getMarketRuleConfig(env);
  return { listing, owner, fee: calculateMarketFee(listing.priceNano, config.resaleFeeBps) };
}

export async function assertCanCancelListing(env: Env, input: { listingId: string; userId: string }): Promise<{ listing: MarketListing; owner: MarketNftOwner }> {
  await ensureMarketRuleTables(env);
  const userId = cleanUserId(input.userId);
  const listing = await readListing(env, input.listingId);
  if (!listing || listing.status !== 'active') throw new Error('Listing is not active');
  if (listing.sellerUserId !== userId) throw new Error('Only the seller can cancel this listing');
  const owner = await readNftOwner(env, listing.instanceId);
  if (!owner) throw new Error('NFT not found');
  if (owner.ownerUserId !== userId) throw new Error('Seller no longer owns this NFT');
  return { listing, owner };
}

export async function readNftOwner(env: Env, instanceIdInput: string): Promise<MarketNftOwner | null> {
  const instanceId = cleanInstanceId(instanceIdInput);
  const row = await env.DB.prepare('SELECT * FROM market_nft_ownership WHERE instance_id = ?').bind(instanceId).first<OwnershipRow>().catch(() => null);
  return row ? ownerFromRow(row) : null;
}

export async function readListing(env: Env, listingIdInput: string): Promise<MarketListing | null> {
  const listingId = cleanId(listingIdInput, 'listing');
  const row = await env.DB.prepare('SELECT * FROM market_nft_listings WHERE listing_id = ?').bind(listingId).first<ListingRow>().catch(() => null);
  return row ? listingFromRow(row) : null;
}

export async function readActiveListingForInstance(env: Env, instanceIdInput: string): Promise<MarketListing | null> {
  const instanceId = cleanInstanceId(instanceIdInput);
  const row = await env.DB.prepare(`SELECT * FROM market_nft_listings WHERE instance_id = ? AND status = 'active' LIMIT 1`).bind(instanceId).first<ListingRow>().catch(() => null);
  return row ? listingFromRow(row) : null;
}

export async function recordMarketRuleTransaction(env: Env, input: {
  kind: MarketTransactionKind;
  instanceId?: string | null;
  itemId?: string | null;
  fromUserId?: string | null;
  toUserId?: string | null;
  listingId?: string | null;
  priceNano?: number;
  feeNano?: number;
  sellerReceivesNano?: number;
  status?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ transactionId: string }> {
  await ensureMarketRuleTables(env);
  const transactionId = 'mnft_txn_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20);
  await env.DB.prepare(`INSERT INTO market_nft_transactions (transaction_id, kind, instance_id, item_id, from_user_id, to_user_id, listing_id, price_nano, fee_nano, seller_receives_nano, status, metadata_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`)
    .bind(
      transactionId,
      cleanTransactionKind(input.kind),
      nullableClean(input.instanceId, 80),
      nullableClean(input.itemId, 60),
      input.fromUserId ? cleanUserId(input.fromUserId) : null,
      input.toUserId ? cleanUserId(input.toUserId) : null,
      nullableClean(input.listingId, 80),
      normalizeNano(input.priceNano ?? 0),
      normalizeNano(input.feeNano ?? 0),
      normalizeNano(input.sellerReceivesNano ?? 0),
      cleanStatus(input.status ?? 'completed'),
      input.metadata ? JSON.stringify(input.metadata).slice(0, 2000) : null,
    )
    .run();
  return { transactionId };
}

export function createNftInstanceId(itemId: string): string {
  return 'mnft_' + cleanItemId(itemId) + '_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
}

export function createListingId(): string {
  return 'mlist_' + crypto.randomUUID().replace(/-/g, '').slice(0, 18);
}

type OwnershipRow = {
  instance_id: string;
  item_id: string;
  owner_user_id: string;
  status: string;
  acquired_at: string;
  updated_at: string;
};

type ListingRow = {
  listing_id: string;
  instance_id: string;
  seller_user_id: string;
  price_nano: number;
  status: string;
  created_at: string;
  updated_at: string;
};

function ownerFromRow(row: OwnershipRow): MarketNftOwner {
  return {
    instanceId: row.instance_id,
    itemId: row.item_id,
    ownerUserId: row.owner_user_id,
    status: cleanOwnerStatus(row.status),
    acquiredAt: row.acquired_at,
    updatedAt: row.updated_at,
  };
}

function listingFromRow(row: ListingRow): MarketListing {
  return {
    listingId: row.listing_id,
    instanceId: row.instance_id,
    sellerUserId: row.seller_user_id,
    priceNano: normalizeNano(row.price_nano),
    status: cleanListingStatus(row.status),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeFeeBps(value: unknown): number {
  return Math.max(0, Math.min(MAX_FEE_BPS, Math.floor(Number(value) || 0)));
}

function normalizeNano(value: unknown): number {
  return Math.max(0, Math.floor(Number(value) || 0));
}

function cleanUserId(value: unknown): string {
  const id = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80);
  if (!id) throw new Error('Missing user id');
  return id;
}

function cleanItemId(value: unknown): string {
  const id = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 50);
  if (!id) throw new Error('Missing NFT item id');
  return id;
}

function cleanInstanceId(value: unknown): string {
  const id = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 80);
  if (!id) throw new Error('Missing NFT instance id');
  return id;
}

function cleanId(value: unknown, label: string): string {
  const id = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, 90);
  if (!id) throw new Error(`Missing ${label} id`);
  return id;
}

function nullableClean(value: unknown, max: number): string | null {
  const text = String(value ?? '').replace(/[^0-9A-Za-z_-]/g, '').trim().slice(0, max);
  return text || null;
}

function cleanStatus(value: unknown): string {
  return String(value ?? 'completed').replace(/[^a-z_]/g, '').slice(0, 40) || 'completed';
}

function cleanOwnerStatus(value: unknown): MarketNftStatus {
  const status = String(value || 'owned').replace(/[^a-z_]/g, '') as MarketNftStatus;
  return ['owned', 'listed', 'gift_pending', 'burned'].includes(status) ? status : 'owned';
}

function cleanListingStatus(value: unknown): MarketListingStatus {
  const status = String(value || 'active').replace(/[^a-z_]/g, '') as MarketListingStatus;
  return ['active', 'sold', 'cancelled'].includes(status) ? status : 'active';
}

function cleanTransactionKind(value: unknown): MarketTransactionKind {
  const kind = String(value || 'primary_buy').replace(/[^a-z_]/g, '') as MarketTransactionKind;
  return ['primary_buy', 'resale_buy', 'gift_send', 'gift_claim', 'list', 'cancel_listing'].includes(kind) ? kind : 'primary_buy';
}
