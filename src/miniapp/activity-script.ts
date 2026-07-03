import { ACTIVITY_CORE_SCRIPT } from './activity-core-script';
import { DAILY_REWARDS_INFO_SECTION } from './daily-rewards-info';

const DAILY_REWARDS_BOOTSTRAP = `
(function(){
  window.DAILY_REWARDS_INFO_SECTION = ${JSON.stringify(DAILY_REWARDS_INFO_SECTION)};
  var homeScrollTop=0;
  var dailyInfoCloseTimer=null;
  function pingBack(){try{window.dispatchEvent(new Event('vexa-daily-info-change'))}catch(e){}}
  function mountDailyInfo(){var current=document.getElementById('dailyrewardsinfo');if(current)return current;var main=document.querySelector('main.app')||document.body;var holder=document.createElement('div');holder.innerHTML=window.DAILY_REWARDS_INFO_SECTION||'';var section=holder.firstElementChild;if(section)main.appendChild(section);return section}
  function closeDailyInfo(){var section=document.getElementById('dailyrewardsinfo');if(!section||!section.classList.contains('active'))return false;if(dailyInfoCloseTimer)clearTimeout(dailyInfoCloseTimer);section.classList.add('is-closing');section.classList.remove('active');section.setAttribute('aria-hidden','true');var title=document.getElementById('brandTitle');if(title)title.textContent='Home';document.querySelectorAll('.tab').forEach(function(n){n.classList.toggle('active',n.getAttribute('data-view')==='home')});dailyInfoCloseTimer=setTimeout(function(){section.classList.remove('is-closing');pingBack()},220);pingBack();return true}
  function openDailyInfo(){var section=mountDailyInfo();if(!section)return;if(dailyInfoCloseTimer)clearTimeout(dailyInfoCloseTimer);var home=document.getElementById('home');if(home){homeScrollTop=home.scrollTop||0;home.classList.add('active')}section.setAttribute('aria-hidden','false');section.classList.remove('active','is-closing');if(home)home.scrollTop=homeScrollTop;requestAnimationFrame(function(){requestAnimationFrame(function(){section.classList.add('active');if(home)home.scrollTop=homeScrollTop;pingBack()})})}
  window.__vexaOpenDailyInfo=openDailyInfo;
  window.__vexaCloseDailyInfo=closeDailyInfo;
  document.addEventListener('click',function(ev){var target=ev.target&&ev.target.closest?ev.target.closest('[data-action="open-daily-guide"]'):null;if(!target)return;ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();openDailyInfo()},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountDailyInfo);else mountDailyInfo();
})();
`;

export const ACTIVITY_SCRIPT = DAILY_REWARDS_BOOTSTRAP + ACTIVITY_CORE_SCRIPT;
