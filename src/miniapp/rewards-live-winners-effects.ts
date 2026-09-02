export const REWARDS_LIVE_WINNERS_EFFECTS = `
<style id="vexa-rewards-live-winners-effects">
:is(#rewards,#home[data-home-variant="one"]) .rewards-live-winners{
  padding:0 10px 30px!important;
  position:relative!important;
}
#rewards .rewards-live-winners{margin-top:clamp(149px,27dvh,314px)!important}
:is(#rewards,#home[data-home-variant="one"]) .home-live-winner-card{
  --rewards-card-progress:0;
  grid-template-columns:42px minmax(0,1fr) auto 34px!important;
  opacity:calc(1 - var(--rewards-card-progress))!important;
  transform:scale(calc(1 - var(--rewards-card-progress) * .018))!important;
  filter:blur(calc(var(--rewards-card-progress) * 3px))!important;
  transform-origin:50% 50%!important;
  will-change:transform,opacity,filter!important;
  transition:opacity .1s linear,transform .1s linear,filter .1s linear!important;
  pointer-events:auto;
}
:is(#rewards,#home[data-home-variant="one"]) .home-live-winner-card:after,
.home-winners-host.is-winners-expanding .home-live-winner-card:after{
  content:attr(data-rank)!important;
  grid-column:4!important;
  justify-self:end!important;
  align-self:center!important;
  width:30px!important;
  height:30px!important;
  display:grid!important;
  place-items:center!important;
  border-radius:11px!important;
  color:rgba(255,255,255,.88)!important;
  font-size:10px!important;
  line-height:1!important;
  font-weight:850!important;
  font-variant-numeric:tabular-nums!important;
  letter-spacing:.04em!important;
  background:linear-gradient(145deg,rgba(255,255,255,.105),rgba(255,255,255,.035))!important;
  border:1px solid rgba(255,255,255,.13)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.16),inset 0 -1px 0 rgba(255,255,255,.035),0 8px 18px rgba(0,0,0,.18)!important;
  backdrop-filter:blur(8px) saturate(1.12)!important;
  -webkit-backdrop-filter:blur(8px) saturate(1.12)!important;
  text-shadow:0 1px 8px rgba(0,0,0,.48)!important;
  box-sizing:border-box!important;
}
:is(#rewards,#home[data-home-variant="one"]) .home-live-winner-card:nth-child(-n+3):after,
.home-winners-host.is-winners-expanding .home-live-winner-card:nth-child(-n+3):after{
  color:#fff!important;
  background:linear-gradient(145deg,rgba(255,255,255,.15),rgba(92,10,35,.18))!important;
  border-color:rgba(255,255,255,.19)!important;
}
:is(#rewards,#home[data-home-variant="one"]) .home-live-winner-card[data-rewards-hidden="1"]{pointer-events:none!important}
:is(#rewards,#home[data-home-variant="one"]) .rewards-winner-avatar-fallback,
.home-winners-host.is-winners-expanding .rewards-winner-avatar-fallback{display:grid!important;place-items:center!important;background:rgba(255,255,255,.075)!important;color:#fff!important;font-size:14px!important;font-weight:950!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important}
:is(#rewards,#home[data-home-variant="one"]) .home-live-winner-card.is-waiting{opacity:.7}

/* Compact winners preview lives inside the existing Live Activity card. */
#home[data-home-variant="one"] .home-ticket-finance-visual.home-ticket-card.home-winners-host{
  min-height:154px!important;
  height:var(--home-live-activity-height,154px)!important;
  display:grid!important;
  grid-template-rows:minmax(0,1fr) 38px!important;
  gap:6px!important;
  padding:8px!important;
  box-sizing:border-box!important;
  cursor:pointer!important;
  touch-action:pan-y!important;
}
#home[data-home-variant="one"] .home-winners-host>.home-live-activity{height:auto!important;min-height:0!important;overflow:hidden!important}
#home[data-home-variant="one"] .home-winners-host>.rewards-live-winners{
  height:38px!important;
  min-height:38px!important;
  margin:0!important;
  padding:0!important;
  display:grid!important;
  grid-template-columns:52px minmax(0,1fr)!important;
  align-items:center!important;
  gap:4px!important;
  overflow:hidden!important;
  background:transparent!important;
  box-shadow:none!important;
}
#home[data-home-variant="one"] .home-winners-host>.rewards-live-winners .rewards-winners-state-title{
  height:38px!important;
  margin:0!important;
  padding:0 0 0 4px!important;
  display:flex!important;
  align-items:center!important;
  color:transparent!important;
  font-size:0!important;
  font-weight:900!important;
  white-space:nowrap!important;
  opacity:1!important;
  transform:none!important;
}
#home[data-home-variant="one"] .home-winners-host>.rewards-live-winners .rewards-winners-state-title:after{
  content:'Winners'!important;
  color:rgba(255,255,255,.72)!important;
  font-size:9px!important;
  line-height:1!important;
  font-weight:900!important;
  letter-spacing:-.015em!important;
}
#home[data-home-variant="one"] .home-winners-host .home-live-winners-list{
  height:38px!important;
  min-height:38px!important;
  margin:0!important;
  padding:0!important;
  display:block!important;
  overflow:hidden!important;
  background:transparent!important;
  box-shadow:none!important;
}
#home[data-home-variant="one"] .home-winners-host .home-live-winner-card{display:none!important}
#home[data-home-variant="one"] .home-winners-host .home-live-winner-card:first-child{
  height:38px!important;
  min-height:38px!important;
  margin:0!important;
  padding:5px 7px!important;
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
#home[data-home-variant="one"] .home-winners-host .home-live-winner-card:first-child .home-live-winner-avatar{width:26px!important;height:26px!important;border-radius:50%!important;font-size:9px!important;object-fit:cover!important}
#home[data-home-variant="one"] .home-winners-host .home-live-winner-card:first-child .home-live-winner-user{min-width:0!important;display:block!important}
#home[data-home-variant="one"] .home-winners-host .home-live-winner-card:first-child .home-live-winner-user strong{display:block!important;color:#fff!important;font-size:8.5px!important;font-weight:900!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
#home[data-home-variant="one"] .home-winners-host .home-live-winner-card:first-child .home-live-winner-user span{display:none!important}
#home[data-home-variant="one"] .home-winners-host .home-live-winner-card:first-child .home-live-winner-amount{color:rgba(255,255,255,.68)!important;font-size:7.5px!important;font-weight:900!important;white-space:nowrap!important}
#home[data-home-variant="one"] .home-winners-host .home-live-winner-card:first-child:after{width:20px!important;height:20px!important;border-radius:8px!important;font-size:7px!important}
#home[data-home-variant="one"] .home-winners-host:after{
  content:''!important;
  position:absolute!important;
  inset:0!important;
  border-radius:inherit!important;
  pointer-events:none!important;
  opacity:0!important;
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)!important;
  transition:opacity .22s ease!important;
}
#home[data-home-variant="one"] .home-winners-host:active:after{opacity:1!important}

/* Shared-element expansion: the same Live Activity card grows into the winners view. */
.home-winners-backdrop{
  position:fixed!important;
  inset:0!important;
  z-index:2147482998!important;
  background:rgba(0,0,0,.18)!important;
  opacity:0!important;
  pointer-events:none!important;
  backdrop-filter:blur(0)!important;
  -webkit-backdrop-filter:blur(0)!important;
  transition:opacity .48s cubic-bezier(.16,1,.3,1),background .48s cubic-bezier(.16,1,.3,1),backdrop-filter .48s ease!important;
}
.home-winners-backdrop.is-open{opacity:1!important;pointer-events:auto!important;background:rgba(0,0,0,.58)!important;backdrop-filter:blur(12px) saturate(.82)!important;-webkit-backdrop-filter:blur(12px) saturate(.82)!important}
.home-winners-placeholder{min-height:154px!important;height:var(--home-live-activity-height,154px)!important;width:100%!important;visibility:hidden!important;pointer-events:none!important}
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
  grid-template-rows:auto minmax(0,1fr)!important;
  gap:0!important;
  overflow:hidden!important;
  border:0!important;
  outline:0!important;
  border-radius:28px!important;
  background:rgba(12,8,10,.86)!important;
  box-shadow:0 32px 90px rgba(0,0,0,.58),inset 0 1px 0 rgba(255,255,255,.13),inset 0 -1px 0 rgba(255,255,255,.045),inset 0 0 32px rgba(255,255,255,.035)!important;
  backdrop-filter:blur(24px) saturate(1.22)!important;
  -webkit-backdrop-filter:blur(24px) saturate(1.22)!important;
  transform-origin:0 0!important;
  transform:translate3d(var(--winners-from-x),var(--winners-from-y),0) scale(var(--winners-scale-x),var(--winners-scale-y))!important;
  transition:transform .64s cubic-bezier(.16,1,.30,1),border-radius .64s cubic-bezier(.16,1,.30,1),box-shadow .64s ease,background .64s ease!important;
  will-change:transform!important;
  isolation:isolate!important;
}
.home-winners-host.is-winners-expanding:before{
  content:''!important;
  position:absolute!important;
  inset:-18%!important;
  z-index:0!important;
  pointer-events:none!important;
  background:radial-gradient(circle at 86% 8%,rgba(118,22,51,.23),rgba(55,7,23,.08) 30%,rgba(0,0,0,0) 58%),radial-gradient(circle at 8% 94%,rgba(255,255,255,.055),rgba(0,0,0,0) 38%)!important;
  opacity:0!important;
  transform:scale(.92)!important;
  transition:opacity .5s ease .12s,transform .72s cubic-bezier(.16,1,.3,1) .08s!important;
}
.home-winners-host.is-winners-expanding.is-winners-open{transform:none!important;border-radius:32px!important;background:rgba(10,8,9,.91)!important;box-shadow:0 38px 110px rgba(0,0,0,.68),inset 0 1px 0 rgba(255,255,255,.15),inset 0 -1px 0 rgba(255,255,255,.055),inset 0 0 38px rgba(255,255,255,.04)!important}
.home-winners-host.is-winners-expanding.is-winners-open:before{opacity:1!important;transform:scale(1)!important}
.home-winners-host.is-winners-expanding>.home-live-activity{
  position:absolute!important;
  inset:8px!important;
  z-index:3!important;
  width:auto!important;
  height:auto!important;
  opacity:1!important;
  transform:scale(1)!important;
  transform-origin:50% 38%!important;
  pointer-events:none!important;
  transition:opacity .20s ease,transform .34s cubic-bezier(.16,1,.3,1),filter .26s ease!important;
}
.home-winners-host.is-winners-expanding.is-winners-open>.home-live-activity{opacity:0!important;transform:scale(.94)!important;filter:blur(5px)!important}
.home-winners-expanded-head{
  position:relative!important;
  z-index:4!important;
  min-height:76px!important;
  padding:18px 18px 12px!important;
  display:flex!important;
  align-items:center!important;
  justify-content:space-between!important;
  gap:14px!important;
  box-sizing:border-box!important;
  opacity:0!important;
  transform:translate3d(0,14px,0)!important;
  transition:opacity .32s ease,transform .52s cubic-bezier(.16,1,.3,1)!important;
}
.home-winners-host.is-winners-open .home-winners-expanded-head{opacity:1!important;transform:none!important;transition-delay:.18s!important}
.home-winners-expanded-copy{min-width:0!important;display:grid!important;gap:5px!important}
.home-winners-expanded-copy strong{color:#fff!important;font-size:21px!important;line-height:1!important;font-weight:950!important;letter-spacing:-.045em!important}
.home-winners-expanded-copy span{color:rgba(255,255,255,.42)!important;font-size:10px!important;line-height:1.2!important;font-weight:800!important}
.home-winners-close{
  width:38px!important;
  height:38px!important;
  flex:0 0 38px!important;
  border:0!important;
  border-radius:15px!important;
  background:rgba(255,255,255,.07)!important;
  color:#fff!important;
  display:grid!important;
  place-items:center!important;
  font-size:20px!important;
  line-height:1!important;
  font-weight:500!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.09)!important;
  -webkit-tap-highlight-color:transparent!important;
}
.home-winners-close:active{transform:scale(.92)!important}
.home-winners-host.is-winners-expanding>.rewards-live-winners{
  position:relative!important;
  z-index:4!important;
  min-height:0!important;
  height:auto!important;
  margin:0!important;
  padding:0 12px 14px!important;
  display:grid!important;
  grid-template-rows:auto minmax(0,1fr)!important;
  gap:10px!important;
  overflow:hidden!important;
  opacity:0!important;
  transform:translate3d(0,18px,0)!important;
  transition:opacity .34s ease,transform .56s cubic-bezier(.16,1,.3,1)!important;
  box-sizing:border-box!important;
}
.home-winners-host.is-winners-expanding.is-winners-open>.rewards-live-winners{opacity:1!important;transform:none!important;transition-delay:.22s!important}
.home-winners-host.is-winners-expanding .rewards-winners-state-title{
  margin:0 6px!important;
  color:rgba(255,255,255,.54)!important;
  font-size:11px!important;
  line-height:1.2!important;
  font-weight:850!important;
  letter-spacing:-.015em!important;
  opacity:1!important;
  transform:none!important;
}
.home-winners-host.is-winners-expanding .home-live-winners-list{
  min-height:0!important;
  height:auto!important;
  max-height:none!important;
  display:grid!important;
  align-content:start!important;
  gap:10px!important;
  overflow-y:auto!important;
  overflow-x:hidden!important;
  padding:0 2px 18px!important;
  background:transparent!important;
  box-shadow:none!important;
  scrollbar-width:none!important;
  overscroll-behavior:contain!important;
  -webkit-overflow-scrolling:touch!important;
}
.home-winners-host.is-winners-expanding .home-live-winners-list::-webkit-scrollbar{display:none!important}
.home-winners-host.is-winners-expanding .home-live-winner-card{
  --rewards-card-progress:0!important;
  position:relative!important;
  overflow:hidden!important;
  min-height:64px!important;
  border:0!important;
  outline:0!important;
  border-radius:28px!important;
  background:transparent!important;
  background-color:transparent!important;
  background-image:none!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.105),inset 0 -1px 0 rgba(255,255,255,.06),inset 0 0 22px rgba(255,255,255,.055),0 16px 36px rgba(0,0,0,.22)!important;
  display:grid!important;
  grid-template-columns:42px minmax(0,1fr) auto 34px!important;
  align-items:center!important;
  gap:10px!important;
  padding:11px 14px!important;
  backdrop-filter:blur(3px) saturate(1.04)!important;
  -webkit-backdrop-filter:blur(3px) saturate(1.04)!important;
  opacity:1!important;
  transform:none!important;
  filter:none!important;
  box-sizing:border-box!important;
}
.home-winners-host.is-winners-expanding.is-winners-open .home-live-winner-card{animation:vexaWinnerReveal .52s cubic-bezier(.16,1,.3,1) both!important;animation-delay:calc(.18s + var(--winner-index,0) * 34ms)!important}
.home-winners-host.is-winners-expanding .home-live-winner-avatar{width:42px!important;height:42px!important;border-radius:50%!important;object-fit:cover!important;display:block!important;background:transparent!important;box-shadow:none!important}
.home-winners-host.is-winners-expanding .home-live-winner-user{min-width:0!important;display:grid!important;gap:3px!important}
.home-winners-host.is-winners-expanding .home-live-winner-user strong{display:block!important;color:#fff!important;font-size:13px!important;font-weight:900!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
.home-winners-host.is-winners-expanding .home-live-winner-user span{display:block!important;color:rgba(255,255,255,.48)!important;font-size:10px!important;font-weight:750!important}
.home-winners-host.is-winners-expanding .home-live-winner-amount{color:#fff!important;font-size:13px!important;font-weight:950!important;white-space:nowrap!important}
@keyframes vexaWinnerReveal{0%{opacity:0;transform:translate3d(0,18px,0) scale(.965);filter:blur(4px)}62%{opacity:1;transform:translate3d(0,-2px,0) scale(1.006);filter:blur(0)}100%{opacity:1;transform:none;filter:none}}

@media(max-width:380px){
  #rewards .rewards-live-winners{margin-top:clamp(134px,25dvh,274px)!important}
  :is(#rewards,#home[data-home-variant="one"]) .home-live-winner-card{grid-template-columns:42px minmax(0,1fr) auto 31px!important;gap:8px!important}
  :is(#rewards,#home[data-home-variant="one"]) .home-live-winner-card:after{width:28px!important;height:28px!important;border-radius:10px!important;font-size:9px!important}
  #home[data-home-variant="one"] .home-winners-host>.rewards-live-winners{grid-template-columns:46px minmax(0,1fr)!important}
  #home[data-home-variant="one"] .home-winners-host>.rewards-live-winners .rewards-winners-state-title:after{font-size:8px!important}
  .home-winners-host.is-winners-expanding .home-live-winner-card{grid-template-columns:40px minmax(0,1fr) auto 30px!important;gap:8px!important;padding:10px 11px!important}
  .home-winners-host.is-winners-expanding .home-live-winner-avatar{width:40px!important;height:40px!important}
  .home-winners-host.is-winners-expanding .home-live-winner-card:after{width:28px!important;height:28px!important;border-radius:10px!important;font-size:9px!important}
}
@media(prefers-reduced-motion:reduce){
  :is(#rewards,#home[data-home-variant="one"]) .home-live-winner-card,.home-winners-host.is-winners-expanding,.home-winners-host.is-winners-expanding .home-live-winner-card,.home-winners-backdrop{animation:none!important;transition:none!important;filter:none!important}
}
</style>
<script id="vexa-rewards-live-winners-scroll-script">
(function(){
  var ticking=false,loading=false,lastRequestAt=0,phaseTimer=0,retryTimer=0,retryDelay=1000;
  var expandedHost=null,placeholder=null,closing=false,bodyOverflow='';
  function q(s,r){return (r||document).querySelector(s)}
  function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
  function homeOne(){var home=document.getElementById('home');return home&&home.getAttribute('data-home-variant')==='one'?home:null}
  function liveHost(){var home=homeOne();if(!home)return null;var host=q('.home-ticket-finance-visual.home-ticket-card',home)||q('.home-ticket-finance-visual',home);return host&&q('.home-live-activity',host)?host:null}
  function targetRoot(){return homeOne()||document.getElementById('rewards')}
  function ensureLocation(){
    if(expandedHost&&expandedHost.classList.contains('is-winners-expanding'))return q('.rewards-live-winners',expandedHost);
    var home=homeOne(),rewards=document.getElementById('rewards'),section=q('.rewards-live-winners',home||rewards||document);if(!section)section=q('.rewards-live-winners');
    if(!section)return null;
    if(home){
      var host=liveHost();if(!host)return null;
      if(section.parentNode!==host)host.appendChild(section);
      host.classList.add('home-winners-host');
      bindHost(host);
      return section;
    }
    if(!rewards)return null;
    if(section.parentNode!==rewards)rewards.appendChild(section);
    return section;
  }
  function initData(){var tg=window.Telegram&&window.Telegram.WebApp;return String(tg&&tg.initData||'')}
  function gram(nano){var value=Math.max(0,Number(nano)||0)/1000000000;return value.toFixed(2).replace(/\\.00$/,'').replace(/(\\.\\d)0$/,'$1')}
  function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(ch){return ch==='&'?'&amp;':ch==='<'?'&lt;':ch==='>'?'&gt;':ch==='"'?'&quot;':'&#39;'})}
  function winnerMap(winners){var map={};(Array.isArray(winners)?winners:[]).forEach(function(item){var rank=Math.floor(Number(item&&item.rank)||0);if(rank>=1&&rank<=15)map[rank]=item});return map}
  function initial(name){var value=String(name||'').replace(/^@/,'').trim();return esc((value.charAt(0)||'•').toUpperCase())}
  function maskedName(winner){
    var username=String(winner&&winner.username||'').replace(/^@+/,'').trim();
    if(!username)return esc(winner&&winner.displayName||'Player');
    if(username.length===1)return '@'+esc(username);
    if(username.length===2)return '@'+esc(username.charAt(0)+'*');
    if(username.length<=4)return '@'+esc(username.charAt(0)+'**'+username.charAt(username.length-1));
    return '@'+esc(username.slice(0,2)+'***'+username.slice(-2));
  }
  function avatarHtml(winner){
    var url=String(winner&&winner.avatarUrl||'').trim();
    if(url)return '<img class="home-live-winner-avatar" src="'+esc(url)+'" alt="" decoding="async" loading="lazy" data-avatar-fallback="'+initial(winner.displayName)+'"/>';
    return '<div class="home-live-winner-avatar rewards-winner-avatar-fallback">'+initial(winner&&winner.displayName)+'</div>';
  }
  function hydrateAvatars(root){
    var images=(root||document).querySelectorAll('img.home-live-winner-avatar[data-avatar-fallback]');
    for(var i=0;i<images.length;i++){
      (function(img){
        if(img.dataset.avatarBound==='1')return;img.dataset.avatarBound='1';
        img.addEventListener('error',function(){var fallback=document.createElement('div');fallback.className='home-live-winner-avatar rewards-winner-avatar-fallback';fallback.textContent=img.getAttribute('data-avatar-fallback')||'•';img.replaceWith(fallback)},{once:true});
      })(images[i]);
    }
  }
  function cardHtml(rank,winner,waiting){
    var rankText=String(rank).padStart(2,'0');
    if(waiting)return '<article class="home-live-winner-card is-waiting" data-rank="'+rankText+'"><div class="home-live-winner-avatar rewards-winner-avatar-fallback">'+rank+'</div><div class="home-live-winner-user"><strong>Waiting for winner</strong><span>Rank #'+rankText+'</span></div><div class="home-live-winner-amount">—</div></article>';
    if(!winner)return '<article class="home-live-winner-card" data-rank="'+rankText+'"><div class="home-live-winner-avatar rewards-winner-avatar-fallback">'+rank+'</div><div class="home-live-winner-user"><strong>No winner this round</strong><span>Rank #'+rankText+'</span></div><div class="home-live-winner-amount">—</div></article>';
    var level=Math.max(1,Math.floor(Number(winner.level)||1));
    return '<article class="home-live-winner-card" data-rank="'+rankText+'">'+avatarHtml(winner)+'<div class="home-live-winner-user"><strong>'+maskedName(winner)+'</strong><span>Level '+level+'</span></div><div class="home-live-winner-amount">+'+gram(winner.prizeNano)+' GRAM</div></article>';
  }
  function setStateTitle(waiting){var title=q('#lotteryRewardsStateTitle');if(title)title.textContent=waiting?'Waiting for Winner':'Previous Winners'}
  function prepare(cards){for(var i=0;i<cards.length;i++){cards[i].setAttribute('data-rank',String(i+1).padStart(2,'0'));cards[i].style.setProperty('--winner-index',String(i))}}
  function reset(cards){prepare(cards);for(var i=0;i<cards.length;i++){cards[i].style.setProperty('--rewards-card-progress','0');cards[i].setAttribute('data-rewards-hidden','0')}}
  function render(winners,waiting){
    var section=ensureLocation(),list=section&&q('#lotteryRewardsWinnersList',section);if(!list)return;
    setStateTitle(!!waiting);
    var map=winnerMap(winners),html='';for(var rank=1;rank<=15;rank++)html+=cardHtml(rank,map[rank],!!waiting);list.innerHTML=html;hydrateAvatars(list);reset(list.querySelectorAll('.home-live-winner-card'));queue();
  }
  function clearRetry(){if(retryTimer){clearTimeout(retryTimer);retryTimer=0}}
  function scheduleRetry(){
    var root=targetRoot();if(retryTimer||!root||!root.classList.contains('active')||document.hidden)return;
    var delay=retryDelay;retryDelay=Math.min(15000,Math.round(retryDelay*1.8));
    retryTimer=setTimeout(function(){retryTimer=0;loadWinners(true)},delay);
  }
  function schedulePhaseRefresh(payload){
    if(phaseTimer){clearTimeout(phaseTimer);phaseTimer=0}
    var next=Number(payload&&payload.nextDisplayChangeAtMs),serverNow=Number(payload&&payload.serverNowMs);
    if(!Number.isFinite(next)||!Number.isFinite(serverNow)||next<=serverNow)return;
    phaseTimer=setTimeout(function(){phaseTimer=0;loadWinners(true)},Math.max(80,next-serverNow+80));
  }
  function apply(){
    ticking=false;
    var root=targetRoot(),section=ensureLocation();if(!root||!section)return;
    var cards=section.querySelectorAll('.home-live-winner-card');
    if(homeOne()){reset(cards);return}
    prepare(cards);
    if(!root.classList.contains('active')){root.classList.remove('rewards-winners-scrolled');reset(cards);return}
    var y=Math.max(0,root.scrollTop||0),cardPitch=74,fadeDistance=44;
    root.classList.toggle('rewards-winners-scrolled',y>12);
    for(var i=0;i<cards.length;i++){
      var start=i*cardPitch,p=clamp((y-start)/fadeDistance,0,1);
      cards[i].style.setProperty('--rewards-card-progress',String(p));cards[i].setAttribute('data-rewards-hidden',p>.98?'1':'0');
    }
  }
  function queue(){if(ticking)return;ticking=true;requestAnimationFrame(apply)}
  async function loadWinners(force){
    var root=targetRoot(),section=ensureLocation(),data=initData();if(!root||!section||!data||loading)return false;
    var now=Date.now();if(!force&&now-lastRequestAt<500)return false;
    loading=true;lastRequestAt=now;
    try{
      var response=await fetch('/app/api/lottery/winners',{cache:'no-store',headers:{'accept':'application/json','x-telegram-init-data':data}});
      var payload=await response.json().catch(function(){return null});
      if(!response.ok||!payload)throw new Error('Could not load Lottery winners');
      clearRetry();retryDelay=1000;render(payload.winners||[],!!payload.waitingForWinner);schedulePhaseRefresh(payload);return true;
    }catch(e){scheduleRetry();return false}finally{loading=false}
  }
  function ensureBackdrop(){
    var back=q('#homeWinnersBackdrop');if(back)return back;
    back=document.createElement('div');back.id='homeWinnersBackdrop';back.className='home-winners-backdrop';back.setAttribute('aria-hidden','true');
    back.addEventListener('click',function(){closeWinners()});document.body.appendChild(back);return back;
  }
  function ensureChrome(host){
    var head=q('.home-winners-expanded-head',host);if(head)return head;
    head=document.createElement('div');head.className='home-winners-expanded-head';
    head.innerHTML='<div class="home-winners-expanded-copy"><strong>Lottery Winners</strong><span>Latest completed lottery round</span></div><button class="home-winners-close" type="button" aria-label="Close winners">×</button>';
    var section=q('.rewards-live-winners',host);host.insertBefore(head,section||host.firstChild);
    var close=q('.home-winners-close',head);if(close)close.addEventListener('click',function(ev){ev.preventDefault();ev.stopPropagation();closeWinners()});
    return head;
  }
  function haptic(){try{var h=window.Telegram&&window.Telegram.WebApp&&window.Telegram.WebApp.HapticFeedback;if(h&&h.impactOccurred)h.impactOccurred('light')}catch(e){}}
  function openWinners(host){
    if(expandedHost||closing||!host||!homeOne())return;
    var section=ensureLocation();if(!section||section.parentNode!==host)return;
    var rect=host.getBoundingClientRect(),vw=Math.max(1,window.innerWidth||document.documentElement.clientWidth||rect.width),vh=Math.max(1,window.innerHeight||document.documentElement.clientHeight||rect.height);
    var left=10,top=10,width=Math.max(280,vw-20),height=Math.max(320,vh-20);
    placeholder=document.createElement('div');placeholder.className='home-winners-placeholder';placeholder.style.height=Math.max(154,rect.height)+'px';
    if(host.parentNode)host.parentNode.insertBefore(placeholder,host);
    ensureChrome(host);ensureBackdrop();expandedHost=host;
    bodyOverflow=document.body.style.overflow||'';document.body.style.overflow='hidden';document.documentElement.classList.add('vexa-winners-open');
    document.body.appendChild(host);
    host.removeAttribute('role');host.removeAttribute('tabindex');host.setAttribute('aria-modal','true');host.setAttribute('aria-label','Lottery winners');
    host.style.setProperty('--winners-left',left+'px');host.style.setProperty('--winners-top',top+'px');host.style.setProperty('--winners-width',width+'px');host.style.setProperty('--winners-height',height+'px');
    host.style.setProperty('--winners-from-x',(rect.left-left)+'px');host.style.setProperty('--winners-from-y',(rect.top-top)+'px');host.style.setProperty('--winners-scale-x',String(Math.max(.08,rect.width/width)));host.style.setProperty('--winners-scale-y',String(Math.max(.08,rect.height/height)));
    host.classList.add('is-winners-expanding');void host.offsetWidth;
    var back=q('#homeWinnersBackdrop');requestAnimationFrame(function(){if(back)back.classList.add('is-open');host.classList.add('is-winners-open')});
    haptic();loadWinners(true);
  }
  function finishClose(host){
    if(!host)return;
    host.classList.remove('is-winners-open','is-winners-expanding');host.removeAttribute('aria-modal');host.setAttribute('role','button');host.setAttribute('tabindex','0');host.setAttribute('aria-label','Open lottery winners');
    ['--winners-left','--winners-top','--winners-width','--winners-height','--winners-from-x','--winners-from-y','--winners-scale-x','--winners-scale-y'].forEach(function(name){host.style.removeProperty(name)});
    if(placeholder&&placeholder.parentNode)placeholder.parentNode.replaceChild(host,placeholder);placeholder=null;expandedHost=null;closing=false;
    document.body.style.overflow=bodyOverflow;document.documentElement.classList.remove('vexa-winners-open');bindHost(host);queue();
  }
  function closeWinners(){
    var host=expandedHost;if(!host||closing)return;closing=true;
    var back=q('#homeWinnersBackdrop');if(back)back.classList.remove('is-open');host.classList.remove('is-winners-open');haptic();
    var done=false,finish=function(){if(done)return;done=true;host.removeEventListener('transitionend',onEnd);finishClose(host)},onEnd=function(ev){if(ev.target===host&&ev.propertyName==='transform')finish()};
    host.addEventListener('transitionend',onEnd);setTimeout(finish,720);
  }
  function bindHost(host){
    if(!host||host.dataset.winnersExpandBound==='1')return;host.dataset.winnersExpandBound='1';host.setAttribute('role','button');host.setAttribute('tabindex','0');host.setAttribute('aria-label','Open lottery winners');
    host.addEventListener('click',function(ev){if(host.classList.contains('is-winners-expanding'))return;if(ev.target&&ev.target.closest&&ev.target.closest('button,a,input,select,textarea'))return;openWinners(host)});
    host.addEventListener('keydown',function(ev){if((ev.key==='Enter'||ev.key===' ')&&!host.classList.contains('is-winners-expanding')){ev.preventDefault();openWinners(host)}});
  }
  function bind(){
    var root=targetRoot(),section=ensureLocation();if(!root||!section)return;
    if(!q('#lotteryRewardsWinnersList',section))return;
    reset(section.querySelectorAll('.home-live-winner-card'));
    if(root.dataset.winnersScrollBound!=='1'){
      root.dataset.winnersScrollBound='1';root.addEventListener('scroll',queue,{passive:true});window.addEventListener('resize',queue,{passive:true});
    }
    if(root.classList.contains('active'))loadWinners(false);queue();
  }
  function refreshWhenVisible(){var root=targetRoot();if(!document.hidden&&root&&root.classList.contains('active'))loadWinners(false)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
  window.addEventListener('load',bind,{once:true});
  window.addEventListener('vexa:live-activity',bind);
  document.addEventListener('keydown',function(ev){if(ev.key==='Escape'&&expandedHost)closeWinners()});
  document.addEventListener('click',function(ev){var target=ev.target&&ev.target.closest&&ev.target.closest('[data-view]');if(target&&target.getAttribute('data-view')!=='home'&&expandedHost)closeWinners();if(target&&target.getAttribute('data-view')==='home')setTimeout(function(){bind();refreshWhenVisible()},60)},true);
  window.addEventListener('vexa:section-mounted',bind);
  window.addEventListener('focus',refreshWhenVisible);
  document.addEventListener('visibilitychange',refreshWhenVisible);
})();
</script>`;
