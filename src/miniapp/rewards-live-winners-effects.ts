export const REWARDS_LIVE_WINNERS_EFFECTS = `
<style id="vexa-rewards-live-winners-effects">
#rewards .rewards-live-winners{
  margin-top:clamp(175px,31dvh,340px)!important;
  padding:0 10px 30px!important;
  position:relative!important;
}
#rewards .home-live-winner-card{
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
#rewards .home-live-winner-card:after{
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
#rewards .home-live-winner-card:nth-child(-n+3):after{
  color:#fff!important;
  background:linear-gradient(145deg,rgba(255,255,255,.15),rgba(92,10,35,.18))!important;
  border-color:rgba(255,255,255,.19)!important;
}
#rewards .home-live-winner-card[data-rewards-hidden="1"]{pointer-events:none!important}
#rewards .rewards-winner-avatar-fallback{display:grid!important;place-items:center!important;background:rgba(255,255,255,.075)!important;color:#fff!important;font-size:14px!important;font-weight:950!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important}
#rewards .home-live-winner-card.is-waiting{opacity:.7}
@media(max-width:380px){
  #rewards .rewards-live-winners{margin-top:clamp(160px,29dvh,300px)!important}
  #rewards .home-live-winner-card{grid-template-columns:42px minmax(0,1fr) auto 31px!important;gap:8px!important}
  #rewards .home-live-winner-card:after{width:28px!important;height:28px!important;border-radius:10px!important;font-size:9px!important}
}
@media(prefers-reduced-motion:reduce){#rewards .home-live-winner-card{filter:none!important;transform:none!important;transition:none!important}}
</style>
<script id="vexa-rewards-live-winners-scroll-script">
(function(){
  var ticking=false,loading=false,lastLoadedAt=0,pollStarted=false;
  function q(s,r){return (r||document).querySelector(s)}
  function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
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
  function render(winners,waiting){
    var list=q('#lotteryRewardsWinnersList');if(!list)return;
    var map=winnerMap(winners),html='';for(var rank=1;rank<=15;rank++)html+=cardHtml(rank,map[rank],!!waiting);list.innerHTML=html;hydrateAvatars(list);queue();
  }
  function prepare(cards){for(var i=0;i<cards.length;i++)cards[i].setAttribute('data-rank',String(i+1).padStart(2,'0'))}
  function reset(cards){prepare(cards);for(var i=0;i<cards.length;i++){cards[i].style.setProperty('--rewards-card-progress','0');cards[i].setAttribute('data-rewards-hidden','0')}}
  function apply(){
    ticking=false;
    var rewards=document.getElementById('rewards');if(!rewards)return;
    var cards=rewards.querySelectorAll('.home-live-winner-card');prepare(cards);
    if(!rewards.classList.contains('active')){reset(cards);return}
    var y=Math.max(0,rewards.scrollTop||0),cardPitch=74,fadeDistance=44;
    for(var i=0;i<cards.length;i++){
      var start=i*cardPitch,p=clamp((y-start)/fadeDistance,0,1);
      cards[i].style.setProperty('--rewards-card-progress',String(p));cards[i].setAttribute('data-rewards-hidden',p>.98?'1':'0');
    }
  }
  function queue(){if(ticking)return;ticking=true;requestAnimationFrame(apply)}
  async function loadWinners(force){
    var rewards=document.getElementById('rewards'),data=initData();if(!rewards||!data||loading)return;
    if(!force&&Date.now()-lastLoadedAt<5000)return;
    loading=true;
    try{
      var response=await fetch('/app/api/lottery/winners',{cache:'no-store',headers:{'accept':'application/json','x-telegram-init-data':data}});
      var payload=await response.json().catch(function(){return null});
      if(response.ok&&payload){render(payload.winners||[],!!payload.waitingForWinner);lastLoadedAt=Date.now()}
    }catch(e){}finally{loading=false}
  }
  function bind(){
    var rewards=document.getElementById('rewards');if(!rewards)return;
    if(!q('#lotteryRewardsWinnersList',rewards))return;
    var cards=rewards.querySelectorAll('.home-live-winner-card');reset(cards);
    if(rewards.dataset.winnersScrollBound!=='1'){
      rewards.dataset.winnersScrollBound='1';rewards.addEventListener('scroll',queue,{passive:true});window.addEventListener('resize',queue,{passive:true});
    }
    if(rewards.classList.contains('active'))loadWinners(true);queue();
    if(!pollStarted){pollStarted=true;setInterval(function(){var r=document.getElementById('rewards');if(r&&r.classList.contains('active'))loadWinners(false)},5000)}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
  document.addEventListener('click',function(ev){var target=ev.target&&ev.target.closest&&ev.target.closest('[data-view="rewards"]');if(target)setTimeout(function(){bind();loadWinners(true)},60)},true);
  window.addEventListener('vexa:section-mounted',bind);
})();
</script>`;
