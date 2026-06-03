export const SLOT_SCRIPT = `
(function(){
  var symbols = ['🍒', '🍋', '🍇', '🍉', '🍊', '⭐', '💎', '7️⃣'];
  var reelCount = 4;
  var symbolHeight = 82;
  var spinning = false;
  var currentIndexes = [0, 1, 2, 3];

  function q(id){
    return document.getElementById(id);
  }

  function setBrand(title){
    var brand = q('brandTitle');
    if(brand) brand.textContent = title;
  }

  function setStatus(text){
    var node = q('slotStatusText');
    if(node) node.textContent = text;
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

    if(button) button.disabled = false;

    if(box){
      box.classList.remove('is-spinning');
      box.classList.toggle('is-win', matched);
    }

    setStatus(matched ? 'Matched ' + symbols[first] : 'Ready to spin');
  }

  function spin(){
    if(spinning) return;

    var button = q('slotSpinButton');
    var box = document.querySelector('.slot-machine');
    var result = pickResult();
    var pending = reelCount;

    spinning = true;

    if(button) button.disabled = true;

    if(box){
      box.classList.remove('is-win');
      box.classList.add('is-spinning');
    }

    setStatus('Spinning');

    result.forEach(function(symbolIndex, reelIndex){
      var strip = stripNode(reelIndex);
      if(!strip) return;

      var loops = 8 + reelIndex * 2;
      var finalIndex = loops * symbols.length + symbolIndex;
      var duration = 1450 + reelIndex * 340;
      var y = -finalIndex * symbolHeight + symbolHeight;

      buildStrip(reelIndex, loops + 2);
      strip.style.transition = 'none';
      strip.style.transform = 'translate3d(0,' + symbolHeight + 'px,0)';

      requestAnimationFrame(function(){
        requestAnimationFrame(function(){
          strip.style.transition = 'transform ' + duration + 'ms cubic-bezier(.08,.72,.08,1)';
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

  function openPlayZone(){
    document.querySelectorAll('.view').forEach(function(view){
      view.classList.remove('active');
    });

    var play = q('playzone');
    if(play) play.classList.add('active');

    document.querySelectorAll('.tab').forEach(function(tab){
      tab.classList.toggle('active', tab.getAttribute('data-view') === 'playzone');
    });

    setBrand('Play Zone');
  }

  function bind(){
    initReels();

    var spinButton = q('slotSpinButton');
    if(spinButton) spinButton.addEventListener('click', spin);

    var backButton = q('slotBackButton');
    if(backButton) backButton.addEventListener('click', openPlayZone);

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
