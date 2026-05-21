export const PREDICT_ENTRY_LOADER_SCRIPT = `
(function(){
  var DURATION=4000;
  var timer=0;
  var imageUrl='/app/api/predict-loading-image.png';
  function ensure(){
    var existing=document.getElementById('predictEntryLoader');
    if(existing)return existing;
    var style=document.createElement('style');
    style.id='predict-entry-loader-style';
    style.textContent='.predict-entry-loader{position:fixed;inset:0;z-index:260;display:grid;place-items:center;background:#000;color:#fff;opacity:0;pointer-events:none;transform:scale(1.018);transition:opacity .24s ease,transform .45s cubic-bezier(.2,.9,.2,1)}.predict-entry-loader.show{opacity:1;pointer-events:auto;transform:scale(1)}.predict-entry-loader.leave{opacity:0;transform:scale(.985)}.predict-entry-loader-inner{width:min(74vw,320px);display:grid;justify-items:center;gap:22px;animation:predictEntryRise .52s cubic-bezier(.2,.9,.2,1) both}.predict-entry-loader-image{width:126px;height:126px;border-radius:32px;object-fit:cover;background:#050505;box-shadow:0 30px 80px rgba(0,0,0,.72),0 0 0 1px rgba(255,255,255,.08);opacity:0;transform:translateY(12px) scale(.94);animation:predictEntryImage .7s cubic-bezier(.2,.9,.2,1) .08s forwards}.predict-entry-loader-image[src=""]{display:none}.predict-entry-loader-track{width:100%;height:4px;border-radius:999px;background:rgba(255,255,255,.13);overflow:hidden;box-shadow:0 0 0 1px rgba(255,255,255,.035),0 18px 44px rgba(0,0,0,.45)}.predict-entry-loader-line{display:block;width:0;height:100%;border-radius:999px;background:#fff;box-shadow:0 0 22px rgba(255,255,255,.58);animation:predictEntryFill 4s linear forwards}@keyframes predictEntryFill{to{width:100%}}@keyframes predictEntryRise{from{transform:translateY(18px);opacity:.62}to{transform:translateY(0);opacity:1}}@keyframes predictEntryImage{to{opacity:1;transform:translateY(0) scale(1)}}';
    document.head.appendChild(style);
    var overlay=document.createElement('div');
    overlay.id='predictEntryLoader';
    overlay.className='predict-entry-loader';
    overlay.setAttribute('aria-hidden','true');
    overlay.innerHTML='<div class="predict-entry-loader-inner"><img class="predict-entry-loader-image" alt="" decoding="async"/><div class="predict-entry-loader-track"><i class="predict-entry-loader-line"></i></div></div>';
    document.body.appendChild(overlay);
    return overlay;
  }
  function start(){
    var overlay=ensure();
    var img=overlay.querySelector('.predict-entry-loader-image');
    var line=overlay.querySelector('.predict-entry-loader-line');
    if(timer){clearTimeout(timer);timer=0}
    if(img){img.onerror=function(){img.removeAttribute('src')};img.src=imageUrl+'?v='+Date.now()}
    if(line){line.style.animation='none';line.offsetHeight;line.style.animation='predictEntryFill '+(DURATION/1000)+'s linear forwards'}
    overlay.classList.remove('leave');
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden','false');
    timer=setTimeout(function(){overlay.classList.add('leave');overlay.classList.remove('show');overlay.setAttribute('aria-hidden','true');timer=0},DURATION+120);
  }
  document.addEventListener('click',function(ev){
    var target=ev.target&&ev.target.closest?ev.target.closest('[data-view="predictzone"]'):null;
    if(!target)return;
    start();
  },true);
})();
`;