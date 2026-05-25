export const WHEEL_SECTION = `
<section id="wheel" class="view wheel-view">
  <style>
    .wheel-view {
      position: relative;
      box-sizing: border-box;
      height: 100%;
      min-height: 100%;
      padding: 0 14px calc(96px + env(safe-area-inset-bottom));
      background: #000 !important;
      color: #fff;
      overflow-y: auto !important;
      overflow-x: hidden;
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
    }

    .wheel-pointer {
      position: absolute;
      top: 2px;
      left: 50%;
      width: 34px;
      height: 64px;
      z-index: 5;
      transform: translateX(-50%);
      filter: drop-shadow(0 12px 18px rgba(0, 0, 0, 0.45));
    }

    .wheel-pointer::before {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(8px);
      clip-path: polygon(50% 100%, 3% 0, 97% 0);
    }

    .wheel-center {
      position: absolute;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.24);
      z-index: 4;
    }

    .wheel-panel { padding: 14px; margin-bottom: 48px; }
    .wheel-controls { display: grid; gap: 10px; }
    .wheel-status { min-height: 20px; color: rgba(255, 255, 255, 0.7); font-size: 12px; text-align: center; font-weight: 800; }
    .wheel-join {
      height: 60px;
      border-radius: 999px;
      font-size: 18px;
      border: 1px solid #fff;
      background: #fff;
      color: #050506;
      font-weight: 900;
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
        <button class="wheel-join" data-wheel-spin>Spin</button>
        <div class="wheel-status" data-wheel-status>UI-only mode: no polling, no bots, no backend game state.</div>
      </div>
    </div>
  </div>

  <script>
    (function () {
      const root = document.getElementById('wheel');
      if (!root || root.dataset.uiOnlyMode) return;
      root.dataset.uiOnlyMode = '1';

      const canvas = root.querySelector('[data-wheel-canvas]');
      const ctx = canvas.getContext('2d');
      const spinButton = root.querySelector('[data-wheel-spin]');
      const statusEl = root.querySelector('[data-wheel-status]');

      const slices = [
        { label: '0.01', color: '#f2f2f2' },
        { label: '0.03', color: '#4a0a1e' },
        { label: '0.05', color: '#19191c' },
        { label: '0.10', color: '#343438' },
        { label: '0.20', color: '#101012' }
      ];

      let angle = -Math.PI / 2;
      let spinning = false;

      function drawWheel() {
        const w = 1200;
        const h = 1200;
        const cx = 600;
        const cy = 600;
        const r = 486;
        const ri = 106;

        ctx.clearRect(0, 0, w, h);

        slices.forEach(function (slice, index) {
          const start = angle + (index / slices.length) * Math.PI * 2;
          const end = angle + ((index + 1) / slices.length) * Math.PI * 2;
          const mid = (start + end) / 2;

          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(start) * ri, cy + Math.sin(start) * ri);
          ctx.arc(cx, cy, r, start, end, false);
          ctx.arc(cx, cy, ri, end, start, true);
          ctx.closePath();

          ctx.fillStyle = slice.color;
          ctx.fill();

          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(mid);
          ctx.fillStyle = slice.color === '#f2f2f2' ? '#080809' : '#fff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = '900 44px system-ui';
          ctx.fillText(slice.label, r * 0.58, 0);
          ctx.restore();
        });
      }

      function easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
      }

      function spin() {
        if (spinning) return;
        spinning = true;
        statusEl.textContent = 'Spinning...';

        const winnerIndex = Math.floor(Math.random() * slices.length);
        const targetSliceMid = (winnerIndex + 0.5) / slices.length;
        const pointerAngle = -Math.PI / 2;
        const start = angle;
        const end = pointerAngle - targetSliceMid * Math.PI * 2 - Math.PI * 2 * 6;
        const startedAt = performance.now();
        const duration = 3500;

        function step(now) {
          const t = Math.min(1, (now - startedAt) / duration);
          angle = start + (end - start) * easeOutQuart(t);
          drawWheel();

          if (t < 1) {
            requestAnimationFrame(step);
            return;
          }

          spinning = false;
          statusEl.textContent = 'Result: ' + slices[winnerIndex].label + ' TON (local simulation)';
        }

        requestAnimationFrame(step);
      }

      spinButton.addEventListener('click', spin);
      drawWheel();
    })();
  </script>
</section>`;
