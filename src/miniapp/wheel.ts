export const WHEEL_SECTION = `
<section id="wheel" class="view wheel-view">
  <style>
    html:has(#wheel.active),
    body:has(#wheel.active) {
      background: #000 !important;
      background-color: #000 !important;
      background-image: none !important;
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
      background-color: #000 !important;
      background-image: none !important;
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
      top: 2px;
      left: 50%;
      width: 34px;
      height: 64px;
      z-index: 5;
      transform: translateX(-50%);
      background: transparent !important;
      filter: drop-shadow(0 16px 32px rgba(0, 0, 0, .62));
    }

    .wheel-pointer:before {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(255, 255, 255, .06) !important;
      border: 1px solid rgba(255, 255, 255, .24) !important;
      box-shadow: 0 16px 32px rgba(0, 0, 0, .62), inset 0 1px 0 rgba(255, 255, 255, .32) !important;
      clip-path: polygon(50% 100%, 3% 0, 97% 0);
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
      border-radius: 22px;
      background: rgba(255, 255, 255, .025);
      border: 1px solid rgba(255, 255, 255, .10);
      padding: 12px;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.06);
      backdrop-filter: blur(3px);
      -webkit-backdrop-filter: blur(3px);
    }

    .wheel-chance-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 9px;
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
      position: relative;
      height: 34px;
      border-radius: 999px;
      background: rgba(255,255,255,.06);
      border: 1px solid rgba(255,255,255,.12);
      overflow: hidden;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.12), inset 0 -1px 0 rgba(0,0,0,.42);
    }

    .wheel-chance-fill {
      position: absolute;
      inset: 7px;
      border-radius: 999px;
      background: linear-gradient(90deg, rgba(78, 8, 28, .92) 0%, rgba(78, 8, 28, .92) var(--wheel-chance, 20%), rgba(255,255,255,.12) var(--wheel-chance, 20%), rgba(255,255,255,.12) 100%);
      pointer-events: none;
    }

    .wheel-chance-thumb {
      position: absolute;
      left: var(--wheel-chance, 20%);
      top: 50%;
      width: 28px;
      height: 28px;
      border-radius: 11px;
      transform: translate(-50%, -50%);
      background: rgba(255,255,255,.16);
      border: 1px solid rgba(255,255,255,.28);
      box-shadow: 0 10px 22px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.26);
      pointer-events: none;
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
      width: 38px;
      height: 38px;
    }

    .wheel-chance-slider::-moz-range-thumb {
      width: 38px;
      height: 38px;
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
            <input class="wheel-chance-slider" type="range" min="1" max="50" step="1" value="20" data-wheel-chance />
          </div>
        </div>

        <div class="wheel-quick">
          <button data-wheel-quick="0.1" class="active">0.1</button>
          <button data-wheel-quick="0.5">0.5</button>
          <button data-wheel-quick="1">1</button>
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
      var root = document.getElementById('wheel');
      if (!root || root.dataset.readyWheelCanvasUi) return;
      root.dataset.readyWheelCanvasUi = '1';

      var canvas = root.querySelector('[data-wheel-canvas]');
      var ctx = canvas.getContext('2d');
      var amountInput = root.querySelector('[data-wheel-amount]');
      var chanceInput = root.querySelector('[data-wheel-chance]');
      var chanceShell = root.querySelector('[data-wheel-chance-shell]');
      var chanceText = root.querySelector('[data-wheel-chance-value]');
      var chanceStat = root.querySelector('[data-wheel-count]');
      var multiplierStat = root.querySelector('[data-wheel-pot]');
      var resultStat = root.querySelector('[data-wheel-user]');
      var centerText = root.querySelector('[data-wheel-center]');
      var spinButton = root.querySelector('[data-wheel-join]');
      var angle = 0;
      var spinning = false;
      var houseEdge = .96;
      var pointerAngle = -Math.PI / 2;

      function clampChance(value) {
        return Math.max(1, Math.min(50, Math.round(Number(value) || 20)));
      }

      function multiplierFor(chance) {
        return Math.max(1.01, Math.floor((100 / chance) * houseEdge * 100) / 100);
      }

      function money(n) {
        var x = Number(n) || 0;
        return x.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
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

      function updateUi() {
        var chance = clampChance(chanceInput.value);
        var mult = multiplierFor(chance);
        chanceInput.value = String(chance);
        root.style.setProperty('--wheel-chance', chance + '%');
        if (chanceShell) chanceShell.style.setProperty('--wheel-chance', chance + '%');
        if (chanceText) chanceText.textContent = chance + '%';
        if (chanceStat) chanceStat.textContent = chance + '%';
        if (multiplierStat) multiplierStat.textContent = mult.toFixed(2) + 'x';
        if (centerText) centerText.textContent = chance + '%';
        if (!spinning) draw(angle);
      }

      function slicePath(cx, cy, innerRadius, outerRadius, startAngle, endAngle) {
        var corner = .010;
        var innerStart = startAngle + corner;
        var innerEnd = endAngle - corner;
        var outerStart = startAngle + corner;
        var outerEnd = endAngle - corner;

        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(innerStart) * innerRadius, cy + Math.sin(innerStart) * innerRadius);
        ctx.lineTo(cx + Math.cos(outerStart) * outerRadius, cy + Math.sin(outerStart) * outerRadius);
        ctx.quadraticCurveTo(
          cx + Math.cos(startAngle) * outerRadius,
          cy + Math.sin(startAngle) * outerRadius,
          cx + Math.cos(startAngle + corner * .5) * outerRadius,
          cy + Math.sin(startAngle + corner * .5) * outerRadius
        );
        ctx.arc(cx, cy, outerRadius, outerStart, outerEnd, false);
        ctx.quadraticCurveTo(
          cx + Math.cos(endAngle) * outerRadius,
          cy + Math.sin(endAngle) * outerRadius,
          cx + Math.cos(outerEnd) * outerRadius,
          cy + Math.sin(outerEnd) * outerRadius
        );
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
        var width = 1200;
        var height = 1200;
        var cx = 600;
        var cy = 600;
        var outerRadius = 486;
        var innerRadius = 106;
        var gap = .014;
        var chance = clampChance(chanceInput.value);
        var userArc = Math.PI * 2 * chance / 100;
        var userStart = pointerAngle - userArc / 2 + rotation;
        var userEnd = userStart + userArc;
        var loseStart = userEnd;
        var loseEnd = userStart + Math.PI * 2;

        ctx.clearRect(0, 0, width, height);

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

        slicePath(cx, cy, innerRadius, outerRadius, loseStart + gap, loseEnd - gap);
        ctx.fillStyle = '#17171a';
        ctx.globalAlpha = .86;
        ctx.fill();
        ctx.globalAlpha = 1;
        label('LOSE', (loseStart + loseEnd) / 2, outerRadius * .58, 'rgba(255,255,255,.72)', 44);

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

      function setControlsLocked(locked) {
        amountInput.disabled = !!locked;
        chanceInput.disabled = !!locked;
        root.querySelector('[data-wheel-half]').disabled = !!locked;
        root.querySelector('[data-wheel-double]').disabled = !!locked;
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

        function ease(t) {
          return 1 - Math.pow(1 - t, 4);
        }

        function frame(now) {
          var p = Math.min(1, (now - started) / duration);
          angle = start + (finalAngle - start) * ease(p);
          draw(angle);
          if (p < 1) {
            requestAnimationFrame(frame);
            return;
          }

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

      function normalizeDelta(delta) {
        var full = Math.PI * 2;
        while (delta < 0) delta += full;
        while (delta >= full) delta -= full;
        return delta;
      }

      root.querySelectorAll('[data-wheel-quick]').forEach(function (button) {
        button.onclick = function () {
          if (spinning) return;
          root.querySelectorAll('[data-wheel-quick]').forEach(function (item) {
            item.classList.remove('active');
          });
          button.classList.add('active');
          amountInput.value = button.getAttribute('data-wheel-quick') || '0.1';
        };
      });

      root.querySelector('[data-wheel-half]').onclick = function () {
        if (spinning) return;
        var value = Math.max(0.1, Number(amountInput.value || '0.1') / 2);
        amountInput.value = String(Math.round(value * 100) / 100).replace(/\.0$/, '');
      };

      root.querySelector('[data-wheel-double]').onclick = function () {
        if (spinning) return;
        var value = Math.max(0.1, Number(amountInput.value || '0.1') * 2);
        amountInput.value = String(Math.round(value * 100) / 100).replace(/\.0$/, '');
      };

      chanceInput.oninput = updateUi;
      spinButton.onclick = spin;
      updateUi();
    })();
  </script>
</section>
`;