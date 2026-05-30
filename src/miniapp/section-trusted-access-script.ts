export const SECTION_TRUSTED_ACCESS_SCRIPT = `
(function(){
  var trusted=false;
  var nativeFetch=window.fetch&&window.fetch.bind(window);
  function currentUserId(){
    var tg=window.Telegram&&window.Telegram.WebApp;
    var user=(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user)||{};
    return String(user.id||localStorage.getItem('ownerId')||'').trim();
  }
  function removeLockViews(){
    document.querySelectorAll('.section-locked-view,.connect-card-locked-view,.section-loading-mode').forEach(function(el){el.remove()});
    document.querySelectorAll('.is-section-locked,.connect-bot-card-locked').forEach(function(el){el.classList.remove('is-section-locked','connect-bot-card-locked')});
  }
  function asJson(data){return new Response(JSON.stringify(data),{status:200,headers:{'content-type':'application/json','cache-control':'no-store'}})}
  function readTrusted(){
    var uid=currentUserId();
    if(!uid){trusted=false;window.VexaTrustedAccess=false;return Promise.resolve(false)}
    return nativeFetch('/app/api/user-access-override?userId='+encodeURIComponent(uid),{cache:'no-store'}).then(function(r){return r.json()}).then(function(data){trusted=!!(data&&data.trustedAccess);window.VexaTrustedAccess=trusted;if(trusted){removeLockViews();setTimeout(removeLockViews,120);try{window.dispatchEvent(new CustomEvent('vexa-section-locks-updated'))}catch(e){}}return trusted}).catch(function(){return false});
  }
  var ready=readTrusted();
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
      return nativeFetch(input,init);
    };
  }
  document.addEventListener('visibilitychange',function(){if(!document.hidden)readTrusted()});
  document.addEventListener('click',function(){readTrusted()},true);
  setInterval(function(){if(trusted)removeLockViews()},1500);
})();
`;
