export const VEXA_LEAGUE_SCRIPT = `
(function(){
  var cachedLeague=null;
  function esc(v){return String(v==null?'':v).replace(/[&<>]/g,function(s){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[s]||s})}
  function q(id){return document.getElementById(id)}
  function userId(){var tg=window.Telegram&&window.Telegram.WebApp;var u=tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user;return String((u&&u.id)||localStorage.getItem('ownerId')||'').trim()}
  function fallbackLeague(){
    var now=new Date();var end=new Date(now.getTime()+4*86400000+12*3600000);
    return {currentWeek:{title:'Top Players',status:'preview',winnerCount:50,startsAt:now.toISOString(),endsAt:end.toISOString(),announcement:'Top 50 players.'},userState:{vex:0,claimedMissionIds:[]},seedUsers:[
      {position:1,name:'NexaWolf',username:'nxwolf',avatarInitials:'NX',level:68,rankName:'Titan',vex:2600,balanceTon:420},{position:2,name:'AriaFlow',username:'ariaflow',avatarInitials:'AR',level:61,rankName:'Titan',vex:2540,balanceTon:392},{position:3,name:'VexaKing',username:'vexaking',avatarInitials:'VK',level:56,rankName:'Legend',vex:2480,balanceTon:354},{position:4,name:'MoonPilot',username:'moonpilot',avatarInitials:'MP',level:49,rankName:'Legend',vex:2390,balanceTon:318},{position:5,name:'BlackNova',username:'blacknova',avatarInitials:'BN',level:44,rankName:'Legend',vex:2310,balanceTon:286},{position:6,name:'SilverVex',username:'silvervex',avatarInitials:'SV',level:39,rankName:'Master',vex:2240,balanceTon:260},{position:7,name:'CryptoRay',username:'cryptoray',avatarInitials:'CR',level:36,rankName:'Master',vex:2180,balanceTon:231},{position:8,name:'Axion',username:'axion',avatarInitials:'AX',level:33,rankName:'Master',vex:2090,balanceTon:204},{position:9,name:'EliteLuna',username:'eliteluna',avatarInitials:'EL',level:29,rankName:'Master',vex:2010,balanceTon:188},{position:10,name:'OrionAI',username:'orionai',avatarInitials:'OR',level:25,rankName:'Master',vex:1940,balanceTon:166}
    ]};
  }
  function remaining(end){var ms=new Date(end||0).getTime()-Date.now();if(!Number.isFinite(ms)||ms<=0)return 'Ending soon';var d=Math.floor(ms/86400000);var h=Math.floor((ms%86400000)/3600000);return d+'d '+h+'h'}
  async function loadLeague(){
    try{var id=userId();var url='/app/api/vexa-league'+(id?'?userId='+encodeURIComponent(id):'');var r=await fetch(url,{headers:{accept:'application/json'},cache:'no-store'});var j=await r.json().catch(function(){return null});if(r.ok&&j&&j.ok){cachedLeague=j;return j}}
    catch(e){}
    cachedLeague=fallbackLeague();return cachedLeague;
  }
  function updateHomeCard(){
    var entry=q('leaderboardEntry');if(!entry)return;
    entry.setAttribute('data-action','open-leaderboard');
    var main=entry.querySelector('.home-leaderboard-main');
    if(main)main.innerHTML='<span>Top Players</span><strong>Top 50 Players</strong><small>Players, ranks, Vex and TON balance</small>';
  }
  function playerRow(p){var pos=p.position||p.i||1;return '<div class="leaderboard-row '+(pos<=3?'top':'')+'"><div class="leaderboard-place">#'+esc(pos)+'</div><div class="leaderboard-avatar">'+esc(p.avatarInitials||String(p.name||'VX').slice(0,2).toUpperCase())+'</div><div class="leaderboard-user"><strong>'+esc(p.name||'Vexa Player')+'</strong><span class="leaderboard-username">@'+esc(p.username||'player')+'</span><span>Level '+esc(p.level||1)+' · '+esc(p.rankName||'Rookie')+'</span><span class="leaderboard-rank">'+esc(p.vex||0)+' Vex</span></div><div class="leaderboard-meta"><strong>'+esc(p.balanceTon||0)+' TON</strong><span>Balance</span></div></div>'}
  function renderLeague(d){
    var page=q('leaderboardPage');if(!page)return;
    var w=d.currentWeek||{};var users=d.seedUsers||[];var yourVex=Number(d.userState&&d.userState.vex||0)||0;
    page.innerHTML='<div class="leaderboard-top"><div><p class="leaderboard-kicker">Top Players</p><h2 class="leaderboard-title">Top 50 Players</h2><p class="leaderboard-sub">'+esc(w.announcement||'Players, ranks, Vex and TON balance.')+'</p></div><button class="leaderboard-back" type="button" data-action="close-leaderboard" aria-label="Back">‹</button></div><div class="leaderboard-summary"><div class="leaderboard-stat"><span>Your Vex</span><strong data-vl-your-vex>'+esc(yourVex)+'</strong></div><div class="leaderboard-stat"><span>Ends In</span><strong>'+esc(remaining(w.endsAt))+'</strong></div><div class="leaderboard-stat"><span>Players</span><strong>Top '+esc(w.winnerCount||50)+'</strong></div></div><div class="missions-title" style="margin-top:18px"><strong>Top Players</strong><span>Top 50</span></div><div class="leaderboard-list">'+(users.length?users.slice(0,50).map(playerRow).join(''):'<div class="mission-row"><span class="mission-icon">#</span><span class="mission-main"><strong>No players yet</strong><span>Generate seed users from admin panel.</span></span><span class="mission-reward">Top 50</span></div>')+'</div>';
  }
  async function refresh(){updateHomeCard();var d=await loadLeague();renderLeague(d)}
  window.VexaLeague={refresh:refresh,load:loadLeague};
  document.addEventListener('click',function(ev){var b=ev.target&&ev.target.closest&&ev.target.closest('button[data-action="open-leaderboard"]');if(b)setTimeout(refresh,80)},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(refresh,600)});else setTimeout(refresh,600);
})();
`;