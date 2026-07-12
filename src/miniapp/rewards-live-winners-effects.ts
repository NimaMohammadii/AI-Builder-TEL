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
  transform:translate3d(0,calc(var(--rewards-card-progress) * -26px),0) scale(calc(1 - var(--rewards-card-progress) * .06))!important;
  filter:blur(calc(var(--rewards-card-progress) * 6px))!important;
  transform-origin:50% 0!important;
  will-change:transform,opacity,filter!important;
  transition:opacity .14s linear,transform .14s linear,filter .14s linear!important;
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
  function apply(){
    ticking=false;
    var rewards=document.getElementById('rewards');
    if(!rewards)return;
    var cards=rewards.querySelectorAll('.home-live-winner-card');
    var rewardsTop=rewards.getBoundingClientRect().top;
    var fadeStart=rewardsTop+18;
    var fadeDistance=58;
    for(var i=0;i<cards.length;i++){
      var cardTop=cards[i].getBoundingClientRect().top;
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