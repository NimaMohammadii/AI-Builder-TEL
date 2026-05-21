export const PREDICT_ZONE_SETTINGS_SCRIPT = `
(function(){
  function apply(settings){
    var root=document.getElementById('predictzone');
    if(!root)return;
    root.classList.toggle('predict-live-bets-disabled', settings&&settings.liveBetsEnabled===false);
  }
  function load(){
    fetch('/app/api/predict-settings',{cache:'no-store'})
      .then(function(response){return response.json()})
      .then(apply)
      .catch(function(){apply({liveBetsEnabled:true})});
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',load);
  }else{
    load();
  }
  window.addEventListener('focus',load);
})();
(function(){
  var ws=null;
  function root(){return document.getElementById('predictzone')}
  function oil(){var r=root();return r&&r.querySelector('[data-vexa-predict-market="oil"].active')?r:null}
  function close(){if(ws){try{ws.onmessage=null;ws.onclose=null;ws.close()}catch(e){}ws=null}}
  function clean(r){
    var live=r.querySelector('.predict-zone-live-price');
    var start=r.querySelector('.predict-zone-start-price');
    if(live&&/[0-9]{5,}/.test(live.textContent||''))live.textContent='Loading';
    if(start&&/[0-9]{5,}/.test(start.textContent||''))start.textContent='Loading';
  }
  function connect(r){
    if(ws||!('WebSocket'in window))return;
    try{
      ws=new WebSocket('wss://fstream.binance.com/ws/clusdt@ticker');
      ws.onmessage=function(e){try{var j=JSON.parse(e.data),p=Number(j.c||j.p);var rr=oil();if(p&&rr){var live=rr.querySelector('.predict-zone-live-price');if(live)live.textContent='$'+p.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}}catch(x){}};
      ws.onclose=function(){ws=null;if(oil())setTimeout(function(){connect(oil())},2500)};
    }catch(e){}
  }
  function run(){var r=oil();if(r){clean(r);connect(r)}else close()}
  document.addEventListener('click',function(){setTimeout(run,25);setTimeout(run,180)},true);
  document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')setTimeout(run,80);else close()});
  setInterval(run,1200);
})();
`;