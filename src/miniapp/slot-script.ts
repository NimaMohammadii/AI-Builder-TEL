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
`;
