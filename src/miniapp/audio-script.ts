export const MINIAPP_AUDIO_SCRIPT = `
(function(){
  let audio=null;
  let currentUrl='';
  let shouldPlay=false;
  let pollTimer=0;
  let unlockButton=null;
  function ensureUnlockButton(){
    if(unlockButton)return unlockButton;
    unlockButton=document.createElement('button');
    unlockButton.type='button';
    unlockButton.textContent='Tap to enable sound';
    unlockButton.setAttribute('aria-label','Enable mini app sound');
    unlockButton.style.cssText='position:fixed;left:50%;bottom:86px;transform:translateX(-50%);z-index:9999;border:1px solid rgba(255,255,255,.24);border-radius:999px;padding:11px 16px;background:rgba(12,8,10,.88);color:#fff;font:800 13px system-ui,-apple-system,Segoe UI,sans-serif;box-shadow:0 14px 34px rgba(0,0,0,.36),inset 0 1px 0 rgba(255,255,255,.16);backdrop-filter:blur(14px) saturate(1.2);-webkit-backdrop-filter:blur(14px) saturate(1.2);display:none';
    unlockButton.addEventListener('click',function(){tryPlay();});
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
    audio.setAttribute('playsinline','true');
    audio.volume=1;
    audio.addEventListener('playing',hideUnlock);
    document.addEventListener('visibilitychange',function(){if(document.hidden&&audio){audio.pause();}else if(shouldPlay){tryPlay();}});
    ['pointerdown','touchstart','click','keydown'].forEach(function(eventName){document.addEventListener(eventName,function(){if(shouldPlay)tryPlay();},{passive:true});});
    return audio;
  }
  function tryPlay(){
    const player=ensureAudio();
    if(!shouldPlay||!currentUrl)return;
    const result=player.play();
    if(result&&typeof result.then==='function'){
      result.then(hideUnlock).catch(function(){showUnlock();});
    }
  }
  function stopAudio(){
    shouldPlay=false;
    hideUnlock();
    if(audio){audio.pause();audio.currentTime=0;}
  }
  function applyConfig(config){
    if(!config||!config.hasAudio||!config.enabled||!config.url){stopAudio();return;}
    shouldPlay=true;
    const nextUrl=String(config.url);
    const player=ensureAudio();
    if(currentUrl!==nextUrl){currentUrl=nextUrl;player.src=nextUrl;player.load();}
    tryPlay();
  }
  async function refreshAudio(){
    try{
      const response=await fetch('/app/api/miniapp-audio',{cache:'no-store'});
      if(!response.ok)return;
      applyConfig(await response.json());
    }catch(error){}
  }
  refreshAudio();
  pollTimer=window.setInterval(refreshAudio,15000);
  window.addEventListener('beforeunload',function(){if(pollTimer)window.clearInterval(pollTimer);});
})();`;
