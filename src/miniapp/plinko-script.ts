export const PLINKO_SCRIPT = `
(function () {
  var state = null;
  var rows = 13;
  var risk = 'low';
  var NANO = 1000000000;
  var credit = readPoints();
  var iconUrl = '/app/api/uploaded-image/credit-icon.png';
  var pegVisualUrl = '/assets/plinko-glass/peg.webp';
  var houseStripUrl = '/assets/plinko-glass/houses.webp';
  var control = null;
  var lastStamp = '';
  var houseImageUrl = '';
  var lastLoadAt = 0;
  var syncing = false;
  var syncQueued = false;
  var audioCtx = null;
  var lastSoundAt = 0;
  var liveWs = null;
  var liveReconnectTimer = 0;
  var liveReconnectAttempts = 0;
  var avatarCache = {};
  var seenLiveEvents = {};
  var seenLiveResults = {};
  var dropCooldownUntil = 0;
  var MIN_BET = 0.01;
  var BOARD_W = 360;
  var BOARD_H = 326;
  var CENTER_X = 180;
  var MAX_RENDER_DPR = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '')
    ? 2.5
    : 2.75;
  var MAX_LOCAL_BALLS = 5;
  var MAX_REMOTE_BALLS = 1;
  var multipliers = {
    13: { low: [5, 2.4, 1.8, 1.35, 1.15, 1, 0.85, 0.85, 1, 1.15, 1.35, 1.8, 2.4, 5] },
  };

  function q(id) {
    return document.getElementById(id);
  }
  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }
  function active() {
    var view = document.querySelector('.view.active');
    return !!(view && view.id === 'plinko');
  }
  function show(text) {
    var n = q('toast');
    if (!n) return;
    n.textContent = text;
    n.style.display = 'flex';
    clearTimeout(n.__p);
    n.__p = setTimeout(function () {
      n.style.display = 'none';
    }, 2200);
  }
  function awardXP(amount, source, metadata) {
    if (window.VexaLevel && typeof window.VexaLevel.add === 'function')
      window.VexaLevel.add(amount, source, metadata || { section: 'plinko' });
  }
  function roundCurrency(v) {
    var n = Math.max(0, Number(v) || 0);
    return Math.round((n + Number.EPSILON) * 100) / 100;
  }
  function fmtAmountInput(v) {
    var n = roundCurrency(v);
    return n
      .toFixed(2)
      .replace(/\.00$/, '')
      .replace(/(\.\d)0$/, '$1');
  }
  function fmtTon(v) {
    var n = Math.max(0, Number(v) || 0);
    return n
      .toFixed(4)
      .replace(/\.0+$/, '')
      .replace(/(\.\d*?)0+$/, '$1');
  }
  function fmtFeedTon(v) {
    return roundCurrency(v).toFixed(2);
  }
  function fmtFeedMultiplier(v) {
    var n = roundCurrency(v);
    return n.toFixed(2);
  }
  function readPoints() {
    if (window.VexaTonBalance && typeof window.VexaTonBalance.read === 'function')
      return Math.max(0, Math.floor(Number(window.VexaTonBalance.read()) || 0)) / NANO;
    return Math.max(0, Number((q('plinkoCredit') || {}).textContent || '1000') || 1000);
  }
  function renderPoints() {
    credit = readPoints();
    var display = fmtTon(credit);
    ['plinkoCredit', 'creditCount', 'plinkoCreditHeader'].forEach(function (id) {
      var el = q(id);
      if (el) el.textContent = display;
    });
    return credit;
  }
  function changePoints(delta) {
    var nano = Math.trunc((Number(delta) || 0) * NANO);
    if (window.VexaTonBalance && typeof window.VexaTonBalance.add === 'function') {
      window.VexaTonBalance.add(nano);
      credit = readPoints();
      return;
    }
    credit = Math.max(0, credit + (Number(delta) || 0));
    renderPoints();
    try {
      window.dispatchEvent(
        new CustomEvent('vexa-credit-game-change', { detail: { credit: credit, delta: delta } }),
      );
    } catch (e) {}
  }
  function forcePoints(next) {
    var value = Number(next) || 0;
    if (arguments.length && typeof next === 'object')
      value = Number(next.tonBalanceNano || 0) / NANO || Number(next.credit) || 0;
    credit = Math.max(0, value);
    renderPoints();
    var input = q('plinkoBet');
    if (input && Number(input.value) > credit && credit >= MIN_BET)
      input.value = fmtAmountInput(credit);
    syncControlPanel();
  }
  function amount() {
    var input = q('plinkoBet');
    credit = roundCurrency(readPoints());
    var value = Number(String((input && input.value) || '').replace(',', '.')) || 0;
    if (value < MIN_BET) value = MIN_BET;
    value = roundCurrency(value);
    if (credit >= MIN_BET && value > credit) value = roundCurrency(credit);
    if (input) input.value = fmtAmountInput(value);
    return value;
  }
  function prepareAmountInput() {
    var input = q('plinkoBet');
    if (!input) return;
    input.min = String(MIN_BET);
    input.step = '0.01';
    input.setAttribute('maxlength', '12');
    if (!input.value || Number(String(input.value).replace(',', '.')) < MIN_BET)
      input.value = fmtAmountInput(MIN_BET);
    else input.value = fmtAmountInput(input.value);
    syncControlPanel();
  }
  function label(n) {
    return Number.isInteger(n) ? String(n) : String(n).replace(/^0/, '0');
  }
  function houseCount() {
    return rows + 1;
  }
  function syncControlPanel() {
    var input = q('plinkoBet'),
      raw = Number(String((input && input.value) || '').replace(',', '.')) || MIN_BET,
      balance = roundCurrency(readPoints()),
      value = roundCurrency(raw);
    if (value < MIN_BET) value = MIN_BET;
    if (balance >= MIN_BET && value > balance) value = balance;
    if (input) input.value = fmtAmountInput(value);
    var open = document.querySelector('[data-plinko-bet-input-open]'),
      current = document.querySelector('[data-plinko-current]'),
      balanceEl = document.querySelector('[data-plinko-balance]'),
      mult = document.querySelector('[data-plinko-multiplier]'),
      rowsEl = document.querySelector('[data-plinko-rows]');
    if (open) open.textContent = fmtAmountInput(value);
    if (current) current.textContent = fmtAmountInput(value);
    if (balanceEl) balanceEl.textContent = fmtTon(balance);
    if (mult) mult.textContent = fmtFeedMultiplier(Math.max.apply(Math, currentMultipliers()));
    if (rowsEl) rowsEl.textContent = String(rows);
  }
  function controlItem() {
    var rk = String(rows);
    return control &&
      control.enabled !== false &&
      control.rows &&
      control.rows[rk] &&
      control.rows[rk].low
      ? control.rows[rk].low
      : null;
  }
  function currentMultipliers() {
    var item = controlItem();
    var source =
      item && Array.isArray(item.multipliers) && item.multipliers.length === houseCount()
        ? item.multipliers
        : multipliers[13].low;
    return source.map(function (value, index) {
      var n = Number(value);
      return Number.isFinite(n) && n > 0 ? n : multipliers[13].low[index];
    });
  }
  function pegRadius() {
    return 2.65;
  }
  function pegVisualRadius() {
    return 3.65;
  }
  function ballRadius() {
    return 6.45;
  }
  function binTextSize(count) {
    return count >= 14 ? 6.45 : 6.8;
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
  function updateIcon(url) {
    iconUrl = url || iconUrl;
    if (state && state.tokenImg && state.tokenImg.src !== iconUrl) state.tokenImg.src = iconUrl;
  }
  function loadHouseImage(url) {
    if (!url) return null;
    var img = new Image();
    img.onload = function () {
      dirty();
      draw();
    };
    img.onerror = function () {
      if (state && state.houseImg === img) {
        state.houseImg = null;
        dirty();
        draw();
      }
    };
    img.src = url;
    return img;
  }
  function setHouseImageVersion(version) {
    var next = version
      ? '/app/api/plinko-control-image/house.png?v=' + encodeURIComponent(version)
      : '';
    if (next === houseImageUrl) return;
    houseImageUrl = next;
    if (state) {
      state.houseImageUrl = next;
      state.houseImg = loadHouseImage(next);
      dirty();
      draw();
    }
  }
  function currentTelegramUser() {
    return window.Telegram &&
      window.Telegram.WebApp &&
      window.Telegram.WebApp.initDataUnsafe &&
      window.Telegram.WebApp.initDataUnsafe.user
      ? window.Telegram.WebApp.initDataUnsafe.user
      : null;
  }
  function currentUserId() {
    var user = currentTelegramUser();
    return user && user.id != null ? String(user.id) : '';
  }
  function currentUserPayload() {
    var user = currentTelegramUser() || {};
    var parts = [];
    if (user.first_name) parts.push(user.first_name);
    if (user.last_name) parts.push(user.last_name);
    var name = parts.join(' ').trim() || (user.username ? '@' + user.username : 'Player');
    return {
      userId: user.id != null ? String(user.id) : '',
      name: name,
      photoUrl: user.photo_url || '',
    };
  }
  function avatarKey(url) {
    return url || '__fallback__';
  }
  function avatarImage(url) {
    var key = avatarKey(url);
    if (avatarCache[key]) return avatarCache[key];
    var img = new Image();
    img.onload = function () {
      draw();
    };
    img.onerror = function () {
      if (url) {
        avatarCache[key] = avatarImage('');
        draw();
      }
    };
    img.src = url || iconUrl;
    avatarCache[key] = img;
    return img;
  }
  function liveEventId(event) {
    return event && event.id != null ? String(event.id) : '';
  }
  function hasSeenLiveEvent(event) {
    var id = liveEventId(event);
    return !!(id && seenLiveEvents[id]);
  }
  function markLiveEventSeen(event) {
    var id = liveEventId(event);
    if (id) seenLiveEvents[id] = Date.now();
  }
  function resultEventId(event) {
    return event && event.id != null ? String(event.id) : '';
  }
  function hasSeenLiveResult(event) {
    var id = resultEventId(event);
    return !!(id && seenLiveResults[id]);
  }
  function markLiveResultSeen(event) {
    var id = resultEventId(event);
    if (id) seenLiveResults[id] = Date.now();
  }
  function seededRandom(seed) {
    var str = String(seed);
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return function () {
      h += 0x6d2b79f5;
      var t = h;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function ballRandom(ball) {
    return ball && ball.rand ? ball.rand() : Math.random();
  }
  function dropButton() {
    return document.querySelector('[data-action="drop-plinko-ball"]');
  }
  function updateDropCooldownButton() {
    var btn = dropButton();
    if (!btn) return;
    var remaining = dropCooldownUntil - Date.now();
    if (!btn.__plinkoDropLabel)
      btn.__plinkoDropLabel = btn.getAttribute('aria-label') || 'Drop Ball';
    if (remaining > 0) {
      btn.disabled = true;
      btn.setAttribute('aria-label', 'Wait ' + Math.ceil(remaining / 1000) + 's');
      setTimeout(updateDropCooldownButton, Math.min(1000, remaining));
      return;
    }
    btn.disabled = false;
    btn.setAttribute('aria-label', btn.__plinkoDropLabel);
    syncControlPanel();
  }
  function ensureLiveFeed() {
    var page =
      document.querySelector('#plinko .plinko-page') || document.querySelector('.plinko-page');
    if (!page) return null;
    var style = q('plinkoLiveFeedStyle');
    if (!style) {
      style = document.createElement('style');
      style.id = 'plinkoLiveFeedStyle';
      style.textContent =
        '.plinko-live-feed{width:min(96%,374px);display:grid;gap:6px;margin-top:7px;position:relative;z-index:2;max-height:118px;overflow:hidden;contain:layout paint style;content-visibility:auto;contain-intrinsic-size:374px 118px}.plinko-live-row{height:34px;border:0;border-radius:17px;background:rgba(255,255,255,.045);display:grid;grid-template-columns:24px minmax(0,1fr) auto auto;align-items:center;gap:7px;padding:0 9px;color:#fff;box-shadow:none}.plinko-live-row img{width:24px;height:24px;border-radius:50%;object-fit:cover}.plinko-live-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;font-weight:850}.plinko-live-meta{font-size:10px;font-weight:850;color:rgba(255,255,255,.68);white-space:nowrap}.plinko-live-mult{font-size:11px;font-weight:950;color:#fff;white-space:nowrap}';
      document.head.appendChild(style);
    }
    var feed = q('plinkoLiveFeed');
    if (feed) return feed;
    feed = document.createElement('div');
    feed.id = 'plinkoLiveFeed';
    feed.className = 'plinko-live-feed';
    var controls = page.querySelector('.plinko-controls');
    if (controls && controls.parentNode === page) page.insertBefore(feed, controls.nextSibling);
    else page.appendChild(feed);
    return feed;
  }
  function addLiveFeed(ball, bin, result) {
    var feed = ensureLiveFeed();
    if (!feed || !ball || !bin) return;
    var amountValue = Math.max(
      0,
      Number(result && result.amount != null ? result.amount : ball.amount) || 0,
    );
    if (!amountValue) amountValue = MIN_BET;
    amountValue = roundCurrency(amountValue);
    var multValue = Number(result && result.multiplier != null ? result.multiplier : bin.mult);
    if (!Number.isFinite(multValue) || multValue < 0) multValue = 0;
    multValue = roundCurrency(multValue);
    var totalValue = Number(
      result && result.total != null ? result.total : amountValue * multValue,
    );
    if (!Number.isFinite(totalValue) || totalValue < 0) totalValue = amountValue * multValue;
    totalValue = roundCurrency(totalValue);
    var row = document.createElement('div');
    row.className = 'plinko-live-row';
    if (row.dataset) {
      row.dataset.amount = String(amountValue);
      row.dataset.multiplier = String(multValue);
      row.dataset.total = String(totalValue);
      if (result && result.createdAt != null) row.dataset.createdAt = String(result.createdAt);
      if (result && result.id != null) row.dataset.resultId = String(result.id);
    }
    var img = document.createElement('img');
    img.src = (result && result.photoUrl) || ball.photoUrl || iconUrl;
    img.onerror = function () {
      this.src = iconUrl;
    };
    var name = document.createElement('div');
    name.className = 'plinko-live-name';
    name.textContent = (result && result.name) || ball.name || 'Player';
    var amount = document.createElement('div');
    amount.className = 'plinko-live-meta';
    amount.textContent = 'TON ' + fmtFeedTon(amountValue);
    var house = document.createElement('div');
    house.className = 'plinko-live-meta';
    house.textContent = 'Win ' + fmtFeedTon(totalValue);
    var mult = document.createElement('div');
    mult.className = 'plinko-live-mult';
    mult.textContent = '×' + fmtFeedMultiplier(multValue);
    row.appendChild(img);
    row.appendChild(name);
    row.appendChild(amount);
    row.appendChild(mult);
    row.title =
      amount.textContent +
      ' · Multiplier ×' +
      fmtFeedMultiplier(multValue) +
      ' · ' +
      house.textContent;
    feed.insertBefore(row, feed.firstChild);
    while (feed.children.length > 5) feed.removeChild(feed.lastChild);
  }
  function addResultToLiveFeed(event) {
    if (!event || hasSeenLiveResult(event)) return;
    markLiveResultSeen(event);
    addLiveFeed(
      {
        amount: Number(event.amount) || MIN_BET,
        name: event.name || 'Player',
        photoUrl: event.photoUrl || '',
      },
      { mult: Number(event.multiplier) || 0 },
      event,
    );
  }
  function primeAudio() {
    var Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return;
    if (!audioCtx) audioCtx = new Ctor();
    if (audioCtx && audioCtx.resume) audioCtx.resume().catch(function () {});
  }
  function pegSound() {
    var nowMs = performance.now();
    if (nowMs - lastSoundAt < 150) return;
    lastSoundAt = nowMs;
    try {
      primeAudio();
      if (!audioCtx || audioCtx.state === 'suspended') return;
      var now = audioCtx.currentTime;
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(570 + Math.random() * 100, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.032, now + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch (e) {}
  }
  function loadControl() {
    return fetch('/app/api/plinko-control', { cache: 'no-store' })
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        if (data && data.rows) {
          var houseVersion =
            data.assets && data.assets.houseVersion ? String(data.assets.houseVersion) : '';
          setHouseImageVersion(houseVersion);
          var stamp =
            String(data.updatedAt || JSON.stringify(data.rows)) + '|house:' + houseVersion;
          var changed = stamp !== lastStamp;
          control = data;
          lastStamp = stamp;
          if (changed) rebuildBoard(hasBalls());
        }
      })
      .catch(function () {});
  }
  function requestSync(force) {
    var now = Date.now();
    if (!force && !active()) return Promise.resolve();
    if (!force && now - lastLoadAt < 1200) return Promise.resolve();
    if (syncing) {
      syncQueued = Boolean(force || syncQueued);
      return Promise.resolve();
    }
    syncing = true;
    lastLoadAt = now;
    return loadControl().finally(function () {
      syncing = false;
      if (syncQueued) {
        syncQueued = false;
        requestSync(true);
      }
    });
  }
  function smartLoadPlinkoControl(force) {
    return requestSync(force);
  }
  function liveUrl() {
    var proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return proto + '//' + window.location.host + '/app/api/plinko/live/ws';
  }
  function shouldLive() {
    return active() && !document.hidden;
  }
  function closeLive() {
    if (liveReconnectTimer) {
      clearTimeout(liveReconnectTimer);
      liveReconnectTimer = 0;
    }
    if (liveWs) {
      var ws = liveWs;
      liveWs = null;
      try {
        ws.close();
      } catch (e) {}
    }
  }
  function scheduleLiveReconnect() {
    if (!shouldLive() || liveReconnectTimer) return;
    var delay = Math.min(10000, 1200 + liveReconnectAttempts * 1200);
    liveReconnectAttempts += 1;
    liveReconnectTimer = setTimeout(function () {
      liveReconnectTimer = 0;
      ensureLive();
    }, delay);
  }
  function ensureLive() {
    if (!shouldLive()) {
      closeLive();
      return;
    }
    if (
      liveWs &&
      (liveWs.readyState === WebSocket.OPEN || liveWs.readyState === WebSocket.CONNECTING)
    )
      return;
    try {
      var ws = new WebSocket(liveUrl());
      liveWs = ws;
      ws.onopen = function () {
        liveReconnectAttempts = 0;
      };
      ws.onmessage = function (ev) {
        handleLiveMessage(ev.data);
      };
      ws.onclose = function () {
        if (liveWs === ws) liveWs = null;
        scheduleLiveReconnect();
      };
      ws.onerror = function () {
        try {
          ws.close();
        } catch (e) {}
      };
    } catch (e) {
      scheduleLiveReconnect();
    }
  }
  function applyLiveHour(msg) {
    try {
      var detail = {
        hourlyTurnover: roundCurrency(Number(msg && msg.hourlyTurnover) || 0),
        hourStartedAt: Number(msg && msg.hourStartedAt) || 0,
      };
      window.__plinkoLiveHour = detail;
      window.dispatchEvent(new CustomEvent('vexa-plinko-live-hour', { detail: detail }));
    } catch (e) {}
  }
  function handleLiveMessage(data) {
    try {
      var msg = JSON.parse(data);
      if (!msg) return;
      if (msg.type === 'plinko-history' && Array.isArray(msg.events)) {
        applyLiveHour(msg);
        msg.events.slice().reverse().forEach(addResultToLiveFeed);
        return;
      }
      if (msg.type === 'plinko-result' && msg.event) {
        applyLiveHour(msg);
        addResultToLiveFeed(msg.event);
        return;
      }
      if (msg.type !== 'plinko-ball' || !msg.event) return;
      var event = msg.event;
      if (hasSeenLiveEvent(event)) return;
      markLiveEventSeen(event);
      if (String(event.userId || '') === currentUserId()) return;
      spawnBall({
        id: event.id,
        userId: event.userId,
        amount: roundCurrency(Number(event.amount) || MIN_BET),
        name: event.name,
        photoUrl: event.photoUrl,
        remote: true,
        seed: event.seed,
      });
    } catch (e) {}
  }
  function hitPeg(x, y) {
    if (!state) return;
    pegSound();
  }
  function drawPeg(ctx, x, y, r, hit) {
    if (state && state.pegVisualImg && state.pegVisualImg.complete && state.pegVisualImg.naturalWidth > 0) {
      var visualSize = Math.max(8.5, r * (hit ? 2.75 : 2.45));
      ctx.save();
      if (hit) {
        ctx.shadowColor = 'rgba(177,55,82,.58)';
        ctx.shadowBlur = 6;
      }
      ctx.drawImage(state.pegVisualImg, x - visualSize / 2, y - visualSize / 2, visualSize, visualSize);
      ctx.restore();
      return;
    }
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r * 1.04, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,.10)';
    ctx.fill();
    var edge = ctx.createRadialGradient(x - r * 0.36, y - r * 0.42, r * 0.06, x, y, r * 1.08);
    edge.addColorStop(0, 'rgba(255,255,255,1)');
    edge.addColorStop(0.24, 'rgba(255,255,255,.88)');
    edge.addColorStop(0.58, 'rgba(255,255,255,.42)');
    edge.addColorStop(1, 'rgba(255,255,255,.12)');
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = edge;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x - r * 0.28, y - r * 0.34, Math.max(1, r * 0.23), 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,.88)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,.72)';
    ctx.lineWidth = Math.max(0.55, r * 0.1);
    ctx.stroke();
    ctx.restore();
  }
  function drawBin(ctx, bin) {
    var r = Math.min(9, Math.max(5, bin.w * 0.24));
    ctx.save();
    roundRect(ctx, bin.x, bin.y, bin.w, bin.h, r);
    ctx.strokeStyle = 'rgba(255,255,255,.34)';
    ctx.lineWidth = 0.9;
    ctx.stroke();
    roundRect(ctx, bin.x + 1.6, bin.y + 1.6, bin.w - 3.2, bin.h - 3.2, Math.max(3, r - 1.6));
    ctx.strokeStyle = 'rgba(255,255,255,.13)';
    ctx.lineWidth = 0.55;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bin.x + Math.min(5, bin.w * 0.18), bin.y + 3.2);
    ctx.lineTo(bin.x + bin.w - Math.min(5, bin.w * 0.18), bin.y + 3.2);
    ctx.strokeStyle = 'rgba(255,255,255,.28)';
    ctx.lineWidth = 0.7;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();
  }
  function hasBalls() {
    return !!(state && state.balls && state.balls.length);
  }
  function hasEffects() {
    return !!(state && state.effects && state.effects.length);
  }
  function scheduleFrame(delay) {
    if (!state || state.raf || state.timer) return;
    var start = function () {
      if (!state) return;
      state.timer = 0;
      if (!state.raf) state.raf = requestAnimationFrame(tick);
    };
    if (delay && delay > 0) state.timer = setTimeout(start, delay);
    else start();
  }
  function dirty() {
    if (state) state.staticDirty = true;
  }
  function rebuildBoard(preserveBalls) {
    if (!state) return init(true);
    var oldBalls = preserveBalls && state.balls ? state.balls : [];
    state.pegs = makePegs();
    state.bins = makeBins();
    state.balls = oldBalls;
    state.effects = state.effects || [];
    dirty();
    draw();
    if (hasBalls() || hasEffects()) scheduleFrame(0);
  }
  function makePegs() {
    var pegs = [];
    var top = 26,
      bottom = 248,
      pegRows = 13,
      rowGap = (bottom - top) / Math.max(1, pegRows - 1);
    var slotCount = houseCount();
    var slotLeft = 4,
      slotWidth = 352,
      slotGap = slotWidth / slotCount;
    var r = pegRadius(),
      vr = pegVisualRadius();
    for (var row = 0; row < pegRows; row++) {
      var count = row + 3;
      var start = slotLeft + ((slotCount - (count - 1)) * slotGap) / 2;
      var y = top + row * rowGap;
      var pr = row === pegRows - 1 ? r * 0.7 : r;
      for (var i = 0; i < count; i++)
        pegs.push({ key: row + ':' + i, x: start + i * slotGap, y: y, r: pr, vr: vr, hit: 0 });
    }
    return pegs;
  }
  function makeBins() {
    var mult = currentMultipliers();
    var count = houseCount();
    var bins = [];
    var left = 4,
      top = 260,
      width = 352,
      height = 14,
      gutter = 2;
    var binW = width / count;
    for (var j = 0; j < count; j++)
      bins.push({
        x: left + j * binW + gutter / 2,
        y: top,
        w: binW - gutter,
        h: height,
        label: label(mult[j]),
        mult: Number(mult[j]),
      });
    return bins;
  }
  function binIndexFromX(x, bins, left, right) {
    return clamp(Math.floor((x - left) / ((right - left) / bins.length)), 0, bins.length - 1);
  }
  function init(force) {
    var canvas = q('plinkoCanvasV2');
    if (!canvas) return;
    if (state && state.canvas === canvas && !force) {
      draw();
      return;
    }
    prepareAmountInput();
    ensureLiveFeed();
    var dpr = Math.min(window.devicePixelRatio || 1, MAX_RENDER_DPR);
    canvas.width = BOARD_W * dpr;
    canvas.height = BOARD_H * dpr;
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    var prev = state;
    var img = new Image();
    img.onload = function () {
      draw();
    };
    img.src = iconUrl;
    state = {
      canvas: canvas,
      ctx: ctx,
      dpr: dpr,
      pegs: makePegs(),
      bins: makeBins(),
      balls: [],
      effects: [],
      last: 0,
      raf: (prev && prev.raf) || 0,
      timer: (prev && prev.timer) || 0,
      staticCanvas: (prev && prev.staticCanvas) || null,
      staticCtx: (prev && prev.staticCtx) || null,
      staticDpr: 0,
      staticDirty: true,
      tokenImg: img,
      pegVisualImg: prev && prev.pegVisualImg ? prev.pegVisualImg : loadHouseImage(pegVisualUrl),
      houseStripImg: prev && prev.houseStripImg ? prev.houseStripImg : loadHouseImage(houseStripUrl),
      houseImageUrl: houseImageUrl,
      houseImg:
        prev && prev.houseImageUrl === houseImageUrl
          ? prev.houseImg
          : loadHouseImage(houseImageUrl),
    };
    renderPoints();
    var rowsEl = q('plinkoRowsValue');
    if (rowsEl) rowsEl.textContent = '13';
    draw();
    scheduleFrame(0);
  }
  function spawnBall(opts) {
    init();
    if (!state) return false;
    var maxBalls = opts && opts.remote ? MAX_REMOTE_BALLS : MAX_LOCAL_BALLS;
    if (
      state.balls &&
      state.balls.filter(function (ball) {
        return !!(ball && ball.remote) === !!(opts && opts.remote);
      }).length >= maxBalls
    ) {
      if (!opts || !opts.remote) show('Please wait for a few balls to finish');
      return false;
    }
    var activeTop = state.balls.filter(function (ball) {
      return ball && !ball.sinking && ball.y < 34;
    }).length;
    var spread = [0, -6, 6, -12, 12, -3, 3, -9, 9];
    var rng = opts && opts.seed != null ? seededRandom(opts.seed) : Math.random;
    var startX = CENTER_X + (spread[activeTop % spread.length] || 0) + (rng() * 2 - 1);
    var vx = rng() * 0.2 - 0.1;
    var ball = {
      id: (opts && opts.id) || '',
      userId: (opts && opts.userId) || '',
      x: startX,
      y: 2,
      vx: vx,
      vy: 0.11,
      r: ballRadius(),
      amount: roundCurrency(Math.max(MIN_BET, Number(opts && opts.amount) || MIN_BET)),
      name: (opts && opts.name) || 'Player',
      photoUrl: (opts && opts.photoUrl) || '',
      pathPhase: rng() * 2,
      age: 0,
      hitPegKeys: {},
      sinking: false,
      sink: 0,
      settled: false,
      settleX: null,
      img: avatarImage(opts && opts.photoUrl),
      remote: !!(opts && opts.remote),
      rand: rng,
    };
    state.balls.push(ball);
    scheduleFrame(0);
    return ball;
  }
  function drop() {
    smartLoadPlinkoControl(false);
    ensureLive();
    init();
    primeAudio();
    if (!state) return;
    var cooldownLeft = dropCooldownUntil - Date.now();
    if (cooldownLeft > 0) {
      show('Wait ' + Math.ceil(cooldownLeft / 1000) + 's');
      updateDropCooldownButton();
      return;
    }
    if (
      state.balls &&
      state.balls.filter(function (ball) {
        return ball && !ball.remote;
      }).length >= MAX_LOCAL_BALLS
    ) {
      show('Please wait for a few balls to finish');
      return;
    }
    var value = amount();
    if (value < MIN_BET) {
      show('Minimum amount is 0.01');
      return;
    }
    if (roundCurrency(credit) + 0.000001 < value) {
      show('Not enough points');
      return;
    }
    var payload = currentUserPayload();
    if (!payload.userId) {
      show('Telegram user not found');
      return;
    }
    payload.amount = roundCurrency(value);
    var localId = 'local-' + Date.now() + '-' + Math.floor(Math.random() * 1000000);
    dropCooldownUntil = Date.now() + 6000;
    updateDropCooldownButton();
    var ball = spawnBall({
      id: localId,
      userId: payload.userId,
      amount: value,
      name: payload.name,
      photoUrl: payload.photoUrl,
      seed: localId,
    });
    if (!ball) {
      dropCooldownUntil = 0;
      updateDropCooldownButton();
      return;
    }
    changePoints(-value);
    awardXP(2, 'game-start', { section: 'plinko', event: 'drop-ball', amount: value });
    fetch('/app/api/plinko/live/send', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    })
      .then(function (r) {
        return r.json().then(function (data) {
          return { ok: r.ok, status: r.status, data: data };
        });
      })
      .then(function (res) {
        if (!res.ok) {
          if (res.status === 429 && res.data && res.data.waitMs)
            show('Wait ' + Math.ceil(res.data.waitMs / 1000) + 's');
          else show((res.data && res.data.error) || 'Live sync failed');
          return;
        }
        var event = res.data && res.data.event;
        markLiveEventSeen(event);
        if (event && event.id != null) ball.id = String(event.id);
      })
      .catch(function () {
        show('Live sync failed');
      });
  }
  function sendPlinkoResult(ball, bin, total) {
    var result = {
      id: ball.id || '',
      userId: ball.userId || currentUserId(),
      name: ball.name || 'Player',
      photoUrl: ball.photoUrl || '',
      amount: roundCurrency(Math.max(0, Number(ball.amount) || 0)),
      multiplier: roundCurrency(Math.max(0, Number(bin && bin.mult) || 0)),
      total: roundCurrency(Math.max(0, Number(total) || 0)),
    };
    markLiveResultSeen(result);
    fetch('/app/api/plinko/live/result', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(result),
      cache: 'no-store',
    }).catch(function () {});
    return result;
  }
  function settle(ball, bin) {
    if (ball.settled) return;
    if (bin && Number.isFinite(Number(bin.x)) && Number.isFinite(Number(bin.w)))
      ball.settleX = clamp(bin.x + bin.w / 2, bin.x + (ball.r || 0), bin.x + bin.w - (ball.r || 0));
    ball.settled = true;
    if (state) state.effects.push({ bin: bin, life: 18, max: 18 });
    var mult = roundCurrency(Math.max(0, Number(bin && bin.mult) || 0));
    var total = roundCurrency(Math.max(0, (Number(ball.amount) || 0) * mult));
    var result = ball.remote ? null : sendPlinkoResult(ball, bin, total);
    if (!ball.remote) {
      addLiveFeed(ball, bin, result);
      changePoints(total);
      var winEl = document.querySelector('[data-plinko-win]');
      if (winEl) winEl.textContent = fmtAmountInput(total);
      try {
        window.dispatchEvent(
          new CustomEvent('vexa-plinko-last-win', {
            detail: {
              total: total,
              multiplier: mult,
              amount: roundCurrency(Number(ball.amount) || 0),
            },
          }),
        );
      } catch (e) {}
      syncControlPanel();
      if (total > roundCurrency(Number(ball.amount) || 0)) {
        awardXP(mult >= 5 ? 50 : mult >= 2 ? 25 : 10, 'game-win', {
          section: 'plinko',
          event: 'settle',
          result: 'win',
          multiplier: mult,
          total: total,
          amount: roundCurrency(Number(ball.amount) || 0),
        });
      } else {
        awardXP(4, 'game-lose', {
          section: 'plinko',
          event: 'settle',
          result: 'no-win',
          multiplier: mult,
          total: total,
          amount: roundCurrency(Number(ball.amount) || 0),
        });
      }
    }
  }
  function collide(ball, peg, left, right, prevX, prevY) {
    var dx = ball.x - peg.x,
      dy = ball.y - peg.y,
      min = ball.r + peg.r + 0.95;
    if (Math.abs(dx) > min + 2 && Math.abs(ball.x - (prevX !== undefined ? prevX : ball.x)) < min)
      return;
    if (Math.abs(dy) > min + 2 && Math.abs(ball.y - (prevY !== undefined ? prevY : ball.y)) < min)
      return;
    var dist = Math.sqrt(dx * dx + dy * dy) || 1;
    if (dist >= min && prevX !== undefined && prevY !== undefined) {
      var sx = ball.x - prevX,
        sy = ball.y - prevY,
        len2 = sx * sx + sy * sy;
      if (len2 > 0) {
        var t = ((peg.x - prevX) * sx + (peg.y - prevY) * sy) / len2;
        t = clamp(t, 0, 1);
        var cx = prevX + sx * t,
          cy = prevY + sy * t,
          cdx = cx - peg.x,
          cdy = cy - peg.y,
          cd = Math.sqrt(cdx * cdx + cdy * cdy) || 1;
        if (cd < min) {
          dx = cdx;
          dy = cdy;
          dist = cd;
          ball.x = cx;
          ball.y = cy;
        } else {
          return;
        }
      } else {
        return;
      }
    } else if (dist >= min) {
      return;
    }
    var key = peg.key;
    var speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    if (!ball.hitPegKeys[key] && speed >= 0.16) {
      ball.hitPegKeys[key] = 1;
      hitPeg(peg.x, peg.y);
    }
    var nx = dx / dist,
      ny = dy / dist;
    var overlap = min - dist;
    ball.x += nx * (overlap + 0.04);
    ball.y += ny * (overlap + 0.04);
    var vn = ball.vx * nx + ball.vy * ny;
    if (vn < 0) {
      ball.vx -= (1 + 0.5) * vn * nx;
      ball.vy -= (1 + 0.5) * vn * ny;
      var tx = -ny,
        ty = nx;
      var vt = ball.vx * tx + ball.vy * ty;
      ball.vx -= vt * 0.035 * tx;
      ball.vy -= vt * 0.035 * ty;
      ball.vx += (ballRandom(ball) - 0.5) * 0.024;
      ball.vx = clamp(ball.vx, -1.45, 1.45);
    }
    ball.vx *= 0.992;
    ball.vy *= 0.992;
    if (ball.vy < -0.44) ball.vy = -0.44;
    if (ball.vy > 2.25) ball.vy = 2.25;
    if (ball.x < left + ball.r) {
      ball.x = left + ball.r;
      ball.vx = Math.abs(ball.vx) * 0.42;
    }
    if (ball.x > right - ball.r) {
      ball.vx = -Math.abs(ball.vx) * 0.42;
    }
  }
  function tick(time) {
    if (!state) return;
    var raw = time - (state.last || time) || 16;
    var dt = Math.min(20, raw) / 16.67;
    state.last = time;
    var balls = state.balls,
      bins = state.bins,
      pegs = state.pegs;
    var left = bins[0].x,
      right = bins[bins.length - 1].x + bins[bins.length - 1].w,
      binTop = bins[0].y,
      binBottom = bins[0].y + bins[0].h;
    for (var b = balls.length - 1; b >= 0; b--) {
      var ball = balls[b];
      ball.age = (ball.age || 0) + dt;
      if (ball.sinking) {
        ball.sink += dt;
        if (Number.isFinite(ball.settleX)) ball.x += clamp(ball.settleX - ball.x, -1.05, 1.05) * dt;
        ball.y += 0.48 * dt;
        ball.r *= 0.978;
        if (ball.sink > 30 || ball.r < 1.2) balls.splice(b, 1);
        continue;
      }
      ball.vy += 0.145 * dt;
      ball.vx *= 0.996;
      if (ball.vy > 2.25) ball.vy = 2.25;
      if (ball.vy < -0.44) ball.vy = -0.44;
      ball.vx += (ballRandom(ball) - 0.5) * 0.01 * dt;
      var prevX = ball.x,
        prevY = ball.y;
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;
      if (ball.x < left + ball.r) {
        ball.x = left + ball.r;
        ball.vx = Math.abs(ball.vx) * 0.42;
      }
      if (ball.x > right - ball.r) {
        ball.x = right - ball.r;
        ball.vx = -Math.abs(ball.vx) * 0.42;
      }
      var minY = Math.min(prevY, ball.y) - ball.r - 7,
        maxY = Math.max(prevY, ball.y) + ball.r + 7;
      for (var p = 0; p < pegs.length; p++) {
        var peg = pegs[p];
        if (peg.y < minY || peg.y > maxY) continue;
        collide(ball, peg, left, right, prevX, prevY);
      }
      if (ball.y + ball.r > binTop + 5) {
        var bin = bins[binIndexFromX(ball.x, bins, left, right)];
        for (var s = 1; s < bins.length; s++) {
          var wall = left + (s * (right - left)) / bins.length;
          if (Math.abs(ball.x - wall) < ball.r && ball.y > binTop - 6 && ball.y < binBottom) {
            if (ball.x < wall) {
              ball.x = wall - ball.r;
              ball.vx = -Math.abs(ball.vx) * 0.42;
            } else {
              ball.x = wall + ball.r;
              ball.vx = Math.abs(ball.vx) * 0.42;
            }
            ball.vy *= 0.8;
          }
        }
        if (ball.y + ball.r > bin.y + bin.h * 0.62) {
          ball.settleX = clamp(bin.x + bin.w / 2, bin.x + ball.r, bin.x + bin.w - ball.r);
          ball.vx *= 0.22;
          ball.vy *= 0.22;
          settle(ball, bin);
          ball.sinking = true;
          ball.sink = 0;
        }
      }
      if (ball.y > 316) {
        if (!ball.settled) {
          settle(ball, bins[binIndexFromX(ball.x, bins, left, right)]);
        }
        balls.splice(b, 1);
      }
    }
    draw();
    state.raf = 0;
    if (hasBalls() || hasEffects()) scheduleFrame(0);
  }
  function staticBoard() {
    if (!state) return null;
    var dpr = state.dpr || 1;
    if (!state.staticCanvas || state.staticDpr !== dpr) {
      state.staticCanvas = document.createElement('canvas');
      state.staticCanvas.width = BOARD_W * dpr;
      state.staticCanvas.height = BOARD_H * dpr;
      state.staticCtx = state.staticCanvas.getContext('2d');
      state.staticDpr = dpr;
      state.staticDirty = true;
    }
    if (!state.staticDirty) return state.staticCanvas;
    var ctx = state.staticCtx;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, BOARD_W, BOARD_H);
    for (var p = 0; p < state.pegs.length; p++) {
      var peg = state.pegs[p];
      drawPeg(ctx, peg.x, peg.y, peg.vr || peg.r, 0);
    }
    var bins = state.bins;
    if (state.houseStripImg && state.houseStripImg.complete && state.houseStripImg.naturalWidth > 0)
      ctx.drawImage(state.houseStripImg, 4, 253, 352, 28);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '800 8.4px Arial,system-ui,sans-serif';
    for (var b = 0; b < bins.length; b++) {
      var bin = bins[b];
      ctx.fillStyle = b === 6 || b === 7 ? 'rgba(255,78,115,.98)' : 'rgba(255,255,255,.94)';
      ctx.fillText(bin.label, bin.x + bin.w / 2, bin.y + bin.h / 2);
    }
    state.staticDirty = false;
    return state.staticCanvas;
  }
  function drawEffects(ctx) {
    if (!state) return;
    for (var r = state.effects.length - 1; r >= 0; r--) {
      var ring = state.effects[r];
      ring.life -= 1;
      var a = Math.max(0, ring.life / ring.max);
      ctx.save();
      if (ring.bin) {
        var bin = ring.bin;
        ctx.globalAlpha = a;
        var glow = ctx.createLinearGradient(bin.x, bin.y, bin.x, bin.y + bin.h);
        glow.addColorStop(0, 'rgba(255,255,255,.07)');
        glow.addColorStop(0.55, 'rgba(255,255,255,.17)');
        glow.addColorStop(1, 'rgba(255,255,255,.04)');
        ctx.fillStyle = glow;
        ctx.fillRect(bin.x + 3, bin.y + 4, Math.max(1, bin.w - 6), Math.max(1, bin.h - 7));
        ctx.restore();
        if (ring.life <= 0) state.effects.splice(r, 1);
        continue;
      }
      ctx.restore();
      state.effects.splice(r, 1);
    }
  }
  function draw() {
    if (!state) return;
    var ctx = state.ctx,
      dpr = state.dpr || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, BOARD_W, BOARD_H);
    var base = staticBoard();
    if (base) ctx.drawImage(base, 0, 0, BOARD_W, BOARD_H);
    drawEffects(ctx);
    for (var b = 0; b < state.balls.length; b++) {
      var ball = state.balls[b],
        img = ball.img || state.tokenImg,
        alpha = ball.sinking ? Math.max(0, 1 - ball.sink / 34) : 1;
      ctx.save();
      ctx.globalAlpha = alpha;
      if (img && img.complete && img.naturalWidth > 0) {
        var size = ball.r * 2.45;
        ctx.save();
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, size / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, ball.x - size / 2, ball.y - size / 2, size, size);
        ctx.restore();
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, size / 2, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,.26)';
        ctx.lineWidth = 0.65;
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
      }
      ctx.restore();
    }
  }
  document.addEventListener('pointerdown', primeAudio, { passive: true });
  document.addEventListener('touchstart', primeAudio, { passive: true });
  document.addEventListener(
    'click',
    function (ev) {
      var button = ev.target && ev.target.closest && ev.target.closest('button');
      primeAudio();
      if (!button) return;
      if (
        button.getAttribute('data-view') === 'plinko' ||
        button.getAttribute('data-game-view') === 'plinko'
      ) {
        setTimeout(function () {
          smartLoadPlinkoControl(true);
          init(true);
          ensureLive();
        }, 0);
      } else if (button.hasAttribute('data-view') || button.hasAttribute('data-game-view')) {
        setTimeout(function () {
          if (!active()) closeLive();
        }, 0);
      }
      var action = button.getAttribute('data-action');
      if (action === 'drop-plinko-ball') {
        ev.preventDefault();
        ev.stopPropagation();
        drop();
      }
    },
    true,
  );
  document.addEventListener('input', function (ev) {
    if (ev.target && ev.target.id === 'plinkoBet') syncControlPanel();
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) closeLive();
    else if (active()) {
      smartLoadPlinkoControl(true);
      ensureLive();
    }
  });
  window.addEventListener('focus', function () {
    if (active()) {
      smartLoadPlinkoControl(true);
      ensureLive();
    }
  });
  window.addEventListener('vexa-credit-sync', function (ev) {
    if (ev && ev.detail) forcePoints(ev.detail);
  });
  window.addEventListener('vexa-ton-balance-sync', function (ev) {
    if (ev && ev.detail) forcePoints(ev.detail);
  });
  window.addEventListener('vexa-credit-icon-sync', function (ev) {
    if (ev && ev.detail && ev.detail.url) updateIcon(ev.detail.url);
  });
  window.plinkoReloadControl = function () {
    smartLoadPlinkoControl(true);
  };
  if (window.MutationObserver) {
    new MutationObserver(function () {
      if (shouldLive()) ensureLive();
      else closeLive();
    }).observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class'] });
  }
  if (q('plinkoCanvasV2')) init(true);
  syncControlPanel();
  if (active()) {
    smartLoadPlinkoControl(true);
    ensureLive();
  }
})();
`;
