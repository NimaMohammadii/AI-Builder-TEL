export const HOME_IMAGE_VERSION_SCRIPT = `
(function(){
  var css = [
    '#home #homeLuckyCodeSection .home-lottery-slot-card,#home .home-lucky-card .home-lottery-slot-card{height:88px!important;min-height:88px!important;max-height:88px!important;margin:0 0 10px!important;border-radius:22px!important;overflow:hidden!important}',
    '#home #homeLuckyCodeSection .home-lottery-slot-image,#home .home-lucky-card .home-lottery-slot-image{height:100%!important;object-fit:cover!important;object-position:center!important;border-radius:22px!important}',
    '#home #homeLuckyCodeSection .home-live-winners-list,#home .home-lucky-card .home-live-winners-list{max-height:520px!important;overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior-y:contain!important;padding:0 2px 16px!important;scroll-padding-bottom:16px!important;box-sizing:border-box!important}',
    '#home #homeLuckyCodeSection .home-live-winner-card,#home .home-lucky-card .home-live-winner-card{position:relative!important;overflow:hidden!important}',
    '#home #homeLuckyCodeSection .home-live-winner-card:before,#home .home-lucky-card .home-live-winner-card:before,#home #homeLuckyCodeSection .home-live-winner-card:after,#home .home-lucky-card .home-live-winner-card:after,#home #homeLuckyCodeSection .home-live-winner-user strong:after,#home .home-lucky-card .home-live-winner-user strong:after{display:none!important;content:none!important}',
    '#home #homeLuckyCodeSection .home-live-winner-card:first-child>:not(.vexa-premium-corner),#home .home-lucky-card .home-live-winner-card:first-child>:not(.vexa-premium-corner){position:relative!important;z-index:3!important}',
    '#home .vexa-premium-corner{position:absolute!important;right:0!important;bottom:0!important;width:140px!important;height:70px!important;z-index:2!important;pointer-events:none!important;overflow:hidden!important;border-radius:0 0 28px 0!important;display:block!important;grid-column:auto!important;grid-row:auto!important;place-self:auto!important}',
    '#home .vexa-premium-corner:before{content:""!important;position:absolute!important;right:-32px!important;bottom:-38px!important;width:164px!important;height:112px!important;border-radius:999px!important;background:radial-gradient(circle at 78% 78%,rgba(92,10,35,.64),rgba(42,4,16,.36) 46%,rgba(8,0,4,0) 75%)!important;box-shadow:0 0 42px rgba(92,10,35,.34),inset 0 -20px 34px rgba(92,10,35,.18)!important}',
    '#home .vexa-premium-star{position:absolute!important;z-index:2!important;color:rgba(255,225,235,.86)!important;font-size:10px!important;line-height:1!important;text-shadow:0 0 9px rgba(255,210,225,.35),0 5px 12px rgba(0,0,0,.62)!important;filter:drop-shadow(0 0 5px rgba(92,10,35,.36))!important;animation:none!important}',
    '#home .vexa-premium-star:nth-child(1){right:14px!important;bottom:10px!important;font-size:12px!important}',
    '#home .vexa-premium-star:nth-child(2){right:50px!important;bottom:8px!important;font-size:9px!important}',
    '#home .vexa-premium-star:nth-child(3){right:30px!important;bottom:34px!important;font-size:10px!important}',
    '#home .vexa-premium-star:nth-child(4){right:92px!important;bottom:24px!important;font-size:8px!important}',
    '#home .vexa-premium-star:nth-child(5){right:66px!important;bottom:48px!important;font-size:9px!important}',
    '#home #homeLuckyCodeSection .home-live-winner-card:first-child .home-live-winner-amount,#home .home-lucky-card .home-live-winner-card:first-child .home-live-winner-amount{padding-right:28px!important}'
  ].join('');
  function apply(){
    var style = document.getElementById('home-lottery-slot-size-fix');
    if(!style){style=document.createElement('style');style.id='home-lottery-slot-size-fix';document.head.appendChild(style)}
    style.textContent = css;
    var card = document.querySelector('#home #homeLuckyCodeSection .home-live-winner-card:first-child') || document.querySelector('#home .home-lucky-card .home-live-winner-card:first-child');
    if(card && !card.querySelector('.vexa-premium-corner')){
      var box=document.createElement('div');box.className='vexa-premium-corner';
      for(var i=0;i<5;i++){var star=document.createElement('span');star.className='vexa-premium-star';star.textContent='★';box.appendChild(star)}
      card.appendChild(box);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
  setTimeout(apply,250);
})();
`;
