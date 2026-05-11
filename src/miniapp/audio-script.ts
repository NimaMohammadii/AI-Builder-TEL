import { LEVEL_SYNC_SCRIPT } from './level-sync-script';

export const MINIAPP_AUDIO_SCRIPT = LEVEL_SYNC_SCRIPT + `
(function(){
  var audio=null;
  var box=null;
  var playBtn=null;
  var stopBtn=null;
  var currentUrl='';
  var config=null;
  var hasStarted=false;
  var stoppedByUser=false;

  function styleButton(btn,primary){
    btn.style.cssText='height:31px;padding:0 13px;border:0;border-radius:999px;background:'+(primary?'rgba(255,255,255,.18)':'rgba(255,255,255,.10)')+';color:#fff;font-size:12px;font-weight:850;letter-spacing:-.02em;box-shadow:inset 0 1px 0 rgba(255,255,255,.16);text-shadow:0 1px 8px rgba(0,0,0,.28)';
  }
  function setPlaying(on){if(playBtn)playBtn.textContent=on?'Playing':'Play'}
  function removePlayer(){
    if(audio){audio.pause();audio.removeAttribute('src');audio.load();}
    if(box&&box.parentNode)box.parentNode.removeChild(box);
    if(audio&&audio.parentNode)audio.parentNode.removeChild(audio);
    audio=null;box=null;playBtn=null;stopBtn=null;currentUrl='';config=null;hasStarted=false;stoppedByUser=false;
  }
  function ensureAudio(){
    if(audio)return audio;
    audio=document.createElement('audio');
    audio.id='miniAppAudioPlayer';
    audio.loop=true;
    audio.preload='auto';
    audio.volume=1;
    audio.controls=false;
    audio.setAttribute('playsinline','true');
    audio.setAttribute('webkit-playsinline','true');
    audio.addEventListener('playing',function(){hasStarted=true;setPlaying(true)});
    audio.addEventListener('pause',function(){setPlaying(false)});
    audio.addEventListener('ended',function(){setPlaying(false)});
    audio.addEventListener('error',function(){setPlaying(false)});
    document.body.appendChild(audio);
    return audio;
  }
  function setSource(){
    if(!config||!config.url)return false;
    var player=ensureAudio();
    var url=String(config.url);
    if(currentUrl!==url){currentUrl=url;player.src=url;player.load();hasStarted=false;stoppedByUser=false;setPlaying(false)}
    return true;
  }
  function playNow(){
    if(!config||!config.enabled||!config.hasAudio||!config.url||stoppedByUser)return;
    if(!setSource())return;
    var result=audio.play();
    if(result&&typeof result.then==='function')result.then(function(){hasStarted=true;setPlaying(true)}).catch(function(){setPlaying(false)});
  }
  function stopNow(){stoppedByUser=true;if(audio){audio.pause();audio.currentTime=0}setPlaying(false)}
  function ensureControls(){
    if(box)return;
    box=document.createElement('div');
    box.id='miniAppAudioBox';
    box.style.cssText='position:fixed;right:14px;bottom:92px;z-index:90;display:flex;gap:7px;padding:7px;border-radius:999px;background:rgba(255,255,255,.055);box-shadow:0 18px 38px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.16);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)';
    playBtn=document.createElement('button');stopBtn=document.createElement('button');
    playBtn.type='button';stopBtn.type='button';playBtn.textContent='Play';stopBtn.textContent='Stop';
    styleButton(playBtn,true);styleButton(stopBtn,false);
    playBtn.onclick=function(ev){ev.preventDefault();ev.stopPropagation();stoppedByUser=false;playNow()};
    stopBtn.onclick=function(ev){ev.preventDefault();ev.stopPropagation();stopNow()};
    box.appendChild(playBtn);box.appendChild(stopBtn);document.body.appendChild(box);
  }
  function apply(info){
    config=info;
    if(!info||!info.hasAudio||!info.enabled||!info.url){removePlayer();return;}
    ensureControls();setSource();if(hasStarted&&!stoppedByUser)playNow();
  }
  function load(){fetch('/app/api/miniapp-audio',{cache:'no-store'}).then(function(r){return r.json()}).then(apply).catch(function(){})}
  function firstGesture(){if(!config||!config.enabled||!config.hasAudio||!config.url)return;if(stoppedByUser||hasStarted)return;playNow()}
  ['pointerup','touchend','click'].forEach(function(name){document.addEventListener(name,firstGesture,{capture:false,passive:true})});
  document.addEventListener('visibilitychange',function(){if(document.hidden){if(audio)audio.pause()}else if(hasStarted&&!stoppedByUser){playNow()}});
  window.VexaMiniappAudio={reload:load,play:function(){stoppedByUser=false;playNow()},stop:stopNow};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
  setInterval(load,15000);
})();
`;
