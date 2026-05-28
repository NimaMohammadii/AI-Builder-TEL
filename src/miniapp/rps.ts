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
      max-width: 560px;
      margin: 0 auto;
      display: grid;
      gap: 16px;
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
      min-height: 430px;
      display: grid;
      grid-template-rows: auto 1fr auto;
      padding: 20px 18px;
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
      margin-top: 2px;
    }

    .rps-title strong {
      font-family: Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif;
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -.035em;
      text-shadow: 0 12px 26px rgba(0,0,0,.68);
    }

    .rps-title span {
      color: rgba(255,255,255,.58);
      font-size: 13px;
      font-weight: 650;
    }

    .rps-duel {
      display: grid;
      grid-template-columns: 1fr 64px 1fr;
      align-items: center;
      gap: 12px;
      margin: 28px 0 22px;
    }

    .rps-hand-card {
      height: 168px;
      border-radius: 28px;
      display: grid;
      place-items: center;
      gap: 6px;
    }

    .rps-hand-img {
      display: none;
      width: 116px;
      height: 116px;
      object-fit: contain;
      border: 0 !important;
      outline: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
      filter: drop-shadow(0 18px 28px rgba(0,0,0,.46));
      pointer-events: none;
    }

    .rps-choice .rps-hand-img {
      width: 54px;
      height: 54px;
      filter: none;
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
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      font-weight: 950;
      color: #fff;
    }

    .rps-result {
      min-height: 26px;
      text-align: center;
      font-family: Inter, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif;
      font-size: 16px;
      font-weight: 750;
      letter-spacing: -.015em;
      color: rgba(255,255,255,.9);
    }

    .rps-choices {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 11px;
    }

    .rps-choice {
      height: 108px;
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

    #rps .rps-hand-img {
      --rps-hand-angle: 90deg;
      --rps-hand-drop-start: -90deg;
      --rps-hand-drop-overshoot: 5deg;
      transform: rotate(var(--rps-hand-angle));
      transform-origin: center;
      transition: transform 1.15s cubic-bezier(.18,.82,.22,1);
      will-change: transform;
    }

    #rps [data-rps-bot-img] {
      --rps-hand-angle: -90deg;
      --rps-hand-drop-start: 90deg;
      --rps-hand-drop-overshoot: -5deg;
    }

    #rps .rps-hand-card.has-rps-image .rps-hand-img {
      width: 116px;
      height: 116px;
    }

    #rps .rps-hand-drop {
      animation: rpsHandDrop .92s cubic-bezier(.16,.86,.2,1) both;
    }

    @keyframes rpsHandDrop {
      0% { opacity: 0; transform: translateY(-74px) rotate(calc(var(--rps-hand-angle) + var(--rps-hand-drop-start))) scale(.88); }
      74% { opacity: 1; transform: translateY(4px) rotate(calc(var(--rps-hand-angle) + var(--rps-hand-drop-overshoot))) scale(1.02); }
      100% { opacity: 1; transform: translateY(0) rotate(var(--rps-hand-angle)) scale(1); }
    }

    @media(max-width: 380px) {
      .rps-arena { min-height: 390px; padding: 16px 12px; }
      .rps-hand-card { height: 148px; border-radius: 24px; }
      .rps-hand-img { width: 86px; height: 86px; }
      #rps .rps-hand-card.has-rps-image .rps-hand-img { width: 104px; height: 104px; }
      .rps-choice { height: 94px; border-radius: 21px; }
      .rps-choice .rps-hand-img { width: 48px; height: 48px; }
      .rps-title strong { font-size: 28px; letter-spacing: -.03em; }
    }
  </style>

  <div class="rps-wrap">
    <div class="rps-arena">
      <div class="rps-title">
        <strong>Rock Paper Scissors</strong>
      </div>

      <div class="rps-duel">
        <div class="rps-hand-card" data-rps-player-card><img class="rps-hand-img" data-rps-player-img alt=""/><small>You</small></div>
        <div class="rps-vs">VS</div>
        <div class="rps-hand-card" data-rps-bot-card><img class="rps-hand-img" data-rps-bot-img alt=""/><small>Bot</small></div>
      </div>

      <div class="rps-result" data-rps-result>Pick a hand</div>

      <div class="rps-choices">
        <button class="rps-choice" type="button" data-rps-choice="rock"><img class="rps-hand-img" data-rps-choice-img="rock" alt=""/><span>Rock</span></button>
        <button class="rps-choice" type="button" data-rps-choice="paper"><img class="rps-hand-img" data-rps-choice-img="paper" alt=""/><span>Paper</span></button>
        <button class="rps-choice" type="button" data-rps-choice="scissors"><img class="rps-hand-img" data-rps-choice-img="scissors" alt=""/><span>Scissors</span></button>
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

      var beats = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
      var rpsImages = {
        you: {
          rock: '/app/api/uploaded-image/rps-you-rock.png',
          paper: '/app/api/uploaded-image/rps-you-paper.png',
          scissors: '/app/api/uploaded-image/rps-you-scissors.png',
        },
        bot: {
          rock: '/app/api/uploaded-image/rps-bot-rock.png',
          paper: '/app/api/uploaded-image/rps-bot-paper.png',
          scissors: '/app/api/uploaded-image/rps-bot-scissors.png',
        },
      };
      var picked = 'rock';
      var wins = 0;
      var streak = 0;
      var playerAngle = 90;
      var botAngle = -90;
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
        if (!value || !rpsImages[side]) return '';
        return rpsImages[side][value] || '';
      }

      function applyUploadedRpsImages(data) {
        if (!data) return;
        rpsImages.you.rock = data.rpsYouRockUrl || rpsImages.you.rock;
        rpsImages.you.paper = data.rpsYouPaperUrl || rpsImages.you.paper;
        rpsImages.you.scissors = data.rpsYouScissorsUrl || rpsImages.you.scissors;
        rpsImages.bot.rock = data.rpsBotRockUrl || rpsImages.bot.rock;
        rpsImages.bot.paper = data.rpsBotPaperUrl || rpsImages.bot.paper;
        rpsImages.bot.scissors = data.rpsBotScissorsUrl || rpsImages.bot.scissors;
      }

      function refreshRpsImages() {
        paintChoiceImages();
        setCardImage(playerCard, playerImg, 'you', picked, false);
      }

      function replayDrop(target) {
        if (!target) return;
        target.classList.remove('rps-hand-drop');
        void target.offsetWidth;
        target.classList.add('rps-hand-drop');
      }

      function setHandAngle(image, angle) {
        if (!image) return;
        image.style.setProperty('--rps-hand-angle', angle + 'deg');
      }

      function bindImage(container, image, url) {
        if (!container || !image) return false;
        image.decoding = 'async';
        image.loading = 'eager';
        image.onload = function () { container.classList.add('has-rps-image'); };
        image.onerror = function () {
          image.removeAttribute('src');
          container.classList.remove('has-rps-image');
        };
        if (!url) {
          image.removeAttribute('src');
          container.classList.remove('has-rps-image');
          return false;
        }
        if (image.getAttribute('src') !== url) image.src = url;
        if (image.complete && image.naturalWidth > 0) container.classList.add('has-rps-image');
        return true;
      }

      function setCardImage(card, image, side, value, animate) {
        setHandAngle(image, side === 'bot' ? botAngle : playerAngle);
        var url = imageFor(side, value);
        var hasImage = bindImage(card, image, url);
        if (animate && hasImage) replayDrop(image);
      }

      function paintChoiceImages() {
        root.querySelectorAll('[data-rps-choice-img]').forEach(function (img) {
          var kind = img.getAttribute('data-rps-choice-img') || '';
          var url = imageFor('you', kind);
          var btn = img.closest('[data-rps-choice]');
          bindImage(btn, img, url);
        });
      }

      function setBet(value) {
        var next = Math.max(0.1, Number(value) || 0.1);
        next = Math.round(next * 100) / 100;
        betInput.value = String(next).replace(/\.0$/, '');
        betLabel.textContent = betInput.value;
      }

      function setPick(value, animate) {
        picked = value;
        setCardImage(playerCard, playerImg, 'you', value, animate !== false);
        root.querySelectorAll('[data-rps-choice]').forEach(function (button) {
          button.classList.toggle('is-picked', button.getAttribute('data-rps-choice') === value);
        });
      }

      function play() {
        var bot = choices[Math.floor(Math.random() * choices.length)];
        setCardImage(playerCard, playerImg, 'you', picked, true);
        if (botImg) {
          botImg.removeAttribute('src');
          setHandAngle(botImg, botAngle);
        }
        botCard.classList.remove('has-rps-image');
        resultEl.textContent = 'Shuffling...';
        setTimeout(function () {
          setCardImage(botCard, botImg, 'bot', bot, true);
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
        }, 620);
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
      window.addEventListener('vexa-rps-images-sync', function (event) {
        applyUploadedRpsImages(event.detail || null);
        refreshRpsImages();
      });
      try {
        if (window.VexaUploadedImages && window.VexaUploadedImages.read) {
          applyUploadedRpsImages(window.VexaUploadedImages.read());
        }
        if (window.VexaUploadedImages && window.VexaUploadedImages.load) {
          window.VexaUploadedImages.load().then(function (data) {
            applyUploadedRpsImages(data);
            refreshRpsImages();
          }).catch(function () {});
        }
      } catch (e) {}
      setPick('rock', false);
      setBet(betInput.value);
      paintChoiceImages();
    })();
  </script>
</section>
`;