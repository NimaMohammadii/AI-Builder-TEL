export const WHEEL_SECTION = `
<section id="wheel" class="view wheel-view">
  <style>
    html:has(#wheel.active),body:has(#wheel.active){background:#020102!important;background-color:#020102!important}
    body:has(#wheel.active) .app,body:has(#wheel.active) main.app,body:has(#wheel.active) .content,body:has(#wheel.active) .view.active,body:has(#wheel.active) #wheel,body:has(#wheel.active) .wheel-view,body:has(#wheel.active) .top,body:has(#wheel.active) header.top{background:transparent!important;background-color:transparent!important;background-image:none!important;box-shadow:none!important}
    body:has(#wheel.active)::before{content:"";position:fixed;inset:0;z-index:-3;background:radial-gradient(ellipse 110% 58% at 50% -12%,rgba(76,8,30,.62),transparent 62%),radial-gradient(ellipse 70% 40% at 50% 28%,rgba(50,5,22,.36),transparent 70%),linear-gradient(180deg,#030102 0%,#090204 38%,#050203 68%,#010101 100%)!important;pointer-events:none}
    body:has(#wheel.active)::after{content:"";position:fixed;inset:0;z-index:-2;background:radial-gradient(ellipse 80% 42% at 50% 8%,rgba(255,230,238,.035),transparent 62%),linear-gradient(160deg,transparent 0 42%,rgba(90,10,38,.12) 49%,transparent 62%),linear-gradient(180deg,transparent 0 30%,rgba(0,0,0,.36) 100%)!important;pointer-events:none}
    body:has(#wheel.active) .tabs{display:none!important}
    .wheel-view{position:relative;box-sizing:border-box;height:100%;min-height:100%;padding:10px 14px calc(96px + env(safe-area-inset-bottom));background:transparent!important;color:#fff;overflow-y:auto!important;overflow-x:hidden;-webkit-overflow-scrolling:touch}
    .wheel-wrap{position:relative;z-index:1;max-width:520px;margin:0 auto;display:grid;gap:14px}
    .wheel-stage{position:relative;height:360px;display:grid;place-items:center;margin-top:2px}
    .wheel-canvas{position:relative;z-index:1;width:min(342px,88vw);height:min(342px,88vw);filter:drop-shadow(0 28px 38px rgba(0,0,0,.58)) drop-shadow(0 0 24px rgba(74,10,30,.22))}
    .wheel-stage:before{content:"";position:absolute;width:min(350px,90vw);height:min(350px,90vw);border-radius:50%;background:radial-gradient(circle,rgba(82,10,34,.20),rgba(0,0,0,.18) 58%,transparent 72%);filter:blur(10px);pointer-events:none}
    .wheel-pointer{position:absolute;top:12px;left:50%;width:34px;height:30px;z-index:5;transform:translateX(-50%);filter:drop-shadow(0 10px 18px rgba(0,0,0,.78))}
    .wheel-pointer:before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,#fff,#d7c8ce);clip-path:polygon(0 0,100% 0,50% 100%);border-radius:5px}
    .wheel-pointer:after{content:"";position:absolute;left:4px;right:4px;top:3px;height:21px;background:#28050f;clip-path:polygon(0 0,100% 0,50% 100%)}
    .wheel-center{position:absolute;width:60px;height:60px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 34% 24%,rgba(255,255,255,.32),rgba(76,10,31,.92) 38%,#100307 76%)!important;border:1px solid rgba(255,255,255,.28)!important;box-shadow:0 14px 30px rgba(0,0,0,.70),inset 0 1px 0 rgba(255,255,255,.42),inset 0 -10px 18px rgba(0,0,0,.62)!important;z-index:4;overflow:hidden}
    .wheel-center:before{content:"";position:absolute;left:10px;top:8px;width:21px;height:10px;border-radius:50%;background:rgba(255,255,255,.26);transform:rotate(-22deg)}
    .wheel-center b{position:relative;font-size:28px;line-height:1;font-family:Georgia,'Times New Roman',serif;font-weight:900;letter-spacing:-.12em;padding-right:2px;color:#fff;text-shadow:0 2px 10px rgba(255,255,255,.16),0 9px 18px rgba(0,0,0,.84)}
    .wheel-panel{position:relative;border:1px solid rgba(255,255,255,.10)!important;border-radius:28px;background:linear-gradient(180deg,rgba(20,6,11,.92),rgba(7,3,5,.94))!important;box-shadow:0 24px 60px rgba(0,0,0,.48),inset 0 1px 0 rgba(255,255,255,.06)!important;padding:16px;margin-bottom:48px;backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
    .wheel-controls{display:grid;gap:11px}
    .wheel-input-row{display:grid;grid-template-columns:1fr auto auto;gap:8px}
    .wheel-input-row input{height:50px;border-radius:16px;border:1px solid rgba(255,255,255,.10);background:#0d0709;color:#fff;padding:0 15px;font-size:18px;font-weight:900;outline:none;box-shadow:inset 0 1px 0 rgba(255,255,255,.04)}
    .wheel-multiplier-btn{height:50px;min-width:58px;border-radius:16px;border:1px solid rgba(255,255,255,.10);background:#10080b;color:#fff;display:grid;place-items:center;font-weight:900;font-size:13px;box-shadow:inset 0 1px 0 rgba(255,255,255,.05)}
    .wheel-chance-card{position:relative;border:0!important;background:transparent!important;padding:0;box-shadow:none!important}
    .wheel-chance-head{display:flex;align-items:center;justify-content:space-between;position:absolute;left:18px;right:18px;top:14px;z-index:3;font-size:12px;font-weight:800;color:rgba(255,255,255,.56)}
    .wheel-chance-head b{color:#fff;font-size:14px;font-weight:900;font-variant-numeric:tabular-nums}
    .wheel-chance-shell{--wheel-left-color:#5a0a25;--wheel-right-color:#2a2528;position:relative;height:96px;border-radius:20px;background:#0b0608!important;border:1px solid rgba(255,255,255,.09)!important;overflow:visible;touch-action:none;user-select:none;padding:42px 6px 24px;box-sizing:border-box}
    .wheel-chance-shell:before{content:"";position:absolute;left:20px;right:20px;top:57px;height:10px;background:linear-gradient(90deg,rgba(255,255,255,.09) 0 2px,transparent 2px 25%,rgba(255,255,255,.09) 25% calc(25% + 2px),transparent calc(25% + 2px) 50%,rgba(255,255,255,.09) 50% calc(50% + 2px),transparent calc(50% + 2px) 75%,rgba(255,255,255,.09) 75% calc(75% + 2px),transparent calc(75% + 2px));clip-path:polygon(0 100%,1.6% 0,3.2% 100%,25% 100%,26.6% 0,28.2% 100%,50% 100%,51.6% 0,53.2% 100%,75% 100%,76.6% 0,78.2% 100%,100% 100%);opacity:.5;pointer-events:none}
    .wheel-chance-fill{position:absolute;left:12px;right:12px;top:63%;height:30px;border-radius:999px;transform:translateY(-50%);background:#080507;border:1px solid rgba(255,255,255,.10);box-shadow:inset 0 1px 0 rgba(255,255,255,.12);pointer-events:none}
    .wheel-chance-fill:before{content:"";position:absolute;left:16px;right:16px;top:50%;height:12px;border-radius:999px;transform:translateY(-50%);background:linear-gradient(90deg,var(--wheel-left-color) 0%,var(--wheel-left-color) var(--wheel-pos,20%),var(--wheel-right-color) var(--wheel-pos,20%),var(--wheel-right-color) 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.08)}
    .wheel-chance-thumb{position:absolute;left:calc(29px + (100% - 58px) * var(--wheel-ratio,.2));top:63%;width:34px;height:34px;border-radius:50%;transform:translate(-50%,-50%);background:var(--wheel-thumb-color,#5a0a25);border:1px solid rgba(255,255,255,.34);box-shadow:0 12px 26px rgba(0,0,0,.58),inset 0 1px 0 rgba(255,255,255,.36);pointer-events:none}
    .wheel-chance-thumb:before{content:"";position:absolute;left:50%;top:50%;width:13px;height:13px;transform:translate(-50%,-50%);border-radius:50%;background:rgba(255,255,255,.68);box-shadow:0 0 0 4px rgba(0,0,0,.16)}
    .wheel-chance-slider{position:absolute;inset:0;z-index:2;width:100%;height:100%;margin:0;opacity:0;appearance:none;-webkit-appearance:none;cursor:pointer}
    .wheel-chance-slider::-webkit-slider-thumb{-webkit-appearance:none;width:52px;height:52px}.wheel-chance-slider::-moz-range-thumb{width:52px;height:52px;border:0}
    .wheel-quick{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
    .wheel-quick button,.wheel-join{border:1px solid rgba(255,255,255,.10);border-radius:16px;background:#10080b;color:#fff;font-weight:900;height:44px;box-shadow:inset 0 1px 0 rgba(255,255,255,.05)}
    .wheel-quick button{display:inline-flex;align-items:center;justify-content:center;gap:1px}.wheel-ton-icon{width:24px;height:24px;display:inline-block;object-fit:contain;flex:0 0 24px}.wheel-quick button.active{background:#4a0a1e;border-color:#721239;color:#ffe4ec}
    .wheel-join{height:58px;font-size:17px;background:linear-gradient(180deg,#65102d,#3b0718);color:#fff0f4;border-color:rgba(255,120,153,.20);box-shadow:0 14px 28px rgba(0,0,0,.46),inset 0 1px 0 rgba(255,255,255,.11);transition:transform .18s ease,opacity .18s ease}.wheel-join:active{transform:scale(.975)}.wheel-join:disabled{opacity:.62}.wheel-join.win{background:#0f3f2a;border-color:rgba(120,255,179,.22);color:#d8ffe8}
    .wheel-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}.wheel-stat{border:1px solid rgba(255,255,255,.08);border-radius:16px;background:#0b0608;padding:11px;text-align:center}.wheel-stat small{display:block;color:rgba(255,255,255,.42);font-size:9px;font-weight:800}.wheel-stat b{display:block;margin-top:4px;font-size:14px}.wheel-players{display:grid;gap:8px;margin-top:12px}
    @media(max-width:420px){.wheel-stage{height:348px}.wheel-canvas{width:min(330px,89vw);height:min(330px,89vw)}.wheel-center{width:56px;height:56px}}
  </style>

  <div class="wheel-wrap">
    <div class="wheel-stage">
      <div class="wheel-pointer"></div>
      <canvas class="wheel-canvas" width="1200" height="1200" data-wheel-canvas></canvas>
      <div class="wheel-center"><b data-wheel-center>W</b></div>
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
          <button data-wheel-quick="0.1" class="active"><span>0.1</span><img class="wheel-ton-icon" src="/app/api/uploaded-image/ton-icon.png" alt="TON" loading="eager" decoding="async" data-wheel-credit-icon /></button>
          <button data-wheel-quick="0.5"><span>0.5</span><img class="wheel-ton-icon" src="/app/api/uploaded-image/ton-icon.png" alt="TON" loading="eager" decoding="async" data-wheel-credit-icon /></button>
          <button data-wheel-quick="1"><span>1</span><img class="wheel-ton-icon" src="/app/api/uploaded-image/ton-icon.png" alt="TON" loading="eager" decoding="async" data-wheel-credit-icon /></button>
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
        var pointerAngle = 0;
        var creditIconSrc = '/app/api/uploaded-image/ton-icon.png?v=' + Date.now();

        function clampChance(value) { return Math.max(minChance, Math.min(maxChance, Math.round(Number(value) || 20))); }
        function chanceToRatio(chance) { return (clampChance(chance) - minChance) / Math.max(1, maxChance - minChance); }
        function chanceToPos(chance) { return chanceToRatio(chance) * 100; }
        function posToChance(pos) { var clampedPos = Math.max(minChance, Math.min(maxChance, pos)); return clampChance(clampedPos); }
        function chanceFromClientX(clientX) { var rect = chanceShell.getBoundingClientRect(); var usableLeft = rect.left + 29; var usableWidth = Math.max(1, rect.width - 58); var pos = ((clientX - usableLeft) / usableWidth) * 100; return posToChance(pos); }
        function multiplierFor(chance) { return Math.max(1.01, Math.floor((100 / chance) * houseEdge * 100) / 100); }
        function money(n) { var x = Number(n) || 0; var text = x.toFixed(2); if (text.slice(-3) === '.00') return text.slice(0, -3); if (text.charAt(text.length - 1) === '0') return text.slice(0, -1); return text; }
        function balance() { return window.VexaTonBalance ? Math.max(0, Math.floor(Number(window.VexaTonBalance.read()) || 0)) : 0; }
        function changeBalance(deltaNano) { if (window.VexaTonBalance) window.VexaTonBalance.add(Math.floor(Number(deltaNano) || 0)); }
        function toNano(value) { return Math.max(0, Math.floor((Number(String(value || '').replace(',', '.')) || 0) * 1000000000)); }
        function hydrateCreditIcons() { var src = creditIconSrc; var img = new Image(); img.decoding = 'async'; img.src = src; root.querySelectorAll('[data-wheel-credit-icon]').forEach(function (item) { if (item.getAttribute('src') !== src) item.setAttribute('src', src); }); }

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
          if (centerText) centerText.textContent = 'W';
          if (!spinning) draw(angle);
        }

        function setChanceFromClientX(clientX) { if (spinning || chanceInput.disabled) return; chanceInput.value = String(chanceFromClientX(clientX)); updateUi(); }
        function startDrag(event) { if (spinning || chanceInput.disabled) return; dragging = true; chanceShell.classList.add('dragging'); if (chanceShell.setPointerCapture && event.pointerId != null) chanceShell.setPointerCapture(event.pointerId); setChanceFromClientX(event.clientX); event.preventDefault(); }
        function moveDrag(event) { if (!dragging) return; setChanceFromClientX(event.clientX); event.preventDefault(); }
        function endDrag(event) { if (!dragging) return; dragging = false; chanceShell.classList.remove('dragging'); if (chanceShell.releasePointerCapture && event && event.pointerId != null) { try { chanceShell.releasePointerCapture(event.pointerId); } catch (e) {} } }

        function slicePath(cx, cy, innerRadius, outerRadius, startAngle, endAngle) {
          var corner = .03;
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
          var full = Math.PI * 2;
          var normalized = ((angleValue % full) + full) % full;
          var readableAngle = angleValue;
          if (normalized > Math.PI / 2 && normalized < Math.PI * 1.5) readableAngle += Math.PI;
          ctx.save();
          ctx.translate(cx + Math.cos(angleValue) * radius, cy + Math.sin(angleValue) * radius);
          ctx.rotate(readableAngle);
          ctx.fillStyle = color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = '900 ' + size + 'px system-ui';
          ctx.fillText(text, 0, 0);
          ctx.restore();
        }

        function draw(rotation) {
          var cx = 600;
          var cy = 600;
          var outerRadius = 486;
          var innerRadius = 94;
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

        function chooseTargetOffset(win, chance) { var userArc = Math.PI * 2 * chance / 100; if (win) { var winSafe = Math.max(.01, userArc * .38); return (Math.random() * winSafe * 2) - winSafe; } var loseSafe = Math.PI * 2 - userArc - .20; return userArc / 2 + .10 + Math.random() * Math.max(.12, loseSafe); }
        function normalizeDelta(delta) { var full = Math.PI * 2; while (delta < 0) delta += full; while (delta >= full) delta -= full; return delta; }
        function setControlsLocked(locked) { amountInput.disabled = !!locked; chanceInput.disabled = !!locked; halfButton.disabled = !!locked; doubleButton.disabled = !!locked; root.querySelectorAll('[data-wheel-quick]').forEach(function (button) { button.disabled = !!locked; }); }
        function awardXP(amount, source, metadata) { if (window.VexaLevel && typeof window.VexaLevel.add === 'function') window.VexaLevel.add(amount, source, metadata || { section: 'wheel' }); }

        function spin() {
          if (spinning) return;
          var chance = clampChance(chanceInput.value);
          var betNano = toNano(amountInput.value);
          var mult = multiplierFor(chance);
          if (betNano <= 0) return;
          if (window.VexaTonBalance && balance() < betNano) { if (resultStat) resultStat.textContent = 'No TON'; return; }
          spinning = true;
          awardXP(2, 'game-start', { section: 'wheel', event: 'spin' });
          setControlsLocked(true);
          spinButton.disabled = true;
          spinButton.classList.remove('win');
          spinButton.textContent = 'Spinning...';
          if (resultStat) resultStat.textContent = 'Spinning';
          changeBalance(-betNano);
          var win = window.VexaGameChance && typeof window.VexaGameChance.decideNative === 'function' ? window.VexaGameChance.decideNative(chance) : Math.random() * 100 < chance;
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
              awardXP(mult >= 10 ? 60 : (mult >= 4 ? 30 : 12), 'game-win', { section: 'wheel', event: 'spin-finish', result: 'win', multiplier: mult });
              changeBalance(payout);
              spinButton.classList.add('win');
              spinButton.textContent = 'Won +' + money(payout / 1000000000) + ' TON';
              if (resultStat) resultStat.textContent = '+' + money(payout / 1000000000) + ' TON';
            } else {
              awardXP(4, 'game-lose', { section: 'wheel', event: 'spin-finish', result: 'no-win', multiplier: mult });
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
        halfButton.addEventListener('click', function () { if (spinning) return; var value = Math.max(0.1, Number(amountInput.value || '0.1') / 2); amountInput.value = String(Math.round(value * 100) / 100).replace(/\.0$/, ''); });
        doubleButton.addEventListener('click', function () { if (spinning) return; var value = Math.max(0.1, Number(amountInput.value || '0.1') * 2); amountInput.value = String(Math.round(value * 100) / 100).replace(/\.0$/, ''); });
        chanceInput.min = String(minChance);
        chanceInput.max = String(maxChance);
        hydrateCreditIcons();
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