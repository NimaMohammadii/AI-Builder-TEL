import { VEXA_LEAGUE_SCRIPT } from './vexa-league-script';
import { VEXA_REWARDS_SCRIPT } from './vexa-rewards-script';

const TOP_PLAYERS_LABEL_FIX = `
(function(){
  function apply(){
    var entry=document.getElementById('leaderboardEntry');
    if(entry){
      var main=entry.querySelector('.home-leaderboard-main');
      if(main)main.innerHTML='<span>Top Players</span><strong>Top 50 Players</strong><small>Players, ranks, Vex and TON balance</small>';
    }
    var page=document.getElementById('leaderboardPage');
    if(page){
      page.querySelectorAll('*').forEach(function(el){
        if(el.childNodes&&el.childNodes.length===1&&el.childNodes[0].nodeType===3){
          var t=el.textContent||'';
          if(t.indexOf('Weekly Prize')>-1||t.indexOf('Weekly Vex')>-1||t.indexOf('Weekly users')>-1||t.indexOf('Loading weekly players')>-1){
            el.textContent=t.replace(/Weekly Prize/g,'Top Players').replace(/Weekly Vex/g,'Top Players').replace(/Weekly users/g,'Players').replace(/Loading weekly players/g,'Loading players');
          }
        }
      });
    }
  }
  document.addEventListener('click',function(ev){var b=ev.target&&ev.target.closest&&ev.target.closest('[data-action="open-leaderboard"]');if(b)setTimeout(apply,20)},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(apply,20);setTimeout(apply,700)});else{setTimeout(apply,20);setTimeout(apply,700)}
})();
`;

const REWARD_VISUAL_OVERRIDE = `
(function(){
  function inject(){
    if(document.getElementById('vexaRewardVisualOverride'))return;
    var style=document.createElement('style');
    style.id='vexaRewardVisualOverride';
    style.textContent='body.rewards-open .rewards-page{isolation:isolate!important;background:radial-gradient(circle at 16% -4%,rgba(128,18,46,.34),rgba(128,18,46,0) 36%),radial-gradient(circle at 92% 18%,rgba(128,18,46,.24),rgba(128,18,46,0) 29%),radial-gradient(circle at 50% 108%,rgba(255,255,255,.06),rgba(255,255,255,0) 34%),#050507!important}body.rewards-open .rewards-page>*{position:relative!important;z-index:2!important}body.rewards-open .rewards-page:before{content:""!important;position:fixed!important;inset:0!important;z-index:0!important;pointer-events:none!important;background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 390 844\'%3E%3Cg fill=\'none\' stroke=\'%23ffffff\' stroke-opacity=\'.12\' stroke-width=\'1.35\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M300 96l25 12 25-12-25-12-25 12z\'/%3E%3Cpath d=\'M325 84v24\'/%3E%3Cpath d=\'M313 96h24\'/%3E%3Cpath d=\'M42 205c20-24 20-48 0-72-20 24-20 48 0 72z\'/%3E%3Cpath d=\'M34 176c6 10 12 14 18 0\'/%3E%3Ccircle cx=\'64\' cy=\'668\' r=\'29\'/%3E%3Cpath d=\'M45 668h38M64 649v38\'/%3E%3Cpath d=\'M309 607l35 17 35-17-35-17-35 17z\'/%3E%3Cpath d=\'M318 320h30M333 305v30\'/%3E%3Cpath d=\'M74 430l20 20 20-20\'/%3E%3Cpath d=\'M266 456c13-18 13-36 0-54-13 18-13 36 0 54z\'/%3E%3Cpath d=\'M36 548h22M47 537v22\'/%3E%3C/g%3E%3C/svg%3E")!important;background-size:100% 100%!important;background-position:center!important;background-repeat:no-repeat!important;opacity:1!important}body.rewards-open .rewards-page:after{content:""!important;position:fixed!important;inset:0!important;z-index:1!important;pointer-events:none!important;background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 390 844\'%3E%3Cg fill=\'none\' stroke=\'%238a1737\' stroke-opacity=\'.28\' stroke-width=\'1.15\'%3E%3Cpath d=\'M18 92h120\'/%3E%3Cpath d=\'M252 148h96\'/%3E%3Cpath d=\'M28 520h76\'/%3E%3Cpath d=\'M244 742h100\'/%3E%3Ccircle cx=\'318\' cy=\'246\' r=\'62\'/%3E%3Ccircle cx=\'72\' cy=\'766\' r=\'74\'/%3E%3Cpath d=\'M278 42c28 38 28 76 0 114\'/%3E%3Cpath d=\'M112 286c-24 32-24 64 0 96\'/%3E%3C/g%3E%3C/svg%3E")!important;background-size:100% 100%!important;background-repeat:no-repeat!important;opacity:.7!important}body.rewards-open .rewards-page-top:after{content:""!important;position:absolute!important;right:24px!important;top:92px!important;width:108px!important;height:108px!important;border-radius:32px!important;background:linear-gradient(135deg,rgba(126,20,48,.16),rgba(255,255,255,.025))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.07)!important;transform:rotate(18deg)!important;z-index:-1!important}body.rewards-open .rewards-status-strip,body.rewards-open .reward-today{background:linear-gradient(90deg,rgba(126,20,48,.075),rgba(255,255,255,0))!important;border-radius:24px!important}body.rewards-open .mission-row{backdrop-filter:blur(10px)!important;-webkit-backdrop-filter:blur(10px)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.09),0 18px 34px rgba(0,0,0,.14)!important}body.rewards-open .mission-row:after{content:""!important;position:absolute!important;right:-38px!important;top:-46px!important;width:116px!important;height:116px!important;border-radius:999px!important;background:radial-gradient(circle,rgba(126,20,48,.16),rgba(126,20,48,0) 68%)!important;pointer-events:none!important}body.rewards-open .reward-day.current{outline:1px solid rgba(126,20,48,.36)!important}body.rewards-open .reward-today-button,body.rewards-open .mission-reward{transition:transform .18s ease,background .18s ease!important}body.rewards-open .reward-today-button:active,body.rewards-open .mission-reward:active{transform:scale(.96)!important}';
    document.head.appendChild(style);
  }
  document.addEventListener('click',function(ev){var b=ev.target&&ev.target.closest&&ev.target.closest('[data-action="open-rewards"]');if(b)setTimeout(inject,10)},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject);else inject();
})();
`;

export const ACTIVITY_SCRIPT = `
(function(){
  var tg=window.Telegram&&window.Telegram.WebApp;
  var user=(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user)||{};
  var lastPayload='';
  var lastSent=0;
  var lastSection='';
  var confirmedCredit=null;
  var pendingCredit=null;
  var creditQueue=Promise.resolve();
  var creditVersion=0;
  var creditInFlight=0;

  function activeSection(){var active=document.querySelector('.view.active');return active&&active.id?active.id:'home'}
  function userId(){return String(user.id||localStorage.getItem('ownerId')||'').trim()}

  function writeCreditToUi(value){var credit=Math.max(0,Math.floor(Number(value)||0));['plinkoCredit','creditCount','plinkoCreditHeader'].forEach(function(id){var el=document.getElementById(id);if(el)el.textContent=String(credit)});return credit}
  function syncCreditToGames(value){var credit=Math.max(0,Math.floor(Number(value)||0));try{window.dispatchEvent(new CustomEvent('vexa-credit-sync',{detail:{credit:credit}}))}catch(e){}return credit}
  function applyServerCredit(value){if(value===null||value===undefined)return;var credit=writeCreditToUi(value);confirmedCredit=credit;pendingCredit=credit;syncCreditToGames(credit)}

  function sendActivity(force){
    if(document.hidden&&!force)return;
    var section=activeSection();
    var body={userId:userId(),username:user.username||null,firstName:user.first_name||null,section:section};
    if(!body.userId)return;
    var encoded=JSON.stringify(body);
    var now=Date.now();
    var sectionChanged=section!==lastSection;
    if(!force&&!sectionChanged&&encoded===lastPayload&&now-lastSent<300000)return;
    lastPayload=encoded;lastSent=now;lastSection=section;
    var requestCreditVersion=creditVersion;
    fetch('/app/api/activity',{method:'POST',headers:{'content-type':'application/json'},body:encoded,keepalive:true})
      .then(function(r){return r.json().catch(function(){return null})})
      .then(function(j){if(j&&j.ok&&j.credit!==undefined&&creditInFlight===0&&requestCreditVersion===creditVersion)applyServerCredit(j.credit)})
      .catch(function(){});
  }

  function readUiCredit(){var el=document.getElementById('plinkoCredit')||document.getElementById('creditCount')||document.getElementById('plinkoCreditHeader');return Math.max(0,Math.floor(Number(el&&el.textContent)||0))}
  function sendGameDelta(nextCredit, explicitDelta){
    var id=userId();if(!id)return;
    var previous=pendingCredit===null?(confirmedCredit===null?readUiCredit():confirmedCredit):pendingCredit;
    nextCredit=writeCreditToUi(nextCredit);syncCreditToGames(nextCredit);
    var delta=Number.isFinite(Number(explicitDelta))?Math.floor(Number(explicitDelta)):nextCredit-previous;
    pendingCredit=Math.max(0,previous+delta);creditVersion++;
    var requestCreditVersion=creditVersion;
    if(delta===0)return;
    creditInFlight++;
    creditQueue=creditQueue.then(function(){return fetch('/app/api/credit/game-delta',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({userId:id,delta:delta})})
      .then(function(r){return r.json().catch(function(){return null})})
      .then(function(j){if(j&&j.credit!==undefined){if(requestCreditVersion===creditVersion){applyServerCredit(j.credit)}else{confirmedCredit=Math.max(0,Math.floor(Number(j.credit)||0))}}})
      .catch(function(){})
      .then(function(){creditInFlight=Math.max(0,creditInFlight-1)});});
  }

  function smartSync(){sendActivity(false)}
  window.addEventListener('vexa-credit-game-change',function(ev){if(ev&&ev.detail&&ev.detail.credit!==undefined)sendGameDelta(ev.detail.credit,ev.detail.delta)});
  document.addEventListener('click',function(ev){
    var b=ev.target&&ev.target.closest&&ev.target.closest('button');
    if(b&&(b.getAttribute('data-action')||b.getAttribute('data-tab')||b.closest('.tabs')))setTimeout(smartSync,120);
  },true);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)sendActivity(false);else sendActivity(true)});
  window.addEventListener('beforeunload',function(){sendActivity(true)});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){sendActivity(true)});else sendActivity(true);
})();
` + VEXA_LEAGUE_SCRIPT + TOP_PLAYERS_LABEL_FIX + VEXA_REWARDS_SCRIPT + REWARD_VISUAL_OVERRIDE;