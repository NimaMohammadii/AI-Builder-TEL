import type { Env } from './types';
import { getSpecialWheelState } from './special-wheel-engine';

const STATE_KEY = 'admin:special-wheel-mode';

export async function isSpecialWheelEnabled(env: Env): Promise<boolean> {
  return (await env.BOT_CACHE.get(STATE_KEY).catch(() => null)) === 'on';
}

export async function setSpecialWheelEnabled(env: Env, enabled: boolean): Promise<void> {
  await env.BOT_CACHE.put(STATE_KEY, enabled ? 'on' : 'off');
}

function isBotAdmin(env: Env, userId: unknown): boolean {
  const admins = String(env.BOT_ADMIN ?? '').split(/[\s,;]+/).map((item) => item.trim()).filter(Boolean);
  return admins.includes(String(userId ?? ''));
}

export async function specialWheelStatusResponse(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId') || '';
  const enabled = await isSpecialWheelEnabled(env);
  const active = enabled && !isBotAdmin(env, userId);
  const state = active && userId ? await getSpecialWheelState(env, userId).catch(() => null) : null;
  return Response.json(
    { ok: true, active, state },
    { headers: { 'cache-control': 'no-store, no-cache, must-revalidate' } },
  );
}

export const SPECIAL_WHEEL_OVERLAY = `
<div id="specialWheelOverlay" aria-hidden="true">
  <style>
    @keyframes specialWheelEnter{from{opacity:0;transform:translateY(12px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes specialWheelLoader{to{transform:rotate(360deg)}}
    @keyframes specialWheelPointerTick{0%,100%{transform:translateX(-50%) rotate(0)}45%{transform:translateX(-50%) rotate(-4deg)}70%{transform:translateX(-50%) rotate(2deg)}}
    @keyframes specialWheelResultIn{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
    @keyframes specialWheelShine{0%{transform:translateX(-140%) skewX(-18deg)}100%{transform:translateX(220%) skewX(-18deg)}}
    #specialWheelOverlay{position:fixed;left:0;right:0;bottom:0;top:calc(110px + env(safe-area-inset-top));z-index:2147483646;display:none;align-items:center;justify-content:center;background:#000;color:#fff;padding:22px 24px calc(24px + env(safe-area-inset-bottom));box-sizing:border-box;overflow:hidden;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}
    #specialWheelOverlay.active{display:flex}
    #specialWheelOverlay.active .special-wheel-content{animation:specialWheelEnter .42s cubic-bezier(.22,.8,.22,1) both}
    body.special-wheel-active main.app>header.top #rankPill{display:none!important}
    body.special-wheel-active nav.tabs{visibility:hidden!important;pointer-events:none!important}
    #specialWheelOverlay .special-wheel-content{width:100%;max-width:520px;display:grid;justify-items:center;gap:24px;transform:translateY(-1.5vh)}
    #specialWheelOverlay .special-wheel-stage{position:relative;width:min(78vw,312px);aspect-ratio:1;transition:transform .32s cubic-bezier(.22,.8,.22,1),filter .32s ease}
    #specialWheelOverlay .special-wheel-stage.is-spinning{transform:scale(1.015);filter:drop-shadow(0 18px 34px rgba(94,18,42,.18))}
    #specialWheelOverlay .special-wheel-stage.is-settled{transform:scale(1.025)}
    #specialWheelOverlay .special-wheel-rotor{position:absolute;inset:0;border-radius:50%;overflow:hidden;background:conic-gradient(from -30deg,#f4efe6 0 60deg,#171717 60deg 120deg,#d7c7ae 120deg 180deg,#0b0b0b 180deg 240deg,#ece5da 240deg 300deg,#202020 300deg 360deg);border:1px solid rgba(255,255,255,.22);box-shadow:0 28px 72px rgba(0,0,0,.62),inset 0 0 0 8px rgba(0,0,0,.2);will-change:transform;transform:rotate(0deg);backface-visibility:hidden}
    #specialWheelOverlay .special-wheel-rotor:after{content:"";position:absolute;inset:9px;border-radius:50%;border:1px solid rgba(255,255,255,.16);pointer-events:none}
    #specialWheelOverlay .special-wheel-prize{position:absolute;z-index:2;left:50%;top:50%;width:76px;margin-left:-38px;margin-top:-13px;text-align:center;color:#f7f2e9;font-family:inherit;font-size:12px;font-weight:600;line-height:1.08;letter-spacing:0;text-transform:none;text-shadow:0 1px 5px rgba(0,0,0,.8);transform:rotate(var(--wheel-angle)) translateY(-112px) rotate(calc(-1 * var(--wheel-angle)));transition:opacity .28s ease}
    #specialWheelOverlay .special-wheel-stage.is-spinning .special-wheel-prize{opacity:.9}
    #specialWheelOverlay .special-wheel-prize:nth-of-type(1),#specialWheelOverlay .special-wheel-prize:nth-of-type(3),#specialWheelOverlay .special-wheel-prize:nth-of-type(5){color:#111;text-shadow:none}
    #specialWheelOverlay .special-wheel-prize .gram-value{display:block;font-size:17px;font-weight:650;letter-spacing:0;text-transform:none}
    #specialWheelOverlay .special-wheel-prize .gram-name{display:block;margin-top:2px;font-size:10px;font-weight:500;letter-spacing:0;text-transform:none}
    #specialWheelOverlay .special-wheel-prize.special-wheel-word{font-size:10px;font-weight:600;line-height:1.15;letter-spacing:0;text-transform:none}
    #specialWheelOverlay .special-wheel-hub{position:absolute;z-index:3;left:50%;top:50%;width:38px;height:38px;margin:-19px;border-radius:50%;background:#050505;border:1px solid rgba(255,255,255,.3);box-shadow:0 6px 20px rgba(0,0,0,.58),inset 0 1px 0 rgba(255,255,255,.14);transition:transform .3s ease,box-shadow .3s ease}
    #specialWheelOverlay .special-wheel-stage.is-spinning .special-wheel-hub{transform:scale(.94);box-shadow:0 5px 14px rgba(0,0,0,.48),inset 0 1px 0 rgba(255,255,255,.12)}
    #specialWheelOverlay .special-wheel-pointer{position:absolute;z-index:6;left:50%;top:-3px;width:0;height:0;transform:translateX(-50%);transform-origin:50% 0;border-left:11px solid transparent;border-right:11px solid transparent;border-top:24px solid #f5efe5;filter:drop-shadow(0 5px 8px rgba(0,0,0,.7))}
    #specialWheelOverlay .special-wheel-stage.is-spinning .special-wheel-pointer{animation:specialWheelPointerTick .16s ease-in-out infinite}
    #specialWheelOverlay .special-wheel-result{min-height:20px;margin:0;color:rgba(255,255,255,.76);font-family:inherit;font-size:13px;font-weight:500;line-height:1.45;letter-spacing:0;text-align:center;opacity:0;transform:translateY(7px)}
    #specialWheelOverlay .special-wheel-result.is-visible{animation:specialWheelResultIn .38s cubic-bezier(.22,.8,.22,1) forwards}
    #specialWheelOverlay .special-wheel-spin{position:relative;isolation:isolate;overflow:hidden;width:min(78vw,320px);height:58px;border:1px solid rgba(255,255,255,.13);border-radius:18px;background:linear-gradient(180deg,#45091a 0%,#340612 100%);color:#f8e9ed;font-family:inherit;font-size:16px;font-weight:600;letter-spacing:0;text-transform:none;box-shadow:0 14px 28px rgba(0,0,0,.48),inset 0 1px 0 rgba(255,255,255,.09);transition:transform .22s cubic-bezier(.22,.8,.22,1),box-shadow .22s ease,background .22s ease,opacity .22s ease;display:flex;align-items:center;justify-content:center;gap:8px;-webkit-tap-highlight-color:transparent}
    #specialWheelOverlay .special-wheel-spin:before{content:"";position:absolute;z-index:-1;inset:-20% auto -20% -38%;width:34%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.09),transparent);transform:translateX(-140%) skewX(-18deg)}
    #specialWheelOverlay .special-wheel-spin:not(:disabled):hover:before{animation:specialWheelShine .75s ease}
    #specialWheelOverlay .special-wheel-spin:not(:disabled):active{transform:scale(.972);box-shadow:0 8px 18px rgba(0,0,0,.44),inset 0 1px 0 rgba(255,255,255,.07)}
    #specialWheelOverlay .special-wheel-spin:disabled{opacity:.82;cursor:default}
    #specialWheelOverlay .special-wheel-spin.is-loading{background:linear-gradient(180deg,#3d0817 0%,#2f0611 100%)}
    #specialWheelOverlay .special-wheel-star{width:20px;height:20px;display:block;flex:0 0 auto;filter:drop-shadow(0 2px 5px rgba(196,149,40,.2))}
    #specialWheelOverlay .special-wheel-loader{width:22px;height:22px;border-radius:50%;display:block;box-sizing:border-box;border:2px solid rgba(255,255,255,.2);border-top-color:#fff;border-right-color:rgba(255,255,255,.72);animation:specialWheelLoader .72s linear infinite;filter:drop-shadow(0 2px 6px rgba(255,255,255,.08))}
    @media (prefers-reduced-motion:reduce){#specialWheelOverlay *{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
  </style>
  <div class="special-wheel-content">
    <div class="special-wheel-stage" data-special-wheel-stage>
      <span class="special-wheel-pointer" aria-hidden="true"></span>
      <div class="special-wheel-rotor" data-special-wheel-rotor>
        <span class="special-wheel-prize" style="--wheel-angle:0deg"><span class="gram-value">9</span><span class="gram-name">Gram</span></span>
        <span class="special-wheel-prize special-wheel-word" style="--wheel-angle:60deg">No Prize</span>
        <span class="special-wheel-prize" style="--wheel-angle:120deg"><span class="gram-value">4</span><span class="gram-name">Gram</span></span>
        <span class="special-wheel-prize special-wheel-word" style="--wheel-angle:180deg">Spin Again</span>
        <span class="special-wheel-prize" style="--wheel-angle:240deg"><span class="gram-value">0.5</span><span class="gram-name">Gram</span></span>
        <span class="special-wheel-prize special-wheel-word" style="--wheel-angle:300deg">No Prize</span>
        <i class="special-wheel-hub" aria-hidden="true"></i>
      </div>
    </div>
    <p class="special-wheel-result" data-special-wheel-result aria-live="polite"></p>
    <button class="special-wheel-spin" type="button" data-special-wheel-spin>Spin</button>
  </div>
</div>
<script>
(function(){
  var overlay=document.getElementById('specialWheelOverlay');
  if(!overlay)return;
  var rotor=overlay.querySelector('[data-special-wheel-rotor]');
  var stage=overlay.querySelector('[data-special-wheel-stage]');
  var button=overlay.querySelector('[data-special-wheel-spin]');
  var result=overlay.querySelector('[data-special-wheel-result]');
  var rotation=0;
  var spinning=false;
  var state=null;
  var starSvg='<svg class="special-wheel-star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.1l2.72 5.51 6.08.88-4.4 4.29 1.04 6.06L12 16.98l-5.44 2.86 1.04-6.06-4.4-4.29 6.08-.88L12 3.1z" fill="#c49528" stroke="#c49528" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/></svg>';
  var loader='<span class="special-wheel-loader" aria-label="Loading"></span>';
  function userId(){
    try{return String(window.Telegram&&Telegram.WebApp&&Telegram.WebApp.initDataUnsafe&&Telegram.WebApp.initDataUnsafe.user&&Telegram.WebApp.initDataUnsafe.user.id||'')}catch(e){return ''}
  }
  function initData(){
    try{return String(window.Telegram&&Telegram.WebApp&&Telegram.WebApp.initData||'')}catch(e){return ''}
  }
  function requestId(){
    var bytes=new Uint8Array(12);crypto.getRandomValues(bytes);return 'swreq_'+Array.from(bytes).map(function(v){return v.toString(16).padStart(2,'0')}).join('')
  }
  function haptic(type){
    try{var h=window.Telegram&&Telegram.WebApp&&Telegram.WebApp.HapticFeedback;if(!h)return;if(type==='success')h.notificationOccurred('success');else h.impactOccurred(type||'light')}catch(e){}
  }
  function applyActive(active){
    overlay.classList.toggle('active',!!active);
    overlay.setAttribute('aria-hidden',active?'false':'true');
    document.body.classList.toggle('special-wheel-active',!!active);
    document.documentElement.style.overflow=active?'hidden':'';
    document.body.style.overflow=active?'hidden':'';
  }
  function hideResult(){
    if(!result)return;
    result.classList.remove('is-visible');
    result.textContent='';
  }
  function showResult(text){
    if(!result)return;
    result.classList.remove('is-visible');
    result.textContent=text;
    void result.offsetWidth;
    result.classList.add('is-visible');
  }
  function renderButton(){
    if(!button)return;
    button.classList.toggle('is-loading',spinning);
    if(spinning){button.innerHTML=loader;return}
    var price=state?Math.max(0,Number(state.priceStars)||0):18;
    if(state&&(state.freeAvailable||Number(state.paidSpins)>0||price===0)){button.textContent='Spin';return}
    button.innerHTML='<span>'+price+'</span>'+starSvg;
  }
  async function refresh(){
    try{
      var response=await fetch('/app/api/special-wheel-mode?userId='+encodeURIComponent(userId())+'&t='+Date.now(),{cache:'no-store'});
      if(!response.ok)return;
      var data=await response.json();
      applyActive(data.active===true);
      if(data.state)state=data.state;
      renderButton();
    }catch(e){}
  }
  function animateTo(index,done){
    var current=((rotation%360)+360)%360;
    var target=(360-(Number(index)||0)*60)%360;
    var delta=(target-current+360)%360;
    rotation+=1800+delta;
    if(stage){stage.classList.remove('is-settled');stage.classList.add('is-spinning')}
    rotor.style.transition='transform 4.6s cubic-bezier(.08,.72,.08,1)';
    rotor.style.transform='rotate('+rotation+'deg)';
    setTimeout(function(){
      if(stage){stage.classList.remove('is-spinning');stage.classList.add('is-settled');setTimeout(function(){stage.classList.remove('is-settled')},360)}
      done();
    },4700);
  }
  function syncMainBalance(data){
    var next=data&&data.state&&Number(data.state.tonBalanceNano);
    var delta=Number(data&&data.prizeNano)||0;
    if(Number.isFinite(next)&&window.VexaTonBalance&&typeof window.VexaTonBalance.write==='function'){
      window.VexaTonBalance.write(next,delta,false);
    }
  }
  async function performSpin(){
    var response=await fetch('/app/api/special-wheel/spin',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({initData:initData(),requestId:requestId()}),cache:'no-store'});
    var data=await response.json().catch(function(){return {ok:false,error:'Spin failed'}});
    if(!response.ok||!data.ok){
      if(data.state)state=data.state;
      throw new Error(data.error||'Spin failed');
    }
    haptic('light');
    animateTo(data.prizeIndex,function(){
      state=data.state||state;
      syncMainBalance(data);
      var message=data.prizeLabel==='Spin Again'?'You won another spin':data.prizeLabel==='No Prize'?'No prize this time':'You won '+data.prizeLabel;
      showResult(message);
      if(data.prizeLabel!=='No Prize')haptic('success');
      spinning=false;button.disabled=false;renderButton();
    });
  }
  async function waitForPaidSpin(){
    for(var i=0;i<12;i++){
      await new Promise(function(resolve){setTimeout(resolve,500)});
      await refresh();
      if(state&&Number(state.paidSpins)>0)return true;
    }
    return false;
  }
  async function buyAndSpin(){
    if(state&&Number(state.priceStars)===0){await performSpin();return}
    var response=await fetch('/app/api/special-wheel/invoice',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({initData:initData()}),cache:'no-store'});
    var data=await response.json().catch(function(){return {ok:false,error:'Payment failed'}});
    if(!response.ok||!data.ok)throw new Error(data.error||'Payment failed');
    if(data.free===true||Number(data.priceStars)===0){await refresh();await performSpin();return}
    var tg=window.Telegram&&Telegram.WebApp;
    if(!tg||typeof tg.openInvoice!=='function'){location.href=data.invoiceLink;return}
    await new Promise(function(resolve,reject){
      tg.openInvoice(data.invoiceLink,function(status){
        if(status==='paid')resolve();
        else if(status==='cancelled'||status==='failed')reject(new Error(status==='cancelled'?'Payment cancelled':'Payment failed'));
        else reject(new Error('Payment was not completed'));
      });
    });
    if(!(await waitForPaidSpin()))throw new Error('Payment received. Please try again in a moment.');
    await performSpin();
  }
  if(button&&rotor){
    button.addEventListener('click',async function(){
      if(spinning)return;
      spinning=true;button.disabled=true;hideResult();renderButton();haptic('medium');
      try{
        var price=state?Math.max(0,Number(state.priceStars)||0):18;
        if(state&&(state.freeAvailable||Number(state.paidSpins)>0||price===0))await performSpin();
        else await buyAndSpin();
      }catch(error){
        spinning=false;button.disabled=false;
        if(stage)stage.classList.remove('is-spinning');
        showResult(error&&error.message?error.message:'Something went wrong');
        renderButton();
      }
    });
  }
  refresh();
  setInterval(refresh,2000);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)refresh()});
})();
</script>`;
