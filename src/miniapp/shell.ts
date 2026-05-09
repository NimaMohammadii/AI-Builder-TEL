import { MINIAPP_STYLES } from './styles';
import { PLINKO_STYLES } from './plinko-styles';
import { MINES_STYLES } from './mines-styles';
import { PLAY_ZONE_STYLES } from './play-zone-styles';
import { TTS_STYLES } from './tts-styles';
import { HOME_SECTION } from './home';
import { CONNECT_SECTION } from './connect';
import { RESULTS_SECTION } from './results';
import { PLAY_ZONE_SECTION } from './play-zone';
import { TTS_SECTION } from './tts';
import { MINES_SECTION } from './mines';
import { PLINKO_SECTION } from './plinko';
import { MINIAPP_SCRIPT } from './script';
import { CREDIT_SCRIPT } from './credit-script';
import { PLAY_ZONE_IMAGE_REFRESH_SCRIPT } from './play-zone-image-refresh-script';
import { PLINKO_SCRIPT } from './plinko-script';
import { PLINKO_PANEL_SCRIPT } from './plinko-panel-script';
import { MINES_SCRIPT } from './mines-script';
import { ACTIVITY_SCRIPT } from './activity-script';
import { SECTION_LOCK_SCRIPT } from './section-lock-script';
import { SECTION_LOCK_IMAGE_SPLIT_SCRIPT } from './section-lock-image-split-script';
import { UPLOADED_IMAGE_CACHE_SCRIPT } from '../uploaded-image-cache-script';

const ICONS = {
  home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.75 10.55 12 4.35l7.25 6.2v7.1a2 2 0 0 1-2 2h-2.8v-4.7a2.45 2.45 0 0 0-4.9 0v4.7h-2.8a2 2 0 0 1-2-2v-7.1Z"/><path d="M3.5 11.7 12 4.45l8.5 7.25"/> </svg>',
  connect: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.25 12.05a4.2 4.2 0 0 1 0-5.94l1.5-1.5a4.2 4.2 0 0 1 5.94 5.94l-.72.72"/><path d="M15.75 11.95a4.2 4.2 0 0 1 0 5.94l-1.5 1.5a4.2 4.2 0 0 1-5.94-5.94l.72-.72"/><path d="M9.6 14.4 14.4 9.6"/></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.1 5.35c0-.9.98-1.46 1.76-.99l9 5.42a1.15 1.15 0 0 1 0 1.98l-9 5.42a1.15 1.15 0 0 1-1.76-.99V5.35Z"/><path d="M5 7.2v9.6"/></svg>',
  flow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.7 14.4V9.6"/><path d="M8.35 17.1V6.9"/><path d="M12 19.2V4.8"/><path d="M15.65 16.45v-8.9"/><path d="M19.3 13.75v-3.5"/></svg>',
};

export function miniAppShellHtml(): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"/><meta name="theme-color" content="#000000"/><title>Vexa FLOW</title><script src="https://telegram.org/js/telegram-web-app.js"></script><style>${MINIAPP_STYLES}${TTS_STYLES}${PLINKO_STYLES}${MINES_STYLES}${PLAY_ZONE_STYLES}</style></head><body><main class="app"><header class="top"><div class="brand"><img class="logo" src="https://t.me/i/userpic/320/VexaFlowBOT.jpg" alt="Vexa FLOW"/><div><h1 id="brandTitle">Vexa FLOW</h1><p id="userLine">AI Bot Control</p></div></div></header><div class="content">${HOME_SECTION}${CONNECT_SECTION}${RESULTS_SECTION}${PLAY_ZONE_SECTION}${TTS_SECTION}${MINES_SECTION}${PLINKO_SECTION}</div><nav class="tabs icon-tabs"><button class="tab nav-home active" data-view="home" aria-label="Home">${ICONS.home}</button><div class="nav-cluster"><button class="tab" data-view="connect" aria-label="Connect">${ICONS.connect}</button><button class="tab" data-view="playzone" aria-label="Play Zone">${ICONS.play}</button><button class="tab" data-view="flow" aria-label="TTS">${ICONS.flow}</button></div></nav></main><div id="toast" class="toast"></div><script>${MINIAPP_SCRIPT}</script><script>${CREDIT_SCRIPT}</script><script>${PLAY_ZONE_IMAGE_REFRESH_SCRIPT}</script><script>${MINES_SCRIPT}</script><script>${PLINKO_SCRIPT}</script><script>${PLINKO_PANEL_SCRIPT}</script><script>${ACTIVITY_SCRIPT}</script><script>${UPLOADED_IMAGE_CACHE_SCRIPT}</script><script>${SECTION_LOCK_SCRIPT}</script><script>${SECTION_LOCK_IMAGE_SPLIT_SCRIPT}</script></body></html>`;
}
