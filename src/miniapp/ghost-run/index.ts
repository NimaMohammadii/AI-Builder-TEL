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

  const css = `<style>
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
#ghostrun .ghost-run-hud{display:flex!important;justify-content:flex-start!important;align-items:flex-start!important;pointer-events:none!important}
#ghostrun .ghost-run-fear-wrap{display:grid!important;grid-template-columns:1fr auto!important;grid-template-rows:auto auto!important;column-gap:8px!important;row-gap:7px!important;align-items:center!important;width:176px!important;min-width:176px!important;max-width:calc(100vw - 32px)!important;padding:10px 12px!important;border-radius:20px!important;background:rgba(0,0,0,.24)!important;border:1px solid rgba(255,255,255,.07)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.10)!important;backdrop-filter:blur(8px)!important;-webkit-backdrop-filter:blur(8px)!important}
#ghostrun .ghost-run-fear-top{grid-column:1!important;grid-row:1!important;margin:0!important;display:flex!important;align-items:center!important;gap:8px!important;justify-content:space-between!important}
#ghostrun .ghost-run-fear-track{grid-column:1 / 3!important;grid-row:2!important}
#ghostrun .ghost-run-fear-wrap .ghost-run-multiplier{grid-column:2!important;grid-row:1!important;display:inline-flex!important;min-width:auto!important;height:auto!important;padding:0!important;margin:0!important;border:0!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;font-size:13px!important;font-weight:950!important;line-height:1!important;letter-spacing:.02em!important;color:#fff!important;text-shadow:0 7px 18px rgba(0,0,0,.44)!important}
#ghostrun .ghost-run-state{display:none!important;opacity:0!important;visibility:hidden!important}
#ghostrun .ghost-run-screen[data-round-active='1'] .ghost-run-start-button{border-color:rgba(255,255,255,.20)!important;color:#fff!important}
#ghostrun .ghost-run-reaper{display:none!important;visibility:hidden!important;opacity:0!important}
#ghostrun .ghost-run-screen[data-ghost-state='claimed'] .ghost-run-ghost,#ghostrun .ghost-run-screen[data-ghost-state='won'] .ghost-run-ghost{filter:drop-shadow(0 0 18px rgba(220,235,255,.30)) drop-shadow(0 14px 24px rgba(0,0,0,.40))!important;animation:none!important;opacity:1!important;transform:translate3d(0,0,0) scale(1)!important}
#ghostrun .ghost-run-screen[data-ghost-state='caught'] .ghost-run-ghost{animation:ghostRunGraveTransform 1.05s cubic-bezier(.18,.9,.18,1) both!important;opacity:1!important;filter:drop-shadow(0 0 22px rgba(255,255,255,.18)) drop-shadow(0 18px 26px rgba(0,0,0,.56))!important;background-position:center bottom!important;background-size:contain!important;background-repeat:no-repeat!important}
#ghostrun .ghost-run-screen[data-ghost-state='caught'] .ghost-run-ghost:before{content:''!important;position:absolute!important;inset:-22px!important;border-radius:50%!important;background:radial-gradient(circle,rgba(255,255,255,.30),rgba(255,255,255,.10) 28%,transparent 66%)!important;filter:blur(7px)!important;animation:ghostRunGraveFlash .72s ease-out both!important;pointer-events:none!important}
#ghostrun .ghost-run-screen[data-ghost-state='caught'] .ghost-run-ghost:after{content:''!important;position:absolute!important;left:50%!important;bottom:-10px!important;width:92px!important;height:18px!important;transform:translateX(-50%)!important;border-radius:50%!important;background:radial-gradient(ellipse,rgba(255,255,255,.22),transparent 70%)!important;filter:blur(4px)!important;animation:ghostRunGraveDust .9s ease-out both!important;pointer-events:none!important}
#ghostrun .ghost-run-result{display:flex!important;align-items:center!important;justify-content:center!important;gap:12px!important;background:rgba(255,255,255,.08)!important;background-image:linear-gradient(180deg,rgba(255,255,255,.12),rgba(255,255,255,.035))!important;border:0!important;outline:0!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.16),0 22px 60px rgba(0,0,0,.28)!important;backdrop-filter:blur(2px) saturate(1.15)!important;-webkit-backdrop-filter:blur(2px) saturate(1.15)!important;padding:18px 14px!important;border-radius:24px!important;pointer-events:none!important;text-align:center!important}
#ghostrun .ghost-run-result button{display:none!important}
#ghostrun .ghost-run-result strong{display:inline!important;font-size:28px!important;font-weight:1000!important;color:#fff!important;text-shadow:0 10px 24px rgba(0,0,0,.52)!important;margin:0!important;line-height:1!important}
#ghostrun .ghost-run-result span{display:inline!important;font-size:20px!important;font-weight:900!important;color:rgba(255,255,255,.86)!important;text-shadow:0 8px 20px rgba(0,0,0,.44)!important;margin:0!important;line-height:1!important}
@keyframes ghostRunGraveTransform{0%{opacity:1;transform:translate3d(0,0,0) scale(1) rotate(0);filter:drop-shadow(0 0 18px rgba(255,255,255,.22))}26%{opacity:.84;transform:translate3d(0,-14px,0) scale(1.08) rotate(-2deg)}48%{opacity:.18;transform:translate3d(0,0,0) scale(.62) rotate(3deg);filter:blur(4px)}49%{opacity:0;transform:translate3d(0,7px,0) scale(.45)}50%{opacity:0;transform:translate3d(0,6px,0) scale(.72)}72%{opacity:1;transform:translate3d(0,-16px,0) scale(1.08)}100%{opacity:1;transform:translate3d(0,-10px,0) scale(1)}}
@keyframes ghostRunGraveFlash{0%{opacity:0;transform:scale(.45)}40%{opacity:1;transform:scale(1.08)}100%{opacity:0;transform:scale(1.55)}}
@keyframes ghostRunGraveDust{0%{opacity:0;transform:translateX(-50%) scale(.2)}35%{opacity:.75;transform:translateX(-50%) scale(1)}100%{opacity:0;transform:translateX(-50%) scale(1.65)}}
</style>`;
  patched = patched.replace('<section id="ghostrun" class="view ghost-run-view" aria-label="Ghost Run">', '<section id="ghostrun" class="view ghost-run-view" aria-label="Ghost Run">' + css);

  patched = patched.replace('<strong><input data-ghost-bet-input type="number" min="0.01" step="0.01" inputmode="decimal" value="0.10" aria-label="Ghost Run bet amount"/> TON</strong>', '<strong><input data-ghost-bet-input type="number" min="0.01" step="0.01" inputmode="decimal" value="0.10" aria-label="Ghost Run bet amount"/></strong>');
  patched = patched.replace('<strong><em data-ghost-preview>0.10</em> TON</strong>', '<strong><em data-ghost-preview>0.10</em></strong>');

  const safeAssetLoader = `function cssUrl(url){var clean=String(url||'').split("'").join('').split(')') .join('').split('"').join('');return "url('"+clean+"')"}
    function setVersionedBackground(selector,url){var el=root.querySelector(selector);if(el&&url)el.style.setProperty('background-image',cssUrl(url),'important')}
    function cacheGhostAsset(url){if(!url)return;try{var img=new Image();img.decoding='async';img.loading='eager';img.src=url}catch(_e){}try{if('caches' in window){window.caches.open('ghost-run-assets-v1').then(function(cache){cache.match(url).then(function(hit){if(!hit)cache.add(url).catch(function(){})})}).catch(function(){})}}catch(_e){}}
    function cacheGhostAssets(urls){Object.keys(urls||{}).forEach(function(k){cacheGhostAsset(urls[k])})}
    function injectAssetUrls(urls){
      if(!urls)return;cacheGhostAssets(urls);
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
        "#ghostrun .ghost-run-reaper{display:none!important;visibility:hidden!important;opacity:0!important}",
        "#ghostrun .ghost-run-state{display:none!important;opacity:0!important;visibility:hidden!important}",
        "#ghostrun .ghost-run-hud{display:flex!important;justify-content:flex-start!important;align-items:flex-start!important;pointer-events:none!important}",
        "#ghostrun .ghost-run-fear-wrap{display:grid!important;grid-template-columns:1fr auto!important;grid-template-rows:auto auto!important;column-gap:8px!important;row-gap:7px!important;align-items:center!important;width:176px!important;min-width:176px!important;max-width:calc(100vw - 32px)!important;padding:10px 12px!important;border-radius:20px!important;background:rgba(0,0,0,.24)!important;border:1px solid rgba(255,255,255,.07)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.10)!important;backdrop-filter:blur(8px)!important;-webkit-backdrop-filter:blur(8px)!important}",
        "#ghostrun .ghost-run-fear-wrap .ghost-run-multiplier{grid-column:2!important;grid-row:1!important;position:static!important;display:inline-flex!important;min-width:auto!important;height:auto!important;padding:0!important;margin:0!important;border:0!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;font-size:13px!important;font-weight:950!important;line-height:1!important;letter-spacing:.02em!important;color:#fff!important;text-shadow:0 7px 18px rgba(0,0,0,.44)!important}",
        "#ghostrun .ghost-run-result{display:flex!important;align-items:center!important;justify-content:center!important;gap:12px!important;background:rgba(255,255,255,.08)!important;background-image:linear-gradient(180deg,rgba(255,255,255,.12),rgba(255,255,255,.035))!important;border:0!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.16),0 22px 60px rgba(0,0,0,.28)!important;backdrop-filter:blur(2px) saturate(1.15)!important;-webkit-backdrop-filter:blur(2px) saturate(1.15)!important;pointer-events:none!important}",
        "#ghostrun .ghost-run-result button{display:none!important}",
        "#ghostrun .ghost-run-ghost{background-image:"+cssUrl(urls.ghostidle)+"!important;background-size:contain!important;background-position:center!important;background-repeat:no-repeat!important;transition:left .08s linear,transform .28s cubic-bezier(.2,.8,.2,1),filter .28s ease,opacity .18s ease!important}",
        "#ghostrun .ghost-run-screen[data-ghost-state='idle'] .ghost-run-ghost{background-image:"+cssUrl(urls.ghostidle)+"!important;animation:none!important;transform:translate3d(0,0,0) scale(1)!important}",
        "#ghostrun .ghost-run-screen[data-ghost-state='movingForward'] .ghost-run-ghost,#ghostrun .ghost-run-screen[data-ghost-state='movingBack'] .ghost-run-ghost{background-image:"+cssUrl(urls.ghostmove)+"!important;animation:ghostRunMoveBob .38s ease-in-out infinite alternate!important}",
        "#ghostrun .ghost-run-screen[data-ghost-state='movingBack'] .ghost-run-ghost{transform:translate3d(0,-4px,0) scaleX(-1) scale(1.045)!important}",
        "#ghostrun .ghost-run-screen[data-ghost-state='movingForward'] .ghost-run-ghost{transform:translate3d(0,-4px,0) scaleX(1) scale(1.045)!important}",
        "#ghostrun .ghost-run-screen[data-ghost-state='caught'] .ghost-run-ghost{background-image:"+cssUrl(urls.ground||urls.ghostidle)+"!important;background-size:contain!important;background-position:center bottom!important;background-repeat:no-repeat!important;animation:ghostRunGraveTransform 1.05s cubic-bezier(.18,.9,.18,1) both!important;opacity:1!important}",
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

  const strictFearLogic = `function updateFear(dt){
      var deep=stageDanger();
      if(!roundActive||settled)return;
      if(!fearModeTimer||fearModeTimer<=0)pickFearMode();
      fearModeTimer-=dt;
      var m=multiplierValue;
      var band=m<1.2?.8:m<1.45?1.8:m<1.8?4.2:m<2.2?9:18;
      if(direction>0){
        retreatCharge=0;
        if(roundType==='safe'){
          fear+=(m<1.35?2.8+Math.random()*5.2:8+Math.random()*15)*band*dt;
          if(m>1.55&&Math.random()<.09*dt)fear+=35+Math.random()*45;
        }else if(roundType==='normal'){
          fear+=(8+Math.random()*20)*band*dt;
          if(m>1.35&&Math.random()<.16*dt)fear+=28+Math.random()*48;
        }else if(roundType==='scary'){
          fear+=(18+Math.random()*38)*band*dt;
          if(Math.random()<.22*dt)fear+=35+Math.random()*60;
        }else{
          if(m<1.25)fear+=(3+Math.random()*7)*dt;
          else fear+=(28+Math.random()*52)*band*dt;
          if(m>1.35&&Math.random()<.32*dt)fear+=45+Math.random()*70;
        }
        if(m>1.8)fear+=55*dt;
        if(m>2.2)fear+=140*dt;
        if(roundType!=='safe'&&m>1.55&&Math.random()<.08*deep*dt)fear=Math.max(fear,88+Math.random()*18);
      }else if(direction<0){
        retreatCharge+=dt;
        var relief=Math.max(0,retreatCharge-.35);
        fear-=2.4*dt+relief*(roundType==='trap'?1.1:2.2)*dt;
        if(fear>78&&Math.random()<.035*dt)fear+=12+Math.random()*25;
      }else{
        retreatCharge=0;
        if(m>1.6)fear+=8*dt;
      }
      fear=Math.max(0,Math.min(100,fear));
    }`;

  patched = replaceBlock(patched, 'function cssUrl(url){', '    function loadAssetUrls', safeAssetLoader);
  patched = patched.replace("if(fear>=65)return 'Azrael's shadow is closing in';", "if(fear>=65)return \"Fear is closing in\";");
  patched = patched.replace(
    "var root=document.currentScript&&document.currentScript.closest('#ghostrun');\n    if(!root||root.dataset.ghostReady==='1')return;\n    root.dataset.ghostReady='1';",
    "var script=document.currentScript;\n    var root=(script&&script.closest&&script.closest('#ghostrun'))||document.getElementById('ghostrun');\n    if(!root)return;\n    root.dataset.ghostReady=String(Date.now());"
  );
  patched = patched.replace(
    "var multiplierEl=root.querySelector('[data-ghost-multiplier]');",
    "var multiplierEl=root.querySelector('[data-ghost-multiplier]');var fearWrap=root.querySelector('.ghost-run-fear-wrap');if(fearWrap&&multiplierEl&&!fearWrap.contains(multiplierEl))fearWrap.appendChild(multiplierEl);"
  );
  patched = patched.replace(
    "var dangerRates=[1,1.22,1.48,1.82,2.22,2.75];",
    "var dangerRates=[1,1.22,1.48,1.82,2.22,2.75];var roundType='normal',fearMode='normal',fearModeTimer=0;function pickRoundType(){var r=Math.random();roundType=r<.28?'safe':r<.70?'normal':r<.92?'scary':'trap'}function pickFearMode(){var r=Math.random();fearMode=r<.32?'calm':r<.72?'normal':'panic';fearModeTimer=.35+Math.random()*1.15}function resetFearLuck(){fearModeTimer=0;fearMode='normal';roundType='normal'}function seedRoundFear(){pickRoundType();pickFearMode();if(roundType==='scary')fear=28+Math.random()*64;else if(roundType==='normal'&&Math.random()<.28)fear=18+Math.random()*42;else if(roundType==='trap')fear=Math.random()*6;else fear=Math.random()*10}function userLang(){return String((navigator.languages&&navigator.languages[0])||navigator.language||document.documentElement.lang||'en').toLowerCase()}function isFa(){return userLang().indexOf('fa')===0||userLang().indexOf('ir')>=0}function label(key){var fa=isFa();var t={cashout:fa?'برداشت':'Cash Out',caught:fa?'باختی':'You Lost',lost:fa?'باختی':'You Lost',escaped:fa?'فرار کردی':'Escaped Before the Fear',won:fa?'بردی':'Won',at:fa?'در ضریب':'at',near:fa?'خیلی ترسیدی':'Too much fear',shadow:fa?'ترس نزدیکه':'Fear is closing in',fear:fa?'ترس زیاد می‌شود':'Fear is rising'};return t[key]||key}"
  );
  patched = patched.replace(
    "function updateFear(dt){var deep=stageDanger();if(direction>0){retreatCharge=0;fear+=8.6*deep*dt+Math.min(8,distance/viewportWidth())*0.16*dt}else if(direction<0){retreatCharge+=dt;var relief=Math.max(0,retreatCharge-.55);if(fear<60)fear-=5.2*dt+relief*2.2*dt;else if(fear<85)fear-=Math.max(.35,relief*2.4)*dt;else fear+=(1.1*deep-Math.max(0,relief*3.4))*dt}else{retreatCharge=0;if(stageIndex()>=2)fear+=(0.22+stageIndex()*0.18)*dt}fear=Math.max(0,Math.min(100,fear));}",
    strictFearLogic
  );
  patched = patched.replace(
    "if(startButton)startButton.disabled=(roundActive&&!settled);",
    "if(startButton){startButton.disabled=false;startButton.textContent=(roundActive&&!settled)?label('cashout'):'Place Bet'}if(screen)screen.setAttribute('data-round-active',(roundActive&&!settled)?'1':'0');"
  );
  patched = patched.replace(
    "function startRound(){if(roundActive&&!settled)return;var amount=tonToNano(betInput&&betInput.value||0);",
    "function startRound(){if(roundActive&&!settled){claim();return}var amount=tonToNano(betInput&&betInput.value||0);"
  );
  patched = patched.replace(
    "resetRound();activeBetNano=amount;roundActive=true;settled=false;changeBalance(-amount);setState('idle','Bet placed — move forward or claim',1);render()",
    "resetRound();activeBetNano=amount;seedRoundFear();roundActive=true;settled=false;changeBalance(-amount);setState('idle','',1);render()"
  );
  patched = patched.replace(
    "function resetRound(){stopHold();position=16;backgroundOffset=0;distance=0;fear=0;multiplierValue=1;retreatCharge=0;direction=0;state='idle';roundActive=false;settled=false;activeBetNano=0;if(result)result.removeAttribute('data-visible');setState('idle','Place a bet to start',1);render()}",
    "function resetRound(){stopHold();position=16;backgroundOffset=0;distance=0;fear=0;multiplierValue=1;retreatCharge=0;direction=0;resetFearLuck();state='idle';roundActive=false;settled=false;activeBetNano=0;if(result)result.removeAttribute('data-visible');setState('idle','',1);render()}"
  );
  patched = patched.replace(
    "function warningText(){if(fear>=100)return 'The Reaper Caught You';if(fear>=85)return 'Retreat or Claim — The Reaper is near';if(fear>=65)return 'Azrael\\'s shadow is closing in';if(fear>=40)return 'Fear is rising';return ''}",
    "function warningText(){if(fear>=100)return '';if(fear>=85)return label('near');if(fear>=65)return label('shadow');if(fear>=40)return label('fear');return ''}"
  );
  patched = patched.replace(
    "setState('caught','The Reaper Caught You',1);if(resultTitle)resultTitle.textContent='The Reaper Caught You';if(resultDetail)resultDetail.textContent='Lost '+nanoToTon(activeBetNano).toFixed(2)+' TON';",
    "setState('caught','',1);if(resultTitle)resultTitle.textContent=label('lost');if(resultDetail)resultDetail.textContent=nanoToTon(activeBetNano).toFixed(2)+' · '+multiplierValue.toFixed(2)+'x';"
  );
  patched = patched.replace(
    "setState('claimed','Escaped the curse',direction);var payoutNano=Math.max(0,Math.floor(activeBetNano*multiplierValue));changeBalance(payoutNano);if(resultTitle)resultTitle.textContent='Escaped Before the Curse';if(resultDetail)resultDetail.textContent='Won '+nanoToTon(payoutNano).toFixed(2)+' TON at '+multiplierValue.toFixed(2)+'x';",
    "setState('claimed','',direction);var payoutNano=Math.max(0,Math.floor(activeBetNano*multiplierValue));changeBalance(payoutNano);if(resultTitle)resultTitle.textContent=label('won');if(resultDetail)resultDetail.textContent=nanoToTon(payoutNano).toFixed(2)+' · '+multiplierValue.toFixed(2)+'x';"
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
