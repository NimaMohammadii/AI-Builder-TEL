export const PREDICT_ZONE_SETTINGS_SCRIPT = `
(function(){
  function apply(settings){
    var root=document.getElementById('predictzone');
    if(!root)return;
    root.classList.toggle('predict-live-bets-disabled', settings&&settings.liveBetsEnabled===false);
  }
  function ensureBalanceMount(){
    var root=document.getElementById('predictzone');
    if(!root||root.querySelector('.predict-zone-balance'))return;
    var shell=root.querySelector('.predict-zone-simple-shell');
    var menu=root.querySelector('.predict-zone-category-menu');
    if(!shell||!menu)return;
    var wrap=document.createElement('div');
    wrap.className='predict-zone-balance';
    wrap.innerHTML='<span>Balance</span><strong data-ton-balance-display>0</strong><small>TON</small>';
    shell.insertBefore(wrap,menu);
    try{if(window.VexaTonBalance&&window.VexaTonBalance.render)window.VexaTonBalance.render();}catch(e){}
  }
  function load(){
    ensureBalanceMount();
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
`;