export const RPS_SECTION = `
<section id="rps" class="view rps-view">
  <style>
    body:has(#rps.active) {
      background: #050004 !important;
    }

    body:has(#rps.active) .tabs {
      display: none !important;
    }

    .rps-view {
      min-height: 100%;
      padding: 8px 14px calc(104px + env(safe-area-inset-bottom));
      color: #fff;
      background:
        radial-gradient(circle at 50% 8%, rgba(255, 45, 96, .2), transparent 36%),
        radial-gradient(circle at 12% 22%, rgba(255, 255, 255, .08), transparent 24%),
        linear-gradient(180deg, #13030a 0%, #050004 48%, #000 100%) !important;
      overflow-y: auto !important;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      box-sizing: border-box;
    }

    .rps-wrap {
      width: 100%;
      max-width: 520px;
      margin: 0 auto;
      display: grid;
      gap: 14px;
    }

    .rps-arena {
      position: relative;
      min-height: 390px;
      border-radius: 34px;
      background: rgba(255, 255, 255, .045);
      box-shadow: 0 24px 70px rgba(0, 0, 0, .42), inset 0 1px 0 rgba(255, 255, 255, .12);
      overflow: hidden;
      display: grid;
      grid-template-rows: auto 1fr auto;
      padding: 18px;
    }

    .rps-arena::before {
      content: '';
      position: absolute;
      inset: -35%;
      background: conic-gradient(from 180deg, transparent, rgba(255, 45, 96, .18), transparent, rgba(255, 255, 255, .08), transparent);
      animation: rpsGlow 8s linear infinite;
      opacity: .8;
    }

    .rps-arena > * {
      position: relative;
      z-index: 1;
    }

    .rps-topline {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }

    .rps-pill {
      min-height: 34px;
      padding: 0 12px;
      border-radius: 999px;
      background: rgba(0, 0, 0, .34);
      border: 1px solid rgba(255, 255, 255, .1);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, .7);
      font-size: 11px;
      font-weight: 900;
      letter-spacing: -.02em;
    }

    .rps-title {
      display: grid;
      gap: 4px;
      text-align: center;
      margin-top: 8px;
    }

    .rps-title strong {
      font-size: 30px;
      font-weight: 950;
      letter-spacing: -.07em;
      text-shadow: 0 12px 26px rgba(0, 0, 0, .68);
    }

    .rps-title span {
      color: rgba(255, 255, 255, .52);
      font-size: 12px;
      font-weight: 850;
    }

    .rps-duel {
      display: grid;
      grid-template-columns: 1fr 58px 1fr;
      align-items: center;
      gap: 10px;
      margin: 22px 0 18px;
    }

    .rps-hand-card {
      height: 142px;
      border-radius: 28px;
      background: rgba(0, 0, 0, .34);
      border: 1px solid rgba(255, 255, 255, .1);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, .1), 0 16px 38px rgba(0, 0, 0, .34);
      display: grid;
      place-items: center;
      gap: 6px;
    }

    .rps-hand-card b {
      font-size: 58px;
      line-height: 1;
      filter: drop-shadow(0 18px 28px rgba(0, 0, 0, .46));
    }

    .rps-hand-card small {
      color: rgba(255, 255, 255, .55);
      font-size: 11px;
      font-weight: 900;
    }

    .rps-vs {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: rgba(255, 255, 255, .08);
      border: 1px solid rgba(255, 255, 255, .16);
      display: grid;
      place-items: center;
      font-weight: 950;
      color: #fff;
      box-shadow: 0 16px 34px rgba(0, 0, 0, .38), inset 0 1px 0 rgba(255, 255, 255, .16);
    }

    .rps-result {
      min-height: 24px;
      text-align: center;
      font-size: 15px;
      font-weight: 950;
      letter-spacing: -.04em;
      color: rgba(255, 255, 255, .9);
    }

    .rps-choices {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 9px;
    }

    .rps-choice {
      height: 98px;
      border: 1px solid rgba(255, 255, 255, .12);
      border-radius: 24px;
      background: rgba(255, 255, 255, .055);
      color: #fff;
      box-shadow: 0 14px 32px rgba(0, 0, 0, .28), inset 0 1px 0 rgba(255, 255, 255, .12);
      display: grid;
      place-items: center;
      gap: 4px;
      font-weight: 950;
      transition: transform .18s cubic-bezier(.2, .9, .16, 1), background .18s ease, border-color .18s ease;
    }

    .rps-choice:active {
      transform: scale(.96);
    }

    .rps-choice i {
      font-style: normal;
      font-size: 34px;
      line-height: 1;
    }

    .rps-choice span {
      font-size: 11px;
      color: rgba(255, 255, 255, .68);
    }

    .rps-choice.is-picked {
      background: rgba(255, 45, 96, .18);
      border-color: rgba(255, 45, 96, .42);
    }

    .rps-panel {
      display: grid;
      gap: 10px;
      border-radius: 28px;
      background: rgba(255, 255, 255, .04);
      box-shadow: 0 18px 44px rgba(0, 0, 0, .28), inset 0 1px 0 rgba(255, 255, 255, .1);
      padding: 14px;
    }

    .rps-input-row {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 8px;
    }

    .rps-input-row input,
    .rps-input-row button {
      height: 50px;
      border-radius: 18px;
      border: 1px solid rgba(255, 255, 255, .12);
      background: rgba(0, 0, 0, .32);
      color: #fff;
      font-weight: 950;
      outline: none;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, .08);
    }

    .rps-input-row input {
      padding: 0 14px;
      font-size: 18px;
    }

    .rps-input-row button {
      min-width: 58px;
      font-size: 13px;
    }

    .rps-play {
      height: 60px;
      border: 0;
      border-radius: 999px;
      background: #fff;
      color: #050506;
      font-size: 18px;
      font-weight: 950;
      letter-spacing: -.045em;
      box-shadow: 0 14px 30px rgba(0, 0, 0, .52);
    }

    .rps-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }

    .rps-stat {
      border: 1px solid rgba(255, 255, 255, .1);
      border-radius: 18px;
      background: rgba(0, 0, 0, .3);
      padding: 10px;
      text-align: center;
    }

    .rps-stat small {
      display: block;
      color: rgba(255, 255, 255, .45);
      font-size: 10px;
      font-weight: 850;
    }

    .rps-stat b {
      display: block;
      margin-top: 4px;
      font-size: 14px;
    }

    .rps-shake {
      animation: rpsShake .46s cubic-bezier(.2, .9, .16, 1);
    }

    @keyframes rpsGlow {
      to { transform: rotate(360deg); }
    }

    @keyframes rpsShake {
      0%, 100% { transform: translateY(0) scale(1); }
      30% { transform: translateY(-8px) scale(1.03); }
      60% { transform: translateY(4px) scale(.99); }
    }

    @media(max-width: 380px) {
      .rps-arena { min-height: 354px; padding: 15px; }
      .rps-hand-card { height: 124px; border-radius: 24px; }
      .rps-hand-card b { font-size: 48px; }
      .rps-choice { height: 86px; border-radius: 21px; }
      .rps-title strong { font-size: 26px; }
    }
  </style>

  <div class="rps-wrap">
    <div class="rps-arena">
      <div class="rps-topline">
        <span class="rps-pill">Best of 1</span>
        <span class="rps-pill">Payout 1.95x</span>
      </div>

      <div class="rps-title">
        <strong>Rock Paper Scissors</strong>
        <span>Choose your hand and beat the bot</span>
      </div>

      <div class="rps-duel">
        <div class="rps-hand-card" data-rps-player-card><b data-rps-player>✊</b><small>You</small></div>
        <div class="rps-vs">VS</div>
        <div class="rps-hand-card" data-rps-bot-card><b data-rps-bot>?</b><small>Bot</small></div>
      </div>

      <div class="rps-result" data-rps-result>Pick a hand</div>

      <div class="rps-choices">
        <button class="rps-choice" type="button" data-rps-choice="rock"><i>✊</i><span>Rock</span></button>
        <button class="rps-choice" type="button" data-rps-choice="paper"><i>✋</i><span>Paper</span></button>
        <button class="rps-choice" type="button" data-rps-choice="scissors"><i>✌️</i><span>Scissors</span></button>
      </div>
    </div>

    <div class="rps-panel">
      <div class="rps-input-row">
        <input data-rps-bet inputmode="decimal" pattern="[0-9.]*" value="0.1" />
        <button type="button" data-rps-half>1/2</button>
        <button type="button" data-rps-double>2x</button>
      </div>

      <button class="rps-play" type="button" data-rps-play>Play Round</button>

      <div class="rps-stats">
        <div class="rps-stat"><small>WINS</small><b data-rps-wins>0</b></div>
        <div class="rps-stat"><small>STREAK</small><b data-rps-streak>0</b></div>
        <div class="rps-stat"><small>BET</small><b data-rps-bet-label>0.1</b></div>
      </div>
    </div>
  </div>

  <script>
    (function () {
      var root = document.getElementById('rps');
      if (!root || root.dataset.readyRps) return;
      root.dataset.readyRps = '1';

      var icons = { rock: '✊', paper: '✋', scissors: '✌️' };
      var beats = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
      var picked = 'rock';
      var wins = 0;
      var streak = 0;
      var playerEl = root.querySelector('[data-rps-player]');
      var botEl = root.querySelector('[data-rps-bot]');
      var resultEl = root.querySelector('[data-rps-result]');
      var betInput = root.querySelector('[data-rps-bet]');
      var betLabel = root.querySelector('[data-rps-bet-label]');
      var winsEl = root.querySelector('[data-rps-wins]');
      var streakEl = root.querySelector('[data-rps-streak]');
      var playerCard = root.querySelector('[data-rps-player-card]');
      var botCard = root.querySelector('[data-rps-bot-card]');
      var choices = ['rock', 'paper', 'scissors'];

      function setBet(value) {
        var next = Math.max(0.1, Number(value) || 0.1);
        next = Math.round(next * 100) / 100;
        betInput.value = String(next).replace(/\.0$/, '');
        betLabel.textContent = betInput.value;
      }

      function setPick(value) {
        picked = value;
        playerEl.textContent = icons[value];
        root.querySelectorAll('[data-rps-choice]').forEach(function (button) {
          button.classList.toggle('is-picked', button.getAttribute('data-rps-choice') === value);
        });
      }

      function play() {
        var bot = choices[Math.floor(Math.random() * choices.length)];
        botEl.textContent = '?';
        resultEl.textContent = 'Shuffling...';
        playerCard.classList.remove('rps-shake');
        botCard.classList.remove('rps-shake');
        void playerCard.offsetWidth;
        playerCard.classList.add('rps-shake');
        botCard.classList.add('rps-shake');
        setTimeout(function () {
          botEl.textContent = icons[bot];
          if (bot === picked) {
            resultEl.textContent = 'Draw — try again';
          } else if (beats[picked] === bot) {
            wins += 1;
            streak += 1;
            resultEl.textContent = 'You win';
          } else {
            streak = 0;
            resultEl.textContent = 'You lose';
          }
          winsEl.textContent = String(wins);
          streakEl.textContent = String(streak);
        }, 430);
      }

      root.querySelectorAll('[data-rps-choice]').forEach(function (button) {
        button.onclick = function () {
          setPick(button.getAttribute('data-rps-choice') || 'rock');
        };
      });

      root.querySelector('[data-rps-half]').onclick = function () {
        setBet(Number(betInput.value || '0.1') / 2);
      };

      root.querySelector('[data-rps-double]').onclick = function () {
        setBet(Number(betInput.value || '0.1') * 2);
      };

      betInput.oninput = function () {
        betLabel.textContent = betInput.value || '0.1';
      };

      root.querySelector('[data-rps-play]').onclick = play;
      setPick('rock');
      setBet(betInput.value);
    })();
  </script>
</section>
`;
