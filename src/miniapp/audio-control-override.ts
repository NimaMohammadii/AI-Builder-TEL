export const AUDIO_CONTROL_OVERRIDE_SCRIPT = `
(function(){
  function playSvg(){return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 6.2v11.6c0 .9 1 1.4 1.8.9l8.9-5.8c.7-.4.7-1.5 0-1.9l-8.9-5.8c-.8-.5-1.8 0-1.8.9z"/></svg>'}
  function stopSvg(){return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.25 7.25h9.5v9.5h-9.5z"/></svg>'}
  function css(){
    var old=document.getElementById('vexaAudioControlOverride');
    if(old)old.remove();
    var s=document.createElement('style');
    s.id='vexaAudioControlOverride';
    s.textContent='#miniAppAudioBox{display:none!important;visibility:hidden!important;pointer-events:none!important}#miniAppAudioButton,#vexaAudioControl{position:fixed!important;right:18px!important;bottom:calc(178px + env(safe-area-inset-bottom))!important;z-index:2147483647!important;width:54px!important;height:54px!important;border:1px solid rgba(255,255,255,.22)!important;border-radius:999px!important;background:rgba(255,255,255,.035)!important;color:#fff!important;display:grid!important;place-items:center!important;padding:0!important;box-shadow:0 14px 32px rgba(0,0,0,.20),inset 0 1px 0 rgba(255,255,255,.20)!important;backdrop-filter:blur(2px)!important;-webkit-backdrop-filter:blur(2px)!important;touch-action:none!important;-webkit-tap-highlight-color:transparent!important;pointer-events:auto!important;user-select:none!important;appearance:none!important;-webkit-appearance:none!important;outline:0!important;overflow:hidden!important;font-size:0!important}#miniAppAudioButton:before,#vexaAudioControl:before{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(135deg,rgba(255,255,255,.16),rgba(255,255,255,.025));pointer-events:none}#miniAppAudioButton svg,#vexaAudioControl svg{position:relative;z-index:1;width:25px!important;height:25px!important;display:block!important;fill:currentColor!important;filter:drop-shadow(0 2px 7px rgba(0,0,0,.38));pointer-events:none!important}#miniAppAudioButton:not(.is-playing) svg,#vexaAudioControl:not(.is-playing) svg{transform:translateX(1.5px)}#miniAppAudioButton.is-playing,#vexaAudioControl.is-playing{background:rgba(255,255,255,.045)!important;border-color:rgba(255,255,255,.28)!important}';
    document.head.appendChild(s);
  }
  function block(e){if(!e)return;e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation()}
  function set(btn,on){btn.classList.toggle('is-playing',!!on);btn.innerHTML=on?stopSvg():playSvg();btn.setAttribute('aria-label',on?'Stop music':'Play music')}
  function make(){
    if(document.hidden)return;
    css();
    document.querySelectorAll('#miniAppAudioBox').forEach(function(n){n.remove()});
    var btn=document.getElementById('miniAppAudioButton')||document.getElementById('vexaAudioControl');
    if(!btn){btn=document.createElement('button');btn.id='vexaAudioControl';btn.type='button';document.body.appendChild(btn)}
    var audio=document.getElementById('miniAppAudioPlayer');
    set(btn,audio&&!audio.paused&&!audio.ended);
    if(btn.dataset.vexaBound==='1')return;
    btn.dataset.vexaBound='1';
    ['pointerdown','touchstart','mousedown','click'].forEach(function(n){btn.addEventListener(n,block,{capture:true,passive:false})});
    ['pointerup','touchend','mouseup'].forEach(function(n){btn.addEventListener(n,function(e){block(e);var a=document.getElementById('miniAppAudioPlayer');if(a&&!a.paused){if(window.VexaMiniappAudio&&window.VexaMiniappAudio.stop)window.VexaMiniappAudio.stop();else a.pause();set(btn,false)}else{if(window.VexaMiniappAudio&&window.VexaMiniappAudio.play)window.VexaMiniappAudio.play();setTimeout(function(){var x=document.getElementById('miniAppAudioPlayer');set(btn,x&&!x.paused&&!x.ended)},350)}},{capture:true,passive:false})});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',make);else make();
  document.addEventListener('visibilitychange',function(){if(!document.hidden)make()});
  setInterval(function(){var a=document.getElementById('miniAppAudioPlayer');if(a&&!a.paused&&!a.ended)make()},5000);
})();
`;
