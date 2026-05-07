import { mobileAdminLoginHtml, mobileAdminPanelHtml } from './admin-mobile';
import { ADMIN_IMAGE_PANEL_SCRIPT } from './admin-image-panel';

export function adminHtml(): string {
  return mobileAdminLoginHtml();
}

export function adminPanelHtml(): string {
  return mobileAdminPanelHtml().replace('</body></html>', ADMIN_IMAGE_PANEL_SCRIPT + '</body></html>');
}

export function defaultCreditIconSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="black"/><circle cx="32" cy="32" r="24" fill="none" stroke="white" stroke-opacity=".7" stroke-width="3"/><path d="M32 13l5.7 12.3L51 27.1l-9.8 9.3 2.4 13.1L32 43.1 20.4 49.5l2.4-13.1-9.8-9.3 13.3-1.8L32 13z" fill="white"/></svg>`;
}
