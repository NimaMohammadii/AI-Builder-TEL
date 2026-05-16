export const VEXA_LEAGUE_SCRIPT = `
(function(){
  function esc(v){return String(v==null?'':v).replace(/[&<>]/g,function(s){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[s]||s})}
  function q(id){return document.getElementById(id)}
  function userId(){var tg=window.Telegram&&window.Telegram.WebApp;var u=tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user;return String((u&&u.id)||localStorage.getItem('ownerId')||'').trim()}
  function fallbackLeague(){
    var now=new Date();var end=new Date(now.getTime()+4*86400000+12*3600000);
    return {currentWeek:{title:'Top Players',status:'preview',winnerCount:50,startsAt:now.toISOString(),endsAt:end.toISOString(),announcement:'Top 50 players.'},userState:{vex:0,claimedMissionIds:[]},seedUsers:[
      {position:1,name:'NexaWolf',username:'nxwolf',avatarInitials:'NX',level:68,rankName:'Titan',vex:2600,balanceTon:420},{position:2,name:'AriaFlow',username:'ariaflow',avatarInitials:'AR',level:61,rankName:'Titan',vex:2540,balanceTon:392},{position:3,name:'VexaKing',username:'vexaking',avatarInitials:'VK',level:56,rankName:'Legend',vex:2480,balanceTon:354},{position:4,name:'MoonPilot',username:'moonpilot',avatarInitials:'MP',level:49,rankName:'Legend',vex:2390,balanceTon:318},{position:5,name:'BlackNova',username:'blacknova',avatarInitials:'BN',level:44,rankName:'Legend',vex:2310,balanceTon:286},{position:6,name:'SilverVex',username:'silvervex',avatarInitials:'SV',level:39,rankName:'Master',vex:2240,balanceTon:260},{position:7,name:'CryptoRay',username:'cryptoray',avatarInitials:'CR',level:36,rankName:'Master',vex:2180,balanceTon:231},{position:8,name:'Axion',username:'axion',avatarInitials:'AX',level:33,rankName:'Master',vex:2090,balanceTon:204},{position:9,name:'EliteLuna',username:'eliteluna',avatarInitials:'EL',level:29,rankName:'Master',vex:2010,balanceTon:188},{position:10,name:'OrionAI',username:'orionai',avatarInitials:'OR',level:25,rankName:'Master',vex:1940,balanceTon:166}
    ],topPlayersHeroImageUrl:'/app/api/top-players-hero-image?v=fallback'};
  }
  function vexaData(){
    var data=window.VexaData=window.VexaData||{};
    if(!data.loadLeague){
      data.league=null;
      data.leagueInFlight=null;
      data.setLeague=function(next){data.league=next;return data.league};
      data.loadLeague=function(force){
        if(!force&&data.league)return Promise.resolve(data.league);
        if(data.leagueInFlight)return data.leagueInFlight;
        data.leagueInFlight=(async function(){
          try{var id=userId();var url='/app/api/vexa-league'+(id?'?userId='+encodeURIComponent(id):'');var r=await fetch(url,{headers:{accept:'application/json'},cache:'no-store'});var j=await r.json().catch(function(){return null});if(r.ok&&j&&j.ok){data.league=j;return j}}
          catch(e){}
          data.league=fallbackLeague();return data.league;
        })().finally(function(){data.leagueInFlight=null});
        return data.leagueInFlight;
      };
    }
    return data;
  }
  function remaining(end){var ms=new Date(end||0).getTime()-Date.now();if(!Number.isFinite(ms)||ms<=0)return 'Ending soon';var d=Math.floor(ms/86400000);var h=Math.floor((ms%86400000)/3600000);return d+'d '+h+'h'}
  async function loadLeague(force){return vexaData().loadLeague(Boolean(force))}
  function updateHomeCard(){
    var entry=q('leaderboardEntry');if(!entry)return;
    entry.setAttribute('data-action','open-leaderboard');
    var main=entry.querySelector('.home-leaderboard-main');
    if(main)main.innerHTML='<span>Top Players</span><strong>Top 50 Players</strong><small>Players, ranks, Vex and TON balance</small>';
  }
  function playerRow(p){var pos=p.position||p.i||1;return '<div class="leaderboard-row '+(pos<=3?'top':'')+'"><div class="leaderboard-place">#'+esc(pos)+'</div><div class="leaderboard-avatar">'+esc(p.avatarInitials||String(p.name||'VX').slice(0,2).toUpperCase())+'</div><div class="leaderboard-user"><strong>'+esc(p.name||'Vexa Player')+'</strong><span class="leaderboard-username">@'+esc(p.username||'player')+'</span><span>Level '+esc(p.level||1)+' · '+esc(p.rankName||'Rookie')+'</span><span class="leaderboard-rank">'+esc(p.vex||0)+' Vex</span></div><div class="leaderboard-meta"><strong>'+esc(p.balanceTon||0)+' TON</strong><span>Balance</span></div></div>'}
  function heroImage(d){return esc((d&&d.topPlayersHeroImageUrl)||('/app/api/top-players-hero-image?v='+String(Date.now())))}
  function heroCard(d,w,yourVex){
    return '<section class="top-players-hero-card"><p class="top-players-hero-kicker">Top Players</p><h2 class="top-players-hero-title">Top 50 Players</h2><p class="top-players-hero-sub">'+esc(w.announcement||'Climb the weekly race, earn Vex, and claim your place.')+'</p><div class="top-players-hero-stats"><span><b>'+esc(yourVex)+'</b><small>Your Vex</small></span><span><b>'+esc(remaining(w.endsAt))+'</b><small>Ends In</small></span><span><b>Top '+esc(w.winnerCount||50)+'</b><small>Players</small></span></div><div class="top-players-hero-art"><img src="'+heroImage(d)+'" alt="" onerror="this.style.display=\'none\';this.parentNode.innerHTML=\'<div class=&quot;top-players-hero-placeholder&quot;>#</div>\'"/></div><button class="leaderboard-back top-players-hero-back" type="button" data-action="close-leaderboard" aria-label="Back">‹</button></section>'
  }
  function renderLeague(d){
    var page=q('leaderboardPage');if(!page)return;
    d=d||fallbackLeague();
    var w=d.currentWeek||{};var users=d.seedUsers||[];var yourVex=Number(d.userState&&d.userState.vex||0)||0;
    page.innerHTML=heroCard(d,w,yourVex)+'<div class="missions-title" style="margin-top:18px"><strong>Top Players</strong><span>Top 50</span></div><div class="leaderboard-list">'+(users.length?users.slice(0,50).map(playerRow).join(''):'<div class="mission-row"><span class="mission-icon">#</span><span class="mission-main"><strong>No players yet</strong><span>Generate seed users from admin panel.</span></span><span class="mission-reward">Top 50</span></div>')+'</div>';
    if(window.VexaTopPlayersHero&&window.VexaTopPlayersHero.refresh)try{window.VexaTopPlayersHero.refresh()}catch(e){}
  }
  function renderLoading(){var page=q('leaderboardPage');if(!page)return;page.innerHTML='<section class="top-players-hero-card"><p class="top-players-hero-kicker">Top Players</p><h2 class="top-players-hero-title">Top 50 Players</h2><p class="top-players-hero-sub">Loading players...</p><div class="top-players-hero-art"><div class="top-players-hero-placeholder">#</div></div><button class="leaderboard-back top-players-hero-back" type="button" data-action="close-leaderboard" aria-label="Back">‹</button></section><div class="missions-title" style="margin-top:18px"><strong>Top Players</strong><span>Loading</span></div><div class="leaderboard-list"><div class="mission-row"><span class="mission-icon">#</span><span class="mission-main"><strong>Loading players</strong><span>Preparing Top 50 list</span></span><span class="mission-reward">...</span></div></div>';if(window.VexaTopPlayersHero&&window.VexaTopPlayersHero.refresh)try{window.VexaTopPlayersHero.refresh()}catch(e){}}
  async function refresh(force){updateHomeCard();renderLoading();try{var d=await loadLeague(Boolean(force));renderLeague(d)}catch(e){renderLeague(fallbackLeague())}}
  window.VexaLeague={refresh:refresh,load:loadLeague,render:renderLeague};
  document.addEventListener('click',function(ev){var b=ev.target&&ev.target.closest&&ev.target.closest('[data-action="open-leaderboard"]');if(b)setTimeout(function(){refresh(false)},80)},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){updateHomeCard()});else updateHomeCard();
})();
`;