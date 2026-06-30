export const DAILY_REWARDS_SCRIPT = `
(function(){
  var rewardsLoaded=false,rewardsLoading=false,rewardsData=null,claiming=false;
  var rewardImageObjectUrls={};
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
  function currentTgUser(){var tg=window.Telegram&&window.Telegram.WebApp;return (tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user)||{}}
  function userId(){var u=currentTgUser();return String((u&&u.id)||localStorage.getItem('ownerId')||'').trim()}
  function esc(v){return String(v||'').replace(/[&<>\"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[ch]||ch})}
  function germanDateParts(date){try{var parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit',weekday:'short'}).formatToParts(date);var out={year:'',month:'',day:'',weekday:''};parts.forEach(function(p){if(p.type in out)out[p.type]=p.value});return out}catch(e){var d=new Date(date.getTime()+60*60*1000);return {year:String(d.getUTCFullYear()),month:String(d.getUTCMonth()+1).padStart(2,'0'),day:String(d.getUTCDate()).padStart(2,'0'),weekday:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getUTCDay()]}}
  }
  function mondayIndex(date){var w=germanDateParts(date).weekday;return ({Mon:0,Tue:1,Wed:2,Thu:3,Fri:4,Sat:5,Sun:6})[w]??0}
  function rewards(){return rewardsData&&Array.isArray(rewardsData.rewards)?rewardsData.rewards:fallbackRewards}
  function rewardForDay(day){var list=rewards();for(var i=0;i<list.length;i++)if(Number(list[i].day)===Number(day))return list[i];return fallbackRewards[day]}
  function claimedDays(){return new Set((rewardsData&&Array.isArray(rewardsData.claimedDays)?rewardsData.claimedDays:[]).map(function(v){return Number(v)}))}
  function claimableRewards(){return new Set((rewardsData&&Array.isArray(rewardsData.claimableRewards)?rewardsData.claimableRewards:[]).map(String))}
  function toast(msg){try{var tg=window.Telegram&&window.Telegram.WebApp;if(tg&&tg.showPopup)tg.showPopup({message:String(msg||'')});else if(tg&&tg.showAlert)tg.showAlert(String(msg||''));else console.log(msg)}catch(e){console.log(msg)}}
  function statusFor(day,today,claimed,missed,startDay){
    if(claimed.has(day))return 'claimed';
    if(day<Number(startDay||0))return 'locked';
    if(missed!==null&&day>=missed)return 'locked';
    if(day<today)return 'locked';
    if(day===today)return 'today';
    return 'locked';
  }
  function imageUrl(day){return '/app/api/daily-rewards-day-image/'+day}
  async function imageVersion(day){
    try{var res=await fetch('/app/api/daily-rewards-day-image-version/'+day,{credentials:'same-origin',cache:'no-store'});var json=await res.json().catch(function(){return null});return String((json&&json.version)||'missing')}catch(e){return 'fallback'}
  }
  async function cachedImageSrc(day){
    var version=await imageVersion(day);
    var versionedUrl=imageUrl(day)+'?v='+encodeURIComponent(version);
    var cacheKey=String(day)+':'+version;
    if(rewardImageObjectUrls[cacheKey])return rewardImageObjectUrls[cacheKey];
    if(!('caches' in window)||!window.URL||!URL.createObjectURL)return versionedUrl;
    try{
      var cache=await caches.open('vexa-daily-reward-images-v2');
      var req=new Request(versionedUrl,{credentials:'same-origin'});
      var cached=await cache.match(req);
      if(cached){var cachedBlob=await cached.blob();rewardImageObjectUrls[cacheKey]=URL.createObjectURL(cachedBlob);return rewardImageObjectUrls[cacheKey]}
      var res=await fetch(req,{cache:'force-cache'});
      if(res&&res.ok){await cache.put(req,res.clone());var blob=await res.blob();rewardImageObjectUrls[cacheKey]=URL.createObjectURL(blob);return rewardImageObjectUrls[cacheKey]}
    }catch(e){}
    return versionedUrl;
  }
  function imageHtml(src){
    return '<span class="daily-rewards-banner-frame"><img class="daily-rewards-banner-img" src="'+esc(src)+'" alt="" decoding="async"/></span>';
  }
  async function renderDays(){
    var wrap=q('dailyRewardsDays');if(!wrap)return;
    var today=Number(rewardsData&&rewardsData.today);if(!Number.isFinite(today))today=mondayIndex(new Date());
    var trusted=!!(rewardsData&&rewardsData.trustedAccess);
    var startDay=Number(rewardsData&&rewardsData.visitStartDay);if(!Number.isFinite(startDay))startDay=0;
    var claimed=claimedDays(),missed=trusted?null:(rewardsData&&rewardsData.missedDay!==null&&rewardsData.missedDay!==undefined?Number(rewardsData.missedDay):null);
    var reward=rewardForDay(today),state=trusted&&!claimed.has(today)?'today':statusFor(today,today,claimed,missed,startDay);
    var canClaim=claimableRewards().has(String(reward&&reward.id));
    if(!canClaim){wrap.innerHTML='';return}
    var src=await cachedImageSrc(today);
    wrap.innerHTML='<button class="daily-rewards-drop-banner '+esc(state)+' can-claim" type="button" data-daily-rewards-day="'+today+'" data-daily-reward-id="'+esc(reward&&reward.id)+'" data-daily-reward-state="'+esc(state)+'" aria-label="'+esc((reward&&reward.title)||('Daily reward '+(today+1)))+'">'+imageHtml(src)+'</button>'
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
    if(!target.classList.contains('can-claim')){var state=target.getAttribute('data-daily-reward-state')||'';if(state==='claimed')toast('Reward already claimed');else toast('This reward is locked');return}
    var id=userId();if(!id){toast('Telegram user not found');return}
    claiming=true;target.classList.add('claiming');
    try{var res=await fetch('/app/api/daily-rewards/claim',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({userId:id,day:day,rewardId:rewardId})});var json=await res.json().catch(function(){return null});if(!res.ok)throw new Error(json&&json.error?json.error:'Could not claim reward');if(json&&json.tonBalanceNano!==null&&json.tonBalanceNano!==undefined&&Number.isFinite(Number(json.tonBalanceNano))&&window.VexaTonBalance&&window.VexaTonBalance.write)window.VexaTonBalance.write(Number(json.tonBalanceNano),0,false);target.classList.remove('claiming','can-claim');target.classList.add('claimed','collecting');setTimeout(function(){try{target.remove()}catch(e){}},560)}
    catch(e){toast(e&&e.message?e.message:'Could not claim reward')}
    finally{claiming=false;target.classList.remove('claiming')}
  }
  function removeLegacyRewards(){document.body.classList.remove('daily-rewards-open','rewards-open');document.querySelectorAll('#dailyRewardsEntry,#dailyRewardsPage,#rewardsPage,#home .home-daily-rewards-entry,#home .home-rewards-entry,#home [data-action="open-daily-rewards"],#home [data-action="open-rewards"]').forEach(function(n){try{n.remove()}catch(e){}})}
  function ensureMount(){var home=q('home');if(!home)return null;removeLegacyRewards();document.querySelectorAll('#homeBlankCardsWrap').forEach(function(n){try{n.remove()}catch(e){}});var mount=q('dailyRewardsMount');if(!mount){var holder=document.createElement('div');holder.innerHTML=window.DAILY_REWARDS_SECTION||'';mount=holder.firstElementChild;if(!mount)return null}if(mount.parentNode!==home)home.appendChild(mount);return mount}
  function mount(){if(!ensureMount())return;loadRewards(true).then(function(){return renderDays()})}
  document.addEventListener('click',function(ev){var target=ev.target&&ev.target.closest?ev.target.closest('[data-daily-rewards-day]'):null;if(!target)return;claimCard(target)},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
`;