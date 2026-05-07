import { MINIAPP_STYLES } from './styles';
import { CONNECT_SECTION, HOME_SECTION, RESULTS_SECTION, SETTINGS_SECTION, TTS_SECTION } from './sections';
import { MINIAPP_SCRIPT } from './script';

export function miniAppShellHtml(): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"/><meta name="theme-color" content="#000000"/><title>Vexa FLOW</title><script src="https://telegram.org/js/telegram-web-app.js"></script><style>${MINIAPP_STYLES}</style></head><body><main class="app"><header class="top"><div class="brand"><img class="logo" src="https://t.me/i/userpic/320/VexaFlowBOT.jpg" alt="Vexa FLOW"/><div><h1 id="brandTitle">Vexa FLOW</h1><p id="userLine">AI Bot Control</p></div></div></header><div class="content">${HOME_SECTION}${CONNECT_SECTION}${RESULTS_SECTION}${TTS_SECTION}${SETTINGS_SECTION}</div><nav class="tabs"><button class="tab active" data-view="home">Home</button><button class="tab" data-view="connect">Connect</button><button class="tab" data-view="flow">TTS</button><button class="tab" data-view="settings">Settings</button></nav></main><div id="toast" class="toast"></div><script>${MINIAPP_SCRIPT}</script></body></html>`;
}
