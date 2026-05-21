export const PREDICT_HISTORY_GUARD_SCRIPT = `
(function(){
  function ready(fn){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn()}
  ready(function(){
    var root=document.getElementById('predictzone');
    if(!root||root.dataset.predictHistoryGuardReady==='1')return;
    root.dataset.predictHistoryGuardReady='1';
    var lastHistoryHtml='';
    var lastHistoryAt=0;
    var restoring=false;
    function resultBox(){return root.querySelector('[data-predict-result]')}
    function hasHistory(box){return !!(box&&box.querySelector('.predict-zone-history-card'))}
    function saveHistory(){
      var box=resultBox();
      if(!hasHistory(box))return;
      lastHistoryHtml=box.innerHTML;
      lastHistoryAt=Date.now();
    }
    function restoreHistory(){
      var box=resultBox();
      if(!box||hasHistory(box)||!lastHistoryHtml)return;
      if(Date.now()-lastHistoryAt>120000)return;
      restoring=true;
      box.innerHTML=lastHistoryHtml;
      box.classList.add('show');
      setTimeout(function(){restoring=false},0);
    }
    function installObserver(){
      var box=resultBox();
      if(!box||!window.MutationObserver)return false;
      var observer=new MutationObserver(function(){
        if(restoring)return;
        if(hasHistory(box)){saveHistory();return}
        if(lastHistoryHtml)requestAnimationFrame(restoreHistory);
      });
      observer.observe(box,{childList:true,subtree:true});
      saveHistory();
      return true;
    }
    if(!installObserver())setTimeout(installObserver,300);
    document.addEventListener('visibilitychange',function(){
      if(document.visibilityState==='visible')setTimeout(restoreHistory,80);
    });
    document.addEventListener('click',function(){
      setTimeout(saveHistory,120);
      setTimeout(restoreHistory,260);
    },true);
  });
})();
`;