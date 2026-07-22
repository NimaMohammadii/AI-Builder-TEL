import { MINIAPP_STYLES } from './styles';
import { PLINKO_STYLES } from './plinko-styles';
import { MINES_STYLES } from './mines-styles';
import { CRASH_STYLES } from './crash-styles';
import { SLOT_STYLES } from './slot-styles';
import { PLINKO_CONTROLS_MODERN_STYLES } from './plinko-controls-modern-styles';
import { CRASH_CONTROLS_MODERN_STYLES } from './crash-controls-modern-styles';
import { PLAY_ZONE_STYLES } from './play-zone-styles';
import { PREDICT_ZONE_CARD_STYLES } from './predict-zone-card-styles';
import { PREDICT_ZONE_STYLES } from './predict-zone-styles';
import { PREDICT_CRYPTO_SELECTOR_STYLES } from './predict-crypto-selector-styles';
import { PREDICT_CARD_ACTIONS_STYLES } from './predict-card-actions-styles';
import { FOOTBALL_PREDICT_STYLES } from './football-predict-styles';
import { PREDICT_ZONE_LOADER_POLISH_STYLES } from './predict-zone-loader-polish-styles';
import { PREDICT_ZONE_NAV_HIDE_STYLES } from './predict-zone-nav-hide-styles';
import { PREDICT_ZONE_HISTORY_POLISH_STYLES } from './predict-zone-history-polish-styles';
import { PLAY_ZONE_SHOWCASE_OVERRIDES } from './play-zone-showcase-overrides';
import { PLAY_ZONE_TOP_BLUR } from './play-zone-top-blur';
import { PLAY_ZONE_ROW_IMAGE_FIX } from './play-zone-row-image-fix';
import { PLAY_ZONE_EDGE_FIX } from './play-zone-edge-fix';
import { MARKET_STYLES } from './market-styles';
import { HOME_OVERRIDES } from './home-overrides';
import { TRANSACTIONS_GLOBAL_STYLES } from './transactions-global-styles';
import { BALANCE_OVERRIDES } from './balance-overrides';
import { NAV_GLASS_OVERRIDES } from './nav-glass-overrides';
import { GLASS_COMPONENTS_OVERRIDES } from './glass-components-overrides';
import { APP_BACKGROUND_OVERRIDES } from './app-background-overrides';
import { TOP_PLAYERS_STYLES } from './top-players-styles';
import { SECTION_LOCK_BACKGROUND_FIX_STYLES } from './section-lock-background-fix-styles';
import { SECTION_BACKGROUND_SCRIPT, SECTION_BACKGROUND_STYLES } from './section-background-script';
import { GAME_LIVE_COUNT_SCRIPT, GAME_LIVE_COUNT_STYLES } from './game-live-counts';
import { HOME_SECTION, HOME_BLANK_CARDS_SCRIPT, HOME_SLOT_TUNING_SCRIPT } from './home';
import { REFERRAL_SECTION } from './referral';
import { WALLET_SECTION } from './wallet';
import { RESULTS_SECTION } from './results';
import { PLAY_ZONE_SECTION } from './play-zone';
import { PREDICT_ZONE_SECTION } from './predict-zone';
import { REWARDS_SECTION } from './rewards';
import { MARKET_SECTION } from './market';
import { TOP_PLAYERS_SECTION } from './top-players';
import { MINES_SECTION } from './mines';
import { PLINKO_SECTION } from './plinko';
import { CRASH_SECTION } from './crash';
import { SLOT_SECTION } from './slot';
import { WHEEL_SECTION } from './wheel';
import { DICE_SECTION } from './dice-fixed';
import { DICE_FINAL_TWEAK } from './dice-final-tweak';
import { DICE_ASSET_CACHE_SCRIPT } from './dice-asset-cache-script';
import { RPS_SECTION } from './rps';
import { PUMP_SECTION } from './pump';
import { LIMBO_SECTION } from './limbo';
import { GHOST_RUN_SECTION, GHOST_RUN_STYLES } from './ghost-run';
import { MINIAPP_SCRIPT } from './script';
import { TON_BALANCE_SCRIPT } from './ton-balance-script';
import { DEPOSIT_ENHANCEMENTS_SCRIPT } from './deposit-enhancements-script';
import { HOME_IMAGE_VERSION_SCRIPT } from './home-image-version-script';
import { TOP_PLAYERS_HOME_CARD_SCRIPT } from './top-players-home-card-script';
import { PLAY_ZONE_IMAGE_REFRESH_SCRIPT } from './play-zone-image-refresh-script';
import { PLAY_ZONE_STACK_SCROLL_SCRIPT } from './play-zone-stack-scroll-script';
import { PLAY_ZONE_VISIBILITY_SCRIPT } from './play-zone-visibility-script';
import { MARKET_CONFIG_SCRIPT } from './market-config-script';
import { PLINKO_SCRIPT } from './plinko-script';
import { PLINKO_DROP_FEEDBACK_SCRIPT } from './plinko-drop-feedback-script';
import { PLINKO_PERFORMANCE_SCRIPT } from './plinko-performance-script';
import { PLINKO_PANEL_SCRIPT } from './plinko-panel-script';
import { MINES_SCRIPT } from './mines-script';
import { CRASH_SCRIPT } from './crash-script';
import { SLOT_SCRIPT } from './slot-script';
import { WHEEL_ASSETS_SCRIPT } from './wheel-assets-script';
import { BOOT_LOADER_SCRIPT } from './boot-loader-script';
import { ACTIVITY_SCRIPT } from './activity-script';
import { SECTION_LOCK_SCRIPT } from './section-lock-script';
import { SECTION_LOADING_LOCK_SCRIPT } from './section-loading-lock-script';
import { SECTION_TRUSTED_ACCESS_SCRIPT } from './section-trusted-access-script';
import { SECTION_LOCK_IMAGE_SPLIT_SCRIPT } from './section-lock-image-split-script';
import { MINIAPP_AUDIO_SCRIPT } from './audio-script';
import { XP_BAR_EFFECTS_SCRIPT } from './xp-bar-effects-script';
import { PREDICT_ZONE_SETTINGS_SCRIPT } from './predict-zone-settings-script';
import { PREDICT_EXTRA_MARKETS_SCRIPT } from './predict-extra-markets-script';
import { PREDICT_ENTRY_LOADER_SCRIPT } from './predict-entry-loader-script';
import { PREDICT_CARD_ACTIONS_SCRIPT } from './predict-card-actions-script';
import { FOOTBALL_PREDICT_SCRIPT } from './football-predict-script';
import { TELEGRAM_BACK_BUTTON_SCRIPT } from './telegram-back-button-script';
import { UPLOADED_IMAGE_CACHE_SCRIPT } from '../uploaded-image-cache-script';

const TON_LOGO_PNG = 'data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%2064%2064%27%3E%3Ccircle%20cx=%2732%27%20cy=%2732%27%20r=%2732%27%20fill=%27%230096ff%27/%3E%3Cpath%20d=%27M16%2018h32L32%2048%2016%2018z%27%20fill=%27white%27/%3E%3Cpath%20d=%27M22%2022h20L32%2042%2022%2022z%27%20fill=%27%230096ff%27%20opacity=%27.18%27/%3E%3C/svg%3E';
const GAME_BOT_PROFILE_IMAGE = 'https://t.me/i/userpic/320/' + 'VexaAppBOT' + '.jpg';

const HOME_INTRO_CARD_IMAGE_STYLES = `
#home .home-intro-card,
#rewards .home-intro-card {
  height: 104px !important;
  min-height: 104px !important;
  max-height: 104px !important;
  display: grid !important;
  place-items: stretch !important;
  padding: 6px !important;
  overflow: hidden !important;
  box-sizing: border-box !important;
  background-color: rgba(255,255,255,.035) !important;
  background-image: url('/app/api/home-intro-image.png') !important;
  background-size: cover !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
}
#home .home-intro-card h2,
#home .home-intro-card p,
#rewards .home-intro-card h2,
#rewards .home-intro-card p {
  display: none !important;
}
#home .home-intro-image-frame,
#rewards .home-intro-image-frame {
  width: 100% !important;
  height: 100% !important;
  min-height: 92px !important;
  display: block !important;
  overflow: hidden !important;
  border: 1px solid rgba(255,255,255,.18) !important;
  border-radius: 24px !important;
  background: none !important;
  box-shadow: none !important;
  box-sizing: border-box !important;
}
#home .home-intro-image-frame img.home-intro-image,
#rewards .home-intro-image-frame img.home-intro-image {
  display: block !important;
  width: 100% !important;
  height: 100% !important;
  min-height: 92px !important;
  object-fit: cover !important;
  object-position: center !important;
  border-radius: 23px !important;
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
}
`;

const FINANCE_CLOSE_BUTTON_SCRIPT = `
(function(){
  function apply(){
    var style=document.getElementById('vexa-finance-close-minimal-style');
    if(!style){style=document.createElement('style');style.id='vexa-finance-close-minimal-style';document.head.appendChild(style)}
    style.textContent='#depositSheet .deposit-close,#withdrawSheet .deposit-close{width:38px!important;height:38px!important;min-width:38px!important;padding:0!important;border:0!important;border-radius:999px!important;background:rgba(255,255,255,.035)!important;color:#fff!important;display:grid!important;place-items:center!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important;backdrop-filter:blur(6px)!important;-webkit-backdrop-filter:blur(6px)!important}#depositSheet .deposit-close svg,#withdrawSheet .deposit-close svg{width:20px!important;height:20px!important;display:block!important}#depositSheet .deposit-close svg path,#withdrawSheet .deposit-close svg path{stroke:currentColor!important;stroke-width:2.6!important;stroke-linecap:round!important}#depositSheet .deposit-close:active,#withdrawSheet .deposit-close:active{transform:scale(.94)!important;background:rgba(255,255,255,.055)!important}';
    ['depositSheet','withdrawSheet'].forEach(function(id){var b=document.querySelector('#'+id+' .deposit-close');if(!b)return;b.innerHTML='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>'});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
  document.addEventListener('click',function(ev){var a=ev.target&&ev.target.closest&&ev.target.closest('[data-action="open-deposit"],[data-action="open-withdraw"]');if(a)setTimeout(apply,20)},true);
})();
`;

const STYLES = [
  MINIAPP_STYLES,
  MARKET_STYLES,
  PLINKO_STYLES,
  MINES_STYLES,
  CRASH_STYLES,
  SLOT_STYLES,
  PLINKO_CONTROLS_MODERN_STYLES,
  CRASH_CONTROLS_MODERN_STYLES,
  PLAY_ZONE_STYLES,
  PREDICT_ZONE_CARD_STYLES,
  PREDICT_ZONE_STYLES,
  PREDICT_CRYPTO_SELECTOR_STYLES,
  PREDICT_CARD_ACTIONS_STYLES,
  FOOTBALL_PREDICT_STYLES,
  PREDICT_ZONE_LOADER_POLISH_STYLES,
  PREDICT_ZONE_NAV_HIDE_STYLES,
  PREDICT_ZONE_HISTORY_POLISH_STYLES,
  PLAY_ZONE_SHOWCASE_OVERRIDES,
  PLAY_ZONE_TOP_BLUR,
  PLAY_ZONE_ROW_IMAGE_FIX,
  PLAY_ZONE_EDGE_FIX,
  HOME_OVERRIDES,
  HOME_INTRO_CARD_IMAGE_STYLES,
  TRANSACTIONS_GLOBAL_STYLES,
  BALANCE_OVERRIDES,
  NAV_GLASS_OVERRIDES,
  GLASS_COMPONENTS_OVERRIDES,
  APP_BACKGROUND_OVERRIDES,
  TOP_PLAYERS_STYLES,
  SECTION_LOCK_BACKGROUND_FIX_STYLES,
  SECTION_BACKGROUND_STYLES,
  GAME_LIVE_COUNT_STYLES,
  GHOST_RUN_STYLES,
].join('');

const INITIAL_SECTIONS = [
  HOME_SECTION,
  PLAY_ZONE_SECTION,
  REWARDS_SECTION,
].join('');

const LAZY_SECTIONS: Array<{ id: string; html: string; scripts?: string[] }> = [
  { id: 'referral', html: REFERRAL_SECTION },
  { id: 'wallet', html: WALLET_SECTION },
  { id: 'market', html: MARKET_SECTION, scripts: [MARKET_CONFIG_SCRIPT] },
  { id: 'results', html: RESULTS_SECTION },
  { id: 'predictzone', html: PREDICT_ZONE_SECTION, scripts: [PREDICT_ZONE_SETTINGS_SCRIPT, FOOTBALL_PREDICT_SCRIPT, PREDICT_EXTRA_MARKETS_SCRIPT, PREDICT_ENTRY_LOADER_SCRIPT, PREDICT_CARD_ACTIONS_SCRIPT] },
  { id: 'topplayers', html: TOP_PLAYERS_SECTION },
  { id: 'mines', html: MINES_SECTION, scripts: [MINES_SCRIPT] },
  { id: 'plinko', html: PLINKO_SECTION, scripts: [PLINKO_SCRIPT, PLINKO_DROP_FEEDBACK_SCRIPT, PLINKO_PERFORMANCE_SCRIPT, PLINKO_PANEL_SCRIPT] },
  { id: 'crash', html: CRASH_SECTION, scripts: [CRASH_SCRIPT] },
  { id: 'slot', html: SLOT_SECTION, scripts: [SLOT_SCRIPT] },
  { id: 'wheel', html: WHEEL_SECTION, scripts: [WHEEL_ASSETS_SCRIPT] },
  { id: 'dice', html: DICE_SECTION + DICE_FINAL_TWEAK },
  { id: 'rps', html: RPS_SECTION },
  { id: 'coinflip', html: PUMP_SECTION },
  { id: 'limbo', html: LIMBO_SECTION },
  { id: 'ghostrun', html: GHOST_RUN_SECTION },
];

const scriptBody = (script: string): string => script.replace(/^\s*<script[^>]*>/i, '').replace(/<\/script>\s*$/i, '');

function inlineScriptJson(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003C')
    .replace(/>/g, '\\u003E')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function lazySectionLoaderScript(): string {
  const payload = inlineScriptJson(LAZY_SECTIONS.map((section) => ({
    id: section.id,
    html: section.html,
    scripts: section.scripts || [],
  })));
  return `
(function(){
  var registry=${payload};
  var mounted={};
  var main=null;
  function findMain(){return main||(main=document.querySelector('main.app')||document.body)}
  function runScript(code){
    if(!code)return;
    var script=document.createElement('script');
    script.text=String(code).replace(/^\\s*<script[^>]*>/i,'').replace(/<\\/script>\\s*$/i,'');
    document.body.appendChild(script);
  }
  function executeEmbeddedScripts(root){
    Array.prototype.slice.call(root.querySelectorAll('script')).forEach(function(oldScript){
      var script=document.createElement('script');
      Array.prototype.slice.call(oldScript.attributes||[]).forEach(function(attr){script.setAttribute(attr.name,attr.value)});
      script.text=oldScript.text||oldScript.textContent||'';
      oldScript.parentNode.replaceChild(script,oldScript);
    });
  }
  function mount(id){
    if(!id||document.getElementById(id))return true;
    if(mounted[id])return !!document.getElementById(id);
    var item=registry.filter(function(entry){return entry.id===id})[0];
    if(!item)return false;
    mounted[id]=true;
    var wrap=document.createElement('div');
    wrap.setAttribute('data-lazy-section-host',id);
    wrap.innerHTML=item.html;
    findMain().insertBefore(wrap, document.querySelector('nav.tabs'));
    executeEmbeddedScripts(wrap);
    (item.scripts||[]).forEach(runScript);
    try{window.dispatchEvent(new CustomEvent('vexa:section-mounted',{detail:{id:id}}))}catch(e){}
    return !!document.getElementById(id);
  }
  window.VexaLazySections={ensure:mount};
})();`;
}

const SCRIPTS = [
  BOOT_LOADER_SCRIPT,
  DICE_ASSET_CACHE_SCRIPT,
  lazySectionLoaderScript(),
  MINIAPP_SCRIPT,
  ACTIVITY_SCRIPT,
  TON_BALANCE_SCRIPT,
  DEPOSIT_ENHANCEMENTS_SCRIPT,
  FINANCE_CLOSE_BUTTON_SCRIPT,
  HOME_IMAGE_VERSION_SCRIPT,
  TOP_PLAYERS_HOME_CARD_SCRIPT,
  HOME_BLANK_CARDS_SCRIPT,
  HOME_SLOT_TUNING_SCRIPT,
  PLAY_ZONE_IMAGE_REFRESH_SCRIPT,
  PLAY_ZONE_STACK_SCROLL_SCRIPT,
  PLAY_ZONE_VISIBILITY_SCRIPT,
  GAME_LIVE_COUNT_SCRIPT,
  TELEGRAM_BACK_BUTTON_SCRIPT,
  UPLOADED_IMAGE_CACHE_SCRIPT,
  SECTION_TRUSTED_ACCESS_SCRIPT,
  SECTION_LOCK_SCRIPT,
  SECTION_LOADING_LOCK_SCRIPT,
  SECTION_LOCK_IMAGE_SPLIT_SCRIPT,
  SECTION_BACKGROUND_SCRIPT,
  MINIAPP_AUDIO_SCRIPT,
  XP_BAR_EFFECTS_SCRIPT,
].map((script) => `<script>${script}</script>`).join('');

export function miniAppShellHtml(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"/>
  <meta name="theme-color" content="#12070a"/>
  <title>Vexa FLOW</title>
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  <style>${STYLES}</style>
</head>
<body>
  <div id="vexaBoot" class="vexa-boot">
    <div class="vexa-boot-card">
      <img class="vexa-boot-logo" src="${GAME_BOT_PROFILE_IMAGE}" alt="Vexa App"/>
    </div>
  </div>
  <main class="app">
    <header class="top">
      <div class="brand">
        <img class="logo" src="${GAME_BOT_PROFILE_IMAGE}" alt="Vexa App"/>
        <div>
          <div style="display:flex;align-items:center;gap:9px;min-width:0">
            <h1 id="brandTitle">Vexa FLOW</h1>
            <div id="rankPill" aria-label="Current rank" style="height:30px;min-width:74px;padding:0 12px;border-radius:999px;background:rgba(255,255,255,.055);box-shadow:0 12px 28px rgba(0,0,0,.16),inset 0 1px 0 rgba(255,255,255,.16);backdrop-filter:blur(4px) saturate(1.15);-webkit-backdrop-filter:blur(4px) saturate(1.15);display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:850;letter-spacing:-.025em;pointer-events:none;text-shadow:0 1px 10px rgba(0,0,0,.32);transform:translateY(-1px)">Starter</div>
          </div>
          <p id="userLine">AI Bot Control</p>
        </div>
      </div>
      <div class="top-balance-wrap">
        <button class="top-balance-pill" type="button" data-action="open-transactions" aria-label="Open transaction history">
          <span class="ton-mini-icon"><img src="${TON_LOGO_PNG}" alt="" decoding="async"/></span>
          <b id="topTonBalance" data-ton-balance-display>0</b>
        </button>
        <button class="top-balance-plus" type="button" data-view="wallet" aria-label="Open wallet">+</button>
      </div>
    </header>
    ${INITIAL_SECTIONS}
    <nav class="tabs">
      <button class="tab active" data-view="home">Lucky Zone</button>
      <button class="tab" data-view="playzone">Play Hub</button>
      <button class="tab" data-view="rewards">Rewards</button>
    </nav>
  </main>
  <div id="toast" class="toast"></div>
  ${SCRIPTS}
</body>
</html>`;
}
