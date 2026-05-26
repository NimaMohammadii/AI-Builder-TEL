export const RPS_SECTION = `
<section id="rps" class="view rps-view">
  <style>
    html:has(#rps.active),
    body:has(#rps.active) {
      background: #000 !important;
      background-color: #000 !important;
      background-image: none !important;
    }

    body:has(#rps.active) .tabs {
      display: none !important;
    }

    body:has(#rps.active) .app,
    body:has(#rps.active) main.app,
    body:has(#rps.active) .content,
    body:has(#rps.active) .view.active,
    body:has(#rps.active) #rps,
    body:has(#rps.active) .rps-view,
    body:has(#rps.active) .top,
    body:has(#rps.active) header.top {
      background: #000 !important;
      background-color: #000 !important;
      background-image: none !important;
      box-shadow: none !important;
    }

    .rps-view {
      --rps-accent: #23020b;
      --rps-accent-soft: rgba(48, 3, 15, .28);
      --rps-accent-edge: rgba(88, 7, 27, .18);
      min-height: 100%;
      padding: 8px 14px calc(104px + env(safe-area-inset-bottom));
      color: #fff;
      background: #000 !important;
      background-color: #000 !important;
      background-image: none !important;
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

    .rps-arena,
    .rps-panel {
      position: relative;
      border: 0 !important;
      border-radius: 34px;
      background: linear-gradient(180deg, rgba(255,255,255,.024), rgba(255,255,255,.012));
      box-shadow:
        0 0 0 1px rgba(62, 4, 19, .10),
        0 0 22px rgba(54, 3, 17, .15),
        0 18px 46px rgba(0,0,0,.34),
        inset 0 1px 0 rgba(255,255,255,.045);
      -webkit-backdrop-filter: blur(18px) saturate(138%);
      backdrop-filter: blur(18px) saturate(138%);
      overflow: hidden;
    }

    .rps-arena {
      min-height: 390px;
      display: grid;
      grid-template-rows: auto 1fr auto;
      padding: 18px;
    }

    .rps-arena::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        linear-gradient(180deg, rgba(38,2,12,.28), transparent 30%),
        radial-gradient(circle at 50% 0%, rgba(64,4,20,.20), transparent 52%);
      opacity: .72;
      pointer-events: none;
    }

    .rps-arena::after,
    .rps-panel::after {
      content: '';
      position: absolute;
      inset: 1px;
      border-radius: inherit;
      box-shadow: inset 0 0 22px rgba(61,4,19,.12);
      pointer-events: none;
    }

    .rps-arena > *,
    .rps-panel > * {
      position: relative;
      z-index: 1;
    }

    .rps-topline {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }

    .rps-pill,
    .rps-hand-card,
    .rps-vs,
    .rps-choice,
    .rps-input-row input,
    .rps-input-row button,
    .rps-stat {
      border: 0 !important;
      background: rgba(255,255,255,.018);
      box-shadow:
        0 0 0 1px rgba(72,5,22,.07),
        0 0 14px rgba(55,3,17,.10),
        0 12px 26px rgba(0,0,0,.22),
        inset 0 1px 0 rgba(255,255,255,.05);
      -webkit-backdrop-filter: blur(12px) saturate(135%);
      backdrop-filter: blur(12px) saturate(135%);
    }

    .rps-pill {
      min-height: 34px;
      padding: 0 12px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: rgba(255,255,255,.72);
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
      text-shadow: 0 12px 26px rgba(0,0,0,.68);
    }

    .rps-title span {
      color: rgba(255,255,255,.52);
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
      display: grid;
      place-items: center;
      gap: 6px;
    }

    .rps-hand-card b {
      font-size: 58px;
      line-height: 1;
      filter: drop-shadow(0 18px 28px rgba(0,0,0,.46));
    }

    .rps-hand-card small,
    .rps-choice span {
      color: rgba(255,255,255,.58);
      font-size: 11px;
      font-weight: 900;
    }

    .rps-vs {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      font-weight: 950;
      color: #fff;
    }

    .rps-result {
      min-height: 24px;
      text-align: center;
      font-size: 15px;
      font-weight: 950;
      letter-spacing: -.04em;
      color: rgba(255,255,255,.9);
    }

    .rps-choices {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 9px;
    }

    .rps-choice {
      height: 98px;
      border-radius: 24px;
      color: #fff;
      display: grid;
      place-items: center;
      gap: 4px;
      font-weight: 950;
      transition: transform .18s cubic-bezier(.2,.9,.16,1), background .18s ease, box-shadow .18s ease;
    }

    .rps-choice:active {
      transform: scale(.96);
    }

    .rps-choice i {
      font-style: normal;
      font-size: 34px;
      line-height: 1;
    }

    .rps-choice.is-picked {
      background: rgba(35,2,11,.42);
      box-shadow:
        0 0 0 1px rgba(90,7,28,.10),
        0 0 18px rgba(70,4,22,.18),
        0 14px 32px rgba(0,0,0,.28),
        inset 0 1px 0 rgba(255,255,255,.065);
    }

    .rps-panel {
      display: grid;
      gap: 10px;
      border-radius: 28px;
      padding: 14px;
    }

    .rps-input-row {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 8px;
    }

    .rps-input-row input,
    .rps-input-row button {
      min-width: 0;
      height: 46px;
      border-radius: 999px;
      color: #fff;
      font-weight: 900;
    }

    .rps-input-row input {
      padding: 0 14px;
      outline: 0;
      font-size: 17px;
    }

    .rps-input-row button {
      padding: 0 14px;
    }

    .rps-play {
      height: 54px;
      border: 0 !important;
      border-radius: 999px;
      color: #fff;
      font-size: 17px;
      font-weight: 950;
      letter-spacing: -.035em;
      background: rgba(35,2,11,.48);
      box-shadow:
        0 0 0 1px rgba(95,8,30,.11),
        0 14px 34px rgba(0,0,0,.36),
        inset 0 1px 0 rgba(255,255,255,.07);
    }

    .rps-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }

    .rps-stat {
      border-radius: 20px;
      min-height: 54px;
      display: grid;
      place-items: center;
      gap: 2px;
      color: rgba(255,255,255,.58);
      font-size: 10px;
      font-weight: 850;
    }

    .rps-stat b {
      color: #fff;
      font-size: 16px;
      font-weight: 950;
    }

    .rps-status {
      min-height: 17px;
      text-align: center;
      color: rgba(255,255,255,.58);
      font-size: 11px;
      font-weight: 760;
    }

    @media(max-width: 380px) {
      .rps-arena { min-height: 360px; padding: 15px; }
      .rps-title strong { font-size: 26px; }
      .rps-duel { grid-template-columns: 1fr 48px 1fr; gap: 8px; }
      .rps-hand-card { height: 124px; border-radius: 24px; }
      .rps-hand-card b { font-size: 50px; }
      .rps-vs { width: 48px; height: 48px; }
      .rps-choice { height: 88px; }
      .rps-choice i { font-size: 30px; }
    }
  </style>
  <div class="rps-wrap">
    <div class="rps-arena">
      <div class="rps-topline">
        <span class="rps-pill">Rock Paper Scissors</span>
        <span class="rps-pill" data-rps-balance>Balance: 0 TON</span>
      </div>
      <div class="rps-title"><strong>Pick your hand</strong><span>Beat the house and win instantly</span></div>
      <div class="rps-duel">
        <div class="rps-hand-card"><small>You</small><b data-rps-player>✊</b></div>
        <div class="rps-vs">VS</div>
        <div class="rps-hand-card"><small>House</small><b data-rps-house>?</b></div>
      </div>
      <div class="rps-result" data-rps-result>Choose a hand to begin</div>
      <div class="rps-choices">
        <button class="rps-choice" data-rps-choice="rock"><i>✊</i><span>Rock</span></button>
        <button class="rps-choice" data-rps-choice="paper"><i>✋</i><span>Paper</span></button>
        <button class="rps-choice" data-rps-choice="scissors"><i>✌️</i><span>Scissors</span></button>
      </div>
    </div>
    <div class="rps-panel">
      <div class="rps-input-row">
        <input data-rps-bet type="number" min="0.01" step="0.01" value="1" inputmode="decimal" />
        <button data-rps-half>Half</button>
        <button data-rps-max>Max</button>
      </div>
      <button class="rps-play" data-rps-play>Play round</button>
      <div class="rps-stats">
        <div class="rps-stat"><span>Wins</span><b data-rps-wins>0</b></div>
        <div class="rps-stat"><span>Losses</span><b data-rps-losses>0</b></div>
        <div class="rps-stat"><span>Streak</span><b data-rps-streak>0</b></div>
      </div>
      <div class="rps-status" data-rps-status></div>
    </div>
  </div>
  <script>
    (function(){
      var root = document.getElementById('rps');
      if (!root || root.dataset.ready === '1') return;
      root.dataset.ready = '1';
      var choices = ['rock','paper','scissors'];
      var emoji = { rock: '✊', paper: '✋', scissors: '✌️' };
      var player = root.querySelector('[data-rps-player]');
      var house = root.querySelector('[data-rps-house]');
      var result = root.querySelector('[data-rps-result]');
      var betInput = root.querySelector('[data-rps-bet]');
      var balanceEl = root.querySelector('[data-rps-balance]');
      var winsEl = root.querySelector('[data-rps-wins]');
      var lossesEl = root.querySelector('[data-rps-losses]');
      var streakEl = root.querySelector('[data-rps-streak]');
      var statusEl = root.querySelector('[data-rps-status]');
      var picked = 'rock';
      var balance = 0;
      var wins = Number(localStorage.getItem('rpsWins') || 0);
      var losses = Number(localStorage.getItem('rpsLosses') || 0);
      var streak = Number(localStorage.getItem('rpsStreak') || 0);
      function readBalance(){
        try { if (window.VexaTonBalance && typeof window.VexaTonBalance.read === 'function') return Number(window.VexaTonBalance.read() || 0) / 1000000000; } catch(e) {}
        var el = document.querySelector('[data-ton-balance-display]');
        var text = el ? String(el.textContent || '').replace(/[^0-9.]/g,'') : '0';
        return Number(text || 0);
      }
      function writeBalance(next){
        try { if (window.VexaTonBalance && typeof window.VexaTonBalance.write === 'function') { window.VexaTonBalance.write(Math.max(0, next) * 1000000000, 0, false); return; } } catch(e) {}
        var el = document.querySelector('[data-ton-balance-display]');
        if (el) el.textContent = Math.max(0, next).toFixed(2);
      }
      function sync(){
        balance = readBalance();
        balanceEl.textContent = 'Balance: ' + balance.toFixed(2) + ' TON';
        winsEl.textContent = String(wins);
        lossesEl.textContent = String(losses);
        streakEl.textContent = String(streak);
      }
      function outcome(a,b){
        if (a === b) return 'draw';
        if ((a === 'rock' && b === 'scissors') || (a === 'paper' && b === 'rock') || (a === 'scissors' && b === 'paper')) return 'win';
        return 'loss';
      }
      root.querySelectorAll('[data-rps-choice]').forEach(function(btn){
        btn.addEventListener('click', function(){
          picked = btn.dataset.rpsChoice || 'rock';
          player.textContent = emoji[picked];
          root.querySelectorAll('[data-rps-choice]').forEach(function(x){ x.classList.toggle('is-picked', x === btn); });
        });
      });
      root.querySelector('[data-rps-half]').addEventListener('click', function(){ sync(); betInput.value = Math.max(.01, balance / 2).toFixed(2); });
      root.querySelector('[data-rps-max]').addEventListener('click', function(){ sync(); betInput.value = Math.max(.01, balance).toFixed(2); });
      root.querySelector('[data-rps-play]').addEventListener('click', function(){
        sync();
        var bet = Math.max(.01, Number(betInput.value || 0));
        if (bet > balance) { statusEl.textContent = 'Not enough balance'; return; }
        var h = choices[Math.floor(Math.random() * choices.length)];
        house.textContent = emoji[h];
        var o = outcome(picked, h);
        if (o === 'draw') {
          result.textContent = 'Draw — stake returned';
          statusEl.textContent = 'No balance change';
        } else if (o === 'win') {
          balance += bet;
          wins += 1;
          streak += 1;
          result.textContent = 'You win +' + bet.toFixed(2) + ' TON';
          statusEl.textContent = 'House picked ' + h;
        } else {
          balance -= bet;
          losses += 1;
          streak = 0;
          result.textContent = 'You lose -' + bet.toFixed(2) + ' TON';
          statusEl.textContent = 'House picked ' + h;
        }
        balance = Math.max(0, balance);
        localStorage.setItem('rpsWins', String(wins));
        localStorage.setItem('rpsLosses', String(losses));
        localStorage.setItem('rpsStreak', String(streak));
        writeBalance(balance);
        sync();
      });
      sync();
      root.querySelector('[data-rps-choice="rock"]').classList.add('is-picked');
    })();
  </script>
</section>
`;