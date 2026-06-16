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
    if(document.getElementById('dailyrewardsinfo'))return;
    var main=document.querySelector('main.app')||document.body;
    var holder=document.createElement('div');
    holder.innerHTML=window.DAILY_REWARDS_INFO_SECTION||'';
    var section=holder.firstElementChild;
    if(section)main.insertBefore(section,document.querySelector('.tabs')||null);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountDailyInfo);else mountDailyInfo();
})();
`;

export const ACTIVITY_SCRIPT = DAILY_REWARDS_BOOTSTRAP + ACTIVITY_CORE_SCRIPT + DAILY_REWARDS_SCRIPT + DAILY_REWARDS_INFO_SCRIPT;
