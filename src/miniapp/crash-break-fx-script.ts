export const CRASH_BREAK_FX_SCRIPT = `
(function(){
  var audioCtx=null, master=null, musicGain=null, musicNodes=[], musicOn=false, lastState='idle', crashedLock=false, unlocked=false, lastStartKey='';
  function q(id){return document.getElementById(id)}
  function active(){var c=q('crash');return !!(c&&c.classList.contains('active'))}
  function getAudio(){
    var C=window.AudioContext||window.webkitAudioContext;if(!C)return null;
    if(!audioCtx){audioCtx=new C();master=audioCtx.createGain();master.gain.value=.72;master.connect(audioCtx.destination)}
    return audioCtx;
  }
  function ensureUnlocked(){
    var ctx=getAudio();if(!ctx)return null;
    if(ctx.state==='suspended')ctx.resume().catch(function(){});
    unlocked=ctx.state==='running';
    return ctx;
  }
  function canPlay(){return !!(audioCtx&&audioCtx.state==='running')}
  function stopMusic(){
    if(!musicOn)return;
    musicOn=false;
    var ctx=audioCtx;
    if(musicGain&&ctx){try{musicGain.gain.cancelScheduledValues(ctx.currentTime);musicGain.gain.setTargetAtTime(0,ctx.currentTime,.035)}catch(e){}}
    musicNodes.forEach(function(n){try{n.stop((ctx?ctx.currentTime:0)+.15)}catch(e){} try{n.disconnect()}catch(e){}});
    musicNodes=[];
  }
  function startSound(){
    var ctx=ensureUnlocked();if(!ctx||!master||!canPlay())return;
    var now=ctx.currentTime;
    var g=ctx.createGain();g.gain.setValueAtTime(.001,now);g.gain.linearRampToValueAtTime(.18,now+.035);g.gain.exponentialRampToValueAtTime(.001,now+.42);g.connect(master);
    [220,330,440].forEach(function(f,i){
      var osc=ctx.createOscillator();osc.type=i===0?'sine':'triangle';osc.frequency.setValueAtTime(f,now+i*.035);osc.frequency.exponentialRampToValueAtTime(f*1.55,now+.26+i*.025);osc.connect(g);osc.start(now+i*.035);osc.stop(now+.45+i*.025);
    });
    burst(ctx,.03,.045,.075);
  }
  function startMusic(){
    if(musicOn||!active())return;
    var ctx=ensureUnlocked();if(!ctx||!master||!canPlay())return;
    musicOn=true;
    musicGain=ctx.createGain();musicGain.gain.setValueAtTime(0,ctx.currentTime);musicGain.gain.linearRampToValueAtTime(.22,ctx.currentTime+.24);musicGain.connect(master);
    var filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=1150;filter.Q.value=.82;filter.connect(musicGain);
    var freqs=[55,82.41,110,164.81];
    freqs.forEach(function(f,idx){
      var osc=ctx.createOscillator();osc.type=idx===0?'sine':(idx===3?'sawtooth':'triangle');osc.frequency.value=f;
      var g=ctx.createGain();g.gain.value=idx===0?.36:(idx===3?.026:.12);
      var pan=ctx.createStereoPanner?ctx.createStereoPanner():null;if(pan)pan.pan.value=idx===1?-.25:(idx===2?.25:0);
      osc.connect(g);if(pan){g.connect(pan);pan.connect(filter);musicNodes.push(pan)}else g.connect(filter);
      osc.start();musicNodes.push(osc,g);
    });
    var pulse=function(){
      if(!musicOn||!audioCtx||!musicGain)return;
      var t=audioCtx.currentTime;
      try{musicGain.gain.cancelScheduledValues(t);musicGain.gain.setValueAtTime(.14,t);musicGain.gain.linearRampToValueAtTime(.24,t+.13);musicGain.gain.linearRampToValueAtTime(.155,t+.58)}catch(e){}
    };
    pulse();
    var int=setInterval(function(){if(!musicOn){clearInterval(int);return}pulse()},620);musicNodes.push({stop:function(){clearInterval(int)},disconnect:function(){}});
  }
  function burst(ctx,delay,dur,baseGain){
    if(!canPlay())return;
    var buffer=ctx.createBuffer(1,Math.max(1,Math.floor(ctx.sampleRate*dur)),ctx.sampleRate),data=buffer.getChannelData(0);
    for(var i=0;i<data.length;i++){var t=i/data.length;data[i]=(Math.random()*2-1)*Math.pow(1-t,2.8)}
    var src=ctx.createBufferSource();src.buffer=buffer;
    var filter=ctx.createBiquadFilter();filter.type='bandpass';filter.frequency.value=900+Math.random()*1600;filter.Q.value=2.8;
    var gain=ctx.createGain();gain.gain.setValueAtTime(baseGain,ctx.currentTime+delay);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+delay+dur);
    src.connect(filter);filter.connect(gain);gain.connect(master||ctx.destination);src.start(ctx.currentTime+delay);
  }
  function crackSound(){
    var ctx=ensureUnlocked();if(!ctx||!canPlay())return;
    burst(ctx,0,.09,.24);burst(ctx,.035,.07,.16);burst(ctx,.075,.045,.105);
    for(var i=0;i<3;i++){
      var osc=ctx.createOscillator(),g=ctx.createGain();
      osc.type='triangle';osc.frequency.setValueAtTime(180+i*55,ctx.currentTime+i*.018);osc.frequency.exponentialRampToValueAtTime(46+i*12,ctx.currentTime+.16+i*.018);
      g.gain.setValueAtTime(.07,ctx.currentTime+i*.018);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.19+i*.018);
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
    ensureUnlocked();
    var s=state(),n=q('crashMultiplier');
    if(s==='inactive'){stopMusic();lastState='inactive';crashedLock=false;return}
    if(s==='running'){
      crashedLock=false;
      if(n)n.classList.remove('crash-broken');
      if(lastState!=='running'){
        var key=roundKey();
        if(key!==lastStartKey&&canPlay()){lastStartKey=key;startSound()}
      }
      startMusic();
    }else stopMusic();
    if(s==='crashed'&&!crashedLock){crashedLock=true;triggerBreak()}
    if(s==='waiting'&&lastState==='crashed'){crashedLock=true}
    if(s==='waiting'&&n)n.classList.remove('crash-broken');
    lastState=s;
  }
  function unlockAndSync(){var ctx=ensureUnlocked();if(ctx){setTimeout(sync,30);setTimeout(sync,180);setTimeout(sync,420)}}
  document.addEventListener('pointerdown',unlockAndSync,true);
  document.addEventListener('touchstart',unlockAndSync,true);
  document.addEventListener('click',unlockAndSync,true);
  setInterval(sync,120);
})();
`;
