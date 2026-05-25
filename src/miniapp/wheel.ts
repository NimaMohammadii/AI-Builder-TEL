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
      gap: 14px;
    }

    .wheel-stage {
      position: relative;
      height: 398px;
      display: grid;
      place-items: center;
      margin-top: 8px;
    }

    .wheel-canvas {
      position: relative;
      z-index: 1;
      width: min(376px, 91vw);
      height: min(376px, 91vw);
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
      filter: drop-shadow(0 12px 18px rgba(0, 0, 0, .45));
    }

    .wheel-pointer:before {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(255, 255, 255, .08);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 0 !important;
      outline: 0 !important;
      box-shadow: none !important;
      clip-path: polygon(50% 100%, 3% 0, 97% 0);
    }

    .wheel-center {
      position: absolute;
      width: 60px;
      height: 60px;
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
      font-size: 10px;
      color: rgba(255, 255, 255, .62);
      letter-spacing: -.04em;
      text-shadow: 0 2px 8px rgba(0, 0, 0, .75);
    }

    .wheel-panel {
      position: relative;
      border: 0 !important;
      border-radius: 28px;
      background: transparent !important;
      box-shadow: none !important;
      padding: 14px;
      margin-bottom: 48px;
    }

    .wheel-controls {
      display: grid;
      gap: 10px;
    }

    .wheel-input-row {
      display: grid;
      grid-template-columns: 1fr auto;
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

    .wheel-input-row span {
      height: 50px;
      min-width: 64px;
      border-radius: 18px;
      border: 1px solid rgba(255, 255, 255, .1);
      background: rgba(0, 0, 0, .35);
      display: grid;
      place-items: center;
      font-weight: 950;
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
      height: 60px;
      border-radius: 999px;
      font-size: 18px;
      background: #fff;
      color: #050506;
      letter-spacing: -.045em;
      border-color: #fff;
      box-shadow: 0 14px 28px rgba(0, 0, 0, .58);
    }

    .wheel-status {
      min-height: 20px;
      color: rgba(255, 255, 255, .7);
      font-size: 12px;
      text-align: center;
      font-weight: 800;
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
        height: 376px;
      }

      .wheel-canvas {
        width: min(356px, 92vw);
        height: min(356px, 92vw);
      }

      .wheel-center {
        width: 56px;
        height: 56px;
      }
    }
  </style>

  <div class="wheel-wrap">
    <div class="wheel-stage">
      <div class="wheel-pointer"></div>
      <canvas class="wheel-canvas" width="1200" height="1200" data-wheel-canvas></canvas>
      <div class="wheel-center"><b>WHEEL</b></div>
    </div>

    <div class="wheel-panel">
      <div class="wheel-controls">
        <div class="wheel-input-row">
          <input data-wheel-amount inputmode="decimal" pattern="[0-9.]*" value="0.01" />
          <span>TON</span>
        </div>

        <div class="wheel-quick">
          <button data-wheel-quick="0.01" class="active">0.01</button>
          <button data-wheel-quick="0.05">0.05</button>
          <button data-wheel-quick="0.1">0.1</button>
        </div>

        <button class="wheel-join" data-wheel-join>Join Round</button>
        <div class="wheel-status" data-wheel-status>UI preview only</div>
      </div>

      <div class="wheel-stats">
        <div class="wheel-stat"><small>PLAYERS</small><b data-wheel-count>0/5</b></div>
        <div class="wheel-stat"><small>POT</small><b data-wheel-pot>0 TON</b></div>
        <div class="wheel-stat"><small>YOUR BET</small><b data-wheel-user>0 TON</b></div>
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
      var joinBtn = root.querySelector('[data-wheel-join]');
      var statusEl = root.querySelector('[data-wheel-status]');
      var colors = ['#f2f2f2', '#4a0a1e', '#19191c', '#343438', '#101012'];
      var angle = -Math.PI / 2;

      function slicePath(cx, cy, innerRadius, outerRadius, startAngle, endAngle) {
        var span = Math.max(.001, endAngle - startAngle);
        var curve = Math.min(.078, span * .34);
        var middleRadius = (innerRadius + outerRadius) / 2;
        var innerStart = startAngle + curve;
        var innerEnd = endAngle - curve;
        var outerStart = startAngle + curve;
        var outerEnd = endAngle - curve;

        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(innerStart) * innerRadius, cy + Math.sin(innerStart) * innerRadius);
        ctx.arc(cx, cy, innerRadius, innerStart, innerEnd, false);
        ctx.quadraticCurveTo(
          cx + Math.cos(endAngle) * innerRadius,
          cy + Math.sin(endAngle) * innerRadius,
          cx + Math.cos(endAngle) * middleRadius,
          cy + Math.sin(endAngle) * middleRadius
        );
        ctx.quadraticCurveTo(
          cx + Math.cos(endAngle) * outerRadius,
          cy + Math.sin(endAngle) * outerRadius,
          cx + Math.cos(outerEnd) * outerRadius,
          cy + Math.sin(outerEnd) * outerRadius
        );
        ctx.arc(cx, cy, outerRadius, outerEnd, outerStart, true);
        ctx.quadraticCurveTo(
          cx + Math.cos(startAngle) * outerRadius,
          cy + Math.sin(startAngle) * outerRadius,
          cx + Math.cos(startAngle) * middleRadius,
          cy + Math.sin(startAngle) * middleRadius
        );
        ctx.quadraticCurveTo(
          cx + Math.cos(startAngle) * innerRadius,
          cy + Math.sin(startAngle) * innerRadius,
          cx + Math.cos(innerStart) * innerRadius,
          cy + Math.sin(innerStart) * innerRadius
        );
        ctx.closePath();
      }

      function draw() {
        var width = 1200;
        var height = 1200;
        var cx = 600;
        var cy = 600;
        var outerRadius = 486;
        var innerRadius = 106;
        var gap = .016;
        var values = ['0.01', '0.01', '0.01', '0.01', '0.01'];

        ctx.clearRect(0, 0, width, height);

        ctx.beginPath();
        ctx.arc(cx, cy, outerRadius + 42, 0, Math.PI * 2);
        ctx.fillStyle = '#030304';
        ctx.fill();

        values.forEach(function (value, index) {
          var start = angle + index / values.length * Math.PI * 2 + gap;
          var end = angle + (index + 1) / values.length * Math.PI * 2 - gap;
          var middle = (start + end) / 2;
          var color = colors[index % colors.length];

          slicePath(cx, cy, innerRadius, outerRadius, start, end);
          ctx.fillStyle = color;
          ctx.globalAlpha = .72;
          ctx.fill();
          ctx.globalAlpha = 1;

          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(middle);
          ctx.fillStyle = color === '#f2f2f2' ? '#080809' : '#fff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = '900 46px system-ui';
          ctx.fillText(value, outerRadius * .58, 0);
          ctx.restore();
        });

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

      root.querySelectorAll('[data-wheel-quick]').forEach(function (button) {
        button.onclick = function () {
          root.querySelectorAll('[data-wheel-quick]').forEach(function (item) {
            item.classList.remove('active');
          });
          button.classList.add('active');
          amountInput.value = button.getAttribute('data-wheel-quick') || '0.01';
          statusEl.textContent = 'UI preview only';
        };
      });

      joinBtn.onclick = function () {
        statusEl.textContent = 'UI preview only';
      };

      draw();
    })();
  </script>
</section>
`;
