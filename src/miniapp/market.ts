const creditLogo = '/app/api/uploaded-image/credit-icon.png';
const fallbackCreditLogo = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"%3E%3Cdefs%3E%3CradialGradient id="g" cx="32%25" cy="24%25" r="70%25"%3E%3Cstop offset="0" stop-color="%23ffffff"/%3E%3Cstop offset=".34" stop-color="%23ffd7e4"/%3E%3Cstop offset=".72" stop-color="%23ff2e63"/%3E%3Cstop offset="1" stop-color="%235b0f24"/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx="32" cy="32" r="28" fill="url(%23g)"/%3E%3Ccircle cx="32" cy="32" r="21" fill="none" stroke="rgba(255,255,255,.72)" stroke-width="3"/%3E%3Cpath d="M35 17 24 35h9l-4 12 13-20h-9l2-10Z" fill="white"/%3E%3C/svg%3E';

const marketItems = [
  ['genesis', 'Genesis Vexa', '1/100', '12.5'],
  ['ruby', 'Ruby Core', 'Rare', '8.0'],
  ['nova', 'Nova Mask', 'Epic', '15.75'],
  ['shadow', 'Shadow Pass', 'Limited', '6.25'],
  ['orbit', 'Orbit Key', 'Utility', '4.5'],
  ['pulse', 'Pulse Badge', 'Common', '2.0'],
  ['onyx', 'Onyx Crown', 'Legend', '22.0'],
  ['flare', 'Flare Wing', 'Rare', '9.5'],
  ['ghost', 'Ghost Node', 'Epic', '14.0'],
  ['matrix', 'Matrix Chip', 'Utility', '5.75'],
  ['crystal', 'Crystal Bot', 'Rare', '7.25'],
  ['void', 'Void Signal', 'Limited', '18.5'],
  ['neon', 'Neon Fang', 'Common', '3.0'],
  ['omega', 'Omega Key', 'Epic', '16.0'],
  ['prism', 'Prism Eye', 'Rare', '10.25'],
  ['alpha', 'Alpha Mark', '1/50', '25.0'],
] as const;

function nftCard([id, title, badge, price]: typeof marketItems[number]): string {
  return `<button class="market-nft-card game-card" type="button" data-market-item="${id}"><span class="market-nft-image game-image"><span class="market-nft-art market-nft-art-${id}"><b>${title.split(' ').map((part) => part[0]).join('').slice(0, 2)}</b></span></span><span class="market-nft-info game-info"><span class="market-nft-title-row"><strong>${title}</strong><em>${badge}</em></span><span class="market-price-button"><img src="${creditLogo}" alt="Credit" decoding="async" onerror="this.onerror=null;this.src='${fallbackCreditLogo}'"/><b>${price}</b></span></span></button>`;
}

const detailSheet = `<div id="marketDetailSheet" class="market-detail-sheet" aria-hidden="true"><div class="market-detail-backdrop" data-market-detail-close="1"></div><div class="market-detail-card" role="dialog" aria-modal="true" aria-label="NFT details"><div class="market-detail-pad"><div class="market-detail-titlebar"><div class="market-detail-title-main"><div class="market-detail-thumb" data-market-detail-media></div><div class="market-detail-heading"><span class="market-detail-kicker" data-market-detail-collection>Vexa Collectible</span><h3 data-market-detail-title>NFT</h3></div></div><button class="market-detail-close" type="button" data-market-detail-close="1" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg></button></div><p class="market-detail-description" data-market-detail-description></p><div class="market-detail-specs" data-market-detail-specs></div><div class="market-detail-price"><span>Price</span><strong><img src="${creditLogo}" alt="" decoding="async" onerror="this.onerror=null;this.src='${fallbackCreditLogo}'"/><b data-market-detail-price>0</b></strong></div><button class="market-detail-buy" type="button" data-market-buy=""><img src="${creditLogo}" alt="" decoding="async" onerror="this.onerror=null;this.src='${fallbackCreditLogo}'"/><span>Buy NFT</span></button><p class="market-detail-status" data-market-detail-status></p></div></div></div>`;

export const MARKET_SECTION = `<section id="market" class="view market-view"><div class="market-segment" role="tablist" aria-label="Market tabs"><button class="market-segment-btn active" type="button" data-market-tab="store">Market</button><span class="market-segment-split"><button class="market-segment-btn" type="button" data-market-tab="owned">My NFTs</button><button class="market-segment-btn" type="button" data-market-tab="listed">Listed</button></span></div><div class="market-tab-panel active" data-market-panel="store"><div class="market-grid game-grid">${marketItems.map(nftCard).join('')}</div></div><div class="market-tab-panel" data-market-panel="owned"><div class="market-owned-empty"><div class="market-owned-icon">◆</div><strong>No NFTs yet</strong><p>Your purchased NFTs will appear here.</p></div></div><div class="market-tab-panel" data-market-panel="listed"><div class="market-owned-empty"><div class="market-owned-icon">↗</div><strong>No listed NFTs</strong><p>NFTs you put up for sale will appear here.</p></div></div>${detailSheet}</section>`;
