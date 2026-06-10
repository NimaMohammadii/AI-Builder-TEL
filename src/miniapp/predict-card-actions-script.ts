export const PREDICT_CARD_ACTIONS_SCRIPT = `<script>
(function(){
  var buttonImages={up:'',down:''};
  var loading=false;
  var loaded=false;
  var syncing=false;
  function root(){return document.getElementById('predictzone')}
  function visible(el){return !!el&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden'}
  function safeUrl(url){return String(url||'').replace(/"/g,'')}
  function setClass(el,name,on){if(!el)return;if(on&&!el.classList.contains(name))el.classList.add(name);else if(!on&&el.classList.contains(name))el.classList.remove(name)}
  function setBg(el,url){var next=url?'url("'+safeUrl(url)+'")':'';if(el&&el.style.backgroundImage!==next)el.style.backgroundImage=next}
  function applyActionButton(btn){
    if(!btn)return;
    var side=btn.getAttribute('data-predict-card-side')==='down'?'down':'up';
    var url=buttonImages[side]||'';
    setBg(btn,url);
    setClass(btn,'has-uploaded-image',!!url);
    var label=side==='down'?'Down':'Up';
    if(btn.getAttribute('aria-label')!==label)btn.setAttribute('aria-label',label);
  }
  function applyDetailButton(side){
    var r=root();if(!r)return;
    var btn=r.querySelector('[data-predict-choice="'+side+'"]');
    var img=r.querySelector('[data-predict-choice-image="'+side+'"]');
    var url=buttonImages[side]||'';
    if(img)setBg(img,url);
    if(btn)setClass(btn,'has-uploaded-image',!!url);
  }
  function applyImages(){
    var r=root();if(!r)return;
    r.querySelectorAll('[data-predict-card-side]').forEach(applyActionButton);
    applyDetailButton('up');
    applyDetailButton('down');
  }
  function loadImages(force){
    if(loading||(!force&&loaded))return;
    loading=true;
    fetch('/app/api/predict-button-images',{cache:'no-store'}).then(function(response){return response.json()}).then(function(data){
      var images=data&&data.images?data.images:{};
      buttonImages.up=(images.up&&images.up.imageUrl)||'';
      buttonImages.down=(images.down&&images.down.imageUrl)||'';
      loaded=true;
      applyImages();
    }).catch(function(){}).finally(function(){loading=false});
  }
  function sync(){
    if(syncing)return;
    syncing=true;
    try{
      var r=root();if(!r)return;
      var grid=r.querySelector('[data-vexa-predict-group-grid],.predict-crypto-grid');
      var inList=!!grid&&visible(grid)&&grid.querySelector('.predict-crypto-card');
      r.classList.toggle('predict-card-list-mode',!!inList);
      loadImages(false);
      if(inList){
        grid.querySelectorAll('.predict-crypto-card[data-vexa-predict-open]').forEach(function(card){
          if(card.nextElementSibling&&card.nextElementSibling.classList&&card.nextElementSibling.classList.contains('predict-card-actions'))return;
          var actions=document.createElement('div');
          actions.className='predict-card-actions';
          actions.innerHTML='<button type="button" data-predict-card-side="up">Up</button><button type="button" data-predict-card-side="down">Down</button>';
          actions.querySelectorAll('button').forEach(function(btn){
            applyActionButton(btn);
            btn.addEventListener('click',function(e){
              e.preventDefault();e.stopPropagation();
              card.click();
              var side=btn.getAttribute('data-predict-card-side')||'up';
              setTimeout(function(){
                var target=r.querySelector('[data-predict-choice="'+side+'"]');
                if(target)target.click();
              },220);
            },true);
          });
          card.insertAdjacentElement('afterend',actions);
        });
      }
      applyImages();
    }finally{
      syncing=false;
    }
  }
  function scheduleSync(){setTimeout(sync,60)}
  function mount(){
    loadImages(true);
    sync();
    var r=root();if(!r||r.dataset.predictCardActionsReady==='1')return;
    r.dataset.predictCardActionsReady='1';
    if(window.MutationObserver)new MutationObserver(scheduleSync).observe(r,{childList:true,subtree:true});
    document.addEventListener('click',function(){setTimeout(sync,80);setTimeout(sync,220)},true);
    window.addEventListener('focus',function(){loadImages(true);sync()});
    document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible'){loadImages(true);sync()}});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
</script>`;
