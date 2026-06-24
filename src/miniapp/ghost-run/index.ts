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

  const crashCss = `<style>
#ghostrun .ghost-run-hud{position:absolute!important;left:0!important;right:0!important;top:0!important;height:0!important;z-index:70!important;pointer-events:none!important;display:block!important}
#ghostrun .ghost-run-fear-wrap{display:none!important;opacity:0!important;visibility:hidden!important}
#ghostrun .ghost-run-state{display:none!important;opacity:0!important;visibility:hidden!important}
#ghostrun .ghost-run-reaper{display:none!important;opacity:0!important;visibility:hidden!important}
#ghostrun .ghost-run-multiplier{position:absolute!important;top:18px!important;left:50%!important;right:auto!important;transform:translateX(-50%)!important;display:flex!important;align-items:center!important;justify-content:center!important;min-width:110px!important;height:auto!important;padding:0!important;margin:0!important;border:0!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;color:#fff!important;font-size:34px!important;font-weight:950!important;line-height:1!important;letter-spacing:.02em!important;text-shadow:0 7px 18px rgba(0,0,0,.44)!important;z-index:90!important}
#ghostrun .ghost-run-controls{position:relative!important;z-index:80!important;display:grid!important;grid-template-columns:1fr 1fr!important;gap:10px!important;padding:12px 16px calc(20px + env(safe-area-inset-bottom))!important;align-content:start!important;background:transparent!important;pointer-events:auto!important}
#ghostrun .ghost-run-control-card{min-height:56px!important;padding:8px 4px!important;background:transparent!important;background-color:transparent!important;background-image:none!important;border:0!important;outline:0!important;box-shadow:none!important;border-radius:0!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;color:#fff!important}
#ghostrun .ghost-run-control-card span{display:block!important;margin:0 0 5px!important;color:rgba(255,255,255,.45)!important;font-size:10px!important;font-weight:800!important;letter-spacing:.04em!important;text-transform:uppercase!important;line-height:1!important}
#ghostrun .ghost-run-control-card strong{display:flex!important;align-items:center!important;justify-content:flex-start!important;margin:0!important;min-height:34px!important;color:#fff!important;font-size:22px!important;font-weight:950!important;letter-spacing:-.04em!important;line-height:1!important}
#ghostrun .ghost-run-bet-card strong{border:1px solid rgba(255,255,255,.10)!important;border-radius:16px!important;padding:0 11px!important;background:transparent!important;box-shadow:none!important;overflow:hidden!important}
#ghostrun .ghost-run-win-card strong{padding:0 2px!important;background:transparent!important;box-shadow:none!important;border:0!important}
#ghostrun [data-ghost-bet-input]{width:100%!important;height:34px!important;min-width:0!important;margin:0!important;padding:0!important;border:0!important;outline:0!important;background:transparent!important;color:#fff!important;font:inherit!important;font-size:22px!important;font-weight:950!important;letter-spacing:-.04em!important;text-align:left!important;box-shadow:none!important;-webkit-appearance:none!important;appearance:textfield!important}
#ghostrun [data-ghost-bet-input]::-webkit-outer-spin-button,#ghostrun [data-ghost-bet-input]::-webkit-inner-spin-button{-webkit-appearance:none!important;margin:0!important}
#ghostrun .ghost-run-back-button,#ghostrun .ghost-run-forward-button,#ghostrun .ghost-run-claim-button,#ghostrun .ghost-run-note{display:none!important}
#ghostrun .ghost-run-main-button{position:relative!important;z-index:90!important;background:transparent!important;background-color:transparent!important;background-image:none!important;border:1px solid rgba(255,255,255,.12)!important;box-shadow:none!important;color:rgba(255,255,255,.94)!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;pointer-events:auto!important;touch-action:manipulation!important;cursor:pointer!important;grid-column:1 / 3!important;height:60px!important;border-radius:999px!important;font-weight:1000!important;letter-spacing:-.02em!important}
#ghostrun .ghost-run-screen[data-round-active='1'] .ghost-run-start-button{border-color:rgba(255,255,255,.24)!important;color:#fff!important}
#ghostrun .ghost-run-screen[data-ghost-state='movingForward'] .ghost-run-ghost{animation:ghostRunMoveBob .38s ease-in-out infinite alternate!important;filter:drop-shadow(0 0 16px rgba(255,255,255,.18))!important}
#ghostrun .ghost-run-screen[data-ghost-state='caught'] .ghost-run-ghost{animation:ghostRunGraveTransform 1.05s cubic-bezier(.18,.9,.18,1) both!important;opacity:1!important;filter:drop-shadow(0 0 22px rgba(255,255,255,.18)) drop-shadow(0 18px 26px rgba(0,0,0,.56))!important;background-position:center bottom!important;background-size:contain!important;background-repeat:no-repeat!important}
#ghostrun .ghost-run-screen[data-ghost-state='caught'] .ghost-run-ghost:before{content:''!important;position:absolute!important;inset:-22px!important;border-radius:50%!important;background:radial-gradient(circle,rgba(255,255,255,.30),rgba(255,255,255,.10) 28%,transparent 66%)!important;filter:blur(7px)!important;animation:ghostRunGraveFlash .72s ease-out both!important;pointer-events:none!important}
#ghostrun .ghost-run-screen[data-ghost-state='caught'] .ghost-run-ghost:after{content:''!important;position:absolute!important;left:50%!important;bottom:-10px!important;width:92px!important;height:18px!important;transform:translateX(-50%)!important;border-radius:50%!important;background:radial-gradient(ellipse,rgba(255,255,255,.22),transparent 70%)!important;filter:blur(4px)!important;animation:ghostRunGraveDust .9s ease-out both!important;pointer-events:none!important}
#ghostrun .ghost-run-result{display:flex!important;align-items:center!important;justify-content:center!important;gap:12px!important;background:rgba(255,255,255,.08)!important;background-image:linear-gradient(180deg,rgba(255,255,255,.12),rgba(255,255,255,.035))!important;border:0!important;outline:0!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.16),0 22px 60px rgba(0,0,0,.28)!important;backdrop-filter:blur(2px) saturate(1.15)!important;-webkit-backdrop-filter:blur(2px) saturate(1.15)!important;padding:18px 14px!important;border-radius:24px!important;pointer-events:none!important;text-align:center!important}
#ghostrun .ghost-run-result button{display:none!important}
#ghostrun .ghost-run-result strong{display:inline!important;font-size:28px!important;font-weight:1000!important;color:#fff!important;text-shadow:0 10px 24px rgba(0,0,0,.52)!important;margin:0!important;line-height:1!important}
#ghostrun .ghost-run-result span{display:inline!important;font-size:20px!important;font-weight:900!important;color:rgba(255,255,255,.86)!important;text-shadow:0 8px 20px rgba(0,0,0,.44)!important;margin:0!important;line-height:1!important}
@keyframes ghostRunMoveBob{0%{margin-bottom:0}100%{margin-bottom:5px}}
@keyframes ghostRunGraveTransform{0%{opacity:1;transform:translate3d(0,0,0) scale(1) rotate(0);filter:drop-shadow(0 0 18px rgba(255,255,255,.22))}26%{opacity:.84;transform:translate3d(0,-14px,0) scale(1.08) rotate(-2deg)}48%{opacity:.18;transform:translate3d(0,0,0) scale(.62) rotate(3deg);filter:blur(4px)}49%{opacity:0;transform:translate3d(0,7px,0) scale(.45)}50%{opacity:0;transform:translate3d(0,6px,0) scale(.72)}72%{opacity:1;transform:translate3d(0,-16px,0) scale(1.08)}100%{opacity:1;transform:translate3d(0,-10px,0) scale(1)}}
@keyframes ghostRunGraveFlash{0%{opacity:0;transform:scale(.45)}40%{opacity:1;transform:scale(1.08)}100%{opacity:0;transform:scale(1.55)}}
@keyframes ghostRunGraveDust{0%{opacity:0;transform:translateX(-50%) scale(.2)}35%{opacity:.75;transform:translateX(-50%) scale(1)}100%{opacity:0;transform:translateX(-50%) scale(1.65)}}
</style>`;

  patched = patched.replace('<section id="ghostrun" class="view ghost-run-view" aria-label="Ghost Run">', '<section id="ghostrun" class="view ghost-run-view" aria-label="Ghost Run">' + crashCss);
  patched = patched.replace('<strong><input data-ghost-bet-input type="number" min="0.01" step="0.01" inputmode="decimal" value="0.10" aria-label="Ghost Run bet amount"/> TON</strong>', '<strong><input data-ghost-bet-input type="number" min="0.01" step="0.01" inputmode="decimal" value="0.10" aria-label="Ghost Run bet amount"/></strong>');
  patched = patched.replace('<strong><em data-ghost-preview>0.10</em> TON</strong>', '<strong><em data-ghost-preview>0.10</em></strong>');

  const crashScript = `<script>
(function(){
  var script=document.currentScript;
  var root=(script&&script.closest&&script.closest('#ghostrun'))||document.getElementById('ghostrun');
  if(!root)return;
  root.dataset.ghostReady=String(Date.now());
  var screen=root.querySelector('[data-ghost-screen]');
  var ghost=root.querySelector('[data-ghost]');
  var multiplierEl=root.querySelector('[data-ghost-multiplier]');
  var betInput=root.querySelector('[data-ghost-bet-input]');
  var preview=root.querySelector('[data-ghost-preview]');
  var startButton=root.querySelector('[data-ghost-start]');
  var result=root.querySelector('[data-ghost-result]');
  var resultTitle=root.querySelector('[data-ghost-result-title]');
  var resultDetail=root.querySelector('[data-ghost-result-detail]');
  var panels=[].slice.call(root.querySelectorAll('[data-ghost-bg]'));
  var walletBalanceNano=Number(root.dataset.walletBalanceNano||0);
  var roundActive=false, armedBetNano=0, activeBetNano=0, cashed=false, crashed=false;
  var multiplier=1, crashPoint=1.35, roundStartedAt=0, nextTimer=0, raf=0;
  var position=18, backgroundOffset=0, graveUrl='';
  function tonToNano(v){var n=parseFloat(String(v||'').replace(',','.'));return Number.isFinite(n)&&n>0?Math.floor(n*1e9):0}
  function nanoToTon(v){return (Math.floor(Number(v||0))/1e9)}
  function changeBalance(delta){walletBalanceNano=Math.max(0,walletBalanceNano+delta);root.dataset.walletBalanceNano=String(walletBalanceNano)}
  function cssUrl(url){var clean=String(url||'').split("'").join('').split(')').join('').split('"').join('');return "url('"+clean+"')"}
  function cacheAsset(url){if(!url)return;try{var img=new Image();img.decoding='async';img.loading='eager';img.src=url}catch(e){}try{if('caches'in window)caches.open('ghost-run-assets-v1').then(function(c){c.match(url).then(function(hit){if(!hit)c.add(url).catch(function(){})})})}catch(e){}}
  function loadAssets(){fetch('/app/api/ghost-run-assets',{cache:'force-cache'}).then(function(r){return r.ok?r.json():null}).then(function(j){var u=j&&j.urls;if(!u)return;Object.keys(u).forEach(function(k){cacheAsset(u[k])});graveUrl=u.ground||u.ghostidle||'';setBg('.ghost-run-background-panel-1',u.background);setBg('.ghost-run-background-panel-2',u.background2);setBg('.ghost-run-background-panel-3',u.background3);setBg('.ghost-run-background-panel-4',u.background4);setBg('.ghost-run-background-panel-5',u.background5);setBg('.ghost-run-background-panel-6',u.background6);setBg('.ghost-run-background-panel-copy',u.background);var st=document.getElementById('ghostRunCrashAssets');if(!st){st=document.createElement('style');st.id='ghostRunCrashAssets';document.head.appendChild(st)}st.textContent=["#ghostrun .ghost-run-ghost{background-image:"+cssUrl(u.ghostidle)+"!important;background-size:contain!important;background-position:center!important;background-repeat:no-repeat!important}","#ghostrun .ghost-run-screen[data-ghost-state='movingForward'] .ghost-run-ghost{background-image:"+cssUrl(u.ghostmove||u.ghostidle)+"!important}","#ghostrun .ghost-run-screen[data-ghost-state='caught'] .ghost-run-ghost{background-image:"+cssUrl(graveUrl)+"!important}"].join('\\n')}).catch(function(){})}
  function setBg(sel,url){var el=root.querySelector(sel);if(el&&url)el.style.setProperty('background-image',cssUrl(url),'important')}
  function viewportWidth(){return Math.max(1,(screen&&screen.clientWidth)||320)}
  function pickCrashPoint(){var r=Math.random();if(r<.90)return 1.04+Math.pow(Math.random(),.62)*.76;return 1.82+Math.pow(Math.random(),2.2)*4.4}
  function updatePreview(){var amount=tonToNano(betInput&&betInput.value||0);if(preview)preview.textContent=nanoToTon(Math.max(0,Math.floor(amount*Math.max(1,multiplier)))).toFixed(2)}
  function setScreenState(state){if(screen)screen.setAttribute('data-ghost-state',state)}
  function showResult(title,detail){if(result){result.setAttribute('data-visible','1')}if(resultTitle)resultTitle.textContent=title;if(resultDetail)resultDetail.textContent=detail}
  function hideResult(){if(result)result.removeAttribute('data-visible')}
  function render(){
    if(multiplierEl)multiplierEl.textContent=multiplier.toFixed(2)+'x';
    if(ghost)ghost.style.left=position+'px';
    panels.forEach(function(p){p.style.transform='translate3d('+(-backgroundOffset)+'px,0,0)'});
    if(screen)screen.setAttribute('data-round-active',roundActive?'1':'0');
    if(startButton){startButton.disabled=false;startButton.textContent=roundActive?(activeBetNano&&!cashed?'Cash Out':'Running'):(armedBetNano?'Bet Placed':'Place Bet')}
    updatePreview();
  }
  function armBet(){var amount=tonToNano(betInput&&betInput.value||0);if(amount<=0||amount>walletBalanceNano)return;armedBetNano=amount;hideResult();render()}
  function startRound(){
    roundActive=true;crashed=false;cashed=false;activeBetNano=armedBetNano;armedBetNano=0;
    if(activeBetNano>0)changeBalance(-activeBetNano);
    multiplier=1;crashPoint=pickCrashPoint();position=18;backgroundOffset=0;roundStartedAt=performance.now();hideResult();setScreenState('movingForward');render();
  }
  function endRound(){
    roundActive=false;crashed=true;setScreenState('caught');
    if(activeBetNano>0&&!cashed){showResult('You Lost',nanoToTon(activeBetNano).toFixed(2)+' · '+multiplier.toFixed(2)+'x')}
    activeBetNano=0;nextTimer=window.setTimeout(startRound,6000);render();
  }
  function cashOut(){
    if(!roundActive||!activeBetNano||cashed)return;
    cashed=true;var payout=Math.max(0,Math.floor(activeBetNano*multiplier));changeBalance(payout);showResult('Won',nanoToTon(payout).toFixed(2)+' · '+multiplier.toFixed(2)+'x');activeBetNano=0;render();
  }
  function tick(now){
    if(roundActive){var t=(now-roundStartedAt)/1000;multiplier=1+Math.pow(t,.92)*.22+t*.08;position=Math.min(viewportWidth()-84,18+t*58);backgroundOffset=t*34;if(multiplier>=crashPoint)endRound();else render()}
    raf=requestAnimationFrame(tick);
  }
  if(startButton)startButton.addEventListener('click',function(){if(roundActive)cashOut();else armBet()});
  if(betInput)betInput.addEventListener('input',updatePreview);
  loadAssets();setScreenState('idle');render();nextTimer=window.setTimeout(startRound,6000);raf=requestAnimationFrame(tick);
})();
`;

  patched = replaceBlock(patched, '<script>', '</script>', crashScript);
  return patched;
}

export const GHOST_RUN_SECTION = patchGhostRunSection(RAW_GHOST_RUN_SECTION);
