export const HOME_LOTTERY_CLIENT_SCRIPT = `
<script>
(function(){
  var state=null,busy=false,quantity=1,MAX_QTY=20,serverOffsetMs=0,pollStarted=false,drawRefreshPending=false;
  var drawInitialized=false,lastDrawId='',winnerEffectDrawId='',drawSpinTimer=0,scheduledDrawId='';
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
    var midpoint=(Number(requestStartedAt)||receivedAt)+((receivedAt-(Number(requestStartedAt)||receivedAt))/2);
    serverOffsetMs=serverNow-midpoint;window.VexaLotteryServerOffsetMs=serverOffsetMs;
  }
  function liveServerNow(){return Date.now()+serverOffsetMs}
  function roundTime(name,fallback){
    var round=state&&state.round,raw=round&&round[name],value=Date.parse(String(raw||''));
    if(Number.isFinite(value))return value;
    var drawAt=Date.parse(String(round&&round.drawAt||''));
    return Number.isFinite(drawAt)?drawAt+(Number(fallback)||0):0;
  }
  function formatCountdown(ms){var s=Math.max(0,Math.floor(ms/1000)),h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0')}
  function refreshLifecycle(){
    if(drawRefreshPending||busy)return;
    drawRefreshPending=true;load().finally(function(){drawRefreshPending=false})
  }
  function updateCountdown(){
    var round=state&&state.round,time=q('#homeDrawInfoCard [data-draw-time]'),now=liveServerNow();
    if(!round){if(time)time.textContent='--:--:--';return}
    var drawAt=roundTime('drawAt',0);
    if(round.status==='open'){
      if(drawAt&&now<drawAt){if(time)time.textContent=formatCountdown(drawAt-now);return}
      if(time)time.textContent='00:00:00';
      refreshLifecycle();
      return;
    }
    if(time)time.textContent='00:00:00';
    var nextStartsAt=roundTime('nextRoundStartsAt',DRAW_DELAY_MS+DRAW_ANIMATION_MS+NEXT_ROUND_DELAY_MS);
    if(nextStartsAt&&now>=nextStartsAt)refreshLifecycle();
  }
  function listHtml(tickets){
    if(!tickets||!tickets.length)return '<div class="home-ticket-list-item"><b>No tickets</b><span>empty</span></div>';
    return tickets.map(function(ticket){var label=ticket.isFree?'FREE':gram(ticket.priceNano)+' GRAM';return '<div class="home-ticket-list-item"><b>#'+String(ticket.ticketNumber||'').padStart(5,'0').slice(-5)+'</b><span>'+label+'</span></div>'}).join('');
  }
  function purchaseCostNano(){if(!state)return 0;var free=state.freeTicketAvailable?1:0;return Math.max(0,quantity-free)*Math.max(0,Number(state.settings&&state.settings.ticketPriceNano)||150000000)}
  function remainingLimit(){if(!state||!state.settings)return MAX_QTY;var limit=Math.max(0,Number(state.settings.maxTicketsPerUser)||0);if(!limit)return MAX_QTY;return Math.max(0,limit-Math.max(0,Number(state.ticketCount)||0))}
  function maxSelectable(){return Math.max(1,Math.min(MAX_QTY,remainingLimit()||1))}
  function balanceIconSrc(){var img=q('.top-balance-pill .ton-mini-icon img');return String(img&&(img.getAttribute('src')||img.src)||'')}
  function paidButtonHtml(cost){var src=balanceIconSrc(),icon=src?'<img src="'+src+'" alt="" aria-hidden="true" style="width:18px;height:18px;display:block;object-fit:contain">':'';return '<span style="display:inline-flex;align-items:center;justify-content:center;gap:6px">'+icon+'<span>'+gramPrice(cost)+'</span></span>'}
  function prizeRowsHtml(prizes){
    var rows=Array.isArray(prizes)?prizes:[],html='';
    for(var i=0;i<15;i++){
      var prize=rows[i]||{rank:i+1,prizeNano:0},rank=i+1,premium=rank<=3?'<div class="vexa-bonus-premium" aria-hidden="true"></div>':'';
      html+='<article class="home-bonus-row home-bonus-top-card home-live-winner-card">'+premium+'<div class="home-live-winner-avatar home-bonus-rank-avatar">#'+rank+'</div><div class="home-live-winner-user" aria-hidden="true"></div><div class="home-live-winner-amount">'+gram(prize.prizeNano)+' GRAM</div></article>';
    }
    return html;
  }
  function renderPrizePanel(){var list=q('#homeBonusPanel .home-bonus-list');if(list&&state&&Array.isArray(state.prizes))list.innerHTML=prizeRowsHtml(state.prizes)}
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
      button.classList.remove('is-ready');
    }
    renderPrizePanel();
    updateCountdown();
  }
  function slotEngine(){return window.VexaLotterySlotEngine||null}
  function setStaticCode(code){
    var engine=slotEngine();
    if(!engine||typeof engine.setCode!=='function'){setTimeout(function(){setStaticCode(code)},80);return}
    engine.setCode(code);
  }
  function winnerEffectAlreadyShown(drawId){try{return localStorage.getItem('vexaLotteryWinnerEffect:'+drawId)==='1'}catch(e){return false}}
  function markWinnerEffectShown(drawId){try{localStorage.setItem('vexaLotteryWinnerEffect:'+drawId,'1')}catch(e){}}
  function triggerWinnerEffect(drawId){
    if(!drawId||winnerEffectDrawId===drawId||winnerEffectAlreadyShown(drawId))return;
    winnerEffectDrawId=drawId;markWinnerEffectShown(drawId);haptic('success');
    var button=q('#homeConfettiButton');if(button&&typeof button.click==='function')button.click();
  }
  function scheduleLiveDraw(drawId,code,won,startAt){
    if(!drawId||!/^\\d{5}$/.test(String(code||''))||scheduledDrawId===drawId)return;
    scheduledDrawId=drawId;if(drawSpinTimer)clearTimeout(drawSpinTimer);
    var run=function(){
      var engine=slotEngine();
      if(!engine||typeof engine.spinTo!=='function'){drawSpinTimer=setTimeout(run,80);return}
      var started=engine.spinTo(code,function(){haptic('success');if(won)triggerWinnerEffect(drawId);scheduledDrawId=''});
      if(!started)drawSpinTimer=setTimeout(run,160);
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
      if(sameClosedRound&&animationEndsAt&&now<animationEndsAt){scheduleLiveDraw(drawId,code,won,Math.max(now,startAt))}
      else{setStaticCode(code);if(won&&sameClosedRound)triggerWinnerEffect(drawId)}
      return;
    }
    if(drawId===lastDrawId)return;
    lastDrawId=drawId;
    if(sameClosedRound&&animationEndsAt&&now<animationEndsAt)scheduleLiveDraw(drawId,code,won,Math.max(now,startAt));
    else setStaticCode(code);
  }
  async function load(){
    var data=initData();
    if(!data){state={ticketCount:0,tickets:[],round:null,lastDraw:null,lastDrawWon:false,freeTicketAvailable:true,canBuy:false,reason:'Open in Telegram',prizes:[],settings:{ticketPriceNano:150000000,maxTicketsPerUser:0,drawIntervalMinutes:1440}};render();return}
    var started=Date.now();
    try{
      var response=await fetch('/app/api/lottery/state',{cache:'no-store',headers:{'accept':'application/json','x-telegram-init-data':data}});
      var payload=await response.json().catch(function(){return null}),received=Date.now();
      if(!response.ok)throw new Error(payload&&payload.error||'Could not load Lottery');
      syncServerClock(payload,started,received);state=payload;render();applyDrawResult();
    }catch(error){
      state={ticketCount:0,tickets:[],round:null,lastDraw:null,lastDrawWon:false,freeTicketAvailable:false,canBuy:false,reason:String(error&&error.message||'Lottery unavailable'),prizes:[],settings:{ticketPriceNano:150000000,maxTicketsPerUser:0,drawIntervalMinutes:1440}};render();
    }
  }
  async function buy(){
    if(busy||!state||!state.canBuy||!initData()||remainingLimit()<=0&&Number(state.settings&&state.settings.maxTicketsPerUser)>0)return;
    busy=true;render();
    try{
      var response=await fetch('/app/api/lottery/tickets',{method:'POST',headers:{'content-type':'application/json','accept':'application/json'},body:JSON.stringify({initData:initData(),quantity:quantity,purchaseId:purchaseId()})});
      var payload=await response.json().catch(function(){return null});
      if(!response.ok)throw new Error(payload&&payload.error||'Could not get ticket');
      if(window.VexaTonBalance&&typeof window.VexaTonBalance.write==='function'&&payload.gramBalanceNano!==undefined)window.VexaTonBalance.write(Number(payload.gramBalanceNano)||0,0);
      quantity=1;haptic('success');await load();
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
  function startLiveSync(){if(pollStarted)return;pollStarted=true;setInterval(updateCountdown,250);setInterval(function(){if(!busy&&q('#home.active')&&!drawRefreshPending)load()},5000)}
  function init(){document.addEventListener('click',handleTicketControls,true);load();startLiveSync();window.VexaLotteryRefresh=load}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('focus',function(){if(q('#home.active')&&!busy)load()});
})();
</script>
`;
