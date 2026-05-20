export const CRASH_BREAK_FX_SCRIPT = `
(function(){
  var lastBroken='', lastSoundAt=0, audioCtx=null;
  function q(id){return document.getElementById(id)}
  function active(){var c=q('crash');return !!(c&&c.classList.contains('active'))}
  function getAudio(){var C=window.AudioContext||window.webkitAudioContext;if(!C)return null;if(!audioCtx)audioCtx=new C();if(audioCtx.state==='suspended')audioCtx.resume().catch(function(){});return audioCtx}
  function burst(ctx,delay,dur,baseGain){
    var buffer=ctx.createBuffer(1,Math.max(1,Math.floor(ctx.sampleRate*dur)),ctx.sampleRate);
    var data=buffer.getChannelData(0);
    for(var i=0;i<data.length;i++){var t=i/data.length;data[i]=(Math.random()*2-1)*Math.pow(1-t,2.8)}
    var src=ctx.createBufferSource();src.buffer=buffer;
    var filter=ctx.createBiquadFilter();filter.type='bandpass';filter.frequency.value=900+Math.random()*1600;filter.Q.value=2.8;
    var gain=ctx.createGain();gain.gain.setValueAtTime(baseGain,ctx.currentTime+delay);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+delay+dur);
    src.connect(filter);filter.connect(gain);gain.connect(ctx.destination);src.start(ctx.currentTime+delay);
  }
  function crackSound(){
    var now=Date.now();if(now-lastSoundAt<900)return;lastSoundAt=now;
    var ctx=getAudio();if(!ctx)return;
    burst(ctx,0,.09,.18);burst(ctx,.035,.07,.12);burst(ctx,.075,.045,.08);
    for(var i=0;i<3;i++){
      var osc=ctx.createOscillator(),g=ctx.createGain();
      osc.type='triangle';osc.frequency.setValueAtTime(180+i*55,ctx.currentTime+i*.018);
      osc.frequency.exponentialRampToValueAtTime(46+i*12,ctx.currentTime+.16+i*.018);
      g.gain.setValueAtTime(.045,ctx.currentTime+i*.018);
      g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.19+i*.018);
      osc.connect(g);g.connect(ctx.destination);osc.start(ctx.currentTime+i*.018);osc.stop(ctx.currentTime+.22+i*.018);
    }
  }
  function trigger(){
    var n=q('crashMultiplier');if(!n)return;
    var txt=n.textContent||'';
    n.setAttribute('data-crash-text',txt);
    n.classList.remove('crash-broken');
    void n.offsetWidth;
    n.classList.add('crash-broken');
    crackSound();
  }
  function sync(){
    if(!active())return;
    var label=q('crashNextRound'),n=q('crashMultiplier');
    var crashed=label&&/Crashed/i.test(label.textContent||'');
    var key=crashed&&n?(n.textContent||'')+'|'+Date.now().toString().slice(0,-3):'';
    if(crashed&&key&&key!==lastBroken){lastBroken=key;trigger()}
    if(!crashed&&n)n.classList.remove('crash-broken')
  }
  document.addEventListener('click',function(){var ctx=getAudio();},true);
  setInterval(sync,120);
})();
`;
