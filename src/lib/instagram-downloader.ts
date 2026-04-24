export interface InstagramMediaResult {
  sourceUrl: string;
  mediaType: "video" | "image";
  mediaUrl: string;
  caption?: string;
}

const INSTAGRAM_URL_REGEX = /https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|reels|tv|share\/(?:p|reel|reels))\/[A-Za-z0-9_-]+(?:\/?(?:\?[^\s]*)?)?/i;
const REQUEST_HEADERS = {
  "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "accept-language": "en-US,en;q=0.9"
};

export function extractInstagramUrl(text: string): string | null {
  const match = text.match(INSTAGRAM_URL_REGEX);
  return match?.[0] ?? null;
}

export async function fetchInstagramMedia(postUrl: string): Promise<InstagramMediaResult | null> {
  const normalizedUrl = normalizeInstagramUrl(postUrl);
  const urls = buildCandidateUrls(normalizedUrl);

  for (const url of urls) {
    const html = await fetchPageHtml(url);
    if (!html) continue;

    const media = parseMediaFromHtml(html, normalizedUrl);
    if (media) return media;
  }

  return null;
}

function parseMediaFromHtml(html: string, sourceUrl: string): InstagramMediaResult | null {
  const videoUrl = normalizeMediaUrl(firstNonNull([
    firstMetaContent(html, ["og:video", "og:video:url", "og:video:secure_url", "twitter:player:stream"]),
    firstJsonValue(html, ["video_url", "contentUrl", "videoUrl", "playable_url", "playable_url_quality_hd"]),
    firstUrlByPattern(html, /https?:\\\/\\\/[^"'<>\\]+\.(?:mp4|mov)(?:\?[^"'<>\\]*)?/i),
    firstUrlByPattern(html, /https?:\/\/[^"'<>]+\.(?:mp4|mov)(?:\?[^"'<>]*)?/i)
  ]));

  if (videoUrl) {
    return {
      sourceUrl,
      mediaType: "video",
      mediaUrl: videoUrl,
      caption: buildCaption(html)
    };
  }

  const imageUrl = normalizeMediaUrl(firstNonNull([
    firstMetaContent(html, ["og:image", "og:image:url", "twitter:image", "twitter:image:src"]),
    firstJsonValue(html, ["display_url", "thumbnail_src", "thumbnail_url", "image", "url"]),
    firstUrlByPattern(html, /https?:\\\/\\\/[^"'<>\\]+\.(?:jpg|jpeg|png|webp)(?:\?[^"'<>\\]*)?/i),
    firstUrlByPattern(html, /https?:\/\/[^"'<>]+\.(?:jpg|jpeg|png|webp)(?:\?[^"'<>]*)?/i)
  ]));

  if (imageUrl) {
    return {
      sourceUrl,
      mediaType: "image",
      mediaUrl: imageUrl,
      caption: buildCaption(html)
    };
  }

  return null;
}

async function fetchPageHtml(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { headers: REQUEST_HEADERS, redirect: "follow" });
    if (!response.ok) return null;
    const html = await response.text();
    if (/login|challenge|Please wait|checkpoint/i.test(html) && !/og:image|og:video|video_url|display_url/i.test(html)) {
      return null;
    }
    return html;
  } catch {
    return null;
  }
}

function buildCandidateUrls(normalizedUrl: string): string[] {
  const parsed = new URL(normalizedUrl);
  const pathname = parsed.pathname;
  return [
    normalizedUrl,
    `https://www.ddinstagram.com${pathname}`,
    `https://ddinstagram.com${pathname}`,
    `https://www.vxinstagram.com${pathname}`,
    `https://vxinstagram.com${pathname}`
  ];
}

function normalizeInstagramUrl(url: string): string {
  const parsed = new URL(url);
  parsed.search = "";
  parsed.hash = "";
  parsed.hostname = "www.instagram.com";
  const pathname = parsed.pathname.endsWith("/") ? parsed.pathname : `${parsed.pathname}/`;
  return `${parsed.protocol}//${parsed.hostname}${pathname}`;
}

function buildCaption(html: string): string | undefined {
  const description = firstNonNull([
    firstMetaContent(html, ["og:description", "twitter:description", "description"]),
    firstJsonValue(html, ["caption", "accessibility_caption", "alt"])
  ]);
  if (!description) return undefined;
  return decodeHtml(unescapeSlashes(description)).replace(/\s+/g, " ").trim().slice(0, 900);
}

function firstMetaContent(html: string, keys: string[]): string | null {
  for (const key of keys) {
    const propertyRegex = new RegExp(`<meta[^>]+(?:property|name)=["']${escapeRegex(key)}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i");
    const contentFirstRegex = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escapeRegex(key)}["'][^>]*>`, "i");
    const propertyMatch = html.match(propertyRegex);
    if (propertyMatch?.[1]) return propertyMatch[1];
    const contentFirstMatch = html.match(contentFirstRegex);
    if (contentFirstMatch?.[1]) return contentFirstMatch[1];
  }
  return null;
}

function firstJsonValue(html: string, keys: string[]): string | null {
  for (const key of keys) {
    const patterns = [
      new RegExp(`"${escapeRegex(key)}"\\s*:\\s*"([^"\\]*(?:\\.[^"\\]*)*)"`, "i"),
      new RegExp(`\\\\"${escapeRegex(key)}\\\\"\\s*:\\s*\\\\"([^\\\\"]+)\\\\"`, "i")
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) return match[1];
    }
  }
  return null;
}

function firstUrlByPattern(html: string, pattern: RegExp): string | null {
  const match = html.match(pattern);
  return match?.[0] ?? null;
}

function normalizeMediaUrl(value: string | null): string | null {
  if (!value) return null;
  const decoded = decodeHtml(unescapeSlashes(value));
  if (!/^https?:\/\//i.test(decoded)) return null;
  return decoded;
}

function unescapeSlashes(value: string): string {
  return value
    .replace(/\\u0026/g, "&")
    .replace(/\\u0025/g, "%")
    .replace(/\\\//g, "/")
    .replace(/\\\\\//g, "/")
    .replace(/\\"/g, '"');
}

function firstNonNull(values: Array<string | null>): string | null {
  for (const value of values) {
    if (value) return value;
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
