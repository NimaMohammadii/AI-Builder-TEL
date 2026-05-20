export const CRASH_BREAK_FX_SCRIPT = `
(function(){
  var audioCtx=null, master=null, musicGain=null, musicNodes=[], musicOn=false, lastState='idle', crashedLock=false, unlocked=false, lastStartKey='';
  function q(id){return document.getElementById(id)}
  function active(){var c=q('crash');return !!(c&&c.classList.contains('active'))}
  function getAudio(){
    var C=window.AudioContext||window.webkitAudioContext;if(!C)return null;
    if(!audioCtx){audioCtx=new C();master=audioCtx.createGain();master.gain.value=.48;master.connect(audioCtx.destination)}
    if(audioCtx.state==='suspended')audioCtx.resume().catch(function(){});
    return audioCtx;
  }
  function ensureUnlocked(){var ctx=getAudio();if(ctx)unlocked=true;return ctx}
  function stopMusic(){
    if(!musicOn)return;
    musicOn=false;
    var ctx=audioCtx;
    if(musicGain&&ctx){try{musicGain.gain.cancelScheduledValues(ctx.currentTime);musicGain.gain.setTargetAtTime(0,ctx.currentTime,.045)}catch(e){}}
    musicNodes.forEach(function(n){try{n.stop((ctx?ctx.currentTime:0)+.18)}catch(e){} try{n.disconnect()}catch(e){}});
    musicNodes=[];
  }
  function startSound(){
    var ctx=ensureUnlocked();if(!ctx||!master)return;
    var now=ctx.currentTime;
    var g=ctx.createGain();g.gain.setValueAtTime(.001,now);g.gain.linearRampToValueAtTime(.13,now+.035);g.gain.exponentialRampToValueAtTime(.001,now+.42);g.connect(master);
    [220,330,440].forEach(function(f,i){
      var osc=ctx.createOscillator();osc.type=i===0?'sine':'triangle';osc.frequency.setValueAtTime(f,now+i*.035);osc.frequency.exponentialRampToValueAtTime(f*1.55,now+.26+i*.025);osc.connect(g);osc.start(now+i*.035);osc.stop(now+.45+i*.025);
    });
    burst(ctx,.03,.045,.055);
  }
  function startMusic(){
    if(musicOn||!active())return;
    var ctx=ensureUnlocked();if(!ctx||!master)return;
    musicOn=true;
    musicGain=ctx.createGain();musicGain.gain.setValueAtTime(0,ctx.currentTime);musicGain.gain.linearRampToValueAtTime(.115,ctx.currentTime+.32);musicGain.connect(master);
    var filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=720;filter.Q.value=.72;filter.connect(musicGain);
    var freqs=[55,82.41,110];
    freqs.forEach(function(f,idx){
      var osc=ctx.createOscillator();osc.type=idx===0?'sine':'triangle';osc.frequency.value=f;
      var g=ctx.createGain();g.gain.value=idx===0?.30:.082;
      var pan=ctx.createStereoPanner?ctx.createStereoPanner():null;if(pan)pan.pan.value=idx===1?-.22:(idx===2?.22:0);
      osc.connect(g);if(pan){g.connect(pan);pan.connect(filter);musicNodes.push(pan)}else g.connect(filter);
      osc.start();musicNodes.push(osc,g);
    });
    var pulse=function(){
      if(!musicOn||!audioCtx||!musicGain)return;
      var t=audioCtx.currentTime;
      try{musicGain.gain.cancelScheduledValues(t);musicGain.gain.setValueAtTime(.078,t);musicGain.gain.linearRampToValueAtTime(.13,t+.16);musicGain.gain.linearRampToValueAtTime(.086,t+.72)}catch(e){}
    };
    pulse();
    var int=setInterval(function(){if(!musicOn){clearInterval(int);return}pulse()},760);musicNodes.push({stop:function(){clearInterval(int)},disconnect:function(){}});
  }
  function burst(ctx,delay,dur,baseGain){
    var buffer=ctx.createBuffer(1,Math.max(1,Math.floor(ctx.sampleRate*dur)),ctx.sampleRate),data=buffer.getChannelData(0);
    for(var i=0;i<data.length;i++){var t=i/data.length;data[i]=(Math.random()*2-1)*Math.pow(1-t,2.8)}
    var src=ctx.createBufferSource();src.buffer=buffer;
    var filter=ctx.createBiquadFilter();filter.type='bandpass';filter.frequency.value=900+Math.random()*1600;filter.Q.value=2.8;
    var gain=ctx.createGain();gain.gain.setValueAtTime(baseGain,ctx.currentTime+delay);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+delay+dur);
    src.connect(filter);filter.connect(gain);gain.connect(master||ctx.destination);src.start(ctx.currentTime+delay);
  }
  function crackSound(){
    var ctx=ensureUnlocked();if(!ctx)return;
    burst(ctx,0,.09,.22);burst(ctx,.035,.07,.145);burst(ctx,.075,.045,.095);
    for(var i=0;i<3;i++){
      var osc=ctx.createOscillator(),g=ctx.createGain();
      osc.type='triangle';osc.frequency.setValueAtTime(180+i*55,ctx.currentTime+i*.018);osc.frequency.exponentialRampToValueAtTime(46+i*12,ctx.currentTime+.16+i*.018);
      g.gain.setValueAtTime(.055,ctx.currentTime+i*.018);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.19+i*.018);
      osc.connect(g);g.connect(master||ctx.destination);osc.start(ctx.currentTime+i*.018);osc.stop(ctx.currentTime+.22+i*.018);
    }
  }
  function triggerBreak(){
    var n=q('crashMultiplier');if(!n)return;
    n.setAttribute('data-crash-text',n.textContent||'');
    n.classList.remove('crash-broken');void n.offsetWidth;n.classList.add('crash-broken');
    crackSound();
  }
  function state(){
    if(!active())return 'inactive';
    var label=q('crashNextRound'),txt=String((label&&label.textContent)||'');
    if(/Crashed/i.test(txt))return 'crashed';
    if(/Round starts/i.test(txt))return 'waiting';
    return 'running';
  }
  function roundKey(){var n=q('crashMultiplier');return String((n&&n.textContent)||'')+'|'+String(Date.now()).slice(0,-3)}
  function sync(){
    var s=state(),n=q('crashMultiplier');
    if(s==='inactive'){stopMusic();lastState='inactive';crashedLock=false;return}
    if(s==='running'){
      crashedLock=false;
      if(n)n.classList.remove('crash-broken');
      if(lastState!=='running'){
        var key=roundKey();
        if(key!==lastStartKey){lastStartKey=key;startSound()}
      }
      startMusic();
    }else stopMusic();
    if(s==='crashed'&&!crashedLock){crashedLock=true;triggerBreak()}
    if(s==='waiting'&&lastState==='crashed'){crashedLock=true}
    if(s==='waiting'&&n)n.classList.remove('crash-broken');
    lastState=s;
  }
  document.addEventListener('pointerdown',function(){ensureUnlocked();setTimeout(sync,60)},true);
  document.addEventListener('click',function(){ensureUnlocked();setTimeout(sync,60)},true);
  setInterval(sync,120);
})();
`;
