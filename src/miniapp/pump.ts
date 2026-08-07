export const PUMP_SECTION = `
<section id="coinflip" class="view pump-view">
  <style>
    body:has(#coinflip.active) .tabs {
      display: none !important;
    }

    body:has(#coinflip.active) .app,
    body:has(#coinflip.active) .content,
    body:has(#coinflip.active) .view.active,
    body:has(#coinflip.active) #coinflip,
    body:has(#coinflip.active) header.top {
      background: transparent !important;
      background-image: none !important;
      box-shadow: none !important;
    }

    body:has(#coinflip.active)::before {
      content: '';
      position: fixed;
      inset: 0;
      z-index: -3;
      background:
        radial-gradient(ellipse 110% 54% at 50% -14%, rgba(58, 4, 24, .62), transparent 62%),
        radial-gradient(ellipse 64% 38% at 50% 25%, rgba(72, 7, 31, .17), transparent 70%),
        linear-gradient(180deg, #040102 0%, #090205 44%, #010101 100%);
      pointer-events: none;
    }

    .pump-view {
      height: 100%;
      min-height: 100%;
      padding: 0 14px calc(78px + env(safe-area-inset-bottom));
      box-sizing: border-box;
      overflow-y: auto !important;
      overflow-x: hidden;
      color: #fff;
      background: transparent !important;
    }

    body:has(#coinflip.active) #coinflip.has-admin-background {
      background-color: transparent !important;
      background-image: var(--admin-section-background-image) !important;
      background-size: cover !important;
      background-position: center top !important;
      background-repeat: no-repeat !important;
    }

    .pump-page {
      width: min(100%, 430px);
      min-height: calc(100vh - 96px);
      margin: 0 auto;
      padding-top: 22px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      gap: 10px;
      box-sizing: border-box;
    }

    .pump-stage {
      position: relative;
      min-height: 354px;
      display: grid;
      place-items: center;
      padding-top: 10px;
      box-sizing: border-box;
    }

    .pump-stage::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: 30px;
      width: 270px;
      height: 66px;
      transform: translateX(-50%);
      border-radius: 50%;
      background: radial-gradient(ellipse at center, rgba(92, 8, 34, .20), transparent 74%);
      filter: blur(18px);
      pointer-events: none;
    }

    .pump-balloon-wrap {
      --pump-scale: 1;
      position: relative;
      width: 296px;
      height: 320px;
      display: grid;
      place-items: center;
      transform-origin: 50% 82%;
      filter: drop-shadow(0 30px 50px rgba(0, 0, 0, .82));
    }

    .pump-balloon-wrap.is-pumping .pump-balloon-svg {
      animation: balloonInflate .42s cubic-bezier(.16, .98, .34, 1) both;
    }

    .pump-balloon-wrap.is-pumping .pump-nozzle {
      animation: nozzlePulse .24s ease both;
    }

    .pump-balloon-wrap.is-popped {
      animation: pumpPop .38s ease both;
    }

    .pump-balloon-svg {
      position: relative;
      z-index: 2;
      width: 242px;
      height: 280px;
      overflow: visible;
      transform: scale(var(--pump-scale));
      transform-origin: 50% 78%;
      transition: transform .28s cubic-bezier(.18, .88, .26, 1), filter .24s ease;
      will-change: transform;
    }

    .pump-inflated-art,
    .pump-empty-art {
      transition: opacity .30s ease, transform .34s cubic-bezier(.18, .88, .26, 1);
      transform-origin: 130px 238px;
    }

    .pump-empty-art {
      opacity: 0;
      transform: translateY(16px) rotate(-5deg) scale(.88, .44);
    }

    .pump-balloon-wrap.is-empty .pump-inflated-art {
      opacity: 0;
      transform: translateY(34px) rotate(-7deg) scale(.86, .34);
    }

    .pump-balloon-wrap.is-empty .pump-empty-art {
      opacity: 1;
      transform: translateY(0) rotate(-5deg) scale(1);
    }

    .pump-multiplier {
      font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 43px;
      font-weight: 950;
      letter-spacing: -3px;
      fill: #fff;
      paint-order: stroke;
      stroke: rgba(18, 0, 8, .38);
      stroke-width: 2px;
      text-shadow: 0 2px 18px rgba(0, 0, 0, .62), 0 0 20px rgba(125, 14, 48, .32);
      pointer-events: none;
      transition: opacity .22s ease, transform .28s ease;
    }

    .pump-balloon-wrap.is-empty .pump-multiplier {
      opacity: .42;
      transform: translateY(54px) scale(.78);
    }

    .pump-inflator {
      position: absolute;
      left: 50%;
      bottom: 14px;
      width: 168px;
      height: 92px;
      transform: translateX(-50%);
      pointer-events: none;
      z-index: 3;
    }

    .pump-hose {
      position: absolute;
      left: 50%;
      bottom: 24px;
      width: 112px;
      height: 56px;
      transform: translateX(-50%);
      border-bottom: 5px solid rgba(112, 17, 45, .78);
      border-left: 5px solid rgba(112, 17, 45, .62);
      border-radius: 0 0 0 38px;
      filter: drop-shadow(0 5px 10px rgba(0, 0, 0, .45));
    }

    .pump-hose::after {
      content: '';
      position: absolute;
      right: -8px;
      bottom: -7px;
      width: 18px;
      height: 10px;
      border-radius: 999px;
      background: linear-gradient(180deg, rgba(255, 215, 226, .28), rgba(42, 3, 18, .98));
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, .14);
    }

    .pump-nozzle {
      position: absolute;
      left: 50%;
      top: 2px;
      width: 14px;
      height: 58px;
      transform: translateX(-50%);
      border-radius: 999px;
      background: linear-gradient(180deg, rgba(255, 213, 226, .35), rgba(72, 8, 30, .82) 48%, rgba(14, 0, 7, .98));
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, .20),
        0 0 14px rgba(88, 7, 36, .20);
    }

    .pump-mini-pump {
      position: absolute;
      left: 10px;
      bottom: 0;
      width: 62px;
      height: 34px;
      border-radius: 18px;
      background:
        radial-gradient(circle at 30% 26%, rgba(255, 255, 255, .15), transparent 24%),
        linear-gradient(180deg, rgba(70, 7, 30, .95), rgba(14, 0, 7, .99));
      border: 1px solid rgba(255, 220, 232, .10);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, .12),
        inset -8px -10px 16px rgba(0, 0, 0, .40),
        0 12px 24px rgba(0, 0, 0, .42);
    }

    .pump-controls {
      width: min(100%, 392px);
      margin: 0 auto;
      padding: 22px 16px 18px;
      border-radius: 32px;
      background: rgba(0, 0, 0, .48);
      border: 1px solid rgba(255, 255, 255, .12);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, .07), 0 18px 54px rgba(0, 0, 0, .35);
      backdrop-filter: blur(16px) saturate(1.16);
      -webkit-backdrop-filter: blur(16px) saturate(1.16);
    }

    .pump-label {
      display: block;
      margin: 0 0 10px 4px;
      color: rgba(255, 255, 255, .64);
      font-size: 14px;
      font-weight: 900;
    }

    .pump-bet-row {
      display: grid;
      grid-template-columns: 92px minmax(0, 1fr) 92px;
      gap: 10px;
    }

    .pump-bet-row button,
    .pump-bet-row input {
      height: 56px;
      border-radius: 22px;
      border: 1px solid rgba(255, 255, 255, .13);
      background: rgba(255, 255, 255, .025);
      color: #fff;
      font-size: 20px;
      font-weight: 950;
      text-align: center;
      outline: none;
      box-sizing: border-box;
    }

    .pump-action-row {
      display: grid;
      gap: 10px;
      margin-top: 14px;
    }

    .pump-action,
    .pump-cashout {
      width: 100%;
      height: 62px;
      border-radius: 999px;
      font-size: 21px;
      font-weight: 950;
      border: 0;
    }

    .pump-action {
      color: #0a0608;
      background: linear-gradient(180deg, rgba(255, 255, 255, .98), rgba(218, 218, 220, .95));
    }

    .pump-action.is-playing {
      color: #fff;
      background: linear-gradient(180deg, #6f0d2f, #3c0418 100%);
      border: 1px solid rgba(255, 188, 208, .20);
    }

    .pump-cashout {
      display: none;
      color: #fff;
      background: rgba(255, 255, 255, .045);
      border: 1px solid rgba(255, 255, 255, .12);
    }

    .pump-controls.is-playing .pump-cashout {
      display: block;
    }

    .pump-action:disabled,
    .pump-cashout:disabled,
    .pump-bet-row button:disabled,
    .pump-bet-row input:disabled {
      opacity: .48;
    }

    @keyframes balloonInflate {
      0% { transform: scale(var(--pump-scale)); }
      46% { transform: scale(calc(var(--pump-scale) * 1.07), calc(var(--pump-scale) * .975)); }
      100% { transform: scale(var(--pump-scale)); }
    }

    @keyframes nozzlePulse {
      0% { transform: translateX(-50%) scaleY(1); }
      50% { transform: translateX(-50%) scaleY(.88); }
      100% { transform: translateX(-50%) scaleY(1); }
    }

    @keyframes pumpPop {
      0% { transform: scale(1); opacity: 1; }
      45% { transform: scale(1.18); opacity: .94; }
      100% { transform: scale(.82); opacity: .20; }
    }
  </style>

  <div class="pump-page">
    <div class="pump-stage">
      <div id="pumpBalloonWrap" class="pump-balloon-wrap">
        <svg class="pump-balloon-svg" viewBox="0 0 260 310" aria-hidden="true">
          <defs>
            <radialGradient id="pumpBody" cx="41%" cy="33%" r="72%">
              <stop offset="0" stop-color="#65102c"/>
              <stop offset="0.38" stop-color="#3c0418"/>
              <stop offset="0.78" stop-color="#190008"/>
              <stop offset="1" stop-color="#070003"/>
            </radialGradient>
            <radialGradient id="pumpShade" cx="72%" cy="74%" r="60%">
              <stop offset="0" stop-color="rgba(0,0,0,.68)"/>
              <stop offset="0.62" stop-color="rgba(0,0,0,.18)"/>
              <stop offset="1" stop-color="rgba(0,0,0,0)"/>
            </radialGradient>
            <radialGradient id="pumpHighlight" cx="34%" cy="22%" r="42%">
              <stop offset="0" stop-color="rgba(255,255,255,.36)"/>
              <stop offset="0.26" stop-color="rgba(255,225,235,.15)"/>
              <stop offset="0.66" stop-color="rgba(255,255,255,0)"/>
            </radialGradient>
            <linearGradient id="pumpNeck" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stop-color="#4b061e"/>
              <stop offset="0.72" stop-color="#120005"/>
            </linearGradient>
            <filter id="pumpSurface" x="-16%" y="-16%" width="132%" height="132%">
              <feTurbulence type="fractalNoise" baseFrequency="0.018 0.035" numOctaves="2" seed="7" result="noise"/>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.1" xChannelSelector="R" yChannelSelector="G" result="distorted"/>
              <feGaussianBlur in="SourceAlpha" stdDeviation="2.6" result="softAlpha"/>
              <feSpecularLighting in="softAlpha" surfaceScale="2.4" specularConstant="0.58" specularExponent="22" lighting-color="#ffd4e0" result="spec">
                <fePointLight x="78" y="26" z="128"/>
              </feSpecularLighting>
              <feComposite in="spec" in2="SourceAlpha" operator="in" result="specClip"/>
              <feMerge>
                <feMergeNode in="distorted"/>
                <feMergeNode in="specClip"/>
              </feMerge>
            </filter>
          </defs>
          <g class="pump-inflated-art" filter="url(#pumpSurface)">
            <path d="M130 20C73 20 38 65 38 127c0 62 35 113 72 128 8 3 13 10 20 10s12-7 20-10c37-15 72-66 72-128C222 65 187 20 130 20Z" fill="url(#pumpBody)"/>
            <path d="M130 20C73 20 38 65 38 127c0 62 35 113 72 128 8 3 13 10 20 10s12-7 20-10c37-15 72-66 72-128C222 65 187 20 130 20Z" fill="url(#pumpShade)" opacity="0.88"/>
            <path d="M130 20C73 20 38 65 38 127c0 62 35 113 72 128 8 3 13 10 20 10s12-7 20-10c37-15 72-66 72-128C222 65 187 20 130 20Z" fill="url(#pumpHighlight)" opacity="0.82"/>
            <path d="M77 77c17-24 51-34 82-22" fill="none" stroke="rgba(255,255,255,.11)" stroke-width="7" stroke-linecap="round" opacity=".58"/>
            <ellipse cx="91" cy="79" rx="25" ry="15" transform="rotate(-22 91 79)" fill="rgba(255,255,255,.13)"/>
            <path d="M114 252c9 5 23 5 32 0l-16 34-16-34Z" fill="url(#pumpNeck)"/>
          </g>
          <g class="pump-empty-art" filter="url(#pumpSurface)">
            <path d="M54 210c26-30 86-41 144-18 17 7 25 20 16 31-13 17-62 25-116 16-35-6-58-17-44-29Z" fill="url(#pumpBody)" opacity=".94"/>
            <path d="M62 214c35-13 82-15 136-1" fill="none" stroke="rgba(255,255,255,.10)" stroke-width="6" stroke-linecap="round" opacity=".62"/>
            <path d="M112 236c11 7 26 7 37 0l-19 31-18-31Z" fill="url(#pumpNeck)" opacity=".94"/>
          </g>
          <text id="pumpMultiplier" class="pump-multiplier" x="130" y="154" text-anchor="middle" dominant-baseline="middle">1.00x</text>
        </svg>
        <div class="pump-inflator" aria-hidden="true">
          <div class="pump-nozzle"></div>
          <div class="pump-hose"></div>
          <div class="pump-mini-pump"></div>
        </div>
      </div>
    </div>

    <div id="pumpControls" class="pump-controls">
      <span class="pump-label">Amount</span>
      <div class="pump-bet-row">
        <button id="pumpHalf" type="button">1/2</button>
        <input id="pumpBet" inputmode="decimal" pattern="[0-9.]*" value="1" />
        <button id="pumpDouble" type="button">2x</button>
      </div>
      <div class="pump-action-row">
        <button id="pumpAction" class="pump-action" type="button">Start</button>
        <button id="pumpCashout" class="pump-cashout" type="button">Cash Out</button>
      </div>
    </div>
  </div>

  <script>
    (function(){
      var NANO = 1000000000;
      var state = 'idle';
      var betNano = 0;
      var multiplier = 1;
      var pumps = 0;
      var burstAt = 2;

      function q(id) {
        return document.getElementById(id);
      }

      function readBalanceNano() {
        if (window.VexaTonBalance && typeof window.VexaTonBalance.read === 'function') {
          return Math.max(0, Math.floor(Number(window.VexaTonBalance.read()) || 0));
        }
        return 0;
      }

      function addBalanceNano(delta) {
        var value = Math.floor(Number(delta) || 0);
        if (window.VexaTonBalance && typeof window.VexaTonBalance.add === 'function') {
          window.VexaTonBalance.add(value);
        }
      }

      function toNano(value) {
        var number = Number(String(value || '').replace(',', '.')) || 0;
        return Math.max(0, Math.floor(number * NANO));
      }

      function toTon(nano) {
        var value = Math.max(0, Math.floor(Number(nano) || 0)) / NANO;
        return value.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
      }

      function formatMultiplier(value) {
        return (Math.round((Number(value) || 1) * 100) / 100).toFixed(2) + 'x';
      }

      function hiddenBurstPoint() {
        var forced = window.VexaGameChance && typeof window.VexaGameChance.decideWin === 'function' ? window.VexaGameChance.decideWin() : null;
        if (forced === true) return 24;
        if (forced === false) return 1.01;
        var roll = Math.random();
        var point = 1.18 + Math.pow(roll, 1.9) * 6.2;
        if (Math.random() < .055) point += 4 + Math.random() * 8;
        return Math.min(24, Math.round(point * 100) / 100);
      }

      function currentBetNano() {
        var input = q('pumpBet');
        var nano = toNano(input && input.value);
        return nano < 1 ? NANO : nano;
      }

      function setBetNano(nano) {
        var input = q('pumpBet');
        if (input) input.value = toTon(Math.max(1, Math.floor(Number(nano) || NANO)));
      }

      function normalizeBet() {
        var balance = readBalanceNano();
        var nano = currentBetNano();
        if (balance >= NANO && nano > balance) nano = balance;
        setBetNano(nano);
        return nano;
      }

      function render() {
        var wrap = q('pumpBalloonWrap');
        var label = q('pumpMultiplier');
        var controls = q('pumpControls');
        var action = q('pumpAction');
        var cashout = q('pumpCashout');
        var input = q('pumpBet');
        var half = q('pumpHalf');
        var double = q('pumpDouble');
        var playing = state === 'playing';
        var inflated = pumps > 0 || state === 'popped' || state === 'cashed';
        var scale = inflated ? Math.min(1.52, 1 + (multiplier - 1) * .075 + pumps * .014) : 1;

        if (label) label.textContent = formatMultiplier(multiplier);
        if (wrap) {
          wrap.style.setProperty('--pump-scale', scale.toFixed(3));
          wrap.classList.toggle('is-empty', !inflated);
          wrap.classList.toggle('is-popped', state === 'popped');
        }
        if (controls) controls.classList.toggle('is-playing', playing);
        if (action) {
          action.textContent = playing ? 'Pump' : 'Start';
          action.classList.toggle('is-playing', playing);
        }
        if (cashout) {
          cashout.disabled = !playing || pumps < 1;
          cashout.textContent = 'Cash Out ' + formatMultiplier(multiplier);
        }
        if (input) input.disabled = playing;
        if (half) half.disabled = playing;
        if (double) double.disabled = playing;
      }

      function startRound() {
        var balance = readBalanceNano();
        betNano = normalizeBet();

        if (balance < betNano) return;

        state = 'playing';
        multiplier = 1;
        pumps = 0;
        burstAt = hiddenBurstPoint();
        addBalanceNano(-betNano);
        render();
      }

      function resetSoon(delay) {
        setTimeout(function(){
          state = 'idle';
          multiplier = 1;
          pumps = 0;
          render();
        }, delay);
      }

      function pumpOnce() {
        var wrap = q('pumpBalloonWrap');

        if (state !== 'playing') {
          startRound();
          return;
        }

        pumps += 1;
        multiplier = Math.round((multiplier + .09 + multiplier * .085 + pumps * .012) * 100) / 100;

        if (wrap) {
          wrap.classList.remove('is-pumping');
          void wrap.offsetWidth;
          wrap.classList.add('is-pumping');
        }

        if (multiplier >= burstAt) {
          state = 'popped';
          render();
          resetSoon(1250);
          return;
        }

        render();
      }

      function cashOut() {
        if (state !== 'playing' || pumps < 1) return;
        var payout = Math.floor(betNano * multiplier);
        addBalanceNano(payout);
        state = 'cashed';
        render();
        resetSoon(1050);
      }

      function multiplyBet(value) {
        if (state === 'playing') return;
        var balance = readBalanceNano();
        var current = currentBetNano();
        var next = value < 1 ? Math.max(NANO, Math.floor(current / 2)) : current * 2;
        if (balance >= NANO) next = Math.min(balance, next);
        setBetNano(next);
      }

      function bind() {
        var action = q('pumpAction');
        var cashout = q('pumpCashout');
        var half = q('pumpHalf');
        var double = q('pumpDouble');
        var input = q('pumpBet');

        if (action && !action.dataset.pumpBound) {
          action.dataset.pumpBound = '1';
          action.addEventListener('click', pumpOnce);
        }
        if (cashout && !cashout.dataset.pumpBound) {
          cashout.dataset.pumpBound = '1';
          cashout.addEventListener('click', cashOut);
        }
        if (half && !half.dataset.pumpBound) {
          half.dataset.pumpBound = '1';
          half.addEventListener('click', function(){ multiplyBet(.5); });
        }
        if (double && !double.dataset.pumpBound) {
          double.dataset.pumpBound = '1';
          double.addEventListener('click', function(){ multiplyBet(2); });
        }
        if (input && !input.dataset.pumpBound) {
          input.dataset.pumpBound = '1';
          input.addEventListener('change', normalizeBet);
          input.addEventListener('blur', normalizeBet);
        }

        normalizeBet();
        render();
      }

      window.addEventListener('vexa-ton-balance-sync', normalizeBet);
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bind);
      } else {
        bind();
      }
    })();
  </script>
</section>
`;