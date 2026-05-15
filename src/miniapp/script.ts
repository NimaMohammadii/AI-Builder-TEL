export const MINIAPP_SCRIPT = `
(function(){
  var tg=window.Telegram&&window.Telegram.WebApp;
  if(tg){try{tg.ready();tg.expand()}catch(e){}}

  var ownerId=localStorage.getItem('ownerId')||String((tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user&&tg.initDataUnsafe.user.id)||'');
  var selectedVoice='TX3LPaxmHKxFdv7VOQHJ';
  var sectionTitles={home:'Home',connect:'Connect',results:'Bot Control',playzone:'Play Zone',market:'Market',flow:'Text To Speech',mines:'Mines',plinko:'Plinko',crash:'Crash',wheel:'Wheel',dice:'Dice',limbo:'Limbo',tower:'Tower',coinflip:'Coin Flip',hilo:'Hi-Lo'};

  function q(id){return document.getElementById(id)}
  function setText(id,v){var n=q(id);if(n)n.textContent=v}
  function toast(v){var n=q('toast');if(!n)return;n.textContent=v;n.style.display='block';setTimeout(function(){n.style.display='none'},3000)}
  function setKeyboardOpen(open){document.body.classList.toggle('keyboard-open',!!open)}
  function dismissKeyboard(){var active=document.activeElement;if(active&&typeof active.blur==='function')active.blur();setKeyboardOpen(false)}
  function setLimitSheet(open){var s=q('ttsLimitSheet');if(!s)return;s.classList.toggle('open',!!open);s.setAttribute('aria-hidden',open?'false':'true')}
  function setDepositSheet(open){var s=q('depositSheet');if(!s)return;s.classList.toggle('open',!!open);s.setAttribute('aria-hidden',open?'false':'true')}

  function ensureOverlayStyles(){
    if(q('vexaOverlayStyles'))return;
    var style=document.createElement('style');
    style.id='vexaOverlayStyles';
    style.textContent='body.rewards-open,body.leaderboard-open{overflow:hidden!important}.rewards-page,.leaderboard-page{position:fixed!important;inset:0!important;z-index:2147483000!important;display:block!important;overflow:auto!important;padding:calc(54px + env(safe-area-inset-top)) 18px calc(98px + env(safe-area-inset-bottom))!important;background:radial-gradient(circle at 50% -10%,rgba(255,255,255,.08),rgba(255,255,255,0) 34%),rgba(5,5,7,.88)!important;backdrop-filter:blur(12px)!important;-webkit-backdrop-filter:blur(12px)!important;scrollbar-width:none!important;opacity:0!important;pointer-events:none!important;transform:translateX(18px)!important;transition:opacity .26s ease,transform .32s cubic-bezier(.2,.9,.2,1)!important}.rewards-page.open,.leaderboard-page.open{opacity:1!important;pointer-events:auto!important;transform:translateX(0)!important}.rewards-page::-webkit-scrollbar,.leaderboard-page::-webkit-scrollbar{display:none}.rewards-page-top,.leaderboard-top{display:flex!important;align-items:flex-start!important;justify-content:space-between!important;gap:12px!important;margin:0 0 20px!important}.rewards-page-back,.leaderboard-back{width:38px;height:38px;border:0;border-radius:999px;background:rgba(255,255,255,.08);color:#fff;font-size:22px;font-weight:700;box-shadow:inset 0 1px 0 rgba(255,255,255,.12)}.rewards-status-strip{display:grid!important;grid-template-columns:48px minmax(0,1fr) auto!important;gap:11px!important;align-items:center!important;margin:0 0 18px!important;padding:0 0 16px!important;border-bottom:1px solid rgba(255,255,255,.08)!important}.reward-days{display:flex!important;gap:7px!important;overflow-x:auto!important;overflow-y:visible!important;margin:0 -18px 22px!important;padding:0 18px 16px!important;scrollbar-width:none!important;scroll-snap-type:x proximity!important;-webkit-overflow-scrolling:touch!important}.reward-days::-webkit-scrollbar{display:none}.reward-day{overflow:visible!important}.reward-day.current:after{bottom:-11px!important;top:auto!important}.reward-today{display:grid!important;grid-template-columns:44px minmax(0,1fr) auto!important;gap:11px!important;align-items:center!important;margin:0 0 16px!important;padding:0 0 15px!important;border-bottom:1px solid rgba(255,255,255,.08)!important}.missions-title{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;margin:4px 0 9px!important;color:#fff!important}.missions-list{display:grid!important;gap:9px!important}.mission-row{min-height:66px!important;padding:11px 12px!important;border-radius:21px!important}.mission-row.primary{background:rgba(255,255,255,.075)!important;color:#fff!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.13),0 12px 28px rgba(0,0,0,.12)!important}.mission-row.primary .mission-main strong,.mission-row.primary .mission-main span,.mission-row.primary .mission-reward{color:#fff!important}.mission-row.primary .mission-icon{background:rgba(255,255,255,.12)!important;color:#fff!important}.mission-row.primary .mission-reward{background:rgba(255,255,255,.13)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.12)!important}.home-leaderboard-entry{position:relative;margin:16px 0 12px;padding:14px;border:0;border-radius:30px;width:100%;display:grid;grid-template-columns:48px minmax(0,1fr) auto;gap:12px;align-items:center;text-align:left;color:#fff;background:linear-gradient(135deg,rgba(255,255,255,.075),rgba(255,255,255,.026));box-shadow:0 22px 60px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.11);overflow:hidden}.home-leaderboard-entry:before{content:"";position:absolute;right:-54px;top:-74px;width:160px;height:160px;border-radius:999px;background:radial-gradient(circle,rgba(255,255,255,.11),rgba(255,255,255,.04) 46%,rgba(255,255,255,0) 72%);pointer-events:none}.home-leaderboard-icon{position:relative;z-index:1;width:48px;height:48px;border-radius:18px;display:grid;place-items:center;background:rgba(255,255,255,.075);box-shadow:inset 0 1px 0 rgba(255,255,255,.13);color:#fff}.home-leaderboard-icon svg{width:22px;height:22px;stroke:currentColor;stroke-width:2.15;stroke-linecap:round;stroke-linejoin:round;fill:none}.home-leaderboard-main{position:relative;z-index:1;min-width:0}.home-leaderboard-main span{display:block;margin-bottom:5px;color:rgba(255,255,255,.48);font-size:8.5px;font-weight:800;text-transform:uppercase;letter-spacing:.16em}.home-leaderboard-main strong{display:block;color:#fff;font-size:17px;font-weight:800;line-height:1;letter-spacing:-.035em}.home-leaderboard-main small{display:block;margin-top:6px;color:rgba(255,255,255,.5);font-size:9.2px;font-weight:600;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.home-leaderboard-arrow{position:relative;z-index:1;width:34px;height:34px;border-radius:999px;display:grid;place-items:center;background:#fff;color:#050505;box-shadow:0 12px 26px rgba(255,255,255,.08)}.home-leaderboard-arrow svg{width:15px;height:15px;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;fill:none}.leaderboard-kicker{margin:0 0 6px;color:rgba(255,255,255,.48);font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.18em}.leaderboard-title{margin:0;color:#fff;font-size:34px;line-height:.9;font-weight:800;letter-spacing:-.055em}.leaderboard-sub{margin:10px 0 0;max-width:318px;color:rgba(255,255,255,.52);font-size:11px;line-height:1.35;font-weight:500}.leaderboard-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:0 0 16px}.leaderboard-stat{min-height:64px;border-radius:20px;background:rgba(255,255,255,.045);box-shadow:inset 0 1px 0 rgba(255,255,255,.09);padding:11px 10px}.leaderboard-stat span{display:block;color:rgba(255,255,255,.45);font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:.12em}.leaderboard-stat strong{display:block;margin-top:8px;color:#fff;font-size:17px;font-weight:800;letter-spacing:-.035em}.leaderboard-list{display:grid;gap:8px}.leaderboard-row{position:relative;display:grid;grid-template-columns:34px 40px minmax(0,1fr) auto;gap:10px;align-items:center;min-height:68px;padding:10px;border-radius:21px;background:rgba(255,255,255,.038);box-shadow:inset 0 1px 0 rgba(255,255,255,.075),0 12px 26px rgba(0,0,0,.10);overflow:hidden}.leaderboard-row.top{background:rgba(255,255,255,.075);box-shadow:inset 0 1px 0 rgba(255,255,255,.13),0 14px 30px rgba(0,0,0,.12)}.leaderboard-place{height:30px;border-radius:999px;display:grid;place-items:center;background:rgba(255,255,255,.08);color:#fff;font-size:10px;font-weight:800}.leaderboard-avatar{width:40px;height:40px;border-radius:15px;display:grid;place-items:center;background:rgba(255,255,255,.08);color:#fff;font-size:13px;font-weight:800;box-shadow:inset 0 1px 0 rgba(255,255,255,.12)}.leaderboard-user{min-width:0}.leaderboard-user strong{display:block;color:#fff;font-size:13.5px;font-weight:750;line-height:1;letter-spacing:-.02em}.leaderboard-user span{display:block;margin-top:6px;color:rgba(255,255,255,.48);font-size:9px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.leaderboard-username{color:rgba(255,255,255,.62)!important;font-weight:700!important}.leaderboard-meta{text-align:right}.leaderboard-meta strong{display:block;color:#fff;font-size:12px;font-weight:800;line-height:1}.leaderboard-meta span{display:block;margin-top:7px;color:rgba(255,255,255,.50);font-size:9px;font-weight:650;white-space:nowrap}.leaderboard-rank{display:inline-grid!important;place-items:center;height:22px;padding:0 8px;margin-top:7px;border-radius:999px;background:rgba(255,255,255,.08);color:rgba(255,255,255,.78)!important;font-size:8px!important;font-weight:800!important}@media(max-width:380px){.leaderboard-title{font-size:30px}.home-leaderboard-entry{grid-template-columns:44px minmax(0,1fr) 32px;padding:13px}.leaderboard-row{grid-template-columns:30px 36px minmax(0,1fr) auto;gap:8px;padding:9px}.leaderboard-avatar{width:36px;height:36px;border-radius:14px}.leaderboard-user strong{font-size:12.5px}.leaderboard-meta strong{font-size:11px}.leaderboard-summary{gap:6px}.leaderboard-stat strong{font-size:15px}}';
    document.head.appendChild(style);
  }

  function setRewardsPage(open){var s=q('rewardsPage');if(!s)return;ensureOverlayStyles();if(open&&s.parentNode!==document.body)document.body.appendChild(s);document.body.classList.toggle('rewards-open',!!open);s.classList.toggle('open',!!open);s.setAttribute('aria-hidden',open?'false':'true');if(open)try{s.scrollTop=0}catch(e){}}
  function setLeaderboardPage(open){ensureLeaderboard();var s=q('leaderboardPage');if(!s)return;ensureOverlayStyles();if(open&&s.parentNode!==document.body)document.body.appendChild(s);document.body.classList.toggle('leaderboard-open',!!open);s.classList.toggle('open',!!open);s.setAttribute('aria-hidden',open?'false':'true');if(open)try{s.scrollTop=0}catch(e){}}

  function playerRow(p){return '<div class="leaderboard-row '+(p.i<=3?'top':'')+'"><div class="leaderboard-place">#'+p.i+'</div><div class="leaderboard-avatar">'+p.av+'</div><div class="leaderboard-user"><strong>'+p.name+'</strong><span class="leaderboard-username">@'+p.user+'</span><span>Level '+p.level+' · '+p.xp+' XP</span><span class="leaderboard-rank">'+p.rank+'</span></div><div class="leaderboard-meta"><strong>'+p.balance+' TON</strong><span>Score '+p.score+'</span></div></div>'}
  function ensureLeaderboard(){
    ensureOverlayStyles();
    if(!q('leaderboardEntry')){
      var rewards=document.querySelector('[data-action="open-rewards"]');
      var entry=document.createElement('button');
      entry.id='leaderboardEntry';
      entry.className='home-leaderboard-entry';
      entry.type='button';
      entry.setAttribute('data-action','open-leaderboard');
      entry.innerHTML='<span class="home-leaderboard-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 18h16"/><path d="M7 18V9"/><path d="M12 18V5"/><path d="M17 18v-6"/><path d="M8.5 5h7l-3.5-3-3.5 3z"/></svg></span><span class="home-leaderboard-main"><span>Leaderboard</span><strong>Top Players</strong><small>Top 50 users · name, level, rank and balance</small></span><span class="home-leaderboard-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></span>';
      if(rewards&&rewards.parentNode)rewards.parentNode.insertBefore(entry,rewards.nextSibling);
      else{var home=q('home');if(home)home.appendChild(entry)}
    }
    if(q('leaderboardPage'))return;
    var players=[
      {i:1,av:'NX',name:'NexaWolf',user:'nxwolf',level:68,rank:'Titan',balance:'412.8',xp:'92,450',score:'9.8k'},
      {i:2,av:'AR',name:'AriaFlow',user:'ariaflow',level:61,rank:'Titan',balance:'285.4',xp:'81,220',score:'8.9k'},
      {i:3,av:'VK',name:'VexaKing',user:'vexaking',level:56,rank:'Legend',balance:'241.9',xp:'73,100',score:'8.1k'},
      {i:4,av:'MO',name:'MoonPilot',user:'moonpilot',level:49,rank:'Legend',balance:'198.2',xp:'59,870',score:'7.4k'},
      {i:5,av:'BL',name:'BlackNova',user:'blacknova',level:44,rank:'Legend',balance:'176.0',xp:'52,600',score:'6.8k'},
      {i:6,av:'SV',name:'SilverVex',user:'silvervex',level:39,rank:'Master',balance:'142.5',xp:'45,300',score:'6.1k'},
      {i:7,av:'CR',name:'CryptoRay',user:'cryptoray',level:36,rank:'Master',balance:'119.7',xp:'41,920',score:'5.7k'},
      {i:8,av:'AX',name:'Axion',user:'axion',level:33,rank:'Master',balance:'98.3',xp:'37,460',score:'5.2k'},
      {i:9,av:'EL',name:'EliteLuna',user:'eliteluna',level:29,rank:'Master',balance:'86.4',xp:'31,870',score:'4.8k'},
      {i:10,av:'OR',name:'OrionAI',user:'orionai',level:25,rank:'Master',balance:'74.9',xp:'26,610',score:'4.3k'},
      {i:11,av:'PR',name:'ProMiner',user:'prominer',level:22,rank:'Elite',balance:'63.2',xp:'21,900',score:'3.9k'},
      {i:12,av:'ZA',name:'ZaraTon',user:'zaraton',level:20,rank:'Elite',balance:'58.7',xp:'19,440',score:'3.6k'},
      {i:13,av:'NE',name:'NeonBot',user:'neonbot',level:18,rank:'Elite',balance:'44.1',xp:'16,800',score:'3.1k'},
      {i:14,av:'PL',name:'PlinkoStar',user:'plinkostar',level:16,rank:'Elite',balance:'39.8',xp:'14,250',score:'2.8k'},
      {i:15,av:'AI',name:'AIHunter',user:'aihunter',level:14,rank:'Pro',balance:'31.2',xp:'11,770',score:'2.5k'},
      {i:16,av:'VX',name:'VexRunner',user:'vexrunner',level:12,rank:'Pro',balance:'24.5',xp:'9,980',score:'2.1k'},
      {i:17,av:'TO',name:'TowerFox',user:'towerfox',level:10,rank:'Pro',balance:'18.6',xp:'7,650',score:'1.7k'},
      {i:18,av:'DI',name:'DiceWave',user:'dicewave',level:8,rank:'Pro',balance:'12.4',xp:'5,880',score:'1.3k'},
      {i:19,av:'EX',name:'ExplorerX',user:'explorerx',level:6,rank:'Explorer',balance:'8.9',xp:'3,640',score:'940'},
      {i:20,av:'RO',name:'RookieOne',user:'rookieone',level:3,rank:'Rookie',balance:'2.7',xp:'1,240',score:'310'}
    ];
    var page=document.createElement('div');
    page.id='leaderboardPage';
    page.className='leaderboard-page';
    page.setAttribute('aria-hidden','true');
    page.innerHTML='<div class="leaderboard-top"><div><p class="leaderboard-kicker">Vexa Leaderboard</p><h2 class="leaderboard-title">Top Players</h2><p class="leaderboard-sub">A visual preview of the top users by name, username, level, rank, balance and total XP.</p></div><button class="leaderboard-back" type="button" data-action="close-leaderboard" aria-label="Back">‹</button></div><div class="leaderboard-summary"><div class="leaderboard-stat"><span>Players</span><strong>Top 50</strong></div><div class="leaderboard-stat"><span>Highest</span><strong>Lv 68</strong></div><div class="leaderboard-stat"><span>Total TON</span><strong>1,842</strong></div></div><div class="leaderboard-list">'+players.map(playerRow).join('')+'</div>';
    document.body.appendChild(page);
  }

  function updateTtsCharCount(){var input=q('ttsText');var counter=q('ttsCharCount');var flow=q('flow');var count=(input&&input.value||'').length;if(counter)counter.textContent=String(count)+' characters';if(flow)flow.classList.toggle('over-limit',count>1000)}
  function setHeaderGlassMode(id){document.body.classList.toggle('header-glass-mode',id==='playzone'||id==='market')}

  function initHomeGlassButton(){
    var btn=q('homeGlassButton');if(!btn)return;
    var storageKey='homeGlassButtonPosition';
    var size=68;var startX=0;var startY=0;var baseX=0;var baseY=0;var didDrag=false;var pointerId=null;
    function bounds(){var w=Math.max(document.documentElement.clientWidth||0,window.innerWidth||0);var h=Math.max(document.documentElement.clientHeight||0,window.innerHeight||0);var r=btn.getBoundingClientRect();size=Math.max(r.width||68,r.height||68);return{minX:10,maxX:Math.max(10,w-size-10),minY:Math.max(10,(tg&&tg.safeAreaInset&&tg.safeAreaInset.top||0)+10),maxY:Math.max(10,h-size-104)}}
    function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
    function apply(x,y,save){var b=bounds();var nx=clamp(x,b.minX,b.maxX);var ny=clamp(y,b.minY,b.maxY);btn.style.left=nx+'px';btn.style.top=ny+'px';btn.style.right='auto';btn.style.bottom='auto';if(save)try{localStorage.setItem(storageKey,JSON.stringify({x:nx,y:ny}))}catch(e){}}
    function load(){var b=bounds();var pos=null;try{pos=JSON.parse(localStorage.getItem(storageKey)||'null')}catch(e){};if(pos&&isFinite(pos.x)&&isFinite(pos.y)){apply(Number(pos.x),Number(pos.y),false)}else{apply(b.maxX-4,b.minY+110,false)}}
    btn.addEventListener('pointerdown',function(ev){if(ev.button!==undefined&&ev.button!==0)return;var r=btn.getBoundingClientRect();pointerId=ev.pointerId;startX=ev.clientX;startY=ev.clientY;baseX=r.left;baseY=r.top;didDrag=false;btn.classList.add('is-dragging');try{btn.setPointerCapture(pointerId)}catch(e){}}, {passive:true});
    btn.addEventListener('pointermove',function(ev){if(pointerId!==ev.pointerId)return;var dx=ev.clientX-startX;var dy=ev.clientY-startY;if(Math.abs(dx)+Math.abs(dy)>7)didDrag=true;apply(baseX+dx,baseY+dy,false)});
    function finish(ev){if(pointerId!==ev.pointerId)return;pointerId=null;btn.classList.remove('is-dragging');var r=btn.getBoundingClientRect();apply(r.left,r.top,true);setTimeout(function(){didDrag=false},80)}
    btn.addEventListener('pointerup',finish);btn.addEventListener('pointercancel',finish);
    btn.addEventListener('click',function(ev){if(didDrag){ev.preventDefault();ev.stopPropagation();}},true);
    window.addEventListener('resize',function(){var r=btn.getBoundingClientRect();apply(r.left,r.top,true)});
    load();
  }

  function show(id){
    document.querySelectorAll('.view').forEach(function(n){n.classList.remove('active')});
    var v=q(id);if(v)v.classList.add('active');
    document.querySelectorAll('.tab').forEach(function(n){n.classList.toggle('active',n.getAttribute('data-view')===id)});
    setText('brandTitle',sectionTitles[id]||'Vexa');
    setHeaderGlassMode(id);
    if(id!=='flow'){setKeyboardOpen(false);setLimitSheet(false)}
  }

  function initPlayZoneGameNavigation(){
    document.addEventListener('click',function(ev){
      var target=ev.target;
      var b=target&&target.closest?target.closest('#playzone button[data-game-view]'):null;
      if(!b)return;
      var id=b.getAttribute('data-game-view')||'';
      ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();
      if(q(id)){show(id);return}
      toast('Coming soon');
    },true);
  }

  async function api(path,opt){
    opt=opt||{};
    var r=await fetch(path,Object.assign({},opt,{headers:Object.assign({'content-type':'application/json'},opt.headers||{})}));
    var j=await r.json().catch(function(){return{error:'Invalid response'}});
    if(!r.ok)throw new Error(j.error||'Request failed');
    return j;
  }

  function rankFallback(level){level=Math.max(1,Math.floor(Number(level)||1));if(level>=60)return 'Titan';if(level>=40)return 'Legend';if(level>=25)return 'Master';if(level>=15)return 'Elite';if(level>=8)return 'Pro';if(level>=4)return 'Explorer';return 'Rookie'}
  function renderLevel(profile){var n=q('userLine');var level=Math.max(1,Math.floor(Number(profile&&profile.level)||1));var progress=Math.max(0,Math.min(100,Math.floor(Number(profile&&profile.progressPercent)||0)));var left=Math.max(0,Math.floor(Number(profile&&profile.xpLeft)||0));var rank=String((profile&&profile.rankName)||rankFallback(level));var pill=q('rankPill');if(pill)pill.textContent=rank;if(!n)return;n.innerHTML='<span style="display:block;color:#fff;font-weight:800;font-size:12px;line-height:1">Level '+level+' <span style="color:rgba(255,255,255,.55);font-weight:700">• '+progress+'%</span></span><span style="display:block;width:158px;height:6px;margin-top:6px;border-radius:999px;background:rgba(255,255,255,.12);overflow:hidden"><span style="display:block;width:'+progress+'%;height:100%;border-radius:999px;background:linear-gradient(90deg,#5b0f24,#8f1d3d,#c03a5b);box-shadow:0 0 14px rgba(192,58,91,.48)"></span></span><span style="display:block;margin-top:5px;color:rgba(255,255,255,.5);font-size:9.5px;line-height:1">'+left+' XP left to finish</span>'}
  async function loadLevel(){renderLevel({level:1,progressPercent:42,xpLeft:580,rankName:'Rookie'});if(!ownerId)return;try{renderLevel(await api('/app/api/level?userId='+encodeURIComponent(ownerId),{headers:{'accept':'application/json'}}))}catch(e){}}
  function userLine(){loadLevel()}

  function setVoice(v,label){selectedVoice=v;setText('voiceLabel',label);document.querySelectorAll('[data-voice]').forEach(function(x){x.classList.toggle('active',x.getAttribute('data-voice')===v)});var w=q('voiceWrap');if(w)w.classList.remove('open')}

  async function depositStars(stars){
    var amount=Math.floor(Number(stars)||0);
    if(!ownerId)return toast('Telegram user not found');
    if(!amount||amount<1)return toast('Enter a valid Stars amount');
    var status=q('depositStatus');
    if(status)status.textContent='Creating secure Telegram invoice';
    try{var d=await api('/app/api/stars/deposits',{method:'POST',body:JSON.stringify({userId:ownerId,stars:amount})});if(status)status.textContent='Opening Telegram Stars payment';if(d.invoiceLink){if(tg&&typeof tg.openInvoice==='function'){tg.openInvoice(d.invoiceLink,function(state){if(status)status.textContent=state==='paid'?'Payment received Balance will update shortly':'Payment status: '+state;if(state==='paid'&&window.VexaTonBalance&&window.VexaTonBalance.load)setTimeout(function(){window.VexaTonBalance.load()},900);if(state==='paid')setTimeout(loadLevel,1100)})}else{window.location.href=d.invoiceLink}}}catch(x){if(status)status.textContent=x.message;toast(x.message)}
  }

  async function generateTts(){
    var text=(q('ttsText')&&q('ttsText').value.trim())||'';
    if(!text)return toast('Type text first');
    if(text.length>1000){setLimitSheet(true);return}
    try{var r=await fetch('/app/api/tts',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({text:text,voice:selectedVoice})});if(!r.ok)throw new Error('TTS API is not ready yet');var blob=await r.blob();var url=URL.createObjectURL(blob);q('ttsAudio').src=url;q('wavePlayer').classList.add('show');toast('Voice generated')}catch(x){q('wavePlayer').classList.add('show');toast(x.message)}
  }

  function playTts(){var a=q('ttsAudio');if(!a||!a.src)return toast('Generate voice first');if(a.paused){a.play();setText('wavePlay','Pause')}else{a.pause();setText('wavePlay','Play')}}
  function saveUser(){ownerId=(q('ownerId')&&q('ownerId').value.trim())||ownerId;localStorage.setItem('ownerId',ownerId);userLine()}

  document.body.addEventListener('focusin',function(ev){if(ev.target&&ev.target.id==='ttsText')setKeyboardOpen(true)});
  document.body.addEventListener('focusout',function(ev){if(ev.target&&ev.target.id==='ttsText')setTimeout(function(){if(document.activeElement!==q('ttsText'))setKeyboardOpen(false)},80)});

  document.body.addEventListener('click',function(ev){
    var target=ev.target;
    var b=target&&target.closest?target.closest('button'):null;
    if(!b){var w=q('voiceWrap');if(w)w.classList.remove('open');return}
    if(b.hasAttribute('data-game-view'))return;
    var v=b.getAttribute('data-view');if(v){ev.preventDefault();if(q(v))show(v);else toast('Coming soon');return}
    var stars=b.getAttribute('data-stars-deposit');if(stars){depositStars(stars);return}
    var voice=b.getAttribute('data-voice');if(voice){setVoice(voice,b.textContent||voice);return}
    var a=b.getAttribute('data-action');
    if(a==='open-rewards'){setRewardsPage(true);return}
    if(a==='close-rewards'){setRewardsPage(false);return}
    if(a==='open-leaderboard'){setLeaderboardPage(true);return}
    if(a==='close-leaderboard'){setLeaderboardPage(false);return}
    if(a==='open-deposit'){setDepositSheet(true);return}
    if(a==='close-deposit'){setDepositSheet(false);return}
    if(a==='deposit-custom-stars'){depositStars(q('starsAmount')&&q('starsAmount').value);return}
    if(a==='deposit-custom-stars-sheet'){depositStars(q('starsAmountSheet')&&q('starsAmountSheet').value);return}
    if(a==='open-char-limit'){setLimitSheet(true);return}
    if(a==='close-char-limit'){setLimitSheet(false);return}
    if(a==='dismiss-keyboard'){dismissKeyboard();return}
    if(a==='toggle-voice'){q('voiceWrap').classList.toggle('open');return}
    if(a==='generate-tts')generateTts();
    if(a==='play-tts')playTts();
    if(a==='save-user')saveUser();
  });

  if(q('ttsText'))q('ttsText').addEventListener('input',updateTtsCharCount);
  if(q('ownerId'))q('ownerId').value=ownerId;
  initHomeGlassButton();
  initPlayZoneGameNavigation();
  ensureLeaderboard();
  setText('brandTitle',sectionTitles.home);
  setHeaderGlassMode('home');
  userLine();
  updateTtsCharCount();
})();
`;