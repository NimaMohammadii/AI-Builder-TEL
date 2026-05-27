export function miniAppHtml(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover" />
  <meta name="theme-color" content="#050507" />
  <title>Vexa Connect</title>
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  <style>
    :root{color-scheme:dark;--bg:#050507;--card:rgba(255,255,255,.045);--card2:rgba(255,255,255,.07);--text:#fff;--muted:rgba(255,255,255,.58);--line:rgba(255,255,255,.10);--accent:#7e1430;--danger:#ff5d7a}
    *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}html,body{width:100%;min-height:100%;margin:0;background:radial-gradient(circle at 12% -10%,rgba(126,20,48,.36),transparent 34%),radial-gradient(circle at 94% 10%,rgba(255,255,255,.08),transparent 30%),var(--bg);color:var(--text);font-family:Inter,-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",sans-serif;overflow:hidden}button,input{font:inherit}button{border:0;cursor:pointer}.app{width:100%;max-width:460px;min-height:100dvh;margin:0 auto;padding:calc(16px + env(safe-area-inset-top)) 16px calc(22px + env(safe-area-inset-bottom));overflow:hidden}.top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:18px}.brand{display:flex;align-items:center;gap:11px;min-width:0}.logo{width:44px;height:44px;border-radius:16px;object-fit:cover;box-shadow:0 16px 38px rgba(0,0,0,.28);background:rgba(255,255,255,.08)}.brand h1{margin:0;font-size:22px;line-height:1;letter-spacing:-.055em;font-weight:900}.brand p{margin:5px 0 0;color:var(--muted);font-size:12px;font-weight:650}.content{height:calc(100dvh - 86px - env(safe-area-inset-top) - env(safe-area-inset-bottom));overflow-y:auto;overflow-x:hidden;padding-bottom:20px;scrollbar-width:none;-webkit-overflow-scrolling:touch}.content::-webkit-scrollbar{display:none}.hero{margin:4px 0 16px}.eyebrow{display:inline-flex;height:28px;align-items:center;padding:0 11px;border-radius:999px;background:rgba(255,255,255,.055);color:rgba(255,255,255,.70);font-size:10px;font-weight:850;text-transform:uppercase;letter-spacing:.14em;box-shadow:inset 0 1px 0 rgba(255,255,255,.10)}.hero h2{margin:12px 0 7px;font-size:clamp(34px,9vw,46px);line-height:.9;font-weight:950;letter-spacing:-.07em}.hero p{margin:0;max-width:330px;color:var(--muted);font-size:13px;line-height:1.42;font-weight:570}.card{position:relative;margin:0 0 12px;border-radius:30px;background:var(--card);box-shadow:0 24px 64px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.10);overflow:hidden}.card:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 88% -8%,rgba(126,20,48,.28),transparent 34%),linear-gradient(135deg,rgba(255,255,255,.035),transparent 52%);pointer-events:none}.pad{position:relative;z-index:1;padding:18px}.title{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}.title h3{margin:0;color:#fff;font-size:18px;line-height:1;font-weight:900;letter-spacing:-.045em}.pill,.ghost{height:30px;padding:0 11px;border-radius:999px;background:rgba(255,255,255,.055);color:rgba(255,255,255,.72);display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:760;box-shadow:inset 0 1px 0 rgba(255,255,255,.09)}.field{display:grid;gap:8px;margin-bottom:12px}.field label{color:rgba(255,255,255,.58);font-size:11px;font-weight:760;text-transform:uppercase;letter-spacing:.08em}input{width:100%;height:50px;border:1px solid var(--line);border-radius:18px;background:rgba(0,0,0,.26);color:#fff;padding:0 14px;outline:none}input:focus{border-color:rgba(255,255,255,.34);box-shadow:0 0 0 4px rgba(255,255,255,.055)}.primary{width:100%;height:52px;border-radius:20px;background:#fff;color:#13070b;font-weight:900;letter-spacing:-.025em}.primary:disabled{opacity:.58}.tiny{color:var(--muted);font-size:11px;line-height:1.35}.notice{padding:14px;border-radius:20px;background:rgba(255,255,255,.035);color:rgba(255,255,255,.62);font-size:12px;line-height:1.35}.list{display:grid;gap:10px}.bot-row,.group-row{display:grid;grid-template-columns:42px minmax(0,1fr) auto;align-items:center;gap:11px;padding:10px;border-radius:20px;background:rgba(255,255,255,.035);box-shadow:inset 0 1px 0 rgba(255,255,255,.07)}.avatar,.avatar-fallback{width:42px;height:42px;border-radius:16px;object-fit:cover;background:rgba(255,255,255,.07);display:grid;place-items:center;color:#fff;font-weight:900}.bot-row strong,.group-row strong{display:block;font-size:14px;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bot-row small,.group-row small{display:block;margin-top:3px;color:var(--muted);font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.actions{display:flex;align-items:center;gap:8px}.icon{width:36px;height:36px;border-radius:999px;background:rgba(255,255,255,.06);color:#fff;display:grid;place-items:center}.icon.danger{color:#ff9aac}.toast{position:fixed;left:16px;right:16px;bottom:calc(18px + env(safe-area-inset-bottom));z-index:20;max-width:460px;margin:0 auto;padding:12px 14px;border-radius:18px;background:rgba(20,20,20,.96);box-shadow:0 18px 48px rgba(0,0,0,.38);display:none;font-size:13px;color:#fff}
  </style>
</head>
<body>
  <main class="app">
    <header class="top">
      <div class="brand">
        <img class="logo" src="https://t.me/i/userpic/320/VexaFlowBOT.jpg" alt="Vexa" />
        <div><h1>Vexa Connect</h1><p id="userLine">AI Bot tools</p></div>
      </div>
      <button class="ghost" type="button" data-action="refresh">Refresh</button>
    </header>
    <div class="content">
      <section class="hero">
        <span class="eyebrow">AI Bot Mini App</span>
        <h2>Connect</h2>
        <p>Connect BotFather tokens, manage your bots, and connect Vexa to Telegram groups.</p>
      </section>

      <section class="card">
        <div class="pad">
          <div class="title"><h3>Connect BotFather Key</h3><span id="builderStatus" class="pill">Ready</span></div>
          <div class="field"><label>BotFather Key</label><input id="botKey" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Paste bot token here" /></div>
          <button class="primary" type="button" data-action="create-bot">Connect Bot</button>
          <div class="tiny" style="margin-top:10px">Telegram verifies the token securely. Your token is encrypted.</div>
        </div>
      </section>

      <section class="card">
        <div class="pad">
          <div class="title"><h3>Your bots</h3><button class="ghost" type="button" data-action="refresh-bots">Refresh</button></div>
          <div id="homeBots" class="list"><div class="notice">Loading bots...</div></div>
        </div>
      </section>

      <section class="card">
        <div class="pad">
          <div class="title"><h3>Groups</h3><button class="ghost" type="button" data-action="add-main-group">Add group</button></div>
          <div id="homeGroups" class="list"><div class="notice">Loading groups...</div></div>
        </div>
      </section>
    </div>
  </main>
  <div id="toast" class="toast"></div>
  <script>
    (function(){
      var tg=window.Telegram&&window.Telegram.WebApp;
      if(tg){try{tg.ready();tg.expand()}catch(e){}}
      var ownerId=localStorage.getItem('ownerId')||String((tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user&&tg.initDataUnsafe.user.id)||'');
      function q(id){return document.getElementById(id)}
      function esc(v){return String(v||'').replace(/[&<>']/g,function(s){return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;'}[s]||s})}
      function toast(v){var n=q('toast');if(!n)return;n.textContent=v;n.style.display='block';setTimeout(function(){n.style.display='none'},3000)}
      function setStatus(v){var n=q('builderStatus');if(n)n.textContent=v}
      function api(path,opt){opt=opt||{};return fetch(path,Object.assign({cache:'no-store'},opt,{headers:Object.assign({'content-type':'application/json'},opt.headers||{})})).then(function(r){return r.json().catch(function(){return{error:'Invalid response'}}).then(function(j){if(!r.ok)throw new Error(j.error||'Request failed');return j})})}
      function initials(v){v=String(v||'B').replace(/@/g,'').trim();return (v.match(/[A-Za-z0-9]/g)||['B']).slice(0,2).join('').toUpperCase()}
      function iconButton(action,id,label,next){return '<button class="icon" type="button" data-action="'+action+'" data-bot-id="'+esc(id)+'" '+(next?'data-next-status="'+next+'"':'')+' aria-label="'+esc(label)+'">'}
      function playIcon(){return '<svg width="16" height="16" viewBox="0 0 24 24"><path d="M8 5.5v13l10-6.5-10-6.5Z" fill="currentColor"/></svg>'}
      function pauseIcon(){return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M8 6v12M16 6v12"/></svg>'}
      function trashIcon(){return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7l1-3h4l1 3"/></svg>'}
      function botAvatar(b){var u=b.username||'';return u?'<img class="avatar" src="https://t.me/i/userpic/320/'+encodeURIComponent(u)+'.jpg" alt="" referrerpolicy="no-referrer"/>':'<div class="avatar-fallback"><span>'+esc(initials(b.title||b.id))+'</span></div>'}
      function botRow(b){var next=b.status==='active'?'paused':'active';return '<div class="bot-row">'+botAvatar(b)+'<div><strong>'+esc(b.title||'Bot')+'</strong><small>'+(b.username?'@'+esc(b.username):esc(b.id))+' · '+esc(b.status||'')+'</small></div><div class="actions">'+iconButton('toggle-user-bot',b.id,b.status==='active'?'Stop bot':'Start bot',next)+(b.status==='active'?pauseIcon():playIcon())+'</button>'+iconButton('delete-user-bot',b.id,'Delete bot','')+trashIcon()+'</button></div></div>'}
      function groupRow(g){return '<div class="group-row"><div class="avatar-fallback">G</div><div><strong>'+esc(g.title||g.username||g.chatId)+'</strong><small>'+esc(g.type||'group')+(g.tonSpent?' · '+esc(g.tonSpent)+' TON':'')+'</small></div><span class="pill">Connected</span></div>'}
      function requireOwner(){if(ownerId){localStorage.setItem('ownerId',ownerId);return ownerId}toast('Telegram user not found');return ''}
      async function loadBots(){var box=q('homeBots');if(!box)return;var user=requireOwner();if(!user){box.innerHTML='<div class="notice">Telegram user not found</div>';return}try{var d=await api('/app/api/bots?ownerId='+encodeURIComponent(user));var bots=d.bots||[];box.innerHTML=bots.length?bots.map(botRow).join(''):'<div class="notice">No bots yet. Paste a BotFather token above.</div>'}catch(e){box.innerHTML='<div class="notice">Could not load bots</div>';toast(e.message)}}
      async function loadGroups(){var box=q('homeGroups');if(!box)return;var user=requireOwner();if(!user){box.innerHTML='<div class="notice">Telegram user not found</div>';return}try{var d=await api('/app/api/bots/main/groups?userId='+encodeURIComponent(user)+'&claim=1');var groups=d.groups||[];box.innerHTML=groups.length?groups.map(groupRow).join(''):'<div class="notice">No groups connected yet. Tap Add group.</div>'}catch(e){box.innerHTML='<div class="notice">Could not load groups</div>'}}
      async function createBot(){var input=q('botKey');var token=(input&&input.value||'').trim();var user=requireOwner();if(!user)return;if(!token){toast('Paste BotFather token first');return}setStatus('Checking');try{await api('/app/api/bots',{method:'POST',body:JSON.stringify({ownerTelegramId:user,telegramToken:token,prompt:'Connect this Telegram bot to Vexa AI Builder. Keep an empty runtime flow until the owner configures it with AI.'})});if(input)input.value='';setStatus('Connected');toast('Bot connected');await loadBots()}catch(e){setStatus('Error');toast(e.message||'Could not connect bot')}}
      async function setBotStatus(id,status){try{await api('/app/api/bots/'+encodeURIComponent(id)+'/status',{method:'PATCH',body:JSON.stringify({status:status})});toast(status==='active'?'Bot started':'Bot paused');await loadBots()}catch(e){toast(e.message||'Could not update bot')}}
      async function deleteBot(id){if(!confirm('Delete this bot?'))return;try{await api('/app/api/bots/'+encodeURIComponent(id),{method:'DELETE'});toast('Bot deleted');await loadBots()}catch(e){toast(e.message||'Could not delete bot')}}
      async function addGroup(){try{var d=await api('/app/api/main-bot');if(!d.addGroupUrl)throw new Error('Main bot link not found');if(tg&&typeof tg.openTelegramLink==='function')tg.openTelegramLink(d.addGroupUrl);else window.open(d.addGroupUrl,'_blank')}catch(e){toast(e.message||'Could not open group link')}}
      document.addEventListener('click',function(e){var t=e.target&&e.target.closest?e.target.closest('[data-action]'):null;if(!t)return;var a=t.getAttribute('data-action');if(a==='create-bot')createBot();if(a==='refresh'||a==='refresh-bots'){loadBots();loadGroups()}if(a==='toggle-user-bot')setBotStatus(t.getAttribute('data-bot-id'),t.getAttribute('data-next-status'));if(a==='delete-user-bot')deleteBot(t.getAttribute('data-bot-id'));if(a==='add-main-group')addGroup()},true);
      if(q('userLine'))q('userLine').textContent=ownerId?'Telegram ID: '+ownerId:'Open from Telegram to connect';
      loadBots();loadGroups();
    })();
  </script>
</body>
</html>`;
}
