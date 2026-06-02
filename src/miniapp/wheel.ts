export const WHEEL_SECTION = `
<section id="wheel" class="view wheel-view">
  <style>
    html:has(#wheel.active),
    body:has(#wheel.active),
    body:has(#wheel.active) .app,
    body:has(#wheel.active) main.app,
    body:has(#wheel.active) .content,
    body:has(#wheel.active) .view.active,
    body:has(#wheel.active) #wheel,
    body:has(#wheel.active) .wheel-view,
    body:has(#wheel.active) .top,
    body:has(#wheel.active) header.top {
      background: #000 !important;
      background-color: #000 !important;
      background-image: none !important;
      box-shadow: none !important;
    }

    body:has(#wheel.active)::before,
    body:has(#wheel.active)::after,
    body:has(#wheel.active) .app::before,
    body:has(#wheel.active) .app::after,
    body:has(#wheel.active) .content::before,
    body:has(#wheel.active) .content::after,
    body:has(#wheel.active) #wheel::before,
    body:has(#wheel.active) #wheel::after {
      background: #000 !important;
      background-color: #000 !important;
      background-image: none !important;
      box-shadow: none !important;
    }

    body:has(#wheel.active) .tabs {
      display: none !important;
    }

    .wheel-view {
      position: relative;
      box-sizing: border-box;
      height: 100%;
      min-height: 100%;
      padding: 0 14px calc(96px + env(safe-area-inset-bottom));
      background: #000 !important;
      color: white;
      overflow-y: auto !important;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
    }

    .wheel-wrap {
      position: relative;
      z-index: 1;
      max-width: 520px;
      margin: 0 auto;
      display: grid;
      gap: 12px;
    }

    .wheel-stage {
      position: relative;
      height: 372px;
      display: grid;
      place-items: center;
      margin-top: 4px;
    }

    .wheel-canvas {
      position: relative;
      z-index: 1;
      width: min(356px, 88vw);
      height: min(356px, 88vw);
      filter: none;
    }

    .wheel-pointer {
      position: absolute;
      top: 0;
      left: 50%;
      width: 62px;
      height: 54px;
      z-index: 5;
      transform: translateX(-50%);
      background: transparent !important;
      filter: drop-shadow(0 18px 30px rgba(0, 0, 0, .74)) drop-shadow(0 0 16px rgba(255, 255, 255, .14));
    }

    .wheel-pointer:before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(255,255,255,.16), rgba(0,0,0,.54) 34%, rgba(0,0,0,.86) 100%) !important;
      border: 1.5px solid rgba(255, 255, 255, .86) !important;
      box-shadow: 0 16px 32px rgba(0, 0, 0, .64), inset 0 1px 0 rgba(255, 255, 255, .34), inset 0 -1px 0 rgba(0,0,0,.88) !important;
      backdrop-filter: blur(10px) saturate(1.18);
      -webkit-backdrop-filter: blur(10px) saturate(1.18);
      clip-path: polygon(50% 100%, 0 0, 100% 0);
    }

    .wheel-pointer:after {
      content: '';
      position: absolute;
      inset: 2px;
      background: linear-gradient(180deg, rgba(255,255,255,.12), rgba(255,255,255,0) 42%);
      clip-path: polygon(50% 100%, 0 0, 100% 0);
      pointer-events: none;
    }

    .wheel-center {
      position: absolute;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: rgba(255, 255, 255, .06) !important;
      border: 1px solid rgba(255, 255, 255, .24) !important;
      box-shadow: 0 16px 32px rgba(0, 0, 0, .62), inset 0 1px 0 rgba(255, 255, 255, .32) !important;
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      z-index: 4;
      text-align: center;
    }

    .wheel-center b {
      font-size: 11px;
      color: rgba(255, 255, 255, .78);
      letter-spacing: -.04em;
      text-shadow: 0 2px 8px rgba(0, 0, 0, .75);
    }

    .wheel-panel {
      position: relative;
      border: 0 !important;
      border-radius: 28px;
      background: transparent !important;
      box-shadow: none !important;
      padding: 12px 14px 14px;
      margin-bottom: 48px;
    }

    .wheel-controls {
      display: grid;
      gap: 10px;
    }

    .wheel-input-row {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 8px;
    }

    .wheel-input-row input {
      height: 50px;
      border-radius: 18px;
      border: 1px solid rgba(255, 255, 255, .12);
      background: rgba(255, 255, 255, .06);
      color: #fff;
      padding: 0 14px;
      font-size: 18px;
      font-weight: 900;
      outline: none;
    }

    .wheel-multiplier-btn {
      height: 50px;
      min-width: 58px;
      border-radius: 18px;
      border: 1px solid rgba(255, 255, 255, .1);
      background: rgba(0, 0, 0, .35);
      color: #fff;
      display: grid;
      place-items: center;
      font-weight: 950;
      font-size: 13px;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, .08);
    }

    .wheel-chance-card {
      position: relative;
      border: 0 !important;
      border-radius: 0;
      background: transparent !important;
      padding: 0;
      box-shadow: none !important;
    }

    .wheel-chance-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      position: absolute;
      left: 18px;
      right: 18px;
      top: 14px;
      z-index: 3;
      margin-bottom: 0;
      padding: 0;
      font-size: 12px;
      font-weight: 900;
      color: rgba(255, 255, 255, .56);
      letter-spacing: -.02em;
    }

    .wheel-chance-head b {
      color: #fff;
      font-size: 14px;
      font-weight: 950;
      font-variant-numeric: tabular-nums lining-nums;
    }

    .wheel-chance-shell {
      --wheel-left-color: rgba(58, 6, 20, .84);
      --wheel-right-color: rgba(138, 138, 146, .54);
      position: relative;
      height: 96px;
      border-radius: 22px;
      background: rgba(8,8,10,.48) !important;
      border: 1px solid rgba(255,255,255,.12) !important;
      overflow: visible;
      box-shadow: none !important;
      touch-action: none;
      user-select: none;
      padding: 42px 6px 24px;
      box-sizing: border-box;
    }

    .wheel-chance-shell:before {
      content: '';
      position: absolute;
      left: 20px;
      right: 20px;
      top: 57px;
      height: 10px;
      background: linear-gradient(90deg, rgba(255,255,255,.10) 0 2px, transparent 2px 25%, rgba(255,255,255,.10) 25% calc(25% + 2px), transparent calc(25% + 2px) 50%, rgba(255,255,255,.10) 50% calc(50% + 2px), transparent calc(50% + 2px) 75%, rgba(255,255,255,.10) 75% calc(75% + 2px), transparent calc(75% + 2px) 100%);
      clip-path: polygon(0 100%, 1.6% 0, 3.2% 100%, 25% 100%, 26.6% 0, 28.2% 100%, 50% 100%, 51.6% 0, 53.2% 100%, 75% 100%, 76.6% 0, 78.2% 100%, 100% 100%);
      opacity: .56;
      pointer-events: none;
    }

    .wheel-chance-fill {
      position: absolute;
      left: 12px;
      right: 12px;
      top: 63%;
      height: 30px;
      border-radius: 999px;
      transform: translateY(-50%);
      background: rgba(14,14,16,.86);
      border: 1px solid rgba(255,255,255,.15);
      box-shadow: 0 16px 36px rgba(0,0,0,.36), inset 0 1px 0 rgba(255,255,255,.20), inset 0 -1px 0 rgba(0,0,0,.55);
      backdrop-filter: blur(6px) saturate(1.15);
      -webkit-backdrop-filter: blur(6px) saturate(1.15);
      pointer-events: none;
      transition: none;
    }

    .wheel-chance-fill:before {
      content: '';
      position: absolute;
      left: 16px;
      right: 16px;
      top: 50%;
      height: 12px;
      border-radius: 999px;
      transform: translateY(-50%);
      background: linear-gradient(90deg, var(--wheel-left-color) 0%, var(--wheel-left-color) var(--wheel-pos, 20%), var(--wheel-right-color) var(--wheel-pos, 20%), var(--wheel-right-color) 100%);
      box-shadow: inset 0 1px 0 rgba(255,255,255,.10), 0 0 14px rgba(0,0,0,.42);
      transition: background .12s cubic-bezier(.2,.8,.2,1);
    }

    .wheel-chance-thumb {
      position: absolute;
      left: calc(16px + (100% - 32px) * var(--wheel-ratio, .2));
      top: 63%;
      width: 34px;
      height: 34px;
      border-radius: 12px;
      transform: translate(-50%, -50%);
      background: var(--wheel-thumb-color, #4a0a1e);
      border: 1px solid rgba(255,255,255,.34);
      box-shadow: 0 14px 34px rgba(0,0,0,.58), inset 0 1px 0 rgba(255,255,255,.42), inset 0 -1px 0 rgba(255,255,255,.06);
      backdrop-filter: blur(7px) saturate(1.22);
      -webkit-backdrop-filter: blur(7px) saturate(1.22);
      pointer-events: none;
      transition: left .10s cubic-bezier(.2,.8,.2,1), transform .16s ease, box-shadow .16s ease;
    }

    .wheel-chance-thumb:before {
      content: '';
      position: absolute;
      left: 50%;
      top: 50%;
      width: 17px;
      height: 18px;
      transform: translate(-50%, -50%);
      background: linear-gradient(90deg, rgba(255,255,255,.58) 0 3px, transparent 3px 7px, rgba(255,255,255,.58) 7px 10px, transparent 10px 14px, rgba(255,255,255,.58) 14px 17px);
      border-radius: 2px;
      filter: drop-shadow(0 1px 6px rgba(0,0,0,.35));
    }

    .wheel-chance-shell.dragging .wheel-chance-fill:before,
    .wheel-chance-shell.dragging .wheel-chance-thumb {
      transition-duration: .045s;
    }

    .wheel-chance-shell.dragging .wheel-chance-thumb {
      transform: translate(-50%, -50%) scale(1.055);
      box-shadow: 0 18px 40px rgba(0,0,0,.66), inset 0 1px 0 rgba(255,255,255,.50);
    }

    .wheel-chance-slider {
      position: absolute;
      inset: 0;
      z-index: 2;
      width: 100%;
      height: 100%;
      margin: 0;
      opacity: 0;
      appearance: none;
      -webkit-appearance: none;
      cursor: pointer;
    }

    .wheel-chance-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 52px;
      height: 52px;
    }

    .wheel-chance-slider::-moz-range-thumb {
      width: 52px;
      height: 52px;
      border: 0;
    }

    .wheel-quick {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }

    .wheel-quick button,
    .wheel-join {
      border: 1px solid rgba(255, 255, 255, .12);
      border-radius: 18px;
      background: rgba(255, 255, 255, .06);
      color: #fff;
      font-weight: 900;
      height: 44px;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, .08);
    }

    .wheel-quick button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 3px;
    }

    .wheel-ton-icon {
      width: 22px;
      height: 22px;
      display: inline-block;
      object-fit: contain;
      flex: 0 0 22px;
      filter: drop-shadow(0 3px 8px rgba(0,136,204,.28));
    }

    .wheel-quick button.active {
      background: #4a0a1e;
      border-color: #5f0d27;
    }

    .wheel-join {
      height: 58px;
      border-radius: 18px;
      font-size: 18px;
      background: #3b0715;
      color: #ffdce5;
      letter-spacing: -.045em;
      border-color: rgba(255, 96, 128, .18);
      box-shadow: 0 12px 24px rgba(0, 0, 0, .50), inset 0 1px 0 rgba(255,255,255,.08);
      transition: transform .18s ease, opacity .18s ease, background .18s ease;
    }

    .wheel-join:active {
      transform: scale(.975);
    }

    .wheel-join:disabled {
      opacity: .62;
      transform: scale(.985);
    }

    .wheel-join.win {
      background: #0f3f2a;
      border-color: rgba(120,255,179,.22);
      color: #d8ffe8;
    }

    .wheel-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-top: 12px;
    }

    .wheel-stat {
      border: 1px solid rgba(255, 255, 255, .1);
      border-radius: 18px;
      background: rgba(0, 0, 0, .35);
      padding: 11px;
      text-align: center;
    }

    .wheel-stat small {
      display: block;
      color: rgba(255, 255, 255, .45);
      font-size: 10px;
      font-weight: 850;
    }

    .wheel-stat b {
      display: block;
      margin-top: 4px;
      font-size: 14px;
    }

    .wheel-players {
      display: grid;
      gap: 8px;
      margin-top: 12px;
    }

    @media(max-width: 420px) {
      .wheel-stage {
        height: 354px;
      }

      .wheel-canvas {
        width: min(338px, 90vw);
        height: min(338px, 90vw);
      }

      .wheel-center {
        width: 58px;
        height: 58px;
      }
    }
  </style>

  <div class="wheel-wrap">
    <div class="wheel-stage">
      <div class="wheel-pointer"></div>
      <canvas class="wheel-canvas" width="1200" height="1200" data-wheel-canvas></canvas>
      <div class="wheel-center"><b data-wheel-center>20%</b></div>
    </div>

    <div class="wheel-panel">
      <div class="wheel-controls">
        <div class="wheel-input-row">
          <input data-wheel-amount inputmode="decimal" pattern="[0-9.]*" value="0.1" />
          <button class="wheel-multiplier-btn" type="button" data-wheel-half>1/2</button>
          <button class="wheel-multiplier-btn" type="button" data-wheel-double>2x</button>
        </div>

        <div class="wheel-chance-card">
          <div class="wheel-chance-head"><span>Win Chance</span><b data-wheel-chance-value>20%</b></div>
          <div class="wheel-chance-shell" data-wheel-chance-shell>
            <div class="wheel-chance-fill"></div>
            <div class="wheel-chance-thumb"></div>
            <input class="wheel-chance-slider" type="range" min="4" max="96" step="1" value="20" data-wheel-chance />
          </div>
        </div>

        <div class="wheel-quick">
          <button data-wheel-quick="0.1" class="active"><span>0.1</span><img class="wheel-ton-icon" src="/app/api/credit-icon.png" alt="Credit" loading="eager" decoding="async" data-wheel-credit-icon /></button>
          <button data-wheel-quick="0.5"><span>0.5</span><img class="wheel-ton-icon" src="/app/api/credit-icon.png" alt="Credit" loading="eager" decoding="async" data-wheel-credit-icon /></button>
          <button data-wheel-quick="1"><span>1</span><img class="wheel-ton-icon" src="/app/api/credit-icon.png" alt="Credit" loading="eager" decoding="async" data-wheel-credit-icon /></button>
        </div>

        <button class="wheel-join" data-wheel-join>Spin</button>
      </div>

      <div class="wheel-stats">
        <div class="wheel-stat"><small>CHANCE</small><b data-wheel-count>20%</b></div>
        <div class="wheel-stat"><small>MULTIPLIER</small><b data-wheel-pot>4.80x</b></div>
        <div class="wheel-stat"><small>RESULT</small><b data-wheel-user>Ready</b></div>
      </div>

      <div class="wheel-players" data-wheel-players></div>
    </div>
  </div>

  <script>
    (function () {
      function initWheelGame() {
        var root = document.getElementById('wheel');
        if (!root || root.dataset.readyWheelCanvasUi === '1') return;

        var canvas = root.querySelector('[data-wheel-canvas]');
        var amountInput = root.querySelector('[data-wheel-amount]');
        var chanceInput = root.querySelector('[data-wheel-chance]');
        var chanceShell = root.querySelector('[data-wheel-chance-shell]');
        var chanceText = root.querySelector('[data-wheel-chance-value]');
        var chanceStat = root.querySelector('[data-wheel-count]');
        var multiplierStat = root.querySelector('[data-wheel-pot]');
        var resultStat = root.querySelector('[data-wheel-user]');
        var centerText = root.querySelector('[data-wheel-center]');
        var spinButton = root.querySelector('[data-wheel-join]');
        var halfButton = root.querySelector('[data-wheel-half]');
        var doubleButton = root.querySelector('[data-wheel-double]');

        if (!canvas || !amountInput || !chanceInput || !chanceShell || !spinButton || !halfButton || !doubleButton) {
          setTimeout(initWheelGame, 80);
          return;
        }

        var ctx = canvas.getContext('2d');
        if (!ctx) return;

        root.dataset.readyWheelCanvasUi = '1';

        var angle = 0;
        var spinning = false;
        var dragging = false;
        var houseEdge = .96;
        var edgeChancePadding = 4;
        var minChance = edgeChancePadding;
        var maxChance = 100 - edgeChancePadding;
        var pointerAngle = -Math.PI / 2;
        var creditIconSrc = '/app/api/credit-icon.png';

        function clampChance(value) {
          return Math.max(minChance, Math.min(maxChance, Math.round(Number(value) || 20)));
        }

        function chanceToRatio(chance) {
          return (clampChance(chance) - minChance) / Math.max(1, maxChance - minChance);
        }

        function chanceToPos(chance) {
          return chanceToRatio(chance) * 100;
        }

        function posToChance(pos) {
          var clampedPos = Math.max(minChance, Math.min(maxChance, pos));
          return clampChance(clampedPos);
        }

        function chanceFromClientX(clientX) {
          var rect = chanceShell.getBoundingClientRect();
          var usableLeft = rect.left + 16;
          var usableWidth = Math.max(1, rect.width - 32);
          var pos = ((clientX - usableLeft) / usableWidth) * 100;
          return posToChance(pos);
        }

        function multiplierFor(chance) {
          return Math.max(1.01, Math.floor((100 / chance) * houseEdge * 100) / 100);
        }

        function money(n) {
          var x = Number(n) || 0;
          var text = x.toFixed(2);
          if (text.slice(-3) === '.00') return text.slice(0, -3);
          if (text.charAt(text.length - 1) === '0') return text.slice(0, -1);
          return text;
        }

        function balance() {
          return window.VexaTonBalance ? Math.max(0, Math.floor(Number(window.VexaTonBalance.read()) || 0)) : 0;
        }

        function changeBalance(deltaNano) {
          if (window.VexaTonBalance) window.VexaTonBalance.add(Math.floor(Number(deltaNano) || 0));
        }

        function toNano(value) {
          return Math.max(0, Math.floor((Number(String(value || '').replace(',', '.')) || 0) * 1000000000));
        }

        function hydrateCreditIcons() {
          var src = creditIconSrc;
          try {
            var uploaded = window.VexaUploadedImages && window.VexaUploadedImages.read && window.VexaUploadedImages.read();
            if (uploaded && uploaded.creditIconUrl) src = uploaded.creditIconUrl;
          } catch (e) {}
          if (!window.__vexaWheelCreditIcon) {
            window.__vexaWheelCreditIcon = new Image();
          }
          window.__vexaWheelCreditIcon.src = src;
          root.querySelectorAll('[data-wheel-credit-icon]').forEach(function (img) {
            if (img.getAttribute('src') !== src) img.setAttribute('src', src);
          });
        }

        function updateUi() {
          var chance = clampChance(chanceInput.value);
          var pos = chanceToPos(chance);
          var ratio = chanceToRatio(chance);
          var mult = multiplierFor(chance);
          chanceInput.value = String(chance);
          root.style.setProperty('--wheel-pos', pos + '%');
          root.style.setProperty('--wheel-ratio', String(ratio));
          chanceShell.style.setProperty('--wheel-pos', pos + '%');
          chanceShell.style.setProperty('--wheel-ratio', String(ratio));
          var red = [74, 10, 30], gray = [138, 138, 146];
          var thumb = red.map(function (value, index) { return Math.round(value + (gray[index] - value) * ratio); });
          chanceShell.style.setProperty('--wheel-thumb-color', 'rgb(' + thumb.join(',') + ')');
          if (chanceText) chanceText.textContent = chance + '%';
          if (chanceStat) chanceStat.textContent = chance + '%';
          if (multiplierStat) multiplierStat.textContent = mult.toFixed(2) + 'x';
          if (centerText) centerText.textContent = chance + '%';
          if (!spinning) draw(angle);
        }

        function setChanceFromClientX(clientX) {
          if (spinning || chanceInput.disabled) return;
          chanceInput.value = String(chanceFromClientX(clientX));
          updateUi();
        }

        function startDrag(event) {
          if (spinning || chanceInput.disabled) return;
          dragging = true;
          chanceShell.classList.add('dragging');
          if (chanceShell.setPointerCapture && event.pointerId != null) chanceShell.setPointerCapture(event.pointerId);
          setChanceFromClientX(event.clientX);
          event.preventDefault();
        }

        function moveDrag(event) {
          if (!dragging) return;
          setChanceFromClientX(event.clientX);
          event.preventDefault();
        }

        function endDrag(event) {
          if (!dragging) return;
          dragging = false;
          chanceShell.classList.remove('dragging');
          if (chanceShell.releasePointerCapture && event && event.pointerId != null) {
            try { chanceShell.releasePointerCapture(event.pointerId); } catch (e) {}
          }
        }

        function slicePath(cx, cy, innerRadius, outerRadius, startAngle, endAngle) {
          var corner = .028;
          var innerStart = startAngle + corner;
          var innerEnd = endAngle - corner;
          var outerStart = startAngle + corner;
          var outerEnd = endAngle - corner;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(innerStart) * innerRadius, cy + Math.sin(innerStart) * innerRadius);
          ctx.lineTo(cx + Math.cos(outerStart) * outerRadius, cy + Math.sin(outerStart) * outerRadius);
          ctx.quadraticCurveTo(cx + Math.cos(startAngle) * outerRadius, cy + Math.sin(startAngle) * outerRadius, cx + Math.cos(startAngle + corner * .5) * outerRadius, cy + Math.sin(startAngle + corner * .5) * outerRadius);
          ctx.arc(cx, cy, outerRadius, outerStart, outerEnd, false);
          ctx.quadraticCurveTo(cx + Math.cos(endAngle) * outerRadius, cy + Math.sin(endAngle) * outerRadius, cx + Math.cos(outerEnd) * outerRadius, cy + Math.sin(outerEnd) * outerRadius);
          ctx.lineTo(cx + Math.cos(innerEnd) * innerRadius, cy + Math.sin(innerEnd) * innerRadius);
          ctx.arc(cx, cy, innerRadius, innerEnd, innerStart, true);
          ctx.closePath();
        }

        function label(text, angleValue, radius, color, size) {
          var cx = 600;
          var cy = 600;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(angleValue);
          ctx.fillStyle = color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = '900 ' + size + 'px system-ui';
          ctx.fillText(text, radius, 0);
          ctx.restore();
        }

        function draw(rotation) {
          var cx = 600;
          var cy = 600;
          var outerRadius = 486;
          var innerRadius = 106;
          var gap = .004;
          var chance = clampChance(chanceInput.value);
          var userArc = Math.PI * 2 * chance / 100;
          var userStart = pointerAngle - userArc / 2 + rotation;
          var userEnd = userStart + userArc;
          var loseStart = userEnd;
          var loseEnd = userStart + Math.PI * 2;
          ctx.clearRect(0, 0, 1200, 1200);
          ctx.beginPath();
          ctx.arc(cx, cy, outerRadius + 42, 0, Math.PI * 2);
          ctx.fillStyle = '#030304';
          ctx.fill();
          slicePath(cx, cy, innerRadius, outerRadius, userStart + gap, userEnd - gap);
          ctx.fillStyle = '#4a0a1e';
          ctx.globalAlpha = .94;
          ctx.fill();
          ctx.globalAlpha = 1;
          label('WIN ' + chance + '%', (userStart + userEnd) / 2, outerRadius * .58, '#fff', 44);
          if (chance < 100) {
            slicePath(cx, cy, innerRadius, outerRadius, loseStart + gap, loseEnd - gap);
            ctx.fillStyle = '#222226';
            ctx.globalAlpha = .86;
            ctx.fill();
            ctx.globalAlpha = 1;
            label('LOSE', (loseStart + loseEnd) / 2, outerRadius * .58, 'rgba(255,255,255,.72)', 44);
          }
          ctx.beginPath();
          ctx.arc(cx, cy, outerRadius + 38, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(55, 4, 22, .86)';
          ctx.lineWidth = 12;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(cx, cy, outerRadius + 33, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 255, 255, .18)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        function chooseTargetOffset(win, chance) {
          var userArc = Math.PI * 2 * chance / 100;
          if (win) {
            var winSafe = Math.max(.01, userArc * .38);
            return (Math.random() * winSafe * 2) - winSafe;
          }
          var loseSafe = Math.PI * 2 - userArc - .20;
          return userArc / 2 + .10 + Math.random() * Math.max(.12, loseSafe);
        }

        function normalizeDelta(delta) {
          var full = Math.PI * 2;
          while (delta < 0) delta += full;
          while (delta >= full) delta -= full;
          return delta;
        }

        function setControlsLocked(locked) {
          amountInput.disabled = !!locked;
          chanceInput.disabled = !!locked;
          halfButton.disabled = !!locked;
          doubleButton.disabled = !!locked;
          root.querySelectorAll('[data-wheel-quick]').forEach(function (button) {
            button.disabled = !!locked;
          });
        }

        function spin() {
          if (spinning) return;
          var chance = clampChance(chanceInput.value);
          var betNano = toNano(amountInput.value);
          var mult = multiplierFor(chance);
          if (betNano <= 0) return;
          if (window.VexaTonBalance && balance() < betNano) {
            if (resultStat) resultStat.textContent = 'No TON';
            return;
          }
          spinning = true;
          setControlsLocked(true);
          spinButton.disabled = true;
          spinButton.classList.remove('win');
          spinButton.textContent = 'Spinning...';
          if (resultStat) resultStat.textContent = 'Spinning';
          changeBalance(-betNano);
          var win = Math.random() * 100 < chance;
          var start = angle;
          var target = chooseTargetOffset(win, chance);
          var turns = (Math.PI * 2) * (5 + Math.floor(Math.random() * 3));
          var finalAngle = start + turns + normalizeDelta(target - start);
          var started = performance.now();
          var duration = 3400;
          function ease(t) { return 1 - Math.pow(1 - t, 4); }
          function frame(now) {
            var p = Math.min(1, (now - started) / duration);
            angle = start + (finalAngle - start) * ease(p);
            draw(angle);
            if (p < 1) { requestAnimationFrame(frame); return; }
            angle = target;
            draw(angle);
            spinning = false;
            spinButton.disabled = false;
            setControlsLocked(false);
            if (win) {
              var payout = Math.floor(betNano * mult);
              changeBalance(payout);
              spinButton.classList.add('win');
              spinButton.textContent = 'Won +' + money(payout / 1000000000) + ' TON';
              if (resultStat) resultStat.textContent = '+' + money(payout / 1000000000) + ' TON';
            } else {
              spinButton.textContent = 'Spin';
              if (resultStat) resultStat.textContent = 'Lost';
            }
          }
          requestAnimationFrame(frame);
        }

        root.querySelectorAll('[data-wheel-quick]').forEach(function (button) {
          button.addEventListener('click', function () {
            if (spinning) return;
            root.querySelectorAll('[data-wheel-quick]').forEach(function (item) { item.classList.remove('active'); });
            button.classList.add('active');
            amountInput.value = button.getAttribute('data-wheel-quick') || '0.1';
          });
        });
        halfButton.addEventListener('click', function () {
          if (spinning) return;
          var value = Math.max(0.1, Number(amountInput.value || '0.1') / 2);
          amountInput.value = String(Math.round(value * 100) / 100).replace(/\.0$/, '');
        });
        doubleButton.addEventListener('click', function () {
          if (spinning) return;
          var value = Math.max(0.1, Number(amountInput.value || '0.1') * 2);
          amountInput.value = String(Math.round(value * 100) / 100).replace(/\.0$/, '');
        });
        chanceInput.min = String(minChance);
        chanceInput.max = String(maxChance);
        hydrateCreditIcons();
        if (window.VexaUploadedImages && window.VexaUploadedImages.load) window.VexaUploadedImages.load(false).then(hydrateCreditIcons).catch(function () {});
        chanceShell.addEventListener('pointerdown', startDrag);
        chanceShell.addEventListener('pointermove', moveDrag, { passive: false });
        chanceShell.addEventListener('pointerup', endDrag);
        chanceShell.addEventListener('pointercancel', endDrag);
        chanceInput.addEventListener('input', updateUi);
        chanceInput.addEventListener('change', updateUi);
        spinButton.addEventListener('click', spin);
        updateUi();
      }
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initWheelGame);
      else initWheelGame();
    })();
  </script>
</section>
`;