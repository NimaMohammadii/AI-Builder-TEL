export const SLOT_SCRIPT = `
(function(){
  function slotSvgData(svg){
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  }

  function slotDefaultImage(symbol){
    var defs = '<defs><radialGradient id="bg" cx="32%" cy="24%" r="70%"><stop offset="0" stop-color="#fff8ee"/><stop offset=".45" stop-color="#ffd6d6"/><stop offset="1" stop-color="#2b0714"/></radialGradient><filter id="s" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#000" flood-opacity=".35"/></filter></defs>';
    var base = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">' + defs + '<circle cx="48" cy="48" r="44" fill="url(#bg)" opacity=".18"/>';
    var end = '</svg>';
    var art = '';

    if(symbol === 'cherry') art = '<g filter="url(#s)"><path d="M45 43c2-19 14-26 27-28" fill="none" stroke="#316d37" stroke-width="5" stroke-linecap="round"/><path d="M57 42c-1-13 3-23 14-31" fill="none" stroke="#40944b" stroke-width="5" stroke-linecap="round"/><ellipse cx="36" cy="60" rx="18" ry="17" fill="#e8184f"/><ellipse cx="58" cy="61" rx="18" ry="17" fill="#cf0d42"/><circle cx="29" cy="53" r="5" fill="#fff" opacity=".58"/><circle cx="52" cy="54" r="5" fill="#fff" opacity=".45"/></g>';
    if(symbol === 'lemon') art = '<g filter="url(#s)" transform="rotate(-18 48 48)"><path d="M19 48c12-24 46-24 58 0-12 24-46 24-58 0Z" fill="#ffd83d"/><path d="M28 47c9-13 31-16 43 0-11 15-32 14-43 0Z" fill="#ffe978"/><path d="M35 37c8-8 24-7 34 3" fill="none" stroke="#fff6a9" stroke-width="5" stroke-linecap="round" opacity=".65"/></g>';
    if(symbol === 'orange') art = '<g filter="url(#s)"><circle cx="49" cy="52" r="29" fill="#ff8a1c"/><path d="M46 23c2-8 8-12 18-12" fill="none" stroke="#3f9a41" stroke-width="5" stroke-linecap="round"/><path d="M59 18c8-3 14-1 18 4-8 5-15 5-21 1Z" fill="#45bf55"/><circle cx="39" cy="43" r="8" fill="#fff0b8" opacity=".34"/><path d="M31 64c14 12 34 9 46-7" fill="none" stroke="#d45b12" stroke-width="4" stroke-linecap="round" opacity=".32"/></g>';
    if(symbol === 'grape') art = '<g filter="url(#s)"><path d="M47 26c3-8 9-13 19-15" fill="none" stroke="#3ea147" stroke-width="5" stroke-linecap="round"/><ellipse cx="63" cy="18" rx="12" ry="7" fill="#49c55e" transform="rotate(-18 63 18)"/><circle cx="39" cy="39" r="12" fill="#8f42ff"/><circle cx="57" cy="39" r="12" fill="#7a2ee0"/><circle cx="30" cy="56" r="12" fill="#7431da"/><circle cx="48" cy="56" r="13" fill="#9b55ff"/><circle cx="66" cy="56" r="12" fill="#6625c6"/><circle cx="40" cy="71" r="12" fill="#7f39e6"/><circle cx="58" cy="71" r="12" fill="#8f42ff"/><circle cx="35" cy="34" r="4" fill="#fff" opacity=".42"/></g>';
    if(symbol === 'watermelon') art = '<g filter="url(#s)"><path d="M17 51c10 28 52 35 70 1-21 14-50 13-70-1Z" fill="#2fbf57"/><path d="M24 51c13 18 40 22 56 1-18 8-38 8-56-1Z" fill="#e8ffdf"/><path d="M31 50c12 12 30 14 42 1-14 4-28 4-42-1Z" fill="#ff4168"/><ellipse cx="43" cy="58" rx="3" ry="6" fill="#28131a"/><ellipse cx="56" cy="58" rx="3" ry="6" fill="#28131a"/><ellipse cx="67" cy="54" rx="3" ry="5" fill="#28131a"/></g>';
    if(symbol === 'diamond') art = '<g filter="url(#s)"><path d="M27 20h42l15 20-36 40-36-40Z" fill="#74e7ff"/><path d="M27 20 12 40h72L69 20Z" fill="#b7f5ff"/><path d="M32 40 48 80 64 40Z" fill="#33b7e6"/><path d="M32 40 48 20 64 40Z" fill="#e8ffff" opacity=".7"/></g>';
    if(symbol === 'gold') art = '<g filter="url(#s)"><path d="M48 12 58 35l25 2-19 16 6 25-22-13-22 13 6-25-19-16 25-2Z" fill="#ffc831"/><path d="M48 23 55 40l18 1-14 12 5 17-16-10-16 10 5-17-14-12 18-1Z" fill="#fff08a" opacity=".6"/></g>';
    if(symbol === 'lucky7') art = '<g filter="url(#s)"><rect x="18" y="14" width="60" height="68" rx="18" fill="#e71946"/><path d="M33 28h31L45 70" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><path d="M33 28h31L45 70" fill="none" stroke="#ffd44f" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></g>';

    return slotSvgData(base + art + end);
  }

  var symbols = [
    { id: 'cherry', fallback: '🍒', label: 'Cherry' },
    { id: 'lemon', fallback: '🍋', label: 'Lemon' },
    { id: 'orange', fallback: '🍊', label: 'Orange' },
    { id: 'grape', fallback: '🍇', label: 'Grape' },
    { id: 'watermelon', fallback: '🍉', label: 'Watermelon' },
    { id: 'diamond', fallback: '💎', label: 'Diamond' },
    { id: 'gold', fallback: '⭐', label: 'Gold Star or Bell' },
    { id: 'lucky7', fallback: '7️⃣', label: 'Lucky 7' }
  ].map(function(symbol){
    var defaultImageUrl = slotDefaultImage(symbol.id);
    symbol.defaultImageUrl = defaultImageUrl;
    symbol.imageUrl = defaultImageUrl;
    return symbol;
  });
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

  function createSymbol(symbol){
    var cell = document.createElement('div');
    cell.className = 'slot-symbol';

    if(symbol && symbol.imageUrl){
      var img = document.createElement('img');
      img.className = 'slot-symbol-image';
      img.src = symbol.imageUrl;
      img.alt = symbol.label || symbol.id || 'Slot symbol';
      img.draggable = false;
      img.onerror = function(){
        if(symbol.defaultImageUrl && img.src !== symbol.defaultImageUrl){
          img.src = symbol.defaultImageUrl;
          return;
        }
        cell.textContent = symbol.fallback || '';
      };
      cell.appendChild(img);
      return cell;
    }

    cell.textContent = symbol && symbol.fallback ? symbol.fallback : '';
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
    strip.style.transition = animate ? 'transform .65s cubic-bezier(.18,.92,.16,1)' : 'none';
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
      var duration = 4300 + reelIndex * 420;
      var y = -finalIndex * symbolHeight + symbolHeight;

      buildStrip(reelIndex, loops + 2);
      strip.style.transition = 'none';
      strip.style.transform = 'translate3d(0,' + symbolHeight + 'px,0)';

      requestAnimationFrame(function(){
        requestAnimationFrame(function(){
          strip.style.transition = 'transform ' + duration + 'ms cubic-bezier(.12,.86,.12,1)';
          strip.style.transform = 'translate3d(0,' + y + 'px,0)';
        });
      });

      window.setTimeout(function(){
        currentIndexes[reelIndex] = symbolIndex;
        buildStrip(reelIndex, 4);
        setReelPosition(reelIndex, symbolIndex, false);
        pending--;

        if(pending <= 0) finish(result);
      }, duration + 180);
    });
  }

  function refreshReels(){
    for(var i = 0; i < reelCount; i++){
      buildStrip(i, 4);
      setReelPosition(i, currentIndexes[i], false);
    }
  }

  function loadSlotSymbols(){
    fetch('/app/api/slot-symbols', { cache: 'no-store' })
      .then(function(response){ return response.json().then(function(body){ return { ok: response.ok, body: body }; }); })
      .then(function(result){
        if(!result.ok || !result.body || !result.body.symbols) return;
        var byId = {};
        result.body.symbols.forEach(function(symbol){ byId[symbol.id] = symbol; });
        symbols = symbols.map(function(symbol){
          var uploaded = byId[symbol.id];
          if(!uploaded || !uploaded.imageUrl) return symbol;
          return {
            id: symbol.id,
            fallback: symbol.fallback,
            label: uploaded.label || symbol.label,
            defaultImageUrl: symbol.defaultImageUrl,
            imageUrl: uploaded.imageUrl || symbol.imageUrl
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

  function bind(){
    initReels();
    loadSlotFrame();
    loadSlotSymbols();

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