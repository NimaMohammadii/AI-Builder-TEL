export const HOME_IMAGE_VERSION_SCRIPT = `
(function(){
  var css = '#home #homeLuckyCodeSection .home-lottery-slot-card,#home .home-lucky-card .home-lottery-slot-card{height:56px!important;min-height:56px!important;max-height:56px!important;margin:0 0 10px!important;border-radius:18px!important;overflow:hidden!important}#home #homeLuckyCodeSection .home-lottery-slot-image,#home .home-lucky-card .home-lottery-slot-image{height:100%!important;object-fit:cover!important;object-position:center!important;border-radius:18px!important}';
  var style = document.createElement('style');
  style.id = 'home-lottery-slot-size-fix';
  style.textContent = css;
  document.head.appendChild(style);
})();
`;
