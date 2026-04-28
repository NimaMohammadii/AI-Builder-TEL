import { PUBLIC_BASE_URL } from './utils';

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
      --panel: rgba(255,255,255,.055);
      --panel-2: rgba(255,255,255,.085);
      --line: rgba(255,255,255,.13);
      --text: #f7f7f7;
      --muted: rgba(255,255,255,.62);
      --soft: rgba(255,255,255,.34);
      --white: #fff;
      --black: #000;
      --radius: 28px;
      --shadow: 0 22px 70px rgba(0,0,0,.42);
      color-scheme: dark;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; min-height: 100%; background: var(--bg); color: var(--text); }
    body {
      background:
        radial-gradient(circle at 85% 14%, rgba(255,255,255,.16), transparent 28%),
        radial-gradient(circle at 10% 0%, rgba(255,255,255,.07), transparent 24%),
        linear-gradient(180deg, #0d0d0d 0%, #050505 46%, #000 100%);
      overflow-x: hidden;
    }
    button, input, textarea { font: inherit; }
    button { cursor: pointer; border: 0; }
    .app { width: min(100%, 560px); margin: 0 auto; min-height: 100vh; padding: calc(18px + env(safe-area-inset-top)) 18px calc(24px + env(safe-area-inset-bottom)); position: relative; }
    .orb { position: fixed; inset: 78px -80px auto auto; width: 260px; height: 260px; pointer-events: none; opacity: .58; }
    .orb svg { width: 100%; height: 100%; }
    .topbar { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 10px 2px 22px; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .mark { width: 44px; height: 44px; border: 1px solid var(--line); border-radius: 16px; background: linear-gradient(145deg, rgba(255,255,255,.14), rgba(255,255,255,.03)); display: grid; place-items: center; box-shadow: inset 0 1px rgba(255,255,255,.2); }
    .brand h1 { font-size: 20px; margin: 0; letter-spacing: -.03em; }
    .brand p { margin: 2px 0 0; font-size: 12px; color: var(--muted); }
    .icon-btn { width: 44px; height: 44px; border-radius: 999px; border: 1px solid var(--line); background: rgba(255,255,255,.06); color: var(--text); display: grid; place-items: center; }
    .hero { position: relative; padding: 26px 0 18px; }
    .eyebrow { display: inline-flex; align-items: center; gap: 8px; border: 1px solid var(--line); border-radius: 999px; padding: 8px 12px; color: var(--muted); background: rgba(255,255,255,.06); font-size: 12px; letter-spacing: .08em; text-transform: uppercase; }
    .hero h2 { font-size: clamp(42px, 12vw, 66px); line-height: .94; letter-spacing: -.075em; margin: 20px 0 14px; max-width: 520px; }
    .hero p { margin: 0; max-width: 370px; color: var(--muted); font-size: 17px; line-height: 1.45; }
    .actions { display: grid; gap: 12px; margin: 26px 0 18px; }
    .primary { height: 60px; border-radius: 18px; color: #050505; background: #fff; font-weight: 760; letter-spacing: -.02em; display: flex; align-items: center; justify-content: center; gap: 12px; box-shadow: 0 18px 50px rgba(255,255,255,.13); }
    .secondary { height: 58px; border-radius: 18px; color: var(--text); background: rgba(255,255,255,.045); border: 1px solid var(--line); display: flex; align-items: center; justify-content: center; gap: 12px; }
    .grid { display: grid; gap: 14px; }
    .card { border: 1px solid var(--line); border-radius: var(--radius); background: linear-gradient(180deg, rgba(255,255,255,.075), rgba(255,255,255,.035)); box-shadow: var(--shadow); overflow: hidden; backdrop-filter: blur(18px); }
    .card-pad { padding: 20px; }
    .section-title { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 16px; }
    .section-title h3 { margin: 0; font-size: 18px; letter-spacing: -.03em; }
    .section-title span, .tiny { color: var(--muted); font-size: 13px; }
    .features { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
    .feature { min-height: 98px; border-right: 1px solid var(--line); display: grid; place-items: center; text-align: center; gap: 10px; color: var(--muted); font-size: 12px; }
    .feature:last-child { border-right: 0; }
    .round { width: 46px; height: 46px; border-radius: 999px; border: 1px solid var(--line); display: grid; place-items: center; background: rgba(255,255,255,.04); color: var(--text); }
    .bot-list { display: grid; gap: 10px; }
    .bot-row { display: grid; grid-template-columns: 46px 1fr auto; align-items: center; gap: 12px; border: 1px solid rgba(255,255,255,.08); border-radius: 20px; padding: 12px; background: rgba(0,0,0,.22); }
    .bot-row strong { display: block; letter-spacing: -.02em; }
    .bot-row small { color: var(--muted); }
    .pill { border: 1px solid var(--line); border-radius: 999px; padding: 7px 10px; color: var(--muted); font-size: 12px; white-space: nowrap; }
    .tabs { position: sticky; bottom: 12px; z-index: 5; margin-top: 18px; border: 1px solid var(--line); border-radius: 26px; background: rgba(8,8,8,.78); backdrop-filter: blur(24px); display: grid; grid-template-columns: repeat(4, 1fr); padding: 8px; }
    .tab { min-height: 54px; border-radius: 18px; color: var(--muted); background: transparent; display: grid; place-items: center; gap: 4px; font-size: 11px; }
    .tab.active { color: #050505; background: #fff; }
    .view { display: none; animation: rise .28s ease both; }
    .view.active { display: block; }
    @keyframes rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .field { display: grid; gap: 8px; margin: 14px 0; }
    label { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: .08em; }
    input, textarea, select { width: 100%; border: 1px solid var(--line); background: rgba(0,0,0,.26); color: var(--text); border-radius: 18px; padding: 15px 16px; outline: none; }
    textarea { min-height: 128px; resize: vertical; line-height: 1.45; }
    input:focus, textarea:focus { border-color: rgba(255,255,255,.38); box-shadow: 0 0 0 4px rgba(255,255,255,.06); }
    .split { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .chat { height: 390px; overflow: auto; display: flex; flex-direction: column; gap: 10px; padding: 14px; border: 1px solid var(--line); border-radius: 24px; background: rgba(0,0,0,.24); }
    .msg { max-width: 88%; padding: 12px 14px; border-radius: 18px; line-height: 1.38; font-size: 14px; white-space: pre-wrap; }
    .ai { align-self: flex-start; background: rgba(255,255,255,.08); border: 1px solid var(--line); }
    .me { align-self: flex-end; background: #fff; color: #050505; }
    .composer { display: grid; grid-template-columns: 1fr 52px; gap: 10px; margin-top: 12px; }
    .send { width: 52px; height: 52px; border-radius: 18px; background: #fff; color: #050505; display: grid; place-items: center; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; color: var(--muted); white-space: pre-wrap; max-height: 260px; overflow: auto; }
    .toast { position: fixed; left: 18px; right: 18px; bottom: calc(90px + env(safe-area-inset-bottom)); z-index: 20; max-width: 520px; margin: 0 auto; padding: 14px 16px; border: 1px solid var(--line); border-radius: 18px; background: rgba(18,18,18,.94); box-shadow: var(--shadow); display: none; }
    .empty { color: var(--muted); padding: 18px 0; line-height: 1.5; }
    @media (max-width: 390px) { .features { grid-template-columns: repeat(2, 1fr); } .feature:nth-child(2) { border-right: 0; } .split { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="orb" aria-hidden="true"><svg viewBox="0 0 260 260" fill="none"><circle cx="150" cy="92" r="70" stroke="white" stroke-opacity=".18"/><circle cx="150" cy="92" r="112" stroke="white" stroke-opacity=".1"/><path d="M22 122h206M150 20v206" stroke="white" stroke-opacity=".08"/><path d="M78 60c38-44 104-46 145-4" stroke="white" stroke-opacity=".28"/><circle cx="91" cy="52" r="5" fill="white"/><path d="M139 91l53-22-19 56-15-22-24-12z" fill="white" fill-opacity=".92"/></svg></div>
  <main class="app">
    <header class="topbar">
      <div class="brand"><div class="mark"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div><div><h1>AI Builder TEL</h1><p>No-code bot workspace</p></div></div>
      <button class="icon-btn" onclick="syncTelegramUser()"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 3l1.7 5.4L19 10l-5.3 1.6L12 17l-1.7-5.4L5 10l5.3-1.6L12 3z" stroke="currentColor" stroke-width="1.6"/></svg></button>
    </header>

    <section id="home" class="view active">
      <div class="hero"><span class="eyebrow">No code. All power.</span><h2>Build Telegram Bots Without Code</h2><p>Create, connect, and improve your bot with AI inside one workspace.</p></div>
      <div class="actions"><button class="primary" onclick="showView('create')"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Create Bot</button><button class="secondary" onclick="showView('workspace')"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" stroke="currentColor" stroke-width="1.7"/></svg>Open Workspace</button></div>
      <div class="grid">
        <section class="card card-pad"><div class="section-title"><h3>What you can do</h3><span>Live</span></div><div class="features"><div class="feature"><div class="round">⌁</div><div>Connect<br/>Bot Token</div></div><div class="feature"><div class="round">◇</div><div>Chat<br/>with AI</div></div><div class="feature"><div class="round">↯</div><div>Apply<br/>Changes</div></div><div class="feature"><div class="round">✈</div><div>Publish<br/>Instantly</div></div></div></section>
        <section class="card card-pad"><div class="section-title"><h3>My Bots</h3><button class="secondary" style="height:36px;padding:0 12px;border-radius:999px" onclick="showView('bots')">View all</button></div><div id="homeBots" class="bot-list"><div class="empty">Loading your bots...</div></div></section>
      </div>
    </section>

    <section id="create" class="view">
      <section class="card card-pad"><div class="section-title"><h3>Create Bot</h3><span>AI powered</span></div><div class="field"><label>BotFather Token</label><input id="token" placeholder="123456789:AA..." autocomplete="off" /></div><div class="field"><label>What should your bot do?</label><textarea id="prompt" placeholder="Example: Build a premium support bot for my digital product business. It should answer FAQs, show products, collect leads, and sound confident."></textarea></div><button class="primary" onclick="createBot()">Generate & Publish</button><p class="tiny">Your token is encrypted before storage. The Mini App creates the blueprint, connects webhook, and publishes instantly.</p></section>
    </section>

    <section id="bots" class="view"><section class="card card-pad"><div class="section-title"><h3>Your Bots</h3><button class="secondary" style="height:36px;padding:0 12px;border-radius:999px" onclick="loadBots()">Refresh</button></div><div id="botsList" class="bot-list"><div class="empty">Loading...</div></div></section></section>

    <section id="workspace" class="view"><section class="card card-pad"><div class="section-title"><h3>AI Workspace</h3><span id="activeBotLabel">No bot selected</span></div><div class="field"><label>Selected Bot</label><select id="botSelect" onchange="selectBot(this.value)"></select></div><div id="chat" class="chat"><div class="msg ai">Select a bot, then tell AI what to change. Example: "Add a pricing menu and make the welcome message more premium."</div></div><div class="composer"><input id="chatInput" placeholder="Tell AI what to build or change..." onkeydown="if(event.key==='Enter') chatApply()" /><button class="send" onclick="chatApply()"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 12L20 4l-6 16-3-7-7-1z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg></button></div></section><section class="card card-pad" style="margin-top:14px"><div class="section-title"><h3>Blueprint Preview</h3><span>JSON</span></div><div id="blueprint" class="mono">No bot selected.</div></section></section>

    <section id="settings" class="view"><section class="card card-pad"><div class="section-title"><h3>Settings</h3><span>Minimal</span></div><div class="field"><label>Telegram User ID</label><input id="ownerId" placeholder="Auto from Telegram Mini App" /></div><button class="primary" onclick="saveOwner()">Save User</button><p class="tiny">In Telegram, this is automatically detected from WebApp user data when available.</p></section></section>

    <nav class="tabs"><button class="tab active" data-tab="home" onclick="showView('home')">⌂<span>Home</span></button><button class="tab" data-tab="bots" onclick="showView('bots')">☻<span>Bots</span></button><button class="tab" data-tab="workspace" onclick="showView('workspace')">▦<span>Workspace</span></button><button class="tab" data-tab="settings" onclick="showView('settings')">⚙<span>Settings</span></button></nav>
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
    function toast(text){ const el=document.getElementById('toast'); el.textContent=text; el.style.display='block'; setTimeout(()=>el.style.display='none',2600); }
    async function api(path, options={}){ const r=await fetch(path,{...options,headers:{'content-type':'application/json',...(options.headers||{})}}); const j=await r.json().catch(()=>({error:'Invalid response'})); if(!r.ok) throw new Error(j.error||'Request failed'); return j; }
    function botRow(bot){ return '<div class="bot-row" onclick="selectBot(\''+bot.id+'\');showView(\'workspace\')"><div class="round">☻</div><div><strong>'+escapeHtml(bot.title)+'</strong><small>'+(bot.username?'@'+escapeHtml(bot.username):bot.id)+'</small></div><span class="pill">'+escapeHtml(bot.status)+'</span></div>'; }
    async function loadBots(){ if(!ownerId){ document.getElementById('botsList').innerHTML='<div class="empty">Open inside Telegram or set your user ID in Settings.</div>'; return; } try{ const data=await api('/app/api/bots?ownerId='+encodeURIComponent(ownerId)); bots=data.bots||[]; const html=bots.length?bots.map(botRow).join(''):'<div class="empty">No bots yet. Create your first one.</div>'; document.getElementById('botsList').innerHTML=html; document.getElementById('homeBots').innerHTML=html; const select=document.getElementById('botSelect'); select.innerHTML=bots.map(b=>'<option value="'+b.id+'">'+escapeHtml(b.title)+'</option>').join(''); if(bots[0]&&!selectedBot) selectBot(bots[0].id); }catch(e){ toast(e.message); } }
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
