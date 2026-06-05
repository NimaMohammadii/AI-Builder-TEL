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
        radial-gradient(ellipse 64% 38% at 50% 26%, rgba(72, 7, 31, .18), transparent 70%),
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

    .pump-page {
      width: min(100%, 430px);
      min-height: calc(100vh - 96px);
      margin: 0 auto;
      padding-top: 24px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      gap: 10px;
      box-sizing: border-box;
    }

    .pump-stage {
      position: relative;
      min-height: 350px;
      display: grid;
      place-items: center;
      padding-top: 14px;
      box-sizing: border-box;
    }

    .pump-stage::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: 34px;
      width: 260px;
      height: 64px;
      transform: translateX(-50%);
      border-radius: 50%;
      background: radial-gradient(ellipse at center, rgba(92, 8, 34, .20), transparent 74%);
      filter: blur(18px);
      pointer-events: none;
    }

    .pump-balloon-wrap {
      --pump-scale: 1;
      position: relative;
      width: 280px;
      height: 306px;
      display: grid;
      place-items: center;
      transform-origin: 50% 82%;
      filter: drop-shadow(0 30px 50px rgba(0, 0, 0, .82));
    }

    .pump-balloon-wrap::before {
      content: '';
      position: absolute;
      left: 50%;
      top: 49%;
      width: 218px;
      height: 246px;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      background: radial-gradient(circle at 50% 54%, rgba(88, 6, 34, .20), transparent 70%);
      filter: blur(24px);
      opacity: .58;
      pointer-events: none;
    }

    .pump-balloon-wrap.is-pumping .pump-balloon {
      animation: balloonInflate .36s cubic-bezier(.16, .98, .34, 1) both;
    }

    .pump-balloon-wrap.is-pumping .pump-inflator-core {
      animation: inflaterPulse .24s ease both;
    }

    .pump-balloon-wrap.is-popped {
      animation: pumpPop .38s ease both;
    }

    .pump-balloon {
      position: relative;
      width: 188px;
      height: 232px;
      border-radius: 52% 52% 48% 48% / 47% 47% 57% 57%;
      background:
        radial-gradient(ellipse at 31% 18%, rgba(255, 238, 245, .20), rgba(255, 220, 232, .065) 12%, transparent 24%),
        radial-gradient(ellipse at 42% 29%, rgba(255, 150, 182, .075), transparent 38%),
        radial-gradient(circle at 73% 76%, rgba(0, 0, 0, .54), transparent 48%),
        radial-gradient(circle at 48% 42%, #5d0823 0%, #3a0316 44%, #1f010c 78%, #0a0004 100%);
      border: 0;
      box-shadow:
        inset 0 2px 0 rgba(255, 255, 255, .08),
        inset -26px -38px 54px rgba(0, 0, 0, .54),
        inset 18px 12px 34px rgba(255, 126, 166, .055),
        inset 0 0 28px rgba(255, 225, 235, .028),
        0 0 26px rgba(76, 5, 30, .16);
      transform: scale(var(--pump-scale));
      transform-origin: 50% 82%;
      transition: transform .28s cubic-bezier(.18, .88, .26, 1), filter .24s ease;
      will-change: transform;
    }

    .pump-balloon::before {
      content: '';
      position: absolute;
      left: 29%;
      top: 16%;
      width: 24px;
      height: 14px;
      border-radius: 50%;
      background: rgba(255, 255, 255, .12);
      filter: blur(1.4px);
      transform: rotate(-25deg);
    }

    .pump-balloon::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: -16px;
      width: 34px;
      height: 26px;
      transform: translateX(-50%) rotate(45deg);
      border-radius: 8px 11px 8px 11px;
      background: linear-gradient(145deg, #3b0418, #120005 72%);
      box-shadow:
        inset 0 1px 0 rgba(255, 230, 238, .12),
        0 9px 18px rgba(0, 0, 0, .34);
    }

    .pump-multiplier {
      position: absolute;
      left: 50%;
      top: 45%;
      transform: translate(-50%, -50%);
      font-size: 43px;
      font-weight: 950;
      letter-spacing: -.06em;
      color: #fff;
      text-shadow: 0 2px 18px rgba(0, 0, 0, .62), 0 0 20px rgba(125, 14, 48, .32);
      pointer-events: none;
      z-index: 3;
    }

    .pump-inflator {
      position: absolute;
      left: 50%;
      bottom: 5px;
      width: 106px;
      height: 92px;
      transform: translateX(-50%);
      pointer-events: none;
      z-index: 2;
    }

    .pump-nozzle {
      position: absolute;
      left: 50%;
      top: 0;
      width: 12px;
      height: 54px;
      transform: translateX(-50%);
      border-radius: 999px;
      background: linear-gradient(180deg, rgba(255, 213, 226, .30), rgba(72, 8, 30, .78) 48%, rgba(14, 0, 7, .96));
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, .20),
        0 0 16px rgba(88, 7, 36, .24);
    }

    .pump-inflator-core {
      position: absolute;
      left: 50%;
      bottom: 0;
      width: 102px;
      height: 52px;
      transform: translateX(-50%);
      border-radius: 22px 22px 30px 30px;
      background:
        radial-gradient(circle at 36% 26%, rgba(255, 255, 255, .16), transparent 22%),
        linear-gradient(180deg, rgba(75, 8, 32, .96), rgba(18, 1, 8, .98));
      border: 1px solid rgba(255, 220, 232, .12);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, .13),
        inset -12px -16px 22px rgba(0, 0, 0, .36),
        0 14px 26px rgba(0, 0, 0, .40);
    }

    .pump-inflator-core::before,
    .pump-inflator-core::after {
      content: '';
      position: absolute;
      top: 17px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: rgba(0, 0, 0, .56);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, .10);
    }

    .pump-inflator-core::before {
      left: 24px;
    }

    .pump-inflator-core::after {
      right: 24px;
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
      45% { transform: scale(calc(var(--pump-scale) * 1.075), calc(var(--pump-scale) * .975)); }
      100% { transform: scale(var(--pump-scale)); }
    }

    @keyframes inflaterPulse {
      0% { transform: translateX(-50%) scale(1); }
      50% { transform: translateX(-50%) scale(1.045, .94); }
      100% { transform: translateX(-50%) scale(1); }
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
        <div id="pumpBalloon" class="pump-balloon">
          <div id="pumpMultiplier" class="pump-multiplier">1.00x</div>
        </div>
        <div class="pump-inflator" aria-hidden="true">
          <div class="pump-nozzle"></div>
          <div class="pump-inflator-core"></div>
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
        var scale = Math.min(1.52, 1 + (multiplier - 1) * .075 + pumps * .014);

        if (label) label.textContent = formatMultiplier(multiplier);
        if (wrap) {
          wrap.style.setProperty('--pump-scale', scale.toFixed(3));
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
