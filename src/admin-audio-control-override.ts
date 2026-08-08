export const ADMIN_AUDIO_CONTROL_OVERRIDE_SCRIPT = `<script>
(function(){
  function playSvg(){return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 6.2v11.6c0 .9 1 1.4 1.8.9l8.9-5.8c.7-.4.7-1.5 0-1.9l-8.9-5.8c-.8-.5-1.8 0-1.8.9z"/></svg>'}
  function stopSvg(){return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.25 7.25h9.5v9.5h-9.5z"/></svg>'}
  function apply(){
    var play=document.getElementById('playMiniAudio');
    var stop=document.getElementById('stopMiniAudio');
    if(play&&play.getAttribute('data-vexa-audio-icon')!=='1'){play.innerHTML=playSvg();play.setAttribute('aria-label','Play in mini app');play.setAttribute('data-vexa-audio-icon','1')}
    if(stop&&stop.getAttribute('data-vexa-audio-icon')!=='1'){stop.innerHTML=stopSvg();stop.setAttribute('aria-label','Stop in mini app');stop.setAttribute('data-vexa-audio-icon','1')}
    if(document.getElementById('adminAudioIconOverride'))return;
    var s=document.createElement('style');
    s.id='adminAudioIconOverride';
    s.textContent='#sectionAudio .audio-action{font-size:0!important;height:42px!important;border-radius:999px!important;background:rgba(255,255,255,.045)!important;border:1px solid rgba(255,255,255,.18)!important;color:#fff!important;display:grid!important;place-items:center!important;padding:0!important;box-shadow:0 14px 28px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.16)!important;backdrop-filter:blur(2px)!important;-webkit-backdrop-filter:blur(2px)!important}#sectionAudio .audio-action svg{width:22px;height:22px;fill:currentColor;display:block;filter:drop-shadow(0 2px 7px rgba(0,0,0,.35))}#sectionAudio .audio-action.active{background:rgba(255,255,255,.075)!important;color:#fff!important;border-color:rgba(255,255,255,.28)!important}';
    document.head.appendChild(s);
  }
  function observe(){apply();if(!window.MutationObserver||!document.body)return;var queued=false;new MutationObserver(function(){if(queued)return;queued=true;queueMicrotask(function(){queued=false;apply()})}).observe(document.body,{childList:true,subtree:true})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observe,{once:true});else observe();
})();
</script>`;
