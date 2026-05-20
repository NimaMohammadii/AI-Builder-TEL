export const CRASH_NAV_SCRIPT = `
(function(){
  function q(id){return document.getElementById(id)}
  function isCrash(){var c=q('crash');return !!(c&&c.classList.contains('active'))}
  function showPlayZone(){
    var tab=document.querySelector('.tab[data-view="playzone"],button[data-view="playzone"]');
    if(tab){tab.click();return}
    document.querySelectorAll('.view').forEach(function(n){n.classList.remove('active')});
    var p=q('playzone');if(p)p.classList.add('active');
    document.querySelectorAll('.tab').forEach(function(n){n.classList.toggle('active',n.getAttribute('data-view')==='playzone')});
    var title=q('brandTitle');if(title)title.textContent='Play Zone';
  }
  function updateBack(){
    var tg=window.Telegram&&window.Telegram.WebApp;
    if(tg&&tg.BackButton){
      try{tg.BackButton.offClick(showPlayZone)}catch(e){}
      if(isCrash()){try{tg.BackButton.onClick(showPlayZone);tg.BackButton.show()}catch(e){}}
      else{try{tg.BackButton.hide()}catch(e){}}
    }
    var title=q('brandTitle');
    if(isCrash()&&title)title.textContent='Crash';
    document.body.classList.toggle('crash-active',isCrash());
  }
  function patchClosePill(){
    if(!isCrash())return;
    document.querySelectorAll('button,a,div').forEach(function(el){
      var txt=(el.textContent||'').trim();
      if(txt==='Close'&&el.offsetParent!==null){
        el.textContent='Back';
        el.setAttribute('data-crash-back','1');
        if(!el.__vexaCrashBack){
          el.__vexaCrashBack=true;
          el.addEventListener('click',function(ev){if(isCrash()){ev.preventDefault();ev.stopPropagation();showPlayZone()}},true);
        }
      }
    });
  }
  document.addEventListener('click',function(ev){var b=ev.target&&ev.target.closest&&ev.target.closest('[data-crash-back="1"]');if(b&&isCrash()){ev.preventDefault();ev.stopPropagation();showPlayZone()}},true);
  var obs=new MutationObserver(function(){updateBack();patchClosePill()});
  function bind(){obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});updateBack();patchClosePill();setInterval(function(){updateBack();patchClosePill()},600)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
`;
