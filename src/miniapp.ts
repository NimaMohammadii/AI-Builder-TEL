import { miniAppShellHtml } from './miniapp/shell';
import { CONNECT_SECTION } from './miniapp/connect';

const CONNECT_ONLY_STYLE = '<style id="builderConnectOnly">.content>.view{display:none!important}.content>#connect{display:block!important}.tabs,.top-balance-pill,#rankPill{display:none!important}</style>';

export function miniAppHtml(): string {
  const marker = '<div class="content">';
  return miniAppShellHtml()
    .split(marker).join(marker + CONNECT_SECTION)
    .replace('</head>', CONNECT_ONLY_STYLE + '</head>')
    .replace('id="brandTitle">Vexa FLOW', 'id="brandTitle">Connect');
}
