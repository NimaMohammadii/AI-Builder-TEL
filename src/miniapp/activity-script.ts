import { ACTIVITY_CORE_SCRIPT } from './activity-core-script';
import { DAILY_REWARDS_SECTION } from './daily-rewards-section';
import { DAILY_REWARDS_STYLES } from './daily-rewards-styles';
import { DAILY_REWARDS_SCRIPT } from './daily-rewards-script';

const DAILY_REWARDS_BOOTSTRAP = `
(function(){
  window.DAILY_REWARDS_SECTION = ${JSON.stringify(DAILY_REWARDS_SECTION)};
  if(!document.getElementById('dailyRewardsStyles')){
    var style=document.createElement('style');
    style.id='dailyRewardsStyles';
    style.textContent=${JSON.stringify(DAILY_REWARDS_STYLES)};
    document.head.appendChild(style);
  }
})();
`;

export const ACTIVITY_SCRIPT = DAILY_REWARDS_BOOTSTRAP + ACTIVITY_CORE_SCRIPT + DAILY_REWARDS_SCRIPT;
