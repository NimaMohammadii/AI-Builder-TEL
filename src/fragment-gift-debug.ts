import type { Hono } from 'hono';
import type { Env } from './types';

const FRAGMENT_GIFTS_URL = 'https://fragment.com/gifts?sort=price_asc&filter=sale';
const DETAIL_LIMIT = 8;

type App = Hono<{ Bindings: Env }>;

type DebugGift = {
  title: string;
  number: string;
  sourceUrl: string;
  imageUrl: string | null;
  animationUrl: string | null;
  detailStatus?: number;
  detailHasVideoToken?: boolean;
  detailVideoLikeMatches?: string[];
};

export function registerFragmentGiftDebugRoutes(app: App) {
  app.get('/app/api/ton-gift-market-debug', async (c) => {
    try {
      const response = await fetch(FRAGMENT_GIFTS_URL, { headers: fragmentHeaders() });
      if (!response.ok) return c.json({ error: `Fragment list failed: ${response.status}` }, 200, { 'cache-control': 'no-store' });
      const html = await response.text();
      const gifts = parseList(html).slice(0, DETAIL_LIMIT);
      const sample = await Promise.all(gifts.map(enrichDetail));
      return c.json({
        totalSampled: sample.length,
        animatedCount: sample.filter((gift) => Boolean(gift.animationUrl)).length,
        sample,
      }, 200, { 'cache-control': 'no-store' });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : 'Debug failed' }, 200, { 'cache-control': 'no-store' });
    }
  });
}

async function enrichDetail(gift: DebugGift): Promise<DebugGift> {
  try {
    const response = await fetch(gift.sourceUrl, { headers: fragmentHeaders() });
    const html = await response.text().catch(() => '');
    const animationUrl = findAnimation(html) || gift.animationUrl;
    const matches = [...html.matchAll(/https?:[^\"'<>\s]+\.(?:mp4|webm|mov|tgs|json)(?:\?[^\"'<>\s]*)?/gi)]
      .map((match) => match[0])
      .slice(0, 12);
    return {
      ...gift,
      detailStatus: response.status,
      detailHasVideoToken: /video|animation|lottie|tgs|webm|mp4/i.test(html),
      detailVideoLikeMatches: matches,
      animationUrl,
    };
  } catch {
    return gift;
  }
}

function parseList(html: string): DebugGift[] {
  const anchors = [...html.matchAll(/<a\b[^>]*href=["']([^"']*\/gift\/[^"']+)["'][\s\S]*?<\/a>/gi)];
  return anchors.map((match, index) => {
    const block = match[0] || '';
    const sourceUrl = absolute(decodeHtml(match[1] || ''));
    return {
      title: findTitle(block, sourceUrl, index),
      number: findNumber(block, sourceUrl),
      sourceUrl,
      imageUrl: findImage(block),
      animationUrl: findAnimation(block),
    };
  }).filter((gift) => /for sale/i.test(gift.title + gift.number) || gift.sourceUrl.includes('/gift/'));
}

function fragmentHeaders(): HeadersInit {
  return {
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'accept-language': 'en-US,en;q=0.9',
    'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  };
}

function findTitle(block: string, sourceUrl: string, index: number): string {
  const value = first(block, [/alt=["']([^"']+)["']/i, /aria-label=["']([^"']+)["']/i, /class=["'][^"']*(?:title|name)[^"']*["'][^>]*>([\s\S]*?)<\//i]);
  if (value) return clean(value.replace(/#\d+.*/, ''));
  const slug = (sourceUrl.split('/').pop() || '').replace(/[-_]?\d+$/, '').replace(/[-_]+/g, ' ');
  return slug.replace(/\b\w/g, (letter) => letter.toUpperCase()) || `Gift ${index + 1}`;
}

function findNumber(block: string, sourceUrl: string): string {
  const found = first(block, [/#\s*([0-9]{2,})/i]) || sourceUrl.match(/(\d{2,})$/)?.[1] || '';
  return found ? `#${found}` : '';
}

function findImage(block: string): string | null {
  const value = first(block, [/<img\b[^>]*src=["']([^"']+)["']/i, /poster=["']([^"']+)["']/i, /property=["']og:image["'][^>]*content=["']([^"']+)["']/i, /background-image\s*:\s*url\(([^)]+)\)/i]);
  return value ? absolute(decodeHtml(value).replace(/^['"]|['"]$/g, '')) : null;
}

function findAnimation(block: string): string | null {
  const value = first(block, [/<video\b[^>]*src=["']([^"']+)["']/i, /<source\b[^>]*src=["']([^"']+)["']/i, /property=["']og:video["'][^>]*content=["']([^"']+)["']/i, /name=["']twitter:player:stream["'][^>]*content=["']([^"']+)["']/i, /["']([^"']+\.(?:mp4|webm|mov|tgs|json)(?:\?[^"']*)?)["']/i]);
  return value ? absolute(decodeHtml(value).replace(/^['"]|['"]$/g, '')) : null;
}

function first(value: string, patterns: RegExp[]): string {
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) return clean(match[1]);
  }
  return '';
}

function clean(value: string): string {
  return decodeHtml(value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

function decodeHtml(value: string): string {
  return value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

function absolute(value: string): string {
  if (!value) return value;
  if (value.startsWith('//')) return `https:${value}`;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('/')) return `https://fragment.com${value}`;
  return value;
}
