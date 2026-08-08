export const CRASH_BREAK_FX_SCRIPT = `
(function(){
  var audioCtx=null, master=null, lastState='idle', crashedLock=false, lastStartKey='';
  function q(id){return document.getElementById(id)}
  function active(){var c=q('crash');return !!(c&&c.classList.contains('active'))}
  function getAudio(){var C=window.AudioContext||window.webkitAudioContext;if(!C)return null;if(!audioCtx){audioCtx=new C();master=audioCtx.createGain();master.gain.value=.95;master.connect(audioCtx.destination)}return audioCtx}
  function unlock(){if(!active())return null;var ctx=getAudio();if(!ctx)return null;if(ctx.state==='suspended')ctx.resume().catch(function(){});return ctx}
  function canPlay(){return !!(audioCtx&&audioCtx.state==='running')}
  function bell(freq,when,len,vol,type){var ctx=audioCtx;if(!ctx||!canPlay())return;var o=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();o.type=type||'triangle';o.frequency.setValueAtTime(freq,when);o.frequency.exponentialRampToValueAtTime(freq*.985,when+len);f.type='bandpass';f.frequency.setValueAtTime(freq*2.15,when);f.Q.value=1.65;g.gain.setValueAtTime(.001,when);g.gain.linearRampToValueAtTime(vol,when+.01);g.gain.exponentialRampToValueAtTime(.001,when+len);o.connect(f);f.connect(g);g.connect(master);o.start(when);o.stop(when+len+.035)}
  function startSound(){var ctx=unlock();if(!ctx||!canPlay())return;var t=ctx.currentTime;bell(587.33,t,.16,.18,'sine');bell(466.16,t+.06,.18,.15,'triangle');bell(293.66,t+.13,.20,.12,'sine')}
  function burst(ctx,delay,dur,gainVal){if(!canPlay())return;var b=ctx.createBuffer(1,Math.floor(ctx.sampleRate*dur),ctx.sampleRate),d=b.getChannelData(0);for(var i=0;i<d.length;i++){var t=i/d.length;d[i]=(Math.random()*2-1)*Math.pow(1-t,3)}var s=ctx.createBufferSource();s.buffer=b;var f=ctx.createBiquadFilter();f.type='bandpass';f.frequency.value=850+Math.random()*1000;var g=ctx.createGain();g.gain.setValueAtTime(gainVal,ctx.currentTime+delay);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+delay+dur);s.connect(f);f.connect(g);g.connect(master);s.start(ctx.currentTime+delay)}
  function crackSound(){var ctx=unlock();if(!ctx||!canPlay())return;burst(ctx,0,.08,.18);burst(ctx,.04,.06,.11);bell(146.83,ctx.currentTime,.20,.075,'triangle')}
  function triggerBreak(){var n=q('crashMultiplier');if(!n)return;n.setAttribute('data-crash-text',n.textContent||'');n.classList.remove('crash-broken');void n.offsetWidth;n.classList.add('crash-broken');crackSound()}
  function state(){if(!active())return 'inactive';var label=q('crashNextRound'),txt=String((label&&label.textContent)||'');if(/Crashed/i.test(txt))return 'crashed';if(/Round starts/i.test(txt))return 'waiting';return 'running'}
  function roundKey(){var n=q('crashMultiplier');return String((n&&n.textContent)||'')+'|'+String(Date.now()).slice(0,-3)}
  function sync(){var s=state(),n=q('crashMultiplier');if(s==='inactive'){lastState='inactive';crashedLock=false;return}unlock();if(s==='running'){crashedLock=false;if(n)n.classList.remove('crash-broken');if(lastState!=='running'){var k=roundKey();if(k!==lastStartKey&&canPlay()){lastStartKey=k;startSound()}}}if(s==='crashed'&&!crashedLock){crashedLock=true;triggerBreak()}if(s==='waiting'&&lastState==='crashed')crashedLock=true;if(s==='waiting'&&n)n.classList.remove('crash-broken');lastState=s}
  function unlockAndSync(){if(!active())return;unlock();sync()}
  function scheduleSync(delay){setTimeout(function(){if(!document.hidden)sync()},delay||0)}
  document.addEventListener('pointerdown',unlockAndSync,true);document.addEventListener('touchstart',unlockAndSync,true);document.addEventListener('click',unlockAndSync,true);
  window.addEventListener('vexa-round-ended',function(){scheduleSync(0)});
  window.addEventListener('vexa-crash-visible',function(){scheduleSync(0)});
  document.addEventListener('visibilitychange',function(){if(!document.hidden)scheduleSync(0)});
  if(window.MutationObserver){var label=q('crashNextRound');if(label)new MutationObserver(function(){sync()}).observe(label,{childList:true,characterData:true,subtree:true})}
  scheduleSync(0);
})();
`;
