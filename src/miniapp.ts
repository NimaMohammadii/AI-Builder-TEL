export function miniAppHtml(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta
    name="viewport"
    content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"
  />
  <meta name="theme-color" content="#050507" />
  <title>Vexa Connect</title>
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  <style>
    :root {
      color-scheme: dark;
      --bg: #050507;
      --card: rgba(255, 255, 255, .045);
      --card-strong: rgba(255, 255, 255, .07);
      --text: #fff;
      --muted: rgba(255, 255, 255, .58);
      --soft: rgba(255, 255, 255, .10);
      --accent: #7e1430;
    }

    * {
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
    }

    html,
    body {
      width: 100%;
      min-height: 100%;
      margin: 0;
      background:
        radial-gradient(circle at 12% -10%, rgba(126, 20, 48, .36), transparent 34%),
        radial-gradient(circle at 94% 10%, rgba(255, 255, 255, .08), transparent 30%),
        var(--bg);
      color: var(--text);
      font-family: Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif;
      overflow: hidden;
    }

    button,
    input,
    textarea {
      font: inherit;
    }

    button {
      border: 0;
      cursor: pointer;
    }

    .app {
      position: relative;
      width: 100%;
      max-width: 460px;
      min-height: 100dvh;
      margin: 0 auto;
      padding: calc(16px + env(safe-area-inset-top)) 16px calc(22px + env(safe-area-inset-bottom));
      overflow: hidden;
    }

    .top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 18px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 11px;
      min-width: 0;
    }

    .logo {
      width: 44px;
      height: 44px;
      border-radius: 16px;
      object-fit: cover;
      box-shadow: 0 16px 38px rgba(0, 0, 0, .28);
    }

    .brand h1 {
      margin: 0;
      font-size: 22px;
      line-height: 1;
      letter-spacing: -.055em;
      font-weight: 900;
    }

    .brand p {
      margin: 5px 0 0;
      color: var(--muted);
      font-size: 12px;
      font-weight: 650;
    }

    .content {
      height: calc(100dvh - 86px - env(safe-area-inset-top) - env(safe-area-inset-bottom));
      overflow-y: auto;
      overflow-x: hidden;
      padding-bottom: 20px;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
    }

    .content::-webkit-scrollbar {
      display: none;
    }

    .hero {
      margin: 4px 0 16px;
    }

    .eyebrow {
      display: inline-flex;
      height: 28px;
      align-items: center;
      padding: 0 11px;
      border-radius: 999px;
      background: rgba(255, 255, 255, .055);
      color: rgba(255, 255, 255, .70);
      font-size: 10px;
      font-weight: 850;
      text-transform: uppercase;
      letter-spacing: .14em;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, .10);
    }

    .hero h2 {
      margin: 12px 0 7px;
      font-size: clamp(36px, 10vw, 48px);
      line-height: .9;
      font-weight: 950;
      letter-spacing: -.07em;
    }

    .hero p {
      margin: 0;
      max-width: 330px;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.42;
      font-weight: 570;
    }

    .card {
      position: relative;
      margin: 0 0 12px;
      border-radius: 30px;
      background: var(--card);
      box-shadow:
        0 24px 64px rgba(0, 0, 0, .34),
        inset 0 1px 0 rgba(255, 255, 255, .10);
      overflow: hidden;
    }

    .card:before {
      content: "";
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at 88% -8%, rgba(126, 20, 48, .28), transparent 34%),
        linear-gradient(135deg, rgba(255, 255, 255, .035), transparent 52%);
      pointer-events: none;
    }

    .pad {
      position: relative;
      z-index: 1;
      padding: 18px;
    }

    .title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 14px;
    }

    .title h3 {
      margin: 0;
      color: #fff;
      font-size: 18px;
      line-height: 1;
      font-weight: 900;
      letter-spacing: -.045em;
    }

    .title span,
    .ghost {
      height: 30px;
      padding: 0 11px;
      border-radius: 999px;
      background: rgba(255, 255, 255, .055);
      color: rgba(255, 255, 255, .72);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 760;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, .09);
    }

    .field {
      display: grid;
      gap: 8px;
      margin-bottom: 12px;
    }

    .field label {
      color: rgba(255, 255, 255, .58);
      font-size: 11px;
      font-weight: 760;
    }

    input,
    textarea {
      width: 100%;
      border: 0;
      outline: 0;
      border-radius: 20px;
      background: rgba(255, 255, 255, .055);
      color: #fff;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, .08);
    }

    input {
      height: 50px;
      padding: 0 15px;
      font-size: 14px;
    }

    textarea {
      min-height: 86px;
      resize: none;
      padding: 14px 15px;
      line-height: 1.4;
    }

    input::placeholder,
    textarea::placeholder {
      color: rgba(255, 255, 255, .32);
    }

    .primary {
      width: 100%;
      height: 50px;
      border-radius: 999px;
      background: rgba(255, 255, 255, .92);
      color: #09090b;
      font-size: 14px;
      font-weight: 900;
      box-shadow: 0 16px 34px rgba(255, 255, 255, .08);
    }

    .tiny {
      margin-top: 10px;
      color: rgba(255, 255, 255, .48);
      font-size: 11px;
      line-height: 1.35;
      font-weight: 560;
    }

    .list {
      display: grid;
      gap: 9px;
    }

    .notice,
    .bot-row {
      position: relative;
      width: 100%;
      min-height: 70px;
      border: 0;
      border-radius: 23px;
      background: rgba(255, 255, 255, .03);
      color: rgba(255, 255, 255, .72);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, .055);
    }

    .notice {
      padding: 15px;
      line-height: 1.35;
      text-align: left;
    }

    .bot-row {
      display: grid;
      grid-template-columns: 46px minmax(0, 1fr) auto;
      gap: 12px;
      align-items: center;
      padding: 12px;
    }

    .bot-row strong {
      display: block;
      color: #fff;
      font-size: 14px;
      line-height: 1.05;
      font-weight: 870;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .bot-row small {
      display: block;
      margin-top: 5px;
      color: rgba(255, 255, 255, .48);
      font-size: 11px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .avatar,
    .avatar-fallback,
    .connect-icon-glass {
      width: 46px;
      height: 46px;
      border-radius: 17px;
      display: grid;
      place-items: center;
      background: rgba(255, 255, 255, .055);
      color: #fff;
      overflow: hidden;
      object-fit: cover;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, .10);
    }

    .avatar-fallback span {
      font-size: 13px;
      font-weight: 900;
    }

    .row-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .connect-action-glass {
      width: 36px;
      height: 36px;
      border-radius: 999px;
      display: grid;
      place-items: center;
      padding: 0;
      background: rgba(255, 255, 255, .055);
      color: rgba(255, 255, 255, .82);
    }

    .group-add {
      display: flex;
      align-items: center;
      gap: 14px;
      min-height: 92px;
      padding: 14px;
      text-align: left;
    }

    .group-add b {
      display: block;
      margin-bottom: 5px;
      color: #fff;
      font-size: 14px;
    }

    .group-add span span {
      color: rgba(255, 255, 255, .56);
      font-size: 12px;
    }

    .toast {
      position: fixed;
      left: 18px;
      right: 18px;
      bottom: calc(18px + env(safe-area-inset-bottom));
      z-index: 20;
      display: none;
      max-width: 430px;
      margin: 0 auto;
      border-radius: 18px;
      padding: 13px 14px;
      background: rgba(255, 255, 255, .88);
      color: #07070a;
      font-size: 13px;
      font-weight: 850;
      text-align: center;
      box-shadow: 0 16px 50px rgba(0, 0, 0, .32);
    }
  </style>
</head>
<body>
  <main class="app">
    <header class="top">
      <div class="brand">
        <img class="logo" src="https://t.me/i/userpic/320/VexaFlowBOT.jpg" alt="Vexa FLOW" />
        <div>
          <h1>Vexa Connect</h1>
          <p>AI bot control</p>
        </div>
      </div>
    </header>

    <div class="content">
      <section class="hero">
        <span class="eyebrow">Connect</span>
        <h2>Connect Bot</h2>
        <p>Connect your Telegram bot, manage your bots, and add Vexa to groups from one clean page.</p>
      </section>

      <section class="card">
        <div class="pad">
          <div class="title">
            <h3>Connect BotFather Key</h3>
            <span id="builderStatus">Ready</span>
          </div>
          <div class="field">
            <label>BotFather Key</label>
            <input id="botKey" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Paste bot token here" />
          </div>
          <div class="field">
            <label>What should your bot do?</label>
            <textarea id="botPrompt" placeholder="Example: Build a support bot for my customers."></textarea>
          </div>
          <button class="primary" type="button" data-action="create-bot">Connect Bot</button>
          <div class="tiny">Telegram verifies the token securely. Your bot will be published automatically.</div>
        </div>
      </section>

      <section class="card">
        <div class="pad">
          <div class="title">
            <h3>Your bots</h3>
            <button class="ghost" type="button" data-action="refresh">Refresh</button>
          </div>
          <div id="homeBots" class="list">
            <div class="notice">Loading</div>
          </div>
        </div>
      </section>

      <section class="card">
        <div class="pad">
          <div class="title">
            <h3>Groups</h3>
            <span id="groupsStatus">Auto-detected</span>
          </div>
          <div id="homeGroups" class="list">
            <div class="notice">Add Vexa to a Telegram group, then call Vexa there.</div>
          </div>
        </div>
      </section>
    </div>
  </main>

  <div id="toast" class="toast"></div>

  <script>
    (function () {
      var tg = window.Telegram && window.Telegram.WebApp;
      tg && tg.ready && tg.ready();
      tg && tg.expand && tg.expand();

      function q(id) {
        return document.getElementById(id);
      }

      function toast(text) {
        var el = q('toast');
        if (!el) return;
        el.textContent = text;
        el.style.display = 'block';
        setTimeout(function () {
          el.style.display = 'none';
        }, 2400);
      }

      function esc(value) {
        return String(value || '').replace(/[&<>']/g, function (char) {
          return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;'
          }[char] || char;
        });
      }

      function tgUser() {
        return (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) || {};
      }

      function ownerId() {
        var id = localStorage.getItem('ownerId') || String(tgUser().id || '');
        if (id) localStorage.setItem('ownerId', id);
        return id;
      }

      function initials(value) {
        value = String(value || 'B').replace(/@/g, '').trim();
        return (value.match(/[A-Za-z0-9]/g) || ['B']).slice(0, 2).join('').toUpperCase();
      }

      function icon(name) {
        if (name === 'play') return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="pointer-events:none"><path d="M8 5.5v13l10-6.5-10-6.5Z" fill="currentColor"/></svg>';
        if (name === 'pause') return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" style="pointer-events:none"><path d="M8 6v12M16 6v12"/></svg>';
        if (name === 'trash') return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events:none"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7l1-3h4l1 3"/></svg>';
        return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" style="pointer-events:none"><path d="M12 5v14M5 12h14"/></svg>';
      }

      async function api(path, options) {
        var response = await fetch(path, Object.assign({
          headers: { 'content-type': 'application/json' },
          cache: 'no-store'
        }, options || {}));
        var json = await response.json().catch(function () {
          return { error: 'Invalid response' };
        });
        if (!response.ok) throw new Error(json.error || 'Request failed');
        return json;
      }

      function avatar(bot) {
        if (bot.username) {
          return '<img class="avatar" src="https://t.me/i/userpic/320/' + encodeURIComponent(bot.username) + '.jpg" alt="" referrerpolicy="no-referrer" />';
        }
        return '<div class="avatar-fallback"><span>' + esc(initials(bot.title || bot.id)) + '</span></div>';
      }

      function botRow(bot) {
        var nextStatus = bot.status === 'active' ? 'paused' : 'active';
        return '<div class="bot-row">'
          + avatar(bot)
          + '<div><strong>' + esc(bot.title || 'Bot') + '</strong><small>' + (bot.username ? '@' + esc(bot.username) : esc(bot.id)) + '</small></div>'
          + '<div class="row-actions">'
          + '<button class="connect-action-glass" type="button" data-action="toggle-user-bot" data-bot-id="' + esc(bot.id) + '" data-next-status="' + nextStatus + '">' + (bot.status === 'active' ? icon('pause') : icon('play')) + '</button>'
          + '<button class="connect-action-glass" type="button" data-action="delete-user-bot" data-bot-id="' + esc(bot.id) + '">' + icon('trash') + '</button>'
          + '</div></div>';
      }

      function groupInitial(group) {
        var text = String((group && (group.title || group.username || group.chatId)) || '#').trim();
        return text ? text.charAt(0).toUpperCase() : '#';
      }

      function ton(group) {
        var nano = Number(group && group.tonSpentNano);
        var value = Number.isFinite(nano) && nano > 0 ? nano / 1000000000 : Number(group && group.tonSpent || 0);
        if (!Number.isFinite(value) || value < 0) value = 0;
        return value.toFixed(4).replace(/0+$/, '').replace(/\.$/, '') + ' TON';
      }

      function emptyGroups() {
        return '<button type="button" data-action="add-main-group" class="notice group-add">'
          + '<span class="connect-icon-glass">' + icon('plus') + '</span>'
          + '<span><b>Add Vexa to group</b><span>Add the main bot to a Telegram group from here.</span></span>'
          + '</button>';
      }

      function groupRow(group) {
        return '<div class="bot-row">'
          + '<div class="avatar-fallback"><span>' + esc(groupInitial(group)) + '</span></div>'
          + '<div><strong>' + esc(group.title || group.chatId) + '</strong><small>Vexa • ' + esc(group.type || 'group') + ' • ' + esc(ton(group)) + '</small></div>'
          + '<div class="row-actions"><button class="connect-action-glass" type="button" data-action="leave-main-group" data-chat-id="' + esc(group.chatId) + '">' + icon('trash') + '</button></div>'
          + '</div>';
      }

      async function loadBots() {
        var box = q('homeBots');
        var id = ownerId();
        if (!box) return;
        if (!id) {
          box.innerHTML = '<div class="notice">Open inside Telegram first.</div>';
          return;
        }
        try {
          var data = await api('/app/api/bots?ownerId=' + encodeURIComponent(id));
          var bots = data.bots || [];
          box.innerHTML = bots.length ? bots.map(botRow).join('') : '<div class="notice">No bots yet. Connect your first bot.</div>';
        } catch (error) {
          box.innerHTML = '<div class="notice">Could not load bots.</div>';
        }
      }

      async function loadGroups() {
        var box = q('homeGroups');
        if (!box) return;
        try {
          var id = ownerId();
          var path = '/app/api/bots/main/groups' + (id ? '?userId=' + encodeURIComponent(id) : '');
          var data = await api(path);
          var groups = data.groups || [];
          box.innerHTML = groups.length ? groups.map(groupRow).join('') : emptyGroups();
          var status = q('groupsStatus');
          if (status) status.textContent = groups.length ? String(groups.length) + ' groups' : 'Auto-detected';
        } catch (error) {
          box.innerHTML = emptyGroups();
        }
      }

      async function createBot() {
        var token = (q('botKey').value || '').trim();
        var prompt = (q('botPrompt').value || '').trim();
        var id = ownerId();
        if (!id) return toast('Open inside Telegram first.');
        if (!token) return toast('BotFather key is required.');
        if (prompt.length < 10) prompt = 'Build a helpful Telegram bot connected through Vexa AI Builder.';

        try {
          q('builderStatus').textContent = 'Connecting';
          toast('Connecting bot...');
          var data = await api('/app/api/bots', {
            method: 'POST',
            body: JSON.stringify({
              ownerTelegramId: id,
              telegramToken: token,
              prompt: prompt
            })
          });
          q('botKey').value = '';
          q('botPrompt').value = '';
          q('builderStatus').textContent = 'Ready';
          toast('Connected: @' + (data.username || 'bot'));
          await loadBots();
        } catch (error) {
          q('builderStatus').textContent = 'Ready';
          toast(error.message || 'Could not connect bot.');
        }
      }

      async function setBotStatus(id, status) {
        try {
          await api('/app/api/bots/' + encodeURIComponent(id) + '/status', {
            method: 'PATCH',
            body: JSON.stringify({ status: status })
          });
          await loadBots();
        } catch (error) {
          toast(error.message || 'Could not update bot.');
        }
      }

      async function deleteBot(id) {
        if (!confirm('Delete this bot?')) return;
        try {
          await api('/app/api/bots/' + encodeURIComponent(id), { method: 'DELETE' });
          await loadBots();
        } catch (error) {
          toast(error.message || 'Could not delete bot.');
        }
      }

      async function addGroup() {
        try {
          sessionStorage.setItem('vexaGroupClaimPendingUntil', String(Date.now() + 90000));
          var data = await api('/app/api/main-bot');
          if (!data.addGroupUrl) throw new Error('Main bot link not found.');
          if (tg && typeof tg.openTelegramLink === 'function') tg.openTelegramLink(data.addGroupUrl);
          else window.open(data.addGroupUrl, '_blank');
        } catch (error) {
          toast(error.message || 'Could not open main bot.');
        }
      }

      async function leaveGroup(chatId) {
        var id = ownerId();
        if (!chatId || !id) return;
        if (!confirm('Remove Vexa from this group?')) return;
        try {
          await api('/app/api/groups/' + encodeURIComponent(chatId) + '/leave', {
            method: 'DELETE',
            body: JSON.stringify({ userId: id })
          });
          await loadGroups();
        } catch (error) {
          toast(error.message || 'Could not leave group.');
        }
      }

      document.addEventListener('click', function (event) {
        var target = event.target && event.target.closest ? event.target.closest('[data-action]') : null;
        if (!target) return;
        var action = target.getAttribute('data-action');
        if (action === 'create-bot') return createBot();
        if (action === 'refresh') return Promise.all([loadBots(), loadGroups()]);
        if (action === 'toggle-user-bot') return setBotStatus(target.getAttribute('data-bot-id'), target.getAttribute('data-next-status'));
        if (action === 'delete-user-bot') return deleteBot(target.getAttribute('data-bot-id'));
        if (action === 'add-main-group') return addGroup();
        if (action === 'leave-main-group') return leaveGroup(target.getAttribute('data-chat-id'));
      }, true);

      loadBots();
      loadGroups();
    })();
  </script>
</body>
</html>`;
}
