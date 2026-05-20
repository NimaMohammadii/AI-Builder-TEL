export const CRASH_BREAK_FX_SCRIPT = `
(function(){
  var audioCtx=null, master=null, musicGain=null, musicFilter=null, musicNodes=[], musicOn=false, lastState='idle', crashedLock=false, unlocked=false, lastStartKey='';
  function q(id){return document.getElementById(id)}
  function active(){var c=q('crash');return !!(c&&c.classList.contains('active'))}
  function getAudio(){
    var C=window.AudioContext||window.webkitAudioContext;if(!C)return null;
    if(!audioCtx){audioCtx=new C();master=audioCtx.createGain();master.gain.value=.38;master.connect(audioCtx.destination)}
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
    if(musicGain&&ctx){try{musicGain.gain.cancelScheduledValues(ctx.currentTime);musicGain.gain.setTargetAtTime(0,ctx.currentTime,.07)}catch(e){}}
    musicNodes.forEach(function(n){try{n.stop((ctx?ctx.currentTime:0)+.22)}catch(e){} try{n.disconnect()}catch(e){}});
    musicNodes=[];musicFilter=null;
  }
  function startSound(){
    var ctx=ensureUnlocked();if(!ctx||!master||!canPlay())return;
    var now=ctx.currentTime;
    var g=ctx.createGain();g.gain.setValueAtTime(.001,now);g.gain.linearRampToValueAtTime(.095,now+.04);g.gain.exponentialRampToValueAtTime(.001,now+.36);g.connect(master);
    [196,261.63,329.63].forEach(function(f,i){
      var osc=ctx.createOscillator();osc.type='sine';osc.frequency.setValueAtTime(f,now+i*.035);osc.frequency.exponentialRampToValueAtTime(f*1.25,now+.23+i*.025);osc.connect(g);osc.start(now+i*.035);osc.stop(now+.38+i*.025);
    });
  }
  function startMusic(){
    if(musicOn||!active())return;
    var ctx=ensureUnlocked();if(!ctx||!master||!canPlay())return;
    musicOn=true;
    musicGain=ctx.createGain();musicGain.gain.setValueAtTime(0,ctx.currentTime);musicGain.gain.linearRampToValueAtTime(.105,ctx.currentTime+.45);musicGain.connect(master);
    musicFilter=ctx.createBiquadFilter();musicFilter.type='lowpass';musicFilter.frequency.value=520;musicFilter.Q.value=.45;musicFilter.connect(musicGain);
    var pad=ctx.createGain();pad.gain.value=.72;pad.connect(musicFilter);
    var freqs=[49,73.42,98];
    freqs.forEach(function(f,idx){
      var osc=ctx.createOscillator();osc.type=idx===0?'sine':'triangle';osc.frequency.value=f;
      var g=ctx.createGain();g.gain.value=idx===0?.30:.055;
      var pan=ctx.createStereoPanner?ctx.createStereoPanner():null;if(pan)pan.pan.value=idx===1?-.18:(idx===2?.18:0);
      osc.connect(g);if(pan){g.connect(pan);pan.connect(pad);musicNodes.push(pan)}else g.connect(pad);
      osc.start();musicNodes.push(osc,g);
    });
    musicNodes.push(pad);
    var pulse=function(){
      if(!musicOn||!audioCtx||!musicGain)return;
      var t=audioCtx.currentTime;
      try{
        musicGain.gain.cancelScheduledValues(t);
        musicGain.gain.setValueAtTime(.078,t);
        musicGain.gain.linearRampToValueAtTime(.112,t+.22);
        musicGain.gain.linearRampToValueAtTime(.082,t+.86);
        if(musicFilter){musicFilter.frequency.cancelScheduledValues(t);musicFilter.frequency.setValueAtTime(460,t);musicFilter.frequency.linearRampToValueAtTime(620,t+.35);musicFilter.frequency.linearRampToValueAtTime(500,t+.92)}
      }catch(e){}
    };
    pulse();
    var int=setInterval(function(){if(!musicOn){clearInterval(int);return}pulse()},920);musicNodes.push({stop:function(){clearInterval(int)},disconnect:function(){}});
  }
  function burst(ctx,delay,dur,baseGain){
    if(!canPlay())return;
    var buffer=ctx.createBuffer(1,Math.max(1,Math.floor(ctx.sampleRate*dur)),ctx.sampleRate),data=buffer.getChannelData(0);
    for(var i=0;i<data.length;i++){var t=i/data.length;data[i]=(Math.random()*2-1)*Math.pow(1-t,3.2)}
    var src=ctx.createBufferSource();src.buffer=buffer;
    var filter=ctx.createBiquadFilter();filter.type='bandpass';filter.frequency.value=650+Math.random()*900;filter.Q.value=2.1;
    var gain=ctx.createGain();gain.gain.setValueAtTime(baseGain,ctx.currentTime+delay);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+delay+dur);
    src.connect(filter);filter.connect(gain);gain.connect(master||ctx.destination);src.start(ctx.currentTime+delay);
  }
  function crackSound(){
    var ctx=ensureUnlocked();if(!ctx||!canPlay())return;
    burst(ctx,0,.09,.16);burst(ctx,.04,.065,.10);burst(ctx,.085,.04,.065);
    for(var i=0;i<2;i++){
      var osc=ctx.createOscillator(),g=ctx.createGain();
      osc.type='triangle';osc.frequency.setValueAtTime(135+i*40,ctx.currentTime+i*.018);osc.frequency.exponentialRampToValueAtTime(42+i*10,ctx.currentTime+.15+i*.018);
      g.gain.setValueAtTime(.045,ctx.currentTime+i*.018);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.18+i*.018);
      osc.connect(g);g.connect(master||ctx.destination);osc.start(ctx.currentTime+i*.018);osc.stop(ctx.currentTime+.2+i*.018);
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
  setInterval(sync,180);
})();
`;
