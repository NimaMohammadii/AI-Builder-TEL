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
    style.textContent='.vexa-rank-page{position:fixed;inset:0;z-index:9998;display:block;overflow:auto;padding:calc(18px + env(safe-area-inset-top)) 18px calc(96px + env(safe-area-inset-bottom));background:radial-gradient(circle at 50% -10%,rgba(255,255,255,.08),rgba(255,255,255,0) 34%),rgba(5,5,7,.86);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);opacity:0;pointer-events:none;transform:translateX(18px);transition:opacity .26s ease,transform .32s cubic-bezier(.2,.9,.2,1);scrollbar-width:none}.vexa-rank-page::-webkit-scrollbar{display:none}.vexa-rank-page.open{opacity:1;pointer-events:auto;transform:translateX(0)}.vexa-rank-page-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 22px}.vexa-rank-back{width:38px;height:38px;border:0;border-radius:999px;background:rgba(255,255,255,.08);color:#fff;font-size:22px;font-weight:900;box-shadow:inset 0 1px 0 rgba(255,255,255,.12)}.vexa-rank-page-kicker{margin:0;color:rgba(255,255,255,.48);font-size:9px;font-weight:950;text-transform:uppercase;letter-spacing:.18em}.vexa-rank-page-title{margin:7px 0 0;color:#fff;font-size:34px;line-height:.9;font-weight:1000;letter-spacing:-.075em}.vexa-rank-page-sub{margin:10px 0 0;max-width:320px;color:rgba(255,255,255,.54);font-size:11px;line-height:1.35;font-weight:650;letter-spacing:-.02em}.vexa-rank-level-strip{display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;margin:0 0 22px;padding:0 0 18px;border-bottom:1px solid rgba(255,255,255,.09)}.vexa-rank-level-orb{width:56px;height:56px;border-radius:21px;display:grid;place-items:center;background:rgba(255,255,255,.08);box-shadow:inset 0 1px 0 rgba(255,255,255,.13);color:#fff;font-size:24px}.vexa-rank-level-main strong{display:block;color:#fff;font-size:20px;font-weight:1000;line-height:1;letter-spacing:-.055em}.vexa-rank-level-main span{display:block;margin-top:6px;color:rgba(255,255,255,.5);font-size:10px;font-weight:800}.vexa-rank-level-pill{height:32px;padding:0 12px;border-radius:999px;display:grid;place-items:center;background:#fff;color:#050505;font-size:10px;font-weight:1000;white-space:nowrap}.vexa-rank-system{position:relative;display:grid;gap:0;margin-top:4px}.vexa-rank-system:before{content:"";position:absolute;left:17px;top:22px;bottom:22px;width:1px;background:linear-gradient(180deg,rgba(255,255,255,.18),rgba(255,255,255,.05))}.vexa-rank-item{position:relative;display:grid;grid-template-columns:36px 1fr auto;gap:12px;align-items:start;padding:11px 0 13px;opacity:0;transform:translateY(10px);animation:vexaRankPageIn .38s ease forwards}.vexa-rank-dot{position:relative;z-index:1;width:36px;height:36px;border-radius:14px;display:grid;place-items:center;background:rgba(255,255,255,.075);box-shadow:inset 0 1px 0 rgba(255,255,255,.12);color:#fff;font-size:16px}.vexa-rank-item.current .vexa-rank-dot{background:#fff;color:#050505}.vexa-rank-info strong{display:block;color:#fff;font-size:15px;font-weight:1000;line-height:1;letter-spacing:-.045em}.vexa-rank-info p{margin:6px 0 0;color:rgba(255,255,255,.48);font-size:10px;line-height:1.28;font-weight:700;max-width:230px}.vexa-rank-range{color:rgba(255,255,255,.58);font-size:9px;font-weight:950;white-space:nowrap;margin-top:2px}.vexa-rank-now{display:inline-flex;margin-top:8px;height:22px;align-items:center;padding:0 8px;border-radius:999px;background:#fff;color:#050505;font-size:8px;font-weight:1000;letter-spacing:-.01em}.brand img.logo{cursor:pointer}@keyframes vexaRankPageIn{to{opacity:1;transform:translateY(0)}}@media(max-width:380px){.vexa-rank-page-title{font-size:30px}.vexa-rank-item{grid-template-columns:34px 1fr auto;gap:10px}.vexa-rank-dot{width:34px;height:34px;border-radius:13px}.vexa-rank-info p{max-width:190px;font-size:9px}.vexa-rank-range{font-size:8px}}';
    document.head.appendChild(style);
    var page=document.createElement('div');
    page.id='vexaRankModal';
    page.className='vexa-rank-page';
    page.setAttribute('aria-hidden','true');
    page.innerHTML='<div class="vexa-rank-page-top"><div><p class="vexa-rank-page-kicker">Vexa FLOW Status</p><h2 class="vexa-rank-page-title">Rank System</h2><p class="vexa-rank-page-sub">Your rank grows with your level. Higher ranks create stronger profile prestige across Vexa.</p></div><button class="vexa-rank-back" type="button" data-rank-close aria-label="Back">‹</button></div><div data-rank-current></div><div class="vexa-rank-system" data-rank-list></div>';
    document.body.appendChild(page);
    page.addEventListener('click',function(e){if(e.target.closest('[data-rank-close]'))closeRankModal()});
    document.addEventListener('keydown',function(e){if(e.key==='Escape')closeRankModal()});
    return page;
  }
  function rankIcon(name){return {Rookie:'✦',Explorer:'◆',Pro:'⬢',Elite:'✧',Master:'◇',Legend:'✺',Titan:'♛'}[name]||'✦'}
  function renderRankModal(){
    var p=clean(profile||{level:1,xp:0,totalXp:0});
    var page=ensureRankModal();
    var current=page.querySelector('[data-rank-current]');
    var list=page.querySelector('[data-rank-list]');
    var idx=rankIndex(p.rankName);
    current.innerHTML='<div class="vexa-rank-level-strip"><div class="vexa-rank-level-orb">'+rankIcon(p.rankName)+'</div><div class="vexa-rank-level-main"><strong>'+esc(p.rankName)+'</strong><span>Level '+p.level+' · '+p.progressPercent+'% progress · '+p.xpLeft+' XP left</span></div><div class="vexa-rank-level-pill">Current</div></div>';
    list.innerHTML=ranks.map(function(r,i){var cls=i===idx?'current':(i<idx?'done':'');return '<div class="vexa-rank-item '+cls+'" style="animation-delay:'+(i*38)+'ms"><div class="vexa-rank-dot">'+rankIcon(r.name)+'</div><div class="vexa-rank-info"><strong>'+esc(r.name)+'</strong><p>'+esc(r.text)+'</p>'+(i===idx?'<span class="vexa-rank-now">Current rank</span>':'')+'</div><div class="vexa-rank-range">'+esc(r.range)+'</div></div>'}).join('');
  }
  function openRankModal(){renderRankModal();var page=ensureRankModal();requestAnimationFrame(function(){page.classList.add('open');page.setAttribute('aria-hidden','false')})}
  function closeRankModal(){var page=document.getElementById('vexaRankModal');if(!page)return;page.classList.remove('open');page.setAttribute('aria-hidden','true')}
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