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
        radial-gradient(ellipse 64% 38% at 50% 44%, rgba(72, 7, 31, .22), transparent 70%),
        linear-gradient(180deg, #040102 0%, #090205 44%, #010101 100%);
      pointer-events: none;
    }

    .pump-view {
      height: 100%;
      min-height: 100%;
      padding: 0 14px calc(108px + env(safe-area-inset-bottom));
      box-sizing: border-box;
      overflow-y: auto !important;
      overflow-x: hidden;
      color: #fff;
      background: transparent !important;
    }

    .pump-page {
      width: min(100%, 430px);
      min-height: calc(100vh - 116px);
      margin: 0 auto;
      padding-top: 210px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      gap: 16px;
      box-sizing: border-box;
    }

    .pump-stage {
      position: relative;
      min-height: 338px;
      display: grid;
      place-items: center;
    }

    .pump-stage::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: 28px;
      width: 250px;
      height: 70px;
      transform: translateX(-50%);
      border-radius: 50%;
      background: radial-gradient(ellipse at center, rgba(92, 8, 34, .34), transparent 72%);
      filter: blur(14px);
      pointer-events: none;
    }

    .pump-balloon-wrap {
      position: relative;
      width: 260px;
      height: 286px;
      display: grid;
      place-items: center;
      transform-origin: 50% 84%;
      filter: drop-shadow(0 26px 54px rgba(0, 0, 0, .74));
    }

    .pump-balloon-wrap.is-pumping {
      animation: pumpBounce .25s ease both;
    }

    .pump-balloon-wrap.is-popped {
      animation: pumpPop .38s ease both;
    }

    .pump-balloon {
      position: relative;
      width: 174px;
      height: 212px;
      border-radius: 50% 50% 47% 47% / 48% 48% 56% 56%;
      background:
        radial-gradient(circle at 31% 20%, rgba(255,255,255,.38), rgba(255,255,255,.10) 15%, transparent 28%),
        radial-gradient(circle at 70% 74%, rgba(0,0,0,.45), transparent 46%),
        radial-gradient(circle at 48% 42%, #4f061e 0%, #390315 45%, #20010c 79%, #100006 100%);
      border: 1px solid rgba(255, 210, 226, .28);
      box-shadow:
        inset 0 2px 0 rgba(255,255,255,.22),
        inset -18px -32px 42px rgba(0,0,0,.42),
        inset 16px 10px 30px rgba(255,121,158,.08),
        0 0 0 1px rgba(94,10,38,.82),
        0 0 34px rgba(76,5,30,.20);
      transition: width .22s ease, height .22s ease;
    }

    .pump-balloon::before {
      content: '';
      position: absolute;
      left: 27%;
      top: 14%;
      width: 44px;
      height: 28px;
      border-radius: 50%;
      background: rgba(255,255,255,.22);
      transform: rotate(-24deg);
    }

    .pump-balloon::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: -15px;
      width: 32px;
      height: 24px;
      transform: translateX(-50%) rotate(45deg);
      border-radius: 7px 10px 7px 10px;
      background: linear-gradient(145deg, #3a0418, #170008 72%);
      border: 1px solid rgba(255,210,226,.20);
    }

    .pump-string {
      position: absolute;
      left: 50%;
      bottom: 2px;
      width: 2px;
      height: 68px;
      transform: translateX(-50%);
      background: linear-gradient(180deg, rgba(255,190,210,.36), rgba(255,190,210,.04));
      border-radius: 999px;
    }

    .pump-multiplier {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      font-size: 42px;
      font-weight: 950;
      letter-spacing: -.06em;
      color: #fff;
      text-shadow: 0 2px 16px rgba(0,0,0,.52), 0 0 24px rgba(125,14,48,.34);
      pointer-events: none;
    }

    .pump-status {
      position: absolute;
      left: 50%;
      bottom: 8px;
      min-width: 178px;
      min-height: 42px;
      transform: translateX(-50%);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 18px;
      border-radius: 999px;
      background: rgba(255,255,255,.055);
      border: 1px solid rgba(255,255,255,.075);
      color: rgba(255,255,255,.76);
      font-size: 13px;
      font-weight: 850;
      backdrop-filter: blur(14px) saturate(1.15);
      -webkit-backdrop-filter: blur(14px) saturate(1.15);
    }

    .pump-controls {
      width: min(100%, 392px);
      margin: 0 auto;
      padding: 22px 16px 18px;
      border-radius: 32px;
      background: rgba(0,0,0,.48);
      border: 1px solid rgba(255,255,255,.12);
      box-shadow: inset 0 1px 0 rgba(255,255,255,.07), 0 18px 54px rgba(0,0,0,.35);
      backdrop-filter: blur(16px) saturate(1.16);
      -webkit-backdrop-filter: blur(16px) saturate(1.16);
    }

    .pump-label {
      display: block;
      margin: 0 0 10px 4px;
      color: rgba(255,255,255,.64);
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
      border: 1px solid rgba(255,255,255,.13);
      background: rgba(255,255,255,.025);
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
      background: linear-gradient(180deg, rgba(255,255,255,.98), rgba(218,218,220,.95));
    }

    .pump-action.is-playing {
      color: #fff;
      background: linear-gradient(180deg, #6f0d2f, #3c0418 100%);
      border: 1px solid rgba(255,188,208,.20);
    }

    .pump-cashout {
      display: none;
      color: #fff;
      background: rgba(255,255,255,.045);
      border: 1px solid rgba(255,255,255,.12);
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

    @keyframes pumpBounce {
      0% { transform: scale(1); }
      48% { transform: scale(1.055, .96); }
      100% { transform: scale(1); }
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
        <div id="pumpBalloon" class="pump-balloon"></div>
        <div id="pumpMultiplier" class="pump-multiplier">1.00x</div>
        <div class="pump-string"></div>
      </div>
      <div id="pumpStatus" class="pump-status">Start and pump carefully</div>
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
        return value.toFixed(2).replace(/\\.00$/, '').replace(/(\\.\\d)0$/, '$1');
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

      function setStatus(text) {
        var node = q('pumpStatus');
        if (node) node.textContent = text;
      }

      function render() {
        var wrap = q('pumpBalloonWrap');
        var balloon = q('pumpBalloon');
        var label = q('pumpMultiplier');
        var controls = q('pumpControls');
        var action = q('pumpAction');
        var cashout = q('pumpCashout');
        var input = q('pumpBet');
        var half = q('pumpHalf');
        var double = q('pumpDouble');
        var playing = state === 'playing';
        var scale = Math.min(1.42, 1 + (multiplier - 1) * .07 + pumps * .012);

        if (label) label.textContent = formatMultiplier(multiplier);
        if (balloon) {
          balloon.style.width = Math.round(174 * scale) + 'px';
          balloon.style.height = Math.round(212 * scale) + 'px';
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
        if (wrap) wrap.classList.toggle('is-popped', state === 'popped');
      }

      function startRound() {
        var balance = readBalanceNano();
        betNano = normalizeBet();

        if (balance < betNano) {
          setStatus('Not enough balance');
          return;
        }

        state = 'playing';
        multiplier = 1;
        pumps = 0;
        burstAt = hiddenBurstPoint();
        addBalanceNano(-betNano);
        setStatus('Pump before it pops');
        render();
      }

      function resetSoon(text, delay) {
        setStatus(text);
        setTimeout(function(){
          state = 'idle';
          multiplier = 1;
          pumps = 0;
          setStatus('Start and pump carefully');
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
          resetSoon('Popped at ' + formatMultiplier(multiplier), 1250);
          return;
        }

        setStatus('Safe so far');
        render();
      }

      function cashOut() {
        if (state !== 'playing' || pumps < 1) return;
        var payout = Math.floor(betNano * multiplier);
        addBalanceNano(payout);
        state = 'cashed';
        render();
        resetSoon('Cashed out ' + formatMultiplier(multiplier), 1050);
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
