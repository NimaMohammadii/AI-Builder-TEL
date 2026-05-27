import { MINIAPP_STYLES } from './miniapp/styles';
import { CONNECT_SECTION } from './miniapp/connect';
import { CONNECT_BOT_CARD_LOCK_STYLES } from './miniapp/connect-bot-card-lock-styles';
import { CONNECT_GROUPS_USAGE_SCRIPT } from './miniapp/connect-groups-usage-script';
import { ACTIVITY_SCRIPT } from './miniapp/activity-script';
import { UPLOADED_IMAGE_CACHE_SCRIPT } from './uploaded-image-cache-script';

export function miniAppHtml(): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"/><meta name="theme-color" content="#12070a"/><title>Vexa Connect</title><script src="https://telegram.org/js/telegram-web-app.js"></script><style>${MINIAPP_STYLES}${CONNECT_BOT_CARD_LOCK_STYLES}#connect{display:block!important}.content{padding-bottom:24px!important}.tabs{display:none!important}</style></head><body><main class="app"><header class="top"><div class="brand"><img class="logo" src="https://t.me/i/userpic/320/VexaFlowBOT.jpg" alt="Vexa FLOW"/><div><h1 id="brandTitle">Connect</h1><p id="userLine">AI Bot Control</p></div></div></header><div class="content">${CONNECT_SECTION}</div></main><div id="toast" class="toast"></div><script>(function(){var tg=window.Telegram&&window.Telegram.WebApp;if(tg){try{tg.ready();tg.expand()}catch(e){}}var ownerId=localStorage.getItem('ownerId')||String((tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user&&tg.initDataUnsafe.user.id)||'');if(ownerId)localStorage.setItem('ownerId',ownerId);var userLine=document.getElementById('userLine');if(userLine)userLine.textContent=ownerId?'Telegram ID: '+ownerId:'AI Bot Control';})();</script><script>${CONNECT_GROUPS_USAGE_SCRIPT}</script><script>${ACTIVITY_SCRIPT}</script><script>${UPLOADED_IMAGE_CACHE_SCRIPT}</script></body></html>`;
}
