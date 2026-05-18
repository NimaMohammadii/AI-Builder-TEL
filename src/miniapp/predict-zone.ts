export const PREDICT_ZONE_SECTION = `<section id="predictzone" class="view predict-zone-view">
  <div class="predict-zone-simple-shell">
    <nav class="predict-zone-category-menu" aria-label="Predict Zone categories">
      <button type="button" class="predict-zone-category-card active" data-predict-market="bitcoin"><span>Bitcoin</span></button>
      <button type="button" class="predict-zone-category-card" data-predict-market="ton"><span>TON</span></button>
      <button type="button" class="predict-zone-category-card" data-predict-market="football"><span>Football</span></button>
      <button type="button" class="predict-zone-category-card" data-predict-market="politics"><span>Politics</span></button>
      <button type="button" class="predict-zone-category-card" data-predict-market="fun"><span>Fun</span></button>
    </nav>
    <article class="predict-zone-glass-card predict-zone-btc-preview-card" data-predict-card>
      <div class="predict-zone-card-top">
        <span></span>
        <small class="predict-zone-countdown">05:00</small>
      </div>
      <h2 data-predict-question>Will Bitcoin go up or down?</h2>
      <div class="predict-zone-live-meta" aria-label="Predict preview price">
        <div><span>Start</span><strong class="predict-zone-start-price">$102,400</strong></div>
        <div><span>Live</span><strong class="predict-zone-live-price">$102,618</strong></div>
      </div>
      <div class="predict-zone-chart-preview" data-predict-chart aria-label="Live chart preview">
        <div class="predict-zone-chart-grid"></div>
        <svg viewBox="0 0 360 220" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="predictBtcLine" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stop-color="rgba(255,255,255,.22)"/>
              <stop offset="48%" stop-color="rgba(255,255,255,.95)"/>
              <stop offset="100%" stop-color="rgba(255,255,255,.42)"/>
            </linearGradient>
            <linearGradient id="predictBtcFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="rgba(255,255,255,.18)"/>
              <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
            </linearGradient>
          </defs>
          <path class="predict-zone-chart-fill" d=""/>
          <path class="predict-zone-chart-line" d=""/>
        </svg>
        <span class="predict-zone-chart-dot"></span>
        <div class="predict-zone-chart-timer"><span></span></div>
      </div>
      <div class="predict-zone-actions">
        <button type="button" class="predict-zone-choice predict-zone-choice-up">Up</button>
        <button type="button" class="predict-zone-choice predict-zone-choice-down">Down</button>
      </div>
    </article>
  </div>
  <script>(function(){
    var tg=window.Telegram&&window.Telegram.WebApp;
    if(tg&&tg.BackButton){
      var back=tg.BackButton;
      function goPlayZone(){var btn=document.querySelector('[data-view="playzone"]');if(btn)btn.click();try{back.hide()}catch(e){}}
      try{back.onClick(goPlayZone)}catch(e){}
      function sync(){var page=document.getElementById('predictzone');try{if(page&&page.classList.contains('active'))back.show();else back.hide()}catch(e){}}
      document.addEventListener('click',function(){setTimeout(sync,30)},true);
      document.addEventListener('DOMContentLoaded',sync);
      setTimeout(sync,200);
    }

    function setupPredictChart(){
      var root=document.getElementById('predictzone');
      if(!root)return;
      var chart=root.querySelector('[data-predict-chart]');
      if(!chart||chart.dataset.ready==='1')return;
      chart.dataset.ready='1';
      var tabs=root.querySelectorAll('[data-predict-market]');
      var card=root.querySelector('[data-predict-card]');
      var question=root.querySelector('[data-predict-question]');
      var line=chart.querySelector('.predict-zone-chart-line');
      var fill=chart.querySelector('.predict-zone-chart-fill');
      var dot=chart.querySelector('.predict-zone-chart-dot');
      var live=root.querySelector('.predict-zone-live-price');
      var start=root.querySelector('.predict-zone-start-price');
      var markets={
        bitcoin:{label:'Bitcoin',question:'Will Bitcoin go up or down?',symbol:'BTCUSDT',stream:'btcusdt@miniTicker',seed:102400,min:101850,max:103150,decimals:0},
        ton:{label:'TON',question:'Will TON go up or down?',symbol:'TONUSDT',stream:'tonusdt@miniTicker',seed:2.85,min:.5,max:12,decimals:4}
      };
      var activeMarket='bitcoin';
      var ws=null;
      var prices=[];
      var currentPrice=0;
      var targetPrice=0;
      var targetFramesLeft=0;
      var direction=1;
      var forwardFrames=0;
      var realFeedReady=false;
      var lastRealPrice=0;
      var width=360;
      var height=220;
      var padX=14;
      var padY=24;
      function market(){return markets[activeMarket]||markets.bitcoin;}
      function formatPrice(value){var m=market();return '$'+Number(value).toLocaleString('en-US',{minimumFractionDigits:m.decimals,maximumFractionDigits:m.decimals});}
      function clamp(value,min,max){return Math.max(min,Math.min(max,value));}
      function fallbackSeries(seed){
        prices=[];
        var step=seed>1000?1.8:.006;
        var waveSize=seed>1000?5:.018;
        for(var i=0;i<18;i++)prices.push(seed-step*9+i*step+Math.sin(i/2.8)*waveSize);
        currentPrice=prices[prices.length-1];
        targetPrice=currentPrice;
      }
      function pointList(values){
        var min=Math.min.apply(null,values);
        var max=Math.max.apply(null,values);
        var base=market().seed;
        var minRange=realFeedReady?(base>1000?45:.035):(base>1000?70:.06);
        var range=Math.max(minRange,max-min);
        var mid=(min+max)/2;
        min=mid-range/2;
        max=mid+range/2;
        return values.map(function(value,index){
          var x=padX+(index/(values.length-1))*(width-padX*2);
          var y=padY+((max-value)/(max-min))*(height-padY*2);
          return {x:x,y:y,value:value};
        });
      }
      function smoothPath(points){
        if(!points.length)return '';
        var d='M'+points[0].x.toFixed(1)+' '+points[0].y.toFixed(1);
        for(var i=0;i<points.length-1;i++){
          var current=points[i];
          var next=points[i+1];
          var midX=(current.x+next.x)/2;
          d+=' C '+midX.toFixed(1)+' '+current.y.toFixed(1)+' '+midX.toFixed(1)+' '+next.y.toFixed(1)+' '+next.x.toFixed(1)+' '+next.y.toFixed(1);
        }
        return d;
      }
      function seedWithRealPrice(price){
        var m=market();
        prices=[];
        var step=price>1000?1.8:.006;
        var waveSize=price>1000?5:.018;
        for(var i=0;i<18;i++)prices.push(price-step*9+i*step+Math.sin(i/2.8)*waveSize);
        currentPrice=price;
        targetPrice=price;
        if(start)start.textContent=formatPrice(price);
      }
      function render(){
        var points=pointList(prices);
        var lineD=smoothPath(points);
        var first=points[0];
        var last=points[points.length-1];
        line.setAttribute('d',lineD);
        fill.setAttribute('d',lineD+' L '+last.x.toFixed(1)+' '+height+' L '+first.x.toFixed(1)+' '+height+' Z');
        dot.style.left=(last.x/width*100)+'%';
        dot.style.top=(last.y/height*100)+'%';
        if(live)live.textContent=formatPrice(last.value);
      }
      function chooseFallbackTarget(){
        var m=market();
        if(Math.random()>.78)direction*=-1;
        var move=(m.seed>1000?(12+Math.random()*34):(.015+Math.random()*.05))*direction;
        targetPrice=clamp(currentPrice+move,m.min,m.max);
        targetFramesLeft=22+Math.floor(Math.random()*18);
      }
      function tick(){
        if(realFeedReady&&lastRealPrice>0)targetPrice=lastRealPrice;
        else if(targetFramesLeft<=0)chooseFallbackTarget();
        var ease=realFeedReady?.055:.045+Math.random()*.018;
        currentPrice=currentPrice+(targetPrice-currentPrice)*ease;
        if(!realFeedReady){
          currentPrice+=Math.sin(Date.now()/1500)*(market().seed>1000?.55:.0012);
          targetFramesLeft-=1;
        }
        forwardFrames+=1;
        if(forwardFrames>=4){
          prices.push(currentPrice);
          if(prices.length>24)prices.shift();
          forwardFrames=0;
        }else prices[prices.length-1]=currentPrice;
        render();
      }
      function closeSocket(){if(ws){try{ws.onclose=null;ws.close()}catch(e){}ws=null;}}
      function connectBinance(){
        closeSocket();
        var m=market();
        if(!('WebSocket' in window)||!m.stream)return;
        try{
          ws=new WebSocket('wss://stream.binance.com:9443/ws/'+m.stream);
          ws.onmessage=function(event){
            try{
              var data=JSON.parse(event.data);
              var price=Number(data.c);
              if(!price||!isFinite(price))return;
              lastRealPrice=price;
              if(!realFeedReady){realFeedReady=true;seedWithRealPrice(price);render();}
            }catch(e){}
          };
          ws.onclose=function(){setTimeout(function(){if(markets[activeMarket]&&markets[activeMarket].stream)connectBinance()},4000)};
          ws.onerror=function(){try{ws.close()}catch(e){}};
        }catch(e){}
      }
      function setMarket(key){
        var m=markets[key];
        activeMarket=m?key:'bitcoin';
        m=market();
        tabs.forEach(function(tab){tab.classList.toggle('active',tab.getAttribute('data-predict-market')===activeMarket)});
        if(question)question.textContent=m.question;
        if(card)card.style.display=m.stream?'':'none';
        realFeedReady=false;lastRealPrice=0;targetFramesLeft=0;forwardFrames=0;direction=1;
        fallbackSeries(m.seed);
        if(start)start.textContent=formatPrice(m.seed);
        render();
        if(m.stream)connectBinance();else closeSocket();
      }
      tabs.forEach(function(tab){tab.addEventListener('click',function(){setMarket(tab.getAttribute('data-predict-market'))})});
      setMarket('bitcoin');
      setInterval(tick,320);
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setupPredictChart);else setupPredictChart();
  })();</script>
</section>`;