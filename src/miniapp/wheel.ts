export const WHEEL_SECTION = `
<section id="wheel" class="view wheel-view">
  <style>
    html:has(#wheel.active),
    body:has(#wheel.active) {
      background: #020102 !important;
      background-color: #020102 !important;
    }

    body:has(#wheel.active) .app,
    body:has(#wheel.active) main.app,
    body:has(#wheel.active) .content,
    body:has(#wheel.active) .view.active,
    body:has(#wheel.active) #wheel,
    body:has(#wheel.active) .wheel-view,
    body:has(#wheel.active) .top,
    body:has(#wheel.active) header.top {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      box-shadow: none !important;
    }

    body:has(#wheel.active)::before {
      content: '';
      position: fixed;
      inset: 0;
      z-index: -3;
      background: radial-gradient(ellipse 118% 55% at 48% -10%, rgba(64,8,28,.58), transparent 62%), radial-gradient(ellipse 92% 15% at 50% 40%, rgba(0,0,0,.36), transparent 74%), linear-gradient(23deg, transparent 0 39%, rgba(0,0,0,.20) 47%, transparent 60%), linear-gradient(154deg, transparent 0 37%, rgba(0,0,0,.19) 48%, transparent 62%), radial-gradient(ellipse 68% 42% at 50% 42%, rgba(72,9,32,.28), transparent 68%), radial-gradient(ellipse 52% 38% at -8% 46%, rgba(92,12,38,.30), transparent 70%), radial-gradient(ellipse 54% 40% at 108% 44%, rgba(58,6,28,.32), transparent 70%), radial-gradient(ellipse 42% 34% at 4% 94%, rgba(48,5,24,.24), transparent 72%), radial-gradient(ellipse 42% 34% at 96% 92%, rgba(48,5,24,.24), transparent 72%), radial-gradient(ellipse 86% 48% at 20% 2%, rgba(78,10,34,.42), transparent 66%), radial-gradient(ellipse 82% 50% at 96% 8%, rgba(32,3,18,.62), transparent 64%), linear-gradient(180deg, #030102 0%, #070205 34%, #050303 62%, #010101 100%) !important;
      pointer-events: none;
    }

    body:has(#wheel.active)::after {
      content: '';
      position: fixed;
      inset: 0;
      z-index: -2;
      background: linear-gradient(166deg, transparent 0 41%, rgba(96,12,42,.14) 48%, rgba(0,0,0,.24) 55%, transparent 66%), linear-gradient(18deg, transparent 0 42%, rgba(92,10,40,.13) 49%, rgba(0,0,0,.22) 56%, transparent 67%), radial-gradient(ellipse 78% 42% at 50% 10%, rgba(255,230,238,.040), transparent 60%), radial-gradient(ellipse 88% 18% at 50% 34%, rgba(0,0,0,.26), transparent 76%), radial-gradient(ellipse 62% 34% at 50% 50%, rgba(255,205,220,.014), transparent 70%), linear-gradient(180deg, rgba(255,210,225,.012), transparent 22%, rgba(0,0,0,.30) 100%) !important;
      pointer-events: none;
    }

    body:has(#wheel.active) .app::before {
      content: '';
      position: absolute;
      left: -26%;
      right: -26%;
      top: -10%;
      height: 72%;
      z-index: 0;
      background: radial-gradient(ellipse 72% 70% at 48% 4%, rgba(82,10,36,.40), transparent 66%), radial-gradient(ellipse 96% 14% at 50% 45%, rgba(0,0,0,.30), transparent 78%), linear-gradient(24deg, transparent 0 44%, rgba(0,0,0,.21) 52%, transparent 66%), linear-gradient(151deg, transparent 0 43%, rgba(0,0,0,.20) 52%, transparent 67%), linear-gradient(92deg, transparent 0 44%, rgba(96,12,42,.10) 51%, rgba(0,0,0,.13) 58%, transparent 68%), radial-gradient(ellipse 70% 58% at 52% 52%, rgba(76,9,34,.24), transparent 70%), radial-gradient(ellipse 50% 60% at 4% 48%, rgba(98,12,40,.23), transparent 72%), radial-gradient(ellipse 50% 60% at 98% 44%, rgba(62,6,30,.26), transparent 72%), radial-gradient(ellipse 62% 72% at 20% 16%, rgba(98,12,40,.28), transparent 70%), radial-gradient(ellipse 66% 72% at 88% 8%, rgba(28,3,18,.66), transparent 72%) !important;
      pointer-events: none;
    }

    body:has(#wheel.active) .app::after {
      content: '';
      position: absolute;
      inset: 0;
      z-index: 0;
      background: linear-gradient(160deg, transparent 0 40%, rgba(0,0,0,.14) 50%, transparent 61%), linear-gradient(26deg, transparent 0 42%, rgba(0,0,0,.12) 51%, transparent 62%), linear-gradient(180deg, rgba(255,220,232,.010), transparent 26%, rgba(0,0,0,.20) 100%) !important;
      pointer-events: none;
    }

    body:has(#wheel.active) .content::before,
    body:has(#wheel.active) .content::after,
    body:has(#wheel.active) #wheel::before,
    body:has(#wheel.active) #wheel::after {
      background: transparent !important;
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
      top: 18px;
      left: 50%;
      width: 38px;
      height: 34px;
      z-index: 5;
      transform: translateX(-50%);
      background: transparent !important;
      filter: drop-shadow(0 12px 22px rgba(0, 0, 0, .78)) drop-shadow(0 0 8px rgba(255, 255, 255, .16));
    }

    .wheel-pointer:before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 0;
      height: 0;
      border-left: 19px solid transparent !important;
      border-right: 19px solid transparent !important;
      border-top: 34px solid rgba(255,255,255,.94) !important;
      background: transparent !important;
      box-shadow: none !important;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      clip-path: none;
    }

    .wheel-pointer:after {
      content: '';
      position: absolute;
      left: 3px;
      top: 2px;
      width: 0;
      height: 0;
      border-left: 16px solid transparent;
      border-right: 16px solid transparent;
      border-top: 29px solid #030304;
      background: transparent;
      clip-path: none;
      pointer-events: none;
    }

    .wheel-center {
      position: absolute;
      width: 54px;
      height: 54px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: radial-gradient(circle at 34% 24%, rgba(255,255,255,.36), rgba(255,255,255,.10) 33%, rgba(8,8,10,.78) 72%) !important;
      border: 1px solid rgba(255, 255, 255, .34) !important;
      box-shadow: 0 16px 34px rgba(0, 0, 0, .70), inset 0 1px 0 rgba(255, 255, 255, .48), inset 0 -10px 18px rgba(0,0,0,.56), inset 0 0 18px rgba(255,255,255,.08) !important;
      backdrop-filter: blur(8px) saturate(1.28);
      -webkit-backdrop-filter: blur(8px) saturate(1.28);
      z-index: 4;
      text-align: center;
      overflow: hidden;
    }

    .wheel-center:before {
      content: '';
      position: absolute;
      left: 9px;
      top: 7px;
      width: 19px;
      height: 10px;
      border-radius: 50%;
      background: rgba(255,255,255,.32);
      filter: blur(.4px);
      transform: rotate(-22deg);
      pointer-events: none;
    }

    .wheel-center b {
      position: relative;
      font-size: 29px;
      line-height: 1;
      font-family: Georgia, 'Times New Roman', serif;
      font-weight: 900;
      letter-spacing: -.12em;
      padding-right: 2px;
      color: transparent;
      background: linear-gradient(180deg, #ffffff 0%, #d7d7dc 42%, #7f8089 100%);
      -webkit-background-clip: text;
      background-clip: text;
      text-shadow: 0 2px 10px rgba(255,255,255,.20), 0 9px 18px rgba(0,0,0,.84);
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
      left: calc(29px + (100% - 58px) * var(--wheel-ratio, .2));
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
      gap: 1px;
    }

    .wheel-ton-icon {
      width: 24px;
      height: 24px;
      display: inline-block;
      object-fit: contain;
      flex: 0 0 24px;
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
        width: 50px;
        height: 50px;
      }
    }
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
          var usableLeft = rect.left + 29;
          var usableWidth = Math.max(1, rect.width - 58);
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
          var img = new Image();
          img.decoding = 'async';
          img.src = src;
          root.querySelectorAll('[data-wheel-credit-icon]').forEach(function (item) {
            if (item.getAttribute('src') !== src) item.setAttribute('src', src);
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
          if (centerText) centerText.textContent = 'W';
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
          if (normalized > Math.PI / 2 && normalized < Math.PI * 1.5) {
            readableAngle += Math.PI;
          }
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

        function awardXP(amount, source, metadata) {
          if (window.VexaLevel && typeof window.VexaLevel.add === 'function') window.VexaLevel.add(amount, source, metadata || { section: 'wheel' });
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