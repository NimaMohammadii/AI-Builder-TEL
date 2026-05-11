export const ADMIN_AUDIO_PANEL_SCRIPT = `<script>
(function(){
  const AUDIO_TYPES=['audio/mpeg','audio/mp3','audio/wav','audio/x-wav','audio/vnd.wave','audio/ogg','application/ogg','audio/webm','audio/mp4','audio/aac','audio/x-m4a','audio/m4a'];
  const AUDIO_EXTENSIONS=['mp3','wav','ogg','oga','webm','mp4','m4a','aac'];
  const main=document.querySelector('main.page');
  const menu=document.getElementById('adminMenu');
  if(!main||!menu||document.getElementById('sectionAudio'))return;
  const btn=document.createElement('button');
  btn.className='menu-item';
  btn.dataset.section='audio';
  btn.type='button';
  btn.innerHTML='<strong>Mini app audio</strong><span>Upload and enable or disable audio in the mini app</span>';
  menu.appendChild(btn);
  const section=document.createElement('section');
  section.className='section admin-section upload';
  section.id='sectionAudio';
  section.dataset.title='Mini app audio';
  section.dataset.subtitle='Upload audio and control playback in the mini app.';
  section.innerHTML='<h2>Mini app audio</h2><p class="muted small-text">Upload an audio file to enable it in the mini app, then use Stop if you want to disable it.</p><div class="image-current audio-current"><div class="audio-dot" id="audioDot">♪</div><div><strong id="audioStateLabel">No audio uploaded</strong><p class="muted small-text" id="audioMeta">MP3, WAV, OGG, WEBM, MP4, M4A or AAC up to 10MB.</p></div></div><audio id="adminAudioPreview" controls preload="none" style="width:100%;margin:4px 0 8px;display:none"></audio><label>Upload audio file</label><input id="miniAudioFile" type="file" accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/ogg,audio/webm,audio/mp4,audio/aac,.mp3,.wav,.ogg,.webm,.m4a,.aac"/><button class="primary" id="uploadMiniAudio" type="button">Upload audio</button><div class="audio-actions"><button class="ghost audio-action" id="playMiniAudio" type="button">Play in mini app</button><button class="ghost audio-action" id="stopMiniAudio" type="button">Stop in mini app</button></div><p id="miniAudioStatus" class="status"></p>';
  main.appendChild(section);
  const style=document.createElement('style');
  style.textContent='.audio-current{align-items:center}.audio-dot{width:42px;height:42px;border-radius:16px;border:1px solid rgba(255,255,255,.16);background:linear-gradient(145deg,rgba(255,255,255,.18),rgba(255,255,255,.04));display:grid;place-items:center;font-size:19px;font-weight:950}.audio-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.audio-action{width:100%;height:38px}.audio-action.active{background:#fff!important;color:#050505!important;border-color:#fff!important}';
  document.head.appendChild(style);
  function setStatus(text){const el=document.getElementById('miniAudioStatus');if(el)el.textContent=text||'';}
  function cacheBust(url){return url+(url.indexOf('?')>-1?'&':'?')+'t='+Date.now();}
  function render(data){
    const has=!!data.hasAudio, enabled=!!data.enabled;
    const label=document.getElementById('audioStateLabel'),meta=document.getElementById('audioMeta'),dot=document.getElementById('audioDot'),audio=document.getElementById('adminAudioPreview'),play=document.getElementById('playMiniAudio'),stop=document.getElementById('stopMiniAudio');
    if(label)label.textContent=!has?'No audio uploaded':enabled?'Audio is playing in mini app':'Audio is stopped in mini app';
    if(meta)meta.textContent=has?('Type: '+(data.type||'audio')+' • Version: '+(data.version||'1')):'MP3, WAV, OGG, WEBM, MP4, M4A or AAC up to 10MB.';
    if(dot)dot.textContent=enabled?'▶':'♪';
    if(audio){audio.style.display=has?'block':'none';if(has&&data.url)audio.src=cacheBust(data.url);}
    if(play)play.classList.toggle('active',has&&enabled);
    if(stop)stop.classList.toggle('active',has&&!enabled);
  }
  async function loadAudio(){try{const r=await fetch('/admin/api/miniapp-audio',{cache:'no-store',credentials:'same-origin'});const j=await r.json();if(!r.ok){setStatus(j.error||'Could not load audio status.');return}render(j);}catch(e){setStatus('Could not load audio status.');}}
  async function setEnabled(enabled){setStatus(enabled?'Turning audio on...':'Turning audio off...');try{const r=await fetch('/admin/api/miniapp-audio/enabled',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({enabled}),credentials:'same-origin'});const j=await r.json().catch(()=>({error:'Request failed'}));if(!r.ok){setStatus(j.error||'Request failed.');return}render(j);setStatus(enabled?'Audio enabled in mini app.':'Audio disabled in mini app.');}catch(e){setStatus('Request failed.');}}
  document.getElementById('uploadMiniAudio').onclick=async()=>{const input=document.getElementById('miniAudioFile');const file=input&&input.files&&input.files[0];if(!file){setStatus('Choose an audio file first.');return}const extension=(file.name.split('.').pop()||'').toLowerCase();if(AUDIO_TYPES.indexOf(file.type)<0&&AUDIO_EXTENSIONS.indexOf(extension)<0){setStatus('Only MP3, WAV, OGG, WEBM, MP4, M4A or AAC audio files are allowed.');return}setStatus('Uploading audio...');const form=new FormData();form.append('audio',file);try{const r=await fetch('/admin/api/miniapp-audio',{method:'POST',body:form,credentials:'same-origin'});const j=await r.json().catch(()=>({error:'Upload failed'}));if(!r.ok){setStatus(j.error||'Upload failed.');return}render(j);setStatus('Audio uploaded and enabled in the mini app.');}catch(e){setStatus('Upload request failed.');}};
  document.getElementById('playMiniAudio').onclick=()=>setEnabled(true);
  document.getElementById('stopMiniAudio').onclick=()=>setEnabled(false);
  btn.onclick=()=>{document.querySelectorAll('.menu-item').forEach(x=>x.classList.toggle('active',x===btn));document.querySelectorAll('.admin-section').forEach(s=>s.classList.toggle('active',s.id==='sectionAudio'));const title=document.getElementById('adminTitle'),sub=document.getElementById('adminSubtitle');if(title)title.textContent=section.dataset.title||'Mini app audio';if(sub)sub.textContent=section.dataset.subtitle||'';menu.hidden=true;window.scrollTo({top:0,behavior:'smooth'});loadAudio();};
  loadAudio();
})();
</script>`;
