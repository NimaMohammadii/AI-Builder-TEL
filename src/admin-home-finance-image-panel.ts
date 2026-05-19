export const ADMIN_HOME_FINANCE_IMAGE_PANEL_SCRIPT = `<script>
(function(){
  const allowed=['image/png','image/jpeg','image/webp'];
  function byId(id){return document.getElementById(id)}
  function makeBlock(opts){
    const wrap=document.createElement('div');
    wrap.className='image-current';
    wrap.innerHTML='<img id="'+opts.previewId+'" src="'+opts.previewSrc+'?t='+Date.now()+'" alt=""/><div><strong>'+opts.title+'</strong><p class="muted small-text">'+opts.text+'</p></div>';
    const label=document.createElement('label');
    label.textContent=opts.label;
    const input=document.createElement('input');
    input.id=opts.inputId;
    input.type='file';
    input.accept='image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp';
    const button=document.createElement('button');
    button.className='primary';
    button.id=opts.buttonId;
    button.type='button';
    button.textContent=opts.buttonText;
    const status=document.createElement('p');
    status.id=opts.statusId;
    status.className='status';
    button.onclick=function(){upload(opts)};
    return [wrap,label,input,button,status];
  }
  function ensurePanel(){
    const section=document.getElementById('sectionImages');
    if(!section||document.getElementById('homeFinanceImageUpload'))return;
    makeBlock({previewId:'homeFinanceImagePreview',previewSrc:'/app/api/home-finance-image.png',title:'Home finance image',text:'Shown on the right side of Deposit / Withdraw cards.',label:'Upload Home finance image',inputId:'homeFinanceImageFile',buttonId:'homeFinanceImageUpload',buttonText:'Upload Home image',statusId:'homeFinanceImageStatus',endpoint:'/admin/api/upload-home-finance-image',fallback:'/app/api/home-finance-image.png',success:'Home image uploaded.',loading:'Uploading Home image...'}).forEach(function(el){section.appendChild(el)});
    makeBlock({previewId:'crashTipImagePreview',previewSrc:'/app/api/crash-tip-image.png',title:'Crash tip image',text:'Shown at the moving tip of the Crash multiplier graph.',label:'Upload Crash tip image',inputId:'crashTipImageFile',buttonId:'crashTipImageUpload',buttonText:'Upload Crash tip',statusId:'crashTipImageStatus',endpoint:'/admin/api/upload-crash-tip-image',fallback:'/app/api/crash-tip-image.png',success:'Crash tip image uploaded.',loading:'Uploading Crash tip image...'}).forEach(function(el){section.appendChild(el)});
    makeBlock({previewId:'dailyRewardsHeroImagePreview',previewSrc:'/app/api/daily-rewards-hero-image.png',title:'Daily Rewards hero image',text:'Shown on the right side of the Daily Prize glass card.',label:'Upload Daily Rewards image',inputId:'dailyRewardsHeroImageFile',buttonId:'dailyRewardsHeroImageUpload',buttonText:'Upload Daily image',statusId:'dailyRewardsHeroImageStatus',endpoint:'/admin/api/upload-daily-rewards-hero-image',fallback:'/app/api/daily-rewards-hero-image.png',success:'Daily Rewards image uploaded.',loading:'Uploading Daily Rewards image...'}).forEach(function(el){section.appendChild(el)});
    makeBlock({previewId:'dailyRewardsBottomImagePreview',previewSrc:'/app/api/daily-rewards-bottom-image.png',title:'Daily Rewards bottom image',text:'Shown below the last Daily Rewards mission in the black shadow area.',label:'Upload Daily Rewards bottom image',inputId:'dailyRewardsBottomImageFile',buttonId:'dailyRewardsBottomImageUpload',buttonText:'Upload Daily bottom image',statusId:'dailyRewardsBottomImageStatus',endpoint:'/admin/api/upload-daily-rewards-bottom-image',fallback:'/app/api/daily-rewards-bottom-image.png',success:'Daily Rewards bottom image uploaded.',loading:'Uploading Daily Rewards bottom image...'}).forEach(function(el){section.appendChild(el)});
  }
  async function upload(opts){
    const file=byId(opts.inputId);
    const status=byId(opts.statusId);
    const preview=byId(opts.previewId);
    if(!file||!file.files||!file.files[0]){status.textContent='Choose an image first.';return}
    if(!allowed.includes(file.files[0].type)){status.textContent='Only PNG, JPG, JPEG or WebP.';return}
    status.textContent=opts.loading;
    const form=new FormData();
    form.append('image',file.files[0]);
    try{
      const response=await fetch(opts.endpoint,{method:'POST',body:form,credentials:'same-origin'});
      const json=await response.json().catch(()=>({error:'Upload failed'}));
      if(!response.ok){status.textContent=json.error||'Upload failed';return}
      if(preview)preview.src=(json.url||opts.fallback)+'&t='+Date.now();
      status.textContent=opts.success;
    }catch(error){status.textContent='Upload failed.'}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensurePanel);else ensurePanel();
})();
</script>`;