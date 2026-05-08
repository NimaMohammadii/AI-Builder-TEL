import { mobileAdminLoginHtml, mobileAdminPanelHtml } from './admin-mobile';
import { ADMIN_IMAGE_PANEL_SCRIPT } from './admin-image-panel';
import { ADMIN_UPLOAD_CACHE_SCRIPT } from './admin-upload-cache-panel';
import { ADMIN_PLINKO_CONTROL_SCRIPT } from './admin-plinko-control-panel';

export function adminHtml(): string {
  return mobileAdminLoginHtml();
}

export function adminPanelHtml(): string {
  return mobileAdminPanelHtml().replace('</body></html>', ADMIN_IMAGE_PANEL_SCRIPT + ADMIN_UPLOAD_CACHE_SCRIPT + ADMIN_PLINKO_CONTROL_SCRIPT + '</body></html>');
}

export function defaultCreditIconSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="black"/><circle cx="32" cy="32" r="22" fill="white"/></svg>`;
}
