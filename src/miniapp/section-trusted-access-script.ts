export const SECTION_TRUSTED_ACCESS_SCRIPT = `
(function(){
  var trusted=false;
  var nativeFetch=window.fetch&&window.fetch.bind(window);
  var lastTrustedReadAt=0;
  var trustedReadInFlight=null;
  var TRUSTED_READ_CACHE_MS=60000;
  function currentUserId(){
    var tg=window.Telegram&&window.Telegram.WebApp;
    var user=(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user)||{};
    return String(user.id||localStorage.getItem('ownerId')||'').trim();
  }
  function removeLockViews(){
    document.querySelectorAll('.section-locked-view,.connect-card-locked-view,.section-loading-mode').forEach(function(el){el.remove()});
    document.querySelectorAll('.is-section-locked,.is-section-loading-active,.is-section-loading-pending').forEach(function(el){
      el.classList.remove('is-section-locked','is-section-loading-active','is-section-loading-pending');
    });
    document.body.classList.remove('section-loading-active');
  }
  function asJson(data){return new Response(JSON.stringify(data),{status:200,headers:{'content-type':'application/json','cache-control':'no-store'}})}
  function readTrusted(force){
    var uid=currentUserId();
    if(!uid){trusted=false;window.VexaTrustedAccess=false;return Promise.resolve(false)}
    var now=Date.now();
    if(!force&&lastTrustedReadAt&&now-lastTrustedReadAt<TRUSTED_READ_CACHE_MS)return Promise.resolve(trusted);
    if(trustedReadInFlight)return trustedReadInFlight;
    trustedReadInFlight=nativeFetch('/app/api/user-access-override?userId='+encodeURIComponent(uid),{cache:'no-store'}).then(function(r){return r.json()}).then(function(data){lastTrustedReadAt=Date.now();trusted=!!(data&&data.trustedAccess);window.VexaTrustedAccess=trusted;if(trusted){removeLockViews();setTimeout(removeLockViews,120);try{window.dispatchEvent(new CustomEvent('vexa-section-locks-updated'))}catch(e){}}return trusted}).catch(function(){return trusted}).finally(function(){trustedReadInFlight=null});
    return trustedReadInFlight;
  }
  var ready=readTrusted(true);
  if(nativeFetch){
    window.fetch=function(input,init){
      var url=String((input&&input.url)||input||'');
      if(url.indexOf('/app/api/section-locks')>=0){
        return ready.then(function(){return trusted?asJson({sections:[]}):nativeFetch(input,init)});
      }
      if(url.indexOf('/app/api/user-controls')>=0){
        return ready.then(function(){
          if(!trusted)return nativeFetch(input,init);
          return nativeFetch(input,init).then(function(r){return r.json()}).then(function(data){data=data||{};data.blockedSections=[];data.sectionBlocks=[];data.trustedAccess=true;return asJson(data)});
        });
      }
      if(url.indexOf('/app/api/predict-settings')>=0){
        return ready.then(function(){
          if(!trusted)return nativeFetch(input,init);
          return nativeFetch(input,init).then(function(r){return r.json()}).then(function(data){data=data||{};data.hiddenCards={bitcoin:false,solana:false,ethereum:false,gold:false,oil:false};data.trustedAccess=true;return asJson(data)});
        });
      }
      return nativeFetch(input,init);
    };
  }
  if(window.MutationObserver){new MutationObserver(function(){if(trusted)removeLockViews()}).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']})}
})();
`;