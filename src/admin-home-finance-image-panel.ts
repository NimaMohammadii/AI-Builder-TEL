export const ADMIN_HOME_FINANCE_IMAGE_PANEL_SCRIPT = `<script>
(function(){
  const allowed=['image/png','image/jpeg','image/webp','image/svg+xml'];
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
    input.accept=opts.accept||'image/png,image/jpeg,image/webp,image/svg+xml,.png,.jpg,.jpeg,.webp,.svg';
    const row=document.createElement('div');
    row.style.display='flex';
    row.style.gap='8px';
    row.style.alignItems='center';
    row.style.flexWrap='wrap';
    const button=document.createElement('button');
    button.className='primary';
    button.id=opts.buttonId;
    button.type='button';
    button.textContent=opts.buttonText;
    button.onclick=function(){upload(opts)};
    row.appendChild(button);
    if(opts.cacheButtonId){
      const cacheButton=document.createElement('button');
      cacheButton.className='primary';
      cacheButton.id=opts.cacheButtonId;
      cacheButton.type='button';
      cacheButton.textContent=opts.cacheButtonText||'Update cache';
      cacheButton.onclick=function(){refreshCache(opts)};
      row.appendChild(cacheButton);
    }
    const status=document.createElement('p');
    status.id=opts.statusId;
    status.className='status';
    return [wrap,label,input,row,status];
  }
  function ensurePanel(){
    const section=document.getElementById('sectionImages');
    if(!section||document.getElementById('homeFinanceImageUpload'))return;
    makeBlock({previewId:'homeIntroImagePreview',previewSrc:'/app/api/home-intro-image.png',title:'Home intro card image',text:'Shown in the top Home glass card.',label:'Upload Home intro card image',inputId:'homeIntroImageFile',buttonId:'homeIntroImageUpload',buttonText:'Upload Home intro image',statusId:'homeIntroImageStatus',endpoint:'/admin/api/upload-home-intro-image',fallback:'/app/api/home-intro-image.png',success:'Home intro image uploaded.',loading:'Uploading Home intro image...'}).forEach(function(el){section.appendChild(el)});
    makeBlock({previewId:'homeFinanceImagePreview',previewSrc:'/app/api/home-finance-image.png',title:'Home finance image',text:'Shown on the right side of Deposit / Withdraw cards.',label:'Upload Home finance image',inputId:'homeFinanceImageFile',buttonId:'homeFinanceImageUpload',buttonText:'Upload Home image',statusId:'homeFinanceImageStatus',endpoint:'/admin/api/upload-home-finance-image',fallback:'/app/api/home-finance-image.png',success:'Home image uploaded.',loading:'Uploading Home image...'}).forEach(function(el){section.appendChild(el)});
    makeBlock({previewId:'homeEmptyCardImagePreview',previewSrc:'/app/api/section-lock-image/home/code.png',title:'Home empty glass card image',text:'Shown inside the empty horizontal glass card on Home. Recommended: 1200 × 420 px.',label:'Upload Home glass card image',inputId:'homeEmptyCardImageFile',buttonId:'homeEmptyCardImageUpload',buttonText:'Upload Home card image',cacheButtonId:'homeEmptyCardCacheRefresh',cacheButtonText:'Update cache',statusId:'homeEmptyCardImageStatus',endpoint:'/admin/api/section-lock-image-v2',fallback:'/app/api/section-lock-image/home/code.png',success:'Home glass card image uploaded.',loading:'Uploading Home glass card image...',sectionId:'home',kind:'code',accept:'image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp'}).forEach(function(el){section.appendChild(el)});
    makeBlock({previewId:'crashTipImagePreview',previewSrc:'/app/api/crash-tip-image.png',title:'Crash tip image',text:'Shown at the moving tip of the Crash multiplier graph.',label:'Upload Crash tip image',inputId:'crashTipImageFile',buttonId:'crashTipImageUpload',buttonText:'Upload Crash tip',statusId:'crashTipImageStatus',endpoint:'/admin/api/upload-crash-tip-image',fallback:'/app/api/crash-tip-image.png',success:'Crash tip image uploaded.',loading:'Uploading Crash tip image...'}).forEach(function(el){section.appendChild(el)});
    makeBlock({previewId:'dailyRewardsHeroImagePreview',previewSrc:'/app/api/daily-rewards-hero-image.png',title:'Daily Rewards hero image',text:'Shown on the right side of the Daily Prize glass card.',label:'Upload Daily Rewards image',inputId:'dailyRewardsHeroImageFile',buttonId:'dailyRewardsHeroImageUpload',buttonText:'Upload Daily image',statusId:'dailyRewardsHeroImageStatus',endpoint:'/admin/api/upload-daily-rewards-hero-image',fallback:'/app/api/daily-rewards-hero-image.png',success:'Daily Rewards image uploaded.',loading:'Uploading Daily Rewards image...'}).forEach(function(el){section.appendChild(el)});
    makeBlock({previewId:'dailyRewardsBottomImagePreview',previewSrc:'/app/api/daily-rewards-bottom-image.png',title:'Daily Rewards bottom image',text:'Shown below the last Daily Rewards mission in the black shadow area.',label:'Upload Daily Rewards bottom image',inputId:'dailyRewardsBottomImageFile',buttonId:'dailyRewardsBottomImageUpload',buttonText:'Upload Daily bottom image',statusId:'dailyRewardsBottomImageStatus',endpoint:'/admin/api/upload-daily-rewards-bottom-image',fallback:'/app/api/daily-rewards-bottom-image.png',success:'Daily Rewards bottom image uploaded.',loading:'Uploading Daily Rewards image...'}).forEach(function(el){section.appendChild(el)});
    makeBlock({previewId:'topPlayersHeroImagePreview',previewSrc:'/app/api/top-players-hero-image.png',title:'Top Players hero image',text:'Shown on the right side of the Top Players glass card.',label:'Upload Top Players image',inputId:'topPlayersHeroImageFile',buttonId:'topPlayersHeroImageUpload',buttonText:'Upload Top Players image',statusId:'topPlayersHeroImageStatus',endpoint:'/admin/api/upload-top-players-hero-image',fallback:'/app/api/top-players-hero-image.png',success:'Top Players image uploaded.',loading:'Uploading Top Players image...'}).forEach(function(el){section.appendChild(el)});
  }
  async function upload(opts){
    const file=byId(opts.inputId),status=byId(opts.statusId),preview=byId(opts.previewId);
    if(!status)return;
    if(!file||!file.files||!file.files[0]){status.textContent='Choose an image first.';return}
    const selected=file.files[0];
    const allowedList=opts.sectionId?['image/png','image/jpeg','image/webp']:allowed;
    if(!allowedList.includes(selected.type)){status.textContent=opts.sectionId?'Only PNG, JPG, JPEG or WebP.':'Only PNG, JPG, JPEG, SVG or WebP.';return}
    status.textContent=opts.loading;
    const form=new FormData();
    form.append('image',selected);
    if(opts.sectionId){form.append('sectionId',opts.sectionId);form.append('kind',opts.kind||'locked')}
    try{
      const response=await fetch(opts.endpoint,{method:'POST',body:form});
      const json=await response.json().catch(()=>({error:'Upload failed'}));
      if(!response.ok){status.textContent=json.error||('Upload failed: HTTP '+response.status);return}
      const url=json.url||opts.fallback;
      const stamp=Date.now();
      if(preview)preview.src=url+(url.indexOf('?')===-1?'?':'&')+'t='+stamp;
      status.textContent=opts.success;
    }catch(error){status.textContent='Upload failed: '+(error&&error.message?error.message:'network error')}
  }
  async function refreshCache(opts){
    const status=byId(opts.statusId);
    const preview=byId(opts.previewId);
    if(status)status.textContent='Updating cache...';
    try{
      const response=await fetch('/admin/api/force-app-refresh',{method:'POST',credentials:'same-origin'});
      const json=await response.json().catch(()=>({error:'Cache update failed'}));
      if(!response.ok){if(status)status.textContent=json.error||('Cache update failed: HTTP '+response.status);return}
      const version=json.version||Date.now();
      if(preview)preview.src=opts.fallback+(opts.fallback.indexOf('?')===-1?'?':'&')+'v='+version;
      if(status)status.textContent='Cache updated.';
    }catch(error){if(status)status.textContent='Cache update failed: '+(error&&error.message?error.message:'network error')}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensurePanel);else ensurePanel();
})();
</script>`;