import { miniAppShellHtml } from './miniapp/shell';
import type { Env } from './types';

export async function miniAppHtml(env?: Env): Promise<string> {
  const html = miniAppShellHtml();
  const creditIconUrl = env ? await getCreditIconUrl(env) : '/app/api/credit-icon.png';
  return html
    .replace(/<head>/, `<head><link rel="preload" as="image" href="${creditIconUrl}" fetchpriority="high"/>`)
    .replaceAll('/app/api/credit-icon.png', creditIconUrl);
}

async function getCreditIconUrl(env: Env): Promise<string> {
  const version = (await env.BOT_CACHE.get('admin:credit-icon-version').catch(() => null)) || '1';
  const hasCreditIcon = Boolean(await env.BOT_CACHE.get('admin:credit-icon-type').catch(() => null));
  return hasCreditIcon ? `/app/api/uploaded-image/credit-icon.png?v=${version}` : `/app/api/credit-icon.png?v=${version}`;
}
