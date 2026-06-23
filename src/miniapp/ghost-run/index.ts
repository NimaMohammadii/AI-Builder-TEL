import { GHOST_RUN_SECTION as RAW_GHOST_RUN_SECTION } from './section';
export { GHOST_RUN_STYLES } from './styles';

function patchGhostRunSection(section: string): string {
  const start = section.indexOf('function cssUrl(url){');
  const end = start >= 0 ? section.indexOf('    function injectAssetUrls', start) : -1;
  if (start < 0 || end < 0) return section;

  const fixedCssUrl = "function cssUrl(url){var clean=String(url||'').split(\"'\").join('').split(')').join('');return \"url('\"+clean+\"')\"}\n";
  return section.slice(0, start) + fixedCssUrl + section.slice(end);
}

export const GHOST_RUN_SECTION = patchGhostRunSection(RAW_GHOST_RUN_SECTION);
