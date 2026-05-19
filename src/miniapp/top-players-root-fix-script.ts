export const TOP_PLAYERS_ROOT_FIX_SCRIPT = `
(function(){
  var tg=window.Telegram&&window.Telegram.WebApp;
  var bound=false;
  function page(){return document.getElementById('leaderboardPage')}
  function close(){
    var p=page();
    if(p){document.body.classList.remove('leaderboard-open');p.classList.remove('open');p.setAttribute('aria-hidden','true')}
    try{if(tg&&tg.BackButton)tg.BackButton.hide()}catch(e){}
  }
  function ensureStyle(){
    var old=document.getElementById('topPlayersRootFixStyle');
    if(old){try{old.remove()}catch(e){}}
    var style=document.createElement('style');
    style.id='topPlayersRootFixStyle';
    style.textContent=[
      '.leaderboard-page .leaderboard-back,.leaderboard-page .top-players-hero-back{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;width:0!important;height:0!important;padding:0!important;margin:0!important;overflow:hidden!important}',
      '.leaderboard-page .top-players-hero-card{position:relative!important;margin:0 0 22px!important;min-height:176px!important;border-radius:32px!important;padding:22px 132px 18px 20px!important;overflow:visible!important;background:rgba(255,255,255,.045)!important;border:1px solid rgba(255,255,255,.16)!important;box-shadow:0 28px 70px rgba(0,0,0,.34),0 0 56px rgba(126,20,48,.14),inset 0 1px 0 rgba(255,255,255,.18)!important;backdrop-filter:blur(3px) saturate(1.18)!important;-webkit-backdrop-filter:blur(3px) saturate(1.18)!important;isolation:isolate!important}',
      '.leaderboard-page .top-players-hero-card:before{content:""!important;position:absolute!important;inset:0!important;border-radius:32px!important;background:radial-gradient(circle at 76% 18%,rgba(126,20,48,.20),rgba(126,20,48,0) 42%),radial-gradient(circle at 12% 92%,rgba(255,255,255,.055),rgba(255,255,255,0) 34%)!important;z-index:-2!important}',
      '.leaderboard-page .top-players-hero-card:after{content:""!important;position:absolute!important;inset:0!important;border-radius:32px!important;background:linear-gradient(135deg,rgba(255,255,255,.08),rgba(255,255,255,0) 34%),radial-gradient(circle at 78% 40%,rgba(126,20,48,.18),rgba(126,20,48,0) 48%)!important;z-index:-1!important;opacity:.9!important}'
    ].join('');
    document.head.appendChild(style);
  }
  function clean(){
    ensureStyle();
    var p=page();
    if(!p)return;
    p.querySelectorAll('.leaderboard-back,.top-players-hero-back').forEach(function(n){try{n.remove()}catch(e){}});
    var open=p.classList.contains('open');
    if(tg&&tg.BackButton){
      if(!bound){bound=true;try{tg.BackButton.onClick(function(){var current=page();if(current&&current.classList.contains('open'))close()})}catch(e){}}
      try{if(open)tg.BackButton.show();else tg.BackButton.hide()}catch(e){}
    }
  }
  document.addEventListener('click',function(ev){
    var openButton=ev.target&&ev.target.closest&&ev.target.closest('[data-action="open-leaderboard"]');
    var closeButton=ev.target&&ev.target.closest&&ev.target.closest('[data-action="close-leaderboard"]');
    if(openButton){setTimeout(clean,0);setTimeout(clean,80);setTimeout(clean,500);setTimeout(clean,1400)}
    if(closeButton){setTimeout(clean,40)}
  },true);
  if(window.MutationObserver){
    try{new MutationObserver(function(){setTimeout(clean,20)}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']})}catch(e){}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){clean();setTimeout(clean,700)});else{clean();setTimeout(clean,700)}
})();
`;