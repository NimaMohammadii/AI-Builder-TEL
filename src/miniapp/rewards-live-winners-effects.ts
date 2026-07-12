export const REWARDS_LIVE_WINNERS_EFFECTS = `
<style id="vexa-rewards-live-winners-effects">
#rewards .rewards-live-winners{
  margin-top:clamp(175px,31dvh,340px)!important;
  padding:0 10px 30px!important;
  position:relative!important;
}
#rewards .home-live-winner-card{
  --rewards-card-progress:0;
  opacity:calc(1 - var(--rewards-card-progress))!important;
  transform:translate3d(0,calc(var(--rewards-card-progress) * -18px),0) scale(calc(1 - var(--rewards-card-progress) * .035))!important;
  filter:blur(calc(var(--rewards-card-progress) * 4px))!important;
  transform-origin:50% 0!important;
  will-change:transform,opacity,filter!important;
  transition:opacity .1s linear,transform .1s linear,filter .1s linear!important;
  pointer-events:auto;
}
#rewards .home-live-winner-card[data-rewards-hidden="1"]{pointer-events:none!important}
@media(max-width:380px){#rewards .rewards-live-winners{margin-top:clamp(160px,29dvh,300px)!important}}
@media(prefers-reduced-motion:reduce){#rewards .home-live-winner-card{filter:none!important;transition:none!important}}
</style>
<script id="vexa-rewards-live-winners-scroll-script">
(function(){
  var ticking=false;
  function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
  function naturalTop(card,rewards,rewardsTop){
    var top=0;
    var node=card;
    while(node&&node!==rewards){top+=node.offsetTop||0;node=node.offsetParent}
    return rewardsTop+top-(rewards.scrollTop||0);
  }
  function apply(){
    ticking=false;
    var rewards=document.getElementById('rewards');
    if(!rewards)return;
    var cards=rewards.querySelectorAll('.home-live-winner-card');
    var rewardsTop=rewards.getBoundingClientRect().top;
    var fadeDistance=58;
    var fadeStart=rewardsTop+fadeDistance;
    for(var i=0;i<cards.length;i++){
      var cardTop=naturalTop(cards[i],rewards,rewardsTop);
      var p=clamp((fadeStart-cardTop)/fadeDistance,0,1);
      cards[i].style.setProperty('--rewards-card-progress',String(p));
      cards[i].setAttribute('data-rewards-hidden',p>.98?'1':'0');
    }
  }
  function queue(){if(ticking)return;ticking=true;requestAnimationFrame(apply)}
  function bind(){
    var rewards=document.getElementById('rewards');
    if(!rewards||rewards.dataset.winnersScrollBound==='1')return;
    rewards.dataset.winnersScrollBound='1';
    rewards.addEventListener('scroll',queue,{passive:true});
    window.addEventListener('resize',queue,{passive:true});
    apply();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
  document.addEventListener('click',function(){setTimeout(bind,40)},true);
  window.addEventListener('vexa:section-mounted',bind);
})();
</script>`;