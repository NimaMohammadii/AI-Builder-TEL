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
import { PLINKO_SCRIPT } from './plinko-script';
import { PLINKO_PANEL_SCRIPT } from './plinko-panel-script';
import { MINES_SCRIPT } from './mines-script';
import { ACTIVITY_SCRIPT } from './activity-script';
import { SECTION_LOCK_SCRIPT } from './section-lock-script';
import { SECTION_LOCK_IMAGE_SPLIT_SCRIPT } from './section-lock-image-split-script';
import { UPLOADED_IMAGE_CACHE_SCRIPT } from '../uploaded-image-cache-script';

export function miniAppShellHtml(): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"/><meta name="theme-color" content="#000000"/><title>Vexa FLOW</title><script src="https://telegram.org/js/telegram-web-app.js"></script><style>${MINIAPP_STYLES}${TTS_STYLES}${PLINKO_STYLES}${MINES_STYLES}${PLAY_ZONE_STYLES}</style></head><body><main class="app"><header class="top"><div class="brand"><img class="logo" src="https://t.me/i/userpic/320/VexaFlowBOT.jpg" alt="Vexa FLOW"/><div><h1 id="brandTitle">Vexa FLOW</h1><p id="userLine">AI Bot Control</p></div></div></header><div class="content">${HOME_SECTION}${CONNECT_SECTION}${RESULTS_SECTION}${PLAY_ZONE_SECTION}${TTS_SECTION}${MINES_SECTION}${PLINKO_SECTION}</div><nav class="tabs"><button class="tab active" data-view="home">Home</button><button class="tab" data-view="connect">Connect</button><button class="tab" data-view="playzone">Play Zone</button><button class="tab" data-view="flow">TTS</button></nav></main><div id="toast" class="toast"></div><script>${MINIAPP_SCRIPT}</script><script>${CREDIT_SCRIPT}</script><script>${MINES_SCRIPT}</script><script>${PLINKO_SCRIPT}</script><script>${PLINKO_PANEL_SCRIPT}</script><script>${ACTIVITY_SCRIPT}</script><script>${UPLOADED_IMAGE_CACHE_SCRIPT}</script><script>${SECTION_LOCK_SCRIPT}</script><script>${SECTION_LOCK_IMAGE_SPLIT_SCRIPT}</script></body></html>`;
}
