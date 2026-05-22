export const PREDICT_CANDLE_SCRIPT = `
(function(){
  function ready(fn){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn()}
  ready(function(){
    var root=document.getElementById('predictzone');
    if(!root||root.dataset.predictCandleReady==='1')return;
    root.dataset.predictCandleReady='1';
    var ws=null,market='',candles=[];

    function addStyles(){
      var css='#predictzone.predict-candle-mode .predict-zone-chart-line,#predictzone.predict-candle-mode .predict-zone-chart-fill,#predictzone.predict-candle-mode .predict-zone-chart-dot,#predictzone.predict-candle-mode .predict-zone-price-guide,#predictzone.predict-candle-mode .predict-zone-start-guide,#predictzone.predict-candle-mode .predict-zone-start-target,#predictzone.predict-candle-mode .predict-zone-live-bets{display:none!important}#predictzone .predict-candle-layer{position:absolute;inset:0;z-index:4;pointer-events:none;opacity:0;transition:opacity .18s ease}#predictzone.predict-candle-mode .predict-candle-layer{opacity:1}#predictzone .predict-candle-layer svg{width:100%;height:100%;display:block;overflow:visible}#predictzone .predict-candle-up{fill:rgba(58,255,150,.82);stroke:rgba(58,255,150,.95)}#predictzone .predict-candle-down{fill:rgba(255,92,118,.82);stroke:rgba(255,92,118,.95)}#predictzone .predict-candle-wick{stroke-width:1.4;stroke-linecap:round}#predictzone .predict-candle-caption{position:absolute;left:12px;top:10px;z-index:5;height:24px;display:none;align-items:center;padding:0 9px;border-radius:999px;background:rgba(255,255,255,.06);box-shadow:inset 0 1px 0 rgba(255,255,255,.10);color:rgba(255,255,255,.74);font-size:10px;font-weight:850;letter-spacing:.04em}#predictzone.predict-candle-mode .predict-candle-caption{display:inline-flex}';
      var s=document.getElementById('predictCandleStyles');
      if(!s){s=document.createElement('style');s.id='predictCandleStyles';document.head.appendChild(s)}
      if(s.textContent!==css)s.textContent=css;
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
      if(market===sym&&ws&&ws.readyState===1){applyCandleHeader();return}
      market=sym;close();candles=[];render();
      fetch('https://api.binance.com/api/v3/klines?symbol='+sym.toUpperCase()+'&interval=1h&limit=18',{cache:'default'}).then(function(r){return r.json()}).then(function(d){
        if(Array.isArray(d)){candles=d.map(function(k){return{o:+k[1],h:+k[2],l:+k[3],c:+k[4]}}).filter(function(x){return x.o&&x.h&&x.l&&x.c});render()}
      }).catch(function(){});
      try{ws=new WebSocket('wss://stream.binance.com:9443/ws/'+sym+'@kline_1h');ws.onmessage=function(e){try{var j=JSON.parse(e.data),k=j.k;if(!k)return;var item={o:+k.o,h:+k.h,l:+k.l,c:+k.c};if(!item.o||!item.h||!item.l||!item.c)return;if(k.x&&candles.length)candles.push(item);else if(candles.length)candles[candles.length-1]=item;else candles=[item];if(candles.length>18)candles=candles.slice(-18);render()}catch(_){}}}catch(e){}
    }

    function paintButtons(mode){
      var up=root.querySelector('[data-predict-choice="up"]'),down=root.querySelector('[data-predict-choice="down"]'),title=root.querySelector('[data-predict-bet-title]');
      if(up){up.textContent=mode==='candle'?'Green':'Up';up.disabled=false}
      if(down){down.textContent=mode==='candle'?'Red':'Down';down.disabled=false}
      if(title){
        if(mode==='candle'&&title.textContent==='Up')title.textContent='Green';
        else if(mode==='candle'&&title.textContent==='Down')title.textContent='Red';
        else if(mode!=='candle'&&title.textContent==='Green')title.textContent='Up';
        else if(mode!=='candle'&&title.textContent==='Red')title.textContent='Down';
      }
    }

    function setMode(mode){
      mode=mode==='candle'?'candle':'updown';
      if(root.dataset.predictMode===mode)return;
      addStyles();
      root.dataset.predictMode=mode;
      root.classList.toggle('predict-candle-mode',mode==='candle');
      root.classList.remove('predict-candle-locked');
      paintButtons(mode);
      if(mode==='candle')start();else close();
    }

    window.addEventListener('vexa-predict-mode-change',function(ev){setMode((ev&&ev.detail&&ev.detail.mode)==='candle'?'candle':'updown')});
    document.addEventListener('click',function(ev){
      var choice=ev.target&&ev.target.closest?ev.target.closest('#predictzone [data-predict-choice]'):null;
      if(choice&&root.dataset.predictMode==='candle')setTimeout(function(){var t=root.querySelector('[data-predict-bet-title]');if(t)t.textContent=choice.getAttribute('data-predict-choice')==='up'?'Green':'Red'},20);
      var marketBtn=ev.target&&ev.target.closest?ev.target.closest('#predictzone [data-vexa-predict-market],#predictzone [data-predict-market]'):null;
      if(marketBtn&&root.dataset.predictMode==='candle')setTimeout(function(){start();applyCandleHeader()},160);
    },true);
    document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')close();else if(root.dataset.predictMode==='candle')setTimeout(start,160)});
    setMode('updown');
  });
})();
`;