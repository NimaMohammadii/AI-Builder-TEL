export const HOME_CONTROL_TUNE_SCRIPT = `
(function(){
  function q(s,r){return (r||document).querySelector(s)}
  function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function on(){return document.body.classList.contains('home-slot-manual-on')}
  function y(v){return 'translate3d(0,-'+((20*34)+(v*34)+17)+'px,0)'}
  function step(r,d){
    if(!on()||!r)return;
    var strip=q('[data-slot-strip]',r);if(!strip)return;
    var v=Math.max(0,Math.min(9,Math.floor(Number(r.getAttribute('data-slot-value')||'0'))));
    v=(v+(d>0?1:-1)+10)%10;
    r.setAttribute('data-slot-value',String(v));
    strip.style.setProperty('transition','transform 240ms cubic-bezier(.16,1,.3,1)','important');
    strip.style.transform=y(v);
    setTimeout(function(){strip.style.setProperty('transition','none','important')},255);
  }
  function addCss(){
    if(q('#homeControlTuneStyle'))return;
    var st=document.createElement('style');st.id='homeControlTuneStyle';
    st.textContent='.home-slot-manual-on #home .home-slot-number-reel{-webkit-user-select:none!important;user-select:none!important;-webkit-tap-highlight-color:transparent!important}.home-slot-manual-on #home .home-slot-number-reel:active{transform:scale(.985)!important;transition:transform 160ms cubic-bezier(.16,1,.3,1)!important}';
    document.head.appendChild(st);
  }
  function bind(){
    addCss();
    qa('#home .home-slot-number-reel').forEach(function(r){
      if(r.dataset.controlTune==='1')return;r.dataset.controlTune='1';
      var startY=0,moved=false,block=0;
      r.addEventListener('pointerdown',function(e){if(!on())return;e.preventDefault();e.stopImmediatePropagation();startY=Number(e.clientY||0);moved=false;block=Date.now()+420;try{r.setPointerCapture&&r.setPointerCapture(e.pointerId)}catch(x){}},true);
      r.addEventListener('pointermove',function(e){if(!on())return;var cy=Number(e.clientY||startY),d=cy-startY;if(Math.abs(d)<8)return;e.preventDefault();e.stopImmediatePropagation();moved=true;step(r,d<0?1:-1);startY=cy;block=Date.now()+420},true);
      r.addEventListener('pointerup',function(e){if(!on())return;e.preventDefault();e.stopImmediatePropagation();if(!moved)step(r,1);block=Date.now()+420},true);
      r.addEventListener('click',function(e){if(!on()||Date.now()<block)return;e.preventDefault();e.stopImmediatePropagation();step(r,1)},true);
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
  document.addEventListener('click',function(){setTimeout(bind,0)},true);
})();
`;