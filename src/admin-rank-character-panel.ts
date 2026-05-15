export const ADMIN_RANK_CHARACTER_PANEL_SCRIPT = `<script>
(function(){
  const ranks=['Rookie','Explorer','Pro','Elite','Master','Legend','Titan'];
  const allowed=['image/png','image/jpeg','image/webp','image/svg+xml'];
  function byId(id){return document.getElementById(id)}
  function ensurePanel(){
    const section=document.getElementById('sectionImages');
    if(!section||document.getElementById('rankCharacterPanel'))return;
    const wrap=document.createElement('div');
    wrap.id='rankCharacterPanel';
    wrap.className='image-current';
    wrap.style.display='block';
    wrap.innerHTML='<div><strong>Rank characters</strong><p class="muted small-text">Upload one character image for each rank. The current user rank image replaces the Home profile robot without changing its size.</p></div>';
    section.appendChild(wrap);
    ranks.forEach(function(rank){
      const block=document.createElement('div');
      block.className='image-current';
      block.innerHTML='<img id="rankCharacterPreview'+rank+'" src="/app/api/rank-character/'+rank+'.png?t='+Date.now()+'" alt=""/><div><strong>'+rank+'</strong><p class="muted small-text">Character for '+rank+' rank</p></div>';
      const input=document.createElement('input');
      input.id='rankCharacterFile'+rank;
      input.type='file';
      input.accept='image/png,image/jpeg,image/webp,image/svg+xml,.png,.jpg,.jpeg,.webp,.svg';
      const button=document.createElement('button');
      button.className='primary';
      button.type='button';
      button.textContent='Upload '+rank+' character';
      const status=document.createElement('p');
      status.id='rankCharacterStatus'+rank;
      status.className='status';
      button.onclick=function(){upload(rank)};
      section.appendChild(block);
      section.appendChild(input);
      section.appendChild(button);
      section.appendChild(status);
    });
  }
  async function upload(rank){
    const input=byId('rankCharacterFile'+rank);
    const status=byId('rankCharacterStatus'+rank);
    const preview=byId('rankCharacterPreview'+rank);
    if(!input||!input.files||!input.files[0]){status.textContent='Choose an image first.';return}
    if(!allowed.includes(input.files[0].type)){status.textContent='Only PNG, JPG, JPEG, SVG or WebP.';return}
    status.textContent='Uploading '+rank+' character...';
    const form=new FormData();
    form.append('rank',rank);
    form.append('image',input.files[0]);
    try{
      const response=await fetch('/admin/api/upload-rank-character',{method:'POST',body:form,credentials:'same-origin'});
      const json=await response.json().catch(()=>({error:'Upload failed'}));
      if(!response.ok){status.textContent=json.error||'Upload failed';return}
      if(preview)preview.src=(json.url||('/app/api/rank-character/'+rank+'.png'))+'&t='+Date.now();
      status.textContent=rank+' character uploaded.';
    }catch(error){status.textContent='Upload failed.'}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensurePanel);else ensurePanel();
})();
</script>`;
