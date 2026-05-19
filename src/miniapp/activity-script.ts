import { ACTIVITY_CORE_SCRIPT } from './activity-core-script';
import { DAILY_REWARDS_SECTION } from './daily-rewards-section';
import { DAILY_REWARDS_STYLES } from './daily-rewards-styles';
import { DAILY_REWARDS_POLISH_STYLES } from './daily-rewards-polish-styles';
import { DAILY_REWARDS_SCRIPT } from './daily-rewards-script';
import { PREDICT_ZONE_LIVE_BETS_STYLES } from './predict-zone-live-bets-styles';
import { PREDICT_ZONE_LIVE_BETS_SCRIPT } from './predict-zone-live-bets-script';

const DAILY_REWARDS_BOOTSTRAP = `
(function(){
  window.DAILY_REWARDS_SECTION = ${JSON.stringify(DAILY_REWARDS_SECTION)};
  if(!document.getElementById('dailyRewardsStyles')){
    var style=document.createElement('style');
    style.id='dailyRewardsStyles';
    style.textContent=${JSON.stringify(DAILY_REWARDS_STYLES + '\n' + DAILY_REWARDS_POLISH_STYLES + '\n' + PREDICT_ZONE_LIVE_BETS_STYLES)};
    document.head.appendChild(style);
  }
})();
`;

export const ACTIVITY_SCRIPT = DAILY_REWARDS_BOOTSTRAP + ACTIVITY_CORE_SCRIPT + DAILY_REWARDS_SCRIPT + PREDICT_ZONE_LIVE_BETS_SCRIPT;
