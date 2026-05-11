export const MINIAPP_AUDIO_SCRIPT = `
(function(){
  var audio=null;
  var box=null;
  var playBtn=null;
  var stopBtn=null;
  var currentUrl='';
  function styleButton(btn){
    btn.style.cssText='height:30px;padding:0 12px;border:0;border-radius:999px;background:rgba(255,255,255,.12);color:#fff;font-size:12px;font-weight:850;letter-spacing:-.02em;box-shadow:inset 0 1px 0 rgba(255,255,255,.16)';
  }
  function setPlaying(on){
    if(playBtn)playBtn.textContent=on?'Playing':'Play';
  }
  function removePlayer(){
    if(box&&box.parentNode)box.parentNode.removeChild(box);
    if(audio&&audio.parentNode)audio.parentNode.removeChild(audio);
    audio=null;box=null;playBtn=null;stopBtn=null;currentUrl='';
  }
  function build(info){
    if(!info||!info.hasAudio||!info.enabled||!info.url){removePlayer();return;}
    var url=String(info.url);
    if(!audio){
      audio=document.createElement('audio');
      audio.id='miniAppAudioPlayer';
      audio.loop=true;
      audio.preload='auto';
      audio.setAttribute('playsinline','true');
      audio.setAttribute('webkit-playsinline','true');
      document.body.appendChild(audio);
      audio.addEventListener('playing',function(){setPlaying(true)});
      audio.addEventListener('pause',function(){setPlaying(false)});
      audio.addEventListener('ended',function(){setPlaying(false)});
    }
    if(currentUrl!==url){currentUrl=url;audio.src=url;audio.load();setPlaying(false)}
    if(!box){
      box=document.createElement('div');
      box.id='miniAppAudioBox';
      box.style.cssText='position:fixed;right:14px;bottom:92px;z-index:90;display:flex;gap:7px;padding:7px;border-radius:999px;background:rgba(255,255,255,.055);box-shadow:0 18px 38px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.16);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)';
      playBtn=document.createElement('button');
      stopBtn=document.createElement('button');
      playBtn.type='button';stopBtn.type='button';
      playBtn.textContent='Play';stopBtn.textContent='Stop';
      styleButton(playBtn);styleButton(stopBtn);
      playBtn.onclick=function(ev){ev.preventDefault();ev.stopPropagation();if(!audio)return;if(audio.paused){audio.play().catch(function(){setPlaying(false)})}else{audio.pause()}};
      stopBtn.onclick=function(ev){ev.preventDefault();ev.stopPropagation();if(!audio)return;audio.pause();audio.currentTime=0;setPlaying(false)};
      box.appendChild(playBtn);box.appendChild(stopBtn);
      document.body.appendChild(box);
    }
  }
  function load(){fetch('/app/api/miniapp-audio',{cache:'no-store'}).then(function(r){return r.json()}).then(build).catch(function(){})}
  window.VexaMiniappAudio={reload:load,stop:function(){if(audio){audio.pause();audio.currentTime=0;setPlaying(false)}}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
  setInterval(load,15000);
})();
`;
