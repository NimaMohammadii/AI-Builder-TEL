export const WHEEL_SECTION = `
<section id="wheel" class="view wheel-view">
  <style>
    body:has(#wheel.active) {
      background: #000 !important;
    }

    body:has(#wheel.active) .tabs {
      display: none !important;
    }

    .wheel-view {
      min-height: 100%;
      padding: 0 14px calc(96px + env(safe-area-inset-bottom));
      background: #000 !important;
      color: #fff;
      overflow-y: auto !important;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      box-sizing: border-box;
    }

    .wheel-wrap {
      width: 100%;
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

    .wheel-disc {
      position: relative;
      width: min(376px, 91vw);
      height: min(376px, 91vw);
      border-radius: 50%;
      background:
        radial-gradient(circle at center, #0000 0 22%, #000 22.5% 23.5%, #0000 24%),
        conic-gradient(
          from -90deg,
          #f2f2f2 0 72deg,
          #4a0a1e 72deg 144deg,
          #19191c 144deg 216deg,
          #343438 216deg 288deg,
          #101012 288deg 360deg
        );
      box-shadow:
        0 28px 64px rgba(0, 0, 0, .62),
        inset 0 0 0 12px rgba(55, 4, 22, .86),
        inset 0 0 0 15px rgba(255, 255, 255, .16);
      overflow: hidden;
    }

    .wheel-disc::before {
      content: '';
      position: absolute;
      inset: 17%;
      border-radius: 50%;
      background: #000;
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .1);
      z-index: 2;
    }

    .wheel-disc::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: radial-gradient(circle at 32% 24%, rgba(255, 255, 255, .18), transparent 32%);
      opacity: .42;
      z-index: 3;
      pointer-events: none;
    }

    .wheel-pointer {
      position: absolute;
      top: 2px;
      left: 50%;
      width: 34px;
      height: 64px;
      z-index: 5;
      transform: translateX(-50%);
      filter: drop-shadow(0 12px 18px rgba(0, 0, 0, .45));
    }

    .wheel-pointer::before {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(255, 255, 255, .08);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      clip-path: polygon(50% 100%, 3% 0, 97% 0);
    }

    .wheel-center {
      position: absolute;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: rgba(255, 255, 255, .06);
      border: 1px solid rgba(255, 255, 255, .24);
      box-shadow: 0 16px 32px rgba(0, 0, 0, .62), inset 0 1px 0 rgba(255, 255, 255, .32);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      z-index: 6;
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

      .wheel-disc {
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
      <div class="wheel-disc"></div>
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
</section>
`;
