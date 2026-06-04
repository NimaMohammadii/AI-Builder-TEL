export const SLOT_SCRIPT = `
(function(){
  var symbols = [
    { id: 'cherry', label: 'Cherry' },
    { id: 'lemon', label: 'Lemon' },
    { id: 'orange', label: 'Orange' },
    { id: 'grape', label: 'Grape' },
    { id: 'watermelon', label: 'Watermelon' },
    { id: 'diamond', label: 'Diamond' },
    { id: 'gold', label: 'Gold Star or Bell' },
    { id: 'lucky7', label: 'Lucky 7' }
  ];
  var reelCount = 3;
  var symbolHeight = 92;
  var restLoop = 6;
  var preparedLoops = 18;
  var maxSpinLoops = 10;
  var totalSpinMs = 7600;
  var reelStopGapMs = 800;
  var soundStopDelayMs = 1000;
  var spinning = false;
  var currentIndexes = [0, 1, 2];
  var slotSound = null;
  var slotAudioUrl = '';
  var slotAudio = null;
  var slotSoundTimer = null;
  var slotSoundStopTimer = null;

  function q(id){
    return document.getElementById(id);
  }

  function awardXP(amount, source, metadata){
    if(window.VexaLevel && typeof window.VexaLevel.add === 'function') window.VexaLevel.add(amount, source, metadata || { section: 'slot' });
  }

  function setBrand(title){
    var brand = q('brandTitle');
    if(brand) brand.textContent = title;
  }

  function prepareSlotSound(url){
    slotAudioUrl = url || '';
    slotAudio = null;

    if(!slotAudioUrl) return;

    slotAudio = new Audio(slotAudioUrl);
    slotAudio.loop = false;
    slotAudio.preload = 'auto';
    try { slotAudio.load(); } catch(e) {}
  }

  function startSlotSound(){
    if(!slotAudioUrl) return;

    stopSlotSound();

    slotSoundTimer = window.setTimeout(function(){
      var audio = slotAudio || new Audio(slotAudioUrl);
      audio.loop = false;
      audio.preload = 'auto';
      audio.currentTime = 0;
      slotSound = audio;

      audio.play().catch(function(){});
    }, 120);
  }

  function scheduleSlotSoundStop(){
    if(slotSoundStopTimer){
      window.clearTimeout(slotSoundStopTimer);
      slotSoundStopTimer = null;
    }

    slotSoundStopTimer = window.setTimeout(function(){
      stopSlotSound();
    }, soundStopDelayMs);
  }

  function stopSlotSound(){
    if(slotSoundTimer){
      window.clearTimeout(slotSoundTimer);
      slotSoundTimer = null;
    }

    if(slotSoundStopTimer){
      window.clearTimeout(slotSoundStopTimer);
      slotSoundStopTimer = null;
    }

    if(!slotSound) return;

    try {
      slotSound.pause();
      slotSound.currentTime = 0;
    } catch(e) {}

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

  function createSymbol(symbol){
    var cell = document.createElement('div');
    cell.className = symbol && symbol.imageUrl ? 'slot-symbol has-image' : 'slot-symbol';

    if(symbol && symbol.imageUrl){
      var img = document.createElement('img');
      img.className = 'slot-symbol-image';
      img.alt = symbol.label || symbol.id || 'Slot symbol';
      img.decoding = 'async';
      img.draggable = false;
      img.onerror = function(){
        cell.classList.remove('has-image');
        img.remove();
      };
      img.src = symbol.imageUrl;
      cell.appendChild(img);
    }

    return cell;
  }

  function stripNode(reelIndex){
    return document.querySelector('[data-slot-reel="' + reelIndex + '"] .slot-reel-strip');
  }

  function reelOffset(reelIndex){
    return reelIndex % symbols.length;
  }

  function stripIndexForSymbol(reelIndex, symbolIndex, loopCount){
    var offset = reelOffset(reelIndex);
    var localIndex = (symbolIndex - offset + symbols.length) % symbols.length;
    return loopCount * symbols.length + localIndex;
  }

  function symbolStep(){
    var sample = document.querySelector('.slot-symbol');
    return sample && sample.offsetHeight ? sample.offsetHeight : symbolHeight;
  }

  function stripY(index){
    var step = symbolStep();
    return -index * step + step;
  }

  function stripFragment(reelIndex, loops){
    var fragment = document.createDocumentFragment();
    var total = Math.max(18, loops * symbols.length + 6);
    var offset = reelOffset(reelIndex);

    for(var i = 0; i < total; i++){
      fragment.appendChild(createSymbol(symbols[(i + offset) % symbols.length]));
    }

    return fragment;
  }

  function buildStrip(reelIndex, loops){
    var strip = stripNode(reelIndex);
    if(!strip) return;

    strip.replaceChildren(stripFragment(reelIndex, loops));
  }

  function setReelPosition(reelIndex, symbolIndex, animate){
    var strip = stripNode(reelIndex);
    if(!strip) return;

    var index = stripIndexForSymbol(reelIndex, symbolIndex, restLoop);
    strip.style.transition = animate ? 'transform .75s linear' : 'none';
    strip.style.transform = 'translate3d(0,' + stripY(index) + 'px,0)';
  }

  function initReels(){
    for(var i = 0; i < reelCount; i++){
      buildStrip(i, preparedLoops);
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

  function isFruitSymbol(symbolId){
    return ['cherry', 'lemon', 'orange', 'grape', 'watermelon'].indexOf(symbolId) !== -1;
  }

  function isPremiumSymbol(symbolId){
    return ['diamond', 'gold', 'lucky7'].indexOf(symbolId) !== -1;
  }

  function resultCounts(result){
    var counts = {};

    result.forEach(function(symbolIndex){
      var symbol = symbols[symbolIndex];
      var symbolId = symbol && symbol.id;

      if(!symbolId) return;

      counts[symbolId] = (counts[symbolId] || 0) + 1;
    });

    return counts;
  }

  function topResultEntry(counts){
    var top = { symbolId: '', count: 0 };

    Object.keys(counts).forEach(function(symbolId){
      if(counts[symbolId] > top.count){
        top = { symbolId: symbolId, count: counts[symbolId] };
      }
    });

    return top;
  }

  function resultProfile(result){
    var entry = topResultEntry(resultCounts(result));

    if(entry.count === 3){
      if(isFruitSymbol(entry.symbolId)){
        return { tier: 'triple-fruit', multiplier: 2, xp: 30, extraTurn: false };
      }

      if(entry.symbolId === 'diamond'){
        return { tier: 'triple-diamond', multiplier: 5, xp: 80, extraTurn: false };
      }

      if(entry.symbolId === 'gold'){
        return { tier: 'triple-gold', multiplier: 20, xp: 150, extraTurn: false };
      }

      if(entry.symbolId === 'lucky7'){
        return { tier: 'triple-seven', multiplier: 100, xp: 300, extraTurn: false };
      }
    }

    if(entry.count === 2){
      if(isFruitSymbol(entry.symbolId)){
        return { tier: 'pair-fruit', multiplier: 0.2, xp: 10, extraTurn: false };
      }

      if(isPremiumSymbol(entry.symbolId)){
        return { tier: 'pair-premium', multiplier: 0, xp: 20, extraTurn: true };
      }
    }

    return { tier: 'standard', multiplier: 0, xp: 5, extraTurn: false };
  }

  function finish(result){
    var button = q('slotSpinButton');
    var box = document.querySelector('.slot-machine');
    var profile = resultProfile(result);
    var active = profile.multiplier > 0 || profile.extraTurn;

    spinning = false;
    scheduleSlotSoundStop();

    if(button) button.disabled = false;

    if(box){
      box.classList.remove('is-spinning');
      box.classList.toggle('is-win', active);
    }

    awardXP(profile.xp, 'reel-result', {
      section: 'slot',
      event: 'finish',
      tier: profile.tier,
      multiplier: profile.multiplier,
      extraTurn: profile.extraTurn
    });
  }

  function spin(){
    if(spinning) return;

    var button = q('slotSpinButton');
    var box = document.querySelector('.slot-machine');
    var result = pickResult();
    var pending = reelCount;

    spinning = true;
    awardXP(2, 'game-start', { section: 'slot', event: 'spin' });
    startSlotSound();

    if(button) button.disabled = true;

    if(box){
      box.classList.remove('is-win');
      box.classList.add('is-spinning');
    }

    result.forEach(function(symbolIndex, reelIndex){
      var strip = stripNode(reelIndex);
      if(!strip) return;

      var loops = maxSpinLoops - (reelCount - reelIndex - 1);
      var finalIndex = stripIndexForSymbol(reelIndex, symbolIndex, restLoop + loops);
      var duration = totalSpinMs - ((reelCount - reelIndex - 1) * reelStopGapMs);
      var y = stripY(finalIndex);

      strip.style.willChange = 'transform';
      strip.style.transition = 'transform ' + duration + 'ms linear';
      strip.style.transform = 'translate3d(0,' + y + 'px,0)';

      window.setTimeout(function(){
        currentIndexes[reelIndex] = symbolIndex;
        setReelPosition(reelIndex, symbolIndex, false);
        strip.style.willChange = 'auto';
        pending--;

        if(pending <= 0) finish(result);
      }, duration + 220);
    });
  }

  function refreshReels(){
    for(var i = 0; i < reelCount; i++){
      buildStrip(i, preparedLoops);
      setReelPosition(i, currentIndexes[i], false);
    }
  }

  function loadSlotSymbols(){
    fetch('/app/api/slot-symbols', { cache: 'no-store' })
      .then(function(response){ return response.json().then(function(body){ return { ok: response.ok, body: body }; }); })
      .then(function(result){
        if(!result.ok || !result.body || !result.body.symbols) return;

        var byId = {};
        result.body.symbols.forEach(function(symbol){
          byId[symbol.id] = symbol;
        });

        symbols = symbols.map(function(symbol){
          var uploaded = byId[symbol.id];
          if(!uploaded || !uploaded.imageUrl) return {
            id: symbol.id,
            label: symbol.label
          };
          return {
            id: symbol.id,
            label: uploaded.label || symbol.label,
            imageUrl: uploaded.imageUrl
          };
        });

        refreshReels();
      })
      .catch(function(){});
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

  function loadSlotSpinAudio(){
    fetch('/app/api/slot-spin-audio', { cache: 'no-store' })
      .then(function(response){ return response.json().then(function(body){ return { ok: response.ok, body: body }; }); })
      .then(function(result){
        if(!result.ok || !result.body || !result.body.audioUrl) return;
        prepareSlotSound(result.body.audioUrl);
      })
      .catch(function(){});
  }

  function bind(){
    initReels();
    loadSlotFrame();
    loadSlotSymbols();
    loadSlotSpinAudio();

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