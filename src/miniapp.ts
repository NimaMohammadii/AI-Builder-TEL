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
      --panel: rgba(255,255,255,.06);
      --panel-2: rgba(255,255,255,.1);
      --line: rgba(255,255,255,.14);
      --text: #f8f8f8;
      --muted: rgba(255,255,255,.62);
      --soft: rgba(255,255,255,.34);
      --radius: 22px;
      --shadow: 0 18px 54px rgba(0,0,0,.5);
      color-scheme: dark;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; background: #000; color: var(--text); }
    body {
      background:
        radial-gradient(circle at 82% 10%, rgba(255,255,255,.18), transparent 31%),
        radial-gradient(circle at 5% 2%, rgba(255,255,255,.08), transparent 22%),
        linear-gradient(180deg, #111 0%, #050505 42%, #000 100%);
    }
    button, input, textarea, select { font: inherit; }
    button { cursor: pointer; border: 0; }
    .app { width: min(100%, 560px); height: 100dvh; margin: 0 auto; padding: calc(10px + env(safe-area-inset-top)) 12px calc(10px + env(safe-area-inset-bottom)); position: relative; overflow: hidden; }
    .mega-svg { position: fixed; right: -98px; top: 46px; width: 360px; height: 360px; pointer-events: none; opacity: .9; filter: drop-shadow(0 24px 70px rgba(255,255,255,.08)); }
    .mega-svg svg { width: 100%; height: 100%; }
    .topbar { height: 54px; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 0 1px 8px; position: relative; z-index: 2; }
    .brand { display: flex; align-items: center; gap: 10px; min-width: 0; }
    .mark { width: 38px; height: 38px; border: 1px solid var(--line); border-radius: 14px; background: linear-gradient(145deg, rgba(255,255,255,.16), rgba(255,255,255,.035)); display: grid; place-items: center; box-shadow: inset 0 1px rgba(255,255,255,.22); }
    .brand h1 { font-size: 17px; margin: 0; letter-spacing: -.035em; white-space: nowrap; }
    .brand p { margin: 0; font-size: 11px; color: var(--muted); white-space: nowrap; }
    .icon-btn { width: 38px; height: 38px; border-radius: 999px; border: 1px solid var(--line); background: rgba(255,255,255,.065); color: var(--text); display: grid; place-items: center; flex: 0 0 auto; }
    .content { height: calc(100dvh - 54px - 70px - env(safe-area-inset-top) - env(safe-area-inset-bottom)); position: relative; z-index: 1; overflow: hidden; }
    .view { display: none; height: 100%; overflow: hidden; animation: rise .22s ease both; }
    .view.active { display: flex; flex-direction: column; gap: 10px; }
    @keyframes rise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    .hero { position: relative; padding: 4px 0 0; flex: 0 0 auto; }
    .eyebrow { display: inline-flex; align-items: center; gap: 7px; border: 1px solid var(--line); border-radius: 999px; padding: 6px 10px; color: var(--muted); background: rgba(255,255,255,.065); font-size: 10px; letter-spacing: .09em; text-transform: uppercase; }
    .hero h2 { font-size: clamp(31px, 9.6vw, 44px); line-height: .9; letter-spacing: -.078em; margin: 10px 0 7px; max-width: 360px; }
    .hero p { margin: 0; max-width: 330px; color: var(--muted); font-size: 13px; line-height: 1.34; }
    .actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; }
    .primary, .secondary { height: 44px; border-radius: 15px; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 13px; font-weight: 760; letter-spacing: -.015em; }
    .primary { color: #050505; background: #fff; box-shadow: 0 14px 34px rgba(255,255,255,.11); }
    .secondary { color: var(--text); background: rgba(255,255,255,.05); border: 1px solid var(--line); }
    .grid { display: grid; gap: 10px; min-height: 0; flex: 1 1 auto; }
    .card { border: 1px solid var(--line); border-radius: var(--radius); background: linear-gradient(180deg, rgba(255,255,255,.078), rgba(255,255,255,.036)); box-shadow: var(--shadow); overflow: hidden; backdrop-filter: blur(18px); }
    .card-pad { padding: 14px; }
    .section-title { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
    .section-title h3 { margin: 0; font-size: 15px; letter-spacing: -.035em; }
    .section-title span, .tiny { color: var(--muted); font-size: 11px; line-height: 1.35; }
    .features { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; }
    .feature { min-height: 70px; border-right: 1px solid var(--line); display: grid; place-items: center; text-align: center; gap: 5px; color: var(--muted); font-size: 10.5px; line-height: 1.12; }
    .feature:last-child { border-right: 0; }
    .round { width: 38px; height: 38px; border-radius: 999px; border: 1px solid var(--line); display: grid; place-items: center; background: rgba(255,255,255,.045); color: var(--text); }
    .round svg, .tab svg, .send svg, .primary svg, .secondary svg { width: 18px; height: 18px; }
    .bot-list { display: grid; gap: 7px; min-height: 0; overflow: auto; scrollbar-width: none; }
    .bot-list::-webkit-scrollbar, .chat::-webkit-scrollbar, .mono::-webkit-scrollbar { display: none; }
    .bot-row { display: grid; grid-template-columns: 40px 1fr auto; align-items: center; gap: 10px; border: 1px solid rgba(255,255,255,.085); border-radius: 17px; padding: 9px; background: rgba(0,0,0,.23); }
    .bot-row strong { display: block; font-size: 13px; letter-spacing: -.02em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .bot-row small { display: block; color: var(--muted); font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .pill { border: 1px solid var(--line); border-radius: 999px; padding: 5px 8px; color: var(--muted); font-size: 10.5px; white-space: nowrap; }
    .tabs { height: 58px; position: absolute; left: 12px; right: 12px; bottom: calc(8px + env(safe-area-inset-bottom)); z-index: 5; border: 1px solid var(--line); border-radius: 23px; background: rgba(8,8,8,.82); backdrop-filter: blur(24px); display: grid; grid-template-columns: repeat(4, 1fr); padding: 6px; }
    .tab { min-height: 44px; border-radius: 16px; color: var(--muted); background: transparent; display: grid; place-items: center; gap: 1px; font-size: 10px; }
    .tab.active { color: #050505; background: #fff; }
    .field { display: grid; gap: 6px; margin: 9px 0; }
    label { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: .08em; }
    input, textarea, select { width: 100%; border: 1px solid var(--line); background: rgba(0,0,0,.28); color: var(--text); border-radius: 15px; padding: 11px 12px; outline: none; font-size: 13px; }
    textarea { min-height: 104px; max-height: 134px; resize: none; line-height: 1.34; }
    input:focus, textarea:focus, select:focus { border-color: rgba(255,255,255,.4); box-shadow: 0 0 0 4px rgba(255,255,255,.055); }
    .create-card, .bots-card, .settings-card { height: 100%; display: flex; flex-direction: column; }
    .create-card .primary { margin-top: auto; flex: 0 0 auto; }
    .create-card .tiny { margin: 9px 0 0; }
    .chat { height: min(35dvh, 240px); min-height: 170px; overflow: auto; display: flex; flex-direction: column; gap: 8px; padding: 10px; border: 1px solid var(--line); border-radius: 19px; background: rgba(0,0,0,.25); }
    .msg { max-width: 90%; padding: 9px 11px; border-radius: 15px; line-height: 1.32; font-size: 12px; white-space: pre-wrap; }
    .ai { align-self: flex-start; background: rgba(255,255,255,.08); border: 1px solid var(--line); }
    .me { align-self: flex-end; background: #fff; color: #050505; }
    .composer { display: grid; grid-template-columns: 1fr 44px; gap: 8px; margin-top: 8px; }
    .send { width: 44px; height: 44px; border-radius: 15px; background: #fff; color: #050505; display: grid; place-items: center; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 10.5px; color: var(--muted); white-space: pre-wrap; height: 112px; overflow: auto; }
    .toast { position: fixed; left: 12px; right: 12px; bottom: calc(76px + env(safe-area-inset-bottom)); z-index: 20; max-width: 536px; margin: 0 auto; padding: 11px 13px; border: 1px solid var(--line); border-radius: 16px; background: rgba(18,18,18,.95); box-shadow: var(--shadow); display: none; font-size: 13px; }
    .empty { color: var(--muted); padding: 10px 0; line-height: 1.38; font-size: 12px; }
    .home-bots { max-height: 126px; }
    @media (max-height: 720px) {
      .brand p, .hero p, .eyebrow { display: none; }
      .hero h2 { font-size: clamp(27px, 8vw, 36px); margin: 6px 0 4px; max-width: 300px; }
      .actions { margin-top: 8px; }
      .primary, .secondary { height: 40px; }
      .features { grid-template-columns: repeat(4, 1fr); }
      .feature { min-height: 56px; font-size: 9.5px; }
      .round { width: 32px; height: 32px; }
      .home-bots { max-height: 92px; }
      .card-pad { padding: 11px; }
      .chat { height: 168px; min-height: 148px; }
      .mono { height: 82px; }
    }
  </style>
</head>
<body>
  <div class="mega-svg" aria-hidden="true">
    <svg viewBox="0 0 360 360" fill="none">
      <circle cx="198" cy="132" r="82" stroke="white" stroke-opacity=".24" stroke-width="1.2"/>
      <circle cx="198" cy="132" r="132" stroke="white" stroke-opacity=".12" stroke-width="1"/>
      <circle cx="198" cy="132" r="174" stroke="white" stroke-opacity=".06" stroke-width="1"/>
      <path d="M28 162h304M198 8v304" stroke="white" stroke-opacity=".075"/>
      <path d="M82 66c62-62 162-66 229-8" stroke="white" stroke-opacity=".34" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M68 230c70 54 170 48 230-18" stroke="white" stroke-opacity=".16" stroke-width="1.2" stroke-linecap="round"/>
      <g opacity=".16">
        <path d="M78 114h232M78 138h232M78 186h232M78 210h232" stroke="white"/>
        <path d="M126 78v170M174 78v170M222 78v170M270 78v170" stroke="white"/>
      </g>
      <circle cx="112" cy="60" r="6" fill="white"/>
      <circle cx="298" cy="214" r="4" fill="white" fill-opacity=".6"/>
      <path d="M178 132l84-36-31 91-24-36-39-19z" fill="white" fill-opacity=".96"/>
    </svg>
  </div>
  <main class="app">
    <header class="topbar">
      <div class="brand"><div class="mark"><svg width="21" height="21" viewBox="0 0 24 24" fill="none"><path d="M5 7h14M5 12h14M5 17h9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div><div><h1>AI Builder TEL</h1><p>No-code bot workspace</p></div></div>
      <button class="icon-btn" onclick="syncTelegramUser()"><svg width="21" height="21" viewBox="0 0 24 24" fill="none"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" stroke="currentColor" stroke-width="1.7"/></svg></button>
    </header>

    <div class="content">
      <section id="home" class="view active">
        <div class="hero"><span class="eyebrow">No code. All power.</span><h2>Build Telegram Bots Without Code</h2><p>Create, connect, and improve your bot with AI inside one workspace.</p><div class="actions"><button class="primary" onclick="showView('create')"><svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Create Bot</button><button class="secondary" onclick="showView('workspace')"><svg viewBox="0 0 24 24" fill="none"><path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" stroke="currentColor" stroke-width="1.7"/></svg>Workspace</button></div></div>
        <div class="grid">
          <section class="card card-pad"><div class="section-title"><h3>What you can do</h3><span>Live</span></div><div class="features"><div class="feature"><div class="round"><svg viewBox="0 0 24 24" fill="none"><path d="M9.5 14.5l5-5M8 11a4 4 0 015.7 0M10.3 16.7a4 4 0 005.7 0" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg></div><div>Connect<br/>Token</div></div><div class="feature"><div class="round"><svg viewBox="0 0 24 24" fill="none"><path d="M5 7h14v8H9l-4 4V7z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg></div><div>Chat<br/>with AI</div></div><div class="feature"><div class="round"><svg viewBox="0 0 24 24" fill="none"><path d="M13 3L5 14h6l-1 7 8-11h-6l1-7z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg></div><div>Apply<br/>Changes</div></div><div class="feature"><div class="round"><svg viewBox="0 0 24 24" fill="none"><path d="M4 12L20 4l-6 16-3-7-7-1z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg></div><div>Publish<br/>Instantly</div></div></div></section>
          <section class="card card-pad" style="min-height:0"><div class="section-title"><h3>My Bots</h3><button class="secondary" style="height:30px;padding:0 10px;border-radius:999px" onclick="showView('bots')">View all</button></div><div id="homeBots" class="bot-list home-bots"><div class="empty">Loading your bots...</div></div></section>
        </div>
      </section>

      <section id="create" class="view"><section class="card card-pad create-card"><div class="section-title"><h3>Create Bot</h3><span>AI powered</span></div><div class="field"><label>BotFather Token</label><input id="token" placeholder="123456789:AA..." autocomplete="off" /></div><div class="field"><label>What should your bot do?</label><textarea id="prompt" placeholder="Example: Build a premium support bot for my digital product business. It should answer FAQs, show products, collect leads, and sound confident."></textarea></div><button class="primary" onclick="createBot()">Generate & Publish</button><p class="tiny">Your token is encrypted. The app creates the blueprint, connects webhook, and publishes instantly.</p></section></section>

      <section id="bots" class="view"><section class="card card-pad bots-card"><div class="section-title"><h3>Your Bots</h3><button class="secondary" style="height:30px;padding:0 10px;border-radius:999px" onclick="loadBots()">Refresh</button></div><div id="botsList" class="bot-list"><div class="empty">Loading...</div></div></section></section>

      <section id="workspace" class="view"><section class="card card-pad"><div class="section-title"><h3>AI Workspace</h3><span id="activeBotLabel">No bot selected</span></div><div class="field"><label>Selected Bot</label><select id="botSelect" onchange="selectBot(this.value)"></select></div><div id="chat" class="chat"><div class="msg ai">Select a bot, then tell AI what to change. Example: "Add a pricing menu and make the welcome message more premium."</div></div><div class="composer"><input id="chatInput" placeholder="Tell AI what to build or change..." onkeydown="if(event.key==='Enter') chatApply()" /><button class="send" onclick="chatApply()"><svg viewBox="0 0 24 24" fill="none"><path d="M4 12L20 4l-6 16-3-7-7-1z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg></button></div></section><section class="card card-pad" style="margin-top:8px"><div class="section-title"><h3>Blueprint</h3><span>JSON</span></div><div id="blueprint" class="mono">No bot selected.</div></section></section>

      <section id="settings" class="view"><section class="card card-pad settings-card"><div class="section-title"><h3>Settings</h3><span>Minimal</span></div><div class="field"><label>Telegram User ID</label><input id="ownerId" placeholder="Auto from Telegram Mini App" /></div><button class="primary" onclick="saveOwner()">Save User</button><p class="tiny">In Telegram, this is automatically detected from WebApp user data when available.</p></section></section>
    </div>

    <nav class="tabs"><button class="tab active" data-tab="home" onclick="showView('home')"><svg viewBox="0 0 24 24" fill="none"><path d="M4 11l8-7 8 7v8H4v-8z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg><span>Home</span></button><button class="tab" data-tab="bots" onclick="showView('bots')"><svg viewBox="0 0 24 24" fill="none"><path d="M8 9h8M9 14h1m4 0h1M7 4h10v4H7V4zm-2 4h14v11H5V8z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Bots</span></button><button class="tab" data-tab="workspace" onclick="showView('workspace')"><svg viewBox="0 0 24 24" fill="none"><path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" stroke="currentColor" stroke-width="1.6"/></svg><span>Work</span></button><button class="tab" data-tab="settings" onclick="showView('settings')"><svg viewBox="0 0 24 24" fill="none"><path d="M12 8a4 4 0 100 8 4 4 0 000-8z" stroke="currentColor" stroke-width="1.7"/><path d="M4 12h2m12 0h2M12 4v2m0 12v2M6.3 6.3l1.4 1.4m8.6 8.6l1.4 1.4m0-11.4l-1.4 1.4m-8.6 8.6l-1.4 1.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg><span>Settings</span></button></nav>
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
