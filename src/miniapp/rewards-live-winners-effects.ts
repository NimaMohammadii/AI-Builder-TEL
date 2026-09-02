export const REWARDS_LIVE_WINNERS_EFFECTS = `
<style id="vexa-rewards-live-winners-effects">
#home[data-home-variant="one"] .home-ticket-finance-visual.home-ticket-card>.home-live-activity{display:none!important}
#home[data-home-variant="one"] .home-ticket-finance-visual.home-ticket-card>.home-lottery-winners-live{width:100%!important;height:100%!important;min-height:0!important;display:grid!important;grid-template-rows:minmax(0,1fr)!important;gap:0!important;align-content:stretch!important;min-width:0!important}
#rewards>.rewards-live-winners{display:none!important}
</style>
<script id="vexa-rewards-live-winners-scroll-script">
(function(){
  var loading=false,lastRequestAt=0,phaseTimer=0,retryTimer=0,retryDelay=1000;
  function q(s,r){return (r||document).querySelector(s)}
  function homeOne(){var home=document.getElementById('home');return home&&home.getAttribute('data-home-variant')==='one'?home:null}
  function host(){var home=homeOne();return home?q('.home-ticket-finance-visual',home):null}
  function initData(){var tg=window.Telegram&&window.Telegram.WebApp;return String(tg&&tg.initData||'')}
  function gram(nano){var value=Math.max(0,Number(nano)||0)/1000000000;if(value>=1000)return value.toLocaleString('en-US',{maximumFractionDigits:1});if(value>=10)return value.toFixed(1).replace(/\\.0$/,'');return value.toFixed(2).replace(/0+$/,'').replace(/\\.$/,'')}
  function esc(v){return String(v==null?'':v).replace(/[&<>\"]/g,function(c){return c==='&'?'&amp;':c==='<'?'&lt;':c==='>'?'&gt;':'&quot;'})}
  function winnerMap(winners){var map={};(Array.isArray(winners)?winners:[]).forEach(function(item){var rank=Math.floor(Number(item&&item.rank)||0);if(rank>=1&&rank<=15)map[rank]=item});return map}
  function maskedName(item){var username=String(item&&item.username||'').replace(/^@+/,'').trim();if(!username)return esc(item&&item.displayName||'Player');if(username.length===1)return '@'+esc(username);if(username.length===2)return '@'+esc(username.charAt(0)+'*');if(username.length<=4)return '@'+esc(username.charAt(0)+'**'+username.charAt(username.length-1));return '@'+esc(username.slice(0,2)+'***'+username.slice(-2))}
  function row(rank,item,waiting){var rankText=String(rank).padStart(2,'0'),name,action,amount;if(waiting){name='Waiting for draw';action='Rank #'+rankText;amount='—'}else if(!item){name='No result this round';action='Rank #'+rankText;amount='—'}else{name=maskedName(item);action='Level '+Math.max(1,Math.floor(Number(item.level)||1));amount='+'+gram(item.prizeNano)+' GRAM'}return '<article class="home-live-activity-row"><div class="home-live-activity-copy"><div class="home-live-activity-name">'+name+'</div><div class="home-live-activity-action">'+esc(action)+'</div></div><div class="home-live-activity-time">'+esc(amount)+'</div></article>'}
  function updateFade(list){if(!list)return;var max=Math.max(0,list.scrollHeight-list.clientHeight),overflow=max>2;list.classList.toggle('has-overflow',overflow);list.classList.toggle('is-scrolled',overflow&&list.scrollTop>2);list.classList.toggle('is-at-bottom',overflow&&list.scrollTop>=max-2)}
  function ensureSurface(){var home=homeOne(),card=host();if(!home||!card)return null;card.removeAttribute('aria-hidden');card.classList.add('home-ticket-card');var original=q(':scope>.home-live-activity',card);if(!original){original=document.createElement('section');original.className='home-live-activity';original.setAttribute('aria-label','Recent activity');original.innerHTML='<div class="home-live-activity-list"></div>';card.appendChild(original)}var surface=q(':scope>.home-lottery-winners-live',card);if(!surface){surface=document.createElement('section');surface.className='home-lottery-winners-live';surface.setAttribute('aria-label','Lottery results');surface.innerHTML='<div class="home-live-activity-list home-lottery-winners-list"></div>';card.appendChild(surface)}var list=q('.home-lottery-winners-list',surface);if(list&&list.dataset.winnersScrollBound!=='1'){list.dataset.winnersScrollBound='1';list.addEventListener('scroll',function(){updateFade(list)},{passive:true})}return list}
  function render(winners,waiting){var list=ensureSurface();if(!list)return;var map=winnerMap(winners),html='';for(var rank=1;rank<=15;rank++)html+=row(rank,map[rank],!!waiting);list.innerHTML=html;requestAnimationFrame(function(){updateFade(list)})}
  function clearRetry(){if(retryTimer){clearTimeout(retryTimer);retryTimer=0}}
  function scheduleRetry(){var home=homeOne();if(retryTimer||!home||!home.classList.contains('active')||document.hidden)return;var delay=retryDelay;retryDelay=Math.min(15000,Math.round(retryDelay*1.8));retryTimer=setTimeout(function(){retryTimer=0;load(true)},delay)}
  function schedulePhaseRefresh(payload){if(phaseTimer){clearTimeout(phaseTimer);phaseTimer=0}var next=Number(payload&&payload.nextDisplayChangeAtMs),serverNow=Number(payload&&payload.serverNowMs);if(!Number.isFinite(next)||!Number.isFinite(serverNow)||next<=serverNow)return;phaseTimer=setTimeout(function(){phaseTimer=0;load(true)},Math.max(80,next-serverNow+80))}
  async function load(force){var home=homeOne(),list=ensureSurface(),data=initData();if(!home||!home.classList.contains('active')||!list||!data||loading)return false;var now=Date.now();if(!force&&now-lastRequestAt<500)return false;loading=true;lastRequestAt=now;try{var response=await fetch('/app/api/lottery/winners',{cache:'no-store',headers:{'accept':'application/json','x-telegram-init-data':data}});var payload=await response.json().catch(function(){return null});if(!response.ok||!payload)throw new Error('Could not load lottery results');clearRetry();retryDelay=1000;render(payload.winners||[],!!payload.waitingForWinner);schedulePhaseRefresh(payload);return true}catch(e){scheduleRetry();return false}finally{loading=false}}
  function bind(){var home=homeOne(),list=ensureSurface();if(!home||!list)return;updateFade(list);if(home.classList.contains('active'))load(false)}
  function refreshWhenVisible(){var home=homeOne();if(!document.hidden&&home&&home.classList.contains('active'))load(false)}
  document.addEventListener('click',function(ev){var target=ev.target&&ev.target.closest&&ev.target.closest('[data-view="home"]');if(target)setTimeout(bind,60)},true);
  window.addEventListener('vexa:section-mounted',bind);
  window.addEventListener('resize',function(){updateFade(ensureSurface())},{passive:true});
  window.addEventListener('focus',refreshWhenVisible);
  document.addEventListener('visibilitychange',refreshWhenVisible);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
</script>`;