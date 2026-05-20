export const PREDICT_OIL_HOTFIX_SCRIPT = `
(function(){
  var ws=null;
  function isOil(root){return !!(root&&root.querySelector('[data-vexa-predict-market="oil"].active'))}
  function close(){if(ws){try{ws.onmessage=null;ws.onclose=null;ws.close()}catch(e){}ws=null}}
  function setPrice(root,p){
    var live=root.querySelector('.predict-zone-live-price');
    var txt='$'+Number(p).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
    if(live)live.textContent=txt;
  }
  function clean(root){
    var live=root.querySelector('.predict-zone-live-price');
    var start=root.querySelector('.predict-zone-start-price');
    var line=root.querySelector('.predict-zone-chart-line');
    var fill=root.querySelector('.predict-zone-chart-fill');
    var chart=root.querySelector('[data-predict-chart]');
    if(live&&/[0-9]{5,}/.test(live.textContent||''))live.textContent='Loading';
    if(start&&/[0-9]{5,}/.test(start.textContent||''))start.textContent='Loading';
    if(line&&/[0-9]{5,}/.test(line.getAttribute('d')||''))line.setAttribute('d','');
    if(fill&&/[0-9]{5,}/.test(fill.getAttribute('d')||''))fill.setAttribute('d','');
    if(chart&&live&&live.textContent==='Loading')chart.classList.remove('ready');
  }
  function connect(root){
    if(ws||!('WebSocket'in window))return;
    try{
      ws=new WebSocket('wss://fstream.binance.com/ws/clusdt@ticker');
      ws.onmessage=function(e){try{var j=JSON.parse(e.data),p=Number(j.c||j.p);if(p&&isFinite(p)&&isOil(root))setPrice(root,p)}catch(x){}};
      ws.onclose=function(){ws=null;if(isOil(root))setTimeout(function(){connect(root)},2500)};
    }catch(e){}
  }
  function run(){
    var root=document.getElementById('predictzone');
    if(!root)return;
    if(isOil(root)){clean(root);connect(root)}else close();
  }
  document.addEventListener('click',function(){setTimeout(run,20);setTimeout(run,160)},true);
  document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')setTimeout(run,80);else close()});
  setInterval(run,1200);
})();
`;
