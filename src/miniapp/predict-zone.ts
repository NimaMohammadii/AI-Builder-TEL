export const PREDICT_ZONE_SECTION = `<section id="predictzone" class="view predict-zone-view">
  <div class="predict-zone-simple-shell">
    <nav class="predict-zone-category-menu" aria-label="Predict Zone categories">
      <button type="button" class="predict-zone-category-card active"><span>Politics</span></button>
      <button type="button" class="predict-zone-category-card"><span>Sports</span></button>
      <button type="button" class="predict-zone-category-card"><span>Fun</span></button>
      <button type="button" class="predict-zone-category-card"><span>Live</span></button>
      <button type="button" class="predict-zone-category-card"><span>Crypto</span></button>
      <button type="button" class="predict-zone-category-card"><span>Weather</span></button>
      <button type="button" class="predict-zone-category-card"><span>Finance</span></button>
    </nav>
    <article class="predict-zone-glass-card predict-zone-btc-preview-card">
      <div class="predict-zone-card-top">
        <span></span>
        <small class="predict-zone-countdown">05:00</small>
      </div>
      <h2>Will Bitcoin go up or down?</h2>
      <div class="predict-zone-live-meta" aria-label="Bitcoin preview price">
        <div><span>Start</span><strong>$102,400</strong></div>
        <div><span>Live</span><strong class="predict-zone-live-price">$102,618</strong></div>
      </div>
      <div class="predict-zone-chart-preview" data-predict-chart aria-label="Bitcoin live chart preview">
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
      var line=chart.querySelector('.predict-zone-chart-line');
      var fill=chart.querySelector('.predict-zone-chart-fill');
      var dot=chart.querySelector('.predict-zone-chart-dot');
      var live=root.querySelector('.predict-zone-live-price');
      var prices=[102400,102446,102421,102516,102485,102571,102534,102618,102584,102733,102641,102704];
      var width=360;
      var height=220;
      var padX=14;
      var padY=24;
      function formatPrice(value){return '$'+Math.round(value).toLocaleString('en-US');}
      function pointList(values){
        var min=Math.min.apply(null,values);
        var max=Math.max.apply(null,values);
        if(max===min){max=min+1;}
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
      function render(){
        var points=pointList(prices);
        var lineD=smoothPath(points);
        var first=points[0];
        var last=points[points.length-1];
        line.setAttribute('d',lineD);
        fill.setAttribute('d',lineD+' L '+last.x.toFixed(1)+' '+height+' L '+first.x.toFixed(1)+' '+height+' Z');
        dot.style.left=(last.x/width*100)+'%';
        dot.style.top=(last.y/height*100)+'%';
        if(live){live.textContent=formatPrice(last.value);}
      }
      function tick(){
        var last=prices[prices.length-1];
        var drift=(Math.random()-.47)*95;
        prices.push(Math.max(100,last+drift));
        if(prices.length>18)prices.shift();
        render();
      }
      render();
      setInterval(tick,1500);
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setupPredictChart);else setupPredictChart();
  })();</script>
</section>`;