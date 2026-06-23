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
        "#ghostrun .ghost-run-controls{position:relative!important;z-index:80!important;pointer-events:auto!important}",
        "#ghostrun .ghost-run-move-button,#ghostrun .ghost-run-main-button{position:relative!important;z-index:90!important;pointer-events:auto!important;touch-action:none!important;cursor:pointer!important}",
        "#ghostrun .ghost-run-ghost{background-image:"+cssUrl(urls.ghostidle)+"!important;background-size:contain!important;background-position:center!important;background-repeat:no-repeat!important;transition:left .08s linear,transform .28s cubic-bezier(.2,.8,.2,1),filter .28s ease,opacity .18s ease!important}",
        "#ghostrun .ghost-run-screen[data-ghost-state='idle'] .ghost-run-ghost{background-image:"+cssUrl(urls.ghostidle)+"!important;animation:none!important;transform:translate3d(0,0,0) scale(1)!important;filter:drop-shadow(0 0 10px rgba(255,255,255,.10))!important}",
        "#ghostrun .ghost-run-screen[data-ghost-state='movingForward'] .ghost-run-ghost,#ghostrun .ghost-run-screen[data-ghost-state='movingBack'] .ghost-run-ghost{background-image:"+cssUrl(urls.ghostmove)+"!important;animation:ghostRunMoveBob .38s ease-in-out infinite alternate!important;filter:drop-shadow(0 0 16px rgba(255,255,255,.18))!important}",
        "#ghostrun .ghost-run-screen[data-ghost-state='movingBack'] .ghost-run-ghost{transform:translate3d(0,-4px,0) scaleX(-1) scale(1.045)!important}",
        "#ghostrun .ghost-run-screen[data-ghost-state='movingForward'] .ghost-run-ghost{transform:translate3d(0,-4px,0) scaleX(1) scale(1.045)!important}",
        "@keyframes ghostRunMoveBob{0%{margin-bottom:0}100%{margin-bottom:5px}}"
      ].join("\\n");
    }
    `;

  const robustBindHold = `function bindHold(button,dir){
      if(!button)return;
      function begin(e){if(e&&e.cancelable)e.preventDefault();try{if(e&&button.setPointerCapture&&e.pointerId!=null)button.setPointerCapture(e.pointerId)}catch(_e){}startHold(dir,button)}
      button.addEventListener('pointerdown',begin);
      button.addEventListener('touchstart',begin,{passive:false});
      button.addEventListener('mousedown',begin);
      button.addEventListener('pointerup',stopHold);
      button.addEventListener('pointercancel',stopHold);
      button.addEventListener('pointerleave',stopHold);
      button.addEventListener('touchend',stopHold);
      button.addEventListener('touchcancel',stopHold);
      button.addEventListener('contextmenu',function(e){e.preventDefault()});
    }`;

  patched = replaceBlock(patched, 'function cssUrl(url){', '    function loadAssetUrls', safeAssetLoader);
  patched = patched.replace(
    "var root=document.currentScript&&document.currentScript.closest('#ghostrun');\n    if(!root||root.dataset.ghostReady==='1')return;\n    root.dataset.ghostReady='1';",
    "var script=document.currentScript;\n    var root=(script&&script.closest&&script.closest('#ghostrun'))||document.getElementById('ghostrun');\n    if(!root)return;\n    root.dataset.ghostReady=String(Date.now());"
  );
  patched = patched.replace(
    "function bindHold(button,dir){if(!button)return;button.addEventListener('pointerdown',function(e){e.preventDefault();button.setPointerCapture&&button.setPointerCapture(e.pointerId);startHold(dir,button)});button.addEventListener('pointerup',stopHold);button.addEventListener('pointercancel',stopHold);button.addEventListener('pointerleave',stopHold);button.addEventListener('contextmenu',function(e){e.preventDefault()})}",
    robustBindHold
  );
  patched = patched.replace(
    "bindHold(forwardButton,1);bindHold(backButton,-1);if(claimButton)claimButton.addEventListener('click',claim);if(resetButton)resetButton.addEventListener('click',resetRound);window.addEventListener('resize',render);loadAssetUrls();setState('idle','',1);render();",
    "bindHold(forwardButton,1);bindHold(backButton,-1);if(claimButton)claimButton.addEventListener('click',claim);if(resetButton)resetButton.addEventListener('click',resetRound);window.addEventListener('mouseup',stopHold);window.addEventListener('blur',stopHold);window.addEventListener('resize',render);loadAssetUrls();setState('idle','',1);render();"
  );
  return patched;
}

export const GHOST_RUN_SECTION = patchGhostRunSection(RAW_GHOST_RUN_SECTION);
