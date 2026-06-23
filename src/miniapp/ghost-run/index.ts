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

  const controlPolishCss = `<style>
#ghostrun .ghost-run-controls{position:relative!important;z-index:80!important;display:grid!important;grid-template-columns:1fr 1fr!important;gap:10px!important;padding:12px 16px calc(20px + env(safe-area-inset-bottom))!important;align-content:start!important;background:transparent!important;pointer-events:auto!important}
#ghostrun .ghost-run-control-card{min-height:56px!important;padding:8px 4px!important;background:transparent!important;background-color:transparent!important;background-image:none!important;border:0!important;outline:0!important;box-shadow:none!important;border-radius:0!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;color:#fff!important}
#ghostrun .ghost-run-control-card span{display:block!important;margin:0 0 5px!important;color:rgba(255,255,255,.45)!important;font-size:10px!important;font-weight:800!important;letter-spacing:.04em!important;text-transform:uppercase!important;line-height:1!important}
#ghostrun .ghost-run-control-card strong{display:flex!important;align-items:center!important;justify-content:flex-start!important;margin:0!important;min-height:34px!important;color:#fff!important;font-size:22px!important;font-weight:950!important;letter-spacing:-.04em!important;line-height:1!important}
#ghostrun .ghost-run-bet-card strong{border:1px solid rgba(255,255,255,.10)!important;border-radius:16px!important;padding:0 11px!important;background:transparent!important;box-shadow:none!important;overflow:hidden!important}
#ghostrun .ghost-run-win-card strong{padding:0 2px!important;background:transparent!important;box-shadow:none!important;border:0!important}
#ghostrun [data-ghost-bet-input]{width:100%!important;height:34px!important;min-width:0!important;margin:0!important;padding:0!important;border:0!important;outline:0!important;background:transparent!important;color:#fff!important;font:inherit!important;font-size:22px!important;font-weight:950!important;letter-spacing:-.04em!important;text-align:left!important;box-shadow:none!important;-webkit-appearance:none!important;appearance:textfield!important}
#ghostrun [data-ghost-bet-input]::-webkit-outer-spin-button,#ghostrun [data-ghost-bet-input]::-webkit-inner-spin-button{-webkit-appearance:none!important;margin:0!important}
#ghostrun .ghost-run-move-button,#ghostrun .ghost-run-main-button{position:relative!important;z-index:90!important;background:transparent!important;background-color:transparent!important;background-image:none!important;border:1px solid rgba(255,255,255,.12)!important;box-shadow:none!important;color:rgba(255,255,255,.94)!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;pointer-events:auto!important;touch-action:none!important;cursor:pointer!important}
#ghostrun .ghost-run-move-button{height:58px!important;border-radius:999px!important}
#ghostrun .ghost-run-claim-button{display:none!important}
#ghostrun .ghost-run-start-button{grid-column:1 / 3!important;height:60px!important;border-radius:999px!important;font-weight:1000!important;letter-spacing:-.02em!important}
#ghostrun .ghost-run-note{display:none!important}
#ghostrun .ghost-run-screen[data-round-active='1'] .ghost-run-start-button{border-color:rgba(255,255,255,.20)!important;color:#fff!important}
#ghostrun .ghost-run-screen[data-ghost-state='claimed'] .ghost-run-ghost,#ghostrun .ghost-run-screen[data-ghost-state='caught'] .ghost-run-ghost,#ghostrun .ghost-run-screen[data-ghost-state='won'] .ghost-run-ghost,#ghostrun .ghost-run-screen[data-ghost-state='lost'] .ghost-run-ghost{filter:drop-shadow(0 0 18px rgba(220,235,255,.30)) drop-shadow(0 14px 24px rgba(0,0,0,.40))!important;animation:none!important;opacity:1!important;transform:translate3d(0,0,0) scale(1)!important}
#ghostrun .ghost-run-result[data-visible='1']{pointer-events:auto!important}
#ghostrun .ghost-run-result[data-visible='1'] button{pointer-events:auto!important;cursor:pointer!important}
</style>`;
  patched = patched.replace('<section id="ghostrun" class="view ghost-run-view" aria-label="Ghost Run">', '<section id="ghostrun" class="view ghost-run-view" aria-label="Ghost Run">' + controlPolishCss);

  patched = patched.replace('<strong><input data-ghost-bet-input type="number" min="0.01" step="0.01" inputmode="decimal" value="0.10" aria-label="Ghost Run bet amount"/> TON</strong>', '<strong><input data-ghost-bet-input type="number" min="0.01" step="0.01" inputmode="decimal" value="0.10" aria-label="Ghost Run bet amount"/></strong>');
  patched = patched.replace('<strong><em data-ghost-preview>0.10</em> TON</strong>', '<strong><em data-ghost-preview>0.10</em></strong>');

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
        "#ghostrun .ghost-run-screen[data-ghost-state='claimed'] .ghost-run-ghost,#ghostrun .ghost-run-screen[data-ghost-state='caught'] .ghost-run-ghost{animation:none!important;opacity:1!important;filter:drop-shadow(0 0 18px rgba(220,235,255,.30)) drop-shadow(0 14px 24px rgba(0,0,0,.40))!important}",
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
  patched = patched.replace("if(fear>=65)return 'Azrael's shadow is closing in';", "if(fear>=65)return \"Azrael's shadow is closing in\";");
  patched = patched.replace(
    "var root=document.currentScript&&document.currentScript.closest('#ghostrun');\n    if(!root||root.dataset.ghostReady==='1')return;\n    root.dataset.ghostReady='1';",
    "var script=document.currentScript;\n    var root=(script&&script.closest&&script.closest('#ghostrun'))||document.getElementById('ghostrun');\n    if(!root)return;\n    root.dataset.ghostReady=String(Date.now());"
  );
  patched = patched.replace(
    "if(startButton)startButton.disabled=(roundActive&&!settled);",
    "if(startButton){startButton.disabled=false;startButton.textContent=(roundActive&&!settled)?'Cash Out':'Place Bet'}if(screen)screen.setAttribute('data-round-active',(roundActive&&!settled)?'1':'0');"
  );
  patched = patched.replace(
    "function startRound(){if(roundActive&&!settled)return;var amount=tonToNano(betInput&&betInput.value||0);",
    "function startRound(){if(roundActive&&!settled){claim();return}var amount=tonToNano(betInput&&betInput.value||0);"
  );
  patched = patched.replace(
    "function bindHold(button,dir){if(!button)return;button.addEventListener('pointerdown',function(e){e.preventDefault();button.setPointerCapture&&button.setPointerCapture(e.pointerId);startHold(dir,button)});button.addEventListener('pointerup',stopHold);button.addEventListener('pointercancel',stopHold);button.addEventListener('pointerleave',stopHold);button.addEventListener('contextmenu',function(e){e.preventDefault()})}",
    robustBindHold
  );
  patched = patched.replace(
    "bindHold(forwardButton,1);bindHold(backButton,-1);if(startButton)startButton.addEventListener('click',startRound);if(claimButton)claimButton.addEventListener('click',claim);if(resetButton)resetButton.addEventListener('click',resetRound);if(betInput)betInput.addEventListener('input',render);window.addEventListener('resize',render);loadAssetUrls();setState('idle','',1);render();",
    "bindHold(forwardButton,1);bindHold(backButton,-1);if(startButton)startButton.addEventListener('click',startRound);if(claimButton)claimButton.addEventListener('click',claim);if(resetButton)resetButton.addEventListener('click',resetRound);if(betInput)betInput.addEventListener('input',render);window.addEventListener('mouseup',stopHold);window.addEventListener('blur',stopHold);window.addEventListener('resize',render);loadAssetUrls();setState('idle','',1);render();"
  );
  return patched;
}

export const GHOST_RUN_SECTION = patchGhostRunSection(RAW_GHOST_RUN_SECTION);
