import { mobileAdminLoginHtml, mobileAdminPanelHtml } from './admin-mobile';
import { ADMIN_IMAGE_PANEL_SCRIPT } from './admin-image-panel';
import { ADMIN_UPLOAD_CACHE_SCRIPT } from './admin-upload-cache-panel';
import { ADMIN_PLINKO_CONTROL_SCRIPT } from './admin-plinko-control-panel';
import { ADMIN_PLAY_ZONE_CARDS_PANEL_SCRIPT } from './admin-play-zone-cards-panel';
import { ADMIN_MARKET_PANEL_SCRIPT } from './admin-market-panel';
import { ADMIN_TON_PANEL_SCRIPT } from './admin-ton-panel';
import { ADMIN_HOME_FINANCE_IMAGE_PANEL_SCRIPT } from './admin-home-finance-image-panel';
import { ADMIN_RANK_CHARACTER_PANEL_SCRIPT } from './admin-rank-character-panel';
import { ADMIN_AUDIO_PANEL_SCRIPT } from './admin-audio-panel';
import { ADMIN_GROUP_AI_PROVIDER_PANEL_SCRIPT } from './admin-group-ai-provider-panel';
import { ADMIN_FORCE_REFRESH_PANEL_SCRIPT } from './admin-force-refresh-panel';
import { ADMIN_NFT_PRICE_ICON_PANEL_SCRIPT } from './admin-nft-price-icon-panel';
import { ADMIN_MARKET_PROVIDER_PANEL_SCRIPT } from './admin-market-provider-panel';
import { ADMIN_VEXA_LEAGUE_PANEL_SCRIPT } from './vexa-league-panel';
import { ADMIN_TOP_PLAYERS_HERO_PANEL_SCRIPT } from './admin-top-players-hero-panel';

const ADMIN_LAYOUT_CSS = `<style>
.icon-menu{display:none!important}.menu-panel,.menu-panel[hidden]{display:flex!important;gap:7px!important;overflow-x:auto!important;margin:4px 0 18px!important;padding:0 0 8px!important;border:0!important;background:transparent!important;scrollbar-width:none}.menu-panel::-webkit-scrollbar{display:none}.menu-item{flex:0 0 auto!important;width:auto!important;min-width:86px!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:999px!important;background:#070707!important;text-align:center!important;padding:8px 11px!important}.menu-item strong{display:block!important;font-size:12px!important;line-height:1!important}.menu-item span{display:none!important}.menu-item.active{background:#fff!important;color:#050505!important;border-color:#fff!important}.page{max-width:440px!important}.head{margin-bottom:10px!important}.head h1{font-size:28px!important}.head .muted{font-size:11px!important}.admin-section{margin-top:0!important}.row-title{margin-bottom:10px!important}.row-title h2,.admin-section h2{font-size:18px!important}.small-text{font-size:10px!important}.stats{gap:0!important;margin:13px 0!important;border-top:1px solid rgba(255,255,255,.09)!important;border-bottom:1px solid rgba(255,255,255,.09)!important}.stats div{border:0!important;border-right:1px solid rgba(255,255,255,.08)!important;border-radius:0!important;background:transparent!important;padding:9px 8px!important}.stats div:last-child{border-right:0!important}.stats span{font-size:8px!important}.stats b{font-size:17px!important;margin-top:4px!important}input{height:38px!important;font-size:13px!important}.status,.mini-status{font-size:11px!important}.users{display:block!important}.user{padding:12px 0!important;border-bottom:1px solid rgba(255,255,255,.11)!important}.user:first-child{border-top:1px solid rgba(255,255,255,.11)!important}.user-name b{font-size:15px!important}.badge{font-size:9px!important;padding:4px 7px!important}.user-top>strong{font-size:16px!important}.user-info{grid-template-columns:1fr 1fr!important;margin-top:7px!important}.user-info span{font-size:11px!important;color:rgba(255,255,255,.46)!important}.manage-btn{height:31px!important;margin-top:9px!important;font-size:12px!important}.user-manage{margin-top:9px!important;padding-top:9px!important}.credit-tools button,.credit-tools input,.section-block{height:34px!important;font-size:12px!important}.credit-tools button{font-size:20px!important;line-height:1!important}.locks-list{display:block!important}.lock-row{padding:12px 0!important;border-bottom:1px solid rgba(255,255,255,.11)!important}.lock-row:first-child{border-top:1px solid rgba(255,255,255,.11)!important}.lock-main strong{font-size:15px!important}.lock-main p{font-size:11px!important}.lock-preview{height:62px!important}.lock-toggle{height:32px!important;font-size:11px!important}.image-current{padding:12px 0!important}.image-current img{width:40px!important}.plinko-simple-card{padding:10px 0!important}.plinko-house-row{padding:7px 0!important}.plinko-house-row input{height:32px!important}.plinko-control-actions .ghost,.preset-row button{height:32px!important;font-size:11px!important}
</style>`;

function adminPanelWithFixes(): string {
  return mobileAdminPanelHtml()
    .replace(/Credit and per-user access/g, 'TON Balance and per-user access')
    .replace(/Credit and section access/g, 'TON Balance and section access')
    .replace(/Manage credit/g, 'Manage TON balance')
    .replace('loadUsers();loadLocks();setInterval(loadUsers,15000);', 'loadUsers();loadLocks();');
}

export function adminHtml(): string {
  return mobileAdminLoginHtml();
}

export function adminPanelHtml(): string {
  return adminPanelWithFixes().replace('</body></html>', ADMIN_LAYOUT_CSS + ADMIN_VEXA_LEAGUE_PANEL_SCRIPT + ADMIN_TOP_PLAYERS_HERO_PANEL_SCRIPT + ADMIN_GROUP_AI_PROVIDER_PANEL_SCRIPT + ADMIN_TON_PANEL_SCRIPT + ADMIN_FORCE_REFRESH_PANEL_SCRIPT + ADMIN_NFT_PRICE_ICON_PANEL_SCRIPT + ADMIN_MARKET_PROVIDER_PANEL_SCRIPT + ADMIN_IMAGE_PANEL_SCRIPT + ADMIN_HOME_FINANCE_IMAGE_PANEL_SCRIPT + ADMIN_RANK_CHARACTER_PANEL_SCRIPT + ADMIN_AUDIO_PANEL_SCRIPT + ADMIN_PLAY_ZONE_CARDS_PANEL_SCRIPT + ADMIN_MARKET_PANEL_SCRIPT + ADMIN_UPLOAD_CACHE_SCRIPT + ADMIN_PLINKO_CONTROL_SCRIPT + '</body></html>');
}

export function defaultCreditIconSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="black"/><circle cx="32" cy="32" r="22" fill="white"/></svg>`;
}