export const HOME_LOTTERY_CLIENT_SCRIPT = `
<script>
(function(){
  var state=null,busy=false,loading=false,quantity=1,MAX_QTY=20,serverOffsetMs=0,clockStarted=false,drawRefreshPending=false;
  var lifecycleTimer=0,lifecycleRetryMs=800,lastLoadAt=0;
  var drawInitialized=false,lastDrawId='',winnerEffectDrawId='',drawSpinTimer=0,scheduledDrawId='';
  var officialSpinActive=false,suppressedWindowFocus=false;
  var DRAW_DELAY_MS=5000,DRAW_ANIMATION_MS=18260,NEXT_ROUND_DELAY_MS=10000;
  function q(s,r){return (r||document).querySelector(s)}
  function initData(){var tg=window.Telegram&&window.Telegram.WebApp;return String(tg&&tg.initData||'')}
  function gram(nano){var value=Math.max(0,Number(nano)||0)/1000000000;return value.toFixed(2).replace(/\\.00$/,'').replace(/(\\.\\d)0$/,'$1')}
  function gramPrice(nano){var value=Math.max(0,Number(nano)||0)/1000000000,text=value.toFixed(4).replace(/0+$/,'');var dot=text.indexOf('.');if(dot<0)return text+'.00';var decimals=text.length-dot-1;if(decimals===0)return text+'00';if(decimals===1)return text+'0';return text}
  function purchaseId(){
    try{if(crypto&&crypto.randomUUID)return 'lp_'+crypto.randomUUID().replace(/-/g,'')}catch(e){}
    try{var bytes=new Uint8Array(12);crypto.getRandomValues(bytes);return 'lp_'+Array.prototype.map.call(bytes,function(v){return v.toString(16).padStart(2,'0')}).join('')}catch(e){}
    return 'lp_'+Date.now().toString(36)
  }
  function haptic(kind){try{var tg=window.Telegram&&window.Telegram.WebApp;if(tg&&tg.HapticFeedback){if(kind==='success'||kind==='error')tg.HapticFeedback.notificationOccurred(kind);else tg.HapticFeedback.impactOccurred(kind||'light')}}catch(e){}}
  function syncServerClock(payload,requestStartedAt,receivedAt){
    var serverNow=Number(payload&&payload.serverNowMs);if(!Number.isFinite(serverNow)||serverNow<=0)return;
    var started=Number(requestStartedAt)||receivedAt,total=Math.max(0,receivedAt-started),serverStarted=Number(payload&&payload.serverStartedAtMs);
    var processing=Number.isFinite(serverStarted)&&serverStarted>0?Math.max(0,serverNow-serverStarted):0;
    var transitRtt=Math.max(0,total-processing);
    serverOffsetMs=(serverNow+(transitRtt/2))-receivedAt;window.VexaLotteryServerOffsetMs=serverOffsetMs;
  }
  function liveServerNow(){return Date.now()+serverOffsetMs}
  function roundTime(name,fallback){
    var round=state&&state.round,raw=round&&round[name],value=Date.parse(String(raw||''));
    if(Number.isFinite(value))return value;
    var drawAt=Date.parse(String(round&&round.drawAt||''));
    return Number.isFinite(drawAt)?drawAt+(Number(fallback)||0):0;
  }
  function formatCountdown(ms){var s=Math.max(0,Math.floor(ms/1000)),h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0')}
  function lifecycleDueTime(){
    var round=state&&state.round;if(!round)return 0;
    return round.status==='open'?roundTime('drawAt',0):roundTime('nextRoundStartsAt',DRAW_DELAY_MS+DRAW_ANIMATION_MS+NEXT_ROUND_DELAY_MS);
  }
  function clearLifecycleTimer(){if(lifecycleTimer){clearTimeout(lifecycleTimer);lifecycleTimer=0}}
  function scheduleLifecycleRefresh(delay){
    clearLifecycleTimer();
    lifecycleTimer=setTimeout(function(){lifecycleTimer=0;refreshLifecycle()},Math.max(80,Math.floor(Number(delay)||0)));
  }
  function armLifecycle(){
    clearLifecycleTimer();
    var due=lifecycleDueTime();if(!due)return;
    var now=liveServerNow();
    if(due>now){lifecycleRetryMs=800;scheduleLifecycleRefresh(due-now+80);return}
    scheduleLifecycleRefresh(lifecycleRetryMs);
  }
  function refreshLifecycle(){
    if(drawRefreshPending||busy||loading){if(!lifecycleTimer)scheduleLifecycleRefresh(lifecycleRetryMs);return}
    drawRefreshPending=true;
    load(true).finally(function(){drawRefreshPending=false});
  }
  function updateCountdown(){
    var round=state&&state.round,time=q('#homeDrawInfoCard [data-draw-time]'),now=liveServerNow();
    if(!round){if(time)time.textContent='--:--:--';return}
    var drawAt=roundTime('drawAt',0);
    if(round.status==='open'){
      if(drawAt&&now<drawAt){if(time)time.textContent=formatCountdown(drawAt-now);return}
      if(time)time.textContent='00:00:00';
      if(!lifecycleTimer&&!drawRefreshPending&&!loading)scheduleLifecycleRefresh(80);
      return;
    }
    if(time)time.textContent='00:00:00';
    var nextStartsAt=roundTime('nextRoundStartsAt',DRAW_DELAY_MS+DRAW_ANIMATION_MS+NEXT_ROUND_DELAY_MS);
    if(nextStartsAt&&now>=nextStartsAt&&!lifecycleTimer&&!drawRefreshPending&&!loading)scheduleLifecycleRefresh(80);
  }
  function listHtml(tickets){
    if(!tickets||!tickets.length)return '<div class="home-ticket-list-item"><b>No tickets</b><span>empty</span></div>';
    return tickets.map(function(ticket){var label=ticket.isFree?'FREE':gram(ticket.priceNano)+' GRAM';return '<div class="home-ticket-list-item"><b>#'+String(ticket.ticketNumber||'').padStart(5,'0').slice(-5)+'</b><span>'+label+'</span></div>'}).join('');
  }
  function purchaseCostNano(){if(!state)return 0;var free=state.freeTicketAvailable?1:0;return Math.max(0,quantity-free)*Math.max(0,Number(state.settings&&state.settings.ticketPriceNano)||150000000)}
  function remainingLimit(){if(!state||!state.settings)return MAX_QTY;var limit=Math.max(0,Number(state.settings.maxTicketsPerUser)||0);if(!limit)return MAX_QTY;return Math.max(0,limit-Math.max(0,Number(state.ticketCount)||0))}
  function maxSelectable(){return Math.max(1,Math.min(MAX_QTY,remainingLimit()||1))}
  function balanceIconSrc(){var img=q('.top-balance-pill .ton-mini-icon img');return String(img&&(img.getAttribute('src')||img.src)||'')}
  function paidButtonHtml(cost){var src=balanceIconSrc(),icon=src?'<img src="'+src+'" alt="" aria-hidden="true" style="width:28px;height:28px;display:block;object-fit:contain;transform:translateY(1px)">':'';return '<span style="display:flex;width:100%;align-items:center;justify-content:center;gap:1px"><span style="font-size:calc(1em + 2px);line-height:1">'+gramPrice(cost)+'</span>'+icon+'</span>'}
  function prizeRowsHtml(prizes){
    var rows=Array.isArray(prizes)?prizes:[],html='';
    for(var i=0;i<15;i++){
      var prize=rows[i]||{rank:i+1,prizeNano:0},rank=i+1,premium=rank<=3?'<div class="vexa-bonus-premium" aria-hidden="true"></div>':'';
      html+='<article class="home-bonus-row home-bonus-top-card home-live-winner-card">'+premium+'<div class="home-live-winner-avatar home-bonus-rank-avatar">#'+rank+'</div><div class="home-live-winner-user" aria-hidden="true"></div><div class="home-live-winner-amount">'+gram(prize.prizeNano)+' GRAM</div></article>';
    }
    return html;
  }
  function roundTicketCount(){return Math.max(0,Math.floor(Number(state&&state.roundTicketCount)||0))}
  function renderClaimedTickets(){
    var value=q('#homeBonusTotal [data-lottery-round-ticket-count]');if(value)value.textContent=roundTicketCount().toLocaleString('en-US');
  }
  function renderPrizePanel(){var list=q('#homeBonusPanel .home-bonus-list');if(list&&state&&Array.isArray(state.prizes))list.innerHTML=prizeRowsHtml(state.prizes);renderClaimedTickets()}
  function render(){
    var cardCount=q('#home .home-ticket-card [data-ticket-count]'),drawerCount=q('#homeTicketDrawer [data-ticket-count]'),list=q('#homeTicketList'),button=q('#homeTicketButton');
    var count=Math.max(0,Number(state&&state.ticketCount)||0),limitReached=!!(state&&state.settings&&Number(state.settings.maxTicketsPerUser)>0&&remainingLimit()<=0);
    var max=maxSelectable();if(quantity>max)quantity=max;if(quantity<1)quantity=1;
    if(cardCount)cardCount.textContent=quantity+' ticket'+(quantity===1?'':'s');
    if(drawerCount)drawerCount.textContent=count+' ticket'+(count===1?'':'s');
    if(list)list.innerHTML=listHtml(state&&state.tickets||[]);
    var minus=q('#home [data-ticket-minus]'),plus=q('#home [data-ticket-plus]');
    if(minus)minus.disabled=busy||quantity<=1||limitReached;
    if(plus)plus.disabled=busy||quantity>=max||!state||!state.canBuy||limitReached;
    if(button){
      var cost=purchaseCostNano();
      if(busy){button.textContent='Getting Ticket…';button.removeAttribute('aria-label')}
      else if(limitReached){button.textContent='Ticket limit reached';button.removeAttribute('aria-label')}
      else if(state&&state.canBuy&&cost<=0){button.textContent='Get Free Ticket';button.setAttribute('aria-label','Get Free Ticket')}
      else if(state&&state.canBuy){button.innerHTML=paidButtonHtml(cost);button.setAttribute('aria-label',gramPrice(cost)+' GRAM')}
      else if(state&&state.reason){button.textContent=state.reason;button.removeAttribute('aria-label')}
      else if(!initData()){button.textContent='Open in Telegram';button.removeAttribute('aria-label')}
      button.disabled=busy||!state||!state.canBuy||!initData()||limitReached;
    }
    renderPrizePanel();
    updateCountdown();
  }
  function slotEngine(){return window.VexaLotterySlotEngine||null}
  function replaySuppressedFocus(){
    if(!suppressedWindowFocus)return;
    suppressedWindowFocus=false;
    setTimeout(function(){
      try{window.dispatchEvent(new Event('focus'))}
      catch(e){try{var event=document.createEvent('Event');event.initEvent('focus',false,false);window.dispatchEvent(event)}catch(x){}}
    },0);
  }
  function setOfficialSpinActive(active){officialSpinActive=!!active;if(!officialSpinActive)replaySuppressedFocus()}
  function guardOfficialSpinFocus(event){
    if(!officialSpinActive||event&&event.target!==window)return;
    suppressedWindowFocus=true;
    if(event&&typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
  }
  function setStaticCode(code){
    var engine=slotEngine();if(!engine||typeof engine.setCode!=='function')return;
    try{engine.setCode(code)}catch(e){}
  }
  function winnerEffectAlreadyShown(drawId){try{return localStorage.getItem('vexaLotteryWinnerEffect:'+drawId)==='1'}catch(e){return false}}
  function markWinnerEffectShown(drawId){try{localStorage.setItem('vexaLotteryWinnerEffect:'+drawId,'1')}catch(e){}}
  function playWinnerEffect(){try{if(typeof window.VexaLotteryWinnerEffect==='function')window.VexaLotteryWinnerEffect()}catch(e){}}
  function triggerWinnerEffect(drawId){
    if(!drawId||winnerEffectDrawId===drawId||winnerEffectAlreadyShown(drawId))return;
    winnerEffectDrawId=drawId;markWinnerEffectShown(drawId);haptic('success');playWinnerEffect();
  }
  function scheduleLiveDraw(drawId,code,won,startAt){
    if(!drawId||!/^\\d{5}$/.test(String(code||''))||scheduledDrawId===drawId)return;
    scheduledDrawId=drawId;if(drawSpinTimer)clearTimeout(drawSpinTimer);
    var run=function(){
      var engine=slotEngine();
      if(!engine||typeof engine.spinTo!=='function'){scheduledDrawId='';return}
      setOfficialSpinActive(true);
      var started=false;
      try{started=engine.spinTo(code,function(){setOfficialSpinActive(false);setStaticCode(code);haptic('success');if(won)triggerWinnerEffect(drawId);scheduledDrawId=''})}catch(e){started=false}
      if(!started){setOfficialSpinActive(false);scheduledDrawId=''}
    };
    drawSpinTimer=setTimeout(run,Math.max(0,(Number(startAt)||liveServerNow())-liveServerNow()));
  }
  function applyDrawResult(){
    var draw=state&&state.lastDraw,drawId=draw&&String(draw.roundId||''),code=draw&&String(draw.winningCode||''),won=!!(state&&state.lastDrawWon);
    if(!drawId||!/^\\d{5}$/.test(code))return;
    var round=state&&state.round,sameClosedRound=!!(round&&round.status==='closed'&&String(round.id||'')===drawId),now=liveServerNow();
    var startAt=sameClosedRound?roundTime('drawStartsAt',DRAW_DELAY_MS):0;
    var engine=slotEngine(),duration=engine&&Number(engine.durationMs)>0?Number(engine.durationMs):DRAW_ANIMATION_MS;
    var animationEndsAt=startAt?startAt+duration:0;
    if(!drawInitialized){
      drawInitialized=true;lastDrawId=drawId;
      if(sameClosedRound&&animationEndsAt&&now<animationEndsAt)scheduleLiveDraw(drawId,code,won,Math.max(now,startAt));
      else{setStaticCode(code);if(won&&sameClosedRound)triggerWinnerEffect(drawId)}
      return;
    }
    if(drawId===lastDrawId)return;
    lastDrawId=drawId;
    if(sameClosedRound)scheduleLiveDraw(drawId,code,won,Math.max(now,startAt||now));
    else setStaticCode(code);
  }
  async function load(force){
    if(loading)return false;
    var now=Date.now();if(!force&&now-lastLoadAt<500)return false;
    var data=initData();
    if(!data){state={ticketCount:0,roundTicketCount:0,tickets:[],round:null,lastDraw:null,lastDrawWon:false,freeTicketAvailable:true,canBuy:false,reason:'Open in Telegram',prizes:[],settings:{ticketPriceNano:150000000,maxTicketsPerUser:0,drawIntervalMinutes:1440}};clearLifecycleTimer();render();return false}
    loading=true;lastLoadAt=now;
    var started=Date.now();
    try{
      var response=await fetch('/app/api/lottery/state',{cache:'no-store',headers:{'accept':'application/json','x-telegram-init-data':data}});
      var payload=await response.json().catch(function(){return null}),received=Date.now();
      if(!response.ok)throw new Error(payload&&payload.error||'Could not load Lottery');
      syncServerClock(payload,started,received);state=payload;render();applyDrawResult();
      var due=lifecycleDueTime();
      if(due&&due<=liveServerNow())lifecycleRetryMs=Math.min(5000,Math.max(800,Math.round(lifecycleRetryMs*1.7)));
      else lifecycleRetryMs=800;
      armLifecycle();
      return true;
    }catch(error){
      state={ticketCount:0,roundTicketCount:0,tickets:[],round:null,lastDraw:null,lastDrawWon:false,freeTicketAvailable:false,canBuy:false,reason:String(error&&error.message||'Lottery unavailable'),prizes:[],settings:{ticketPriceNano:150000000,maxTicketsPerUser:0,drawIntervalMinutes:1440}};render();
      lifecycleRetryMs=Math.min(15000,Math.max(1200,Math.round(lifecycleRetryMs*1.8)));
      if(q('#home.active')&&!document.hidden)scheduleLifecycleRefresh(lifecycleRetryMs);
      return false;
    }finally{loading=false}
  }
  async function buy(){
    if(busy||!state||!state.canBuy||!initData()||remainingLimit()<=0&&Number(state.settings&&state.settings.maxTicketsPerUser)>0)return;
    busy=true;render();
    try{
      var response=await fetch('/app/api/lottery/tickets',{method:'POST',headers:{'content-type':'application/json','accept':'application/json'},body:JSON.stringify({initData:initData(),quantity:quantity,purchaseId:purchaseId()})});
      var payload=await response.json().catch(function(){return null});
      if(!response.ok)throw new Error(payload&&payload.error||'Could not get ticket');
      if(window.VexaTonBalance&&typeof window.VexaTonBalance.write==='function'&&payload.gramBalanceNano!==undefined)window.VexaTonBalance.write(Number(payload.gramBalanceNano)||0,0);
      quantity=1;haptic('success');await load(true);
    }catch(error){
      haptic('error');var button=q('#homeTicketButton');if(button){button.textContent=String(error&&error.message||'Could not get ticket');setTimeout(render,1200)}
    }finally{busy=false;setTimeout(render,0)}
  }
  function handleTicketControls(event){
    var target=event.target&&event.target.closest?event.target.closest('#homeTicketButton,#home [data-ticket-plus],#home [data-ticket-minus]'):null;if(!target)return;
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
    if(target.id==='homeTicketButton'){buy();return}
    if(busy||!state||!state.canBuy||remainingLimit()<=0&&Number(state.settings&&state.settings.maxTicketsPerUser)>0)return;
    if(target.hasAttribute('data-ticket-plus'))quantity=Math.min(maxSelectable(),quantity+1);
    if(target.hasAttribute('data-ticket-minus'))quantity=Math.max(1,quantity-1);
    haptic('light');render();
  }
  function handleSmartRefresh(event){
    var target=event.target&&event.target.closest?event.target:null;if(!target)return;
    var homeLink=target.closest('[data-view="home"]'),bonus=target.closest('#homeBonusButton');
    if(homeLink)setTimeout(function(){if(q('#home.active')&&!busy)load(false)},60);
    else if(bonus)setTimeout(function(){if(q('#home.active')&&!busy)load(false)},0);
  }
  function startClock(){if(clockStarted)return;clockStarted=true;setInterval(updateCountdown,250)}
  function refreshWhenVisible(){if(!document.hidden&&q('#home.active')&&!busy)load(false)}
  function init(){renderClaimedTickets();document.addEventListener('click',handleTicketControls,true);document.addEventListener('click',handleSmartRefresh,true);load(true);startClock();window.VexaLotteryRefresh=function(){return load(true)}}
  window.addEventListener('focus',guardOfficialSpinFocus,true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('focus',refreshWhenVisible);
  document.addEventListener('visibilitychange',refreshWhenVisible);
})();
</script>
`;
