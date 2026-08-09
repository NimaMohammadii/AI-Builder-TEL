import { miniAppShellHtml } from './miniapp/shell';

const EMPTY_HOME_SLOT_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
const HOME_SLOT_META_KEY = 'vexaHomeLotterySlotMeta:v1';

export function miniAppHtml(homeSlotImageUrl = EMPTY_HOME_SLOT_IMAGE): string {
  const shell = miniAppShellHtml().replace(
    'src="/app/api/home-lottery-slot.png?v=home-lottery"',
    `src="${homeSlotImageUrl}"`,
  );
  if (!homeSlotImageUrl || homeSlotImageUrl === EMPTY_HOME_SLOT_IMAGE) return shell;
  const cachedUrl = JSON.stringify(homeSlotImageUrl);
  const primeCache = `<script>try{localStorage.setItem('${HOME_SLOT_META_KEY}',JSON.stringify({url:${cachedUrl},checkedAt:Date.now()}))}catch(e){}</script>`;
  return shell.replace('</head>', `${primeCache}</head>`);
}
