export const LEVEL_SYNC_SCRIPT = `
(function(){
  var tg=window.Telegram&&window.Telegram.WebApp;
  var user=(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user)||{};
  var queue=Promise.resolve();
  var profile=null;
  var PLAY_XP_INTERVAL_MS=300000;
  var PLAY_XP_AMOUNT=30;
  var DAILY_XP_AMOUNT=50;
  var ACTIVE_WINDOW_MS=90000;
  var lastActivityAt=Date.now();
  var lastTickAt=Date.now();
  var playMs=0;
  var dailyChecked=false;
  var gameSections={plinko:1,mines:1,crash:1,wheel:1,dice:1,limbo:1,tower:1,coinflip:1,hilo:1};
  function id(){return String(user.id||localStorage.getItem('ownerId')||'').trim()}
  function section(){var active=document.querySelector('.view.active');return active&&active.id?active.id:'home'}
  function isGameSection(name){return !!gameSections[String(name||section()).replace(/^view-/,'')]}
  function todayKey(){return new Date().toISOString().slice(0,10)}
  function storageKey(){return 'vexa:play-xp-ms:'+id()}
  function dailyStorageKey(){return 'vexa:daily-xp:'+id()}
  function loadPlayMs(){try{var v=Number(localStorage.getItem(storageKey())||0);playMs=Math.max(0,Math.min(PLAY_XP_INTERVAL_MS-1,Math.floor(v)||0))}catch(e){playMs=0}}
  function savePlayMs(){try{var userId=id();if(userId)localStorage.setItem(storageKey(),String(Math.max(0,Math.min(PLAY_XP_INTERVAL_MS-1,Math.floor(playMs)||0))))}catch(e){}}
  function markActivity(){lastActivityAt=Date.now()}
  function rank(level){level=Math.max(1,Math.floor(Number(level)||1));if(level>=50)return 'Legend';if(level>=35)return 'Elite';if(level>=20)return 'Pro';if(level>=10)return 'Builder';if(level>=5)return 'Explorer';return 'Starter'}
  function need(level){level=Math.max(1,Math.floor(Number(level)||1));return Math.max(100,Math.floor(100*Math.pow(level,1.35)))}
  function clean(p){var level=Math.max(1,Math.floor(Number(p&&p.level)||1));var next=Math.max(1,Math.floor(Number(p&&p.nextLevelXp)||need(level)));var xp=Math.max(0,Math.min(next,Math.floor(Number(p&&p.xp)||0)));var percent=Math.max(0,Math.min(100,Math.floor(Number(p&&p.progressPercent)||((xp/next)*100))));return{level:level,xp:xp,totalXp:Math.max(0,Math.floor(Number(p&&p.totalXp)||0)),nextLevelXp:next,progressPercent:percent,xpLeft:Math.max(0,next-xp),rankName:String((p&&p.rankName)||rank(level))}}
  function render(p){p=clean(p);profile=p;var pill=document.getElementById('rankPill');if(pill)pill.textContent=p.rankName;var n=document.getElementById('userLine');if(!n)return;n.innerHTML='<span style="display:block;color:#fff;font-weight:800;font-size:12px;line-height:1">Level '+p.level+' <span style="color:rgba(255,255,255,.55);font-weight:700">• '+p.progressPercent+'%</span></span><span style="display:block;width:158px;height:6px;margin-top:6px;border-radius:999px;background:rgba(255,255,255,.12);overflow:hidden"><span style="display:block;width:'+p.progressPercent+'%;height:100%;border-radius:999px;background:linear-gradient(90deg,#5b0f24,#8f1d3d,#c03a5b);box-shadow:0 0 14px rgba(192,58,91,.48);transition:width .35s ease"></span></span><span style="display:block;margin-top:5px;color:rgba(255,255,255,.5);font-size:9.5px;line-height:1">'+p.xpLeft+' XP left to finish</span>'}
  function popup(level,rankName){var t=document.getElementById('toast');if(!t)return;t.textContent='Level Up '+level+' • '+rankName;t.style.display='block';setTimeout(function(){t.style.display='none'},2500)}
  function xpToast(amount){var t=document.getElementById('toast');if(!t)return;t.textContent='+'+amount+' XP';t.style.display='block';setTimeout(function(){t.style.display='none'},1800)}
  function preview(amount){amount=Math.max(0,Math.floor(Number(amount)||0));if(!amount)return;var p=clean(profile||{level:1,xp:0,totalXp:0});var old=p.level;p.xp+=amount;p.totalXp+=amount;while(p.xp>=p.nextLevelXp){p.xp-=p.nextLevelXp;p.level++;p.nextLevelXp=need(p.level)}p.progressPercent=Math.max(0,Math.min(100,Math.floor((p.xp/p.nextLevelXp)*100)));p.xpLeft=Math.max(0,p.nextLevelXp-p.xp);p.rankName=rank(p.level);render(p);if(p.level>old)popup(p.level,p.rankName)}
  function add(amount,source,metadata){var userId=id();amount=Math.max(0,Math.floor(Number(amount)||0));if(!userId||!amount)return;preview(amount);queue=queue.then(function(){return fetch('/app/api/level/xp',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({userId:userId,amount:amount,source:source||'activity',metadata:metadata||{section:section()}})}).then(function(r){return r.json().catch(function(){return null})}).then(function(j){if(j&&j.profile)render(j.profile);if(j&&j.leveledUp&&j.profile)popup(j.profile.level,j.profile.rankName)}).catch(function(){})})}
  function awardDailyOpen(){
    var userId=id();
    if(!userId||dailyChecked)return;
    dailyChecked=true;
    try{
      var key=dailyStorageKey(),today=todayKey();
      if(localStorage.getItem(key)===today)return;
      localStorage.setItem(key,today);
      add(DAILY_XP_AMOUNT,'daily-open',{date:today});
      xpToast(DAILY_XP_AMOUNT);
    }catch(e){}
  }
  function load(){var userId=id();if(!userId)return;loadPlayMs();fetch('/app/api/level?userId='+encodeURIComponent(userId)).then(function(r){return r.json()}).then(function(p){render(p);awardDailyOpen()}).catch(function(){awardDailyOpen()})}
  function tickPlayXp(){
    var now=Date.now();
    var elapsed=Math.max(0,Math.min(30000,now-lastTickAt));
    lastTickAt=now;
    if(!id())return;
    if(document.hidden)return;
    if(!isGameSection(section())){savePlayMs();return}
    if(now-lastActivityAt>ACTIVE_WINDOW_MS){savePlayMs();return}
    playMs+=elapsed;
    while(playMs>=PLAY_XP_INTERVAL_MS){
      playMs-=PLAY_XP_INTERVAL_MS;
      add(PLAY_XP_AMOUNT,'playtime',{section:section(),minutes:5});
      xpToast(PLAY_XP_AMOUNT);
    }
    savePlayMs();
  }
  window.VexaLevel={add:add,load:load};
  ['click','pointerdown','touchstart','keydown'].forEach(function(name){document.addEventListener(name,function(){if(isGameSection(section()))markActivity()},true)});
  document.addEventListener('visibilitychange',function(){lastTickAt=Date.now();if(!document.hidden){markActivity();awardDailyOpen()}});
  document.addEventListener('click',function(ev){var b=ev.target&&ev.target.closest&&ev.target.closest('button');if(!b)return;var a=b.getAttribute('data-action')||'';if(a==='generate-tts')setTimeout(function(){add(10,'ai',{section:section()})},700)},true);
  setInterval(tickPlayXp,15000);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){load();markActivity();lastTickAt=Date.now()});else{load();markActivity();lastTickAt=Date.now()}
})();
`;