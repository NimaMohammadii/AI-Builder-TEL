export const PLAY_ZONE_CARD_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

const PLAY_ZONE_GAMES = new Set(['mines', 'plinko']);

export function normalizePlayZoneGame(value: unknown): string {
  const game = String(value ?? '').replace(/\.png$/i, '').replace(/[^a-zA-Z0-9_-]/g, '').trim().toLowerCase().slice(0, 40);
  if (!PLAY_ZONE_GAMES.has(game)) throw new Error('Unknown game');
  return game;
}

export function playZoneCardImageKey(game: string): string {
  return `admin:play-zone-card-image:${normalizePlayZoneGame(game)}`;
}

export function playZoneCardImageTypeKey(game: string): string {
  return `admin:play-zone-card-image-type:${normalizePlayZoneGame(game)}`;
}

export function playZoneCardImageVersionKey(game: string): string {
  return `admin:play-zone-card-image-version:${normalizePlayZoneGame(game)}`;
}
