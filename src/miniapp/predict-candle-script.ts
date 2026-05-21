export const PREDICT_CANDLE_SCRIPT = `
(function(){
  function ready(fn){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn()}
  ready(function(){
    var root=document.getElementById('predictzone');
    if(!root||root.dataset.predictCandleReady==='1')return;
    root.dataset.predictCandleReady='1';
    var ws=null,market='',candles=[],timerRaf=0,timerObserver=null,lastTimerHtml='',uiRaf=0;
    function addStyles(){
      if(document.getElementById('predictCandleStyles'))return;
      var s=document.createElement('style');
      s.id='predictCandleStyles';
      s.textContent='#predictzone.predict-candle-mode .predict-zone-chart-line,#predictzone.predict-candle-mode .predict-zone-chart-fill,#predictzone.predict-candle-mode .predict-zone-chart-dot,#predictzone.predict-candle-mode .predict-zone-price-guide,#predictzone.predict-candle-mode .predict-zone-start-guide,#predictzone.predict-candle-mode .predict-zone-start-target,#predictzone.predict-candle-mode .predict-zone-live-bets,#predictzone.predict-candle-mode [data-predict-result]{display:none!important}#predictzone .predict-candle-layer{position:absolute;inset:0;z-index:4;pointer-events:none;opacity:0;transition:opacity .18s ease}#predictzone.predict-candle-mode .predict-candle-layer{opacity:1}#predictzone .predict-candle-layer svg{width:100%;height:100%;display:block;overflow:visible}#predictzone .predict-candle-up{fill:rgba(58,255,150,.82);stroke:rgba(58,255,150,.95)}#predictzone .predict-candle-down{fill:rgba(255,92,118,.82);stroke:rgba(255,92,118,.95)}#predictzone .predict-candle-wick{stroke-width:1.4;stroke-linecap:round}#predictzone .predict-candle-caption{position:absolute;left:12px;top:10px;z-index:5;height:24px;display:none;align-items:center;padding:0 9px;border-radius:999px;background:rgba(255,255,255,.06);box-shadow:inset 0 1px 0 rgba(255,255,255,.10);color:rgba(255,255,255,.74);font-size:10px;font-weight:850;letter-spacing:.04em}#predictzone.predict-candle-mode .predict-candle-caption{display:inline-flex}#predictzone .predict-candle-lock-icon{display:none;width:17px;height:17px;margin-right:7px;vertical-align:-4px;opacity:1;filter:drop-shadow(0 1px 7px rgba(255,255,255,.18)) drop-shadow(0 3px 10px rgba(0,0,0,.38))}#predictzone.predict-candle-locked .predict-candle-lock-icon{display:inline-block}#predictzone.predict-candle-locked [data-predict-choice]{opacity:.48!important;filter:saturate(.65)!important}#predictzone .predict-candle-history{position:relative;margin:10px -2px 0;display:none;overflow:hidden;border-radius:20px}#predictzone.predict-candle-mode .predict-candle-history.show{display:block}#predictzone .predict-candle-history::before,#predictzone .predict-candle-history::after{content:"";position:absolute;top:0;bottom:0;width:28px;z-index:2;pointer-events:none}#predictzone .predict-candle-history::before{left:0;background:linear-gradient(90deg,rgba(10,3,5,.86),rgba(10,3,5,0))}#predictzone .predict-candle-history::after{right:0;background:linear-gradient(270deg,rgba(10,3,5,.86),rgba(10,3,5,0))}#predictzone .predict-candle-history-track{display:flex;gap:6px;overflow-x:auto;overflow-y:hidden;padding:0 24px 1px;scrollbar-width:none;-webkit-overflow-scrolling:touch}#predictzone .predict-candle-history-track::-webkit-scrollbar{display:none}#predictzone .predict-candle-history-card{flex:0 0 auto;min-width:92px;height:34px;border:0;border-radius:999px;background:rgba(255,255,255,.065);box-shadow:0 10px 24px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.10);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:0 10px;color:rgba(255,255,255,.74);font-size:11.2px;font-weight:850;letter-spacing:-.025em;white-space:nowrap}#predictzone .predict-candle-history-card.green{color:rgba(70,255,150,.96)}#predictzone .predict-candle-history-card.red{color:rgba(255,135,150,.94)}';
      document.head.appendChild(s);
    }
    function activeMarket(){
      var menu=root.querySelector('.predict-zone-category-menu');
      var b=menu&&menu.querySelector('[data-vexa-predict-market].active,[data-predict-market].active');
      return b?(b.getAttribute('data-vexa-predict-market')||b.getAttribute('data-predict-market')||'bitcoin'):'bitcoin';
    }
    function marketLabel(m){return m==='bitcoin'?'Bitcoin':m==='ethereum'?'Ethereum':m==='solana'?'Solana':m==='gold'?'Gold':m==='ton'?'TON':m.charAt(0).toUpperCase()+m.slice(1)}
    function decimalsFor(m){return m==='bitcoin'?0:m==='ton'?4:2}
    function priceText(v){var n=Number(v);if(!isFinite(n)||n<=0)return 'Loading';var d=decimalsFor(activeMarket());return '$'+n.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d})}
    function symbolFor(m){return m==='bitcoin'?'btcusdt':m==='ethereum'?'ethusdt':m==='solana'?'solusdt':m==='gold'?'paxgusdt':m==='ton'?'tonusdt':''}
    function chart(){return root.querySelector('[data-predict-chart]')}
    function ensureLayer(){
      var c=chart();if(!c)return null;
      var l=c.querySelector('.predict-candle-layer');
      if(!l){l=document.createElement('div');l.className='predict-candle-layer';l.innerHTML='<span class="predict-candle-caption">1H candle • guess close</span><svg viewBox="0 0 360 220" preserveAspectRatio="none" aria-hidden="true"></svg>';c.appendChild(l)}
      return l;
    }
    function ensureHistory(){
      var box=root.querySelector('.predict-candle-history');
      if(box)return box;
      var anchor=root.querySelector('[data-predict-result]');
      if(!anchor)return null;
      box=document.createElement('div');
      box.className='predict-candle-history';
      box.setAttribute('data-predict-candle-history','1');
      anchor.insertAdjacentElement('afterend',box);
      return box;
    }
    function applyCandleHeader(){
      if(root.dataset.predictMode!=='candle')return;
      var m=activeMarket(),latest=candles.length?candles[candles.length-1]:null;
      var q=root.querySelector('[data-predict-question]');
      if(q)q.textContent=marketLabel(m)+' candle close?';
      if(latest){var start=root.querySelector('.predict-zone-start-price'),live=root.querySelector('.predict-zone-live-price');if(start)start.textContent=priceText(latest.o);if(live)live.textContent=priceText(latest.c)}
      renderCandleHistory();
    }
    function renderCandleHistory(){
      if(root.dataset.predictMode!=='candle')return;
      var box=ensureHistory();if(!box)return;
      var closed=candles.length>1?candles.slice(-13,-1):[];
      if(!closed.length){box.className='predict-candle-history';box.innerHTML='';return}
      var html='<div class="predict-candle-history-track">';
      closed.forEach(function(c){var green=Number(c.c)>=Number(c.o);html+='<span class="predict-candle-history-card '+(green?'green':'red')+'">'+(green?'Green':'Red')+'</span>'});
      html+='</div>';
      if(box.innerHTML!==html)box.innerHTML=html;
      box.className='predict-candle-history show';
    }
    function clearCandleAutoHistory(){var box=root.querySelector('.predict-candle-history');if(box){box.className='predict-candle-history';box.innerHTML=''}}
    function startUiLoop(){if(uiRaf)return;function loop(){if(root.dataset.predictMode!=='candle'){uiRaf=0;return}applyCandleHeader();uiRaf=requestAnimationFrame(loop)}uiRaf=requestAnimationFrame(loop)}
    function yy(v,min,max){return 24+((max-v)/(max-min||1))*172}
    function render(){
      var l=ensureLayer();if(!l)return;var svg=l.querySelector('svg');if(!svg)return;
      if(!candles.length){svg.innerHTML='';applyCandleHeader();return}
      var data=candles.slice(-18),hi=Math.max.apply(null,data.map(function(x){return x.h})),lo=Math.min.apply(null,data.map(function(x){return x.l})),pad=(hi-lo)*.12||1;hi+=pad;lo-=pad;
      var left=16,right=282,step=(right-left)/Math.max(1,data.length),body=Math.max(5,Math.min(10,step*.48)),html='';
      data.forEach(function(d,i){var x=left+i*step+step*.5,yo=yy(d.o,lo,hi),yc=yy(d.c,lo,hi),yh=yy(d.h,lo,hi),yl=yy(d.l,lo,hi),up=d.c>=d.o,cls=up?'predict-candle-up':'predict-candle-down',top=Math.min(yo,yc),h=Math.max(2,Math.abs(yc-yo));html+='<line class="predict-candle-wick '+cls+'" x1="'+x.toFixed(1)+'" x2="'+x.toFixed(1)+'" y1="'+yh.toFixed(1)+'" y2="'+yl.toFixed(1)+'"/>';html+='<rect class="'+cls+'" x="'+(x-body/2).toFixed(1)+'" y="'+top.toFixed(1)+'" width="'+body.toFixed(1)+'" height="'+h.toFixed(1)+'" rx="2"/>'});
      svg.innerHTML=html;applyCandleHeader();
    }
    function fmt(ms){var s=Math.max(0,Math.ceil(ms/1000));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
    function stopTimer(){if(timerRaf){cancelAnimationFrame(timerRaf);timerRaf=0}if(timerObserver){try{timerObserver.disconnect()}catch(e){}timerObserver=null}lastTimerHtml=''}
    function candleStartMs(){return Math.floor(Date.now()/3600000)*3600000}
    function candleEndMs(){return candleStartMs()+3600000}
    function candleLockMs(){return candleStartMs()+1800000}
    function lockSvg(){return '<svg class="predict-candle-lock-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7.5 10V8.2C7.5 5.8 9.4 4 12 4s4.5 1.8 4.5 4.2V10" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><rect x="5" y="10" width="14" height="10" rx="3" stroke="currentColor" stroke-width="2.2"/><path d="M12 14v2.3" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>'}
    function setLocked(locked){root.classList.toggle('predict-candle-locked',!!locked);root.querySelectorAll('[data-predict-choice]').forEach(function(b){b.disabled=!!locked})}
    function candleTimerHtml(){var now=Date.now(),locked=now>=candleLockMs();setLocked(locked);return (locked?lockSvg():'')+fmt(candleEndMs()-now)}
    function writeCandleTimer(){
      if(root.dataset.predictMode!=='candle')return;
      var cd=root.querySelector('[data-predict-countdown]');if(!cd)return;
      var html=candleTimerHtml();lastTimerHtml=html;
      if(cd.innerHTML!==html)cd.innerHTML=html;
    }
    function observeTimer(){
      if(timerObserver)return;
      var cd=root.querySelector('[data-predict-countdown]');if(!cd||!window.MutationObserver)return;
      timerObserver=new MutationObserver(function(){
        if(root.dataset.predictMode==='candle'&&cd.innerHTML!==lastTimerHtml)requestAnimationFrame(writeCandleTimer);
      });
      timerObserver.observe(cd,{childList:true,characterData:true,subtree:true});
    }
    function timerLoop(){
      if(root.dataset.predictMode!=='candle'){setLocked(false);stopTimer();return}
      writeCandleTimer();
      setTimeout(writeCandleTimer,0);
      observeTimer();
      timerRaf=requestAnimationFrame(timerLoop);
    }
    function startTimer(){stopTimer();timerRaf=requestAnimationFrame(timerLoop)}
    function close(){if(ws){try{ws.onmessage=null;ws.onclose=null;ws.onerror=null;ws.close()}catch(e){}ws=null}}
    function start(){
      var sym=symbolFor(activeMarket());
      if(!sym){close();candles=[];render();return}
      if(market===sym&&ws&&ws.readyState===1){applyCandleHeader();return}
      market=sym;close();candles=[];render();
      fetch('https://api.binance.com/api/v3/klines?symbol='+sym.toUpperCase()+'&interval=1h&limit=18',{cache:'default'}).then(function(r){return r.json()}).then(function(d){if(Array.isArray(d)){candles=d.map(function(k){return{o:+k[1],h:+k[2],l:+k[3],c:+k[4]}}).filter(function(x){return x.o&&x.h&&x.l&&x.c});render()}}).catch(function(){});
      try{ws=new WebSocket('wss://stream.binance.com:9443/ws/'+sym+'@kline_1h');ws.onmessage=function(e){try{var j=JSON.parse(e.data),k=j.k;if(!k)return;var item={o:+k.o,h:+k.h,l:+k.l,c:+k.c};if(!item.o||!item.h||!item.l||!item.c)return;if(k.x&&candles.length)candles.push(item);else if(candles.length)candles[candles.length-1]=item;else candles=[item];if(candles.length>18)candles=candles.slice(-18);render()}catch(_){}}}catch(e){}
    }
    function paintButtons(mode){
      var up=root.querySelector('[data-predict-choice="up"]'),down=root.querySelector('[data-predict-choice="down"]'),title=root.querySelector('[data-predict-bet-title]');
      if(up)up.textContent=mode==='candle'?'Green':'Up';
      if(down)down.textContent=mode==='candle'?'Red':'Down';
      if(title){if(mode==='candle'&&title.textContent==='Up')title.textContent='Green';else if(mode==='candle'&&title.textContent==='Down')title.textContent='Red'}
    }
    function installFetchPatch(){
      if(window.__vexaPredictCandleFetchPatch)return;window.__vexaPredictCandleFetchPatch=1;
      var nativeFetch=window.fetch&&window.fetch.bind(window);if(!nativeFetch)return;
      window.fetch=function(input,init){
        try{
          var url=String((input&&input.url)||input||''),isPredict=url.indexOf('/app/api/predict-')>=0,mode=root.dataset.predictMode;
          if(isPredict&&mode==='candle'){
            if(url.indexOf('/app/api/predict-round')>=0||url.indexOf('/app/api/predict-settle')>=0){var u=new URL(url,location.href);u.searchParams.set('mode','candle');input=u.pathname+u.search}
            if(url.indexOf('/app/api/predict-bet')>=0&&init&&init.body){var body=JSON.parse(String(init.body));body.mode='candle';if(body.side==='up')body.side='green';if(body.side==='down')body.side='red';init=Object.assign({},init,{body:JSON.stringify(body)})}
          }
        }catch(e){}
        return nativeFetch(input,init)
      }
    }
    function setMode(mode){addStyles();installFetchPatch();root.dataset.predictMode=mode;root.classList.toggle('predict-candle-mode',mode==='candle');paintButtons(mode);if(mode==='candle'){start();startTimer();startUiLoop()}else{close();setLocked(false);stopTimer();clearCandleAutoHistory()}}
    document.addEventListener('click',function(ev){
      var opt=ev.target&&ev.target.closest?ev.target.closest('#predictzone [data-predict-mode]'):null;
      if(opt){setTimeout(function(){setMode(opt.getAttribute('data-predict-mode')==='candle'?'candle':'updown')},0);return}
      var choice=ev.target&&ev.target.closest?ev.target.closest('#predictzone [data-predict-choice]'):null;
      if(choice&&root.dataset.predictMode==='candle')setTimeout(function(){var t=root.querySelector('[data-predict-bet-title]');if(t)t.textContent=choice.getAttribute('data-predict-choice')==='up'?'Green':'Red'},20);
      var marketBtn=ev.target&&ev.target.closest?ev.target.closest('#predictzone [data-vexa-predict-market],#predictzone [data-predict-market]'):null;
      if(marketBtn&&root.dataset.predictMode==='candle')setTimeout(function(){start();applyCandleHeader()},160);
    },true);
    document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden'){close();stopTimer()}else if(root.dataset.predictMode==='candle'){setTimeout(start,160);startTimer();startUiLoop()}});
    setMode('updown');
  });
})();
`;