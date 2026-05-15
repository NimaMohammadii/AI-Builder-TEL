export const LEVEL_SYNC_SCRIPT = `
(function(){
  var tg=window.Telegram&&window.Telegram.WebApp;
  var user=(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user)||{};
  var queue=Promise.resolve();
  var profile=null;
  var PLAY_XP_INTERVAL_MS=60000;
  var PLAY_XP_AMOUNT=10;
  var DAILY_XP_AMOUNT=50;
  var ACTIVE_WINDOW_MS=90000;
  var lastActivityAt=Date.now();
  var lastTickAt=Date.now();
  var playMs=0;
  var dailyChecked=false;
  var rankModalReady=false;
  var gameSections={plinko:1,mines:1,crash:1,wheel:1,dice:1,limbo:1,tower:1,coinflip:1,hilo:1};
  var ranks=[
    {name:'Rookie',range:'Level 1-3',min:1,max:3,text:'Start your Vexa journey.'},
    {name:'Explorer',range:'Level 4-7',min:4,max:7,text:'Discover games, AI and rewards.'},
    {name:'Pro',range:'Level 8-14',min:8,max:14,text:'Consistent player with real momentum.'},
    {name:'Elite',range:'Level 15-24',min:15,max:24,text:'Premium status and strong activity.'},
    {name:'Master',range:'Level 25-39',min:25,max:39,text:'Advanced user with high control.'},
    {name:'Legend',range:'Level 40-59',min:40,max:59,text:'Rare profile with serious prestige.'},
    {name:'Titan',range:'Level 60+',min:60,max:999,text:'The highest Vexa FLOW status.'}
  ];
  function id(){return String(user.id||localStorage.getItem('ownerId')||'').trim()}
  function section(){var active=document.querySelector('.view.active');return active&&active.id?active.id:'home'}
  function isGameSection(name){return !!gameSections[String(name||section()).replace(/^view-/,'')]}
  function todayKey(){return new Date().toISOString().slice(0,10)}
  function storageKey(){return 'vexa:play-xp-ms:'+id()}
  function dailyStorageKey(){return 'vexa:daily-xp:'+id()}
  function loadPlayMs(){try{var v=Number(localStorage.getItem(storageKey())||0);playMs=Math.max(0,Math.min(PLAY_XP_INTERVAL_MS-1,Math.floor(v)||0))}catch(e){playMs=0}}
  function savePlayMs(){try{var userId=id();if(userId)localStorage.setItem(storageKey(),String(Math.max(0,Math.min(PLAY_XP_INTERVAL_MS-1,Math.floor(playMs)||0))))}catch(e){}}
  function markActivity(){lastActivityAt=Date.now()}
  function esc(v){return String(v==null?'':v).replace(/[&<>]/g,function(s){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[s]||s})}
  function rank(level){level=Math.max(1,Math.floor(Number(level)||1));if(level>=60)return 'Titan';if(level>=40)return 'Legend';if(level>=25)return 'Master';if(level>=15)return 'Elite';if(level>=8)return 'Pro';if(level>=4)return 'Explorer';return 'Rookie'}
  function rankKey(value){return String(value||'Rookie').replace(/[^0-9A-Za-z_-]/g,'').slice(0,40)||'Rookie'}
  function setRankCharacter(rankName){try{var img=document.querySelector('.brand img.logo');if(!img)return;if(!img.dataset.defaultSrc)img.dataset.defaultSrc=img.getAttribute('src')||'https://t.me/i/userpic/320/VexaFlowBOT.jpg';var key=rankKey(rankName);var version=String(window.__vexaAppVersion||Date.now());var src='/app/api/rank-character/'+encodeURIComponent(key)+'.png?v='+version;if(img.getAttribute('src')!==src){img.onerror=function(){this.onerror=null;this.src=this.dataset.defaultSrc||'https://t.me/i/userpic/320/VexaFlowBOT.jpg'};img.src=src}bindRankModalTrigger(img)}catch(e){}}
  function need(level){level=Math.max(1,Math.floor(Number(level)||1));return Math.max(100,Math.floor(100*Math.pow(level,1.35)))}
  function clean(p){var level=Math.max(1,Math.floor(Number(p&&p.level)||1));var next=Math.max(1,Math.floor(Number(p&&p.nextLevelXp)||need(level)));var xp=Math.max(0,Math.min(next,Math.floor(Number(p&&p.xp)||0)));var percent=Math.max(0,Math.min(100,Math.floor(Number(p&&p.progressPercent)||((xp/next)*100))));return{level:level,xp:xp,totalXp:Math.max(0,Math.floor(Number(p&&p.totalXp)||0)),nextLevelXp:next,progressPercent:percent,xpLeft:Math.max(0,next-xp),rankName:String((p&&p.rankName)||rank(level))}}
  function rankIndex(name){for(var i=0;i<ranks.length;i++){if(ranks[i].name===name)return i}return 0}
  function ensureRankModal(){
    if(document.getElementById('vexaRankModal'))return document.getElementById('vexaRankModal');
    var style=document.createElement('style');
    style.textContent='.vexa-rank-overlay{position:fixed;inset:0;z-index:9998;display:flex;align-items:flex-start;justify-content:center;padding:calc(68px + env(safe-area-inset-top)) 18px 18px;background:rgba(0,0,0,.08);opacity:0;pointer-events:none;transition:opacity .26s ease}.vexa-rank-overlay.open{opacity:1;pointer-events:auto}.vexa-rank-card{width:min(100%,390px);max-height:none;overflow:hidden;border:0;border-radius:30px;background:linear-gradient(135deg,rgba(255,255,255,.075),rgba(255,255,255,.025));backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);box-shadow:0 22px 80px rgba(0,0,0,.46),inset 0 1px 0 rgba(255,255,255,.1);transform:translateY(-16px) scale(.96);opacity:.25;transition:transform .32s cubic-bezier(.2,.9,.2,1),opacity .26s ease}.vexa-rank-overlay.open .vexa-rank-card{transform:translateY(0) scale(1);opacity:1}.vexa-rank-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:14px 15px 7px;border-bottom:0}.vexa-rank-eyebrow{margin:0 0 3px;color:rgba(255,255,255,.45);font-size:8px;font-weight:950;text-transform:uppercase;letter-spacing:.15em}.vexa-rank-head h3{margin:0;color:#fff;font-size:22px;line-height:.95;letter-spacing:-.055em}.vexa-rank-head p{margin:5px 0 0;color:rgba(255,255,255,.56);font-size:10px;line-height:1.25;max-width:250px}.vexa-rank-close{width:31px;height:31px;border:0;border-radius:999px;background:rgba(255,255,255,.07);color:#fff;font-size:17px;font-weight:850}.vexa-rank-current{display:none!important}.vexa-rank-orb{width:52px;height:52px;border-radius:18px;display:grid;place-items:center;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);font-size:22px}.vexa-rank-current strong{display:block;color:#fff;font-size:17px;line-height:1}.vexa-rank-current span{display:block;margin-top:5px;color:rgba(255,255,255,.55);font-size:11px}.vexa-rank-list{max-height:none;overflow:visible;padding:2px 10px 10px;scrollbar-width:none}.vexa-rank-list::-webkit-scrollbar{display:none}.vexa-rank-row{position:relative;display:grid;grid-template-columns:40px 1fr auto;gap:8px;align-items:center;margin:4px 0;padding:6px 8px;border:1px solid rgba(255,255,255,.09);border-radius:16px;background:rgba(255,255,255,.035);transform:translateY(8px);opacity:0;animation:vexaRankIn .38s ease forwards;min-height:45px}.vexa-rank-row.current{border-color:rgba(255,255,255,.32);background:linear-gradient(135deg,rgba(255,255,255,.13),rgba(192,58,91,.13));box-shadow:0 10px 34px rgba(192,58,91,.11),inset 0 1px 0 rgba(255,255,255,.12)}.vexa-rank-row.done{background:rgba(255,255,255,.055)}.vexa-rank-badge{width:36px;height:36px;border-radius:14px;display:grid;place-items:center;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.18);font-size:17px}.vexa-rank-name{color:#fff;font-size:13px;font-weight:950;line-height:1}.vexa-rank-desc{margin-top:2px;color:rgba(255,255,255,.5);font-size:9px;line-height:1.15}.vexa-rank-range{color:rgba(255,255,255,.65);font-size:9px;font-weight:900;white-space:nowrap}.vexa-rank-now{display:inline-flex;margin-top:4px;padding:2px 6px;border-radius:999px;background:#fff;color:#050505;font-size:8px;font-weight:950}.brand img.logo{cursor:pointer}@keyframes vexaRankIn{to{transform:translateY(0);opacity:1}}@media(max-height:700px){.vexa-rank-overlay{padding-top:calc(58px + env(safe-area-inset-top))}.vexa-rank-head{padding:11px 14px 5px}.vexa-rank-head h3{font-size:20px}.vexa-rank-head p{font-size:9px;margin-top:4px}.vexa-rank-row{margin:3px 0;min-height:40px;padding:5px 7px}.vexa-rank-badge{width:30px;height:30px;border-radius:11px}.vexa-rank-name{font-size:12px}.vexa-rank-desc{font-size:8.2px}.vexa-rank-range{font-size:8px}.vexa-rank-now{font-size:7.5px;padding:2px 5px}}';
    document.head.appendChild(style);
    var overlay=document.createElement('div');
    overlay.id='vexaRankModal';
    overlay.className='vexa-rank-overlay';
    overlay.setAttribute('aria-hidden','true');
    overlay.innerHTML='<div class="vexa-rank-card" role="dialog" aria-modal="true" aria-label="Vexa ranks"><div class="vexa-rank-head"><div><p class="vexa-rank-eyebrow">Vexa FLOW</p><h3>Rank System</h3><p>Level up to unlock higher status and stronger profile prestige.</p></div><button class="vexa-rank-close" type="button" data-rank-close>×</button></div><div data-rank-current></div><div class="vexa-rank-list" data-rank-list></div></div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click',function(e){if(e.target===overlay||e.target.closest('[data-rank-close]'))closeRankModal()});
    document.addEventListener('keydown',function(e){if(e.key==='Escape')closeRankModal()});
    return overlay;
  }
  function rankIcon(name){return {Rookie:'✦',Explorer:'◆',Pro:'⬢',Elite:'✧',Master:'◇',Legend:'✺',Titan:'♛'}[name]||'✦'}
  function renderRankModal(){
    var p=clean(profile||{level:1,xp:0,totalXp:0});
    var overlay=ensureRankModal();
    var current=overlay.querySelector('[data-rank-current]');
    var list=overlay.querySelector('[data-rank-list]');
    var idx=rankIndex(p.rankName);
    current.innerHTML='<div class="vexa-rank-current"><div class="vexa-rank-orb">'+rankIcon(p.rankName)+'</div><div><strong>'+esc(p.rankName)+'</strong><span>Current rank · Level '+p.level+' · '+p.progressPercent+'%</span></div></div>';
    list.innerHTML=ranks.map(function(r,i){var cls=i===idx?'current':(i<idx?'done':'');return '<div class="vexa-rank-row '+cls+'" style="animation-delay:'+(i*34)+'ms"><div class="vexa-rank-badge">'+rankIcon(r.name)+'</div><div><div class="vexa-rank-name">'+esc(r.name)+'</div><div class="vexa-rank-desc">'+esc(r.text)+'</div>'+(i===idx?'<span class="vexa-rank-now">Current rank · Level '+p.level+'</span>':'')+'</div><div class="vexa-rank-range">'+esc(r.range)+'</div></div>'}).join('');
  }
  function openRankModal(){renderRankModal();var overlay=ensureRankModal();requestAnimationFrame(function(){overlay.classList.add('open');overlay.setAttribute('aria-hidden','false')})}
  function closeRankModal(){var overlay=document.getElementById('vexaRankModal');if(!overlay)return;overlay.classList.remove('open');overlay.setAttribute('aria-hidden','true')}
  function bindRankModalTrigger(img){if(!img||img.dataset.rankModalReady==='1')return;img.dataset.rankModalReady='1';img.setAttribute('role','button');img.setAttribute('tabindex','0');img.setAttribute('aria-label','Open rank system');img.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();openRankModal()});img.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();openRankModal()}})}
  function render(p){p=clean(p);profile=p;var pill=document.getElementById('rankPill');if(pill)pill.textContent=p.rankName;setRankCharacter(p.rankName);var n=document.getElementById('userLine');if(!n)return;n.innerHTML='<span style="display:block;color:#fff;font-weight:800;font-size:12px;line-height:1">Level '+p.level+' <span style="color:rgba(255,255,255,.55);font-weight:700">• '+p.progressPercent+'%</span></span><span style="display:block;width:158px;height:6px;margin-top:6px;border-radius:999px;background:rgba(255,255,255,.12);overflow:hidden"><span style="display:block;width:'+p.progressPercent+'%;height:100%;border-radius:999px;background:linear-gradient(90deg,#5b0f24,#8f1d3d,#c03a5b);box-shadow:0 0 14px rgba(192,58,91,.48);transition:width .35s ease"></span></span><span style="display:block;margin-top:5px;color:rgba(255,255,255,.5);font-size:9.5px;line-height:1">'+p.xpLeft+' XP left to finish</span>'}
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
      add(PLAY_XP_AMOUNT,'playtime',{section:section(),minutes:1});
      xpToast(PLAY_XP_AMOUNT);
    }
    savePlayMs();
  }
  window.VexaLevel={add:add,load:load,openRanks:openRankModal};
  ['click','pointerdown','touchstart','keydown'].forEach(function(name){document.addEventListener(name,function(){if(isGameSection(section()))markActivity()},true)});
  document.addEventListener('visibilitychange',function(){lastTickAt=Date.now();if(!document.hidden){markActivity();awardDailyOpen()}});
  document.addEventListener('click',function(ev){var b=ev.target&&ev.target.closest&&ev.target.closest('button');if(!b)return;var a=b.getAttribute('data-action')||'';if(a==='generate-tts')setTimeout(function(){add(10,'ai',{section:section()})},700)},true);
  setInterval(tickPlayXp,15000);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){load();markActivity();lastTickAt=Date.now()});else{load();markActivity();lastTickAt=Date.now()}
})();
`;