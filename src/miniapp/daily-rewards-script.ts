export const DAILY_REWARDS_SCRIPT = `
(function(){
  var tg=window.Telegram&&window.Telegram.WebApp;
  var tgUser=(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user)||{};
  var backBound=false,backKeepTimer=0,rewardsLoaded=false,rewardsLoading=false,rewardsData=null,activeDay=0;
  var claimBusy={};
  var dayNames=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  var fallbackDays={days:dayNames.map(function(name,day){return{day:day,missions:[
    {id:'open_app',title:'Open the app',description:'Open Vexa today.',xp:40,type:'open_app'},
    {id:'play_predict_3',title:'Play 3 Predict rounds',description:'Complete three Predict rounds.',xp:90,type:'play_predict_rounds'},
    {id:'win_predict_1',title:'Win 1 Predict round',description:'Win one Predict round.',xp:120,type:'win_predict_rounds'},
    {id:'place_bets_5',title:'Place 5 bets',description:'Place five total bets today.',xp:100,type:'place_bets'},
    {id:'open_market',title:'Open Market',description:'Visit the Market section.',xp:35,type:'open_section'},
    {id:'daily_streak',title:'Keep daily streak',description:'Return today and keep your streak alive.',xp:70,type:'open_app'}
  ]}})};
  function q(id){return document.getElementById(id)}
  function userId(){return String(tgUser.id||localStorage.getItem('ownerId')||'').trim()}
  function esc(v){return String(v||'').replace(/[&<>]/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[ch]||ch})}
  function mondayIndex(date){var js=date.getDay();return js===0?6:js-1}
  function startOfWeek(date){var d=new Date(date);d.setHours(0,0,0,0);d.setDate(d.getDate()-mondayIndex(d));return d}
  function isOpen(){var p=q('dailyRewardsPage');return !!(p&&p.classList.contains('open'))}
  function key(day,missionId){return String(Number(day)||0)+':'+String(missionId||'')}
  function setFrom(name){return new Set((rewardsData&&Array.isArray(rewardsData[name])?rewardsData[name]:[]).map(String))}
  function showBack(){if(!tg||!tg.BackButton)return;try{tg.BackButton.show()}catch(e){}}
  function stopBack(){if(backKeepTimer){clearInterval(backKeepTimer);backKeepTimer=0}}
  function keepBack(){stopBack();showBack();[40,180,520].forEach(function(ms){setTimeout(function(){if(isOpen())showBack()},ms)});backKeepTimer=setInterval(function(){if(isOpen())showBack();else stopBack()},700)}
  function syncBack(open){if(!tg||!tg.BackButton)return;if(!backBound){backBound=true;try{tg.BackButton.onClick(function(){if(isOpen())close()})}catch(e){}}try{if(open)keepBack();else{stopBack();tg.BackButton.hide()}}catch(e){}}
  function clamp(){var p=q('dailyRewardsPage');if(!p)return;var max=Math.max(0,p.scrollHeight-p.clientHeight-1);if(p.scrollTop>max)p.scrollTop=max}
  function ensurePageOnBody(){var p=q('dailyRewardsPage');if(p&&p.parentNode!==document.body)document.body.appendChild(p);return p}
  function daysData(){return rewardsData&&Array.isArray(rewardsData.days)?rewardsData.days:fallbackDays.days}
  function missionList(day){var d=daysData().find(function(item){return Number(item.day)===Number(day)});return d&&Array.isArray(d.missions)?d.missions.slice(0,6):[]}
  function dayIconHtml(i,today,dateNumber){
    if(i<today)return '<strong class="daily-rewards-day-check" aria-label="Completed">✓</strong>';
    var src=i===today?'/app/api/daily-rewards-day-today-image.png?v=1':'/app/api/daily-rewards-day-future-image.png?v=1';
    return '<span class="daily-rewards-day-image" data-fallback="'+dateNumber+'"><img class="daily-rewards-day-img" src="'+src+'" alt=""/></span>';
  }
  function showDayImageFallback(img){var parent=img&&img.parentNode;if(parent&&parent.classList&&parent.classList.contains('daily-rewards-day-image'))parent.textContent=parent.getAttribute('data-fallback')||''}
  function renderDays(active){var wrap=q('dailyRewardsDays');if(!wrap)return;var start=startOfWeek(new Date()),today=mondayIndex(new Date());wrap.innerHTML=dayNames.map(function(name,i){var d=new Date(start);d.setDate(start.getDate()+i);return '<button class="daily-rewards-day '+(i===active?'active ':'')+(i<today?'past ':i===today?'today ':'future ')+'" type="button" data-daily-rewards-day="'+i+'"><small>'+name.slice(0,3)+'</small>'+dayIconHtml(i,today,d.getDate())+'<span>Day '+(i+1)+'</span></button>'}).join('')}
  function renderMissions(day){
    activeDay=Number(day)||0;
    var list=missionList(activeDay),claimed=setFrom('claimed'),claimable=setFrom('claimable');
    var title=q('dailyRewardsMissionTitle');if(title)title.textContent=(dayNames[activeDay]||'Today')+' missions';
    var count=q('dailyRewardsMissionCount');if(count)count.textContent=list.length+' missions';
    var box=q('dailyRewardsMissions');if(!box)return;
    box.innerHTML=list.map(function(m,i){
      var id=String(m.id||''),xp=Math.max(1,Math.floor(Number(m.xp)||0)),k=key(activeDay,id);
      var done=claimed.has(k),ready=claimable.has(k)&&!done&&!!id&&!!userId(),busy=claimBusy[k];
      var action=done?'<span class="daily-rewards-xp daily-rewards-claimed">Claimed</span>':ready?'<button class="daily-rewards-xp daily-rewards-claim" type="button" data-action="claim-daily-reward" data-day="'+activeDay+'" data-mission-id="'+esc(id)+'" '+(busy?'disabled':'')+'>'+(busy?'...':'Claim')+' <b>+'+xp+' XP</b></button>':'<span class="daily-rewards-xp daily-rewards-xp-static">+'+xp+' XP</span>';
      return '<div class="daily-rewards-mission '+(done?'claimed':ready?'ready':'')+'" data-mission-id="'+esc(id)+'" data-mission-type="'+esc(m.type||'')+'"><div class="daily-rewards-mission-icon">'+(done?'✓':(i+1))+'</div><div class="daily-rewards-mission-main"><strong>'+esc(m.title)+'</strong><span>'+esc(m.description)+'</span></div>'+action+'</div>'
    }).join('');
    setTimeout(clamp,80)
  }
  async function loadRewards(force){if((rewardsLoaded&&!force)||rewardsLoading)return rewardsData;rewardsLoading=true;try{var id=userId();var url='/app/api/daily-rewards'+(id?'?userId='+encodeURIComponent(id):'');var res=await fetch(url,{credentials:'same-origin',cache:'no-store'});var json=await res.json();if(!res.ok)throw new Error(json.error||'Could not load Daily Rewards');rewardsData=json;rewardsLoaded=true;return rewardsData}catch(e){rewardsData=rewardsData||fallbackDays;rewardsLoaded=true;return rewardsData}finally{rewardsLoading=false}}
  async function refresh(day,force){await loadRewards(!!force);renderDays(day);renderMissions(day)}
  async function claim(day,missionId){var id=userId();if(!id)return;var k=key(day,missionId);if(claimBusy[k])return;claimBusy[k]=true;renderMissions(activeDay);try{var res=await fetch('/app/api/daily-rewards/claim',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({userId:id,day:day,missionId:missionId})});var json=await res.json();if(!res.ok)throw new Error(json.error||'Could not claim');if(!rewardsData)rewardsData={days:[],claimed:[]};if(!Array.isArray(rewardsData.claimed))rewardsData.claimed=[];if(json.claimedKey&&rewardsData.claimed.indexOf(json.claimedKey)===-1)rewardsData.claimed.push(json.claimedKey);if(json.profile)rewardsData.profile=json.profile;try{window.dispatchEvent(new CustomEvent('vexa-xp-updated',{detail:{profile:json.profile,missionId:missionId,day:day,xp:json.xp}}))}catch(e){}await refresh(activeDay,true)}catch(e){var status=q('dailyRewardsMissionCount');if(status)status.textContent=e.message||'Claim failed'}finally{delete claimBusy[k];renderMissions(activeDay)}}
  function open(){var p=ensurePageOnBody();if(!p)return;var day=mondayIndex(new Date());activeDay=day;renderDays(day);renderMissions(day);refresh(day,true);document.body.classList.add('daily-rewards-open');p.classList.add('open');p.setAttribute('aria-hidden','false');syncBack(true);try{p.scrollTop=0}catch(e){}setTimeout(clamp,180)}
  function close(){var p=q('dailyRewardsPage');if(!p)return;document.body.classList.remove('daily-rewards-open');p.classList.remove('open');p.setAttribute('aria-hidden','true');syncBack(false)}
  function mount(){var old=q('dailyRewardsMount');if(old)return;var home=q('home');if(!home)return;var mount=document.createElement('div');mount.id='dailyRewardsMount';mount.innerHTML=window.DAILY_REWARDS_SECTION||'';var page=mount.querySelector('#dailyRewardsPage');if(page)document.body.appendChild(page);var finance=home.querySelector('.home-finance-split');if(finance&&finance.parentNode)finance.parentNode.insertBefore(mount,finance.nextSibling);else home.appendChild(mount);activeDay=mondayIndex(new Date());renderDays(activeDay);renderMissions(activeDay);loadRewards(true).then(function(){renderDays(activeDay);renderMissions(activeDay)})}
  document.addEventListener('error',function(ev){var target=ev.target;if(target&&target.classList&&target.classList.contains('daily-rewards-day-img'))showDayImageFallback(target)},true);
  document.addEventListener('click',function(ev){var target=ev.target&&ev.target.closest?ev.target.closest('[data-action], [data-daily-rewards-day]'):null;if(!target)return;var day=target.getAttribute('data-daily-rewards-day');if(day!==null){activeDay=Number(day);renderDays(activeDay);renderMissions(activeDay);return}var action=target.getAttribute('data-action');if(action==='open-daily-rewards'){open();return}if(action==='close-daily-rewards'){close();return}if(action==='claim-daily-reward'){ev.preventDefault();claim(Number(target.getAttribute('data-day')),target.getAttribute('data-mission-id'));return}},true);
  window.addEventListener('focus',function(){if(isOpen())keepBack()});
  document.addEventListener('visibilitychange',function(){if(!document.hidden&&isOpen()){keepBack();refresh(activeDay,true)}});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
`;
