export const REWARDS_LIVE_WINNERS_EFFECTS = `
<style id="vexa-rewards-live-winners-effects">
/* Home 1 reuses the existing Live Activity host, but only lottery results are visible. */
#home[data-home-variant="one"] .home-ticket-finance-visual.home-ticket-card.home-winners-host{
  cursor:pointer!important;
  -webkit-tap-highlight-color:transparent!important;
}
#home[data-home-variant="one"] .home-winners-host>.home-live-activity{display:none!important}
#home[data-home-variant="one"] .home-winners-host>.rewards-live-winners{
  position:absolute!important;
  left:8px!important;
  right:8px!important;
  top:15px!important;
  height:108px!important;
  min-height:0!important;
  margin:0!important;
  padding:0!important;
  display:block!important;
  overflow:hidden!important;
  background:transparent!important;
  box-shadow:none!important;
}
#home[data-home-variant="one"] .home-winners-host .rewards-winners-state-title{display:none!important}
#home[data-home-variant="one"] .home-winners-host .home-live-winners-list{
  position:relative!important;
  display:grid!important;
  grid-auto-rows:32px!important;
  align-content:start!important;
  gap:6px!important;
  min-height:0!important;
  height:100%!important;
  overflow:hidden!important;
  padding:0 2px!important;
  box-sizing:border-box!important;
  background:transparent!important;
  box-shadow:none!important;
  scrollbar-width:none!important;
  -webkit-overflow-scrolling:touch!important;
  overscroll-behavior:contain!important;
  mask-image:none!important;
  -webkit-mask-image:none!important;
}
#home[data-home-variant="one"] .home-winners-host .home-live-winners-list::-webkit-scrollbar{display:none!important}

/* Exact visual copy of the old Live Activity user row. */
#home[data-home-variant="one"] .home-winners-host .home-live-winner-card{
  position:relative!important;
  overflow:hidden!important;
  height:32px!important;
  min-height:32px!important;
  border:0!important;
  outline:0!important;
  border-radius:28px!important;
  background:
    radial-gradient(34px 34px at 0 0,rgba(186,53,87,.16) 0%,rgba(146,35,66,.07) 42%,rgba(104,18,44,0) 76%),
    radial-gradient(36px 36px at 100% 100%,rgba(172,46,79,.15) 0%,rgba(133,30,60,.065) 43%,rgba(94,16,39,0) 78%),
    radial-gradient(118% 76% at 10% -16%,rgba(255,255,255,.12) 0%,rgba(255,255,255,.032) 30%,rgba(255,255,255,0) 58%),
    radial-gradient(96% 72% at 102% 108%,rgba(255,255,255,.052) 0%,rgba(255,255,255,.010) 34%,rgba(255,255,255,0) 62%),
    radial-gradient(92% 78% at 88% 112%,rgba(72,5,27,.11) 0%,rgba(42,3,16,0) 60%)!important;
  box-shadow:
    0 12px 30px rgba(31,1,10,.32),
    0 0 18px rgba(69,5,26,.15),
    inset 3px 3px .5px -3.5px rgba(255,255,255,.10),
    inset -3px -3px .5px -3.5px rgba(156,38,70,.48),
    inset 1px 1px 1px -.5px rgba(140,29,61,.30),
    inset -1px -1px 1px -.5px rgba(124,22,53,.24),
    inset 0 0 6px 6px rgba(255,255,255,.055),
    inset 0 0 2px 2px rgba(255,255,255,.035),
    inset 0 1px 0 rgba(112,18,49,.065),
    inset 0 -1px 0 rgba(88,12,37,.15)!important;
  display:grid!important;
  grid-template-columns:minmax(0,1fr) auto!important;
  align-items:center!important;
  gap:8px!important;
  padding:0 10px!important;
  box-sizing:border-box!important;
  backdrop-filter:blur(22px) saturate(1.40) brightness(1.05) contrast(1.04)!important;
  -webkit-backdrop-filter:blur(22px) saturate(1.40) brightness(1.05) contrast(1.04)!important;
  isolation:isolate!important;
  opacity:1!important;
  transform:none!important;
  filter:none!important;
}
#home[data-home-variant="one"] .home-winners-host .home-live-winner-avatar{display:none!important}
#home[data-home-variant="one"] .home-winners-host .home-live-winner-user{
  min-width:0!important;
  display:flex!important;
  align-items:center!important;
  gap:5px!important;
  overflow:hidden!important;
}
#home[data-home-variant="one"] .home-winners-host .home-live-winner-user strong{
  flex:0 1 auto!important;
  min-width:0!important;
  max-width:46%!important;
  overflow:hidden!important;
  text-overflow:ellipsis!important;
  white-space:nowrap!important;
  color:#fff!important;
  font-size:9.5px!important;
  font-weight:900!important;
  line-height:1.08!important;
}
#home[data-home-variant="one"] .home-winners-host .home-live-winner-user span{
  flex:1 1 auto!important;
  min-width:0!important;
  overflow:hidden!important;
  text-overflow:ellipsis!important;
  white-space:nowrap!important;
  color:rgba(255,255,255,.48)!important;
  font-size:8px!important;
  font-weight:750!important;
  line-height:1.08!important;
}
#home[data-home-variant="one"] .home-winners-host .home-live-winner-amount{
  align-self:center!important;
  color:rgba(255,255,255,.34)!important;
  font-size:7.5px!important;
  font-weight:800!important;
  white-space:nowrap!important;
  margin-left:2px!important;
}
#home[data-home-variant="one"] .home-winners-host .home-live-winner-card:after{display:none!important;content:none!important}
#home[data-home-variant="one"] .home-winners-host .rewards-winner-avatar-fallback{display:none!important}

/* The same card only changes bounds. Its visual treatment never changes. */
.home-winners-backdrop{
  position:fixed!important;
  inset:0!important;
  z-index:2147482998!important;
  background:rgba(0,0,0,.06)!important;
  opacity:0!important;
  pointer-events:none!important;
  touch-action:none!important;
  overscroll-behavior:none!important;
  backdrop-filter:blur(0)!important;
  -webkit-backdrop-filter:blur(0)!important;
  transition:opacity .34s ease,background .34s ease,backdrop-filter .34s ease!important;
}
.home-winners-backdrop.is-open{
  opacity:1!important;
  pointer-events:auto!important;
  background:rgba(0,0,0,.36)!important;
  backdrop-filter:blur(6px) saturate(.94)!important;
  -webkit-backdrop-filter:blur(6px) saturate(.94)!important;
}
.home-winners-placeholder{visibility:hidden!important;pointer-events:none!important}
#home[data-home-variant="one"] .home-winners-host.is-winners-expanding{
  position:fixed!important;
  z-index:2147482999!important;
  margin:0!important;
  min-height:0!important;
  cursor:default!important;
  transition:left .50s cubic-bezier(.16,1,.3,1),top .50s cubic-bezier(.16,1,.3,1),width .50s cubic-bezier(.16,1,.3,1),height .50s cubic-bezier(.16,1,.3,1)!important;
  will-change:left,top,width,height!important;
}
#home[data-home-variant="one"] .home-winners-host.is-winners-expanding>.rewards-live-winners{
  left:8px!important;
  right:8px!important;
  top:15px!important;
  bottom:15px!important;
  height:auto!important;
}
#home[data-home-variant="one"] .home-winners-host.is-winners-expanding .home-live-winners-list{
  height:100%!important;
  overflow-y:auto!important;
  overflow-x:hidden!important;
  touch-action:pan-y!important;
}
@media(prefers-reduced-motion:reduce){
  #home[data-home-variant="one"] .home-winners-host.is-winners-expanding,.home-winners-backdrop{transition:none!important}
}
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
  function maskedName(item){var username=String(item&&item.username||'').replace(/^@+/,'').trim();if(!username)return esc(item&&item.displayName||'Player');if(username.length===1)return '@'+esc(username);if(username.length===2)return '@'+esc(username.charAt(0)+'*');if(username.length<=4)return '@'+esc(username.charAt(0)+'**'+username.charAt(username.length-1));return '@'+esc(username.slice(0,2)+'***'+username.slice(-2))}
  function avatarHtml(item){var url=String(item&&item.avatarUrl||'').trim();if(url)return '<img class="home-live-winner-avatar" src="'+esc(url)+'" alt="" decoding="async" loading="lazy" data-avatar-fallback="'+initial(item.displayName)+'"/>';return '<div class="home-live-winner-avatar rewards-winner-avatar-fallback">'+initial(item&&item.displayName)+'</div>'}
  function hydrateAvatars(root){var images=(root||document).querySelectorAll('img.home-live-winner-avatar[data-avatar-fallback]');for(var i=0;i<images.length;i++){(function(img){if(img.dataset.avatarBound==='1')return;img.dataset.avatarBound='1';img.addEventListener('error',function(){var fallback=document.createElement('div');fallback.className='home-live-winner-avatar rewards-winner-avatar-fallback';fallback.textContent=img.getAttribute('data-avatar-fallback')||'•';img.replaceWith(fallback)},{once:true})})(images[i])}}
  function cardHtml(rank,item,waiting){var rankText=String(rank).padStart(2,'0');if(waiting)return '<article class="home-live-winner-card is-waiting" data-rank="'+rankText+'"><div class="home-live-winner-avatar rewards-winner-avatar-fallback">'+rank+'</div><div class="home-live-winner-user"><strong>Waiting for draw</strong><span>Rank #'+rankText+'</span></div><div class="home-live-winner-amount">—</div></article>';if(!item)return '<article class="home-live-winner-card" data-rank="'+rankText+'"><div class="home-live-winner-avatar rewards-winner-avatar-fallback">'+rank+'</div><div class="home-live-winner-user"><strong>No result this round</strong><span>Rank #'+rankText+'</span></div><div class="home-live-winner-amount">—</div></article>';var level=Math.max(1,Math.floor(Number(item.level)||1));return '<article class="home-live-winner-card" data-rank="'+rankText+'">'+avatarHtml(item)+'<div class="home-live-winner-user"><strong>'+maskedName(item)+'</strong><span>Level '+level+'</span></div><div class="home-live-winner-amount">+'+gram(item.prizeNano)+' GRAM</div></article>'}
  function bindHost(host){if(!host||host.dataset.winnersExpandBound==='1')return;host.dataset.winnersExpandBound='1';host.setAttribute('role','button');host.setAttribute('tabindex','0');host.setAttribute('aria-label','Open lottery results');host.addEventListener('click',function(ev){if(host.classList.contains('is-winners-expanding'))return;if(ev.target&&ev.target.closest&&ev.target.closest('button,a,input,select,textarea'))return;openResults(host)});host.addEventListener('keydown',function(ev){if((ev.key==='Enter'||ev.key===' ')&&!host.classList.contains('is-winners-expanding')){ev.preventDefault();openResults(host)}})}
  function ensureLocation(){if(expandedHost&&expandedHost.classList.contains('is-winners-expanding'))return q('.rewards-live-winners',expandedHost);var root=targetRoot(),section=q('.rewards-live-winners');if(!root||!section)return null;if(root.id==='home'){var host=liveHost();if(!host)return null;if(section.parentNode!==host)host.appendChild(section);host.classList.add('home-ticket-card','home-winners-host');bindHost(host);return section}if(root.id==='rewards'){if(section.parentNode!==root)root.appendChild(section);return section}return null}
  function setStateTitle(waiting){var section=ensureLocation(),title=section&&q('#lotteryRewardsStateTitle',section);if(title)title.textContent=waiting?'Waiting for draw':'Previous draw'}
  function render(winners,waiting){var section=ensureLocation(),list=section&&q('#lotteryRewardsWinnersList',section);if(!list)return;setStateTitle(!!waiting);var map=winnerMap(winners),html='';for(var rank=1;rank<=15;rank++)html+=cardHtml(rank,map[rank],!!waiting);list.innerHTML=html;hydrateAvatars(list)}
  function clearRetry(){if(retryTimer){clearTimeout(retryTimer);retryTimer=0}}
  function scheduleRetry(){var root=targetRoot();if(retryTimer||!root||!root.classList.contains('active')||document.hidden)return;var delay=retryDelay;retryDelay=Math.min(15000,Math.round(retryDelay*1.8));retryTimer=setTimeout(function(){retryTimer=0;loadResults(true)},delay)}
  function schedulePhaseRefresh(payload){if(phaseTimer){clearTimeout(phaseTimer);phaseTimer=0}var next=Number(payload&&payload.nextDisplayChangeAtMs),serverNow=Number(payload&&payload.serverNowMs);if(!Number.isFinite(next)||!Number.isFinite(serverNow)||next<=serverNow)return;phaseTimer=setTimeout(function(){phaseTimer=0;loadResults(true)},Math.max(80,next-serverNow+80))}
  async function loadResults(force){var root=targetRoot(),section=ensureLocation(),data=initData();if(!root||!section||!data||loading)return false;var now=Date.now();if(!force&&now-lastRequestAt<500)return false;loading=true;lastRequestAt=now;try{var response=await fetch('/app/api/lottery/winners',{cache:'no-store',headers:{'accept':'application/json','x-telegram-init-data':data}});var payload=await response.json().catch(function(){return null});if(!response.ok||!payload)throw new Error('Could not load lottery results');clearRetry();retryDelay=1000;render(payload.winners||[],!!payload.waitingForWinner);schedulePhaseRefresh(payload);return true}catch(e){scheduleRetry();return false}finally{loading=false}}
  function ensureBackdrop(){var back=q('#homeWinnersBackdrop');if(back)return back;back=document.createElement('div');back.id='homeWinnersBackdrop';back.className='home-winners-backdrop';back.setAttribute('aria-hidden','true');back.addEventListener('click',function(){closeResults()});document.body.appendChild(back);return back}
  function haptic(){try{var h=window.Telegram&&window.Telegram.WebApp&&window.Telegram.WebApp.HapticFeedback;if(h&&h.impactOccurred)h.impactOccurred('light')}catch(e){}}
  function expandedSize(rect){var vw=Math.max(1,window.innerWidth||document.documentElement.clientWidth||390),vh=Math.max(1,window.innerHeight||document.documentElement.clientHeight||700);var width=Math.min(vw-44,Math.max(300,rect.width*1.45));var height=Math.min(vh-80,390,Math.max(330,rect.height*2));return{left:Math.round((vw-width)/2),top:Math.round((vh-height)/2),width:Math.round(width),height:Math.round(height)}}
  function setBounds(host,bounds){host.style.left=bounds.left+'px';host.style.top=bounds.top+'px';host.style.width=bounds.width+'px';host.style.height=bounds.height+'px'}
  function openResults(host){if(expandedHost||closing||!host||!homeOne()||!homeOne().classList.contains('active'))return;var section=ensureLocation();if(!section||section.parentNode!==host)return;var rect=host.getBoundingClientRect(),target=expandedSize(rect);placeholder=document.createElement('div');placeholder.className='home-winners-placeholder';placeholder.style.width=Math.max(1,rect.width)+'px';placeholder.style.height=Math.max(1,rect.height)+'px';if(host.parentNode)host.parentNode.insertBefore(placeholder,host);ensureBackdrop();expandedHost=host;host.removeAttribute('role');host.removeAttribute('tabindex');host.setAttribute('aria-modal','true');host.setAttribute('aria-label','Lottery results');setBounds(host,{left:rect.left,top:rect.top,width:rect.width,height:rect.height});host.classList.add('is-winners-expanding');void host.offsetWidth;var back=q('#homeWinnersBackdrop');requestAnimationFrame(function(){if(back)back.classList.add('is-open');setBounds(host,target)});haptic();loadResults(true)}
  function finishClose(host){if(!host)return;host.classList.remove('is-winners-expanding');host.removeAttribute('aria-modal');host.style.removeProperty('left');host.style.removeProperty('top');host.style.removeProperty('width');host.style.removeProperty('height');if(placeholder&&placeholder.parentNode)placeholder.parentNode.removeChild(placeholder);placeholder=null;expandedHost=null;closing=false;host.setAttribute('role','button');host.setAttribute('tabindex','0');host.setAttribute('aria-label','Open lottery results')}
  function closeResults(silent){var host=expandedHost;if(!host||closing)return;closing=true;var back=q('#homeWinnersBackdrop');if(back)back.classList.remove('is-open');var rect=placeholder&&placeholder.getBoundingClientRect?placeholder.getBoundingClientRect():null;if(!silent)haptic();if(!rect){finishClose(host);return}setBounds(host,{left:rect.left,top:rect.top,width:rect.width,height:rect.height});var done=false,finish=function(){if(done)return;done=true;host.removeEventListener('transitionend',onEnd);finishClose(host)},onEnd=function(ev){if(ev.target===host&&ev.propertyName==='height')finish()};host.addEventListener('transitionend',onEnd);setTimeout(finish,580)}
  function bind(){var root=targetRoot(),section=ensureLocation();if(!root||!section)return;if(root.classList.contains('active'))loadResults(false)}
  function refreshWhenVisible(){var root=targetRoot();if(!document.hidden&&root&&root.classList.contains('active')){ensureLocation();loadResults(false)}}
  document.addEventListener('click',function(ev){var target=ev.target&&ev.target.closest&&ev.target.closest('[data-view="home"],[data-view="rewards"]');if(!target)return;if(expandedHost)closeResults(true);setTimeout(bind,60)},true);
  document.addEventListener('keydown',function(ev){if(ev.key==='Escape'&&expandedHost)closeResults()});
  window.addEventListener('resize',function(){if(expandedHost)closeResults(true)},{passive:true});
  window.addEventListener('vexa:section-mounted',bind);
  window.addEventListener('focus',refreshWhenVisible);
  document.addEventListener('visibilitychange',refreshWhenVisible);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
</script>`;
