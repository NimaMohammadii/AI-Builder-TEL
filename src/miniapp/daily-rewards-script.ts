export const DAILY_REWARDS_SCRIPT = `
(function(){
  var tg=window.Telegram&&window.Telegram.WebApp;
  var backBound=false;
  var backKeepTimer=0;
  var rewardsLoaded=false;
  var rewardsLoading=false;
  var rewardsData=null;
  var activeDay=0;
  var dayNames=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  var fallbackMissions={
    Monday:[{title:'Play 3 Predict rounds',description:'Start the week with activity',xp:90},{title:'Win 1 Predict round',description:'Get one correct prediction',xp:120},{title:'Place 5 total bets',description:'Stay active in Play Zone',xp:100},{title:'Open the app today',description:'Keep your daily streak alive',xp:40},{title:'Check your rank',description:'View your current level progress',xp:35},{title:'Deposit TON',description:'Charge balance for more games',xp:250}],
    Tuesday:[{title:'Play 4 Predict rounds',description:'Build your weekly XP',xp:110},{title:'Win 2 rounds',description:'Score two wins today',xp:160},{title:'Use both Up and Down',description:'Try both directions in Predict',xp:80},{title:'Open Market',description:'Check available items',xp:35},{title:'Keep streak active',description:'Come back without missing a day',xp:70},{title:'Invite a friend',description:'Bring one player to Vexa',xp:220}],
    Wednesday:[{title:'Play 5 rounds',description:'Midweek XP boost',xp:130},{title:'Win 2 Predict rounds',description:'Stay sharp',xp:160},{title:'Bet 20 TON total',description:'Reach today volume goal',xp:180},{title:'Open Play Zone',description:'Check all games',xp:40},{title:'Reach next XP step',description:'Progress toward level up',xp:90},{title:'Daily login',description:'Claim activity credit',xp:40}],
    Thursday:[{title:'Play 3 rounds',description:'Keep weekly momentum',xp:90},{title:'Win 1 round',description:'One clean win today',xp:120},{title:'Try a new game',description:'Open another Play Zone game',xp:80},{title:'Check Top Players',description:'See weekly competition',xp:45},{title:'Keep streak active',description:'Do not miss today',xp:70},{title:'Deposit TON',description:'Add more play balance',xp:250}],
    Friday:[{title:'Play 6 rounds',description:'Push before weekend',xp:150},{title:'Win 3 rounds',description:'High performance bonus',xp:220},{title:'Place 8 bets',description:'Stay active',xp:150},{title:'Open Market',description:'Check drops and NFTs',xp:35},{title:'Invite a friend',description:'Grow the competition',xp:220},{title:'Daily login',description:'Claim activity credit',xp:40}],
    Saturday:[{title:'Play 5 rounds',description:'Weekend activity',xp:130},{title:'Win 2 rounds',description:'Keep your win rate up',xp:160},{title:'Bet 30 TON total',description:'Weekend volume mission',xp:240},{title:'Open Play Zone',description:'Explore games',xp:40},{title:'Keep streak active',description:'Weekend streak bonus',xp:90},{title:'Check level progress',description:'See XP to next level',xp:45}],
    Sunday:[{title:'Play 7 rounds',description:'Final weekly push',xp:180},{title:'Win 3 rounds',description:'Finish strong',xp:220},{title:'Place 10 bets',description:'Last day activity goal',xp:190},{title:'Check Top Players',description:'See your final weekly place',xp:60},{title:'Keep streak active',description:'Complete the week',xp:140},{title:'Daily login',description:'Final day login reward',xp:50}]
  };
  function q(id){return document.getElementById(id)}
  function esc(value){return String(value||'').replace(/[&<>]/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[ch]||ch})}
  function mondayIndex(date){var js=date.getDay();return js===0?6:js-1}
  function startOfWeek(date){var d=new Date(date);d.setHours(0,0,0,0);d.setDate(d.getDate()-mondayIndex(d));return d}
  function isOpen(){var p=q('dailyRewardsPage');return !!(p&&p.classList.contains('open'))}
  function showBack(){if(!tg||!tg.BackButton)return;try{tg.BackButton.show()}catch(e){}}
  function stopKeepBack(){if(backKeepTimer){clearInterval(backKeepTimer);backKeepTimer=0}}
  function startKeepBack(){stopKeepBack();showBack();setTimeout(function(){if(isOpen())showBack()},40);setTimeout(function(){if(isOpen())showBack()},180);setTimeout(function(){if(isOpen())showBack()},520);backKeepTimer=setInterval(function(){if(isOpen())showBack();else stopKeepBack()},700)}
  function syncBack(open){if(!tg||!tg.BackButton)return;if(!backBound){backBound=true;try{tg.BackButton.onClick(function(){if(isOpen())close()})}catch(e){}}try{if(open)startKeepBack();else{stopKeepBack();tg.BackButton.hide()}}catch(e){}}
  function clampBottomScroll(){var p=q('dailyRewardsPage');if(!p)return;var max=Math.max(0,p.scrollHeight-p.clientHeight-1);if(p.scrollTop>max)p.scrollTop=max}
  function ensurePageOnBody(){var p=q('dailyRewardsPage');if(p&&p.parentNode!==document.body)document.body.appendChild(p);return p}
  function missionList(index){
    if(rewardsData&&Array.isArray(rewardsData.days)){
      var day=rewardsData.days.find(function(item){return Number(item.day)===Number(index)});
      if(day&&Array.isArray(day.missions)&&day.missions.length)return day.missions.slice(0,6).map(function(m){return{title:m.title,description:m.description,xp:m.xp,id:m.id,type:m.type}});
    }
    var name=dayNames[index]||dayNames[0];
    return (fallbackMissions[name]||fallbackMissions.Monday).slice(0,6);
  }
  function renderDays(active){var wrap=q('dailyRewardsDays');if(!wrap)return;var start=startOfWeek(new Date());wrap.innerHTML=dayNames.map(function(name,i){var d=new Date(start);d.setDate(start.getDate()+i);return '<button class="daily-rewards-day '+(i===active?'active':'')+'" type="button" data-daily-rewards-day="'+i+'"><small>'+name.slice(0,3)+'</small><strong>'+d.getDate()+'</strong><span>Day '+(i+1)+'</span></button>'}).join('')}
  function renderMissions(index){activeDay=Number(index)||0;var name=dayNames[activeDay]||dayNames[0];var list=missionList(activeDay);var title=q('dailyRewardsMissionTitle');if(title)title.textContent=name+' missions';var count=q('dailyRewardsMissionCount');if(count)count.textContent=list.length+' missions';var box=q('dailyRewardsMissions');if(!box)return;box.innerHTML=list.map(function(m,i){var xp=Math.max(1,Math.floor(Number(m.xp)||0));return '<div class="daily-rewards-mission" data-mission-id="'+esc(m.id||'')+'" data-mission-type="'+esc(m.type||'')+'"><div class="daily-rewards-mission-icon">'+(i+1)+'</div><div class="daily-rewards-mission-main"><strong>'+esc(m.title)+'</strong><span>'+esc(m.description)+'</span></div><div class="daily-rewards-xp">+'+xp+' XP</div></div>'}).join('');setTimeout(clampBottomScroll,80)}
  async function loadRewards(){
    if(rewardsLoaded||rewardsLoading)return rewardsData;
    rewardsLoading=true;
    try{
      var res=await fetch('/app/api/daily-rewards',{credentials:'same-origin',cache:'no-store'});
      var json=await res.json();
      if(!res.ok)throw new Error(json.error||'Could not load Daily Rewards');
      rewardsData=json;
      rewardsLoaded=true;
      return rewardsData;
    }catch(error){rewardsLoaded=true;return null}
    finally{rewardsLoading=false}
  }
  async function refreshAndRender(day){await loadRewards();renderDays(day);renderMissions(day)}
  function open(){var p=ensurePageOnBody();if(!p)return;var active=mondayIndex(new Date());activeDay=active;renderDays(active);renderMissions(active);refreshAndRender(active);document.body.classList.add('daily-rewards-open');p.classList.add('open');p.setAttribute('aria-hidden','false');syncBack(true);try{p.scrollTop=0}catch(e){}setTimeout(clampBottomScroll,180)}
  function close(){var p=q('dailyRewardsPage');if(!p)return;document.body.classList.remove('daily-rewards-open');p.classList.remove('open');p.setAttribute('aria-hidden','true');syncBack(false)}
  function mount(){var old=document.getElementById('dailyRewardsMount');if(old)return;var home=document.getElementById('home');if(!home)return;var mount=document.createElement('div');mount.id='dailyRewardsMount';mount.innerHTML=window.DAILY_REWARDS_SECTION||'';var page=mount.querySelector('#dailyRewardsPage');if(page)document.body.appendChild(page);var finance=home.querySelector('.home-finance-split');if(finance&&finance.parentNode)finance.parentNode.insertBefore(mount,finance.nextSibling);else home.appendChild(mount);activeDay=mondayIndex(new Date());renderDays(activeDay);renderMissions(activeDay);loadRewards().then(function(){renderDays(activeDay);renderMissions(activeDay)})}
  document.addEventListener('click',function(ev){var target=ev.target&&ev.target.closest?ev.target.closest('[data-action], [data-daily-rewards-day]'):null;if(!target)return;var day=target.getAttribute('data-daily-rewards-day');if(day!==null){activeDay=Number(day);renderDays(activeDay);renderMissions(activeDay);return}var action=target.getAttribute('data-action');if(action==='open-daily-rewards'){open();return}if(action==='close-daily-rewards'){close();return}},true);
  window.addEventListener('focus',function(){if(isOpen())startKeepBack()});
  document.addEventListener('visibilitychange',function(){if(!document.hidden&&isOpen())startKeepBack()});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
`;