export const HOME_IMAGE_VERSION_SCRIPT = `
(function(){
  var latest='',loading=false;
  var css=[
    '#home .home-lottery-slot-card{width:100%!important;height:88px!important;min-height:88px!important;max-height:88px!important;margin:0 0 10px!important;border:0!important;outline:0!important;border-radius:22px!important;overflow:hidden!important;padding:0!important;position:relative!important;box-sizing:border-box!important}',
    '#home .home-lottery-slot-image{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;display:block!important;object-fit:cover!important;object-position:center!important;border:0!important;outline:0!important;border-radius:22px!important;background:transparent!important;box-shadow:none!important}',
    '#home .home-lottery-slot-image[src*="v=home-lottery"]{opacity:0!important}',
    '#home .home-live-winners-list{max-height:520px!important;overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior-y:contain!important;padding:0 2px 16px!important;scroll-padding-bottom:16px!important;box-sizing:border-box!important}',
    '#home .home-live-winner-card{position:relative!important;overflow:hidden!important}',
    '#home .home-live-winner-card:before,#home .home-live-winner-card:after,#home .home-live-winner-user strong:after{display:none!important;content:none!important}',
    '#home .home-live-winner-card:nth-child(-n+3)>:not(.vexa-premium-corner){position:relative!important;z-index:3!important}',
    '#home .vexa-premium-corner{position:absolute!important;inset:0!important;z-index:4!important;pointer-events:none!important;overflow:hidden!important;border-radius:28px!important;display:block!important}',
    '#home .vexa-premium-corner:before{content:""!important;position:absolute!important;right:-38px!important;bottom:-36px!important;width:188px!important;height:118px!important;border-radius:999px!important;background:radial-gradient(circle at 82% 82%,rgba(92,10,35,.64),rgba(42,4,16,.34) 34%,rgba(42,4,16,.16) 50%,rgba(8,0,4,.05) 64%,rgba(8,0,4,0) 82%)!important;box-shadow:0 0 42px rgba(92,10,35,.34),inset 0 -20px 34px rgba(92,10,35,.18)!important}',
    '#home .vexa-premium-corner.is-blue:before{background:radial-gradient(circle at 82% 82%,rgba(8,26,112,.68),rgba(4,12,58,.38) 34%,rgba(4,12,58,.18) 50%,rgba(0,3,18,.06) 64%,rgba(0,3,18,0) 82%)!important;box-shadow:0 0 42px rgba(8,26,112,.38),inset 0 -20px 34px rgba(8,26,112,.20)!important}',
    '#home .vexa-premium-corner.is-bronze:before{background:radial-gradient(circle at 82% 82%,rgba(106,63,8,.68),rgba(62,34,4,.38) 34%,rgba(62,34,4,.18) 50%,rgba(18,9,0,.06) 64%,rgba(18,9,0,0) 82%)!important;box-shadow:0 0 42px rgba(106,63,8,.38),inset 0 -20px 34px rgba(106,63,8,.20)!important}',
    '#home .vexa-premium-star{position:absolute!important;z-index:5!important;color:rgba(255,225,235,.86)!important;font-size:10px!important;line-height:1!important;text-shadow:0 0 9px rgba(255,210,225,.35),0 5px 12px rgba(0,0,0,.62)!important;filter:drop-shadow(0 0 5px rgba(92,10,35,.36))!important;animation:none!important}',
    '#home .vexa-premium-corner.is-blue .vexa-premium-star{color:rgba(220,232,255,.88)!important;text-shadow:0 0 9px rgba(160,190,255,.38),0 5px 12px rgba(0,0,0,.62)!important;filter:drop-shadow(0 0 5px rgba(8,26,112,.42))!important}',
    '#home .vexa-premium-corner.is-bronze .vexa-premium-star{color:rgba(255,231,190,.88)!important;text-shadow:0 0 9px rgba(255,190,90,.34),0 5px 12px rgba(0,0,0,.62)!important;filter:drop-shadow(0 0 5px rgba(106,63,8,.42))!important}',
    '#home .vexa-premium-star:nth-child(1){right:14px!important;bottom:10px!important;font-size:12px!important}#home .vexa-premium-star:nth-child(2){right:50px!important;bottom:8px!important;font-size:9px!important}#home .vexa-premium-star:nth-child(3){right:30px!important;bottom:34px!important;font-size:10px!important}#home .vexa-premium-star:nth-child(4){right:92px!important;bottom:13px!important;font-size:8px!important}#home .vexa-premium-star:nth-child(5){right:66px!important;bottom:48px!important;font-size:9px!important}',
    '#home .home-live-winner-card:nth-child(-n+3) .home-live-winner-amount{padding-right:28px!important}'
  ].join('');
  function style(){var s=document.getElementById('home-lottery-slot-size-fix');if(!s){s=document.createElement('style');s.id='home-lottery-slot-size-fix';document.head.appendChild(s)}s.textContent=css}
  function old(){document.querySelectorAll('#home .home-lottery-slot-image').forEach(function(i){if((i.getAttribute('src')||'').indexOf('v=home-lottery')>-1)i.removeAttribute('src')})}
  function setImg(u){if(!u)return;latest=u;document.querySelectorAll('#home .home-lottery-slot-image').forEach(function(i){if(i.getAttribute('src')!==u)i.setAttribute('src',u);i.style.removeProperty('opacity')})}
  function meta(){if(loading)return;loading=true;fetch('/app/api/home-lottery-slot-meta?ts='+Date.now(),{credentials:'same-origin',cache:'no-store'}).then(function(r){return r.ok?r.json():null}).then(function(j){if(j&&j.url)setImg(j.url)}).finally(function(){loading=false})}
  function stars(card,tone){if(!card)return;var b=card.querySelector('.vexa-premium-corner');if(!b){b=document.createElement('div');b.className='vexa-premium-corner';for(var i=0;i<5;i++){var x=document.createElement('span');x.className='vexa-premium-star';x.textContent='★';b.appendChild(x)}card.appendChild(b)}b.classList.toggle('is-blue',tone==='blue');b.classList.toggle('is-bronze',tone==='bronze')}
  function apply(){style();old();var r=document.querySelector('#home #homeLuckyCodeSection')||document.querySelector('#home .home-lucky-card');if(r){stars(r.querySelector('.home-live-winner-card:nth-child(1)'),'red');stars(r.querySelector('.home-live-winner-card:nth-child(2)'),'blue');stars(r.querySelector('.home-live-winner-card:nth-child(3)'),'bronze')}setImg(latest);meta()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
  var n=0,t=setInterval(function(){apply();if(++n>12)clearInterval(t)},250);
  try{new MutationObserver(apply).observe(document.body,{childList:true,subtree:true})}catch(e){}
})();
`;
