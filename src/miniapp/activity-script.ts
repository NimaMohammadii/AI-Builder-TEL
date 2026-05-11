export const ACTIVITY_SCRIPT = `
(function(){
  var tg=window.Telegram&&window.Telegram.WebApp;
  var user=(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user)||{};
  var lastPayload='';
  var lastSent=0;
  var confirmedCredit=null;
  var pendingCredit=null;
  var creditQueue=Promise.resolve();
  var creditVersion=0;
  var creditInFlight=0;
  var xpQueue=Promise.resolve();
  var levelProfile=null;
  var lastXpAt={};

  function activeSection(){var active=document.querySelector('.view.active');return active&&active.id?active.id:'home'}
  function userId(){return String(user.id||localStorage.getItem('ownerId')||'').trim()}
  function toast(v){var n=document.getElementById('toast');if(!n)return;n.textContent=v;n.style.display='block';setTimeout(function(){n.style.display='none'},2600)}
  function rankName(level){level=Math.max(1,Math.floor(Number(level)||1));if(level>=50)return 'Legend';if(level>=35)return 'Elite';if(level>=20)return 'Pro';if(level>=10)return 'Builder';if(level>=5)return 'Explorer';return 'Starter'}
  function nextLevelXp(level){level=Math.max(1,Math.floor(Number(level)||1));return Math.max(100,Math.floor(100*Math.pow(level,1.35)))}
  function normalizeLevel(profile){
    var level=Math.max(1,Math.floor(Number(profile&&profile.level)||1));
    var next=Math.max(1,Math.floor(Number(profile&&profile.nextLevelXp)||nextLevelXp(level)));
    var xp=Math.max(0,Math.min(next,Math.floor(Number(profile&&profile.xp)||0)));
    var progress=Math.max(0,Math.min(100,Math.floor(Number(profile&&profile.progressPercent)||((xp/next)*100))));
    return {level:level,xp:xp,totalXp:Math.max(0,Math.floor(Number(profile&&profile.totalXp)||0)),nextLevelXp:next,progressPercent:progress,xpLeft:Math.max(0,next-xp),rankName:String((profile&&profile.rankName)||rankName(level))};
  }
  function renderLevel(profile){
    var p=normalizeLevel(profile);
    levelProfile=p;
    var pill=document.getElementById('rankPill');if(pill)pill.textContent=p.rankName;
    var n=document.getElementById('userLine');if(!n)return;
    n.innerHTML='<span style="display:block;color:#fff;font-weight:800;font-size:12px;line-height:1">Level '+p.level+' <span style="color:rgba(255,255,255,.55);font-weight:700">• '+p.progressPercent+'%</span></span><span style="display:block;width:158px;height:6px;margin-top:6px;border-radius:999px;background:rgba(255,255,255,.12);overflow:hidden"><span style="display:block;width:'+p.progressPercent+'%;height:100%;border-radius:999px;background:linear-gradient(90deg,#5b0f24,#8f1d3d,#c03a5b);box-shadow:0 0 14px rgba(192,58,91,.48);transition:width .35s ease"></span></span><span style="display:block;margin-top:5px;color:rgba(255,255,255,.5);font-size:9.5px;line-height:1">'+p.xpLeft+' XP left to finish</span>';
  }
  function previewXp(amount){
    amount=Math.max(0,Math.floor(Number(amount)||0));if(!amount)return;
    var p=normalizeLevel(levelProfile||{level:1,xp:0,totalXp:0});
    var before=p.level;
    p.xp+=amount;p.totalXp+=amount;
    while(p.xp>=p.nextLevelXp){p.xp-=p.nextLevelXp;p.level++;p.nextLevelXp=nextLevelXp(p.level)}
    p.progressPercent=Math.max(0,Math.min(100,Math.floor((p.xp/p.nextLevelXp)*100)));
    p.xpLeft=Math.max(0,p.nextLevelXp-p.xp);
    p.rankName=rankName(p.level);
    renderLevel(p);
    if(p.level>before)toast('Level Up '+p.level+' • '+p.rankName);
  }
  function awardXp(amount,source,metadata,cooldownMs){
    var id=userId();amount=Math.max(0,Math.floor(Number(amount)||0));if(!id||!amount)return;
    var key=String(source||'activity')+':'+String(metadata&&metadata.action||metadata&&metadata.section||activeSection());
    var now=Date.now();cooldownMs=Math.max(0,Number(cooldownMs)||0);
    if(cooldownMs&&lastXpAt[key]&&now-lastXpAt[key]<cooldownMs)return;
    lastXpAt[key]=now;
    previewXp(amount);
    xpQueue=xpQueue.then(function(){return fetch('/app/api/level/xp',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({userId:id,amount:amount,source:source||'activity',metadata:metadata||{section:activeSection()}})})
      .then(function(r){return r.json().catch(function(){return null})})
      .then(function(j){if(j&&j.profile)renderLevel(j.profile);if(j&&j.leveledUp&&j.profile)toast('Level Up '+j.profile.level+' • '+j.profile.rankName)})
      .catch(function(){});});
  }
  function loadLevel(){var id=userId();if(!id)return;fetch('/app/api/level?userId='+encodeURIComponent(id),{cache:'no-store'}).then(function(r){return r.json()}).then(renderLevel).catch(function(){})}
  window.VexaLevel={add:awardXp,load:loadLevel};

  function writeCreditToUi(value){var credit=Math.max(0,Math.floor(Number(value)||0));['plinkoCredit','creditCount','plinkoCreditHeader'].forEach(function(id){var el=document.getElementById(id);if(el)el.textContent=String(credit)});return credit}
  function syncCreditToGames(value){var credit=Math.max(0,Math.floor(Number(value)||0));try{window.dispatchEvent(new CustomEvent('vexa-credit-sync',{detail:{credit:credit}}))}catch(e){}return credit}
  function applyServerCredit(value){if(value===null||value===undefined)return;var credit=writeCreditToUi(value);confirmedCredit=credit;pendingCredit=credit;syncCreditToGames(credit)}

  function sendActivity(force){
    var body={userId:userId(),username:user.username||null,firstName:user.first_name||null,section:activeSection()};
    if(!body.userId)return;
    var encoded=JSON.stringify(body);
    var now=Date.now();
    if(!force&&encoded===lastPayload&&now-lastSent<25000)return;
    lastPayload=encoded;lastSent=now;
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
    if(delta!==0)awardXp(delta>0?9:4,'game',{section:activeSection(),delta:delta},0);
    if(delta===0)return;
    creditInFlight++;
    creditQueue=creditQueue.then(function(){return fetch('/app/api/credit/game-delta',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({userId:id,delta:delta})})
      .then(function(r){return r.json().catch(function(){return null})})
      .then(function(j){if(j&&j.credit!==undefined){if(requestCreditVersion===creditVersion){applyServerCredit(j.credit)}else{confirmedCredit=Math.max(0,Math.floor(Number(j.credit)||0))}}})
      .catch(function(){})
      .then(function(){creditInFlight=Math.max(0,creditInFlight-1)});});
  }

  window.addEventListener('vexa-credit-game-change',function(ev){if(ev&&ev.detail&&ev.detail.credit!==undefined)sendGameDelta(ev.detail.credit,ev.detail.delta)});
  window.addEventListener('vexa-award-xp',function(ev){if(ev&&ev.detail)awardXp(ev.detail.amount,ev.detail.source,ev.detail.metadata,0)});
  document.addEventListener('click',function(ev){
    var b=ev.target&&ev.target.closest&&ev.target.closest('button');
    if(b){
      var action=b.getAttribute('data-action')||'';
      var view=b.getAttribute('data-view')||'';
      if(action==='generate-tts')setTimeout(function(){awardXp(10,'ai',{section:'flow',action:'generate-tts'},1500)},650);
      if(view)awardXp(1,'activity',{section:view,action:'open-section'},8000);
      if(action.indexOf('plinko')>=0||action.indexOf('mines')>=0||action.indexOf('crash')>=0)awardXp(3,'play',{section:activeSection(),action:action},500);
    }
    setTimeout(function(){sendActivity(false)},80);
  },true);
  document.addEventListener('visibilitychange',function(){sendActivity(true);if(!document.hidden)loadLevel()});
  window.addEventListener('beforeunload',function(){sendActivity(true)});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){loadLevel();});else loadLevel();
  setTimeout(function(){sendActivity(true);loadLevel()},600);
  setInterval(function(){sendActivity(false)},20000);
})();
`;