export const MINIAPP_AUDIO_SCRIPT = `
(function(){
  let audio=null;
  let currentUrl='';
  let shouldPlay=false;
  let pollTimer=0;
  function ensureAudio(){
    if(audio)return audio;
    audio=new Audio();
    audio.loop=true;
    audio.preload='auto';
    audio.setAttribute('playsinline','true');
    audio.volume=1;
    document.addEventListener('visibilitychange',function(){if(document.hidden&&audio){audio.pause();}else if(shouldPlay){tryPlay();}});
    ['pointerdown','touchstart','click','keydown'].forEach(function(eventName){document.addEventListener(eventName,function(){if(shouldPlay)tryPlay();},{passive:true});});
    return audio;
  }
  function tryPlay(){
    const player=ensureAudio();
    if(!shouldPlay||!currentUrl)return;
    const result=player.play();
    if(result&&typeof result.catch==='function')result.catch(function(){});
  }
  function stopAudio(){
    shouldPlay=false;
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
