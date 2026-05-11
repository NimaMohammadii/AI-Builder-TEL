import { LEVEL_SYNC_SCRIPT } from './level-sync-script';

export const MINIAPP_AUDIO_SCRIPT = LEVEL_SYNC_SCRIPT + `
(function(){
  var audio=null;
  var button=null;
  var config=null;
  var currentUrl='';
  var playing=false;
  var stopped=false;
  var started=false;
  var lastTap=0;

  function playIcon(){return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8.5 6.2v11.6c0 .9 1 1.4 1.8.9l8.9-5.8c.7-.4.7-1.5 0-1.9l-8.9-5.8c-.8-.5-1.8 0-1.8.9z"/></svg>'}
  function stopIcon(){return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7.25 7.25h9.5v9.5h-9.5z"/></svg>'}
  function block(ev){if(!ev)return;ev.preventDefault();ev.stopPropagation();if(ev.stopImmediatePropagation)ev.stopImmediatePropagation()}
  function removeLegacy(){document.querySelectorAll('#miniAppAudioBox').forEach(function(n){n.remove()})}
  function installCss(){
    var old=document.getElementById('miniAppAudioStyles');
    if(old)old.remove();
    var style=document.createElement('style');
    style.id='miniAppAudioStyles';
    style.textContent='#miniAppAudioBox{display:none!important;visibility:hidden!important;pointer-events:none!important}#miniAppAudioButton{position:fixed!important;right:18px!important;bottom:calc(178px + env(safe-area-inset-bottom))!important;z-index:2147483647!important;width:54px!important;height:54px!important;border:1px solid rgba(255,255,255,.22)!important;border-radius:999px!important;background:rgba(255,255,255,.035)!important;color:#fff!important;display:grid!important;place-items:center!important;padding:0!important;margin:0!important;box-shadow:0 14px 32px rgba(0,0,0,.20),inset 0 1px 0 rgba(255,255,255,.20)!important;backdrop-filter:blur(2px)!important;-webkit-backdrop-filter:blur(2px)!important;touch-action:none!important;-webkit-tap-highlight-color:transparent!important;pointer-events:auto!important;user-select:none!important;appearance:none!important;-webkit-appearance:none!important;outline:0!important;overflow:hidden!important;font-size:0!important;line-height:0!important}#miniAppAudioButton:before{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(135deg,rgba(255,255,255,.16),rgba(255,255,255,.025));pointer-events:none}#miniAppAudioButton svg{position:relative;z-index:1;width:25px!important;height:25px!important;display:block!important;fill:currentColor!important;filter:drop-shadow(0 2px 7px rgba(0,0,0,.38));pointer-events:none!important}#miniAppAudioButton:not(.is-playing) svg{transform:translateX(1.5px)}#miniAppAudioButton.is-playing{background:rgba(255,255,255,.045)!important;border-color:rgba(255,255,255,.28)!important}';
    document.head.appendChild(style);
  }
  function setState(on){
    playing=!!on;
    if(!button)return;
    button.classList.toggle('is-playing',playing);
    button.setAttribute('aria-label',playing?'Stop music':'Play music');
    button.innerHTML=playing?stopIcon():playIcon();
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
    audio.addEventListener('playing',function(){started=true;stopped=false;setState(true)});
    audio.addEventListener('play',function(){started=true;stopped=false;setState(true)});
    audio.addEventListener('pause',function(){setState(false)});
    audio.addEventListener('ended',function(){setState(false)});
    audio.addEventListener('error',function(){setState(false)});
    document.body.appendChild(audio);
    return audio;
  }
  function ensureButton(){
    removeLegacy();
    installCss();
    button=document.getElementById('miniAppAudioButton');
    if(!button){button=document.createElement('button');button.id='miniAppAudioButton';button.type='button';document.body.appendChild(button)}
    setState(playing);
    if(button.dataset.bound==='1')return;
    button.dataset.bound='1';
    ['pointerdown','touchstart','mousedown','click'].forEach(function(name){button.addEventListener(name,block,{capture:true,passive:false})});
    ['pointerup','touchend','mouseup'].forEach(function(name){button.addEventListener(name,function(ev){block(ev);var now=Date.now();if(now-lastTap<320)return;lastTap=now;toggle()}, {capture:true,passive:false})});
  }
  function sourceUrl(){
    var url=String(config&&config.url||'');
    var version=String(config&&config.version||'');
    return version?url+(url.indexOf('?')>-1?'&':'?')+'av='+encodeURIComponent(version):url;
  }
  function setSource(){
    if(!config||!config.url)return false;
    var player=ensureAudio();
    var url=sourceUrl();
    if(currentUrl!==url){currentUrl=url;player.src=url;player.load();started=false;stopped=false;setState(false)}
    return true;
  }
  function play(){
    if(!config||!config.enabled||!config.hasAudio||!config.url)return;
    ensureButton();
    if(!setSource())return;
    var p=audio.play();
    if(p&&p.then)p.then(function(){started=true;stopped=false;setState(true)}).catch(function(){setState(false)});
  }
  function stop(){
    stopped=true;
    if(audio){audio.pause();try{audio.currentTime=0}catch(e){}}
    setState(false);
  }
  function toggle(){if(playing)stop();else{stopped=false;play()}}
  function apply(info){
    config=info;
    removeLegacy();
    if(!info||!info.hasAudio||!info.enabled||!info.url){if(button)button.remove();button=null;if(audio){audio.pause();audio.removeAttribute('src');audio.load()}currentUrl='';return}
    ensureButton();
    setSource();
    if(started&&!stopped)play();
  }
  function load(){fetch('/app/api/miniapp-audio',{cache:'no-store'}).then(function(r){return r.json()}).then(apply).catch(function(){})}
  window.VexaMiniappAudio={reload:load,play:function(){stopped=false;play()},stop:stop};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
  setInterval(load,15000);
  setInterval(function(){if(config&&config.enabled&&config.hasAudio){removeLegacy();ensureButton()}},1000);
})();
`;
