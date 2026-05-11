import { LEVEL_SYNC_SCRIPT } from './level-sync-script';

export const MINIAPP_AUDIO_SCRIPT = LEVEL_SYNC_SCRIPT + `
(function(){
  var audio=null;
  var button=null;
  var currentUrl='';
  var config=null;
  var hasStarted=false;
  var stoppedByUser=false;
  var isPlaying=false;

  function playIcon(){return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8.5 6.2v11.6c0 .9 1 1.4 1.8.9l8.9-5.8c.7-.4.7-1.5 0-1.9l-8.9-5.8c-.8-.5-1.8 0-1.8.9z"/></svg>';}
  function stopIcon(){return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7.2 7.2h9.6v9.6H7.2z"/></svg>';}
  function setButtonState(on){
    isPlaying=!!on;
    if(!button)return;
    button.classList.toggle('is-playing',isPlaying);
    button.setAttribute('aria-label',isPlaying?'Stop mini app music':'Play mini app music');
    button.setAttribute('title',isPlaying?'Stop music':'Play music');
    button.innerHTML=isPlaying?stopIcon():playIcon();
  }
  function addStyles(){
    if(document.getElementById('miniAppAudioStyles'))return;
    var style=document.createElement('style');
    style.id='miniAppAudioStyles';
    style.textContent='#miniAppAudioButton{position:fixed;right:18px;bottom:calc(96px + env(safe-area-inset-bottom));z-index:130;width:58px;height:58px;border:1px solid rgba(255,255,255,.22);border-radius:999px;background:linear-gradient(145deg,rgba(255,255,255,.22),rgba(255,255,255,.075));color:#fff;display:grid;place-items:center;padding:0;box-shadow:0 18px 42px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.26),inset 0 -10px 24px rgba(255,255,255,.045);backdrop-filter:blur(10px) saturate(1.35);-webkit-backdrop-filter:blur(10px) saturate(1.35);touch-action:manipulation;-webkit-tap-highlight-color:transparent;transition:transform .16s ease,background .16s ease,border-color .16s ease,box-shadow .16s ease}#miniAppAudioButton:active{transform:scale(.94)}#miniAppAudioButton svg{width:27px;height:27px;display:block;fill:currentColor;filter:drop-shadow(0 2px 8px rgba(0,0,0,.35))}#miniAppAudioButton:not(.is-playing) svg{transform:translateX(1.5px)}#miniAppAudioButton.is-playing{background:linear-gradient(145deg,rgba(255,255,255,.32),rgba(255,255,255,.12));border-color:rgba(255,255,255,.34);box-shadow:0 20px 46px rgba(0,0,0,.36),0 0 22px rgba(255,255,255,.11),inset 0 1px 0 rgba(255,255,255,.34)}';
    document.head.appendChild(style);
  }
  function removePlayer(){
    if(audio){audio.pause();audio.removeAttribute('src');audio.load();}
    if(button&&button.parentNode)button.parentNode.removeChild(button);
    if(audio&&audio.parentNode)audio.parentNode.removeChild(audio);
    audio=null;button=null;currentUrl='';config=null;hasStarted=false;stoppedByUser=false;setButtonState(false);
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
    audio.addEventListener('playing',function(){hasStarted=true;stoppedByUser=false;setButtonState(true)});
    audio.addEventListener('play',function(){hasStarted=true;stoppedByUser=false;setButtonState(true)});
    audio.addEventListener('pause',function(){setButtonState(false)});
    audio.addEventListener('ended',function(){setButtonState(false)});
    audio.addEventListener('error',function(){setButtonState(false)});
    document.body.appendChild(audio);
    return audio;
  }
  function ensureButton(){
    if(button)return;
    addStyles();
    button=document.createElement('button');
    button.id='miniAppAudioButton';
    button.type='button';
    button.setAttribute('aria-label','Play mini app music');
    button.onclick=function(ev){
      ev.preventDefault();
      ev.stopPropagation();
      if(isPlaying)stopNow();else{stoppedByUser=false;playNow(true)}
    };
    setButtonState(false);
    document.body.appendChild(button);
  }
  function sourceWithVersion(url){
    var version=config&&config.version?String(config.version):'';
    if(!version)return String(url);
    return String(url)+(String(url).indexOf('?')>-1?'&':'?')+'av='+encodeURIComponent(version);
  }
  function setSource(){
    if(!config||!config.url)return false;
    var player=ensureAudio();
    var url=sourceWithVersion(config.url);
    if(currentUrl!==url){currentUrl=url;player.src=url;player.load();hasStarted=false;stoppedByUser=false;setButtonState(false)}
    return true;
  }
  function playNow(fromButton){
    if(!config||!config.enabled||!config.hasAudio||!config.url)return;
    if(!fromButton&&stoppedByUser)return;
    ensureButton();
    if(!setSource())return;
    var result=audio.play();
    if(result&&typeof result.then==='function')result.then(function(){hasStarted=true;stoppedByUser=false;setButtonState(true)}).catch(function(){setButtonState(false)});
  }
  function stopNow(){stoppedByUser=true;if(audio){audio.pause();try{audio.currentTime=0}catch(e){}}setButtonState(false)}
  function apply(info){
    config=info;
    if(!info||!info.hasAudio||!info.enabled||!info.url){removePlayer();return;}
    ensureButton();
    setSource();
    if(hasStarted&&!stoppedByUser)playNow(false);
  }
  function load(){fetch('/app/api/miniapp-audio',{cache:'no-store'}).then(function(r){return r.json()}).then(apply).catch(function(){})}
  function firstGesture(){if(!config||!config.enabled||!config.hasAudio||!config.url)return;if(stoppedByUser||hasStarted)return;playNow(false)}
  ['pointerup','touchend','click'].forEach(function(name){document.addEventListener(name,firstGesture,{capture:false,passive:true})});
  document.addEventListener('visibilitychange',function(){if(document.hidden){if(audio)audio.pause()}else if(hasStarted&&!stoppedByUser){playNow(false)}});
  window.VexaMiniappAudio={reload:load,play:function(){stoppedByUser=false;playNow(true)},stop:stopNow};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
  setInterval(load,15000);
})();
`;
