export const MINIAPP_SCRIPT = `
(function(){
  var tg=window.Telegram&&window.Telegram.WebApp;
  if(tg){try{tg.ready();tg.expand()}catch(e){}}

  var ownerId=localStorage.getItem('ownerId')||String((tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user&&tg.initDataUnsafe.user.id)||'');
  var bots=[];
  var selectedBot=null;
  var selectedVoice='TX3LPaxmHKxFdv7VOQHJ';

  function q(id){return document.getElementById(id)}
  function clean(v){return String(v||'').replace(/[^0-9A-Za-z:_-]/g,'').replace(/：/g,':').trim()}
  function setText(id,v){var n=q(id);if(n)n.textContent=v}
  function toast(v){var n=q('toast');if(!n)return;n.textContent=v;n.style.display='block';setTimeout(function(){n.style.display='none'},3000)}
  function esc(v){return String(v||'').replace(/[&<>']/g,function(s){return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;'}[s]||s})}
  function initials(v){v=String(v||'B').replace(/@/g,'').trim();return (v.match(/[A-Za-z0-9]/g)||['B']).slice(0,2).join('').toUpperCase()}
  function fallbackAvatar(b){return '<div class="avatar-fallback"><span>'+esc(initials(b.username||b.title||b.id))+'</span></div>'}
  function avatarImg(b){var username=b.username||'';if(!username)return fallbackAvatar(b);var src='https://t.me/i/userpic/320/'+encodeURIComponent(username)+'.jpg';return '<img class="avatar" src="'+src+'" alt="" referrerpolicy="no-referrer"/>'}
  function setKeyboardOpen(open){document.body.classList.toggle('keyboard-open',!!open)}
  function dismissKeyboard(){var active=document.activeElement;if(active&&typeof active.blur==='function')active.blur();setKeyboardOpen(false)}
  function updateTtsCharCount(){var input=q('ttsText');var counter=q('ttsCharCount');if(counter)counter.textContent=String((input&&input.value||'').length)+' characters'}

  function show(id){
    document.querySelectorAll('.view').forEach(function(n){n.classList.remove('active')});
    var v=q(id);if(v)v.classList.add('active');
    document.querySelectorAll('.tab').forEach(function(n){n.classList.toggle('active',n.getAttribute('data-view')===id)});
    setText('brandTitle',id==='flow'?'Text To Speech':'Vexa FLOW');
    if(id!=='flow')setKeyboardOpen(false);
    loadBots(false);
  }

  async function api(path,opt){
    opt=opt||{};
    var r=await fetch(path,Object.assign({},opt,{headers:Object.assign({'content-type':'application/json'},opt.headers||{})}));
    var j=await r.json().catch(function(){return{error:'Invalid response'}});
    if(!r.ok)throw new Error(j.error||'Request failed');
    return j;
  }

  function userLine(){setText('userLine',ownerId?'User '+ownerId:'Connect Telegram user')}
  function row(b){var img=avatarImg(b);return '<button class="bot-row" data-bot-id="'+esc(b.id)+'">'+img+'<div><strong>'+esc(b.title)+'</strong><small>'+(b.username?'@'+esc(b.username):esc(b.id))+'</small></div><span class="pill">'+esc(b.status)+'</span></button>'}
  function render(){
    var html=bots.length?bots.map(row).join(''):'<div class="notice">No bots yet. Connect your bot first.</div>';
    if(q('botsList'))q('botsList').innerHTML=html;
    if(q('homeBots'))q('homeBots').innerHTML=html;
    setText('statBots',String(bots.length));
    setText('statActive',String(bots.filter(function(b){return b.status==='active'}).length));
    setText('statPaused',String(bots.filter(function(b){return b.status==='paused'}).length));
    if(q('botSelect'))q('botSelect').innerHTML=bots.length?bots.map(function(b){return '<option value="'+esc(b.id)+'">'+esc(b.title)+'</option>'}).join(''):'<option value="">No bots</option>';
    if(bots[0]&&!selectedBot)selectBot(bots[0].id);
  }

  async function loadBots(force){
    if(!ownerId){render();return}
    if(bots.length&&!force){render();return}
    try{var d=await api('/app/api/bots?ownerId='+encodeURIComponent(ownerId));bots=d.bots||[];render()}catch(x){render();toast(x.message)}
  }

  async function createBot(){
    var input=q('botKey');
    var key=clean(input&&input.value);
    if(input)input.value=key;
    if(!ownerId)return toast('Set Telegram user first');
    if(key.indexOf(':')<1)return toast('Paste the full BotFather key.');
    try{
      setText('builderStatus','Checking');
      var body={ownerTelegramId:ownerId,prompt:'VexaFlow bot'};
      body['telegram'+'Token']=key;
      var d=await api('/app/api/bots',{method:'POST',body:JSON.stringify(body)});
      if(input)input.value='';
      bots=[];
      await loadBots(true);
      await selectBot(d.botId);
      show('flow');
      toast('Bot connected');
    }catch(x){setText('builderStatus','Failed');toast(x.message)}
  }

  async function selectBot(id){
    if(!id)return;
    try{
      var d=await api('/app/api/bots/'+encodeURIComponent(id));
      selectedBot=d;
      setText('activeBotLabel',d.username?'@'+d.username:d.title);
      if(q('botInfo'))q('botInfo').innerHTML='<b>'+esc(d.title)+'</b><br>Status: '+esc(d.status);
      setText('pauseBtn',d.status==='active'?'Pause':'Activate');
      if(q('botSelect'))q('botSelect').value=id;
    }catch(x){toast(x.message)}
  }

  function setVoice(v,label){
    selectedVoice=v;
    setText('voiceLabel',label);
    document.querySelectorAll('[data-voice]').forEach(function(x){x.classList.toggle('active',x.getAttribute('data-voice')===v)});
    var w=q('voiceWrap');if(w)w.classList.remove('open');
  }

  async function generateTts(){
    var text=(q('ttsText')&&q('ttsText').value.trim())||'';
    if(!text)return toast('Type text first');
    try{
      var r=await fetch('/app/api/tts',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({text:text,voice:selectedVoice})});
      if(!r.ok)throw new Error('TTS API is not ready yet');
      var blob=await r.blob();
      var url=URL.createObjectURL(blob);
      q('ttsAudio').src=url;
      q('wavePlayer').classList.add('show');
      toast('Voice generated');
    }catch(x){q('wavePlayer').classList.add('show');toast(x.message)}
  }

  function playTts(){var a=q('ttsAudio');if(!a||!a.src)return toast('Generate voice first');if(a.paused){a.play();setText('wavePlay','❚❚')}else{a.pause();setText('wavePlay','▶')}}
  async function publishBot(){if(!selectedBot)return toast('Select a bot first');try{var d=await api('/app/api/bots/'+encodeURIComponent(selectedBot.id)+'/publish',{method:'POST'});toast('Published');bots=[];await loadBots(true);await selectBot(d.botId)}catch(x){toast(x.message)}}
  async function togglePause(){if(!selectedBot)return toast('Select a bot first');var status=selectedBot.status==='active'?'paused':'active';try{var d=await api('/app/api/bots/'+encodeURIComponent(selectedBot.id)+'/status',{method:'PATCH',body:JSON.stringify({status:status})});toast(status==='active'?'Activated':'Paused');bots=[];await loadBots(true);await selectBot(d.botId)}catch(x){toast(x.message)}}
  async function deleteBot(){if(!selectedBot)return toast('Select a bot first');if(!confirm('Delete this bot?'))return;try{await api('/app/api/bots/'+encodeURIComponent(selectedBot.id),{method:'DELETE'});selectedBot=null;bots=[];await loadBots(true);toast('Bot deleted')}catch(x){toast(x.message)}}
  function saveUser(){ownerId=(q('ownerId')&&q('ownerId').value.trim())||ownerId;localStorage.setItem('ownerId',ownerId);userLine();loadBots(true)}

  document.body.addEventListener('focusin',function(ev){if(ev.target&&ev.target.id==='ttsText')setKeyboardOpen(true)});
  document.body.addEventListener('focusout',function(ev){if(ev.target&&ev.target.id==='ttsText')setTimeout(function(){if(document.activeElement!==q('ttsText'))setKeyboardOpen(false)},80)});

  document.body.addEventListener('click',function(ev){
    var b=ev.target.closest('button');
    if(!b){var w=q('voiceWrap');if(w)w.classList.remove('open');return}
    var v=b.getAttribute('data-view');if(v){show(v);return}
    var id=b.getAttribute('data-bot-id');if(id){selectBot(id);show('results');return}
    var voice=b.getAttribute('data-voice');if(voice){setVoice(voice,b.textContent||voice);return}
    var a=b.getAttribute('data-action');
    if(a==='dismiss-keyboard'){dismissKeyboard();return}
    if(a==='toggle-voice'){q('voiceWrap').classList.toggle('open');return}
    if(a==='create-bot')createBot();
    if(a==='generate-tts')generateTts();
    if(a==='play-tts')playTts();
    if(a==='refresh')loadBots(true);
    if(a==='publish')publishBot();
    if(a==='toggle-pause')togglePause();
    if(a==='delete')deleteBot();
    if(a==='save-user')saveUser();
  });

  if(q('botKey'))q('botKey').addEventListener('input',function(){var k=clean(q('botKey').value);if(q('botKey').value!==k)q('botKey').value=k});
  if(q('ttsText'))q('ttsText').addEventListener('input',updateTtsCharCount);
  if(q('botSelect'))q('botSelect').addEventListener('change',function(){selectBot(this.value)});
  if(q('ownerId'))q('ownerId').value=ownerId;
  userLine();
  updateTtsCharCount();
  loadBots(true);
})();
`;
