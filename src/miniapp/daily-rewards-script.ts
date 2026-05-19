export const DAILY_REWARDS_SCRIPT = `
(function(){
  var dayNames=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  var missions={
    Monday:[['Play 3 Predict rounds','Start the week with activity','+90 XP'],['Win 1 Predict round','Get one correct prediction','+120 XP'],['Place 5 total bets','Stay active in Play Zone','+100 XP'],['Open the app today','Keep your daily streak alive','+40 XP'],['Check your rank','View your current level progress','+35 XP'],['Deposit TON','Charge balance for more games','+250 XP']],
    Tuesday:[['Play 4 Predict rounds','Build your weekly XP','+110 XP'],['Win 2 rounds','Score two wins today','+160 XP'],['Use both Up and Down','Try both directions in Predict','+80 XP'],['Open Market','Check available items','+35 XP'],['Keep streak active','Come back without missing a day','+70 XP'],['Invite a friend','Bring one player to Vexa','+220 XP']],
    Wednesday:[['Play 5 rounds','Midweek XP boost','+130 XP'],['Win 2 Predict rounds','Stay sharp','+160 XP'],['Bet 20 TON total','Reach today volume goal','+180 XP'],['Open Play Zone','Check all games','+40 XP'],['Reach next XP step','Progress toward level up','+90 XP'],['Daily login','Claim activity credit','+40 XP']],
    Thursday:[['Play 3 rounds','Keep weekly momentum','+90 XP'],['Win 1 round','One clean win today','+120 XP'],['Try a new game','Open another Play Zone game','+80 XP'],['Check Top Players','See weekly competition','+45 XP'],['Keep streak active','Do not miss today','+70 XP'],['Deposit TON','Add more play balance','+250 XP']],
    Friday:[['Play 6 rounds','Push before weekend','+150 XP'],['Win 3 rounds','High performance bonus','+220 XP'],['Place 8 bets','Stay active','+150 XP'],['Open Market','Check drops and NFTs','+35 XP'],['Invite a friend','Grow the competition','+220 XP'],['Daily login','Claim activity credit','+40 XP']],
    Saturday:[['Play 5 rounds','Weekend activity','+130 XP'],['Win 2 rounds','Keep your win rate up','+160 XP'],['Bet 30 TON total','Weekend volume mission','+240 XP'],['Open Play Zone','Explore games','+40 XP'],['Keep streak active','Weekend streak bonus','+90 XP'],['Check level progress','See XP to next level','+45 XP']],
    Sunday:[['Play 7 rounds','Final weekly push','+180 XP'],['Win 3 rounds','Finish strong','+220 XP'],['Place 10 bets','Last day activity goal','+190 XP'],['Check Top Players','See your final weekly place','+60 XP'],['Keep streak active','Complete the week','+140 XP'],['Daily login','Final day login reward','+50 XP']]
  };
  function q(id){return document.getElementById(id)}
  function mondayIndex(date){var js=date.getDay();return js===0?6:js-1}
  function startOfWeek(date){var d=new Date(date);d.setHours(0,0,0,0);d.setDate(d.getDate()-mondayIndex(d));return d}
  function renderDays(active){
    var wrap=q('dailyRewardsDays');if(!wrap)return;
    var start=startOfWeek(new Date());
    wrap.innerHTML=dayNames.map(function(name,i){var d=new Date(start);d.setDate(start.getDate()+i);return '<button class="daily-rewards-day '+(i===active?'active':'')+'" type="button" data-daily-rewards-day="'+i+'"><small>'+name.slice(0,3)+'</small><strong>'+d.getDate()+'</strong><span>Day '+(i+1)+'</span></button>'}).join('');
  }
  function renderMissions(index){
    var name=dayNames[index]||dayNames[0];
    var list=missions[name]||missions.Monday;
    var title=q('dailyRewardsMissionTitle');if(title)title.textContent=name+' missions';
    var count=q('dailyRewardsMissionCount');if(count)count.textContent=list.length+' missions';
    var box=q('dailyRewardsMissions');if(!box)return;
    box.innerHTML=list.map(function(m,i){return '<div class="daily-rewards-mission"><div class="daily-rewards-mission-icon">'+(i+1)+'</div><div class="daily-rewards-mission-main"><strong>'+m[0]+'</strong><span>'+m[1]+'</span></div><div class="daily-rewards-xp">'+m[2]+'</div></div>'}).join('');
  }
  function open(){var p=q('dailyRewardsPage');if(!p)return;var active=mondayIndex(new Date());renderDays(active);renderMissions(active);document.body.classList.add('daily-rewards-open');p.classList.add('open');p.setAttribute('aria-hidden','false');try{p.scrollTop=0}catch(e){}}
  function close(){var p=q('dailyRewardsPage');if(!p)return;document.body.classList.remove('daily-rewards-open');p.classList.remove('open');p.setAttribute('aria-hidden','true')}
  function mount(){
    var old=document.getElementById('dailyRewardsMount');if(old)return;
    var home=document.getElementById('home');if(!home)return;
    var mount=document.createElement('div');mount.id='dailyRewardsMount';mount.innerHTML=window.DAILY_REWARDS_SECTION||'';
    var finance=home.querySelector('.home-finance-split');
    if(finance&&finance.parentNode)finance.parentNode.insertBefore(mount,finance.nextSibling);else home.appendChild(mount);
    renderDays(mondayIndex(new Date()));renderMissions(mondayIndex(new Date()));
  }
  document.addEventListener('click',function(ev){
    var target=ev.target&&ev.target.closest?ev.target.closest('[data-action], [data-daily-rewards-day]'):null;if(!target)return;
    var day=target.getAttribute('data-daily-rewards-day');if(day!==null){renderDays(Number(day));renderMissions(Number(day));return}
    var action=target.getAttribute('data-action');if(action==='open-daily-rewards'){open();return}if(action==='close-daily-rewards'){close();return}
  },true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
`;
