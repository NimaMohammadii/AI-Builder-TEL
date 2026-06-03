export const SLOT_SCRIPT = `
(function(){
  var symbols = ['🍒', '🍋', '🍇', '🍉', '🍊', '⭐', '💎', '7️⃣'];
  var reelCount = 3;
  var symbolHeight = 92;
  var spinning = false;
  var currentIndexes = [0, 1, 2];
  var slotSound = null;

  function q(id){
    return document.getElementById(id);
  }

  function setBrand(title){
    var brand = q('brandTitle');
    if(brand) brand.textContent = title;
  }

  function startSlotSound(){
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    if(!AudioContext) return;

    stopSlotSound();

    var context = new AudioContext();
    var master = context.createGain();
    var motor = context.createOscillator();
    var pulse = context.createOscillator();
    var filter = context.createBiquadFilter();
    var now = context.currentTime;

    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.055, now + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(980, now);
    filter.frequency.exponentialRampToValueAtTime(360, now + 4.8);

    motor.type = 'sawtooth';
    motor.frequency.setValueAtTime(96, now);
    motor.frequency.exponentialRampToValueAtTime(42, now + 4.8);

    pulse.type = 'square';
    pulse.frequency.setValueAtTime(18, now);
    pulse.frequency.exponentialRampToValueAtTime(7, now + 4.8);

    motor.connect(filter);
    pulse.connect(filter);
    filter.connect(master);
    master.connect(context.destination);

    motor.start(now);
    pulse.start(now);

    slotSound = {
      context: context,
      master: master,
      motor: motor,
      pulse: pulse
    };
  }

  function stopSlotSound(){
    if(!slotSound) return;

    var context = slotSound.context;
    var now = context.currentTime;

    slotSound.master.gain.cancelScheduledValues(now);
    slotSound.master.gain.setValueAtTime(Math.max(slotSound.master.gain.value, 0.0001), now);
    slotSound.master.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    try { slotSound.motor.stop(now + 0.14); } catch(e) {}
    try { slotSound.pulse.stop(now + 0.14); } catch(e) {}

    window.setTimeout(function(){
      context.close().catch(function(){});
    }, 180);

    slotSound = null;
  }

  function randomSymbolIndex(){
    if(window.crypto && window.crypto.getRandomValues){
      var values = new Uint32Array(1);
      window.crypto.getRandomValues(values);
      return values[0] % symbols.length;
    }
    return Math.floor(Math.random() * symbols.length);
  }

  function createSymbol(value){
    var cell = document.createElement('div');
    cell.className = 'slot-symbol';
    cell.textContent = value;
    return cell;
  }

  function stripNode(reelIndex){
    return document.querySelector('[data-slot-reel="' + reelIndex + '"] .slot-reel-strip');
  }

  function buildStrip(reelIndex, loops){
    var strip = stripNode(reelIndex);
    if(!strip) return;

    strip.innerHTML = '';

    var total = Math.max(18, loops * symbols.length + 6);
    var offset = reelIndex % symbols.length;

    for(var i = 0; i < total; i++){
      strip.appendChild(createSymbol(symbols[(i + offset) % symbols.length]));
    }
  }

  function setReelPosition(reelIndex, index, animate){
    var strip = stripNode(reelIndex);
    if(!strip) return;

    var y = -index * symbolHeight + symbolHeight;
    strip.style.transition = animate ? 'transform .55s cubic-bezier(.16,.9,.2,1)' : 'none';
    strip.style.transform = 'translate3d(0,' + y + 'px,0)';
  }

  function initReels(){
    for(var i = 0; i < reelCount; i++){
      buildStrip(i, 4);
      setReelPosition(i, currentIndexes[i], false);
    }
  }

  function pickResult(){
    var result = [];

    for(var i = 0; i < reelCount; i++){
      result.push(randomSymbolIndex());
    }

    return result;
  }

  function finish(result){
    var button = q('slotSpinButton');
    var box = document.querySelector('.slot-machine');
    var first = result[0];
    var matched = result.every(function(value){ return value === first; });

    spinning = false;
    stopSlotSound();

    if(button) button.disabled = false;

    if(box){
      box.classList.remove('is-spinning');
      box.classList.toggle('is-win', matched);
    }
  }

  function spin(){
    if(spinning) return;

    var button = q('slotSpinButton');
    var box = document.querySelector('.slot-machine');
    var result = pickResult();
    var pending = reelCount;

    spinning = true;
    startSlotSound();

    if(button) button.disabled = true;

    if(box){
      box.classList.remove('is-win');
      box.classList.add('is-spinning');
    }

    result.forEach(function(symbolIndex, reelIndex){
      var strip = stripNode(reelIndex);
      if(!strip) return;

      var loops = 14 + reelIndex * 2;
      var finalIndex = loops * symbols.length + symbolIndex;
      var duration = 4200 + reelIndex * 400;
      var y = -finalIndex * symbolHeight + symbolHeight;

      buildStrip(reelIndex, loops + 2);
      strip.style.transition = 'none';
      strip.style.transform = 'translate3d(0,' + symbolHeight + 'px,0)';

      requestAnimationFrame(function(){
        requestAnimationFrame(function(){
          strip.style.transition = 'transform ' + duration + 'ms cubic-bezier(.06,.74,.08,1)';
          strip.style.transform = 'translate3d(0,' + y + 'px,0)';
        });
      });

      window.setTimeout(function(){
        currentIndexes[reelIndex] = symbolIndex;
        buildStrip(reelIndex, 4);
        setReelPosition(reelIndex, symbolIndex, false);
        pending--;

        if(pending <= 0) finish(result);
      }, duration + 40);
    });
  }

  function loadSlotFrame(){
    var img = q('slotFrameImage');
    if(!img) return;

    fetch('/app/api/slot-frame', { cache: 'no-store' })
      .then(function(response){ return response.json().then(function(body){ return { ok: response.ok, body: body }; }); })
      .then(function(result){
        if(!result.ok || !result.body || !result.body.slotFrameUrl) return;
        img.onload = function(){ img.classList.add('is-loaded'); };
        img.onerror = function(){ img.classList.remove('is-loaded'); img.removeAttribute('src'); };
        img.src = result.body.slotFrameUrl;
      })
      .catch(function(){
        img.classList.remove('is-loaded');
      });
  }

  function bind(){
    initReels();
    loadSlotFrame();

    var spinButton = q('slotSpinButton');
    if(spinButton) spinButton.addEventListener('click', spin);

    document.addEventListener('click', function(ev){
      var openButton = ev.target && ev.target.closest ? ev.target.closest('[data-game-view="slot"]') : null;
      if(openButton) setBrand('Slot');
    }, true);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', bind);
  }else{
    bind();
  }
})();
`;