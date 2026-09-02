export const REWARDS_LIVE_WINNERS_EFFECTS = `
<style id="vexa-rewards-live-winners-effects">
:is(#rewards,#home[data-home-variant="one"]) .rewards-live-winners{
  padding:0 10px 30px!important;
  position:relative!important;
}
#rewards .rewards-live-winners{margin-top:clamp(149px,27dvh,314px)!important}
#home[data-home-variant="one"] .rewards-live-winners{margin-top:14px!important}
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
:is(#rewards,#home[data-home-variant="one"]) .home-live-winner-card:after{
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
:is(#rewards,#home[data-home-variant="one"]) .home-live-winner-card:nth-child(-n+3):after{
  color:#fff!important;
  background:linear-gradient(145deg,rgba(255,255,255,.15),rgba(92,10,35,.18))!important;
  border-color:rgba(255,255,255,.19)!important;
}
:is(#rewards,#home[data-home-variant="one"]) .home-live-winner-card[data-rewards-hidden="1"]{pointer-events:none!important}
:is(#rewards,#home[data-home-variant="one"]) .rewards-winner-avatar-fallback{display:grid!important;place-items:center!important;background:rgba(255,255,255,.075)!important;color:#fff!important;font-size:14px!important;font-weight:950!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important}
:is(#rewards,#home[data-home-variant="one"]) .home-live-winner-card.is-waiting{opacity:.7}
@media(max-width:380px){
  #rewards .rewards-live-winners{margin-top:clamp(134px,25dvh,274px)!important}
  #home[data-home-variant="one"] .rewards-live-winners{margin-top:12px!important}
  :is(#rewards,#home[data-home-variant="one"]) .home-live-winner-card{grid-template-columns:42px minmax(0,1fr) auto 31px!important;gap:8px!important}
  :is(#rewards,#home[data-home-variant="one"]) .home-live-winner-card:after{width:28px!important;height:28px!important;border-radius:10px!important;font-size:9px!important}
}
@media(prefers-reduced-motion:reduce){:is(#rewards,#home[data-home-variant="one"]) .home-live-winner-card{filter:none!important;transform:none!important;transition:none!important}}
</style>
<script id="vexa-rewards-live-winners-scroll-script">
(function(){
  var ticking=false,loading=false,lastRequestAt=0,phaseTimer=0,retryTimer=0,retryDelay=1000;
  function q(s,r){return (r||document).querySelector(s)}
  function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
  function homeOne(){var home=document.getElementById('home');return home&&home.getAttribute('data-home-variant')==='one'?home:null}
  function targetRoot(){return homeOne()||document.getElementById('rewards')}
  function ensureLocation(){
    var home=homeOne(),rewards=document.getElementById('rewards'),section=q('.rewards-live-winners',home||rewards||document);if(!section)section=q('.rewards-live-winners');
    var root=home||rewards;if(!root||!section)return null;
    if(section.parentNode!==root)root.appendChild(section);
    if(home&&root.lastElementChild!==section)root.appendChild(section);
    return section;
  }
  function clampScroll(root,section){
    var y=Math.max(0,root&&root.scrollTop||0);
    if(root&&root.id==='home'&&section)y=Math.max(0,y-Math.max(0,(section.offsetTop||0)-12));
    return y;
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
  function render(winners,waiting){
    var list=q('#lotteryRewardsWinnersList');if(!list)return;
    setStateTitle(!!waiting);
    var map=winnerMap(winners),html='';for(var rank=1;rank<=15;rank++)html+=cardHtml(rank,map[rank],!!waiting);list.innerHTML=html;hydrateAvatars(list);queue();
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
  function prepare(cards){for(var i=0;i<cards.length;i++)cards[i].setAttribute('data-rank',String(i+1).padStart(2,'0'))}
  function reset(cards){prepare(cards);for(var i=0;i<cards.length;i++){cards[i].style.setProperty('--rewards-card-progress','0');cards[i].setAttribute('data-rewards-hidden','0')}}
  function apply(){
    ticking=false;
    var root=targetRoot(),section=ensureLocation();if(!root||!section)return;
    var cards=section.querySelectorAll('.home-live-winner-card');prepare(cards);
    if(!root.classList.contains('active')){root.classList.remove('rewards-winners-scrolled');reset(cards);return}
    var y=clampScroll(root,section),cardPitch=74,fadeDistance=44;
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
  function bind(){
    var root=targetRoot(),section=ensureLocation();if(!root||!section)return;
    if(!q('#lotteryRewardsWinnersList',section))return;
    var cards=section.querySelectorAll('.home-live-winner-card');reset(cards);
    if(root.dataset.winnersScrollBound!=='1'){
      root.dataset.winnersScrollBound='1';root.addEventListener('scroll',queue,{passive:true});window.addEventListener('resize',queue,{passive:true});
    }
    if(root.classList.contains('active'))loadWinners(false);queue();
  }
  function refreshWhenVisible(){var root=targetRoot();if(!document.hidden&&root&&root.classList.contains('active'))loadWinners(false)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
  document.addEventListener('click',function(ev){var target=ev.target&&ev.target.closest&&ev.target.closest('[data-view="home"],[data-view="rewards"]');if(target)setTimeout(function(){bind();refreshWhenVisible()},60)},true);
  window.addEventListener('vexa:section-mounted',bind);
  window.addEventListener('focus',refreshWhenVisible);
  document.addEventListener('visibilitychange',refreshWhenVisible);
})();
</script>`;
