import { mobileAdminCodeHtml, mobileAdminLoginHtml, mobileAdminPanelHtml } from './admin-mobile';
import { ADMIN_PLINKO_CONTROL_SCRIPT } from './admin-plinko-control-panel';
import { ADMIN_PLINKO_VIRTUAL_USERS_SCRIPT } from './admin-plinko-virtual-users-panel';
import { ADMIN_CRASH_VIRTUAL_USERS_SCRIPT } from './admin-crash-virtual-users-panel';
import { ADMIN_PREDICT_PANEL_SCRIPT } from './admin-predict-panel';
import { ADMIN_FOOTBALL_PANEL_SCRIPT } from './admin-football-panel';
import { ADMIN_HOME_LOTTERY_SLOT_PANEL_SCRIPT } from './admin-home-lottery-slot-panel';
import { ADMIN_AUDIO_PANEL_SCRIPT } from './admin-audio-panel';
import { ADMIN_SLOT_FRAME_PANEL_SCRIPT } from './admin-slot-frame-panel';
import { ADMIN_SLOT_VIRTUAL_USERS_SCRIPT } from './admin-slot-virtual-users-panel';
import { ADMIN_GHOST_RUN_ASSETS_PANEL_SCRIPT } from './admin-ghost-run-assets-panel';
import { ADMIN_ONLINE_USER_COUNTS_PANEL_SCRIPT } from './admin-online-user-counts-panel';

const ADMIN_LAYOUT_CSS = `<style>.reset-user-btn{height:31px!important;margin-top:8px!important;border:0!important;border-radius:999px!important;background:rgba(255,80,80,.16)!important;color:#ffb3b3!important;font-size:12px!important;width:100%!important}.bulk-users-btn{height:36px!important;border:0!important;border-radius:999px!important;background:rgba(255,80,80,.22)!important;color:#ffd1d1!important;font-size:12px!important;font-weight:800!important;padding:0 14px!important;white-space:nowrap!important}.menu-panel,.menu-panel[hidden]{display:flex!important;gap:7px!important;overflow-x:auto!important;margin:4px 0 18px!important;padding:0 0 8px!important;border:0!important;background:transparent!important}.menu-item{flex:0 0 auto!important;width:auto!important;min-width:86px!important;border-radius:999px!important}.menu-item strong{display:block!important;font-size:12px!important}.menu-item span{display:none!important}.withdrawals-shortcut{display:flex!important;align-items:center!important;justify-content:center!important;height:42px!important;margin:0 0 12px!important;border-radius:999px!important;background:rgba(255,255,255,.08)!important;color:#fff!important;text-decoration:none!important;font-weight:900!important;font-size:13px!important}</style>`;

function adminPanelWithFixes(): string {
  return mobileAdminPanelHtml()
    .replace(/<button class="menu-item active" data-section="users"[\s\S]*?<\/button>/, '')
    .replace(/<button class="menu-item" data-section="locks"[\s\S]*?<\/button>/, '')
    .replace(/Credit and per-user access/g, 'TON Balance and per-user access')
    .replace(/Credit and section access/g, 'TON Balance and section access')
    .replace(/Manage credit/g, 'Manage TON balance')
    .replace('Manage images used inside the mini app. For now this section contains the credit icon.', 'Manage remaining images used inside the mini app.')
}

export function adminHtml(message?: string): string {
  return mobileAdminLoginHtml(message);
}

export function adminCodeHtml(challengeId: string, message?: string): string {
  return mobileAdminCodeHtml(challengeId, message);
}

export function adminPanelHtml(): string {
  return adminPanelWithFixes().replace('</body></html>', ADMIN_LAYOUT_CSS + ADMIN_ONLINE_USER_COUNTS_PANEL_SCRIPT + ADMIN_HOME_LOTTERY_SLOT_PANEL_SCRIPT + ADMIN_AUDIO_PANEL_SCRIPT + ADMIN_SLOT_FRAME_PANEL_SCRIPT + ADMIN_SLOT_VIRTUAL_USERS_SCRIPT + ADMIN_GHOST_RUN_ASSETS_PANEL_SCRIPT + ADMIN_PREDICT_PANEL_SCRIPT + ADMIN_FOOTBALL_PANEL_SCRIPT + ADMIN_PLINKO_CONTROL_SCRIPT + ADMIN_PLINKO_VIRTUAL_USERS_SCRIPT + ADMIN_CRASH_VIRTUAL_USERS_SCRIPT + '</body></html>');
}

export function defaultCreditIconSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="black"/><circle cx="32" cy="32" r="22" fill="white"/></svg>`;
}
