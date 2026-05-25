export const PREDICT_CARD_ACTIONS_SCRIPT = `<script>
(function(){
  function root(){return document.getElementById('predictzone')}
  function visible(el){return !!el&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden'}
  function sync(){
    var r=root();if(!r)return;
    var grid=r.querySelector('[data-vexa-predict-group-grid],.predict-crypto-grid');
    var inList=!!grid&&visible(grid)&&grid.querySelector('.predict-crypto-card');
    r.classList.toggle('predict-card-list-mode',!!inList);
    if(!inList)return;
    grid.querySelectorAll('.predict-crypto-card[data-vexa-predict-open]').forEach(function(card){
      if(card.nextElementSibling&&card.nextElementSibling.classList&&card.nextElementSibling.classList.contains('predict-card-actions'))return;
      var market=card.getAttribute('data-vexa-predict-open')||'bitcoin';
      var actions=document.createElement('div');
      actions.className='predict-card-actions';
      actions.innerHTML='<button type="button" data-predict-card-side="up">Up</button><button type="button" data-predict-card-side="down">Down</button>';
      actions.querySelectorAll('button').forEach(function(btn){
        btn.addEventListener('click',function(e){
          e.preventDefault();e.stopPropagation();
          card.click();
          var side=btn.getAttribute('data-predict-card-side')||'up';
          setTimeout(function(){
            var target=r.querySelector('[data-predict-side="'+side+'"], [data-side="'+side+'"], button[value="'+side+'"], button[data-bet-side="'+side+'"]');
            if(target)target.click();
          },220);
        },true);
      });
      card.insertAdjacentElement('afterend',actions);
    });
  }
  function mount(){
    sync();
    var r=root();if(!r||r.dataset.predictCardActionsReady==='1')return;
    r.dataset.predictCardActionsReady='1';
    if(window.MutationObserver)new MutationObserver(sync).observe(r,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class']});
    document.addEventListener('click',function(){setTimeout(sync,80);setTimeout(sync,220)},true);
    window.addEventListener('focus',sync);
    document.addEventListener('visibilitychange',sync);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
</script>`;
