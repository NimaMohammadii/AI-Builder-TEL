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
import { TTS_STYLES } from './tts-styles';
import { MARKET_STYLES } from './market-styles';
import { HOME_OVERRIDES } from './home-overrides';
import { TRANSACTIONS_GLOBAL_STYLES } from './transactions-global-styles';
import { HOME_FINANCE_STYLES } from './home-finance-styles';
import { BALANCE_OVERRIDES } from './balance-overrides';
import { NAV_GLASS_OVERRIDES } from './nav-glass-overrides';
import { GLASS_COMPONENTS_OVERRIDES } from './glass-components-overrides';
import { APP_BACKGROUND_OVERRIDES } from './app-background-overrides';
import { CONNECT_BOT_CARD_LOCK_STYLES } from './connect-bot-card-lock-styles';
import { TOP_PLAYERS_STYLES } from './top-players-styles';
import { SECTION_LOCK_BACKGROUND_FIX_STYLES } from './section-lock-background-fix-styles';
import { GAME_LIVE_COUNT_SCRIPT, GAME_LIVE_COUNT_STYLES } from './game-live-counts';
import { HOME_SECTION } from './home';
import { REFERRAL_SECTION } from './referral';
import { RESULTS_SECTION } from './results';
import { PLAY_ZONE_SECTION } from './play-zone';
import { PREDICT_ZONE_SECTION } from './predict-zone';
import { TTS_SECTION } from './tts';
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
import { MINIAPP_SCRIPT } from './script';
import { TON_BALANCE_SCRIPT } from './ton-balance-script';
import { CONNECT_GROUPS_USAGE_SCRIPT } from './connect-groups-usage-script';
import { DEPOSIT_ENHANCEMENTS_SCRIPT } from './deposit-enhancements-script';
import { HOME_IMAGE_VERSION_SCRIPT } from './home-image-version-script';
import { TOP_PLAYERS_HOME_CARD_SCRIPT } from './top-players-home-card-script';
import { HOME_BLANK_CARDS_SCRIPT } from './home-blank-cards-script';
import { PLAY_ZONE_IMAGE_REFRESH_SCRIPT } from './play-zone-image-refresh-script';
import { PLAY_ZONE_STACK_SCROLL_SCRIPT } from './play-zone-stack-scroll-script';
import { PLAY_ZONE_VISIBILITY_SCRIPT } from './play-zone-visibility-script';
import { MARKET_CONFIG_SCRIPT } from './market-config-script';
import { PLINKO_SCRIPT } from './plinko-script';
import { PLINKO_DROP_FEEDBACK_SCRIPT } from './plinko-drop-feedback-script';
import { PLINKO_LIVE_FEED_POLISH_SCRIPT } from './plinko-live-feed-polish-script';
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
#home .home-intro-card {
  min-height: 156px !important;
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
#home .home-intro-card p {
  display: none !important;
}
#home .home-intro-image-frame {
  width: 100% !important;
  height: 100% !important;
  min-height: 144px !important;
  display: block !important;
  overflow: hidden !important;
  border: 1px solid rgba(255,255,255,.18) !important;
  border-radius: 24px !important;
  background: none !important;
  box-shadow: none !important;
  box-sizing: border-box !important;
}
#home .home-intro-image-frame img.home-intro-image {
  display: block !important;
  width: 100% !important;
  height: 100% !important;
  min-height: 144px !important;
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
    style.textContent='#depositSheet .deposit-close,#withdrawSheet .deposit-close{width:42px!important;height:42px!important;min-width:42px!important;border-radius:999px!important;background:linear-gradient(135deg,rgba(255,255,255,.105),rgba(255,255,255,.028))!important;border:1px solid rgba(255,255,255,.13)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.16),inset 0 -10px 22px rgba(255,255,255,.025),0 14px 34px rgba(0,0,0,.24)!important;color:rgba(255,255,255,.78)!important;display:grid!important;place-items:center!important;padding:0!important;-webkit-backdrop-filter:blur(14px) saturate(1.22)!important;backdrop-filter:blur(14px) saturate(1.22)!important}#depositSheet .deposit-close svg,#withdrawSheet .deposit-close svg{width:15px!important;height:15px!important;display:block!important;opacity:.86!important;color:currentColor!important}#depositSheet .deposit-close svg path,#withdrawSheet .deposit-close svg path{stroke:currentColor!important;stroke-width:1.85!important;stroke-linecap:round!important}#depositSheet .deposit-close:active,#withdrawSheet .deposit-close:active{transform:scale(.94)!important;background:linear-gradient(135deg,rgba(255,255,255,.16),rgba(255,255,255,.045))!important}';
    ['depositSheet','withdrawSheet'].forEach(function(id){var b=document.querySelector('#'+id+' .deposit-close');if(!b)return;b.innerHTML='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8.25 8.25l7.5 7.5M15.75 8.25l-7.5 7.5" stroke="currentColor" stroke-width="1.85" stroke-linecap="round"/></svg>'});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
  document.addEventListener('click',function(ev){var a=ev.target&&ev.target.closest&&ev.target.closest('[data-action="open-deposit"],[data-action="open-withdraw"]');if(a)setTimeout(apply,20)},true);
})();
`;

const STYLES = [
  MINIAPP_STYLES,
  TTS_STYLES,
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
  HOME_FINANCE_STYLES,
  BALANCE_OVERRIDES,
  NAV_GLASS_OVERRIDES,
  GLASS_COMPONENTS_OVERRIDES,
  APP_BACKGROUND_OVERRIDES,
  CONNECT_BOT_CARD_LOCK_STYLES,
  TOP_PLAYERS_STYLES,
  SECTION_LOCK_BACKGROUND_FIX_STYLES,
  GAME_LIVE_COUNT_STYLES,
].join('');

const SECTIONS = [
  HOME_SECTION,
  REFERRAL_SECTION,
  MARKET_SECTION,
  RESULTS_SECTION,
  PLAY_ZONE_SECTION,
  PREDICT_ZONE_SECTION,
  TOP_PLAYERS_SECTION,
  `<div style="display:none">${TTS_SECTION}</div>`,
  MINES_SECTION,
  PLINKO_SECTION,
  CRASH_SECTION,
  SLOT_SECTION,
  WHEEL_SECTION,
  DICE_SECTION + DICE_FINAL_TWEAK,
  RPS_SECTION,
  PUMP_SECTION,
  LIMBO_SECTION,
].join('');

const scriptBody = (script: string): string => script.replace(/^\s*<script[^>]*>/i, '').replace(/<\/script>\s*$/i, '');

const SCRIPTS = [
  BOOT_LOADER_SCRIPT,
  DICE_ASSET_CACHE_SCRIPT,
  MINIAPP_SCRIPT,
  TON_BALANCE_SCRIPT,
  CONNECT_GROUPS_USAGE_SCRIPT,
  DEPOSIT_ENHANCEMENTS_SCRIPT,
  FINANCE_CLOSE_BUTTON_SCRIPT,
  HOME_IMAGE_VERSION_SCRIPT,
  TOP_PLAYERS_HOME_CARD_SCRIPT,
  HOME_BLANK_CARDS_SCRIPT,
  PLAY_ZONE_IMAGE_REFRESH_SCRIPT,
  PLAY_ZONE_STACK_SCROLL_SCRIPT,
  PLAY_ZONE_VISIBILITY_SCRIPT,
  GAME_LIVE_COUNT_SCRIPT,
  MARKET_CONFIG_SCRIPT,
  PLINKO_SCRIPT,
  PLINKO_DROP_FEEDBACK_SCRIPT,
  PLINKO_LIVE_FEED_POLISH_SCRIPT,
  PLINKO_PERFORMANCE_SCRIPT,
  PLINKO_PANEL_SCRIPT,
  MINES_SCRIPT,
  CRASH_SCRIPT,
  SLOT_SCRIPT,
  WHEEL_ASSETS_SCRIPT,
  PREDICT_ZONE_SETTINGS_SCRIPT,
  scriptBody(FOOTBALL_PREDICT_SCRIPT),
  PREDICT_EXTRA_MARKETS_SCRIPT,
  PREDICT_ENTRY_LOADER_SCRIPT,
  scriptBody(PREDICT_CARD_ACTIONS_SCRIPT),
  TELEGRAM_BACK_BUTTON_SCRIPT,
  ACTIVITY_SCRIPT,
  UPLOADED_IMAGE_CACHE_SCRIPT,
  SECTION_TRUSTED_ACCESS_SCRIPT,
  SECTION_LOCK_SCRIPT,
  SECTION_LOADING_LOCK_SCRIPT,
  SECTION_LOCK_IMAGE_SPLIT_SCRIPT,
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
  <div id="bootLoader" class="boot-loader" aria-hidden="false"><div class="boot-loader-card"><div class="boot-loader-logo">V</div><div class="boot-loader-bar"><span></span></div></div></div>
  <div class="app">
    <header class="top">
      <div>
        <p class="eyebrow">VEXA</p>
        <h1>AI Builder</h1>
      </div>
      <div class="status-pill">Online</div>
    </header>
    <main class="content">${SECTIONS}</main>
    <nav class="tabs">
      <button class="tab active" data-view="home">Home</button>
      <button class="tab" data-view="playzone">Play</button>
      <button class="tab" data-view="predictzone">Predict</button>
      <button class="tab" data-view="market">Market</button>
      <button class="tab" data-view="referral">Referral</button>
    </nav>
  </div>
  ${SCRIPTS}
</body>
</html>`;
}
