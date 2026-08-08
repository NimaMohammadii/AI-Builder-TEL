import { mobileAdminCodeHtml, mobileAdminLoginHtml, mobileAdminPanelHtml } from './admin-mobile';
import { ADMIN_PLINKO_CONTROL_SCRIPT } from './admin-plinko-control-panel';
import { ADMIN_PLINKO_VIRTUAL_USERS_SCRIPT } from './admin-plinko-virtual-users-panel';
import { ADMIN_CRASH_VIRTUAL_USERS_SCRIPT } from './admin-crash-virtual-users-panel';
import { ADMIN_PREDICT_PANEL_SCRIPT } from './admin-predict-panel';
import { ADMIN_FOOTBALL_PANEL_SCRIPT } from './admin-football-panel';
import { ADMIN_AUDIO_PANEL_SCRIPT } from './admin-audio-panel';

const ADMIN_LAYOUT_CSS = `<style>.reset-user-btn{height:31px!important;margin-top:8px!important;border:0!important;border-radius:999px!important;background:rgba(255,80,80,.16)!important;color:#ffb3b3!important;font-size:12px!important;width:100%!important}.bulk-users-btn{height:36px!important;border:0!important;border-radius:999px!important;background:rgba(255,80,80,.22)!important;color:#ffd1d1!important;font-size:12px!important;font-weight:800!important;padding:0 14px!important;white-space:nowrap!important}.menu-panel,.menu-panel[hidden]{display:flex!important;gap:7px!important;overflow-x:auto!important;margin:4px 0 18px!important;padding:0 0 8px!important;border:0!important;background:transparent!important}.menu-item{flex:0 0 auto!important;width:auto!important;min-width:86px!important;border-radius:999px!important}.menu-item strong{display:block!important;font-size:12px!important}.menu-item span{display:none!important}.withdrawals-shortcut{display:flex!important;align-items:center!important;justify-content:center;height:42px!important;margin:0 0 12px!important;border-radius:999px!important;background:rgba(255,255,255,.08)!important;color:#fff!important;text-decoration:none!important;font-weight:900!important;font-size:13px!important}.plinko-image-upload-grid{display:none!important}</style>`;

const ADMIN_OVERVIEW_BUTTON = '<button class="menu-item active" data-section="overview" type="button"><strong>Overview</strong><span>Admin tools overview</span></button>';
const ADMIN_OVERVIEW_SECTION = '<section class="section admin-section active" id="sectionOverview" data-title="Admin tools" data-subtitle="Image uploads are managed from the Telegram admin panel."><h2>Admin tools</h2><p class="muted small-text">Image uploads were moved to the Telegram bot admin panel. Send /admin to the game bot and open Game card images.</p></section>';
const ADMIN_OVERVIEW_SCRIPT = `<script>
const $=id=>document.getElementById(id);
const menu=$('adminMenu'),menuBtn=$('menuBtn'),logout=$('logout'),overview=document.querySelector('[data-section="overview"]');
menuBtn.onclick=()=>{menu.hidden=!menu.hidden};
logout.onclick=async()=>{await fetch('/admin/logout',{method:'POST',credentials:'same-origin'}).catch(()=>{});location.href='/admin'};
if(overview)overview.onclick=()=>{document.querySelectorAll('.menu-item').forEach(x=>x.classList.toggle('active',x===overview));document.querySelectorAll('.admin-section').forEach(s=>s.classList.toggle('active',s.id==='sectionOverview'));$('adminTitle').textContent='Admin tools';$('adminSubtitle').textContent='Image uploads are managed from the Telegram admin panel.';menu.hidden=true;window.scrollTo({top:0,behavior:'smooth'})};
</script>`;

function adminPanelWithFixes(): string {
  return mobileAdminPanelHtml()
    .replace(/<button class="menu-item active" data-section="images"[\s\S]*?<\/button>/, ADMIN_OVERVIEW_BUTTON)
    .replace(/<section class="section admin-section upload active" id="sectionImages"[\s\S]*?<\/section>/, ADMIN_OVERVIEW_SECTION)
    .replace(/<script>\s*const allowed=[\s\S]*?<\/script>/, ADMIN_OVERVIEW_SCRIPT)
    .replace(/<button class="menu-item active" data-section="users"[\s\S]*?<\/button>/, '')
    .replace(/<button class="menu-item" data-section="locks"[\s\S]*?<\/button>/, '')
    .replace(/Credit and per-user access/g, 'TON Balance and per-user access')
    .replace(/Credit and section access/g, 'TON Balance and section access')
    .replace(/Manage credit/g, 'Manage TON balance');
}

export function adminHtml(message?: string): string {
  return mobileAdminLoginHtml(message);
}

export function adminCodeHtml(challengeId: string, message?: string): string {
  return mobileAdminCodeHtml(challengeId, message);
}

export function adminPanelHtml(): string {
  return adminPanelWithFixes().replace('</body></html>', ADMIN_LAYOUT_CSS + ADMIN_AUDIO_PANEL_SCRIPT + ADMIN_PREDICT_PANEL_SCRIPT + ADMIN_FOOTBALL_PANEL_SCRIPT + ADMIN_PLINKO_CONTROL_SCRIPT + ADMIN_PLINKO_VIRTUAL_USERS_SCRIPT + ADMIN_CRASH_VIRTUAL_USERS_SCRIPT + '</body></html>');
}

export function defaultCreditIconSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="black"/><circle cx="32" cy="32" r="22" fill="white"/></svg>`;
}
