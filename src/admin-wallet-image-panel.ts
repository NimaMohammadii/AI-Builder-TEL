export const ADMIN_WALLET_IMAGE_PANEL_SCRIPT = `<script>(function(){
  function q(id){return document.getElementById(id)}
  function boot(){
    if(q('sectionWalletHeroImage'))return;
    var menu=q('adminMenu'),main=document.querySelector('main.page')||document.querySelector('main')||document.body;
    if(!menu||!main)return;
    var btn=document.createElement('button');btn.className='menu-item';btn.type='button';btn.dataset.section='walletHeroImage';btn.innerHTML='<strong>Wallet Image</strong><span>Top wallet card image</span>';menu.appendChild(btn);
    var section=document.createElement('section');section.className='section admin-section wallet-image-admin';section.id='sectionWalletHeroImage';section.hidden=true;section.dataset.title='Wallet Image';section.dataset.subtitle='Upload the image shown in the transparent top card of Wallet.';
    section.innerHTML='<div class="row-title"><div><h2>Wallet Image</h2><p class="muted small-text">Upload an image for the top Wallet card. The card is transparent glass and keeps only a small gap around the image.</p></div></div><div class="wallet-image-card"><img id="walletHeroPreview" src="/app/api/wallet-hero-image.png?t='+Date.now()+'" alt="Wallet image preview"/><label>Upload Wallet top image</label><input id="walletHeroFile" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,.png,.jpg,.jpeg,.webp,.svg"/><button class="primary" id="walletHeroUpload" type="button">Upload image</button><p id="walletHeroStatus" class="status"></p></div>';
    main.appendChild(section);
    btn.onclick=function(){document.querySelectorAll('.menu-item').forEach(function(x){x.classList.toggle('active',x===btn)});document.querySelectorAll('.admin-section').forEach(function(s){s.classList.toggle('active',s===section);s.hidden=s!==section});var t=q('adminTitle'),st=q('adminSubtitle');if(t)t.textContent='Wallet Image';if(st)st.textContent='Top Wallet card image.';menu.hidden=true;window.scrollTo({top:0,behavior:'smooth'});};
    q('walletHeroUpload').onclick=upload;
    injectCss();
  }
  function injectCss(){if(q('walletImageAdminCss'))return;var style=document.createElement('style');style.id='walletImageAdminCss';style.textContent='.wallet-image-admin .wallet-image-card{display:grid;gap:10px;margin-top:14px;padding:12px;border:1px solid rgba(255,255,255,.10);border-radius:20px;background:rgba(255,255,255,.035)}.wallet-image-admin img{width:100%;height:150px;object-fit:cover;border-radius:18px;background:rgba(0,0,0,.22);border:1px solid rgba(255,255,255,.08)}.wallet-image-admin input{font-size:11px}.wallet-image-admin button{height:40px!important;border-radius:999px!important}';document.head.appendChild(style)}
  async function upload(){var input=q('walletHeroFile'),status=q('walletHeroStatus'),preview=q('walletHeroPreview');if(!input||!input.files||!input.files[0]){if(status)status.textContent='Choose an image first.';return}var form=new FormData();form.append('image',input.files[0]);if(status)status.textContent='Uploading...';try{var r=await fetch('/admin/api/upload-wallet-hero-image',{method:'POST',credentials:'same-origin',body:form});var j=await r.json().catch(function(){return{}});if(!r.ok)throw new Error(j.error||'Upload failed');if(preview)preview.src=(j.url||'/app/api/wallet-hero-image.png')+'&t='+Date.now();if(status)status.textContent='Uploaded. Reopen or refresh Wallet to see it.';}catch(e){if(status)status.textContent=e&&e.message?e.message:'Upload failed'}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();</script>`;
