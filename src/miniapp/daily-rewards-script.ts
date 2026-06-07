export const DAILY_REWARDS_SCRIPT = `
(function(){
  var tg=window.Telegram&&window.Telegram.WebApp;
  var tgUser=(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user)||{};
  var rewardsLoaded=false,rewardsLoading=false,rewardsData=null,claiming=false;
  var fallbackRewards=[
    {id:'day1-ton-starter',day:0,title:'TON Starter'},
    {id:'day2-loss-cashback',day:1,title:'Loss Cashback'},
    {id:'day3-ton-boost',day:2,title:'TON Boost'},
    {id:'day4-risk-free-x3',day:3,title:'Risk Free x3'},
    {id:'day5-free-slots',day:4,title:'Free Slots'},
    {id:'day6-double-win',day:5,title:'Double Win Day'},
    {id:'day7-weekly-mega-ton',day:6,title:'Weekly Mega TON'}
  ];
  function q(id){return document.getElementById(id)}
  function userId(){return String(tgUser.id||localStorage.getItem('ownerId')||'').trim()}
  function esc(v){return String(v||'').replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch})}
  function mondayIndex(date){var js=date.getDay();return js===0?6:js-1}
  function rewards(){return rewardsData&&Array.isArray(rewardsData.rewards)?rewardsData.rewards:fallbackRewards}
  function rewardForDay(day){var list=rewards();for(var i=0;i<list.length;i++)if(Number(list[i].day)===Number(day))return list[i];return fallbackRewards[day]}
  function claimedDays(){return new Set((rewardsData&&Array.isArray(rewardsData.claimedDays)?rewardsData.claimedDays:[]).map(function(v){return Number(v)}))}
  function claimableRewards(){return new Set((rewardsData&&Array.isArray(rewardsData.claimableRewards)?rewardsData.claimableRewards:[]).map(String))}
  function dayImageVersion(){return String(Math.floor(Date.now()/60000))}
  function toast(msg){try{if(tg&&tg.showPopup)tg.showPopup({message:String(msg||'')});else if(tg&&tg.showAlert)tg.showAlert(String(msg||''));else console.log(msg)}catch(e){console.log(msg)}}
  function statusFor(day,today,claimed,missed){
    if(claimed.has(day))return 'claimed';
    if(missed!==null&&day>=missed)return 'locked';
    if(day<today)return 'locked';
    if(day===today)return 'today';
    return 'locked';
  }
  function imageHtml(day){
    var src='/app/api/daily-rewards-day-image/'+day+'.png?v='+dayImageVersion();
    return '<img class="daily-rewards-card-img" src="'+src+'" alt="" decoding="async" loading="lazy"/>';
  }
  function renderDays(){
    var wrap=q('dailyRewardsDays');if(!wrap)return;
    var today=Number(rewardsData&&rewardsData.today);if(!Number.isFinite(today))today=mondayIndex(new Date());
    var claimed=claimedDays(),missed=rewardsData&&rewardsData.missedDay!==null&&rewardsData.missedDay!==undefined?Number(rewardsData.missedDay):null;
    wrap.innerHTML=[0,1,2,3,4,5,6].map(function(i){
      var reward=rewardForDay(i),state=statusFor(i,today,claimed,missed);
      var canClaim=state==='today'&&claimableRewards().has(String(reward&&reward.id));
      return '<button class="daily-rewards-day '+esc(state)+' '+(canClaim?'can-claim ':'')+'" type="button" data-daily-rewards-day="'+i+'" data-daily-reward-id="'+esc(reward&&reward.id)+'" '+(canClaim?'':'aria-disabled="true"')+' aria-label="'+esc((reward&&reward.title)||('Daily reward '+(i+1)))+'">'+imageHtml(i)+'</button>';
    }).join('')
  }
  async function loadRewards(force){
    if((rewardsLoaded&&!force)||rewardsLoading)return rewardsData;
    rewardsLoading=true;
    try{var id=userId();var url='/app/api/daily-rewards'+(id?'?userId='+encodeURIComponent(id):'');var res=await fetch(url,{credentials:'same-origin',cache:'no-store'});var json=await res.json();if(!res.ok)throw new Error(json.error||'Could not load Daily Rewards');rewardsData=json;rewardsLoaded=true;return rewardsData}
    catch(e){rewardsData=rewardsData||{rewards:fallbackRewards,claimedDays:[],claimableRewards:[]};rewardsLoaded=true;return rewardsData}
    finally{rewardsLoading=false}
  }
  async function claimCard(target){
    if(claiming)return;
    var day=Number(target.getAttribute('data-daily-rewards-day'))||0,rewardId=target.getAttribute('data-daily-reward-id')||'';
    if(!target.classList.contains('can-claim')){if(target.classList.contains('locked'))toast('Wait until next week');return}
    var id=userId();if(!id){toast('Telegram user not found');return}
    claiming=true;target.classList.add('claiming');
    try{var res=await fetch('/app/api/daily-rewards/claim',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({userId:id,day:day,rewardId:rewardId})});var json=await res.json().catch(function(){return null});if(!res.ok)throw new Error(json&&json.error?json.error:'Could not claim reward');if(json&&Number.isFinite(Number(json.tonBalanceNano))&&window.VexaTonBalance&&window.VexaTonBalance.write)window.VexaTonBalance.write(Number(json.tonBalanceNano),0,false);toast('Reward claimed');await loadRewards(true);renderDays()}
    catch(e){toast(e&&e.message?e.message:'Could not claim reward')}
    finally{claiming=false;target.classList.remove('claiming')}
  }
  function removeLegacyRewards(){document.body.classList.remove('daily-rewards-open','rewards-open');document.querySelectorAll('#dailyRewardsEntry,#dailyRewardsPage,#rewardsPage,#home .home-daily-rewards-entry,#home .home-rewards-entry,#home [data-action="open-daily-rewards"],#home [data-action="open-rewards"]').forEach(function(n){try{n.remove()}catch(e){}})}
  function ensureMount(){var home=q('home');if(!home)return null;removeLegacyRewards();document.querySelectorAll('#homeBlankCardsWrap').forEach(function(n){try{n.remove()}catch(e){}});var mount=q('dailyRewardsMount');if(!mount){var holder=document.createElement('div');holder.innerHTML=window.DAILY_REWARDS_SECTION||'';mount=holder.firstElementChild;if(!mount)return null}var finance=home.querySelector('.home-finance-split')||home.querySelector('.home-finance');var deposit=q('depositSheet');if(finance&&finance.parentNode){if(mount.parentNode!==finance.parentNode||mount.previousElementSibling!==finance)finance.parentNode.insertBefore(mount,finance.nextSibling)}else if(deposit&&deposit.parentNode){if(mount.parentNode!==deposit.parentNode||mount.nextElementSibling!==deposit)deposit.parentNode.insertBefore(mount,deposit)}else if(mount.parentNode!==home)home.appendChild(mount);return mount}
  function refresh(force){renderDays();loadRewards(!!force).then(renderDays)}
  function mount(){if(!ensureMount())return;refresh(true)}
  document.addEventListener('error',function(ev){var target=ev.target;if(target&&target.classList&&target.classList.contains('daily-rewards-card-img'))target.style.display='none'},true);
  document.addEventListener('click',function(ev){var target=ev.target&&ev.target.closest?ev.target.closest('[data-daily-rewards-day]'):null;if(!target)return;claimCard(target)},true);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)refresh(true)});
  window.addEventListener('focus',function(){refresh(true)});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
  setTimeout(mount,80);setTimeout(mount,360);setTimeout(function(){refresh(true)},1500);
})();
`;