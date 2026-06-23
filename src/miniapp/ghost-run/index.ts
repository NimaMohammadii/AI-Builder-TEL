import { GHOST_RUN_SECTION as RAW_GHOST_RUN_SECTION } from './section';
export { GHOST_RUN_STYLES } from './styles';

function replaceBlock(source: string, startToken: string, endToken: string, replacement: string): string {
  const start = source.indexOf(startToken);
  const end = start >= 0 ? source.indexOf(endToken, start) : -1;
  if (start < 0 || end < 0) return source;
  return source.slice(0, start) + replacement + source.slice(end);
}

function patchGhostRunSection(section: string): string {
  let patched = section;

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
        "#ghostrun .ghost-run-ghost{background-image:"+cssUrl(urls.ghostidle)+"!important;background-size:contain!important;background-position:center!important;background-repeat:no-repeat!important;transition:left .08s linear,transform .28s cubic-bezier(.2,.8,.2,1),filter .28s ease,opacity .18s ease,background-position .28s ease!important}",
        "#ghostrun .ghost-run-screen[data-ghost-state='idle'] .ghost-run-ghost{background-image:"+cssUrl(urls.ghostidle)+"!important;animation:ghostRunIdleBreath 1.8s ease-in-out infinite!important;transform:translate3d(0,0,0) scale(1)!important;filter:drop-shadow(0 0 10px rgba(255,255,255,.10))!important}",
        "#ghostrun .ghost-run-screen[data-ghost-state='moving'] .ghost-run-ghost{background-image:"+cssUrl(urls.ghostmove)+"!important;animation:ghostRunMoveBob .38s ease-in-out infinite alternate!important;filter:drop-shadow(0 0 16px rgba(255,255,255,.18))!important;background-position:center!important}",
        "#ghostrun .ghost-run-screen[data-ghost-direction='back'] .ghost-run-ghost{transform:translate3d(0,-4px,0) scaleX(-1) scale(1.045)!important}",
        "#ghostrun .ghost-run-screen[data-ghost-direction='forward'] .ghost-run-ghost{transform:translate3d(0,-4px,0) scaleX(1) scale(1.045)!important}",
        "@keyframes ghostRunIdleBreath{0%,100%{background-position:center center;filter:drop-shadow(0 0 9px rgba(255,255,255,.10))}50%{background-position:center calc(50% - 3px);filter:drop-shadow(0 0 15px rgba(255,255,255,.16))}}",
        "@keyframes ghostRunMoveBob{0%{margin-bottom:0}100%{margin-bottom:5px}}"
      ].join("\\n");
    }
    `;

  patched = replaceBlock(patched, 'function cssUrl(url){', '    function loadAssetUrls', safeAssetLoader);
  patched = patched.replace(
    "function setState(state,msg){if(screen)screen.setAttribute('data-ghost-state',state);if(messageEl)messageEl.textContent=msg||''}",
    "function setState(state,msg,dir){if(screen){screen.setAttribute('data-ghost-state',state);screen.setAttribute('data-ghost-direction',dir<0?'back':'forward')}if(messageEl)messageEl.textContent=msg||''}"
  );
  patched = patched.replace(
    "setState(position>16||distance>0?'moving':'idle','');",
    "setState(direction?'moving':'idle','',direction);"
  );
  return patched;
}

export const GHOST_RUN_SECTION = patchGhostRunSection(RAW_GHOST_RUN_SECTION);
