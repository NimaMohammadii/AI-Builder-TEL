export const HOME_SLOT_TUNING_SCRIPT = `
(function(){
  var busy=false,row=34;
  function q(s,r){return (r||document).querySelector(s)}
  function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function y(i){return 'translate3d(0,-'+((i*row)+row/2)+'px,0)'}
  function digits(){var h='';for(var c=0;c<8;c++)for(var n=0;n<10;n++)h+='<span class="home-slot-number-digit">'+n+'</span>';return h}
  function tune(){
    if(q('#homeSlotTuningStyle'))return;
    var st=document.createElement('style');st.id='homeSlotTuningStyle';
    st.textContent=[
      '#home .home-slot-number-reel{margin:8px 12px!important;border-radius:12px!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}',
      '#home .home-slot-number-strip{grid-auto-rows:34px!important}',
      '#home .home-slot-number-reel.is-spinning .home-slot-number-strip{filter:blur(2.4px)!important}',
      '#home .home-slot-number-digit{height:34px!important;font-size:30px!important;color:#fff!important;background:none!important;-webkit-background-clip:initial!important;background-clip:initial!important;text-shadow:0 1px 1px rgba(0,0,0,.58),0 8px 18px rgba(0,0,0,.50)!important}'
    ].join('');
    document.head.appendChild(st);
  }
  function prepare(){
    tune();
    qa('#home .home-slot-number-reel').forEach(function(reel){
      var strip=q('[data-slot-strip]',reel);if(!strip)return;
      if(strip.dataset.tuned!=='1'){strip.innerHTML=digits();strip.dataset.tuned='1'}
      var v=Math.max(0,Math.min(9,Math.floor(Number(reel.getAttribute('data-slot-value')||'0'))));
      strip.style.transition='none';strip.style.transform=y(40+v);
    });
  }
  function spin(){
    if(busy)return;prepare();busy=true;
    var btn=q('#homeSlotSpinButton');if(btn)btn.classList.add('is-spinning');
    qa('#home .home-slot-number-reel').forEach(function(reel,i){
      var strip=q('[data-slot-strip]',reel);if(!strip)return;
      var current=Math.max(0,Math.min(9,Math.floor(Number(reel.getAttribute('data-slot-value')||'0'))));
      var final=Math.floor(Math.random()*10);reel.setAttribute('data-slot-value',String(final));
      strip.style.transition='none';strip.style.transform=y(30+current);reel.classList.add('is-spinning');
      setTimeout(function(){strip.style.transition='transform '+(1500+i*170)+'ms cubic-bezier(.09,.78,.12,1)';strip.style.transform=y(70+final)},20+i*110);
      setTimeout(function(){strip.style.transition='none';strip.style.transform=y(40+final);reel.classList.remove('is-spinning')},1800+i*190);
    });
    setTimeout(function(){if(btn)btn.classList.remove('is-spinning');busy=false},2700);
  }
  document.addEventListener('click',function(e){var t=e.target;if(t&&t.id==='homeSlotSpinButton'){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();spin()}},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',prepare);else prepare();
  if(window.MutationObserver)new MutationObserver(function(){if(q('#home .home-slot-number-reel'))prepare()}).observe(document.documentElement,{childList:true,subtree:true});
})();
`;