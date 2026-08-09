export const HOME_LOTTERY_CLIENT_SCRIPT = `
<script>
(function(){
  var state=null,busy=false,quantity=1,MAX_QTY=20,serverOffsetMs=0,pollStarted=false,drawRefreshPending=false;
  var drawInitialized=false,lastDrawId='',slotBusy=false,queuedDrawCode='';
  var ROW=34,REST_LOOP=20,DRAW_LOOPS=28;
  function q(s,r){return (r||document).querySelector(s)}
  function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function initData(){var tg=window.Telegram&&window.Telegram.WebApp;return String(tg&&tg.initData||'')}
  function gram(nano){var value=Math.max(0,Number(nano)||0)/1000000000;return value.toFixed(2).replace(/\\.00$/,'').replace(/(\\.\\d)0$/,'$1')}
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
  function currentDrawTarget(){var raw=state&&state.round&&state.round.status==='open'?state.round.drawAt:'';var target=Date.parse(String(raw||''));return Number.isFinite(target)?target:0}
  function formatCountdown(ms){var s=Math.max(0,Math.floor(ms/1000)),h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0')}
  function updateCountdown(){
    var target=currentDrawTarget(),time=q('#homeDrawInfoCard [data-draw-time]');
    if(!target){if(time)time.textContent='--:--:--';return}
    var left=target-liveServerNow();if(time)time.textContent=formatCountdown(left);
    if(left<=0&&!drawRefreshPending&&!busy){drawRefreshPending=true;load().finally(function(){drawRefreshPending=false})}
  }
  function listHtml(tickets){
    if(!tickets||!tickets.length)return '<div class="home-ticket-list-item"><b>No tickets</b><span>empty</span></div>';
    return tickets.map(function(ticket){var label=ticket.isFree?'FREE':gram(ticket.priceNano)+' GRAM';return '<div class="home-ticket-list-item"><b>#'+String(ticket.ticketNumber||'').padStart(5,'0').slice(-5)+'</b><span>'+label+'</span></div>'}).join('');
  }
  function purchaseCostNano(){if(!state)return 0;var free=state.freeTicketAvailable?1:0;return Math.max(0,quantity-free)*Math.max(0,Number(state.settings&&state.settings.ticketPriceNano)||150000000)}
  function remainingLimit(){if(!state||!state.settings)return MAX_QTY;var limit=Math.max(0,Number(state.settings.maxTicketsPerUser)||0);if(!limit)return MAX_QTY;return Math.max(0,limit-Math.max(0,Number(state.ticketCount)||0))}
  function maxSelectable(){return Math.max(1,Math.min(MAX_QTY,remainingLimit()||1))}
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
      var cost=purchaseCostNano(),label='';
      if(limitReached)label='Ticket limit reached';
      else if(state&&state.canBuy)label=(cost>0?gram(cost)+' GRAM':'FREE')+' · Get Ticket';
      else if(state&&state.reason)label=state.reason;
      else if(!initData())label='Open in Telegram';
      button.textContent=busy?'Getting Ticket…':label;
      button.disabled=busy||!state||!state.canBuy||!initData()||limitReached;
      button.classList.remove('is-ready');
    }
    updateCountdown();
  }
  function reelY(index){return 'translate3d(0,-'+((index*ROW)+(ROW/2))+'px,0)'}
  function indexFor(value,loop){return loop*10+Math.max(0,Math.min(9,Math.floor(Number(value)||0)))}
  function reelDigits(){var html='';for(var cycle=0;cycle<90;cycle++)for(var n=0;n<10;n++)html+='<span class="home-slot-number-digit">'+n+'</span>';return html}
  function ensureReels(){
    qa('#home .home-slot-number-reel').forEach(function(reel){
      var strip=q('[data-slot-strip]',reel);if(!strip)return;
      if(strip.dataset.lotteryDrawDigits!=='1'){strip.innerHTML=reelDigits();strip.dataset.lotteryDrawDigits='1'}
      var value=Math.max(0,Math.min(9,Math.floor(Number(reel.getAttribute('data-slot-value')||'0'))));
      if(!reel.classList.contains('is-spinning')){strip.style.setProperty('transition','none','important');strip.style.transform=reelY(indexFor(value,REST_LOOP));strip.style.willChange='auto'}
    })
  }
  function setSlotCode(code,animate){
    var clean=String(code||'').replace(/[^0-9]/g,'').padStart(5,'0').slice(-5);if(clean.length!==5)return;
    ensureReels();
    if(!animate){
      qa('#home .home-slot-number-reel').slice(0,5).forEach(function(reel,index){var final=Number(clean.charAt(index));var strip=q('[data-slot-strip]',reel);if(!strip)return;reel.setAttribute('data-slot-value',String(final));strip.style.setProperty('transition','none','important');strip.style.transform=reelY(indexFor(final,REST_LOOP));strip.style.willChange='auto';reel.classList.remove('is-spinning')});
      return;
    }
    if(slotBusy){queuedDrawCode=clean;return}
    slotBusy=true;queuedDrawCode='';var reels=qa('#home .home-slot-number-reel').slice(0,5),pending=reels.length;
    if(!pending){slotBusy=false;return}
    reels.forEach(function(reel,index){
      var strip=q('[data-slot-strip]',reel);if(!strip){pending--;return}
      var current=Math.max(0,Math.min(9,Math.floor(Number(reel.getAttribute('data-slot-value')||'0'))));
      var final=Number(clean.charAt(index)),loops=DRAW_LOOPS+index*2,duration=2300+index*420;
      reel.setAttribute('data-slot-value',String(final));strip.style.setProperty('transition','none','important');strip.style.transform=reelY(indexFor(current,REST_LOOP));strip.style.willChange='transform';reel.classList.add('is-spinning');
      setTimeout(function(){strip.style.setProperty('transition','transform '+duration+'ms cubic-bezier(.12,.74,.18,1)','important');strip.style.transform=reelY(indexFor(final,REST_LOOP+loops))},30+index*50);
      setTimeout(function(){strip.style.setProperty('transition','none','important');strip.style.transform=reelY(indexFor(final,REST_LOOP));strip.style.willChange='auto';reel.classList.remove('is-spinning');pending--;if(pending<=0){slotBusy=false;haptic('success');if(queuedDrawCode){var next=queuedDrawCode;queuedDrawCode='';setTimeout(function(){setSlotCode(next,true)},120)}}},duration+260+index*50)
    })
  }
  function applyDrawResult(){
    var draw=state&&state.lastDraw,drawId=draw&&String(draw.roundId||''),code=draw&&String(draw.winningCode||'');
    if(!drawInitialized){drawInitialized=true;if(drawId&&code){lastDrawId=drawId;setSlotCode(code,false)}else ensureReels();return}
    if(drawId&&code&&drawId!==lastDrawId){lastDrawId=drawId;setSlotCode(code,true)}
  }
  async function load(){
    var data=initData();
    if(!data){state={ticketCount:0,tickets:[],lastDraw:null,freeTicketAvailable:true,canBuy:false,reason:'Open in Telegram',settings:{ticketPriceNano:150000000,maxTicketsPerUser:0,drawIntervalMinutes:1440}};render();applyDrawResult();return}
    var started=Date.now();
    try{
      var response=await fetch('/app/api/lottery/state',{cache:'no-store',headers:{'accept':'application/json','x-telegram-init-data':data}});
      var payload=await response.json().catch(function(){return null}),received=Date.now();
      if(!response.ok)throw new Error(payload&&payload.error||'Could not load Lottery');
      syncServerClock(payload,started,received);state=payload;render();applyDrawResult();
    }catch(error){
      state={ticketCount:0,tickets:[],lastDraw:null,freeTicketAvailable:false,canBuy:false,reason:String(error&&error.message||'Lottery unavailable'),settings:{ticketPriceNano:150000000,maxTicketsPerUser:0,drawIntervalMinutes:1440}};render();
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
  function init(){document.addEventListener('click',handleTicketControls,true);ensureReels();load();startLiveSync();window.VexaLotteryRefresh=load}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('focus',function(){if(q('#home.active')&&!busy)load()});
})();
</script>
`;
