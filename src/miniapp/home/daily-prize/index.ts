import { VEXA_REWARDS_SCRIPT } from './script';

export { VEXA_REWARDS_SCRIPT as DAILY_PRIZE_SCRIPT, VEXA_REWARDS_SCRIPT } from './script';
export const DAILY_PRIZE_OVERLAY_SCRIPT = `
(function(){
  function q(id){return document.getElementById(id)}
  function setRewardsPage(open){var s=q('rewardsPage');if(!s)return;if(open&&s.parentNode!==document.body)document.body.appendChild(s);document.body.classList.toggle('rewards-open',!!open);s.classList.toggle('open',!!open);s.setAttribute('aria-hidden',open?'false':'true');if(open)try{s.scrollTop=0}catch(e){}}
  window.VexaDailyPrizeOverlay={open:function(){setRewardsPage(true)},close:function(){setRewardsPage(false)}};
  document.addEventListener('click',function(ev){var b=ev.target&&ev.target.closest&&ev.target.closest('button');if(!b)return;var a=b.getAttribute('data-action');if(a==='open-rewards'){ev.preventDefault();setRewardsPage(true)}if(a==='close-rewards'){ev.preventDefault();setRewardsPage(false)}},true);
})();
`;
export const DAILY_PRIZE_RUNTIME_SCRIPT = DAILY_PRIZE_OVERLAY_SCRIPT + VEXA_REWARDS_SCRIPT;
