export const MINIAPP_AUDIO_SCRIPT = `
(function(){
  let audio=null;
  let currentUrl='';
  let shouldPlay=false;
  let pollTimer=0;
  let unlockButton=null;
  let userGestureSeen=false;
  let refreshInFlight=null;
  const GESTURE_EVENTS=['pointerdown','touchstart','click','keydown'];
  function ensureUnlockButton(){
    if(unlockButton)return unlockButton;
    unlockButton=document.createElement('button');
    unlockButton.type='button';
    unlockButton.textContent='Tap to play music';
    unlockButton.setAttribute('aria-label','Enable mini app music');
    unlockButton.style.cssText='position:fixed;left:50%;bottom:86px;transform:translateX(-50%);z-index:9999;border:1px solid rgba(255,255,255,.24);border-radius:999px;padding:11px 16px;background:rgba(12,8,10,.88);color:#fff;font:800 13px system-ui,-apple-system,Segoe UI,sans-serif;box-shadow:0 14px 34px rgba(0,0,0,.36),inset 0 1px 0 rgba(255,255,255,.16);backdrop-filter:blur(14px) saturate(1.2);-webkit-backdrop-filter:blur(14px) saturate(1.2);display:none';
    unlockButton.addEventListener('click',function(event){event.stopPropagation();handleUserGesture();tryPlay(true);});
    document.body.appendChild(unlockButton);
    return unlockButton;
  }
  function showUnlock(){
    if(!shouldPlay||!currentUrl)return;
    ensureUnlockButton().style.display='block';
  }
  function hideUnlock(){
    if(unlockButton)unlockButton.style.display='none';
  }
  function ensureAudio(){
    if(audio)return audio;
    audio=new Audio();
    audio.loop=true;
    audio.preload='auto';
    audio.autoplay=false;
    audio.setAttribute('playsinline','true');
    audio.setAttribute('webkit-playsinline','true');
    audio.volume=1;
    audio.addEventListener('playing',hideUnlock);
    audio.addEventListener('pause',function(){if(shouldPlay&&!document.hidden)showUnlock();});
    audio.addEventListener('error',function(){if(shouldPlay)showUnlock();});
    document.addEventListener('visibilitychange',function(){if(document.hidden&&audio){audio.pause();}else if(shouldPlay){tryPlay(false);}});
    return audio;
  }
  function tryPlay(fromGesture){
    const player=ensureAudio();
    if(!shouldPlay||!currentUrl)return;
    if(player.getAttribute('src')!==currentUrl)player.src=currentUrl;
    const result=player.play();
    if(result&&typeof result.then==='function'){
      result.then(hideUnlock).catch(function(){if(!fromGesture||shouldPlay)showUnlock();});
    }
  }
  function stopAudio(){
    shouldPlay=false;
    hideUnlock();
    if(audio){audio.pause();audio.currentTime=0;}
  }
  function applyConfig(config,fromGesture){
    if(!config||!config.hasAudio||!config.enabled||!config.url){stopAudio();return;}
    shouldPlay=true;
    const nextUrl=String(config.url);
    const player=ensureAudio();
    if(currentUrl!==nextUrl){currentUrl=nextUrl;player.src=nextUrl;player.load();}
    tryPlay(!!fromGesture);
  }
  async function refreshAudio(fromGesture){
    if(refreshInFlight)return refreshInFlight;
    refreshInFlight=(async function(){
      try{
        const response=await fetch('/app/api/miniapp-audio',{cache:'no-store'});
        if(!response.ok)return;
        applyConfig(await response.json(),fromGesture);
      }catch(error){}finally{refreshInFlight=null;}
    })();
    return refreshInFlight;
  }
  function handleUserGesture(){
    userGestureSeen=true;
    ensureAudio();
    if(currentUrl&&shouldPlay)tryPlay(true);
    else refreshAudio(true);
  }
  GESTURE_EVENTS.forEach(function(eventName){document.addEventListener(eventName,handleUserGesture,{capture:true,passive:true});});
  ensureAudio();
  refreshAudio(false).then(function(){if(userGestureSeen)tryPlay(true);});
  pollTimer=window.setInterval(function(){refreshAudio(false);},15000);
  window.addEventListener('beforeunload',function(){if(pollTimer)window.clearInterval(pollTimer);});
})();`;
