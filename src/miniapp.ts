export function miniAppHtml(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>AI Builder TEL</title>
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  <style>
    :root {
      --bg: #050505;
      --card: rgba(255,255,255,.072);
      --card-strong: rgba(255,255,255,.105);
      --line: rgba(255,255,255,.14);
      --text: #f8f8f8;
      --muted: rgba(255,255,255,.62);
      --soft: rgba(255,255,255,.42);
      --black: #050505;
      --white: #fff;
      --radius-xl: 26px;
      --radius-lg: 20px;
      --shadow: 0 24px 70px rgba(0,0,0,.46);
      color-scheme: dark;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; min-height: 100%; background: var(--bg); color: var(--text); }
    body {
      overflow: hidden;
      background:
        radial-gradient(circle at 78% 4%, rgba(255,255,255,.14), transparent 26%),
        radial-gradient(circle at 8% 0%, rgba(255,255,255,.055), transparent 20%),
        linear-gradient(180deg, #101010 0%, #060606 52%, #000 100%);
    }
    button, input, textarea, select { font: inherit; }
    button { cursor: pointer; border: 0; }
    .app {
      width: min(100%, 560px);
      height: 100dvh;
      margin: 0 auto;
      padding: calc(14px + env(safe-area-inset-top)) 16px calc(86px + env(safe-area-inset-bottom));
      position: relative;
      overflow: hidden;
    }
    .decor {
      position: fixed;
      right: -42px;
      top: 72px;
      width: 238px;
      height: 238px;
      pointer-events: none;
      opacity: .46;
      z-index: 0;
      filter: drop-shadow(0 18px 45px rgba(255,255,255,.055));
    }
    .decor svg { width: 100%; height: 100%; }
    .topbar {
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      position: relative;
      z-index: 2;
      margin-bottom: 8px;
    }
    .brand { display: flex; align-items: center; gap: 11px; min-width: 0; }
    .mark {
      width: 42px;
      height: 42px;
      border-radius: 16px;
      border: 1px solid var(--line);
      background: linear-gradient(145deg, rgba(255,255,255,.16), rgba(255,255,255,.035));
      display: grid;
      place-items: center;
      box-shadow: inset 0 1px rgba(255,255,255,.22);
      flex: 0 0 auto;
    }
    .brand h1 { margin: 0; font-size: 18px; line-height: 1; letter-spacing: -.035em; white-space: nowrap; }
    .brand p { margin: 4px 0 0; font-size: 11px; color: var(--muted); white-space: nowrap; }
    .icon-btn {
      width: 42px;
      height: 42px;
      border-radius: 999px;
      border: 1px solid var(--line);
      background: rgba(255,255,255,.06);
      color: var(--text);
      display: grid;
      place-items: center;
      flex: 0 0 auto;
    }
    .content {
      height: calc(100dvh - 56px - env(safe-area-inset-top) - env(safe-area-inset-bottom));
      position: relative;
      z-index: 1;
      overflow: hidden;
    }
    .view {
      display: none;
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 2px 1px 12px;
      scrollbar-width: none;
      animation: rise .22s ease both;
    }
    .view::-webkit-scrollbar, .bot-list::-webkit-scrollbar, .chat::-webkit-scrollbar, .mono::-webkit-scrollbar { display: none; }
    .view.active { display: block; }
    @keyframes rise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    .hero {
      position: relative;
      min-height: 178px;
      padding: 12px 0 4px;
    }
    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 7px 11px;
      color: var(--muted);
      background: rgba(255,255,255,.06);
      font-size: 10.5px;
      letter-spacing: .095em;
      text-transform: uppercase;
    }
    .hero h2 {
      font-size: clamp(36px, 10.7vw, 54px);
      line-height: .94;
      letter-spacing: -.072em;
      margin: 15px 0 10px;
      max-width: 390px;
    }
    .hero p {
      margin: 0;
      max-width: 340px;
      color: var(--muted);
      font-size: 14.5px;
      line-height: 1.42;
    }
    .actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin: 14px 0 13px;
    }
    .primary, .secondary {
      height: 50px;
      border-radius: 17px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 9px;
      font-size: 14px;
      font-weight: 760;
      letter-spacing: -.016em;
    }
    .primary { color: var(--black); background: var(--white); box-shadow: 0 16px 42px rgba(255,255,255,.12); }
    .secondary { color: var(--text); background: rgba(255,255,255,.052); border: 1px solid var(--line); }
    .grid { display: grid; gap: 13px; }
    .card {
      border: 1px solid var(--line);
      border-radius: var(--radius-xl);
      background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.038));
      box-shadow: var(--shadow);
      backdrop-filter: blur(18px);
      overflow: hidden;
      position: relative;
    }
    .card::before {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(140deg, rgba(255,255,255,.055), transparent 34%);
      pointer-events: none;
    }
    .card-pad { padding: 16px; }
    .section-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 13px;
      position: relative;
      z-index: 1;
    }
    .section-title h3 { margin: 0; font-size: 16px; letter-spacing: -.035em; }
    .section-title span, .tiny { color: var(--muted); font-size: 12px; line-height: 1.42; }
    .features {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 9px;
    }
    .feature {
      min-height: 88px;
      border: 1px solid rgba(255,255,255,.09);
      border-radius: 18px;
      background: rgba(0,0,0,.16);
      display: flex;
      align-items: center;
      gap: 11px;
      padding: 11px;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.18;
      text-align: left;
    }
    .round {
      width: 42px;
      height: 42px;
      border-radius: 999px;
      border: 1px solid var(--line);
      display: grid;
      place-items: center;
      background: rgba(255,255,255,.05);
      color: var(--text);
      flex: 0 0 auto;
    }
    .round svg, .tab svg, .send svg, .primary svg, .secondary svg { width: 19px; height: 19px; }
    .bot-list {
      position: relative;
      z-index: 1;
      display: grid;
      gap: 9px;
      overflow-y: auto;
      min-height: 0;
    }
    .home-bots { max-height: 160px; }
    .bot-row {
      display: grid;
      grid-template-columns: 42px minmax(0, 1fr) auto;
      align-items: center;
      gap: 11px;
      border: 1px solid rgba(255,255,255,.09);
      border-radius: 18px;
      padding: 10px;
      background: rgba(0,0,0,.22);
    }
    .bot-row strong { display: block; font-size: 14px; letter-spacing: -.02em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .bot-row small { display: block; margin-top: 2px; color: var(--muted); font-size: 11.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .pill { border: 1px solid var(--line); border-radius: 999px; padding: 6px 9px; color: var(--muted); font-size: 11px; white-space: nowrap; }
    .tabs {
      height: 64px;
      position: absolute;
      left: 16px;
      right: 16px;
      bottom: calc(12px + env(safe-area-inset-bottom));
      z-index: 5;
      border: 1px solid var(--line);
      border-radius: 24px;
      background: rgba(8,8,8,.86);
      backdrop-filter: blur(24px);
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      padding: 7px;
      box-shadow: 0 16px 42px rgba(0,0,0,.46);
    }
    .tab {
      min-height: 48px;
      border-radius: 17px;
      color: var(--muted);
      background: transparent;
      display: grid;
      place-items: center;
      gap: 2px;
      font-size: 10.5px;
    }
    .tab.active { color: var(--black); background: var(--white); }
    .field { display: grid; gap: 7px; margin: 12px 0; position: relative; z-index: 1; }
    label { font-size: 10.5px; color: var(--muted); text-transform: uppercase; letter-spacing: .09em; }
    input, textarea, select {
      width: 100%;
      border: 1px solid var(--line);
      background: rgba(0,0,0,.28);
      color: var(--text);
      border-radius: 17px;
      padding: 13px 14px;
      outline: none;
      font-size: 14px;
    }
    textarea { min-height: 128px; resize: vertical; line-height: 1.42; }
    input:focus, textarea:focus, select:focus { border-color: rgba(255,255,255,.42); box-shadow: 0 0 0 4px rgba(255,255,255,.055); }
    .create-card, .bots-card, .settings-card { min-height: 100%; }
    .create-card .primary { width: 100%; margin-top: 14px; position: relative; z-index: 1; }
    .create-card .tiny { margin: 11px 0 0; position: relative; z-index: 1; }
    .bots-card { height: 100%; display: flex; flex-direction: column; }
    .bots-card .bot-list { flex: 1; }
    .workspace-stack { display: grid; gap: 12px; }
    .chat {
      height: 260px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 9px;
      padding: 12px;
      border: 1px solid var(--line);
      border-radius: 20px;
      background: rgba(0,0,0,.24);
      position: relative;
      z-index: 1;
    }
    .msg { max-width: 90%; padding: 10px 12px; border-radius: 16px; line-height: 1.36; font-size: 13px; white-space: pre-wrap; }
    .ai { align-self: flex-start; background: rgba(255,255,255,.08); border: 1px solid var(--line); }
    .me { align-self: flex-end; background: var(--white); color: var(--black); }
    .composer { display: grid; grid-template-columns: minmax(0,1fr) 50px; gap: 9px; margin-top: 10px; position: relative; z-index: 1; }
    .send { width: 50px; height: 50px; border-radius: 17px; background: var(--white); color: var(--black); display: grid; place-items: center; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; color: var(--muted); white-space: pre-wrap; max-height: 190px; overflow-y: auto; position: relative; z-index: 1; }
    .toast {
      position: fixed;
      left: 16px;
      right: 16px;
      bottom: calc(86px + env(safe-area-inset-bottom));
      z-index: 20;
      max-width: 528px;
      margin: 0 auto;
      padding: 12px 14px;
      border: 1px solid var(--line);
      border-radius: 17px;
      background: rgba(18,18,18,.96);
      box-shadow: var(--shadow);
      display: none;
      font-size: 13px;
    }
    .empty { color: var(--muted); padding: 14px 0; line-height: 1.42; font-size: 13px; }
    @media (max-height: 720px) {
      .app { padding-left: 14px; padding-right: 14px; }
      .content { height: calc(100dvh - 56px - env(safe-area-inset-top) - env(safe-area-inset-bottom)); }
      .decor { width: 198px; height: 198px; right: -54px; top: 62px; opacity: .36; }
      .hero { min-height: auto; }
      .hero h2 { font-size: clamp(31px, 9vw, 42px); margin: 11px 0 8px; }
      .hero p { font-size: 13px; }
      .features { grid-template-columns: repeat(4, 1fr); gap: 7px; }
      .feature { min-height: 74px; padding: 8px; display: grid; place-items: center; text-align: center; gap: 5px; font-size: 10.5px; }
      .round { width: 34px; height: 34px; }
      .card-pad { padding: 14px; }
      .chat { height: 210px; }
      .mono { max-height: 128px; }
    }
    @media (max-width: 380px) {
      .hero h2 { font-size: 33px; }
      .actions { grid-template-columns: 1fr; }
      .features { grid-template-columns: 1fr 1fr; }
      .primary, .secondary { height: 48px; }
    }
  </style>
</head>
<body>
  <div class="decor" aria-hidden="true">
    <svg viewBox="0 0 260 260" fill="none">
      <circle cx="142" cy="92" r="58" stroke="white" stroke-opacity=".26" stroke-width="1.2"/>
      <circle cx="142" cy="92" r="94" stroke="white" stroke-opacity=".13"/>
      <path d="M30 118h205M142 14v196" stroke="white" stroke-opacity=".08"/>
      <path d="M72 58c43-43 112-47 161-7" stroke="white" stroke-opacity=".31" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M70 169c47 36 117 32 157-15" stroke="white" stroke-opacity=".16" stroke-linecap="round"/>
      <g opacity=".13"><path d="M76 82h126M76 104h126M76 148h126" stroke="white"/><path d="M104 65v101M134 65v101M164 65v101" stroke="white"/></g>
      <circle cx="78" cy="54" r="5" fill="white"/>
      <path d="M130 93l62-26-23 68-18-27-29-15z" fill="white" fill-opacity=".94"/>
    </svg>
  </div>
  <main class="app">
    <header class="topbar">
      <div class="brand"><div class="mark"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 7h14M5 12h14M5 17h9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div><div><h1>AI Builder TEL</h1><p>No-code bot workspace</p></div></div>
      <button class="icon-btn" onclick="syncTelegramUser()"><svg width="21" height="21" viewBox="0 0 24 24" fill="none"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" stroke="currentColor" stroke-width="1.7"/></svg></button>
    </header>

    <div class="content">
      <section id="home" class="view">
        <div class="hero"><span class="eyebrow">No code. All power.</span><h2>Build Telegram Bots Without Code</h2><p>Create, connect, and improve your bot with AI inside one workspace.</p></div>
        <div class="actions"><button class="primary" onclick="showView('create')"><svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Create Bot</button><button class="secondary" onclick="showView('workspace')"><svg viewBox="0 0 24 24" fill="none"><path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" stroke="currentColor" stroke-width="1.7"/></svg>Workspace</button></div>
        <div class="grid">
          <section class="card card-pad"><div class="section-title"><h3>What you can do</h3><span>Live</span></div><div class="features"><div class="feature"><div class="round"><svg viewBox="0 0 24 24" fill="none"><path d="M9.5 14.5l5-5M8 11a4 4 0 015.7 0M10.3 16.7a4 4 0 005.7 0" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg></div><div>Connect<br/>Token</div></div><div class="feature"><div class="round"><svg viewBox="0 0 24 24" fill="none"><path d="M5 7h14v8H9l-4 4V7z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg></div><div>Chat<br/>with AI</div></div><div class="feature"><div class="round"><svg viewBox="0 0 24 24" fill="none"><path d="M13 3L5 14h6l-1 7 8-11h-6l1-7z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg></div><div>Apply<br/>Changes</div></div><div class="feature"><div class="round"><svg viewBox="0 0 24 24" fill="none"><path d="M4 12L20 4l-6 16-3-7-7-1z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg></div><div>Publish<br/>Instantly</div></div></div></section>
          <section class="card card-pad"><div class="section-title"><h3>My Bots</h3><button class="secondary" style="height:34px;padding:0 12px;border-radius:999px" onclick="showView('bots')">View all</button></div><div id="homeBots" class="bot-list home-bots"><div class="empty">Loading your bots...</div></div></section>
        </div>
      </section>

      <section id="create" class="view active"><section class="card card-pad create-card"><div class="section-title"><h3>Connect Telegram Bot</h3><span>AI powered</span></div><div class="field"><label>BotFather Token</label><input id="token" placeholder="123456789:AA..." autocomplete="off" /></div><div class="field"><label>What should your bot do?</label><textarea id="prompt" placeholder="Example: Build a premium support bot for my digital product business. It should answer FAQs, show products, collect leads, and sound confident."></textarea></div><button class="primary" onclick="createBot()">Generate & Publish</button><p class="tiny">Your token is encrypted. The app creates the blueprint, connects webhook, and publishes instantly.</p></section></section>

      <section id="bots" class="view"><section class="card card-pad bots-card"><div class="section-title"><h3>Your Bots</h3><button class="secondary" style="height:34px;padding:0 12px;border-radius:999px" onclick="loadBots()">Refresh</button></div><div id="botsList" class="bot-list"><div class="empty">Loading...</div></div></section></section>

      <section id="workspace" class="view"><div class="workspace-stack"><section class="card card-pad"><div class="section-title"><h3>AI Workspace</h3><span id="activeBotLabel">No bot selected</span></div><div class="field"><label>Selected Bot</label><select id="botSelect" onchange="selectBot(this.value)"></select></div><div id="chat" class="chat"><div class="msg ai">Select a bot, then tell AI what to change. Example: "Add a pricing menu and make the welcome message more premium."</div></div><div class="composer"><input id="chatInput" placeholder="Tell AI what to build or change..." onkeydown="if(event.key==='Enter') chatApply()" /><button class="send" onclick="chatApply()"><svg viewBox="0 0 24 24" fill="none"><path d="M4 12L20 4l-6 16-3-7-7-1z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg></button></div></section><section class="card card-pad"><div class="section-title"><h3>Blueprint</h3><span>JSON</span></div><div id="blueprint" class="mono">No bot selected.</div></section></div></section>

      <section id="settings" class="view"><section class="card card-pad settings-card"><div class="section-title"><h3>Settings</h3><span>Minimal</span></div><div class="field"><label>Telegram User ID</label><input id="ownerId" placeholder="Auto from Telegram Mini App" /></div><button class="primary" onclick="saveOwner()">Save User</button><p class="tiny">In Telegram, this is automatically detected from WebApp user data when available.</p></section></section>
    </div>
  </main>
  <div id="toast" class="toast"></div>
  <script>
    const tg = window.Telegram?.WebApp;
    tg?.ready();
    tg?.expand();
    let ownerId = localStorage.getItem('ownerId') || String(tg?.initDataUnsafe?.user?.id || '');
    let bots = [];
    let selectedBot = null;
    document.getElementById('ownerId').value = ownerId;
    function syncTelegramUser(){ ownerId = String(tg?.initDataUnsafe?.user?.id || ownerId || ''); document.getElementById('ownerId').value = ownerId; saveOwner(); }
    function saveOwner(){ ownerId = document.getElementById('ownerId').value.trim(); localStorage.setItem('ownerId', ownerId); toast('User saved'); loadBots(); }
    function showView(id){ document.querySelectorAll('.view').forEach(v=>v.classList.remove('active')); document.getElementById(id).classList.add('active'); document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active', t.dataset.tab===id)); if(id==='bots'||id==='workspace') loadBots(); }
    function toast(text){ const el=document.getElementById('toast'); el.textContent=text; el.style.display='block'; setTimeout(()=>el.style.display='none',2400); }
    async function api(path, options={}){ const r=await fetch(path,{...options,headers:{'content-type':'application/json',...(options.headers||{})}}); const j=await r.json().catch(()=>({error:'Invalid response'})); if(!r.ok) throw new Error(j.error||'Request failed'); return j; }
    function botRow(bot){ return '<div class="bot-row" onclick="selectBot(\''+bot.id+'\');showView(\'workspace\')"><div class="round"><svg viewBox="0 0 24 24" fill="none"><path d="M8 9h8M9 14h1m4 0h1M7 4h10v4H7V4zm-2 4h14v11H5V8z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div><strong>'+escapeHtml(bot.title)+'</strong><small>'+(bot.username?'@'+escapeHtml(bot.username):bot.id)+'</small></div><span class="pill">'+escapeHtml(bot.status)+'</span></div>'; }
    async function loadBots(){ if(!ownerId){ document.getElementById('botsList').innerHTML='<div class="empty">Open inside Telegram or set your user ID in Settings.</div>'; document.getElementById('homeBots').innerHTML='<div class="empty">Open inside Telegram or set your user ID in Settings.</div>'; return; } try{ const data=await api('/app/api/bots?ownerId='+encodeURIComponent(ownerId)); bots=data.bots||[]; const html=bots.length?bots.map(botRow).join(''):'<div class="empty">No bots yet. Create your first one.</div>'; document.getElementById('botsList').innerHTML=html; document.getElementById('homeBots').innerHTML=html; const select=document.getElementById('botSelect'); select.innerHTML=bots.map(b=>'<option value="'+b.id+'">'+escapeHtml(b.title)+'</option>').join(''); if(bots[0]&&!selectedBot) selectBot(bots[0].id); }catch(e){ toast(e.message); } }
    async function createBot(){ const token=document.getElementById('token').value.trim(); const prompt=document.getElementById('prompt').value.trim(); if(!ownerId) return toast('Set Telegram user first'); if(!token) return toast('Bot token is required'); if(prompt.length<10) return toast('Describe the bot first'); try{ toast('Building and publishing...'); const data=await api('/app/api/bots',{method:'POST',body:JSON.stringify({ownerTelegramId:ownerId,telegramToken:token,prompt})}); toast('Bot published: @'+(data.username||'connected')); document.getElementById('token').value=''; document.getElementById('prompt').value=''; await loadBots(); selectBot(data.botId); showView('workspace'); }catch(e){ toast(e.message); } }
    async function selectBot(id){ if(!id) return; try{ const data=await api('/app/api/bots/'+id); selectedBot=data; document.getElementById('activeBotLabel').textContent=data.username?'@'+data.username:data.title; document.getElementById('blueprint').textContent=JSON.stringify(data.blueprint,null,2); const sel=document.getElementById('botSelect'); if(sel) sel.value=id; }catch(e){ toast(e.message); } }
    function addMsg(text, who){ const el=document.createElement('div'); el.className='msg '+who; el.textContent=text; document.getElementById('chat').appendChild(el); el.scrollIntoView({behavior:'smooth',block:'end'}); }
    async function chatApply(){ if(!selectedBot) return toast('Select a bot first'); const input=document.getElementById('chatInput'); const instruction=input.value.trim(); if(!instruction) return; input.value=''; addMsg(instruction,'me'); addMsg('Applying changes...', 'ai'); try{ const data=await api('/app/api/bots/'+selectedBot.id+'/chat',{method:'POST',body:JSON.stringify({instruction})}); document.querySelector('#chat .msg.ai:last-child').textContent=data.summary||'Changes applied.'; await selectBot(selectedBot.id); }catch(e){ addMsg(e.message,'ai'); } }
    function escapeHtml(v){ return String(v||'').replace(/[&<>'"]/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[s])); }
    loadBots();
  </script>
</body>
</html>`;
}
