import { GHOST_RUN_SECTION as RAW_GHOST_RUN_SECTION } from './section';
export { GHOST_RUN_STYLES } from './styles';

function replaceBlock(source: string, startToken: string, endToken: string, replacement: string): string {
  const start = source.indexOf(startToken);
  const end = start >= 0 ? source.indexOf(endToken, start) : -1;
  if (start < 0 || end < 0) return source;
  return source.slice(0, start) + replacement + source.slice(end);
}

function addBlackPageChrome(section: string): string {
  const blackChromeCss = `<style>
body:has(#ghostrun.view.active),
body:has(#ghostrun.view.active) .app,
body:has(#ghostrun.view.active) .content,
body:has(#ghostrun.view.active) #ghostrun{background:#000!important}
body:has(#ghostrun.view.active)::before,
body:has(#ghostrun.view.active)::after,
body:has(#ghostrun.view.active) .app::before,
body:has(#ghostrun.view.active) .app::after{background:#000!important;opacity:1!important;filter:none!important}
</style>`;
  return section.replace('<section id="ghostrun" class="view ghost-run-view" aria-label="Ghost Run">', '<section id="ghostrun" class="view ghost-run-view" aria-label="Ghost Run">' + blackChromeCss);
}

function patchGhostRunSection(section: string): string {
  let patched = addBlackPageChrome(section);

  const safeAssetLoader = `function cssUrl(url){var clean=String(url||'').split("'").join('').split(')') .join('').split('"').join('');return "url('"+clean+"')"}
    function setVersionedBackground(selector,url){var el=root.querySelector(selector);if(el&&url)el.style.setProperty('background-image',cssUrl(url),'important')}
    function injectAssetUrls(urls){
      if(!urls)return;
      setVersionedBackground('.ghost-run-background-panel-1',urls.background);
      setVersionedBackground('.ghost-run-background-panel-2',urls.background2);
      setVersionedBackground('.ghost-run-background-panel-3',urls.background3);
      setVersionedBackground('.ghost-run-background-panel-4',urls.background4);
      setVersionedBackground('.ghost-run-background-panel-5',urls.background5);
      setVersionedBackground('.ghost-run-background-panel-6',urls.background6);
      setVersionedBackground('.ghost-run-background-panel-copy',urls.background);
      var style=document.getElementById('ghostRunVersionedAssetStyle');
      if(!style){style=document.createElement('style');style.id='ghostRunVersionedAssetStyle';document.head.appendChild(style)}
      style.textContent=[
        "#ghostrun .ghost-run-ghost{background-image:"+cssUrl(urls.ghostidle)+"!important;background-size:contain!important;background-position:center!important;background-repeat:no-repeat!important;transition:left .08s linear,transform .24s ease,filter .24s ease,opacity .24s ease!important}",
        "#ghostrun .ghost-run-screen[data-ghost-state='moving'] .ghost-run-ghost,#ghostrun .ghost-run-screen[data-ghost-state='running'] .ghost-run-ghost{background-image:"+cssUrl(urls.ghostmove)+"!important;animation:ghostRunCharacterSwitch .42s ease-in-out infinite alternate!important;filter:drop-shadow(0 0 16px rgba(255,255,255,.18))!important}",
        "#ghostrun .ghost-run-screen[data-ghost-state='idle'] .ghost-run-ghost{animation:none!important;transform:translate3d(0,0,0) scale(1)!important}",
        "@keyframes ghostRunCharacterSwitch{0%{transform:translate3d(0,0,0) scale(1)}100%{transform:translate3d(0,-5px,0) scale(1.045)}}"
      ].join("\\n");
    }
    `;

  patched = replaceBlock(patched, 'function cssUrl(url){', '    function loadAssetUrls', safeAssetLoader);
  return patched;
}

export const GHOST_RUN_SECTION = patchGhostRunSection(RAW_GHOST_RUN_SECTION);
