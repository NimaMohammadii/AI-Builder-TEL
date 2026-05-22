export const PREDICT_CANDLE_SCRIPT = `
(function(){
  function ready(fn){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn()}
  ready(function(){
    var root=document.getElementById('predictzone');
    if(!root||root.dataset.predictCandleReady==='1')return;
    root.dataset.predictCandleReady='1';
    var ws=null,market='',candles=[],candleSide='up',candleBusy=false,candleRound=null,candleTimer=0,uiTimer=0,lastCandleSlot=0;
    var HOUR_MS=60*60*1000,LOCK_MS=30*60*1000;

    function addStyles(){
      var css='#predictzone.predict-candle-mode .predict-zone-chart-line,#predictzone.predict-candle-mode .predict-zone-chart-fill,#predictzone.predict-candle-mode .predict-zone-chart-dot,#predictzone.predict-candle-mode .predict-zone-price-guide,#predictzone.predict-candle-mode .predict-zone-start-guide,#predictzone.predict-candle-mode .predict-zone-start-target,#predictzone.predict-candle-mode .predict-zone-live-bets{display:none!important}#predictzone .predict-candle-layer{position:absolute;inset:0;z-index:4;pointer-events:none;opacity:0;transition:opacity .18s ease}#predictzone.predict-candle-mode .predict-candle-layer{opacity:1}#predictzone .predict-candle-layer svg{width:100%;height:100%;display:block;overflow:visible}#predictzone .predict-candle-up{fill:rgba(58,255,150,.82);stroke:rgba(58,255,150,.95)}#predictzone .predict-candle-down{fill:rgba(255,92,118,.82);stroke:rgba(255,92,118,.95)}#predictzone .predict-candle-wick{stroke-width:1.4;stroke-linecap:round}#predictzone .predict-candle-caption{position:absolute;left:12px;top:10px;z-index:5;height:24px;display:none;align-items:center;padding:0 9px;border-radius:999px;background:rgba(255,255,255,.06);box-shadow:inset 0 1px 0 rgba(255,255,255,.10);color:rgba(255,255,255,.74);font-size:10px;font-weight:850;letter-spacing:.04em}#predictzone.predict-candle-mode .predict-candle-caption{display:inline-flex}#predictzone .predict-candle-lock-icon{display:inline-block;width:22px;height:22px;margin-right:1px;vertical-align:-5px;color:rgba(255,255,255,.92);filter:drop-shadow(0 2px 8px rgba(255,255,255,.18)) drop-shadow(0 6px 12px rgba(0,0,0,.38))}#predictzone.predict-candle-locked [data-predict-choice]{opacity:.46!important;filter:saturate(.7)!important}#predictzone .predict-candle-countdown{display:none}#predictzone.predict-candle-mode [data-predict-countdown]{display:none!important}#predictzone.predict-candle-mode .predict-candle-countdown{display:inline-flex!important;align-items:center!important;gap:0!important}#predictzone .predict-candle-result-strip{display:none;position:relative;margin:10px -2px 0;overflow:hidden;border-radius:20px}#predictzone.predict-candle-mode [data-predict-result]{display:none!important}#predictzone.predict-candle-mode .predict-candle-result-strip.show{display:block}#predictzone .predict-candle-result-strip:before,#predictzone .predict-candle-result-strip:after{content:"";position:absolute;top:0;bottom:0;width:28px;z-index:2;pointer-events:none}#predictzone .predict-candle-result-strip:before{left:0;background:linear-gradient(90deg,rgba(10,3,5,.86),rgba(10,3,5,0))}#predictzone .predict-candle-result-strip:after{right:0;background:linear-gradient(270deg,rgba(10,3,5,.86),rgba(10,3,5,0))}';
      var s=document.getElementById('predictCandleStyles');
      if(!s){s=document.createElement('style');s.id='predictCandleStyles';document.head.appendChild(s)}
      if(s.textContent!==css)s.textContent=css;
    }

    function activeMarket(){
      var menu=root.querySelector('.predict-zone-category-menu');
      var b=menu&&menu.querySelector('[data-vexa-predict-market].active,[data-predict-market].active');
      return b?(b.getAttribute('data-vexa-predict-market')||b.getAttribute('data-predict-market')||'bitcoin'):'bitcoin';
    }
    function userId(){
      var tg=window.Telegram&&window.Telegram.WebApp;
      var u=(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user)||{};
      return String(u.id||localStorage.getItem('ownerId')||'').trim();
    }
    function marketLabel(m){return m==='bitcoin'?'Bitcoin':m==='ethereum'?'Ethereum':m==='solana'?'Solana':m==='gold'?'Gold':m==='ton'?'TON':m.charAt(0).toUpperCase()+m.slice(1)}
    function decimalsFor(m){return m==='bitcoin'?0:m==='ton'?4:2}
    function priceText(v){var n=Number(v);if(!isFinite(n)||n<=0)return 'Loading';var d=decimalsFor(activeMarket());return '$'+n.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d})}
    function tonText(v){return Number(v||0).toLocaleString('en-US',{minimumFractionDigits:0,maximumFractionDigits:4})}
    function symbolFor(m){return m==='bitcoin'?'btcusdt':m==='ethereum'?'ethusdt':m==='solana'?'solusdt':m==='gold'?'paxgusdt':m==='ton'?'tonusdt':''}
    function chart(){return root.querySelector('[data-predict-chart]')}
    function statusEl(){return root.querySelector('[data-predict-bet-status]')}
    function countdownEl(){return ensureCandleCountdown()}
    function resultBox(){return ensureCandleResultBox()}

    function ensureCandleCountdown(){
      var old=root.querySelector('[data-predict-countdown]');if(!old)return null;
      var el=root.querySelector('.predict-candle-countdown');
      if(!el){el=document.createElement('small');el.className='predict-zone-countdown predict-candle-countdown';old.insertAdjacentElement('afterend',el)}
      return el;
    }
    function ensureCandleResultBox(){
      var old=root.querySelector('[data-predict-result]');if(!old)return null;
      var el=root.querySelector('.predict-candle-result-strip');
      if(!el){el=document.createElement('div');el.className='predict-candle-result-strip';old.insertAdjacentElement('afterend',el)}
      return el;
    }

    function setStatus(text,type){
      var el=statusEl();if(!el)return;
      el.textContent=text||'';
      el.classList.toggle('bad',type==='bad');
      el.classList.toggle('good',type==='good');
    }
    function updateVisibleBalance(payload){
      var controls=payload&&payload.userControls;
      if(!controls||controls.tonBalanceNano===undefined)return;
      var balance=Number(controls.tonBalanceNano);
      if(!Number.isFinite(balance))return;
      if(window.VexaTonBalance&&window.VexaTonBalance.write){window.VexaTonBalance.write(balance,0,false);return}
      try{window.dispatchEvent(new CustomEvent('vexa-ton-balance-game-change',{detail:{tonBalanceNano:balance}}))}catch(e){}
    }
    function candleSlot(now){now=Number(now||Date.now());var start=Math.floor(now/HOUR_MS)*HOUR_MS;return {start:start,lock:start+LOCK_MS,end:start+HOUR_MS}}
    function formatTime(ms){var s=Math.max(0,Math.ceil(Number(ms||0)/1000));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
    function lockSvg(){return '<svg class="predict-candle-lock-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7.5 10V8.1C7.5 5.7 9.4 4 12 4s4.5 1.7 4.5 4.1V10" stroke="currentColor" stroke-width="2.25" stroke-linecap="round"/><rect x="5" y="10" width="14" height="10" rx="3" stroke="currentColor" stroke-width="2.25"/><path d="M12 14.1v2.2" stroke="currentColor" stroke-width="2.25" stroke-linecap="round"/></svg>'}
    function isCandleLocked(){var slot=candleSlot(Date.now());return Date.now()>=slot.lock&&Date.now()<slot.end}
    function setCandleLocked(locked){
      root.classList.toggle('predict-candle-locked',!!locked);
      root.querySelectorAll('[data-predict-choice]').forEach(function(btn){btn.disabled=!!locked});
      var submit=root.querySelector('[data-predict-bet-submit]');
      if(submit&&root.dataset.predictMode==='candle')submit.disabled=!!locked||candleBusy;
    }
    function updateCandleTimer(){
      if(root.dataset.predictMode!=='candle')return;
      var cd=countdownEl();if(!cd)return;
      var now=Date.now(),slot=candleSlot(now),remaining=Math.max(0,slot.end-now),locked=now>=slot.lock&&now<slot.end;
      if(lastCandleSlot&&lastCandleSlot!==slot.start){candleRound=null;loadCandleRound();start()}
      lastCandleSlot=slot.start;
      cd.innerHTML=(locked?lockSvg():'')+formatTime(remaining);
      setCandleLocked(locked);
    }
    function startCandleTimer(){
      if(candleTimer)clearInterval(candleTimer);
      updateCandleTimer();
      candleTimer=setInterval(updateCandleTimer,1000);
    }
    function stopCandleTimer(){if(candleTimer){clearInterval(candleTimer);candleTimer=0}}

    function ensureLayer(){
      var c=chart();if(!c)return null;
      var l=c.querySelector('.predict-candle-layer');
      if(!l){l=document.createElement('div');l.className='predict-candle-layer';l.innerHTML='<span class="predict-candle-caption">1H candle • guess close</span><svg viewBox="0 0 360 220" preserveAspectRatio="none" aria-hidden="true"></svg>';c.appendChild(l)}
      return l;
    }

    function applyCandleHeader(){
      if(root.dataset.predictMode!=='candle')return;
      var m=activeMarket(),latest=candles.length?candles[candles.length-1]:null;
      var q=root.querySelector('[data-predict-question]');
      if(q)q.textContent=marketLabel(m)+' candle close?';
      if(latest){
        var start=root.querySelector('.predict-zone-start-price'),live=root.querySelector('.predict-zone-live-price');
        if(start)start.textContent=priceText(latest.o);
        if(live)live.textContent=priceText(latest.c);
      }
    }

    function yy(v,min,max){return 24+((max-v)/(max-min||1))*172}
    function render(){
      var l=ensureLayer();if(!l)return;var svg=l.querySelector('svg');if(!svg)return;
      if(!candles.length){svg.innerHTML='';applyCandleHeader();return}
      var data=candles.slice(-18),hi=Math.max.apply(null,data.map(function(x){return x.h})),lo=Math.min.apply(null,data.map(function(x){return x.l})),pad=(hi-lo)*.12||1;hi+=pad;lo-=pad;
      var left=16,right=282,step=(right-left)/Math.max(1,data.length),body=Math.max(5,Math.min(10,step*.48)),html='';
      data.forEach(function(d,i){
        var x=left+i*step+step*.5,yo=yy(d.o,lo,hi),yc=yy(d.c,lo,hi),yh=yy(d.h,lo,hi),yl=yy(d.l,lo,hi),up=d.c>=d.o,cls=up?'predict-candle-up':'predict-candle-down',top=Math.min(yo,yc),h=Math.max(2,Math.abs(yc-yo));
        html+='<line class="predict-candle-wick '+cls+'" x1="'+x.toFixed(1)+'" x2="'+x.toFixed(1)+'" y1="'+yh.toFixed(1)+'" y2="'+yl.toFixed(1)+'"/>';
        html+='<rect class="'+cls+'" x="'+(x-body/2).toFixed(1)+'" y="'+top.toFixed(1)+'" width="'+body.toFixed(1)+'" height="'+h.toFixed(1)+'" rx="2"/>';
      });
      svg.innerHTML=html;applyCandleHeader();
    }

    function close(){if(ws){try{ws.onmessage=null;ws.onclose=null;ws.onerror=null;ws.close()}catch(e){}ws=null}}
    function start(){
      var sym=symbolFor(activeMarket());
      if(!sym){close();candles=[];render();return}
      if(market===sym&&ws&&ws.readyState===1){applyCandleHeader();loadCandleRound();return}
      market=sym;close();candles=[];render();loadCandleRound();
      fetch('https://api.binance.com/api/v3/klines?symbol='+sym.toUpperCase()+'&interval=1h&limit=18',{cache:'default'}).then(function(r){return r.json()}).then(function(d){
        if(Array.isArray(d)){candles=d.map(function(k){return{o:+k[1],h:+k[2],l:+k[3],c:+k[4]}}).filter(function(x){return x.o&&x.h&&x.l&&x.c});render()}
      }).catch(function(){});
      try{ws=new WebSocket('wss://stream.binance.com:9443/ws/'+sym+'@kline_1h');ws.onmessage=function(e){try{var j=JSON.parse(e.data),k=j.k;if(!k)return;var item={o:+k.o,h:+k.h,l:+k.l,c:+k.c};if(!item.o||!item.h||!item.l||!item.c)return;if(k.x&&candles.length)candles.push(item);else if(candles.length)candles[candles.length-1]=item;else candles=[item];if(candles.length>18)candles=candles.slice(-18);render()}catch(_){}}}catch(e){}
    }

    function renderCandleResult(round){
      var box=resultBox();if(!box||!round)return;
      var all=[];(round.userBets||[]).forEach(function(b){all.push(b)});(round.recentUserBets||[]).forEach(function(b){if(!all.some(function(x){return x.id===b.id}))all.push(b)});
      var done=all.filter(function(b){return b&&b.status}).slice(0,20);
      box.className='predict-candle-result-strip';
      if(!done.length){box.innerHTML='';return}
      var html='<div class="predict-zone-history-track">';
      done.forEach(function(b){
        var side=String(b.side||'').toLowerCase()==='down'?'Red':'Green';
        var stake=Number(b.stakeTon||0),payout=Number(b.payoutTon||0),status=String(b.status||''),kind=status==='won'?'win':status==='lost'?'loss':status==='refunded'?'refund':'active';
        var amount=status==='won'?('+'+tonText(payout)):status==='lost'?('-'+tonText(stake)):tonText(payout||stake);
        html+='<span class="predict-zone-history-card '+kind+'">'+side+' '+amount+'</span>';
      });
      html+='</div>';
      box.className='predict-candle-result-strip show';
      box.innerHTML=html;
    }

    function loadCandleRound(){
      if(root.dataset.predictMode!=='candle')return Promise.resolve(null);
      return fetch('/app/api/predict-round?mode=candle&market='+encodeURIComponent(activeMarket())+'&userId='+encodeURIComponent(userId()),{cache:'no-store'})
        .then(function(r){return r.json()})
        .then(function(data){updateVisibleBalance(data);candleRound=data&&data.round;if(candleRound)renderCandleResult(candleRound);return data})
        .catch(function(){return null});
    }

    function paintButtons(mode){
      var up=root.querySelector('[data-predict-choice="up"]'),down=root.querySelector('[data-predict-choice="down"]'),title=root.querySelector('[data-predict-bet-title]'),q=root.querySelector('[data-predict-bet-question]');
      if(up){up.textContent=mode==='candle'?'Green':'Up';up.disabled=mode==='candle'&&isCandleLocked()}
      if(down){down.textContent=mode==='candle'?'Red':'Down';down.disabled=mode==='candle'&&isCandleLocked()}
      if(title){
        if(mode==='candle')title.textContent=candleSide==='down'?'Red':'Green';
        else if(title.textContent==='Green')title.textContent='Up';
        else if(title.textContent==='Red')title.textContent='Down';
      }
      if(q&&mode==='candle')q.textContent=marketLabel(activeMarket())+' candle close?';
    }

    function submitCandleBet(){
      if(candleBusy)return;
      if(isCandleLocked()){setStatus('This candle is locked. Wait for the next candle.','bad');return}
      var input=root.querySelector('[data-predict-bet-input]'),submit=root.querySelector('[data-predict-bet-submit]');
      var amount=Number(input&&input.value||0);
      if(!amount||!isFinite(amount)||amount<=0){setStatus('Enter a valid TON amount','bad');return}
      candleBusy=true;if(submit)submit.disabled=true;setStatus('Placing candle guess...','');
      fetch('/app/api/predict-bet',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({mode:'candle',market:activeMarket(),side:candleSide==='down'?'red':'green',userId:userId(),stakeTon:amount})})
        .then(function(r){return r.json().then(function(d){if(!r.ok||d.ok===false)throw new Error(d.error||'Could not place candle guess');return d})})
        .then(function(data){
          updateVisibleBalance(data);if(data&&data.round){candleRound=data.round;renderCandleResult(data.round)}
          setStatus('Candle guess placed','good');
          var sheet=root.querySelector('[data-predict-bet-sheet]');if(sheet){sheet.classList.remove('open');sheet.setAttribute('aria-hidden','true')}
          if(input)input.value='';
          return loadCandleRound();
        })
        .catch(function(error){setStatus(error&&error.message?error.message:'Could not place candle guess','bad');loadCandleRound()})
        .finally(function(){candleBusy=false;setCandleLocked(isCandleLocked())});
    }

    function setMode(mode){
      mode=mode==='candle'?'candle':'updown';
      if(root.dataset.predictMode===mode)return;
      addStyles();ensureCandleCountdown();ensureCandleResultBox();
      root.dataset.predictMode=mode;
      root.classList.toggle('predict-candle-mode',mode==='candle');
      root.classList.remove('predict-candle-locked');
      paintButtons(mode);
      if(mode==='candle'){lastCandleSlot=0;start();startCandleTimer();startUiLoop()}else{close();stopCandleTimer();stopUiLoop();setCandleLocked(false)}
    }

    function stopUiLoop(){if(uiTimer){clearInterval(uiTimer);uiTimer=0}}
    function startUiLoop(){
      if(uiTimer)return;
      function tick(){
        if(root.dataset.predictMode!=='candle'){stopUiLoop();return}
        applyCandleHeader();
      }
      tick();
      uiTimer=setInterval(tick,1000);
    }

    window.addEventListener('vexa-predict-mode-change',function(ev){setMode((ev&&ev.detail&&ev.detail.mode)==='candle'?'candle':'updown')});
    document.addEventListener('click',function(ev){
      var submit=ev.target&&ev.target.closest?ev.target.closest('#predictzone [data-predict-bet-submit]'):null;
      if(submit&&root.dataset.predictMode==='candle'){
        ev.preventDefault();ev.stopPropagation();if(ev.stopImmediatePropagation)ev.stopImmediatePropagation();submitCandleBet();return;
      }
      var choice=ev.target&&ev.target.closest?ev.target.closest('#predictzone [data-predict-choice]'):null;
      if(choice&&root.dataset.predictMode==='candle'){
        if(isCandleLocked()){ev.preventDefault();ev.stopPropagation();setStatus('This candle is locked. Wait for the next candle.','bad');return}
        candleSide=choice.getAttribute('data-predict-choice')==='down'?'down':'up';
        setTimeout(function(){paintButtons('candle')},20);
      }
      var marketBtn=ev.target&&ev.target.closest?ev.target.closest('#predictzone [data-vexa-predict-market],#predictzone [data-predict-market]'):null;
      if(marketBtn&&root.dataset.predictMode==='candle')setTimeout(function(){start();applyCandleHeader()},160);
    },true);
    document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden'){close();stopCandleTimer();stopUiLoop()}else if(root.dataset.predictMode==='candle')setTimeout(function(){start();startCandleTimer();startUiLoop()},160)});
    setMode('updown');
  });
})();
`;