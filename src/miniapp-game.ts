import { miniAppShellHtml } from './miniapp/shell';
import { SPECIAL_WHEEL_OVERLAY } from './special-wheel-mode';

export function miniAppHtml(): string {
  return miniAppShellHtml().replace('</body>', `${SPECIAL_WHEEL_OVERLAY}</body>`);
}
