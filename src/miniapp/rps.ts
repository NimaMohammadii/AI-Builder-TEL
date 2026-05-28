export const RPS_SECTION = `
<section id="rps" class="view rps-view">
  <style>
    html:has(#rps.active),
    body:has(#rps.active) {
      background: #000 !important;
      background-color: #000 !important;
      background-image: none !important;
    }

    body:has(#rps.active)::before,
    body:has(#rps.active)::after,
    body:has(#rps.active) .app::before,
    body:has(#rps.active) .app::after {
      content: none !important;
      display: none !important;
      background: none !important;
      background-image: none !important;
      box-shadow: none !important;
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

    .rps-hand-img {
      display: none;
      width: 84px;
      height: 84px;
      object-fit: contain;
      border: 0 !important;
      outline: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
      filter: drop-shadow(0 18px 28px rgba(0,0,0,.46));
      pointer-events: none;
    }

    .rps-choice .rps-hand-img {
      width: 48px;
      height: 48px;
      filter: none;
    }

    .rps-hand-card.has-rps-image b,
    .rps-choice.has-rps-image i {
      display: none;
    }

    .rps-hand-card.has-rps-image .rps-hand-img,
    .rps-choice.has-rps-image .rps-hand-img {
      display: block;
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
      height: 50px;
      border-radius: 18px;
      color: #fff;
      font-weight: 950;
      outline: none;
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
      background: linear-gradient(180deg, #2b0310, #170107);
      color: rgba(255,255,255,.92);
      font-size: 18px;
      font-weight: 950;
      letter-spacing: -.045em;
      box-shadow:
        0 0 0 1px rgba(95,8,30,.10),
        0 0 18px rgba(70,4,22,.20),
        0 14px 30px rgba(0,0,0,.46),
        inset 0 1px 0 rgba(255,255,255,.07);
    }

    .rps-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }

    .rps-stat {
      border-radius: 18px;
      padding: 10px;
      text-align: center;
    }

    .rps-stat small {
      display: block;
      color: rgba(255,255,255,.45);
      font-size: 10px;
      font-weight: 850;
    }

    .rps-stat b {
      display: block;
      margin-top: 4px;
      font-size: 14px;
    }

    .rps-shake {
      animation: rpsShake .46s cubic-bezier(.2,.9,.16,1);
    }

    @keyframes rpsShake {
      0%,100% { transform: translateY(0) scale(1); }
      30% { transform: translateY(-8px) scale(1.03); }
      60% { transform: translateY(4px) scale(.99); }
    }

    #rps .rps-arena {
      border-radius: 0 !important;
      background: transparent !important;
      background-image: none !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
      overflow: visible !important;
    }

    #rps .rps-arena::before,
    #rps .rps-arena::after {
      content: none !important;
      display: none !important;
      background: none !important;
      box-shadow: none !important;
    }

    #rps .rps-pill,
    #rps .rps-hand-card,
    #rps .rps-vs,
    #rps .rps-choice,
    #rps .rps-choice.is-picked {
      border-radius: 0 !important;
      background: transparent !important;
      background-image: none !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    #rps .rps-hand-card,
    #rps .rps-choice {
      overflow: visible !important;
    }

    #rps .rps-vs {
      width: auto !important;
      height: auto !important;
    }

    #rps .rps-hand-img,
    #rps .rps-hand-card b {
      transform-origin: center;
    }

    #rps .rps-hand-card.has-rps-image .rps-hand-img {
      width: 96px;
      height: 96px;
    }

    #rps .rps-hand-drop {
      animation: rpsHandDrop .44s cubic-bezier(.16,.98,.18,1) both;
    }

    @keyframes rpsHandDrop {
      0% { opacity: 0; transform: translateY(-74px) rotate(-90deg) scale(.88); }
      68% { opacity: 1; transform: translateY(4px) rotate(5deg) scale(1.02); }
      100% { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); }
    }

    @media(max-width: 380px) {
      .rps-arena { min-height: 354px; padding: 15px; }
      .rps-hand-card { height: 124px; border-radius: 24px; }
      .rps-hand-card b { font-size: 48px; }
      .rps-hand-img { width: 74px; height: 74px; }
      .rps-choice { height: 86px; border-radius: 21px; }
      .rps-choice .rps-hand-img { width: 42px; height: 42px; }
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
        <div class="rps-hand-card" data-rps-player-card><b data-rps-player>✊</b><img class="rps-hand-img" data-rps-player-img alt=""/><small>You</small></div>
        <div class="rps-vs">VS</div>
        <div class="rps-hand-card" data-rps-bot-card><b data-rps-bot>?</b><img class="rps-hand-img" data-rps-bot-img alt=""/><small>Bot</small></div>
      </div>

      <div class="rps-result" data-rps-result>Pick a hand</div>

      <div class="rps-choices">
        <button class="rps-choice" type="button" data-rps-choice="rock"><i>✊</i><img class="rps-hand-img" data-rps-choice-img="rock" alt=""/><span>Rock</span></button>
        <button class="rps-choice" type="button" data-rps-choice="paper"><i>✋</i><img class="rps-hand-img" data-rps-choice-img="paper" alt=""/><span>Paper</span></button>
        <button class="rps-choice" type="button" data-rps-choice="scissors"><i>✌️</i><img class="rps-hand-img" data-rps-choice-img="scissors" alt=""/><span>Scissors</span></button>
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
      var rpsImages = { you: { rock: '', paper: '', scissors: '' }, bot: { rock: '', paper: '', scissors: '' } };
      var picked = 'rock';
      var wins = 0;
      var streak = 0;
      var playerEl = root.querySelector('[data-rps-player]');
      var botEl = root.querySelector('[data-rps-bot]');
      var playerImg = root.querySelector('[data-rps-player-img]');
      var botImg = root.querySelector('[data-rps-bot-img]');
      var resultEl = root.querySelector('[data-rps-result]');
      var betInput = root.querySelector('[data-rps-bet]');
      var betLabel = root.querySelector('[data-rps-bet-label]');
      var winsEl = root.querySelector('[data-rps-wins]');
      var streakEl = root.querySelector('[data-rps-streak]');
      var playerCard = root.querySelector('[data-rps-player-card]');
      var botCard = root.querySelector('[data-rps-bot-card]');
      var choices = ['rock', 'paper', 'scissors'];

      function imageFor(side, value) {
        if (!value) return '';
        if (rpsImages[side] && rpsImages[side][value]) return rpsImages[side][value];
        return '';
      }

      function replayDrop(target) {
        if (!target) return;
        target.classList.remove('rps-hand-drop');
        void target.offsetWidth;
        target.classList.add('rps-hand-drop');
      }

      function bindImage(container, image, url) {
        if (!container || !image) return false;
        if (!url) {
          image.removeAttribute('src');
          container.classList.remove('has-rps-image');
          return false;
        }
        image.onload = function () { container.classList.add('has-rps-image'); };
        image.onerror = function () { image.removeAttribute('src'); container.classList.remove('has-rps-image'); };
        image.src = url;
        return true;
      }

      function setCardImage(card, image, icon, side, value, animate) {
        var url = imageFor(side, value);
        var hasImage = bindImage(card, image, url);
        if (animate) replayDrop(hasImage && image ? image : icon);
      }

      function paintChoiceImages() {
        root.querySelectorAll('[data-rps-choice-img]').forEach(function (img) {
          var kind = img.getAttribute('data-rps-choice-img') || '';
          var url = imageFor('you', kind);
          var btn = img.closest('[data-rps-choice]');
          bindImage(btn, img, url);
        });
      }

      function applyRpsImages(data) {
        data = data || {};
        var stamp = String(Date.now());
        function fresh(url) { return url ? url + (url.indexOf('?') >= 0 ? '&' : '?') + 'rps=' + stamp : ''; }
        rpsImages.you.rock = fresh(data.rpsYouRockUrl || '');
        rpsImages.you.paper = fresh(data.rpsYouPaperUrl || '');
        rpsImages.you.scissors = fresh(data.rpsYouScissorsUrl || '');
        rpsImages.bot.rock = fresh(data.rpsBotRockUrl || '');
        rpsImages.bot.paper = fresh(data.rpsBotPaperUrl || '');
        rpsImages.bot.scissors = fresh(data.rpsBotScissorsUrl || '');
        paintChoiceImages();
        setPick(picked, false);
      }

      function loadRpsImages() {
        fetch('/app/api/uploaded-images?scope=rps&t=' + Date.now(), { cache: 'no-store' })
          .then(function (r) { return r.json(); })
          .then(applyRpsImages)
          .catch(function () {});
      }

      window.addEventListener('vexa-rps-images-sync', function (event) {
        var detail = event && event.detail ? event.detail : null;
        if (!detail) return loadRpsImages();
        applyRpsImages({
          rpsYouRockUrl: detail.you && detail.you.rock,
          rpsYouPaperUrl: detail.you && detail.you.paper,
          rpsYouScissorsUrl: detail.you && detail.you.scissors,
          rpsBotRockUrl: detail.bot && detail.bot.rock,
          rpsBotPaperUrl: detail.bot && detail.bot.paper,
          rpsBotScissorsUrl: detail.bot && detail.bot.scissors,
        });
      });

      document.addEventListener('click', function (event) {
        var open = event.target && event.target.closest && event.target.closest('[data-view="rps"],[data-game-view="rps"]');
        if (open) setTimeout(loadRpsImages, 120);
      }, true);

      function setBet(value) {
        var next = Math.max(0.1, Number(value) || 0.1);
        next = Math.round(next * 100) / 100;
        betInput.value = String(next).replace(/\.0$/, '');
        betLabel.textContent = betInput.value;
      }

      function setPick(value, animate) {
        picked = value;
        playerEl.textContent = icons[value];
        setCardImage(playerCard, playerImg, playerEl, 'you', value, animate !== false);
        root.querySelectorAll('[data-rps-choice]').forEach(function (button) {
          button.classList.toggle('is-picked', button.getAttribute('data-rps-choice') === value);
        });
      }

      function play() {
        var bot = choices[Math.floor(Math.random() * choices.length)];
        botEl.textContent = '?';
        if (botImg) botImg.removeAttribute('src');
        botCard.classList.remove('has-rps-image');
        resultEl.textContent = 'Shuffling...';
        setTimeout(function () {
          botEl.textContent = icons[bot];
          setCardImage(botCard, botImg, botEl, 'bot', bot, true);
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
        }, 260);
      }

      root.querySelectorAll('[data-rps-choice]').forEach(function (button) {
        button.onclick = function () {
          setPick(button.getAttribute('data-rps-choice') || 'rock', true);
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
      setPick('rock', false);
      setBet(betInput.value);
      loadRpsImages();
      setTimeout(loadRpsImages, 700);
    })();
  </script>
</section>
`;