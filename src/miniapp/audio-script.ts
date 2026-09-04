import { LEVEL_SYNC_SCRIPT } from './level-sync-script';

export const MINIAPP_AUDIO_MANAGER_SCRIPT = `
(function(){
  var states={};
  var AudioContextCtor=window.AudioContext||window.webkitAudioContext;
  var audioContext=null;
  function cleanTarget(value){return String(value||'').trim().toLowerCase().replace(/[^a-z0-9_-]/g,'')}
  function storageKey(target){return 'vexa:audio-meta:'+target+':v1'}
  function stateFor(raw){
    var target=cleanTarget(raw);
    if(!target)return null;
    if(!states[target])states[target]={target:target,url:'',audio:null,loading:null,source:null,gain:null,autoResume:false,playOptions:null,unlockCleanup:null,fadeFrame:0,fadeTimer:0};
    return states[target];
  }
  function context(){
    if(audioContext||!AudioContextCtor)return audioContext;
    try{audioContext=new AudioContextCtor()}catch(e){audioContext=null}
    return audioContext
  }
  function clearUnlock(state){
    if(!state||typeof state.unlockCleanup!=='function')return;
    try{state.unlockCleanup()}catch(e){}
    state.unlockCleanup=null;
  }
  function clearFade(state){
    if(!state)return;
    if(state.fadeFrame){try{cancelAnimationFrame(state.fadeFrame)}catch(e){}state.fadeFrame=0}
    if(state.fadeTimer){clearTimeout(state.fadeTimer);state.fadeTimer=0}
  }
  function disconnectGraph(state){
    if(!state)return;
    try{if(state.source)state.source.disconnect()}catch(e){}
    try{if(state.gain)state.gain.disconnect()}catch(e){}
    state.source=null;
    state.gain=null;
  }
  function ensureGain(state){
    if(!state||!state.audio)return null;
    if(state.gain)return state.gain;
    var ctx=context();
    if(!ctx||typeof ctx.createMediaElementSource!=='function'||typeof ctx.createGain!=='function')return null;
    try{
      var source=ctx.createMediaElementSource(state.audio);
      var gain=ctx.createGain();
      gain.gain.value=1;
      source.connect(gain);
      gain.connect(ctx.destination);
      state.source=source;
      state.gain=gain;
      return gain
    }catch(e){return null}
  }
  function resumeContext(){
    var ctx=context();
    if(!ctx||ctx.state!=='suspended'||typeof ctx.resume!=='function')return Promise.resolve(true);
    try{return Promise.resolve(ctx.resume()).then(function(){return true},function(){return false})}catch(e){return Promise.resolve(false)}
  }
  function startState(state,options){
    if(!state||!state.audio)return Promise.resolve(false);
    options=options||{};
    clearFade(state);
    state.playOptions=options;
    var audio=state.audio;
    try{audio.loop=options.loop===true;audio.muted=false;if(options.restart!==false)audio.currentTime=0;audio.volume=1}catch(e){}
    var gain=options.gain!==false?ensureGain(state):null;
    if(gain){
      try{var ctx=context(),now=ctx?ctx.currentTime:0;gain.gain.cancelScheduledValues(now);gain.gain.setValueAtTime(1,now)}catch(e){try{gain.gain.value=1}catch(_e){}}
    }
    resumeContext();
    var result;
    try{result=audio.play()}catch(e){if(options.retryOnGesture!==false)installUnlock(state);return Promise.resolve(false)}
    if(result&&typeof result.then==='function')return result.then(function(){clearUnlock(state);return true}).catch(function(){if(options.retryOnGesture!==false)installUnlock(state);return false});
    return Promise.resolve(!audio.paused)
  }
  function installUnlock(state){
    if(!state||state.unlockCleanup||!state.autoResume)return;
    var events=['pointerdown','touchstart','keydown'];
    function resume(){
      clearUnlock(state);
      if(!state.autoResume)return;
      resumeContext().then(function(){startState(state,Object.assign({},state.playOptions||{},{retryOnGesture:false,restart:false}))})
    }
    state.unlockCleanup=function(){events.forEach(function(name){window.removeEventListener(name,resume,true)})};
    events.forEach(function(name){window.addEventListener(name,resume,true)})
  }
  function setUrl(raw,url){
    var state=stateFor(raw);url=String(url||'').trim();
    if(!state||!url)return null;
    if(state.url===url&&state.audio)return state.audio;
    clearUnlock(state);clearFade(state);
    try{if(state.audio){state.audio.pause();state.audio.src=''}}catch(e){}
    disconnectGraph(state);
    var audio=new Audio(url);
    audio.preload='auto';
    audio.volume=1;
    try{audio.setAttribute('playsinline','')}catch(e){}
    state.url=url;
    state.audio=audio;
    try{audio.load()}catch(e){}
    return audio;
  }
  function rememberUrl(state,url,version){
    try{localStorage.setItem(storageKey(state.target),JSON.stringify({url:url,version:String(version||''),updatedAt:Date.now()}))}catch(e){}
  }
  function loadCached(raw){
    var state=stateFor(raw);if(!state)return null;
    try{
      var cached=JSON.parse(localStorage.getItem(storageKey(state.target))||'null');
      if(cached&&cached.url)return setUrl(state.target,cached.url);
    }catch(e){}
    return null;
  }
  async function refresh(raw){
    var state=stateFor(raw);if(!state)return null;
    try{
      var response=await fetch('/app/api/miniapp-audio?target='+encodeURIComponent(state.target),{cache:'no-store',credentials:'same-origin'});
      var data=await response.json().catch(function(){return null});
      if(!response.ok||!data||!data.hasAudio||!data.enabled||!data.url){
        try{localStorage.removeItem(storageKey(state.target))}catch(e){}
        return state.audio;
      }
      var url=String(data.url||'').trim();
      if(!url)return state.audio;
      rememberUrl(state,url,data.version);
      var audio=setUrl(state.target,url);
      if(state.autoResume&&audio)startState(state,Object.assign({},state.playOptions||{},{restart:false}));
      return audio;
    }catch(e){return state.audio}
  }
  function preload(raw){
    var state=stateFor(raw);if(!state)return Promise.resolve(null);
    if(!state.audio)loadCached(state.target);
    if(!state.loading)state.loading=refresh(state.target).finally(function(){state.loading=null});
    return state.loading
  }
  function play(raw){
    var state=stateFor(raw);if(!state)return false;
    if(!state.audio){preload(state.target);return false}
    state.autoResume=false;
    startState(state,{restart:true,retryOnGesture:false,gain:false});
    return true
  }
  function playCached(raw,options){
    var state=stateFor(raw);if(!state)return false;
    state.autoResume=true;
    state.playOptions=options||{};
    if(!state.audio)loadCached(state.target);
    if(!state.audio)return false;
    startState(state,state.playOptions);
    return true
  }
  function playUrl(raw,url,options,version){
    var state=stateFor(raw);url=String(url||'').trim();if(!state||!url)return Promise.resolve(false);
    state.autoResume=true;
    state.playOptions=options||{};
    rememberUrl(state,url,version);
    var audio=setUrl(state.target,url);
    return audio?startState(state,Object.assign({},state.playOptions,{restart:false})):Promise.resolve(false)
  }
  function fadeStop(raw,ms){
    var state=stateFor(raw);if(!state)return;
    state.autoResume=false;
    clearUnlock(state);clearFade(state);
    var audio=state.audio;if(!audio)return;
    var duration=Math.max(300,Number(ms)||1200);
    var gain=state.gain;
    if(gain){
      var ctx=context();
      resumeContext();
      try{
        var now=ctx?ctx.currentTime:0;
        var current=Math.max(0,Math.min(1,Number(gain.gain.value)||1));
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(current,now);
        gain.gain.linearRampToValueAtTime(0,now+duration/1000);
        state.fadeTimer=setTimeout(function(){state.fadeTimer=0;try{audio.pause();audio.loop=false;gain.gain.value=1;audio.volume=1}catch(e){}},duration+40);
        return
      }catch(e){}
    }
    var from=Number(audio.volume);if(!isFinite(from)||from<0)from=1;
    var started=typeof performance!=='undefined'&&performance.now?performance.now():Date.now();
    function frame(now){
      var current=typeof now==='number'?now:Date.now();
      var progress=Math.max(0,Math.min(1,(current-started)/duration));
      try{audio.volume=Math.max(0,from*(1-progress))}catch(e){}
      if(progress<1){state.fadeFrame=requestAnimationFrame(frame);return}
      state.fadeFrame=0;
      try{audio.pause();audio.loop=false;audio.volume=1}catch(e){}
    }
    state.fadeFrame=requestAnimationFrame(frame)
  }
  function stop(raw){
    var state=stateFor(raw);if(!state)return;
    state.autoResume=false;
    clearUnlock(state);clearFade(state);
    if(!state.audio)return;
    try{state.audio.pause();state.audio.loop=false;state.audio.volume=1;if(state.gain)state.gain.gain.value=1}catch(e){}
  }
  function primeAudio(audio){
    if(!audio||audio.dataset&&audio.dataset.vexaPrimed==='1')return;
    try{
      var wasMuted=audio.muted;
      audio.muted=true;
      var result=audio.play();
      if(result&&typeof result.then==='function')result.then(function(){
        try{audio.pause();audio.currentTime=0;audio.muted=wasMuted;if(audio.dataset)audio.dataset.vexaPrimed='1'}catch(e){}
      }).catch(function(){try{audio.muted=wasMuted}catch(e){}});
    }catch(e){}
  }
  function primeLoaded(){Object.keys(states).forEach(function(key){primeAudio(states[key]&&states[key].audio)})}
  function bind(){
    preload('wallet-credit');
    document.addEventListener('pointerdown',primeLoaded,{capture:true,once:true,passive:true});
  }
  window.VexaAudio={preload:preload,play:play,refresh:refresh,playCached:playCached,playUrl:playUrl,fadeStop:fadeStop,stop:stop};
  try{window.dispatchEvent(new CustomEvent('vexa:audio-ready'))}catch(e){}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
`;

export const MINIAPP_AUDIO_SCRIPT = LEVEL_SYNC_SCRIPT;
