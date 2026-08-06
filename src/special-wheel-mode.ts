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
    #specialWheelOverlay{position:fixed;left:0;right:0;bottom:0;top:calc(110px + env(safe-area-inset-top));z-index:2147483646;display:none;align-items:center;justify-content:center;background:#000;color:#fff;padding:22px 24px calc(24px + env(safe-area-inset-bottom));box-sizing:border-box;overflow:hidden;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
    #specialWheelOverlay.active{display:flex}
    body.special-wheel-active main.app>header.top #rankPill{display:none!important}
    body.special-wheel-active nav.tabs{visibility:hidden!important;pointer-events:none!important}
    #specialWheelOverlay .special-wheel-content{width:100%;max-width:520px;display:grid;justify-items:center;gap:24px;transform:translateY(-1.5vh)}
    #specialWheelOverlay .special-wheel-stage{position:relative;width:min(78vw,312px);aspect-ratio:1}
    #specialWheelOverlay .special-wheel-rotor{position:absolute;inset:0;border-radius:50%;overflow:hidden;background:conic-gradient(from -30deg,#f4efe6 0 60deg,#171717 60deg 120deg,#d7c7ae 120deg 180deg,#0b0b0b 180deg 240deg,#ece5da 240deg 300deg,#202020 300deg 360deg);border:1px solid rgba(255,255,255,.22);box-shadow:0 28px 72px rgba(0,0,0,.62),inset 0 0 0 8px rgba(0,0,0,.2);will-change:transform;transform:rotate(0deg)}
    #specialWheelOverlay .special-wheel-rotor:after{content:"";position:absolute;inset:9px;border-radius:50%;border:1px solid rgba(255,255,255,.16);pointer-events:none}
    #specialWheelOverlay .special-wheel-prize{position:absolute;z-index:2;left:50%;top:50%;width:76px;margin-left:-38px;margin-top:-13px;text-align:center;color:#f7f2e9;font-family:inherit;font-size:12px;font-weight:600;line-height:1.08;letter-spacing:0;text-transform:none;text-shadow:0 1px 5px rgba(0,0,0,.8);transform:rotate(var(--wheel-angle)) translateY(-112px) rotate(calc(-1 * var(--wheel-angle)))}
    #specialWheelOverlay .special-wheel-prize:nth-of-type(1),#specialWheelOverlay .special-wheel-prize:nth-of-type(3),#specialWheelOverlay .special-wheel-prize:nth-of-type(5){color:#111;text-shadow:none}
    #specialWheelOverlay .special-wheel-prize .gram-value{display:block;font-size:17px;font-weight:650;letter-spacing:0;text-transform:none}
    #specialWheelOverlay .special-wheel-prize .gram-name{display:block;margin-top:2px;font-size:10px;font-weight:500;letter-spacing:0;text-transform:none}
    #specialWheelOverlay .special-wheel-prize.special-wheel-word{font-size:10px;font-weight:600;line-height:1.15;letter-spacing:0;text-transform:none}
    #specialWheelOverlay .special-wheel-hub{position:absolute;z-index:3;left:50%;top:50%;width:38px;height:38px;margin:-19px;border-radius:50%;background:#050505;border:1px solid rgba(255,255,255,.3);box-shadow:0 6px 20px rgba(0,0,0,.58),inset 0 1px 0 rgba(255,255,255,.14)}
    #specialWheelOverlay .special-wheel-pointer{position:absolute;z-index:6;left:50%;top:-3px;width:0;height:0;transform:translateX(-50%);border-left:11px solid transparent;border-right:11px solid transparent;border-top:24px solid #f5efe5;filter:drop-shadow(0 5px 8px rgba(0,0,0,.7))}
    #specialWheelOverlay .special-wheel-result{min-height:18px;margin:0;color:rgba(255,255,255,.76);font-family:inherit;font-size:13px;font-weight:500;letter-spacing:0;text-align:center}
    #specialWheelOverlay .special-wheel-spin{width:min(78vw,320px);height:58px;border:1px solid rgba(255,255,255,.13);border-radius:18px;background:#3b0715;color:#f7e7eb;font-family:inherit;font-size:16px;font-weight:600;letter-spacing:0;text-transform:none;box-shadow:0 12px 24px rgba(0,0,0,.52),inset 0 1px 0 rgba(255,255,255,.08);transition:transform .18s ease,opacity .18s ease;display:flex;align-items:center;justify-content:center;gap:8px}
    #specialWheelOverlay .special-wheel-spin:active{transform:scale(.975)}
    #specialWheelOverlay .special-wheel-spin:disabled{opacity:.62}
    #specialWheelOverlay .special-wheel-star{width:20px;height:20px;display:block;flex:0 0 auto}
  </style>
  <div class="special-wheel-content">
    <div class="special-wheel-stage">
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
    <p class="special-wheel-result" data-special-wheel-result></p>
    <button class="special-wheel-spin" type="button" data-special-wheel-spin>Spin</button>
  </div>
</div>
<script>
(function(){
  var overlay=document.getElementById('specialWheelOverlay');
  if(!overlay)return;
  var rotor=overlay.querySelector('[data-special-wheel-rotor]');
  var button=overlay.querySelector('[data-special-wheel-spin]');
  var result=overlay.querySelector('[data-special-wheel-result]');
  var rotation=0;
  var spinning=false;
  var state=null;
  var starSvg='<svg class="special-wheel-star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.1l2.72 5.51 6.08.88-4.4 4.29 1.04 6.06L12 16.98l-5.44 2.86 1.04-6.06-4.4-4.29 6.08-.88L12 3.1z" fill="#c49528" stroke="#c49528" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/></svg>';
  function userId(){
    try{return String(window.Telegram&&Telegram.WebApp&&Telegram.WebApp.initDataUnsafe&&Telegram.WebApp.initDataUnsafe.user&&Telegram.WebApp.initDataUnsafe.user.id||'')}catch(e){return ''}
  }
  function initData(){
    try{return String(window.Telegram&&Telegram.WebApp&&Telegram.WebApp.initData||'')}catch(e){return ''}
  }
  function requestId(){
    var bytes=new Uint8Array(12);crypto.getRandomValues(bytes);return 'swreq_'+Array.from(bytes).map(function(v){return v.toString(16).padStart(2,'0')}).join('')
  }
  function applyActive(active){
    overlay.classList.toggle('active',!!active);
    overlay.setAttribute('aria-hidden',active?'false':'true');
    document.body.classList.toggle('special-wheel-active',!!active);
    document.documentElement.style.overflow=active?'hidden':'';
    document.body.style.overflow=active?'hidden':'';
  }
  function renderButton(){
    if(!button)return;
    if(spinning){button.textContent='Spinning';return}
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
    rotation+=1440+delta;
    rotor.style.transition='transform 4.2s cubic-bezier(.12,.72,.08,1)';
    rotor.style.transform='rotate('+rotation+'deg)';
    setTimeout(done,4300);
  }
  async function performSpin(){
    var response=await fetch('/app/api/special-wheel/spin',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({initData:initData(),requestId:requestId()}),cache:'no-store'});
    var data=await response.json().catch(function(){return {ok:false,error:'Spin failed'}});
    if(!response.ok||!data.ok){
      if(data.state)state=data.state;
      throw new Error(data.error||'Spin failed');
    }
    animateTo(data.prizeIndex,function(){
      state=data.state||state;
      result.textContent=data.prizeLabel==='Spin Again'?'You won another spin':data.prizeLabel==='No Prize'?'No prize this time':'You won '+data.prizeLabel;
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
      spinning=true;button.disabled=true;result.textContent='';renderButton();
      try{
        var price=state?Math.max(0,Number(state.priceStars)||0):18;
        if(state&&(state.freeAvailable||Number(state.paidSpins)>0||price===0))await performSpin();
        else await buyAndSpin();
      }catch(error){
        spinning=false;button.disabled=false;result.textContent=error&&error.message?error.message:'Something went wrong';renderButton();
      }
    });
  }
  refresh();
  setInterval(refresh,2000);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)refresh()});
})();
</script>`;
