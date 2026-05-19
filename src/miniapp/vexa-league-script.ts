export const VEXA_LEAGUE_SCRIPT = `
(function(){
  var refreshToken=0;
  var autoRenderTimer=0;
  var nativeBackBound=false;
  var tg=window.Telegram&&window.Telegram.WebApp;
  function esc(v){return String(v==null?'':v).replace(/[&<>]/g,function(s){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[s]||s})}
  function q(id){return document.getElementById(id)}
  function userId(){var u=tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user;return String((u&&u.id)||localStorage.getItem('ownerId')||'').trim()}
  function closeLeaderboard(){var page=q('leaderboardPage');if(page){document.body.classList.remove('leaderboard-open');page.classList.remove('open');page.setAttribute('aria-hidden','true')}try{if(tg&&tg.BackButton)tg.BackButton.hide()}catch(e){}}
  function syncNativeBack(){var page=q('leaderboardPage');if(page){page.querySelectorAll('.leaderboard-back').forEach(function(n){try{n.remove()}catch(e){}})}var isOpen=!!(page&&page.classList.contains('open'));if(!tg||!tg.BackButton)return;if(!nativeBackBound){nativeBackBound=true;try{tg.BackButton.onClick(closeLeaderboard)}catch(e){}}try{if(isOpen)tg.BackButton.show();else tg.BackButton.hide()}catch(e){}}
  function ensureHeroStyle(){
    if(document.getElementById('topPlayersHeroStyle'))return;
    var style=document.createElement('style');
    style.id='topPlayersHeroStyle';
    style.textContent='.leaderboard-page .leaderboard-top,.leaderboard-page .leaderboard-summary{display:none!important}.leaderboard-page .leaderboard-back{display:none!important}.top-players-hero-card{position:relative;margin:0 0 22px;min-height:176px;border-radius:32px;padding:22px 132px 18px 20px;overflow:visible;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.16);box-shadow:0 28px 70px rgba(0,0,0,.34),0 0 56px rgba(126,20,48,.14),inset 0 1px 0 rgba(255,255,255,.18);backdrop-filter:blur(3px) saturate(1.18);-webkit-backdrop-filter:blur(3px) saturate(1.18);isolation:isolate}.top-players-hero-card:before{content:"";position:absolute;inset:0;border-radius:32px;background:radial-gradient(circle at 76% 18%,rgba(126,20,48,.20),rgba(126,20,48,0) 42%),radial-gradient(circle at 12% 92%,rgba(255,255,255,.055),rgba(255,255,255,0) 34%);z-index:-2}.top-players-hero-card:after{content:"";position:absolute;inset:0;border-radius:32px;background:linear-gradient(135deg,rgba(255,255,255,.08),rgba(255,255,255,0) 34%),radial-gradient(circle at 78% 40%,rgba(126,20,48,.18),rgba(126,20,48,0) 48%);z-index:-1;opacity:.9}.top-players-hero-kicker{margin:0 0 8px;color:rgba(255,255,255,.50);font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.18em}.top-players-hero-title{margin:0;color:#fff;font-size:34px;line-height:.9;font-weight:900;letter-spacing:-.065em;text-shadow:0 0 28px rgba(126,20,48,.26)}.top-players-hero-sub{margin:11px 0 0;max-width:190px;color:rgba(255,255,255,.60);font-size:11px;line-height:1.35;font-weight:600;letter-spacing:-.01em}.top-players-hero-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;max-width:206px;margin-top:14px}.top-players-hero-stats span{min-width:0;height:44px;border-radius:15px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.085);box-shadow:inset 0 1px 0 rgba(255,255,255,.10);display:flex;flex-direction:column;align-items:flex-start;justify-content:center;padding:0 8px}.top-players-hero-stats b{display:block;color:#fff;font-size:11.5px;font-weight:900;line-height:1;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis}.top-players-hero-stats small{display:block;margin-top:5px;color:rgba(255,255,255,.46);font-size:7.3px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;white-space:nowrap}.top-players-hero-art{position:absolute;right:12px;top:-26px;width:122px;height:168px;display:grid;place-items:center;animation:topPlayersFloat 3.8s ease-in-out infinite;filter:drop-shadow(0 26px 34px rgba(0,0,0,.38))}.top-players-hero-art img{max-width:132px;max-height:176px;object-fit:contain;display:block}.top-players-hero-placeholder{width:94px;height:94px;border-radius:28px;display:grid;place-items:center;background:linear-gradient(145deg,rgba(126,20,48,.26),rgba(255,255,255,.06));border:1px solid rgba(255,255,255,.12);color:#fff;font-size:34px;font-weight:900;box-shadow:inset 0 1px 0 rgba(255,255,255,.13)}@keyframes topPlayersFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-13px)}}@media(max-width:380px){.top-players-hero-card{padding-right:112px;min-height:166px}.top-players-hero-title{font-size:30px}.top-players-hero-sub{max-width:172px;font-size:10.5px}.top-players-hero-stats{max-width:184px;gap:5px}.top-players-hero-stats span{height:40px;padding:0 6px}.top-players-hero-stats b{font-size:10px}.top-players-hero-stats small{font-size:6.6px}.top-players-hero-art{right:4px;width:112px}.top-players-hero-art img{max-width:120px;max-height:164px}}';
    document.head.appendChild(style);
  }
  function fallbackLeague(){
    var now=new Date();var end=new Date(now.getTime()+4*86400000+12*3600000);
    return {currentWeek:{title:'Top Players',status:'preview',winnerCount:50,startsAt:now.toISOString(),endsAt:end.toISOString(),announcement:'Top 50 players.'},userState:{vex:0,claimedMissionIds:[]},seedUsers:[
      {position:1,name:'NexaWolf',username:'nxwolf',avatarInitials:'NX',level:68,rankName:'Titan',vex:2600,balanceTon:420},{position:2,name:'AriaFlow',username:'ariaflow',avatarInitials:'AR',level:61,rankName:'Titan',vex:2540,balanceTon:392},{position:3,name:'VexaKing',username:'vexaking',avatarInitials:'VK',level:56,rankName:'Legend',vex:2480,balanceTon:354},{position:4,name:'MoonPilot',username:'moonpilot',avatarInitials:'MP',level:49,rankName:'Legend',vex:2390,balanceTon:318},{position:5,name:'BlackNova',username:'blacknova',avatarInitials:'BN',level:44,rankName:'Legend',vex:2310,balanceTon:286},{position:6,name:'SilverVex',username:'silvervex',avatarInitials:'SV',level:39,rankName:'Master',vex:2240,balanceTon:260},{position:7,name:'CryptoRay',username:'cryptoray',avatarInitials:'CR',level:36,rankName:'Master',vex:2180,balanceTon:231},{position:8,name:'Axion',username:'axion',avatarInitials:'AX',level:33,rankName:'Master',vex:2090,balanceTon:204},{position:9,name:'EliteLuna',username:'eliteluna',avatarInitials:'EL',level:29,rankName:'Master',vex:2010,balanceTon:188},{position:10,name:'OrionAI',username:'orionai',avatarInitials:'OR',level:25,rankName:'Master',vex:1940,balanceTon:166}
    ],topPlayersHeroImageUrl:'/app/api/top-players-hero-image'};
  }
  function withTimeout(promise,ms){return new Promise(function(resolve,reject){var done=false;var timer=setTimeout(function(){if(done)return;done=true;reject(new Error('timeout'))},ms);promise.then(function(v){if(done)return;done=true;clearTimeout(timer);resolve(v)},function(e){if(done)return;done=true;clearTimeout(timer);reject(e)})})}
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
          try{var id=userId();var url='/app/api/vexa-league'+(id?'?userId='+encodeURIComponent(id):'');var r=await withTimeout(fetch(url,{headers:{accept:'application/json'},cache:'no-store'}),3500);var j=await r.json().catch(function(){return null});if(r.ok&&j&&j.ok){data.league=j;return j}}
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
  function heroImage(){return '/app/api/top-players-hero-image?v='+String(Date.now())}
  function heroImgHtml(){return '<img src="'+heroImage()+'" alt="" data-retry="0" onerror="var r=Number(this.dataset.retry||0);if(r<6){this.dataset.retry=String(r+1);var img=this;setTimeout(function(){img.style.display=\'block\';img.src=\'/app/api/top-players-hero-image?v=\'+Date.now()},650)}else{this.style.display=\'none\'}"/>'}
  function backButtonHtml(){return '<button class="top-players-hero-back" type="button" data-action="close-leaderboard" aria-label="Back">‹</button>'}
  function heroCard(d,w,yourVex){
    return '<section class="top-players-hero-card">'+backButtonHtml()+'<p class="top-players-hero-kicker">Top Players</p><h2 class="top-players-hero-title">Top 50 Players</h2><p class="top-players-hero-sub">'+esc(w.announcement||'Climb the weekly race, earn Vex, and claim your place.')+'</p><div class="top-players-hero-stats"><span><b>'+esc(yourVex)+'</b><small>Your Vex</small></span><span><b>'+esc(remaining(w.endsAt))+'</b><small>Ends In</small></span><span><b>Top '+esc(w.winnerCount||50)+'</b><small>Players</small></span></div><div class="top-players-hero-art">'+heroImgHtml()+'</div></section>'
  }
  function renderLeague(d){
    ensureHeroStyle();
    var page=q('leaderboardPage');if(!page)return;
    d=d||fallbackLeague();
    var w=d.currentWeek||{};var users=d.seedUsers||[];var yourVex=Number(d.userState&&d.userState.vex||0)||0;
    page.innerHTML=heroCard(d,w,yourVex)+'<div class="missions-title" style="margin-top:18px"><strong>Top Players</strong><span>Top 50</span></div><div class="leaderboard-list">'+(users.length?users.slice(0,50).map(playerRow).join(''):'<div class="mission-row"><span class="mission-icon">#</span><span class="mission-main"><strong>No players yet</strong><span>Generate seed users from admin panel.</span></span><span class="mission-reward">Top 50</span></div>')+'</div>';
    syncNativeBack();
  }
  function renderLoading(){ensureHeroStyle();var page=q('leaderboardPage');if(!page)return;page.innerHTML='<section class="top-players-hero-card">'+backButtonHtml()+'<p class="top-players-hero-kicker">Top Players</p><h2 class="top-players-hero-title">Top 50 Players</h2><p class="top-players-hero-sub">Loading players...</p><div class="top-players-hero-art">'+heroImgHtml()+'</div></section><div class="missions-title" style="margin-top:18px"><strong>Top Players</strong><span>Loading</span></div><div class="leaderboard-list"><div class="mission-row"><span class="mission-icon">#</span><span class="mission-main"><strong>Loading players</strong><span>Preparing Top 50 list</span></span><span class="mission-reward">...</span></div></div>';syncNativeBack();}
  function needsAutoRender(){var page=q('leaderboardPage');if(!page||!page.classList.contains('open'))return false;var t=page.textContent||'';return t.indexOf('Open Top Players')>-1||t.indexOf('Preparing player list')>-1||!page.querySelector('.top-players-hero-stats')}
  function ensureRendered(){ensureHeroStyle();syncNativeBack();if(needsAutoRender())refresh(false)}
  function startAutoRenderWatch(){
    if(autoRenderTimer)clearInterval(autoRenderTimer);
    var count=0;
    autoRenderTimer=setInterval(function(){count++;ensureRendered();if(count>30){clearInterval(autoRenderTimer);autoRenderTimer=0}},300);
    try{new MutationObserver(function(){setTimeout(ensureRendered,50)}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']})}catch(e){}
  }
  async function refresh(force){var token=++refreshToken;updateHomeCard();renderLoading();setTimeout(function(){if(token===refreshToken){renderLeague(fallbackLeague())}},1200);try{var d=await loadLeague(Boolean(force));if(token===refreshToken)renderLeague(d)}catch(e){if(token===refreshToken)renderLeague(fallbackLeague())}}
  window.VexaLeague={refresh:refresh,load:loadLeague,render:renderLeague};
  document.addEventListener('click',function(ev){var b=ev.target&&ev.target.closest&&ev.target.closest('[data-action="open-leaderboard"]');if(b){setTimeout(function(){refresh(false);syncNativeBack()},80);setTimeout(ensureRendered,500);setTimeout(ensureRendered,1400)}},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){ensureHeroStyle();updateHomeCard();startAutoRenderWatch();var page=q('leaderboardPage');if(page&&page.classList.contains('open'))refresh(false);syncNativeBack()});else{ensureHeroStyle();updateHomeCard();startAutoRenderWatch();var page=q('leaderboardPage');if(page&&page.classList.contains('open'))refresh(false);syncNativeBack()}
})();
`;