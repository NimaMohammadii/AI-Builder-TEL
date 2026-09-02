export const REWARDS_LIVE_WINNERS_EFFECTS = `
<style id="vexa-rewards-live-winners-effects">
#rewards .rewards-live-winners{
  margin-top:clamp(149px,27dvh,314px)!important;
  padding:0 10px 30px!important;
  position:relative!important;
}
#rewards .home-live-winners-list{
  display:grid!important;
  align-content:start!important;
  gap:10px!important;
  min-height:0!important;
  height:auto!important;
  overflow:visible!important;
  padding:0 2px 16px!important;
}
#rewards .home-live-winner-card,
.home-winners-host.is-winners-expanding .home-live-winner-card{
  position:relative!important;
  overflow:hidden!important;
  min-height:64px!important;
  border:0!important;
  outline:0!important;
  border-radius:28px!important;
  background:transparent!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.105),inset 0 -1px 0 rgba(255,255,255,.06),inset 0 0 22px rgba(255,255,255,.055),0 16px 36px rgba(0,0,0,.22)!important;
  display:grid!important;
  grid-template-columns:42px minmax(0,1fr) auto 34px!important;
  align-items:center!important;
  gap:10px!important;
  padding:11px 14px!important;
  box-sizing:border-box!important;
  backdrop-filter:blur(3px) saturate(1.04)!important;
  -webkit-backdrop-filter:blur(3px) saturate(1.04)!important;
}
#rewards .home-live-winner-avatar,
.home-winners-host.is-winners-expanding .home-live-winner-avatar{
  width:42px!important;
  height:42px!important;
  border-radius:50%!important;
  object-fit:cover!important;
  display:block!important;
  background:transparent!important;
}
#rewards .home-live-winner-user,
.home-winners-host.is-winners-expanding .home-live-winner-user{min-width:0!important;display:grid!important;gap:3px!important}
#rewards .home-live-winner-user strong,
.home-winners-host.is-winners-expanding .home-live-winner-user strong{display:block!important;color:#fff!important;font-size:13px!important;font-weight:900!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
#rewards .home-live-winner-user span,
.home-winners-host.is-winners-expanding .home-live-winner-user span{display:block!important;color:rgba(255,255,255,.48)!important;font-size:10px!important;font-weight:750!important}
#rewards .home-live-winner-amount,
.home-winners-host.is-winners-expanding .home-live-winner-amount{color:#fff!important;font-size:13px!important;font-weight:950!important;white-space:nowrap!important}
#rewards .home-live-winner-card:after,
.home-winners-host.is-winners-expanding .home-live-winner-card:after{
  content:attr(data-rank)!important;
  grid-column:4!important;
  width:30px!important;
  height:30px!important;
  justify-self:end!important;
  display:grid!important;
  place-items:center!important;
  border-radius:11px!important;
  color:rgba(255,255,255,.88)!important;
  font-size:10px!important;
  line-height:1!important;
  font-weight:850!important;
  letter-spacing:.04em!important;
  background:linear-gradient(145deg,rgba(255,255,255,.105),rgba(255,255,255,.035))!important;
  border:1px solid rgba(255,255,255,.13)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.16),0 8px 18px rgba(0,0,0,.18)!important;
  box-sizing:border-box!important;
}
#rewards .home-live-winner-card:nth-child(-n+3):after,
.home-winners-host.is-winners-expanding .home-live-winner-card:nth-child(-n+3):after{
  color:#fff!important;
  background:linear-gradient(145deg,rgba(255,255,255,.15),rgba(92,10,35,.18))!important;
  border-color:rgba(255,255,255,.19)!important;
}
#rewards .rewards-winner-avatar-fallback,
.home-winners-host .rewards-winner-avatar-fallback{display:grid!important;place-items:center!important;background:rgba(255,255,255,.075)!important;color:#fff!important;font-size:14px!important;font-weight:950!important}

/* Home 1: this card is Winners only. The old Live Activity rows stay hidden. */
#home[data-home-variant="one"] .home-ticket-finance-visual.home-ticket-card.home-winners-host{
  position:relative!important;
  min-height:154px!important;
  height:var(--home-live-activity-height,154px)!important;
  display:block!important;
  padding:8px!important;
  box-sizing:border-box!important;
  overflow:hidden!important;
  cursor:pointer!important;
  touch-action:manipulation!important;
  -webkit-tap-highlight-color:transparent!important;
}
#home[data-home-variant="one"] .home-winners-host>.home-live-activity{display:none!important}
#home[data-home-variant="one"] .home-winners-host>.rewards-live-winners{
  width:100%!important;
  height:100%!important;
  min-height:0!important;
  margin:0!important;
  padding:0!important;
  display:grid!important;
  grid-template-rows:24px minmax(0,1fr)!important;
  gap:6px!important;
  overflow:hidden!important;
}
#home[data-home-variant="one"] .home-winners-host .rewards-winners-state-title{
  margin:0!important;
  padding:0 3px!important;
  display:flex!important;
  align-items:center!important;
  color:transparent!important;
  font-size:0!important;
  font-weight:900!important;
  opacity:1!important;
  transform:none!important;
}
#home[data-home-variant="one"] .home-winners-host .rewards-winners-state-title:after{
  content:'Winners'!important;
  color:rgba(255,255,255,.72)!important;
  font-size:10px!important;
  line-height:1!important;
  font-weight:900!important;
  letter-spacing:-.015em!important;
}
#home[data-home-variant="one"] .home-winners-host .home-live-winners-list{
  min-height:0!important;
  height:100%!important;
  margin:0!important;
  padding:0!important;
  display:grid!important;
  grid-template-rows:repeat(3,minmax(0,1fr))!important;
  align-content:stretch!important;
  gap:5px!important;
  overflow:hidden!important;
}
#home[data-home-variant="one"] .home-winners-host .home-live-winner-card{
  min-height:0!important;
  height:auto!important;
  margin:0!important;
  padding:4px 7px!important;
  display:grid!important;
  grid-template-columns:26px minmax(0,1fr) auto 20px!important;
  align-items:center!important;
  gap:5px!important;
  border:0!important;
  border-radius:15px!important;
  background:rgba(0,0,0,.18)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.055),inset 0 -1px 0 rgba(255,255,255,.025)!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
  opacity:1!important;
  transform:none!important;
  filter:none!important;
  box-sizing:border-box!important;
}
#home[data-home-variant="one"] .home-winners-host .home-live-winner-card:nth-child(n+4){display:none!important}
#home[data-home-variant="one"] .home-winners-host .home-live-winner-avatar{width:26px!important;height:26px!important;border-radius:50%!important;font-size:9px!important;object-fit:cover!important}
#home[data-home-variant="one"] .home-winners-host .home-live-winner-user{min-width:0!important;display:block!important}
#home[data-home-variant="one"] .home-winners-host .home-live-winner-user strong{display:block!important;color:#fff!important;font-size:8.5px!important;font-weight:900!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
#home[data-home-variant="one"] .home-winners-host .home-live-winner-user span{display:none!important}
#home[data-home-variant="one"] .home-winners-host .home-live-winner-amount{color:rgba(255,255,255,.68)!important;font-size:7.5px!important;font-weight:900!important;white-space:nowrap!important}
#home[data-home-variant="one"] .home-winners-host .home-live-winner-card:after{content:attr(data-rank)!important;width:20px!important;height:20px!important;display:grid!important;place-items:center!important;border-radius:8px!important;color:rgba(255,255,255,.8)!important;font-size:7px!important;font-weight:850!important;background:rgba(255,255,255,.065)!important;border:1px solid rgba(255,255,255,.08)!important;box-sizing:border-box!important}
#home[data-home-variant="one"] .home-winners-host:after{content:''!important;position:absolute!important;inset:0!important;border-radius:inherit!important;pointer-events:none!important;opacity:0!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)!important;transition:opacity .18s ease!important}
#home[data-home-variant="one"] .home-winners-host:active:after{opacity:1!important}

/* Centered shared-element expansion. It grows, but never becomes fullscreen. */
.home-winners-backdrop{
  position:fixed!important;
  inset:0!important;
  z-index:2147482998!important;
  background:rgba(0,0,0,.08)!important;
  opacity:0!important;
  pointer-events:none!important;
  backdrop-filter:blur(0)!important;
  -webkit-backdrop-filter:blur(0)!important;
  transition:opacity .38s ease,background .38s ease,backdrop-filter .38s ease!important;
}
.home-winners-backdrop.is-open{opacity:1!important;pointer-events:auto!important;background:rgba(0,0,0,.42)!important;backdrop-filter:blur(7px) saturate(.9)!important;-webkit-backdrop-filter:blur(7px) saturate(.9)!important}
.home-winners-placeholder{width:100%!important;visibility:hidden!important;pointer-events:none!important}
.home-winners-host.is-winners-expanding{
  position:fixed!important;
  left:var(--winners-left)!important;
  top:var(--winners-top)!important;
  width:var(--winners-width)!important;
  height:var(--winners-height)!important;
  min-height:0!important;
  margin:0!important;
  padding:0!important;
  z-index:2147482999!important;
  display:grid!important;
  grid-template-rows:62px minmax(0,1fr)!important;
  gap:0!important;
  overflow:hidden!important;
  border-radius:30px!important;
  background:rgba(10,8,9,.93)!important;
  box-shadow:0 28px 72px rgba(0,0,0,.52),inset 0 1px 0 rgba(255,255,255,.13),inset 0 -1px 0 rgba(255,255,255,.045),inset 0 0 28px rgba(255,255,255,.035)!important;
  backdrop-filter:blur(20px) saturate(1.16)!important;
  -webkit-backdrop-filter:blur(20px) saturate(1.16)!important;
  transform-origin:0 0!important;
  transform:translate3d(var(--winners-from-x),var(--winners-from-y),0) scale(var(--winners-scale-x),var(--winners-scale-y))!important;
  transition:transform .56s cubic-bezier(.16,1,.3,1),border-radius .56s cubic-bezier(.16,1,.3,1),box-shadow .46s ease!important;
  will-change:transform!important;
  isolation:isolate!important;
  cursor:default!important;
}
.home-winners-host.is-winners-expanding.is-winners-open{transform:none!important}
.home-winners-host.is-winners-expanding>.home-live-activity{display:none!important}
.home-winners-expanded-head{
  position:relative!important;
  z-index:3!important;
  min-height:62px!important;
  padding:13px 14px 9px!important;
  display:flex!important;
  align-items:center!important;
  justify-content:space-between!important;
  gap:12px!important;
  box-sizing:border-box!important;
  opacity:0!important;
  transform:translate3d(0,9px,0)!important;
  transition:opacity .25s ease,transform .42s cubic-bezier(.16,1,.3,1)!important;
}
.home-winners-host.is-winners-open .home-winners-expanded-head{opacity:1!important;transform:none!important;transition-delay:.12s!important}
.home-winners-expanded-copy{min-width:0!important;display:grid!important;gap:4px!important}
.home-winners-expanded-copy strong{color:#fff!important;font-size:18px!important;line-height:1!important;font-weight:950!important;letter-spacing:-.04em!important}
.home-winners-expanded-copy span{color:rgba(255,255,255,.42)!important;font-size:9px!important;font-weight:800!important}
.home-winners-close{width:34px!important;height:34px!important;flex:0 0 34px!important;border:0!important;border-radius:13px!important;background:rgba(255,255,255,.07)!important;color:#fff!important;display:grid!important;place-items:center!important;font-size:18px!important;line-height:1!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.09)!important;-webkit-tap-highlight-color:transparent!important}
.home-winners-close:active{transform:scale(.92)!important}
.home-winners-host.is-winners-expanding>.rewards-live-winners{
  position:relative!important;
  z-index:3!important;
  min-height:0!important;
  height:auto!important;
  margin:0!important;
  padding:0 10px 12px!important;
  display:grid!important;
  grid-template-rows:20px minmax(0,1fr)!important;
  gap:7px!important;
  overflow:hidden!important;
  opacity:0!important;
  transform:translate3d(0,12px,0)!important;
  transition:opacity .28s ease,transform .46s cubic-bezier(.16,1,.3,1)!important;
  box-sizing:border-box!important;
}
.home-winners-host.is-winners-expanding.is-winners-open>.rewards-live-winners{opacity:1!important;transform:none!important;transition-delay:.14s!important}
.home-winners-host.is-winners-expanding .rewards-winners-state-title{margin:0 5px!important;padding:0!important;color:rgba(255,255,255,.5)!important;font-size:10px!important;line-height:20px!important;font-weight:850!important;opacity:1!important;transform:none!important}
.home-winners-host.is-winners-expanding .rewards-winners-state-title:after{display:none!important;content:none!important}
.home-winners-host.is-winners-expanding .home-live-winners-list{
  min-height:0!important;
  height:auto!important;
  max-height:none!important;
  display:grid!important;
  align-content:start!important;
  gap:8px!important;
  overflow-y:auto!important;
  overflow-x:hidden!important;
  padding:0 2px 12px!important;
  scrollbar-width:none!important;
  overscroll-behavior:contain!important;
  -webkit-overflow-scrolling:touch!important;
}
.home-winners-host.is-winners-expanding .home-live-winners-list::-webkit-scrollbar{display:none!important}
.home-winners-host.is-winners-expanding .home-live-winner-card{min-height:58px!important;padding:9px 11px!important;border-radius:23px!important;grid-template-columns:38px minmax(0,1fr) auto 29px!important;gap:8px!important;opacity:1!important;transform:none!important;filter:none!important}
.home-winners-host.is-winners-expanding .home-live-winner-avatar{width:38px!important;height:38px!important}
.home-winners-host.is-winners-expanding .home-live-winner-card:after{width:27px!important;height:27px!important;border-radius:10px!important;font-size:9px!important}
.home-winners-host.is-winners-expanding.is-winners-open .home-live-winner-card{animation:vexaWinnerReveal .42s cubic-bezier(.16,1,.3,1) both!important;animation-delay:calc(.12s + var(--winner-index,0) * 24ms)!important}
@keyframes vexaWinnerReveal{0%{opacity:0;transform:translate3d(0,10px,0) scale(.975)}100%{opacity:1;transform:none}}
html.vexa-winners-open #home{overflow:hidden!important}

@media(max-width:380px){
  #rewards .rewards-live-winners{margin-top:clamp(134px,25dvh,274px)!important}
  .home-winners-host.is-winners-expanding .home-live-winner-user strong{font-size:12px!important}
  .home-winners-host.is-winners-expanding .home-live-winner-amount{font-size:11px!important}
}
@media(prefers-reduced-motion:reduce){.home-winners-host.is-winners-expanding,.home-winners-backdrop,.home-winners-host.is-winners-expanding .home-live-winner-card{animation:none!important;transition:none!important}}
</style>
<script id="vexa-rewards-live-winners-scroll-script">
(function(){
  var loading=false,lastRequestAt=0,phaseTimer=0,retryTimer=0,retryDelay=1000;
  var expandedHost=null,placeholder=null,closing=false;
  function q(s,r){return (r||document).querySelector(s)}
  function homeOne(){var home=document.getElementById('home');return home&&home.getAttribute('data-home-variant')==='one'?home:null}
  function rewardsRoot(){return document.getElementById('rewards')}
  function targetRoot(){var rewards=rewardsRoot(),home=homeOne();if(rewards&&rewards.classList.contains('active'))return rewards;return home||rewards}
  function liveHost(){var home=homeOne();return home?q('.home-ticket-finance-visual',home):null}
  function initData(){var tg=window.Telegram&&window.Telegram.WebApp;return String(tg&&tg.initData||'')}
  function gram(nano){var value=Math.max(0,Number(nano)||0)/1000000000;return value.toFixed(2).replace(/\\.00$/,'').replace(/(\\.\\d)0$/,'$1')}
  function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(ch){return ch==='&'?'&amp;':ch==='<'?'&lt;':ch==='>'?'&gt;':ch==='"'?'&quot;':'&#39;'})}
  function winnerMap(winners){var map={};(Array.isArray(winners)?winners:[]).forEach(function(item){var rank=Math.floor(Number(item&&item.rank)||0);if(rank>=1&&rank<=15)map[rank]=item});return map}
  function initial(name){var value=String(name||'').replace(/^@/,'').trim();return esc((value.charAt(0)||'•').toUpperCase())}
  function maskedName(winner){var username=String(winner&&winner.username||'').replace(/^@+/,'').trim();if(!username)return esc(winner&&winner.displayName||'Player');if(username.length===1)return '@'+esc(username);if(username.length===2)return '@'+esc(username.charAt(0)+'*');if(username.length<=4)return '@'+esc(username.charAt(0)+'**'+username.charAt(username.length-1));return '@'+esc(username.slice(0,2)+'***'+username.slice(-2))}
  function avatarHtml(winner){var url=String(winner&&winner.avatarUrl||'').trim();if(url)return '<img class="home-live-winner-avatar" src="'+esc(url)+'" alt="" decoding="async" loading="lazy" data-avatar-fallback="'+initial(winner.displayName)+'"/>';return '<div class="home-live-winner-avatar rewards-winner-avatar-fallback">'+initial(winner&&winner.displayName)+'</div>'}
  function hydrateAvatars(root){var images=(root||document).querySelectorAll('img.home-live-winner-avatar[data-avatar-fallback]');for(var i=0;i<images.length;i++){(function(img){if(img.dataset.avatarBound==='1')return;img.dataset.avatarBound='1';img.addEventListener('error',function(){var fallback=document.createElement('div');fallback.className='home-live-winner-avatar rewards-winner-avatar-fallback';fallback.textContent=img.getAttribute('data-avatar-fallback')||'•';img.replaceWith(fallback)},{once:true})})(images[i])}}
  function cardHtml(rank,winner,waiting){var rankText=String(rank).padStart(2,'0');if(waiting)return '<article class="home-live-winner-card is-waiting" data-rank="'+rankText+'"><div class="home-live-winner-avatar rewards-winner-avatar-fallback">'+rank+'</div><div class="home-live-winner-user"><strong>Waiting for winner</strong><span>Rank #'+rankText+'</span></div><div class="home-live-winner-amount">—</div></article>';if(!winner)return '<article class="home-live-winner-card" data-rank="'+rankText+'"><div class="home-live-winner-avatar rewards-winner-avatar-fallback">'+rank+'</div><div class="home-live-winner-user"><strong>No winner this round</strong><span>Rank #'+rankText+'</span></div><div class="home-live-winner-amount">—</div></article>';var level=Math.max(1,Math.floor(Number(winner.level)||1));return '<article class="home-live-winner-card" data-rank="'+rankText+'">'+avatarHtml(winner)+'<div class="home-live-winner-user"><strong>'+maskedName(winner)+'</strong><span>Level '+level+'</span></div><div class="home-live-winner-amount">+'+gram(winner.prizeNano)+' GRAM</div></article>'}
  function prepare(cards){for(var i=0;i<cards.length;i++){cards[i].setAttribute('data-rank',String(i+1).padStart(2,'0'));cards[i].style.setProperty('--winner-index',String(i))}}
  function bindHost(host){if(!host||host.dataset.winnersExpandBound==='1')return;host.dataset.winnersExpandBound='1';host.setAttribute('role','button');host.setAttribute('tabindex','0');host.setAttribute('aria-label','Open lottery winners');host.addEventListener('click',function(ev){if(host.classList.contains('is-winners-expanding'))return;if(ev.target&&ev.target.closest&&ev.target.closest('button,a,input,select,textarea'))return;openWinners(host)});host.addEventListener('keydown',function(ev){if((ev.key==='Enter'||ev.key===' ')&&!host.classList.contains('is-winners-expanding')){ev.preventDefault();openWinners(host)}})}
  function ensureLocation(){if(expandedHost&&expandedHost.classList.contains('is-winners-expanding'))return q('.rewards-live-winners',expandedHost);var root=targetRoot(),section=q('.rewards-live-winners');if(!root||!section)return null;if(root.id==='home'){var host=liveHost();if(!host)return null;if(section.parentNode!==host)host.appendChild(section);host.classList.add('home-ticket-card','home-winners-host');bindHost(host);return section}if(root.id==='rewards'){if(section.parentNode!==root)root.appendChild(section);return section}return null}
  function setStateTitle(waiting){var section=ensureLocation(),title=section&&q('#lotteryRewardsStateTitle',section);if(title)title.textContent=waiting?'Waiting for Winner':'Previous Winners'}
  function render(winners,waiting){var section=ensureLocation(),list=section&&q('#lotteryRewardsWinnersList',section);if(!list)return;setStateTitle(!!waiting);var map=winnerMap(winners),html='';for(var rank=1;rank<=15;rank++)html+=cardHtml(rank,map[rank],!!waiting);list.innerHTML=html;hydrateAvatars(list);prepare(list.querySelectorAll('.home-live-winner-card'))}
  function clearRetry(){if(retryTimer){clearTimeout(retryTimer);retryTimer=0}}
  function scheduleRetry(){var root=targetRoot();if(retryTimer||!root||!root.classList.contains('active')||document.hidden)return;var delay=retryDelay;retryDelay=Math.min(15000,Math.round(retryDelay*1.8));retryTimer=setTimeout(function(){retryTimer=0;loadWinners(true)},delay)}
  function schedulePhaseRefresh(payload){if(phaseTimer){clearTimeout(phaseTimer);phaseTimer=0}var next=Number(payload&&payload.nextDisplayChangeAtMs),serverNow=Number(payload&&payload.serverNowMs);if(!Number.isFinite(next)||!Number.isFinite(serverNow)||next<=serverNow)return;phaseTimer=setTimeout(function(){phaseTimer=0;loadWinners(true)},Math.max(80,next-serverNow+80))}
  async function loadWinners(force){var root=targetRoot(),section=ensureLocation(),data=initData();if(!root||!section||!data||loading)return false;var now=Date.now();if(!force&&now-lastRequestAt<500)return false;loading=true;lastRequestAt=now;try{var response=await fetch('/app/api/lottery/winners',{cache:'no-store',headers:{'accept':'application/json','x-telegram-init-data':data}});var payload=await response.json().catch(function(){return null});if(!response.ok||!payload)throw new Error('Could not load Lottery winners');clearRetry();retryDelay=1000;render(payload.winners||[],!!payload.waitingForWinner);schedulePhaseRefresh(payload);return true}catch(e){scheduleRetry();return false}finally{loading=false}}
  function ensureBackdrop(){var back=q('#homeWinnersBackdrop');if(back)return back;back=document.createElement('div');back.id='homeWinnersBackdrop';back.className='home-winners-backdrop';back.setAttribute('aria-hidden','true');back.addEventListener('click',function(){closeWinners()});document.body.appendChild(back);return back}
  function ensureChrome(host){var head=q('.home-winners-expanded-head',host);if(head)return head;head=document.createElement('div');head.className='home-winners-expanded-head';head.innerHTML='<div class="home-winners-expanded-copy"><strong>Lottery Winners</strong><span>Latest completed lottery round</span></div><button class="home-winners-close" type="button" aria-label="Close winners">×</button>';var section=q('.rewards-live-winners',host);host.insertBefore(head,section||host.firstChild);var close=q('.home-winners-close',head);if(close)close.addEventListener('click',function(ev){ev.preventDefault();ev.stopPropagation();closeWinners()});return head}
  function haptic(){try{var h=window.Telegram&&window.Telegram.WebApp&&window.Telegram.WebApp.HapticFeedback;if(h&&h.impactOccurred)h.impactOccurred('light')}catch(e){}}
  function openWinners(host){if(expandedHost||closing||!host||!homeOne()||!homeOne().classList.contains('active'))return;var section=ensureLocation();if(!section||section.parentNode!==host)return;var rect=host.getBoundingClientRect(),vw=Math.max(1,window.innerWidth||document.documentElement.clientWidth||390),vh=Math.max(1,window.innerHeight||document.documentElement.clientHeight||700);var width=Math.min(340,Math.max(280,rect.width*1.62),vw-28),height=Math.min(480,Math.max(360,rect.height*2.45),vh*.62);width=Math.min(width,vw-28);height=Math.min(height,vh-32);var left=Math.round((vw-width)/2),top=Math.round((vh-height)/2);placeholder=document.createElement('div');placeholder.className='home-winners-placeholder';placeholder.style.height=Math.max(1,rect.height)+'px';if(host.parentNode)host.parentNode.insertBefore(placeholder,host);ensureChrome(host);ensureBackdrop();expandedHost=host;document.documentElement.classList.add('vexa-winners-open');document.body.appendChild(host);host.removeAttribute('role');host.removeAttribute('tabindex');host.setAttribute('aria-modal','true');host.setAttribute('aria-label','Lottery winners');host.style.setProperty('--winners-left',left+'px');host.style.setProperty('--winners-top',top+'px');host.style.setProperty('--winners-width',width+'px');host.style.setProperty('--winners-height',height+'px');host.style.setProperty('--winners-from-x',(rect.left-left)+'px');host.style.setProperty('--winners-from-y',(rect.top-top)+'px');host.style.setProperty('--winners-scale-x',String(Math.max(.1,rect.width/width)));host.style.setProperty('--winners-scale-y',String(Math.max(.1,rect.height/height)));host.classList.add('is-winners-expanding');void host.offsetWidth;var back=q('#homeWinnersBackdrop');requestAnimationFrame(function(){if(back)back.classList.add('is-open');host.classList.add('is-winners-open')});haptic();loadWinners(true)}
  function finishClose(host){if(!host)return;host.classList.remove('is-winners-open','is-winners-expanding');host.removeAttribute('aria-modal');var head=q('.home-winners-expanded-head',host);if(head)head.remove();['--winners-left','--winners-top','--winners-width','--winners-height','--winners-from-x','--winners-from-y','--winners-scale-x','--winners-scale-y'].forEach(function(name){host.style.removeProperty(name)});if(placeholder&&placeholder.parentNode)placeholder.parentNode.replaceChild(host,placeholder);placeholder=null;expandedHost=null;closing=false;document.documentElement.classList.remove('vexa-winners-open');bindHost(host)}
  function closeWinners(){var host=expandedHost;if(!host||closing)return;closing=true;var back=q('#homeWinnersBackdrop');if(back)back.classList.remove('is-open');host.classList.remove('is-winners-open');haptic();var done=false,finish=function(){if(done)return;done=true;host.removeEventListener('transitionend',onEnd);finishClose(host)},onEnd=function(ev){if(ev.target===host&&ev.propertyName==='transform')finish()};host.addEventListener('transitionend',onEnd);setTimeout(finish,650)}
  function bind(){var root=targetRoot(),section=ensureLocation();if(!root||!section)return;if(root.classList.contains('active'))loadWinners(false)}
  function refreshWhenVisible(){var root=targetRoot();if(!document.hidden&&root&&root.classList.contains('active')){ensureLocation();loadWinners(false)}}
  document.addEventListener('click',function(ev){var target=ev.target&&ev.target.closest&&ev.target.closest('[data-view="home"],[data-view="rewards"]');if(target)setTimeout(bind,60)},true);
  document.addEventListener('keydown',function(ev){if(ev.key==='Escape'&&expandedHost)closeWinners()});
  window.addEventListener('vexa:section-mounted',bind);
  window.addEventListener('focus',refreshWhenVisible);
  document.addEventListener('visibilitychange',refreshWhenVisible);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
</script>`;
