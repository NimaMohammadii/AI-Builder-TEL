import { ACTIVITY_CORE_SCRIPT } from './activity-core-script';
import { DAILY_REWARDS_SECTION } from './daily-rewards-section';
import { DAILY_REWARDS_STYLES } from './daily-rewards-styles';
import { DAILY_REWARDS_POLISH_STYLES } from './daily-rewards-polish-styles';
import { DAILY_REWARDS_SCRIPT } from './daily-rewards-script';
import { DAILY_REWARDS_INFO_SECTION } from './daily-rewards-info';
import { DAILY_REWARDS_INFO_SCRIPT } from './daily-rewards-info-script';

const DAILY_REWARDS_BOOTSTRAP = `
(function(){
  window.DAILY_REWARDS_SECTION = ${JSON.stringify(DAILY_REWARDS_SECTION)};
  window.DAILY_REWARDS_INFO_SECTION = ${JSON.stringify(DAILY_REWARDS_INFO_SECTION)};
  if(!document.getElementById('dailyRewardsStyles')){
    var style=document.createElement('style');
    style.id='dailyRewardsStyles';
    style.textContent=${JSON.stringify(DAILY_REWARDS_STYLES + '\n' + DAILY_REWARDS_POLISH_STYLES)};
    document.head.appendChild(style);
  }
  function mountDailyInfo(){
    var current=document.getElementById('dailyrewardsinfo');
    if(current)return current;
    var main=document.querySelector('main.app')||document.body;
    var holder=document.createElement('div');
    holder.innerHTML=window.DAILY_REWARDS_INFO_SECTION||'';
    var section=holder.firstElementChild;
    if(section)main.insertBefore(section,document.querySelector('.tabs')||null);
    return section;
  }
  function fallbackDailyInfoRender(){
    var box=document.getElementById('dailyInfoList');
    if(!box)return;
    var rows=[
      ['TON Starter','Claim 0.05 TON as a guaranteed starter reward.'],
      ['Loss Cashback','Get 20% cashback on your losses for 24 hours after claiming.'],
      ['TON Boost','Claim 0.30 TON as a guaranteed balance boost.'],
      ['Risk Free x3','Receive 3 risk-free plays for selected games.'],
      ['Free Slots','Get 2 free slot plays. Wins stay yours and losses do not deduct balance.'],
      ['Double Win Day','Unlock a stronger reward day with extra winning potential.'],
      ['Weekly Mega TON','Reach the final day for the biggest weekly reward chance.']
    ];
    box.innerHTML=rows.map(function(row,i){var day=i+1;return '<div class="daily-info-row '+(i===0?'today':'')+'"><div class="daily-info-img"><img src="/app/api/daily-rewards-day-image/'+i+'" alt="" decoding="async" loading="lazy"></div><div class="daily-info-main"><em class="daily-info-day">Day '+day+'</em><b>'+row[0]+'</b><small>'+row[1]+'</small></div></div>'}).join('');
  }
  function loadDailyInfoRenderer(){
    if(window.__vexaDailyInfoScriptLoaded)return;
    try{
      new Function(${JSON.stringify(DAILY_REWARDS_INFO_SCRIPT)})();
      window.__vexaDailyInfoScriptLoaded=true;
    }catch(e){
      console.error('Daily Rewards info script failed',e);
      window.__vexaDailyInfoRender=fallbackDailyInfoRender;
    }
  }
  function renderDailyInfo(){
    if(window.__vexaDailyInfoRender)window.__vexaDailyInfoRender();
    else fallbackDailyInfoRender();
  }
  function openDailyInfo(){
    var section=mountDailyInfo();
    if(!section)return;
    loadDailyInfoRenderer();
    document.querySelectorAll('.view').forEach(function(n){n.classList.remove('active')});
    section.classList.add('active');
    document.querySelectorAll('.tab').forEach(function(n){n.classList.remove('active')});
    var title=document.getElementById('brandTitle');
    if(title)title.textContent='Daily Rewards';
    if(window.Telegram&&window.Telegram.WebApp&&window.Telegram.WebApp.BackButton){try{window.Telegram.WebApp.BackButton.show()}catch(e){}}
    renderDailyInfo();
  }
  window.__vexaOpenDailyInfo=openDailyInfo;
  document.addEventListener('click',function(ev){
    var target=ev.target&&ev.target.closest?ev.target.closest('#home .home-finance-visual'):null;
    if(!target)return;
    ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();
    openDailyInfo();
  },true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){mountDailyInfo();loadDailyInfoRenderer();renderDailyInfo()});else{mountDailyInfo();loadDailyInfoRenderer();renderDailyInfo()}
})();
`;

export const ACTIVITY_SCRIPT = DAILY_REWARDS_BOOTSTRAP + ACTIVITY_CORE_SCRIPT + DAILY_REWARDS_SCRIPT;
