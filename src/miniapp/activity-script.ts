import { ACTIVITY_CORE_SCRIPT } from './activity-core-script';
import { DAILY_REWARDS_SECTION } from './daily-rewards-section';
import { DAILY_REWARDS_STYLES } from './daily-rewards-styles';
import { DAILY_REWARDS_POLISH_STYLES } from './daily-rewards-polish-styles';
import { DAILY_REWARDS_SCRIPT } from './daily-rewards-script';
import { DAILY_REWARDS_INFO_SECTION } from './daily-rewards-info';

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
  function openDailyInfo(){
    var section=mountDailyInfo();
    if(!section)return;
    document.querySelectorAll('.view').forEach(function(n){n.classList.remove('active')});
    section.classList.add('active');
    document.querySelectorAll('.tab').forEach(function(n){n.classList.remove('active')});
    var title=document.getElementById('brandTitle');
    if(title)title.textContent='Daily Rewards';
    if(window.Telegram&&window.Telegram.WebApp&&window.Telegram.WebApp.BackButton){try{window.Telegram.WebApp.BackButton.show()}catch(e){}}
    if(window.__vexaDailyInfoRender)window.__vexaDailyInfoRender();
  }
  window.__vexaOpenDailyInfo=openDailyInfo;
  document.addEventListener('click',function(ev){
    var target=ev.target&&ev.target.closest?ev.target.closest('#home .home-finance-visual'):null;
    if(!target)return;
    ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();
    openDailyInfo();
  },true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountDailyInfo);else mountDailyInfo();
})();
`;

export const ACTIVITY_SCRIPT = DAILY_REWARDS_BOOTSTRAP + ACTIVITY_CORE_SCRIPT + DAILY_REWARDS_SCRIPT;
