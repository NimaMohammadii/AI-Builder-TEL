import { miniAppShellHtml } from './miniapp/shell';
import { CONNECT_SECTION } from './miniapp/connect';

export function miniAppHtml(): string {
  const marker = '<div class="content">';
  return miniAppShellHtml().split(marker).join(marker + CONNECT_SECTION);
}
