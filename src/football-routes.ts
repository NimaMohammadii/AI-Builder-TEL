import app from './index';
import type { Env } from './types';

const CACHE_LONG = 'public, max-age=31536000, immutable';
const CACHE_NONE = 'no-store';
const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

const FOOTBALL_TEAMS = [
  ['argentina', 'Argentina'],
  ['brazil', 'Brazil'],
  ['france', 'France'],
  ['england', 'England'],
  ['spain', 'Spain'],
  ['germany', 'Germany'],
  ['portugal', 'Portugal'],
  ['netherlands', 'Netherlands'],
  ['usa', 'USA'],
  ['mexico', 'Mexico'],
  ['canada', 'Canada'],
  ['iran', 'Iran'],
] as const;

type FootballTeamId = typeof FOOTBALL_TEAMS[number][0];

app.get('/app/api/football-teams', async (c) => c.json(await getFootballTeams(c.env), 200, { 'cache-control': CACHE_NONE }));

app.get('/app/api/football-team-logo/:team', async (c) => {
  try {
    const team = normalizeTeam(c.req.param('team').replace(/\.png$/i, ''));
    return getTeamLogoResponse(c.env, teamLogoKey(team));
  } catch {
    return c.text('Not found', 404, { 'cache-control': CACHE_NONE });
  }
});

app.get('/admin/api/football-teams', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': CACHE_NONE });
  return c.json(await getFootballTeams(c.env), 200, { 'cache-control': CACHE_NONE });
});

app.post('/admin/api/football-team-logo', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': CACHE_NONE });
  try {
    const form = await c.req.formData();
    const team = normalizeTeam(String(form.get('team') || ''));
    const file = form.get('image');
    if (!(file instanceof File)) return c.json({ error: 'Choose an image file.' }, 400, { 'cache-control': CACHE_NONE });
    if (!IMAGE_TYPES.has(file.type)) return c.json({ error: 'Only PNG, JPG, JPEG or WebP files are allowed.' }, 400, { 'cache-control': CACHE_NONE });
    if (file.size > 3_000_000) return c.json({ error: 'Image must be under 3MB.' }, 400, { 'cache-control': CACHE_NONE });
    const version = String(Date.now());
    await c.env.ASSETS.put(teamLogoKey(team), file.stream(), { httpMetadata: { contentType: file.type }, customMetadata: { version } });
    return c.json(await getFootballTeams(c.env), 200, { 'cache-control': CACHE_NONE });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not upload football logo' }, 400, { 'cache-control': CACHE_NONE });
  }
});

async function getFootballTeams(env: Env): Promise<{ teams: Array<{ id: FootballTeamId; name: string; logoUrl: string }> }> {
  const teams = await Promise.all(FOOTBALL_TEAMS.map(async ([id, name]) => {
    const head = await env.ASSETS.head(teamLogoKey(id)).catch(() => null);
    const version = head?.customMetadata?.version || '1';
    return { id, name, logoUrl: head ? `/app/api/football-team-logo/${id}.png?v=${version}` : '' };
  }));
  return { teams };
}

async function getTeamLogoResponse(env: Env, key: string): Promise<Response> {
  const object = await env.ASSETS.get(key).catch(() => null);
  if (!object) return new Response('Not found', { status: 404, headers: { 'cache-control': CACHE_NONE } });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', CACHE_LONG);
  if (!headers.get('content-type')) headers.set('content-type', object.customMetadata?.contentType || 'image/png');
  return new Response(object.body, { headers });
}

function teamLogoKey(team: FootballTeamId): string { return `football/teams/${team}/logo`; }

function normalizeTeam(value: string): FootballTeamId {
  const team = value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
  for (const [id] of FOOTBALL_TEAMS) if (team === id) return id;
  throw new Error('Unknown football team');
}

function adminCookieValue(cookie: string | undefined): string {
  const match = (cookie ?? '').match(/(?:^|;\s*)vexa_admin=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function isAdmin(env: Env, key: string): boolean { return Boolean(env.ADMIN_KEY && key && key === env.ADMIN_KEY); }
function isAdminRequest(c: { env: Env; req: { header: (name: string) => string | undefined } }): boolean { return isAdmin(c.env, adminCookieValue(c.req.header('cookie'))); }
