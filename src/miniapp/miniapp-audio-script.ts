export const MINIAPP_AUDIO_SCRIPT = `
(function(){
  var audio=null;
  var box=null;
  function removePlayer(){
    if(box&&box.parentNode)box.parentNode.removeChild(box);
    if(audio&&audio.parentNode)audio.parentNode.removeChild(audio);
    box=null;
    audio=null;
  }
  function button(text){
    var b=document.createElement('button');
    b.type='button';
    b.textContent=text;
    b.style.cssText='height:30px;padding:0 12px;border:0;border-radius:999px;background:rgba(255,255,255,.11);color:#fff;font-size:12px;font-weight:850;letter-spacing:-.02em;box-shadow:inset 0 1px 0 rgba(255,255,255,.14)';
    return b;
  }
  function build(info){
    removePlayer();
    if(!info||!info.enabled||!info.url)return;
    audio=document.createElement('audio');
    audio.id='miniAppAudioPlayer';
    audio.src=info.url;
    audio.loop=true;
    audio.preload='auto';
    audio.setAttribute('playsinline','');
    box=document.createElement('div');
    box.id='miniAppAudioBox';
    box.style.cssText='position:fixed;right:14px;bottom:92px;z-index:80;display:flex;gap:7px;padding:7px;border-radius:999px;background:rgba(255,255,255,.055);box-shadow:0 18px 38px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.16);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)';
    var play=button('Play');
    var stop=button('Stop');
    play.onclick=function(){audio.play().catch(function(){})};
    stop.onclick=function(){audio.pause();audio.currentTime=0};
    box.appendChild(play);
    box.appendChild(stop);
    document.body.appendChild(audio);
    document.body.appendChild(box);
  }
  function load(){
    fetch('/app/api/miniapp-audio',{cache:'no-store'})
      .then(function(r){return r.json()})
      .then(build)
      .catch(function(){});
  }
  window.VexaMiniappAudio={reload:load,stop:function(){if(audio){audio.pause();audio.currentTime=0}}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
})();
`;
