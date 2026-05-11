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
  var lastToggleAt=0;
  var blockNavUntil=0;
  var pointerTapHandled=false;

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
    style.textContent='#miniAppAudioButton{position:fixed;right:18px;bottom:calc(178px + env(safe-area-inset-bottom));z-index:2147483647;width:54px;height:54px;border:1px solid rgba(255,255,255,.22);border-radius:999px;background:rgba(255,255,255,.035);color:#fff;display:grid;place-items:center;padding:0;box-shadow:0 14px 32px rgba(0,0,0,.20),inset 0 1px 0 rgba(255,255,255,.20),inset 0 -1px 0 rgba(255,255,255,.06);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);touch-action:none;-webkit-tap-highlight-color:transparent;pointer-events:auto;user-select:none;appearance:none;-webkit-appearance:none;outline:0;overflow:hidden;transition:transform .16s ease,background .16s ease,border-color .16s ease,box-shadow .16s ease}#miniAppAudioButton:before{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(135deg,rgba(255,255,255,.16),rgba(255,255,255,.025));pointer-events:none}#miniAppAudioButton:active{transform:scale(.94)}#miniAppAudioButton svg{position:relative;z-index:1;width:25px;height:25px;display:block;fill:currentColor;filter:drop-shadow(0 2px 7px rgba(0,0,0,.38));pointer-events:none}#miniAppAudioButton:not(.is-playing) svg{transform:translateX(1.5px)}#miniAppAudioButton.is-playing{background:rgba(255,255,255,.045);border-color:rgba(255,255,255,.28);box-shadow:0 16px 36px rgba(0,0,0,.24),inset 0 1px 0 rgba(255,255,255,.24),inset 0 -1px 0 rgba(255,255,255,.07)}';
    document.head.appendChild(style);
  }
  function pointFromEvent(ev){
    var t=ev&&ev.changedTouches&&ev.changedTouches[0]||ev&&ev.touches&&ev.touches[0];
    return t?{x:t.clientX,y:t.clientY}:{x:ev&&ev.clientX,y:ev&&ev.clientY};
  }
  function hitsAudioButton(ev){
    if(!button)return false;
    if(ev&&ev.target&&ev.target.closest&&ev.target.closest('#miniAppAudioButton'))return true;
    var p=pointFromEvent(ev);
    if(!Number.isFinite(p.x)||!Number.isFinite(p.y))return false;
    var r=button.getBoundingClientRect();
    return p.x>=r.left-12&&p.x<=r.right+12&&p.y>=r.top-12&&p.y<=r.bottom+12;
  }
  function swallow(ev){
    if(!ev)return;
    ev.preventDefault();
    ev.stopPropagation();
    if(typeof ev.stopImmediatePropagation==='function')ev.stopImmediatePropagation();
  }
  function toggleFromButton(){
    var now=Date.now();
    blockNavUntil=now+700;
    if(now-lastToggleAt>320){lastToggleAt=now;toggleAudio();}
  }
  function handleAudioPointer(ev,shouldToggle){
    if(!hitsAudioButton(ev))return false;
    swallow(ev);
    blockNavUntil=Date.now()+700;
    if(shouldToggle)toggleFromButton();
    return true;
  }
  function blockGhostNavigation(ev){
    if(Date.now()>blockNavUntil)return false;
    var target=ev&&ev.target;
    if(target&&target.closest&&target.closest('[data-view]')){swallow(ev);return true;}
    return false;
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
    button.setAttribute('data-audio-control','1');
    button.addEventListener('pointerdown',function(ev){pointerTapHandled=true;swallow(ev);blockNavUntil=Date.now()+700;if(button.setPointerCapture&&ev.pointerId!=null){try{button.setPointerCapture(ev.pointerId)}catch(e){}}},{capture:true,passive:false});
    button.addEventListener('pointerup',function(ev){swallow(ev);toggleFromButton();},{capture:true,passive:false});
    button.addEventListener('touchstart',function(ev){swallow(ev);blockNavUntil=Date.now()+700},{capture:true,passive:false});
    button.addEventListener('touchend',function(ev){swallow(ev);if(!pointerTapHandled)toggleFromButton();pointerTapHandled=false;},{capture:true,passive:false});
    button.addEventListener('click',function(ev){swallow(ev);blockNavUntil=Date.now()+700},{capture:true,passive:false});
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
  function toggleAudio(){if(isPlaying)stopNow();else{stoppedByUser=false;playNow(true)}}
  function apply(info){
    config=info;
    if(!info||!info.hasAudio||!info.enabled||!info.url){removePlayer();return;}
    ensureButton();
    setSource();
    if(hasStarted&&!stoppedByUser)playNow(false);
  }
  function load(){fetch('/app/api/miniapp-audio',{cache:'no-store'}).then(function(r){return r.json()}).then(apply).catch(function(){})}
  function firstGesture(ev){
    if(hitsAudioButton(ev))return;
    if(!config||!config.enabled||!config.hasAudio||!config.url)return;
    if(stoppedByUser||hasStarted)return;
    playNow(false);
  }
  ['pointerdown','touchstart','mousedown'].forEach(function(name){window.addEventListener(name,function(ev){handleAudioPointer(ev,false)||blockGhostNavigation(ev)},{capture:true,passive:false})});
  ['pointerup','touchend','mouseup'].forEach(function(name){window.addEventListener(name,function(ev){handleAudioPointer(ev,true)||blockGhostNavigation(ev)},{capture:true,passive:false})});
  window.addEventListener('click',function(ev){handleAudioPointer(ev,false)||blockGhostNavigation(ev)},{capture:true,passive:false});
  ['pointerup','touchend','click'].forEach(function(name){document.addEventListener(name,firstGesture,{capture:false,passive:true})});
  document.addEventListener('visibilitychange',function(){if(document.hidden){if(audio)audio.pause()}else if(hasStarted&&!stoppedByUser){playNow(false)}});
  window.VexaMiniappAudio={reload:load,play:function(){stoppedByUser=false;playNow(true)},stop:stopNow};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
  setInterval(load,15000);
})();
`;
