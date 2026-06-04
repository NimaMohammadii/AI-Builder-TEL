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
  var NANO = 1000000000;
  var amountNano = 10000000;
  var extraTurns = 0;
  var activeCostNano = 0;
  var activeFreeTurn = false;
  var spinning = false;
  var currentIndexes = [0, 1, 2];
  var slotSound = null;
  var slotAudioUrl = '';
  var slotAudio = null;
  var slotSoundTimer = null;
  var slotSoundStopTimer = null;
  var slotLivePlayers = ['Amir','Ali','Reza','Arman','Arya','Arvin','Kian','Sina','Saman','Radin','Rayan','Shayan','Mahan','Parsa','Navid','Nima','Nikan','Kaveh','Sepehr','Taha','Erfan','Amin','Ilya','Bardia','Hirad','Omid','Pouya','Kasra','Arad','Mehrad','Nika','Ava','Mira','Luna','Daria','Tara','Maya','Lia','Nora','Elina','Raha','Yara','Vian','Mina','Roya','Aylin','Zara','Negin','Dorsa','Hana'];
  var slotLiveRows = [];
  var slotLiveTimer = null;
  var slotLiveRendered = '';

  function q(id){
    return document.getElementById(id);
  }

  function clamp(value, min, max){
    return Math.max(min, Math.min(max, value));
  }

  function toNano(value){
    return Math.max(0, Math.floor((Number(String(value || '').replace(',', '.')) || 0) * NANO));
  }

  function fromNano(value){
    var amount = Math.max(0, Math.floor(Number(value) || 0)) / NANO;
    return amount.toFixed(2);
  }

  function readPointBalance(){
    return window.VexaTonBalance ? Math.max(0, Math.floor(Number(window.VexaTonBalance.read()) || 0)) : 0;
  }

  function addPointDelta(deltaNano){
    var delta = Math.floor(Number(deltaNano) || 0);
    if(window.VexaTonBalance){
      window.VexaTonBalance.add(delta);
      return;
    }
    window.dispatchEvent(new CustomEvent('vexa-ton-balance-game-change', { detail: { deltaNano: delta } }));
  }

  function awardXP(amount, source, metadata){
    if(window.VexaLevel && typeof window.VexaLevel.add === 'function') window.VexaLevel.add(amount, source, metadata || { section: 'slot' });
  }

  function setBrand(title){
    var brand = q('brandTitle');
    if(brand) brand.textContent = title;
  }

  function setResultText(text){
    var node = q('slotResultText');
    if(node) node.textContent = text;
  }

  function setMultiplierText(value){
    var node = q('slotMultiplier');
    if(!node) return;
    node.textContent = Number(value || 0).toFixed(2) + 'x';
  }

  function cleanText(value){
    return String(value == null ? '' : value).replace(/[&<>"']/g, function(ch){
      return ch === '&' ? '&amp;' : ch === '<' ? '&lt;' : ch === '>' ? '&gt;' : ch === '"' ? '&quot;' : '&#39;';
    });
  }

  function slotLiveSymbolText(symbol){
    var iconById = { cherry: '🍒', lemon: '🍋', orange: '🍊', grape: '🍇', watermelon: '🍉', diamond: '💎', gold: '⭐', lucky7: '7️⃣' };
    if(!symbol) return '—';
    return iconById[symbol.id] || symbol.label || symbol.id || '—';
  }

  function seededSlotIndex(seed){
    var x = Math.sin(seed * 9301.77 + 49297.13) * 233280;
    return Math.abs(Math.floor(x)) % symbols.length;
  }

  function slotLiveResult(seed){
    var result = [];
    for(var i = 0; i < reelCount; i++){
      result.push(slotLiveSymbolText(symbols[seededSlotIndex(seed + i * 17)]));
    }
    return result.join(' ');
  }

  function buildSlotLiveRows(){
    var tick = Math.floor(Date.now() / 9000);
    slotLiveRows = slotLivePlayers.map(function(name, index){
      return { name: name, result: slotLiveResult((index + 1) * 31 + tick * (index % 7 + 3)) };
    });
  }

  function renderSlotLive(){
    var list = q('slotLiveList');
    var count = q('slotLiveCount');
    if(!list) return;
    if(count) count.textContent = slotLivePlayers.length + ' players';
    if(!slotLiveRows.length) buildSlotLiveRows();
    var html = slotLiveRows.map(function(row){
      return '<div class="slot-live-row"><span class="slot-live-user">' + cleanText(row.name) + '</span><span class="slot-live-result">' + cleanText(row.result) + '</span></div>';
    }).join('');
    if(html !== slotLiveRendered){
      list.innerHTML = html;
      slotLiveRendered = html;
    }
  }

  function refreshSlotLivePlayer(){
    if(!slotLiveRows.length) buildSlotLiveRows();
    var index = Math.floor(Math.random() * slotLiveRows.length);
    slotLiveRows[index] = {
      name: slotLivePlayers[index],
      result: slotLiveResult(Date.now() / 1000 + index * 43)
    };
    renderSlotLive();
  }

  function bindSlotLive(){
    buildSlotLiveRows();
    renderSlotLive();

    var box = q('slotLive');
    var toggle = q('slotLiveToggle');
    if(toggle && box){
      toggle.onclick = function(){
        var open = !box.classList.contains('open');
        box.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      };
    }

    if(slotLiveTimer) window.clearInterval(slotLiveTimer);
    slotLiveTimer = window.setInterval(refreshSlotLivePlayer, 1800);
  }

  function syncAmountInput(){
    var input = q('slotAmount');
    if(!input) return;
    input.value = extraTurns > 0 ? 'Free' : fromNano(amountNano);
  }

  function refreshControls(){
    var button = q('slotSpinButton');
    var input = q('slotAmount');
    if(input){
      input.disabled = spinning || extraTurns > 0;
      input.value = extraTurns > 0 ? 'Free' : fromNano(amountNano);
    }
    if(button){
      button.disabled = spinning;
      var fallback = button.querySelector('.slot-control-fallback');
      if(fallback) fallback.textContent = spinning ? 'Running' : extraTurns > 0 ? 'Use Extra Turn' : 'Spin';
    }
  }

  function readAmountInput(){
    var input = q('slotAmount');
    if(extraTurns > 0){
      syncAmountInput();
      return amountNano;
    }
    amountNano = clamp(toNano(input && input.value), 1, 999999999999999);
    syncAmountInput();
    return amountNano;
  }

  function setAmountNano(nextNano){
    amountNano = clamp(Math.floor(Number(nextNano) || 0), 1, 999999999999999);
    syncAmountInput();
    refreshControls();
  }

  function adjustAmount(mode){
    readAmountInput();
    if(mode === 'amount-half') setAmountNano(Math.max(1, Math.floor(amountNano / 2)));
    if(mode === 'amount-double') setAmountNano(amountNano * 2);
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

  function resultLabel(profile, deltaNano){
    if(profile.extraTurn) return 'Extra turn ready';
    if(deltaNano > 0) return 'Result +' + fromNano(deltaNano);
    return 'Result 0.00';
  }

  function finish(result){
    var button = q('slotSpinButton');
    var box = document.querySelector('.slot-machine');
    var profile = resultProfile(result);
    var active = profile.multiplier > 0 || profile.extraTurn;
    var resultNano = activeCostNano > 0 && profile.multiplier > 0 ? Math.floor(activeCostNano * profile.multiplier) : 0;

    spinning = false;
    scheduleSlotSoundStop();

    if(resultNano > 0) addPointDelta(resultNano);
    if(profile.extraTurn) extraTurns++;

    setMultiplierText(profile.multiplier || 0);
    setResultText(resultLabel(profile, resultNano));

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

    activeCostNano = 0;
    activeFreeTurn = false;
    refreshControls();
  }

  function spin(){
    if(spinning) return;

    var button = q('slotSpinButton');
    var box = document.querySelector('.slot-machine');
    var result = pickResult();
    var pending = reelCount;

    readAmountInput();
    activeFreeTurn = extraTurns > 0;
    activeCostNano = activeFreeTurn ? 0 : amountNano;

    if(!activeFreeTurn && readPointBalance() < activeCostNano){
      setResultText('Not enough points');
      return;
    }

    if(activeFreeTurn){
      extraTurns--;
    }else{
      addPointDelta(-activeCostNano);
    }

    spinning = true;
    awardXP(2, 'reel-start', { section: 'slot', event: 'spin' });
    setResultText(activeFreeTurn ? 'Extra turn running' : 'Running');
    setMultiplierText(1);
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

    refreshControls();
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
        buildSlotLiveRows();
        renderSlotLive();
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

  function loadSlotControls(){
    fetch('/app/api/slot-controls', { cache: 'no-store' })
      .then(function(response){ return response.json().then(function(body){ return { ok: response.ok, body: body }; }); })
      .then(function(result){
        if(!result.ok || !result.body || !result.body.controls) return;

        result.body.controls.forEach(function(control){
          var img = control.id === 'spin' ? q('slotSpinButtonImage') : control.id === 'input' ? q('slotInputButtonImage') : null;
          if(!img || !control.imageUrl) return;

          img.onload = function(){ img.classList.add('is-loaded'); };
          img.onerror = function(){ img.classList.remove('is-loaded'); img.removeAttribute('src'); };
          img.src = control.imageUrl;
        });
      })
      .catch(function(){});
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
    loadSlotControls();
    loadSlotSpinAudio();
    syncAmountInput();
    setMultiplierText(1);
    setResultText('Set point amount');
    refreshControls();
    bindSlotLive();

    var spinButton = q('slotSpinButton');
    var amountInput = q('slotAmount');
    if(spinButton) spinButton.addEventListener('click', spin);
    if(amountInput){
      amountInput.addEventListener('change', readAmountInput);
      amountInput.addEventListener('blur', readAmountInput);
    }

    document.addEventListener('click', function(ev){
      var actionButton = ev.target && ev.target.closest ? ev.target.closest('[data-slot-action]') : null;
      if(actionButton){
        ev.preventDefault();
        adjustAmount(actionButton.getAttribute('data-slot-action'));
        return;
      }

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
