export const PLINKO_DROP_FEEDBACK_SCRIPT = `
(function(){
  var audioCtx=null;
  var lastSoundAt=0;
  function dropButtonFromEvent(ev){return ev&&ev.target&&ev.target.closest?ev.target.closest('[data-action="drop-plinko-ball"]'):null}
  function primeAudio(){var Ctor=window.AudioContext||window.webkitAudioContext;if(!Ctor)return null;if(!audioCtx)audioCtx=new Ctor();if(audioCtx&&audioCtx.resume)audioCtx.resume().catch(function(){});return audioCtx}
  function playDropSound(){var nowMs=performance.now();if(nowMs-lastSoundAt<140)return;lastSoundAt=nowMs;try{var ctx=primeAudio();if(!ctx||ctx.state==='suspended')return;var now=ctx.currentTime;var osc=ctx.createOscillator();var gain=ctx.createGain();var filter=ctx.createBiquadFilter();osc.type='sine';osc.frequency.setValueAtTime(190,now);osc.frequency.exponentialRampToValueAtTime(560,now+.045);filter.type='lowpass';filter.frequency.setValueAtTime(1500,now);filter.frequency.exponentialRampToValueAtTime(3600,now+.055);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.05,now+.012);gain.gain.exponentialRampToValueAtTime(.0001,now+.12);osc.connect(filter).connect(gain).connect(ctx.destination);osc.start(now);osc.stop(now+.13)}catch(e){}}
  function animateDrop(btn){if(!btn)return;btn.classList.remove('plinko-drop-tap');void btn.offsetWidth;btn.classList.add('plinko-drop-tap');clearTimeout(btn.__plinkoDropTapTimer);btn.__plinkoDropTapTimer=setTimeout(function(){btn.classList.remove('plinko-drop-tap')},280)}
  document.addEventListener('pointerdown',function(ev){var btn=dropButtonFromEvent(ev);if(!btn)return;animateDrop(btn);if(!btn.disabled)playDropSound()},{capture:true,passive:true});
  document.addEventListener('keydown',function(ev){if(ev.key!=='Enter'&&ev.key!==' ')return;var btn=dropButtonFromEvent(ev);if(!btn)return;animateDrop(btn);if(!btn.disabled)playDropSound()},true);
})();
`;