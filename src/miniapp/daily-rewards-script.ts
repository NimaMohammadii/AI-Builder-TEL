export const DAILY_REWARDS_SCRIPT = `
(function(){
  var tg=window.Telegram&&window.Telegram.WebApp;
  var tgUser=(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user)||{};
  var rewardsLoaded=false,rewardsLoading=false,rewardsData=null,activeDay=0;
  var dayNames=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  var fallbackDays={days:dayNames.map(function(name,day){return{day:day,missions:[]}})};
  function q(id){return document.getElementById(id)}
  function userId(){return String(tgUser.id||localStorage.getItem('ownerId')||'').trim()}
  function esc(v){return String(v||'').replace(/[&<>]/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[ch]||ch})}
  function mondayIndex(date){var js=date.getDay();return js===0?6:js-1}
  function startOfWeek(date){var d=new Date(date);d.setHours(0,0,0,0);d.setDate(d.getDate()-mondayIndex(d));return d}
  function daysData(){return rewardsData&&Array.isArray(rewardsData.days)?rewardsData.days:fallbackDays.days}
  function missionList(day){var d=daysData().find(function(item){return Number(item.day)===Number(day)});return d&&Array.isArray(d.missions)?d.missions:[]}
  function setFrom(name){return new Set((rewardsData&&Array.isArray(rewardsData[name])?rewardsData[name]:[]).map(String))}
  function key(day,missionId){return String(Number(day)||0)+':'+String(missionId||'')}
  function dayImageVersion(){return String(Math.floor(Date.now()/60000))}
  function dayStatus(day,today){
    if(day<today)return 'Claimed';
    if(day===today)return 'Today';
    return 'Locked';
  }
  function daySummary(day,today){
    var list=missionList(day),claimed=setFrom('claimed'),done=0;
    list.forEach(function(m){if(claimed.has(key(day,m&&m.id)))done++});
    if(day<today)return 'Completed';
    if(day===today&&list.length)return done+' / '+list.length+' missions';
    if(day===today)return 'Ready now';
    return 'Day '+(day+1);
  }
  function dayIconHtml(i,today,dateNumber){
    var src='/app/api/daily-rewards-day-image/'+i+'?v='+dayImageVersion();
    var done=i<today?' completed':'';
    return '<span class="daily-rewards-day-image'+done+'" data-fallback="'+dateNumber+'"><img class="daily-rewards-day-img" src="'+src+'" alt=""/></span>';
  }
  function showDayImageFallback(img){var parent=img&&img.parentNode;if(parent&&parent.classList&&parent.classList.contains('daily-rewards-day-image'))parent.outerHTML='<strong>'+esc(parent.getAttribute('data-fallback')||'')+'</strong>'}
  function renderDays(active){
    var wrap=q('dailyRewardsDays');if(!wrap)return;
    var start=startOfWeek(new Date()),today=mondayIndex(new Date());
    var status=q('dailyRewardsHomeStatus');if(status)status.textContent=daySummary(today,today);
    wrap.innerHTML=dayNames.map(function(name,i){
      var d=new Date(start);d.setDate(start.getDate()+i);
      return '<button class="daily-rewards-day '+(i===active?'active ':'')+(i<today?'past ':i===today?'today ':'future ')+'" type="button" data-daily-rewards-day="'+i+'" aria-label="'+esc('Daily reward '+(i+1)+', '+dayStatus(i,today))+'"><small>'+esc(name.slice(0,3))+'</small>'+dayIconHtml(i,today,d.getDate())+'<span>'+esc(daySummary(i,today))+'</span></button>'
    }).join('')
  }
  async function loadRewards(force){
    if((rewardsLoaded&&!force)||rewardsLoading)return rewardsData;
    rewardsLoading=true;
    try{
      var id=userId();
      var url='/app/api/daily-rewards'+(id?'?userId='+encodeURIComponent(id):'');
      var res=await fetch(url,{credentials:'same-origin',cache:'no-store'});
      var json=await res.json();
      if(!res.ok)throw new Error(json.error||'Could not load Daily Rewards');
      rewardsData=json;rewardsLoaded=true;return rewardsData;
    }catch(e){rewardsData=rewardsData||fallbackDays;rewardsLoaded=true;return rewardsData}
    finally{rewardsLoading=false}
  }
  function removeLegacyRewards(){
    document.body.classList.remove('daily-rewards-open','rewards-open');
    document.querySelectorAll('#dailyRewardsEntry,#dailyRewardsPage,#rewardsPage,#home .home-daily-rewards-entry,#home .home-rewards-entry,#home [data-action="open-daily-rewards"],#home [data-action="open-rewards"]').forEach(function(n){try{n.remove()}catch(e){}});
  }
  function ensureMount(){
    var home=q('home');if(!home)return null;
    removeLegacyRewards();
    document.querySelectorAll('#homeBlankCardsWrap').forEach(function(n){try{n.remove()}catch(e){}});
    var mount=q('dailyRewardsMount');
    if(!mount){
      var holder=document.createElement('div');
      holder.innerHTML=window.DAILY_REWARDS_SECTION||'';
      mount=holder.firstElementChild;
      if(!mount)return null;
    }
    var finance=home.querySelector('.home-finance-split')||home.querySelector('.home-finance');
    var deposit=q('depositSheet');
    if(finance&&finance.parentNode){if(mount.parentNode!==finance.parentNode||mount.previousElementSibling!==finance)finance.parentNode.insertBefore(mount,finance.nextSibling)}
    else if(deposit&&deposit.parentNode){if(mount.parentNode!==deposit.parentNode||mount.nextElementSibling!==deposit)deposit.parentNode.insertBefore(mount,deposit)}
    else if(mount.parentNode!==home)home.appendChild(mount);
    return mount;
  }
  function refresh(force){activeDay=mondayIndex(new Date());renderDays(activeDay);loadRewards(!!force).then(function(){renderDays(activeDay)})}
  function mount(){if(!ensureMount())return;refresh(true)}
  document.addEventListener('error',function(ev){var target=ev.target;if(target&&target.classList&&target.classList.contains('daily-rewards-day-img'))showDayImageFallback(target)},true);
  document.addEventListener('click',function(ev){var target=ev.target&&ev.target.closest?ev.target.closest('[data-daily-rewards-day]'):null;if(!target)return;activeDay=Number(target.getAttribute('data-daily-rewards-day'))||0;renderDays(activeDay)},true);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)refresh(true)});
  window.addEventListener('focus',function(){refresh(true)});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
  setTimeout(mount,80);setTimeout(mount,360);setTimeout(function(){refresh(true)},1500);
})();
`;
