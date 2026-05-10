import { MINIAPP_STYLES } from './styles';
import { PLINKO_STYLES } from './plinko-styles';
import { MINES_STYLES } from './mines-styles';
import { CRASH_STYLES } from './crash-styles';
import { PLAY_ZONE_STYLES } from './play-zone-styles';
import { TTS_STYLES } from './tts-styles';
import { HOME_OVERRIDES } from './home-overrides';
import { BALANCE_OVERRIDES } from './balance-overrides';
import { NAV_GLASS_OVERRIDES } from './nav-glass-overrides';
import { HOME_SECTION } from './home';
import { CONNECT_SECTION } from './connect';
import { RESULTS_SECTION } from './results';
import { PLAY_ZONE_SECTION } from './play-zone';
import { TTS_SECTION } from './tts';
import { MINES_SECTION } from './mines';
import { PLINKO_SECTION } from './plinko';
import { CRASH_SECTION } from './crash';
import { MINIAPP_SCRIPT } from './script';
import { TON_BALANCE_SCRIPT } from './ton-balance-script';
import { PLAY_ZONE_IMAGE_REFRESH_SCRIPT } from './play-zone-image-refresh-script';
import { PLINKO_SCRIPT } from './plinko-script';
import { PLINKO_PANEL_SCRIPT } from './plinko-panel-script';
import { MINES_SCRIPT } from './mines-script';
import { CRASH_SCRIPT } from './crash-script';
import { ACTIVITY_SCRIPT } from './activity-script';
import { SECTION_LOCK_SCRIPT } from './section-lock-script';
import { SECTION_LOCK_IMAGE_SPLIT_SCRIPT } from './section-lock-image-split-script';
import { UPLOADED_IMAGE_CACHE_SCRIPT } from '../uploaded-image-cache-script';

export function miniAppShellHtml(): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"/><meta name="theme-color" content="#000000"/><title>Vexa FLOW</title><script src="https://telegram.org/js/telegram-web-app.js"></script><style>${MINIAPP_STYLES}${TTS_STYLES}${PLINKO_STYLES}${MINES_STYLES}${CRASH_STYLES}${PLAY_ZONE_STYLES}${HOME_OVERRIDES}${BALANCE_OVERRIDES}${NAV_GLASS_OVERRIDES}</style></head><body><main class="app"><header class="top"><div class="brand"><img class="logo" src="https://t.me/i/userpic/320/VexaFlowBOT.jpg" alt="Vexa FLOW"/><div><h1 id="brandTitle">Vexa FLOW</h1><p id="userLine">AI Bot Control</p></div></div><button class="top-balance-pill" type="button" data-action="open-deposit" aria-label="Open deposit"><span class="ton-mini-icon"><svg viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="27" fill="rgba(0,136,204,.18)" stroke="rgba(255,255,255,.3)"/><path d="M14.2 17.8h27.6c1.9 0 3.1 2.1 2.1 3.7L30.1 43.2c-.9 1.4-3.1 1.4-4 0L12.1 21.5c-1-1.6.2-3.7 2.1-3.7Zm3.4 3.5 8.7 15V21.3h-8.7Zm12.1 0v15l8.7-15h-8.7Z" fill="#fff"/></svg></span><b id="topTonBalance" data-ton-balance-display>0 TON</b></button></header><div class="content">${HOME_SECTION}${CONNECT_SECTION}${RESULTS_SECTION}${PLAY_ZONE_SECTION}${TTS_SECTION}${MINES_SECTION}${PLINKO_SECTION}${CRASH_SECTION}</div><nav class="tabs"><button class="tab active" data-view="home">Home</button><button class="tab" data-view="connect">Connect</button><button class="tab" data-view="playzone">Play Zone</button><button class="tab" data-view="flow">TTS</button></nav></main><div id="toast" class="toast"></div><script>${MINIAPP_SCRIPT}</script><script>${TON_BALANCE_SCRIPT}</script><script>${PLAY_ZONE_IMAGE_REFRESH_SCRIPT}</script><script>${MINES_SCRIPT}</script><script>${PLINKO_SCRIPT}</script><script>${PLINKO_PANEL_SCRIPT}</script><script>${CRASH_SCRIPT}</script><script>${ACTIVITY_SCRIPT}</script><script>${UPLOADED_IMAGE_CACHE_SCRIPT}</script><script>${SECTION_LOCK_SCRIPT}</script><script>${SECTION_LOCK_IMAGE_SPLIT_SCRIPT}</script></body></html>`;
}
