export const PREDICT_OIL_HOTFIX_SCRIPT = `
(function(){
  function clean(){
    var root=document.getElementById('predictzone');
    if(!root)return;
    var active=root.querySelector('[data-vexa-predict-market="oil"].active');
    if(!active)return;
    var live=root.querySelector('.predict-zone-live-price');
    var start=root.querySelector('.predict-zone-start-price');
    var line=root.querySelector('.predict-zone-chart-line');
    var fill=root.querySelector('.predict-zone-chart-fill');
    var chart=root.querySelector('[data-predict-chart]');
    if(live && /[0-9]{5,}/.test(live.textContent||''))live.textContent='Loading';
    if(start && /[0-9]{5,}/.test(start.textContent||''))start.textContent='Loading';
    if(line && /[0-9]{5,}/.test(line.getAttribute('d')||''))line.setAttribute('d','');
    if(fill && /[0-9]{5,}/.test(fill.getAttribute('d')||''))fill.setAttribute('d','');
    if(chart)chart.classList.remove('ready');
  }
  document.addEventListener('click',function(){setTimeout(clean,20);setTimeout(clean,160);},true);
  document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')setTimeout(clean,80)});
})();
`;
