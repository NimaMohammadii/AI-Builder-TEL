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
      <h2 class="predict-zone-question-row">
        <span class="predict-zone-question-image" data-predict-question-image aria-label="Prediction image upload slot"></span>
        <span data-predict-question>Bitcoin go up or down?</span>
      </h2>
      <div class="predict-zone-live-meta" aria-label="Predict preview price">
        <div><span>Start</span><strong class="predict-zone-start-price">$102,400</strong></div>
        <div><span>Live</span><strong class="predict-zone-live-price">$102,618</strong></div>
      </div>
      <div class="predict-zone-chart-preview" data-predict-chart aria-label="Live chart preview">
        <div class="predict-zone-chart-grid">
          <span data-chart-grid-line="0"></span>
          <span data-chart-grid-line="1"></span>
          <span data-chart-grid-line="2"></span>
          <span data-chart-grid-line="3"></span>
          <span data-chart-grid-line="4"></span>
        </div>
        <div class="predict-zone-price-axis" aria-hidden="true">
          <span data-price-axis="0"></span>
          <span data-price-axis="1"></span>
          <span data-price-axis="2"></span>
          <span data-price-axis="3"></span>
          <span data-price-axis="4"></span>
        </div>
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
        <span class="predict-zone-price-guide"></span>
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
      function syncBack(){var page=document.getElementById('predictzone');try{if(page&&page.classList.contains('active'))back.show();else back.hide()}catch(e){}}
      document.addEventListener('click',function(){setTimeout(syncBack,30)},true);
      document.addEventListener('DOMContentLoaded',syncBack);
      setTimeout(syncBack,200);
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
      var questionImage=root.querySelector('[data-predict-question-image]');
      var line=chart.querySelector('.predict-zone-chart-line');
      var fill=chart.querySelector('.predict-zone-chart-fill');
      var dot=chart.querySelector('.predict-zone-chart-dot');
      var priceGuide=chart.querySelector('.predict-zone-price-guide');
      var axisLabels=chart.querySelectorAll('[data-price-axis]');
      var gridLines=chart.querySelectorAll('[data-chart-grid-line]');
      var live=root.querySelector('.predict-zone-live-price');
      var start=root.querySelector('.predict-zone-start-price');
      var markets={
        bitcoin:{label:'Bitcoin',question:'Bitcoin go up or down?',symbol:'BTCUSDT',stream:'btcusdt@miniTicker',seed:102400,min:101850,max:103150,decimals:0,axisStep:5,axisRange:20,imageUrl:''},
        ton:{label:'TON',question:'TON go up or down?',symbol:'TONUSDT',stream:'tonusdt@miniTicker',seed:2.85,min:.5,max:12,decimals:4,axisStep:.005,axisRange:.02,imageUrl:''}
      };
      var activeMarket='bitcoin';
      var ws=null;
      var rafId=0;
      var reconnectTimer=null;
      var prices=[];
      var currentPrice=0;
      var targetPrice=0;
      var targetFramesLeft=0;
      var direction=1;
      var realFeedReady=false;
      var lastRealPrice=0;
      var axisCenter=0;
      var axisTarget=0;
      var tailY=null;
      var lastFrameTime=0;
      var lastPointTime=0;
      var pointInterval=3000;
      var width=360;
      var height=220;
      var padLeft=14;
      var padRight=78;
      var padY=24;
      function market(){return markets[activeMarket]||markets.bitcoin;}
      function isPredictActive(){return root.classList.contains('active')&&document.visibilityState!=='hidden';}
      function formatPrice(value){var m=market();return '$'+Number(value).toLocaleString('en-US',{minimumFractionDigits:m.decimals,maximumFractionDigits:m.decimals});}
      function clamp(value,min,max){return Math.max(min,Math.min(max,value));}
      function roundToStep(value,step){return Math.round(value/step)*step;}
      function setAxisInstant(price){var m=market();axisCenter=roundToStep(price,m.axisStep||1);axisTarget=axisCenter;}
      function setAxisTarget(price){var m=market();axisTarget=roundToStep(price,m.axisStep||1);if(!axisCenter)axisCenter=axisTarget;}
      function easeAxis(delta){var speed=Math.min(.26,delta/900);axisCenter=axisCenter+(axisTarget-axisCenter)*speed;if(Math.abs(axisTarget-axisCenter)<(market().axisStep||1)*.02)axisCenter=axisTarget;}
      function fallbackSeries(seed){
        prices=[];
        var step=seed>1000?1.8:.006;
        var waveSize=seed>1000?5:.018;
        for(var i=0;i<22;i++)prices.push(seed-step*12+i*step+Math.sin(i/2.8)*waveSize);
        currentPrice=seed+Math.sin(22/2.8)*waveSize;
        targetPrice=currentPrice;
        tailY=null;
        setAxisInstant(currentPrice);
      }
      function scaleInfo(delta){
        var m=market();
        var range=m.axisRange||50;
        if(!axisCenter)setAxisInstant(currentPrice||m.seed);
        if(currentPrice>axisTarget+range*.42||currentPrice<axisTarget-range*.42)setAxisTarget(currentPrice);
        easeAxis(delta||16);
        return {min:axisCenter-range/2,max:axisCenter+range/2};
      }
      function priceToY(value,scale){
        var y=padY+((scale.max-value)/(scale.max-scale.min))*(height-padY*2);
        return clamp(y,padY,height-padY);
      }
      function pointList(values,scale,progress){
        var count=values.length;
        var plotWidth=width-padLeft-padRight;
        var totalSlots=Math.max(22,count+1);
        var step=plotWidth/(totalSlots-1);
        var rightEdge=width-padRight;
        var history=values.map(function(value,index){
          var distanceFromHead=(count-index)+progress;
          var x=rightEdge-(distanceFromHead*step);
          var y=priceToY(value,scale);
          return {x:x,y:y,value:value};
        });
        history.push({x:rightEdge,y:priceToY(currentPrice,scale),value:currentPrice,live:true});
        return history;
      }
      function pinTailToLeft(points,delta){
        var leftEdge=0;
        var rightEdge=width-padRight;
        var clipped=[];
        for(var i=0;i<points.length;i++){
          var current=points[i];
          var previous=points[i-1];
          if(current.x<leftEdge)continue;
          if(previous&&previous.x<leftEdge&&current.x>=leftEdge){
            var ratio=(leftEdge-previous.x)/(current.x-previous.x||1);
            clipped.push({x:leftEdge,y:previous.y+(current.y-previous.y)*ratio,value:previous.value+(current.value-previous.value)*ratio});
          }
          if(current.x<=rightEdge)clipped.push(current);
        }
        var last=points[points.length-1];
        if(last&&last.x===rightEdge&&(!clipped.length||clipped[clipped.length-1]!==last))clipped.push(last);
        if(clipped.length>1){
          var targetY=clipped[0].y;
          if(tailY===null)tailY=targetY;
          var speed=Math.min(.2,(delta||16)/700);
          tailY=tailY+(targetY-tailY)*speed;
          clipped[0]={x:leftEdge,y:tailY,value:clipped[0].value};
          return clipped;
        }
        if(points.length>1){points[0]={x:leftEdge,y:points[0].y,value:points[0].value};}
        return points;
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
        prices=[];
        var step=price>1000?1.8:.006;
        var waveSize=price>1000?5:.018;
        for(var i=0;i<22;i++)prices.push(price-step*12+i*step+Math.sin(i/2.8)*waveSize);
        currentPrice=price;
        targetPrice=price;
        tailY=null;
        lastPointTime=performance.now();
        setAxisInstant(price);
        if(start)start.textContent=formatPrice(price);
      }
      function render(progress,delta){
        if(!prices.length)return;
        var scale=scaleInfo(delta);
        var points=pointList(prices,scale,progress||0);
        var visible=pinTailToLeft(points,delta);
        var lineD=smoothPath(visible);
        var first=visible[0];
        var last=visible[visible.length-1];
        var xPercent=last.x/width*100;
        var yPercent=last.y/height*100;
        line.setAttribute('d',lineD);
        fill.setAttribute('d',lineD+' L '+last.x.toFixed(1)+' '+height+' L '+first.x.toFixed(1)+' '+height+' Z');
        dot.style.left=xPercent+'%';
        dot.style.top=yPercent+'%';
        if(priceGuide){priceGuide.style.top=yPercent+'%';}
        axisLabels.forEach(function(label,index){
          var count=axisLabels.length;
          var ratio=count>1?index/(count-1):0;
          var price=scale.max-ratio*(scale.max-scale.min);
          var y=priceToY(price,scale);
          var top=(y/height*100)+'%';
          label.style.top=top;
          label.textContent=formatPrice(price);
          if(gridLines[index])gridLines[index].style.top=top;
        });
        if(live)live.textContent=formatPrice(last.value);
      }
      function chooseFallbackTarget(){
        var m=market();
        if(Math.random()>.78)direction*=-1;
        var move=(m.seed>1000?(12+Math.random()*34):(.015+Math.random()*.05))*direction;
        targetPrice=clamp(currentPrice+move,m.min,m.max);
        targetFramesLeft=22+Math.floor(Math.random()*18);
      }
      function advancePrice(delta){
        if(realFeedReady&&lastRealPrice>0)targetPrice=lastRealPrice;
        else if(targetFramesLeft<=0)chooseFallbackTarget();
        var ease=realFeedReady?.055:.045;
        currentPrice=currentPrice+(targetPrice-currentPrice)*(1-Math.pow(1-ease,delta/100));
        if(!realFeedReady){
          currentPrice+=Math.sin(Date.now()/1800)*(market().seed>1000?.16:.00038)*(delta/16);
          targetFramesLeft-=delta/120;
        }
      }
      function addPoint(){
        prices.push(currentPrice);
        if(prices.length>23)prices.shift();
      }
      function frame(now){
        if(!isPredictActive()){stopEngine();return;}
        if(!lastFrameTime)lastFrameTime=now;
        if(!lastPointTime)lastPointTime=now;
        var delta=Math.min(80,now-lastFrameTime);
        lastFrameTime=now;
        advancePrice(delta);
        var elapsed=now-lastPointTime;
        while(elapsed>=pointInterval){
          addPoint();
          lastPointTime+=pointInterval;
          elapsed=now-lastPointTime;
        }
        var progress=clamp(elapsed/pointInterval,0,1);
        render(progress,delta);
        rafId=requestAnimationFrame(frame);
      }
      function closeSocket(){
        if(reconnectTimer){clearTimeout(reconnectTimer);reconnectTimer=null;}
        if(ws){try{ws.onclose=null;ws.onerror=null;ws.onmessage=null;ws.close()}catch(e){}ws=null;}
      }
      function connectBinance(){
        closeSocket();
        var m=market();
        if(!isPredictActive()||!('WebSocket' in window)||!m.stream)return;
        try{
          ws=new WebSocket('wss://stream.binance.com:9443/ws/'+m.stream);
          ws.onmessage=function(event){
            try{
              var data=JSON.parse(event.data);
              var price=Number(data.c);
              if(!price||!isFinite(price))return;
              lastRealPrice=price;
              if(!realFeedReady){realFeedReady=true;seedWithRealPrice(price);render(0,16);}
            }catch(e){}
          };
          ws.onclose=function(){
            if(isPredictActive())reconnectTimer=setTimeout(connectBinance,6000);
          };
          ws.onerror=function(){try{ws.close()}catch(e){}};
        }catch(e){}
      }
      function startEngine(){
        var m=market();
        if(!m.stream||!isPredictActive())return;
        if(!rafId){lastFrameTime=0;lastPointTime=lastPointTime||performance.now();rafId=requestAnimationFrame(frame);}
        if(!ws)connectBinance();
      }
      function stopEngine(){
        if(rafId){cancelAnimationFrame(rafId);rafId=0;}
        closeSocket();
      }
      function syncEngine(){
        if(isPredictActive())startEngine();else stopEngine();
      }
      function applyMarketQuestion(m){
        if(question)question.textContent=m.question;
        if(questionImage){
          if(m.imageUrl){questionImage.style.backgroundImage='url("'+m.imageUrl.replace(/"/g,'')+'")';questionImage.classList.add('has-image');}
          else{questionImage.style.backgroundImage='';questionImage.classList.remove('has-image');}
        }
      }
      function loadPredictMarketImages(){
        fetch('/app/api/predict-markets',{cache:'no-store'}).then(function(response){return response.json()}).then(function(data){
          var loaded=data&&data.markets?data.markets:{};
          Object.keys(loaded).forEach(function(key){if(markets[key]&&loaded[key]&&loaded[key].imageUrl)markets[key].imageUrl=loaded[key].imageUrl;});
          applyMarketQuestion(market());
        }).catch(function(){});
      }
      function setMarket(key){
        var m=markets[key];
        activeMarket=m?key:'bitcoin';
        m=market();
        tabs.forEach(function(tab){tab.classList.toggle('active',tab.getAttribute('data-predict-market')===activeMarket)});
        applyMarketQuestion(m);
        if(card)card.style.display=m.stream?'':'none';
        stopEngine();
        realFeedReady=false;lastRealPrice=0;targetFramesLeft=0;direction=1;axisCenter=0;axisTarget=0;tailY=null;lastFrameTime=0;lastPointTime=performance.now();
        fallbackSeries(m.seed);
        if(start)start.textContent=formatPrice(m.seed);
        render(0,16);
        syncEngine();
      }
      tabs.forEach(function(tab){tab.addEventListener('click',function(){setMarket(tab.getAttribute('data-predict-market'))})});
      setMarket('bitcoin');
      loadPredictMarketImages();
      document.addEventListener('visibilitychange',syncEngine);
      document.addEventListener('click',function(){setTimeout(syncEngine,60)},true);
      if(window.MutationObserver){
        new MutationObserver(syncEngine).observe(root,{attributes:true,attributeFilter:['class']});
      }
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setupPredictChart);else setupPredictChart();
  })();</script>
</section>`;