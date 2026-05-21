export const PREDICT_OIL_HOTFIX_SCRIPT = `
(function(){
  var timer=0;
  function isOil(root){return !!(root&&root.querySelector('[data-vexa-predict-market="oil"].active'))}
  function close(){if(timer){clearTimeout(timer);timer=0}}
  function setPrice(root,p){
    var live=root.querySelector('.predict-zone-live-price');
    var chart=root.querySelector('[data-predict-chart]');
    var txt='$'+Number(p).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
    if(live)live.textContent=txt;
    if(chart)chart.classList.add('ready');
  }
  function tick(root){
    close();
    if(!isOil(root))return;
    fetch('/app/api/predict-oil-price',{cache:'no-store'}).then(function(r){return r.json()}).then(function(data){var p=Number(data&&data.price);if(p&&isOil(root))setPrice(root,p)}).catch(function(){}).finally(function(){if(isOil(root))timer=setTimeout(function(){tick(root)},5000)});
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