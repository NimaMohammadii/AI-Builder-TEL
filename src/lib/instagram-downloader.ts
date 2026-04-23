export interface InstagramMediaResult {
  sourceUrl: string;
  mediaType: "video" | "image";
  mediaUrl: string;
  caption?: string;
}

const INSTAGRAM_URL_REGEX = /https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|reels|tv)\/[A-Za-z0-9_-]+(?:\/?(?:\?[^\s]*)?)?/i;

export function extractInstagramUrl(text: string): string | null {
  const match = text.match(INSTAGRAM_URL_REGEX);
  return match?.[0] ?? null;
}

export async function fetchInstagramMedia(postUrl: string): Promise<InstagramMediaResult | null> {
  const normalizedUrl = normalizeInstagramUrl(postUrl);
  const response = await fetch(normalizedUrl, {
    headers: {
      "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "accept-language": "en-US,en;q=0.9",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
      "sec-fetch-user": "?1"
    }
  });

  if (!response.ok) return null;
  const html = await response.text();

  const videoUrl = firstMetaContent(html, ["og:video", "og:video:url", "og:video:secure_url"]);
  if (videoUrl) {
    return {
      sourceUrl: normalizedUrl,
      mediaType: "video",
      mediaUrl: decodeHtml(videoUrl),
      caption: buildCaption(html)
    };
  }

  const imageUrl = firstMetaContent(html, ["og:image", "og:image:url", "twitter:image"]);
  if (imageUrl) {
    return {
      sourceUrl: normalizedUrl,
      mediaType: "image",
      mediaUrl: decodeHtml(imageUrl),
      caption: buildCaption(html)
    };
  }

  return null;
}

function normalizeInstagramUrl(url: string): string {
  const parsed = new URL(url);
  parsed.search = "";
  parsed.hash = "";
  const pathname = parsed.pathname.endsWith("/") ? parsed.pathname : `${parsed.pathname}/`;
  return `${parsed.origin}${pathname}`;
}

function buildCaption(html: string): string | undefined {
  const description = firstMetaContent(html, ["og:description", "twitter:description"]);
  if (!description) return undefined;
  return decodeHtml(description).replace(/\s+/g, " ").trim().slice(0, 900);
}

function firstMetaContent(html: string, keys: string[]): string | null {
  for (const key of keys) {
    const propertyRegex = new RegExp(`<meta[^>]+property=["']${escapeRegex(key)}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i");
    const nameRegex = new RegExp(`<meta[^>]+name=["']${escapeRegex(key)}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i");
    const propertyMatch = html.match(propertyRegex);
    if (propertyMatch?.[1]) return propertyMatch[1];
    const nameMatch = html.match(nameRegex);
    if (nameMatch?.[1]) return nameMatch[1];
  }
  return null;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x2F;/g, "/");
}
