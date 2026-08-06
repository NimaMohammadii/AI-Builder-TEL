import { miniAppShellHtml } from './miniapp/shell';
import { SPECIAL_WHEEL_OVERLAY } from './special-wheel-mode';
import { SPECIAL_WHEEL_HEADER } from './special-wheel-header';

export function miniAppHtml(): string {
  return miniAppShellHtml().replace('</body>', `${SPECIAL_WHEEL_OVERLAY}${SPECIAL_WHEEL_HEADER}</body>`);
}
