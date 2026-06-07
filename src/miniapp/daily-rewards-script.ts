export const DAILY_REWARDS_SCRIPT = `
(function(){
  var tg=window.Telegram&&window.Telegram.WebApp;
  var tgUser=(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user)||{};
  var rewardsLoaded=false,rewardsLoading=false,rewardsData=null,claiming=false;
  var dayNames=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  var fallbackRewards=[
    {id:'day1-ton-starter',day:0,title:'TON Starter',shortTitle:'0.05 TON',description:'Guaranteed starter TON.',badge:'0.05 TON'},
    {id:'day2-loss-cashback',day:1,title:'Loss Cashback',shortTitle:'20% Cashback',description:'20% cashback on losses for 24h.',badge:'20%'},
    {id:'day3-ton-boost',day:2,title:'TON Boost',shortTitle:'0.30 TON',description:'Guaranteed TON boost.',badge:'0.30 TON'},
    {id:'day4-risk-free-x3',day:3,title:'Risk Free x3',shortTitle:'Risk-Free x3',description:'3 losing plays are refunded.',badge:'x3'},
    {id:'day5-free-slots',day:4,title:'Free Slots',shortTitle:'2 Free Slots',description:'Two free Slot plays.',badge:'x2'},
    {id:'day6-double-win',day:5,title:'Double Win Day',shortTitle:'2x Wins',description:'2x wins for 24h, max 1 TON / first 5 wins.',badge:'2x'},
    {id:'day7-weekly-mega-ton',day:6,title:'Weekly Mega TON',shortTitle:'2 TON Vault',description:'Claim all previous days to unlock.',badge:'2 TON'}
  ];
  function q(id){return document.getElementById(id)}
  function userId(){return String(tgUser.id||localStorage.getItem('ownerId')||'').trim()}
  function esc(v){return String(v||'').replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch})}
  function mondayIndex(date){var js=date.getDay();return js===0?6:js-1}
  function startOfWeek(date){var d=new Date(date);d.setHours(0,0,0,0);d.setDate(d.getDate()-mondayIndex(d));return d}
  function rewards(){return rewardsData&&Array.isArray(rewardsData.rewards)?rewardsData.rewards:fallbackRewards}
  function rewardForDay(day){var list=rewards();for(var i=0;i<list.length;i++)if(Number(list[i].day)===Number(day))return list[i];return fallbackRewards[day]}
  function claimedDays(){return new Set((rewardsData&&Array.isArray(rewardsData.claimedDays)?rewardsData.claimedDays:[]).map(function(v){return Number(v)}))}
  function claimableRewards(){return new Set((rewardsData&&Array.isArray(rewardsData.claimableRewards)?rewardsData.claimableRewards:[]).map(String))}
  function dayImageVersion(){return String(Math.floor(Date.now()/60000))}
  function toast(msg){try{if(tg&&tg.showPopup)tg.showPopup({message:String(msg||'')});else if(tg&&tg.showAlert)tg.showAlert(String(msg||''));else console.log(msg)}catch(e){console.log(msg)}}
  function statusFor(day,today,reward,claimed,missed){
    if(claimed.has(day))return {name:'claimed',label:'Claimed',line:'گرفته شد'};
    if(missed!==null&&day>=missed)return {name:'burned',label:'Wait next week',line:'صبر کن تا هفته بعد'};
    if(day<today)return {name:'burned',label:'Missed',line:'سوخت'};
    if(day===today)return {name:'today',label:'Claim now',line:reward&&reward.description||'Tap to claim'};
    return {name:'future',label:'Locked',line:'قفل تا روز خودش'};
  }
  function dayIconHtml(i,status,dateNumber){
    var src='/app/api/daily-rewards-day-image/'+i+'?v='+dayImageVersion();
    var lock=status.name==='future'||status.name==='burned'?'<i class="daily-rewards-lock" aria-hidden="true"></i>':'';
    return '<span class="daily-rewards-day-image '+esc(status.name)+'" data-fallback="'+dateNumber+'"><img class="daily-rewards-day-img" src="'+src+'" alt=""/>'+lock+'</span>';
  }
  function showDayImageFallback(img){var parent=img&&img.parentNode;if(parent&&parent.classList&&parent.classList.contains('daily-rewards-day-image')){var lock=parent.querySelector('.daily-rewards-lock')?'<i class="daily-rewards-lock" aria-hidden="true"></i>':'';parent.innerHTML='<b>'+esc(parent.getAttribute('data-fallback')||'')+'</b>'+lock}}
  function renderDays(){
    var wrap=q('dailyRewardsDays');if(!wrap)return;
    var start=startOfWeek(new Date()),today=Number(rewardsData&&rewardsData.today);if(!Number.isFinite(today))today=mondayIndex(new Date());
    var claimed=claimedDays(),missed=rewardsData&&rewardsData.missedDay!==null&&rewardsData.missedDay!==undefined?Number(rewardsData.missedDay):null;
    var status=q('dailyRewardsHomeStatus');if(status)status.textContent=missed!==null?'Wait until next week':'Week resets Monday';
    wrap.innerHTML=dayNames.map(function(name,i){
      var d=new Date(start);d.setDate(start.getDate()+i);
      var reward=rewardForDay(i),state=statusFor(i,today,reward,claimed,missed);
      var canClaim=state.name==='today'&&claimableRewards().has(String(reward&&reward.id));
      return '<button class="daily-rewards-day '+esc(state.name)+' '+(canClaim?'can-claim ':'')+'" type="button" data-daily-rewards-day="'+i+'" data-daily-reward-id="'+esc(reward&&reward.id)+'" '+(canClaim?'':'aria-disabled="true"')+' aria-label="'+esc('Daily reward '+(i+1)+', '+state.label)+'"><small>Day '+(i+1)+' · '+esc(name.slice(0,3))+'</small>'+dayIconHtml(i,state,d.getDate())+'<span>'+esc(reward&&reward.shortTitle||state.label)+'</span><em>'+esc(state.line)+'</em></button>'
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
    if(!target.classList.contains('can-claim')){if(target.classList.contains('burned'))toast('صبر کن تا هفته بعد');return}
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
  document.addEventListener('error',function(ev){var target=ev.target;if(target&&target.classList&&target.classList.contains('daily-rewards-day-img'))showDayImageFallback(target)},true);
  document.addEventListener('click',function(ev){var target=ev.target&&ev.target.closest?ev.target.closest('[data-daily-rewards-day]'):null;if(!target)return;claimCard(target)},true);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)refresh(true)});
  window.addEventListener('focus',function(){refresh(true)});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
  setTimeout(mount,80);setTimeout(mount,360);setTimeout(function(){refresh(true)},1500);
})();
`;
