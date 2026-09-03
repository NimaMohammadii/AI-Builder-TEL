import { LEVEL_SYNC_SCRIPT } from './level-sync-script';

const AUDIO_MANAGER_SCRIPT = `
(function(){
  var states={};
  function cleanTarget(value){return String(value||'').trim().toLowerCase().replace(/[^a-z0-9_-]/g,'')}
  function storageKey(target){return 'vexa:audio-meta:'+target+':v1'}
  function stateFor(raw){
    var target=cleanTarget(raw);
    if(!target)return null;
    if(!states[target])states[target]={target:target,url:'',audio:null,loading:null};
    return states[target];
  }
  function setUrl(raw,url){
    var state=stateFor(raw);url=String(url||'').trim();
    if(!state||!url)return null;
    if(state.url===url&&state.audio)return state.audio;
    try{if(state.audio){state.audio.pause();state.audio.src=''}}catch(e){}
    var audio=new Audio(url);
    audio.preload='auto';
    audio.volume=1;
    state.url=url;
    state.audio=audio;
    try{audio.load()}catch(e){}
    return audio;
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
      try{localStorage.setItem(storageKey(state.target),JSON.stringify({url:url,version:String(data.version||''),updatedAt:Date.now()}))}catch(e){}
      return setUrl(state.target,url);
    }catch(e){
      return state.audio;
    }
  }
  function preload(raw){
    var state=stateFor(raw);if(!state)return Promise.resolve(null);
    if(!state.audio)loadCached(state.target);
    if(!state.loading)state.loading=refresh(state.target).finally(function(){state.loading=null});
    return state.loading;
  }
  function play(raw){
    var state=stateFor(raw);if(!state)return false;
    if(!state.audio){preload(state.target);return false;}
    try{
      state.audio.muted=false;
      state.audio.currentTime=0;
      var result=state.audio.play();
      if(result&&typeof result.catch==='function')result.catch(function(){});
      return true;
    }catch(e){return false;}
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
  function primeLoaded(){
    Object.keys(states).forEach(function(key){primeAudio(states[key]&&states[key].audio)});
  }
  function bind(){
    preload('wallet-credit');
    document.addEventListener('pointerdown',primeLoaded,{capture:true,once:true,passive:true});
  }
  window.VexaAudio={preload:preload,play:play,refresh:refresh};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
`;

export const MINIAPP_AUDIO_SCRIPT = `${LEVEL_SYNC_SCRIPT}\n${AUDIO_MANAGER_SCRIPT}`;
