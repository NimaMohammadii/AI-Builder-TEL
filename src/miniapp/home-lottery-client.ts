export const HOME_LOTTERY_CLIENT_SCRIPT = `
<script>
(function(){
  var state=null,busy=false,quantity=1,MAX_QTY=20,serverOffsetMs=0,pollStarted=false;
  function q(s,r){return (r||document).querySelector(s)}
  function initData(){var tg=window.Telegram&&window.Telegram.WebApp;return String(tg&&tg.initData||'')}
  function gram(nano){var value=Math.max(0,Number(nano)||0)/1000000000;return value.toFixed(2).replace(/\\.00$/,'').replace(/(\\.\\d)0$/,'$1')}
  function purchaseId(){try{if(crypto&&crypto.randomUUID)return 'lp_'+crypto.randomUUID().replace(/-/g,'')}catch(e){}return 'lp_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,12)}
  function haptic(kind){try{var tg=window.Telegram&&window.Telegram.WebApp;if(tg&&tg.HapticFeedback){if(kind==='success'||kind==='error')tg.HapticFeedback.notificationOccurred(kind);else tg.HapticFeedback.impactOccurred(kind||'light')}}catch(e){}}
  function syncServerClock(payload){var serverNow=Number(payload&&payload.serverNowMs);if(Number.isFinite(serverNow)&&serverNow>0)serverOffsetMs=serverNow-Date.now();window.VexaLotteryServerOffsetMs=serverOffsetMs}
  function liveServerNow(){return Date.now()+serverOffsetMs}
  function syncDrawTarget(){
    try{
      var raw=state&&state.round&&state.round.status==='open'?state.round.drawAt:(state&&state.settings&&state.settings.nextDrawAt||'');
      var target=Date.parse(String(raw||''));
      if(!Number.isFinite(target))return;
      var adjustedLocalTarget=target-serverOffsetMs;
      localStorage.setItem('vexaNextDrawAt',String(adjustedLocalTarget));
      window.VexaLotteryDrawAt=target;
      window.VexaLotteryServerNow=liveServerNow;
    }catch(e){}
  }
  function keepLegacyCountInSync(){try{localStorage.setItem('vexaFreeTickets',String(Math.max(0,Number(state&&state.ticketCount)||0)))}catch(e){}}
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
    syncDrawTarget();keepLegacyCountInSync();
  }
  async function load(){
    var data=initData();
    if(!data){state={ticketCount:0,tickets:[],freeTicketAvailable:true,canBuy:false,reason:'Open in Telegram',settings:{ticketPriceNano:150000000,maxTicketsPerUser:0}};render();return}
    try{
      var response=await fetch('/app/api/lottery/state',{cache:'no-store',headers:{'accept':'application/json','x-telegram-init-data':data}});
      var payload=await response.json().catch(function(){return null});
      if(!response.ok)throw new Error(payload&&payload.error||'Could not load Lottery');
      syncServerClock(payload);state=payload;render();
    }catch(error){
      state={ticketCount:0,tickets:[],freeTicketAvailable:false,canBuy:false,reason:String(error&&error.message||'Lottery unavailable'),settings:{ticketPriceNano:150000000,maxTicketsPerUser:0}};render();
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
      haptic('error');
      var button=q('#homeTicketButton');if(button){button.textContent=String(error&&error.message||'Could not get ticket');setTimeout(render,1200)}
    }finally{busy=false;setTimeout(render,0)}
  }
  function handleTicketControls(event){
    var target=event.target&&event.target.closest?event.target.closest('#homeTicketButton,#home [data-ticket-plus],#home [data-ticket-minus]'):null;
    if(!target)return;
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
    if(target.id==='homeTicketButton'){buy();return}
    if(busy||!state||!state.canBuy||remainingLimit()<=0&&Number(state.settings&&state.settings.maxTicketsPerUser)>0)return;
    if(target.hasAttribute('data-ticket-plus'))quantity=Math.min(maxSelectable(),quantity+1);
    if(target.hasAttribute('data-ticket-minus'))quantity=Math.max(1,quantity-1);
    haptic('light');render();
  }
  function startLiveSync(){if(pollStarted)return;pollStarted=true;setInterval(function(){if(!busy&&q('#home.active'))load()},5000)}
  function init(){document.addEventListener('click',handleTicketControls,true);load();startLiveSync();window.VexaLotteryRefresh=load}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('focus',function(){if(q('#home.active')&&!busy)load()});
})();
</script>
`;
