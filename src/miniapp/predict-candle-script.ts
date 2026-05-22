export const PREDICT_CANDLE_SCRIPT = `
(function(){
  function ready(fn){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn()}
  ready(function(){
    var root=document.getElementById('predictzone');
    if(!root||root.dataset.predictCandleReady==='1')return;
    root.dataset.predictCandleReady='1';

    function addStyles(){
      var css='#predictzone.predict-candle-mode .predict-zone-chart-line,#predictzone.predict-candle-mode .predict-zone-chart-fill,#predictzone.predict-candle-mode .predict-zone-chart-dot,#predictzone.predict-candle-mode .predict-zone-price-guide,#predictzone.predict-candle-mode .predict-zone-start-guide,#predictzone.predict-candle-mode .predict-zone-start-target,#predictzone.predict-candle-mode .predict-zone-live-bets{display:none!important}#predictzone .predict-candle-layer{position:absolute;inset:0;z-index:4;pointer-events:none;display:none}#predictzone.predict-candle-mode .predict-candle-layer{display:block}#predictzone .predict-candle-bar{position:absolute;width:7px;border-radius:3px;background:rgba(58,255,150,.82);box-shadow:0 0 12px rgba(58,255,150,.16)}#predictzone .predict-candle-bar.down{background:rgba(255,92,118,.82);box-shadow:0 0 12px rgba(255,92,118,.14)}#predictzone .predict-candle-bar:before{content:"";position:absolute;left:3px;width:1px;top:-12px;bottom:-12px;background:currentColor;opacity:.74}';
      var s=document.getElementById('predictCandleStyles');
      if(!s){s=document.createElement('style');s.id='predictCandleStyles';document.head.appendChild(s)}
      if(s.textContent!==css)s.textContent=css;
    }

    function activeMarketText(){
      var b=root.querySelector('.predict-zone-category-menu [data-predict-market].active,.predict-zone-category-menu [data-vexa-predict-market].active');
      return ((b&&b.textContent)||'Bitcoin').trim()||'Bitcoin';
    }

    function ensureLayer(){
      var chart=root.querySelector('[data-predict-chart]');
      if(!chart)return null;
      var layer=chart.querySelector('.predict-candle-layer');
      if(!layer){layer=document.createElement('div');layer.className='predict-candle-layer';chart.appendChild(layer)}
      return layer;
    }

    function drawCandles(){
      var layer=ensureLayer();
      if(!layer)return;
      layer.textContent='';
      var name=activeMarketText();
      var seed=0;
      for(var i=0;i<name.length;i++)seed+=name.charCodeAt(i)*(i+1);
      for(var j=0;j<18;j++){
        var a=Math.sin((j+seed)*.7)*38+Math.cos((j+seed)*.33)*18;
        var b=Math.sin((j+1+seed)*.7)*38+Math.cos((j+1+seed)*.33)*18;
        var top=85+Math.min(a,b);
        var h=Math.max(10,Math.abs(a-b)+10);
        var el=document.createElement('span');
        el.className='predict-candle-bar '+(b<a?'up':'down');
        el.style.left=(18+j*15)+'px';
        el.style.top=Math.max(28,Math.min(168,top))+'px';
        el.style.height=Math.min(82,h)+'px';
        el.style.color=b<a?'rgba(58,255,150,.82)':'rgba(255,92,118,.82)';
        layer.appendChild(el);
      }
    }

    function paintButtons(mode){
      root.querySelectorAll('[data-predict-choice]').forEach(function(btn){
        btn.disabled=false;
        var side=btn.getAttribute('data-predict-choice');
        btn.textContent=mode==='candle'?(side==='down'?'Red':'Green'):(side==='down'?'Down':'Up');
      });
      var title=root.querySelector('[data-predict-bet-title]');
      if(title&&mode!=='candle'){
        if(title.textContent==='Green')title.textContent='Up';
        if(title.textContent==='Red')title.textContent='Down';
      }
      var q=root.querySelector('[data-predict-question]');
      if(q&&mode==='candle')q.textContent=activeMarketText()+' candle close?';
    }

    function setMode(mode){
      mode=mode==='candle'?'candle':'updown';
      addStyles();
      root.dataset.predictMode=mode;
      root.classList.toggle('predict-candle-mode',mode==='candle');
      root.classList.remove('predict-candle-locked');
      paintButtons(mode);
      if(mode==='candle')drawCandles();
    }

    window.addEventListener('vexa-predict-mode-change',function(ev){
      setMode((ev&&ev.detail&&ev.detail.mode)==='candle'?'candle':'updown');
    });

    document.addEventListener('click',function(ev){
      var choice=ev.target&&ev.target.closest?ev.target.closest('#predictzone [data-predict-choice]'):null;
      if(choice&&root.dataset.predictMode==='candle'){
        setTimeout(function(){
          var t=root.querySelector('[data-predict-bet-title]');
          if(t)t.textContent=choice.getAttribute('data-predict-choice')==='down'?'Red':'Green';
        },20);
      }
      var market=ev.target&&ev.target.closest?ev.target.closest('#predictzone [data-predict-market],#predictzone [data-vexa-predict-market]'):null;
      if(market&&root.dataset.predictMode==='candle')setTimeout(function(){drawCandles();paintButtons('candle')},120);
    },true);

    setMode('updown');
  });
})();
`;