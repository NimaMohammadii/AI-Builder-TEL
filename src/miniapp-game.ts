import { miniAppShellHtml } from './miniapp/shell';

const EMPTY_HOME_SLOT_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';

export function miniAppHtml(): string {
  return miniAppShellHtml().replace(
    'src="/app/api/home-lottery-slot.png?v=home-lottery"',
    `src="${EMPTY_HOME_SLOT_IMAGE}"`,
  );
}
