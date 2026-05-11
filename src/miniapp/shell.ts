import { MINIAPP_STYLES } from './styles';
import { PLINKO_STYLES } from './plinko-styles';
import { MINES_STYLES } from './mines-styles';
import { CRASH_STYLES } from './crash-styles';
import { PLAY_ZONE_STYLES } from './play-zone-styles';
import { TTS_STYLES } from './tts-styles';
import { HOME_OVERRIDES } from './home-overrides';
import { HOME_FINANCE_STYLES } from './home-finance-styles';
import { BALANCE_OVERRIDES } from './balance-overrides';
import { NAV_GLASS_OVERRIDES } from './nav-glass-overrides';
import { GLASS_COMPONENTS_OVERRIDES } from './glass-components-overrides';
import { APP_BACKGROUND_OVERRIDES } from './app-background-overrides';
import { CONNECT_BOT_CARD_LOCK_STYLES } from './connect-bot-card-lock-styles';
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
import { CONNECT_GROUPS_USAGE_SCRIPT } from './connect-groups-usage-script';
import { DEPOSIT_ENHANCEMENTS_SCRIPT } from './deposit-enhancements-script';
import { PLAY_ZONE_IMAGE_REFRESH_SCRIPT } from './play-zone-image-refresh-script';
import { PLINKO_SCRIPT } from './plinko-script';
import { PLINKO_PANEL_SCRIPT } from './plinko-panel-script';
import { MINES_SCRIPT } from './mines-script';
import { CRASH_SCRIPT } from './crash-script';
import { BOOT_LOADER_SCRIPT } from './boot-loader-script';
import { ACTIVITY_SCRIPT } from './activity-script';
import { SECTION_LOCK_SCRIPT } from './section-lock-script';
import { SECTION_LOCK_IMAGE_SPLIT_SCRIPT } from './section-lock-image-split-script';
import { UPLOADED_IMAGE_CACHE_SCRIPT } from '../uploaded-image-cache-script';

const TON_LOGO_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAEiklEQVR42u3dQXajQAwFQMPL/a9Mtll4kcQNLelXHWDGbtCXRMjM6wUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADbHVU/2HVdl8vDyKI7jjJ1d7oc8Hxzq9LgBAAET7kCAIJDQABAMAEAwVOAAAATAJDoyzgEAkDhgxVA8cPTdr4ZeCh8yA2BM/FLg+IvtAIAoQFgCkD3Dw4AYGMAVfkgKx8IVpkqPv1O06ajCecx7T4tMwGsPIwpP12Y9FOSCd9lYpOyAkCwUgFgCkD3NwEAqQEwaQpY8V3szvu75tTuX3YCsApg9LcCAKkBYApA9w+fACa8CJP+HKD7/j/9Po5ZAUwBuF8aBoBVAKO/CQBIDYDuU4Bfee5zdkndv9UEkF5EHdeX5JWry/16KibIvS9aBYAHghj9TQBAagB0nQLSXgjq9AJQavdvOwFYBVD8VgAgNQBMAej+JoDY0HJWxAdA4hTQ4XOmfcbOYdV+ArAKoPitAEBqAJgC0P3DJ4AuF2P6C0Ep/wLQlIeUVgBTgOtqBTAFuFkUf1r3NwGACWCWDlPA1OcAVfd/3T9sAvAWGe4rK4BnAbh+qQHggSBGfxOAcdKZkBoA06eASp+p2vno/gJAV8H9YwWY2+VwnQSAVQCjvwBIDaYKgeS/ABcApgB0fwEgBFD8AgAQAKYA3eaJM9D9BYDxN/DvRgB4FiD8dH8BIAQUv+IXAIAA6DYFdH0haOdDUN1fALj4uP4CYOZOinMWAGGrAEZ/ASCEWoSPl6AEgAI0Bej+AkAI4DoLAEwBzlMA6A7/v2mTOtNfvqvRXwBQqFPqxgJAd1Is7QJN9xcAQkDxIwAAAVBwCqj+QtBTLwDp/gIAEACeBdj9dX8BIAQUv+IXAALHd0MAmAI2/B13f27dXwDoXrhOAsCu6zwQAFYBxa/7CwBBs7+w/AtAAgBTgO4vAHCzOk8BQPsuCgJA13KOCACThKlDAKB7OT8BgJvYuQkAQAAwtZv9ZrevsP/r/gIAEACmAOeEAHBzOx8EAPc+B/DzfwGALudcBAAgANDtnIcAwE3vHAQAQ7x72OcBoABA9/P9BQAgANAFfW8BwMxi+LnzP73/K34BAAgA0rqi7i8ACC0OxS8AgCqB7AhqmvhSju5vAgAEAGndUvcXAIQWjeIXAIAAIK176v4CABAApHVR3V8AEFpMil8AAAKAtK6q+wsAQACQ1l11fwFAaJEpfgEACADSuq3uLwAILTrFLwAAAUBa99X9BQAgAEjrwrq/ACA0BBS/AAAEAGlTgO4vAAABQNoUoPsPu18cwVwr/3chhW8CIHQaUPwmAAKnAYUPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC08Q2FibINJmxEUAAAAABJRU5ErkJggg==';

export function miniAppShellHtml(): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"/><meta name="theme-color" content="#12070a"/><title>Vexa FLOW</title><script src="https://telegram.org/js/telegram-web-app.js"></script><style>${MINIAPP_STYLES}${TTS_STYLES}${PLINKO_STYLES}${MINES_STYLES}${CRASH_STYLES}${PLAY_ZONE_STYLES}${HOME_OVERRIDES}${HOME_FINANCE_STYLES}${BALANCE_OVERRIDES}${NAV_GLASS_OVERRIDES}${GLASS_COMPONENTS_OVERRIDES}${APP_BACKGROUND_OVERRIDES}${CONNECT_BOT_CARD_LOCK_STYLES}</style></head><body><div id="vexaBoot" class="vexa-boot"><div class="vexa-boot-card"><img class="vexa-boot-logo" src="https://t.me/i/userpic/320/VexaFlowBOT.jpg" alt="Vexa FLOW"/><h1 class="vexa-boot-title">Vexa FLOW</h1><p class="vexa-boot-sub">Mini App</p></div></div><main class="app"><header class="top"><div class="brand"><img class="logo" src="https://t.me/i/userpic/320/VexaFlowBOT.jpg" alt="Vexa FLOW"/><div><h1 id="brandTitle">Vexa FLOW</h1><p id="userLine">AI Bot Control</p></div></div><button class="top-balance-pill" type="button" data-action="open-deposit" aria-label="Open deposit"><span class="ton-mini-icon"><img src="${TON_LOGO_PNG}" alt="" decoding="async"/></span><b id="topTonBalance" data-ton-balance-display>0</b></button></header><div class="content">${HOME_SECTION}${CONNECT_SECTION}${RESULTS_SECTION}${PLAY_ZONE_SECTION}${TTS_SECTION}${MINES_SECTION}${PLINKO_SECTION}${CRASH_SECTION}</div><nav class="tabs"><button class="tab active" data-view="home">Home</button><button class="tab" data-view="connect">Connect</button><button class="tab" data-view="playzone">Play Zone</button><button class="tab" data-view="flow">TTS</button></nav></main><div id="toast" class="toast"></div><script>${BOOT_LOADER_SCRIPT}</script><script>${MINIAPP_SCRIPT}</script><script>${TON_BALANCE_SCRIPT}</script><script>${CONNECT_GROUPS_USAGE_SCRIPT}</script><script>${DEPOSIT_ENHANCEMENTS_SCRIPT}</script><script>${PLAY_ZONE_IMAGE_REFRESH_SCRIPT}</script><script>${MINES_SCRIPT}</script><script>${PLINKO_SCRIPT}</script><script>${PLINKO_PANEL_SCRIPT}</script><script>${CRASH_SCRIPT}</script><script>${ACTIVITY_SCRIPT}</script><script>${UPLOADED_IMAGE_CACHE_SCRIPT}</script><script>${SECTION_LOCK_SCRIPT}</script><script>${SECTION_LOCK_IMAGE_SPLIT_SCRIPT}</script></body></html>`;
}
