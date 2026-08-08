export const CRASH_BACK_BUTTON_SCRIPT = `
(function(){
  function q(id){return document.getElementById(id)}
  function isCrashActive(){var n=q('crash');return !!(n&&n.classList.contains('active'))}
  function goPlayZone(){
    var tab=document.querySelector('button[data-view="playzone"],.tab[data-view="playzone"]');
    if(tab&&typeof tab.click==='function'){tab.click();return}
    document.querySelectorAll('.view').forEach(function(n){n.classList.remove('active')});
    var p=q('playzone');if(p)p.classList.add('active');
    document.querySelectorAll('.tab').forEach(function(n){n.classList.toggle('active',n.getAttribute('data-view')==='playzone')});
    var title=q('brandTitle');if(title)title.textContent='Play Zone';
    document.body.classList.remove('crash-active');
  }
  function sync(){
    var tg=window.Telegram&&window.Telegram.WebApp;
    document.body.classList.toggle('crash-active',isCrashActive());
    if(!tg||!tg.BackButton)return;
    try{tg.BackButton.offClick(goPlayZone)}catch(e){}
    if(isCrashActive()){
      try{tg.BackButton.onClick(goPlayZone);tg.BackButton.show()}catch(e){}
    }else{
      try{tg.BackButton.hide()}catch(e){}
    }
  }
  function bind(){
    sync();
    document.addEventListener('click',function(){setTimeout(sync,80);setTimeout(sync,260)},true);
    var obs=new MutationObserver(sync);
    try{obs.observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']})}catch(e){}
    document.addEventListener('visibilitychange',function(){if(!document.hidden)sync()});
    window.addEventListener('focus',sync);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
`;
