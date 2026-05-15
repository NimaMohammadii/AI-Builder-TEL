export const VEXA_LEAGUE_SCRIPT = `
(function(){
  var cachedLeague=null;
  function esc(v){return String(v==null?'':v).replace(/[&<>]/g,function(s){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[s]||s})}
  function q(id){return document.getElementById(id)}
  function todayKey(){return new Date().toISOString().slice(0,10)}
  function claimStoreKey(){return 'vexaLeagueClaims:'+todayKey()}
  function readClaims(){try{return JSON.parse(localStorage.getItem(claimStoreKey())||'{}')||{}}catch(e){return {}}}
  function writeClaims(v){try{localStorage.setItem(claimStoreKey(),JSON.stringify(v||{}))}catch(e){}}
  function claimedVex(){var c=readClaims();return Object.keys(c).reduce(function(total,k){return total+(Number(c[k])||0)},0)}
  function fallbackLeague(){
    var now=new Date();var end=new Date(now.getTime()+4*86400000+12*3600000);
    return {currentWeek:{title:'Vexa Weekly Race',status:'preview',rewardsEnabled:false,seedUsersEnabled:true,showPrizes:true,winnerCount:50,startsAt:now.toISOString(),endsAt:end.toISOString(),announcement:'Complete missions, earn Vex and climb the weekly race.'},todayMissions:[
      {id:'daily-checkin',templateId:'daily-checkin',title:'Daily Check-in',description:'Open Vexa once today.',vexAmount:20},{id:'play-3-games',templateId:'play-3-games',title:'Play 3 Games',description:'Complete any three Play Zone rounds.',vexAmount:70},{id:'use-ai-chat',templateId:'use-ai-chat',title:'Use AI Chat',description:'Send one message to Vexa AI.',vexAmount:40},{id:'open-leaderboard',templateId:'open-leaderboard',title:'Open Vexa League',description:'View the weekly leaderboard.',vexAmount:15}
    ],weeklyPrizes:[],seedUsers:[
      {position:1,name:'NexaWolf',username:'nxwolf',avatarInitials:'NX',level:68,rankName:'Titan',vex:2600,balanceTon:420},{position:2,name:'AriaFlow',username:'ariaflow',avatarInitials:'AR',level:61,rankName:'Titan',vex:2540,balanceTon:392},{position:3,name:'VexaKing',username:'vexaking',avatarInitials:'VK',level:56,rankName:'Legend',vex:2480,balanceTon:354},{position:4,name:'MoonPilot',username:'moonpilot',avatarInitials:'MP',level:49,rankName:'Legend',vex:2390,balanceTon:318},{position:5,name:'BlackNova',username:'blacknova',avatarInitials:'BN',level:44,rankName:'Legend',vex:2310,balanceTon:286},{position:6,name:'SilverVex',username:'silvervex',avatarInitials:'SV',level:39,rankName:'Master',vex:2240,balanceTon:260},{position:7,name:'CryptoRay',username:'cryptoray',avatarInitials:'CR',level:36,rankName:'Master',vex:2180,balanceTon:231},{position:8,name:'Axion',username:'axion',avatarInitials:'AX',level:33,rankName:'Master',vex:2090,balanceTon:204},{position:9,name:'EliteLuna',username:'eliteluna',avatarInitials:'EL',level:29,rankName:'Master',vex:2010,balanceTon:188},{position:10,name:'OrionAI',username:'orionai',avatarInitials:'OR',level:25,rankName:'Master',vex:1940,balanceTon:166}
    ]};
  }
  function remaining(end){var ms=new Date(end||0).getTime()-Date.now();if(!Number.isFinite(ms)||ms<=0)return 'Ending soon';var d=Math.floor(ms/86400000);var h=Math.floor((ms%86400000)/3600000);return d+'d '+h+'h'}
  async function loadLeague(){
    try{var r=await fetch('/app/api/vexa-league',{headers:{accept:'application/json'},cache:'no-store'});var j=await r.json().catch(function(){return null});if(r.ok&&j&&j.ok){cachedLeague=j;return j}}
    catch(e){}
    cachedLeague=fallbackLeague();return cachedLeague;
  }
  function updateHomeCard(){
    var entry=q('leaderboardEntry');if(!entry)return;
    entry.setAttribute('data-action','open-leaderboard');
    var main=entry.querySelector('.home-leaderboard-main');
    if(main)main.innerHTML='<span>Vexa League</span><strong>Weekly Vex Race</strong><small>Earn Vex, complete missions and climb Top 50</small>';
  }
  function missionKey(m,i){return String(m.id||m.templateId||m.title||('mission-'+i)).replace(/[^0-9A-Za-z_-]/g,'_')}
  function missionRow(m,i){var key=missionKey(m,i);var claims=readClaims();var done=claims[key]!=null;return '<div class="mission-row '+(i===0?'primary':'')+'" data-vl-mission-row="'+esc(key)+'"><span class="mission-icon">'+(done?'✓':(i+1))+'</span><span class="mission-main"><strong>'+esc(m.title||'Mission')+'</strong><span>'+esc(m.description||'Complete mission')+'</span></span><button class="mission-reward" type="button" data-vl-claim="'+esc(key)+'" data-vl-vex="'+esc(m.vexAmount||0)+'" '+(done?'disabled':'')+'>'+(done?'Claimed':'+'+esc(m.vexAmount||0)+' Vex')+'</button></div>'}
  function prizeRow(p){var range='#'+esc(p.rankFrom||1)+(Number(p.rankTo||p.rankFrom)>Number(p.rankFrom||1)?' - #'+esc(p.rankTo):'');return '<div class="mission-row"><span class="mission-icon">★</span><span class="mission-main"><strong>'+esc(range)+'</strong><span>'+esc(p.title||'Weekly Prize')+'</span></span><span class="mission-reward">Prize</span></div>'}
  function playerRow(p){var pos=p.position||p.i||1;return '<div class="leaderboard-row '+(pos<=3?'top':'')+'"><div class="leaderboard-place">#'+esc(pos)+'</div><div class="leaderboard-avatar">'+esc(p.avatarInitials||String(p.name||'VX').slice(0,2).toUpperCase())+'</div><div class="leaderboard-user"><strong>'+esc(p.name||'Vexa Player')+'</strong><span class="leaderboard-username">@'+esc(p.username||'player')+'</span><span>Level '+esc(p.level||1)+' · '+esc(p.rankName||'Rookie')+'</span><span class="leaderboard-rank">'+esc(p.vex||0)+' Vex</span></div><div class="leaderboard-meta"><strong>'+esc(p.balanceTon||0)+' TON</strong><span>Weekly Race</span></div></div>'}
  function renderLeague(d){
    var page=q('leaderboardPage');if(!page)return;
    var w=d.currentWeek||{};var missions=d.todayMissions||d.missions||[];var prizes=d.weeklyPrizes||d.prizes||[];var users=d.seedUsers||[];
    var yourVex=claimedVex();
    var prizeHtml=w.rewardsEnabled&&prizes.length?'<div class="missions-title"><strong>Weekly Prizes</strong><span>Top '+esc(w.winnerCount||50)+'</span></div><div class="missions-list">'+prizes.slice(0,4).map(prizeRow).join('')+'</div>':'<div class="missions-title"><strong>Weekly Prizes</strong><span>Warm-up</span></div><div class="mission-row"><span class="mission-icon">◇</span><span class="mission-main"><strong>Practice Race</strong><span>This week rewards are controlled by admin and may be disabled.</span></span><span class="mission-reward">No prize</span></div>';
    page.innerHTML='<div class="leaderboard-top"><div><p class="leaderboard-kicker">Vexa League</p><h2 class="leaderboard-title">Weekly Vex Race</h2><p class="leaderboard-sub">'+esc(w.announcement||'Complete missions, earn Vex and climb the weekly leaderboard.')+'</p></div><button class="leaderboard-back" type="button" data-action="close-leaderboard" aria-label="Back">‹</button></div><div class="leaderboard-summary"><div class="leaderboard-stat"><span>Your Vex</span><strong data-vl-your-vex>'+esc(yourVex)+'</strong></div><div class="leaderboard-stat"><span>Ends In</span><strong>'+esc(remaining(w.endsAt))+'</strong></div><div class="leaderboard-stat"><span>Winners</span><strong>Top '+esc(w.winnerCount||50)+'</strong></div></div><div class="missions-title"><strong>Earn Vex Today</strong><span>'+esc(missions.length)+' missions</span></div><div class="missions-list">'+(missions.length?missions.slice(0,8).map(missionRow).join(''):'<div class="mission-row"><span class="mission-icon">+</span><span class="mission-main"><strong>No missions selected</strong><span>Admin will add today missions from the panel.</span></span><span class="mission-reward">Vex</span></div>')+'</div>'+prizeHtml+'<div class="missions-title" style="margin-top:18px"><strong>Top Players</strong><span>Seed + real users</span></div><div class="leaderboard-list">'+(users.length?users.slice(0,50).map(playerRow).join(''):'<div class="mission-row"><span class="mission-icon">#</span><span class="mission-main"><strong>No players yet</strong><span>Generate seed users from admin panel.</span></span><span class="mission-reward">Top 50</span></div>')+'</div>';
  }
  function claimMission(btn){var key=btn.getAttribute('data-vl-claim');var amount=Math.max(0,Math.floor(Number(btn.getAttribute('data-vl-vex'))||0));if(!key||btn.disabled)return;var claims=readClaims();if(claims[key]!=null)return;claims[key]=amount;writeClaims(claims);btn.disabled=true;btn.textContent='Claimed';var row=btn.closest&&btn.closest('[data-vl-mission-row]');if(row){var icon=row.querySelector('.mission-icon');if(icon)icon.textContent='✓'}var total=q('leaderboardPage')&&q('leaderboardPage').querySelector('[data-vl-your-vex]');if(total)total.textContent=String(claimedVex());try{var toast=q('toast');if(toast){toast.textContent='+'+amount+' Vex claimed';toast.style.display='block';setTimeout(function(){toast.style.display='none'},2200)}}catch(e){}}
  async function refresh(){updateHomeCard();var d=await loadLeague();renderLeague(d)}
  window.VexaLeague={refresh:refresh,load:loadLeague};
  document.addEventListener('click',function(ev){var claim=ev.target&&ev.target.closest&&ev.target.closest('[data-vl-claim]');if(claim){ev.preventDefault();ev.stopPropagation();claimMission(claim);return}var b=ev.target&&ev.target.closest&&ev.target.closest('button[data-action="open-leaderboard"]');if(b)setTimeout(refresh,80)},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(refresh,600)});else setTimeout(refresh,600);
})();
`;