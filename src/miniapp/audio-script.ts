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

  function playIcon(){return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8.2 5.7v12.6c0 .95 1.08 1.52 1.88.98l9.66-6.28c.76-.49.76-1.61 0-2.1L10.08 4.72c-.8-.53-1.88.04-1.88.98z"/></svg>'}
  function stopIcon(){return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6.8 6.8h10.4v10.4H6.8z"/></svg>'}
  function block(ev){if(!ev)return;ev.preventDefault();ev.stopPropagation();if(ev.stopImmediatePropagation)ev.stopImmediatePropagation()}
  function removeLegacy(){document.querySelectorAll('#miniAppAudioBox').forEach(function(n){n.remove()})}
  function installCss(){
    var old=document.getElementById('miniAppAudioStyles');
    if(old)old.remove();
    var style=document.createElement('style');
    style.id='miniAppAudioStyles';
    style.textContent='#miniAppAudioBox{display:none!important;visibility:hidden!important;pointer-events:none!important}#miniAppAudioButton{position:fixed!important;right:18px!important;bottom:calc(178px + env(safe-area-inset-bottom))!important;z-index:2147483647!important;width:56px!important;height:56px!important;border:1px solid rgba(255,255,255,.24)!important;border-radius:999px!important;background:rgba(255,255,255,.022)!important;color:#fff!important;display:grid!important;place-items:center!important;padding:0!important;margin:0!important;box-shadow:0 18px 38px rgba(0,0,0,.20),inset 0 1px 0 rgba(255,255,255,.22),inset 0 -1px 0 rgba(255,255,255,.06)!important;backdrop-filter:blur(3px) saturate(1.22)!important;-webkit-backdrop-filter:blur(3px) saturate(1.22)!important;touch-action:none!important;-webkit-tap-highlight-color:transparent!important;pointer-events:auto!important;user-select:none!important;appearance:none!important;-webkit-appearance:none!important;outline:0!important;overflow:hidden!important;font-size:0!important;line-height:0!important}#miniAppAudioButton:before{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(145deg,rgba(255,255,255,.13),rgba(255,255,255,.018) 58%,rgba(255,255,255,.055));pointer-events:none}#miniAppAudioButton svg{position:absolute!important;left:50%!important;top:50%!important;z-index:1;width:31px!important;height:31px!important;display:block!important;fill:currentColor!important;filter:drop-shadow(0 2px 8px rgba(0,0,0,.38));pointer-events:none!important;transform:translate(-50%,-50%)!important}#miniAppAudioButton:not(.is-playing) svg{transform:translate(calc(-50% + 1.5px),-50%)!important}#miniAppAudioButton.is-playing{background:rgba(255,255,255,.03)!important;border-color:rgba(255,255,255,.32)!important}';
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
