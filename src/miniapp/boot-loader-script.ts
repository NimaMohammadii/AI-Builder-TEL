export const BOOT_LOADER_SCRIPT = `
(function(){
  function polish(){
    if(document.getElementById('vexaCrashPolish'))return;
    var s=document.createElement('style');
    s.id='vexaCrashPolish';
    s.textContent='#crash .crash-stage{border-radius:34px!important;border:1px solid rgba(255,255,255,.12)!important;background-color:rgba(255,255,255,.04)!important;box-shadow:0 24px 70px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.12)!important;backdrop-filter:blur(4px)!important;-webkit-backdrop-filter:blur(4px)!important}#crash .crash-controls{border-radius:34px!important;border:0!important;outline:0!important;background:transparent!important;box-shadow:none!important;backdrop-filter:blur(3px)!important;-webkit-backdrop-filter:blur(3px)!important;overflow:visible!important}#crash .crash-multiplier{font-size:clamp(46px,15vw,64px)!important;font-weight:930!important;text-shadow:0 14px 34px rgba(0,0,0,.38),0 0 26px rgba(255,255,255,.12)!important}#crash .crash-starting{border-radius:16px!important;background:rgba(255,255,255,.08)!important;box-shadow:0 16px 44px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.18)!important;backdrop-filter:blur(4px)!important;-webkit-backdrop-filter:blur(4px)!important}#crash .crash-amount input,#crash .crash-bet-main,#crash .crash-bet-main input{background:transparent!important;border:0!important;outline:0!important;box-shadow:none!important;backdrop-filter:blur(3px)!important;-webkit-backdrop-filter:blur(3px)!important}#crash .crash-actions button{border-radius:22px!important}body.section-loading-active .tabs{left:0!important;right:0!important;bottom:calc(12px + env(safe-area-inset-bottom,0px))!important;width:392px!important;max-width:calc(100% - 32px)!important;margin-left:auto!important;margin-right:auto!important;transform:translateY(0)!important}';
    document.head.appendChild(s);
  }
  function hide(){var boot=document.getElementById('vexaBoot');if(boot){boot.classList.add('hide');setTimeout(function(){if(boot&&boot.parentNode)boot.parentNode.removeChild(boot)},520)}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',polish);else polish();
  if(document.readyState==='complete')setTimeout(hide,650);else window.addEventListener('load',function(){setTimeout(hide,650)});
  setTimeout(hide,2200);
})();
`;
