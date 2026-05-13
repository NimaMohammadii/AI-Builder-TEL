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

  function speakerOnIcon(){return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4.5 9.2v5.6c0 .72.48 1.2 1.2 1.2h3.05l4.28 3.35c.82.64 2.02.06 2.02-.98V5.63c0-1.04-1.2-1.62-2.02-.98L8.75 8H5.7c-.72 0-1.2.48-1.2 1.2z" fill="currentColor"/><path d="M17.4 8.15c1.05.9 1.7 2.22 1.7 3.85s-.65 2.95-1.7 3.85" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><path d="M19.7 5.7c1.75 1.55 2.8 3.7 2.8 6.3s-1.05 4.75-2.8 6.3" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" opacity=".72"/></svg>'}
  function speakerOffIcon(){return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4.5 9.2v5.6c0 .72.48 1.2 1.2 1.2h3.05l4.28 3.35c.82.64 2.02.06 2.02-.98V5.63c0-1.04-1.2-1.62-2.02-.98L8.75 8H5.7c-.72 0-1.2.48-1.2 1.2z" fill="currentColor"/><path d="M18.3 9.2l3.2 3.2M21.5 9.2l-3.2 3.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".9"/></svg>'}
  function block(ev){if(!ev)return;ev.preventDefault();ev.stopPropagation();if(ev.stopImmediatePropagation)ev.stopImmediatePropagation()}
  function removeLegacy(){document.querySelectorAll('#miniAppAudioBox').forEach(function(n){n.remove()})}
  function installCss(){
    var old=document.getElementById('miniAppAudioStyles');
    if(old)old.remove();
    var style=document.createElement('style');
    style.id='miniAppAudioStyles';
    style.textContent='#miniAppAudioBox{display:none!important;visibility:hidden!important;pointer-events:none!important}#miniAppAudioButton{position:fixed!important;right:17px!important;top:calc(94px + env(safe-area-inset-top))!important;z-index:2147483647!important;width:34px!important;height:34px!important;border:1px solid rgba(255,255,255,.16)!important;border-radius:999px!important;background:rgba(255,255,255,.04)!important;color:#fff!important;display:grid!important;place-items:center!important;padding:0!important;margin:0!important;box-shadow:0 9px 22px rgba(0,0,0,.16),inset 0 1px 0 rgba(255,255,255,.16),inset 0 -1px 0 rgba(255,255,255,.04)!important;backdrop-filter:blur(2px) saturate(1.05)!important;-webkit-backdrop-filter:blur(2px) saturate(1.05)!important;touch-action:none!important;-webkit-tap-highlight-color:transparent!important;pointer-events:auto!important;user-select:none!important;appearance:none!important;-webkit-appearance:none!important;outline:0!important;overflow:hidden!important;font-size:0!important;line-height:0!important}#miniAppAudioButton:before{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(145deg,rgba(255,255,255,.10),rgba(255,255,255,.014) 58%,rgba(255,255,255,.044));pointer-events:none}#miniAppAudioButton:after{content:"";position:absolute;inset:1px;border-radius:inherit;border:1px solid rgba(255,255,255,.045);pointer-events:none}#miniAppAudioButton svg{position:absolute!important;left:50%!important;top:50%!important;z-index:1;width:17px!important;height:17px!important;display:block!important;color:#fff!important;fill:currentColor!important;filter:drop-shadow(0 1px 4px rgba(0,0,0,.30));pointer-events:none!important;transform:translate(-50%,-50%)!important}#miniAppAudioButton.is-playing{background:rgba(255,255,255,.05)!important;border-color:rgba(255,255,255,.20)!important}';
    document.head.appendChild(style);
  }
  function setState(on){
    playing=!!on;
    if(!button)return;
    button.classList.toggle('is-playing',playing);
    button.setAttribute('aria-label',playing?'Turn music off':'Turn music on');
    button.innerHTML=playing?speakerOnIcon():speakerOffIcon();
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
