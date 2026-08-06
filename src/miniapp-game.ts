import { miniAppShellHtml } from './miniapp/shell';
import { SPECIAL_WHEEL_OVERLAY } from './special-wheel-mode';

const SPECIAL_WHEEL_HEADER_RESTORE = `
<style id="special-wheel-header-restore">
  body.special-wheel-active main.app > header.top {
    position: relative !important;
    z-index: 2147483647 !important;
    display: flex !important;
    visibility: visible !important;
    opacity: 1 !important;
    transform: none !important;
    background: #000 !important;
  }
  body.special-wheel-active main.app > header.top .brand,
  body.special-wheel-active main.app > header.top .top-balance-wrap {
    visibility: visible !important;
    opacity: 1 !important;
  }
  body.special-wheel-active main.app > header.top #rankPill {
    display: flex !important;
    visibility: visible !important;
    opacity: 1 !important;
  }
</style>`;

export function miniAppHtml(): string {
  return miniAppShellHtml().replace(
    '</body>',
    `${SPECIAL_WHEEL_OVERLAY}${SPECIAL_WHEEL_HEADER_RESTORE}</body>`,
  );
}
