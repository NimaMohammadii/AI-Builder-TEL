export const PREDICT_OIL_HOTFIX_SCRIPT = `
(function(){
  var timer=0;
  var feed='https://query1.'+'fin'+'ance.'+'ya'+'hoo.com/v8/fin'+'ance/chart/CL%3DF?range=1d&interval=1m';
  function isOil(root){return !!(root&&root.querySelector('[data-vexa-predict-market="oil"].active'))}
  function close(){if(timer){clearTimeout(timer);timer=0}}
  function setPrice(root,p){
    var live=root.querySelector('.predict-zone-live-price');
    var chart=root.querySelector('[data-predict-chart]');
    var txt='$'+Number(p).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
    if(live)live.textContent=txt;
    if(chart)chart.classList.add('ready');
  }
  function readPrice(data){
    var r=data&&data.chart&&data.chart.result&&data.chart.result[0];
    var q=r&&r.indicators&&r.indicators.quote&&r.indicators.quote[0];
    var close=q&&q.close||[];
    for(var i=close.length-1;i>=0;i--){var p=Number(close[i]);if(p>0&&isFinite(p))return p}
    var fallback=Number(r&&r.meta&&r.meta.regularMarketPrice);
    return fallback>0&&isFinite(fallback)?fallback:0;
  }
  function tick(root){
    close();
    if(!isOil(root))return;
    fetch(feed,{cache:'no-store'}).then(function(r){return r.json()}).then(function(data){var p=readPrice(data);if(p&&isOil(root))setPrice(root,p)}).catch(function(){}).finally(function(){if(isOil(root))timer=setTimeout(function(){tick(root)},5000)});
  }
  function run(){
    var root=document.getElementById('predictzone');
    if(!root)return;
    if(isOil(root))tick(root);else close();
  }
  document.addEventListener('click',function(){setTimeout(run,40);setTimeout(run,180)},true);
  document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')setTimeout(run,80);else close()});
  setInterval(run,1500);
})();
`;