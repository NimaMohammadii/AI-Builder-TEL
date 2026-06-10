export const PREDICT_CARD_ACTIONS_SCRIPT = `<script>
(function(){
  function root(){return document.getElementById('predictzone')}
  function visible(el){return !!el&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden'}
  var imageCacheName='vexa-predict-card-images-v1';
  var objectUrls={};
  var pending={};
  function extractBgUrl(el){
    var bg=(el&&el.style&&el.style.backgroundImage)||'';
    var m=bg.match(/url\(["']?([^"')]+)["']?\)/i);
    return m&&m[1]?m[1]:'';
  }
  function setBg(el,url){if(el&&url)el.style.backgroundImage='url("'+url.replace(/"/g,'')+'")'}
  function cacheOne(el){
    if(!el||!('caches' in window)||!window.fetch)return;
    var raw=extractBgUrl(el);if(!raw||raw.indexOf('blob:')===0||raw.indexOf('data:')===0)return;
    var abs;try{abs=new URL(raw,location.href).href}catch(e){return}
    if(objectUrls[abs]){setBg(el,objectUrls[abs]);return}
    if(pending[abs]){pending[abs].then(function(u){setBg(el,u)}).catch(function(){});return}
    pending[abs]=caches.open(imageCacheName).then(function(cache){
      return cache.match(abs).then(function(hit){
        if(hit)return hit;
        return fetch(abs,{cache:'force-cache'}).then(function(res){
          if(res&&res.ok){try{cache.put(abs,res.clone())}catch(e){}}
          return res;
        });
      });
    }).then(function(res){return res.blob()}).then(function(blob){
      var u=URL.createObjectURL(blob);objectUrls[abs]=u;return u;
    }).finally(function(){delete pending[abs]});
    pending[abs].then(function(u){setBg(el,u)}).catch(function(){});
  }
  function cachePredictImages(){
    var r=root();if(!r)return;
    r.querySelectorAll('[data-vexa-predict-upload-img],[data-vexa-predict-card-img],[data-predict-question-image]').forEach(cacheOne);
  }
  function sync(){
    var r=root();if(!r)return;
    var grid=r.querySelector('[data-vexa-predict-group-grid],.predict-crypto-grid');
    var inList=!!grid&&visible(grid)&&grid.querySelector('.predict-crypto-card');
    r.classList.toggle('predict-card-list-mode',!!inList);
    cachePredictImages();
    if(!inList)return;
    grid.querySelectorAll('.predict-crypto-card[data-vexa-predict-open]').forEach(function(card){
      if(card.nextElementSibling&&card.nextElementSibling.classList&&card.nextElementSibling.classList.contains('predict-card-actions'))return;
      var actions=document.createElement('div');
      actions.className='predict-card-actions';
      actions.innerHTML='<button type="button" data-predict-card-side="up">Up</button><button type="button" data-predict-card-side="down">Down</button>';
      actions.querySelectorAll('button').forEach(function(btn){
        btn.addEventListener('click',function(e){
          e.preventDefault();e.stopPropagation();
          card.click();
          var side=btn.getAttribute('data-predict-card-side')||'up';
          setTimeout(function(){
            var target=r.querySelector('[data-predict-choice="'+side+'"], [data-predict-side="'+side+'"], [data-side="'+side+'"], button[value="'+side+'"], button[data-bet-side="'+side+'"]');
            if(target)target.click();
          },220);
        },true);
      });
      card.insertAdjacentElement('afterend',actions);
    });
    setTimeout(cachePredictImages,120);
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
