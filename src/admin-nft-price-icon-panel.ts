export const ADMIN_NFT_PRICE_ICON_PANEL_SCRIPT = `
<script>
(function(){
  function ensurePanel(){
    var images=document.getElementById('sectionImages');
    if(!images||document.getElementById('nftPriceIconPanel'))return;
    var block=document.createElement('div');
    block.id='nftPriceIconPanel';
    block.className='nft-price-icon-upload';
    block.style.cssText='margin:18px 0 0!important;padding:14px 0!important;border-top:1px solid rgba(255,255,255,.12)!important';
    block.innerHTML='<div class="row-title"><div><h2>NFT price icon</h2><p class="muted small-text">Upload the icon used only next to NFT prices in the Market cards and details. This is separate from the main TON logo.</p></div></div><div class="image-current"><img id="nftPriceIconPreview" src="/app/api/nft-price-icon.png?v='+Date.now()+'" alt="NFT price icon"/><div><strong>NFT price icon</strong><p class="muted small-text">Current icon next to NFT prices.</p></div></div><label>Upload NFT price icon</label><input id="nftPriceIconInput" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"/><button class="primary" id="nftPriceIconUpload" type="button">Upload NFT price icon</button><p id="nftPriceIconStatus" class="status"></p>';
    images.appendChild(block);
    var input=document.getElementById('nftPriceIconInput');
    var btn=document.getElementById('nftPriceIconUpload');
    var status=document.getElementById('nftPriceIconStatus');
    var preview=document.getElementById('nftPriceIconPreview');
    if(!btn||!input)return;
    btn.onclick=function(){
      var file=input.files&&input.files[0];
      if(!file){if(status)status.textContent='Choose an image first.';return;}
      btn.disabled=true;if(status)status.textContent='Uploading...';
      var fd=new FormData();fd.append('image',file);
      fetch('/admin/api/upload-nft-price-icon',{method:'POST',credentials:'same-origin',body:fd})
        .then(function(r){return r.json().then(function(j){if(!r.ok)throw new Error(j.error||'Upload failed');return j;});})
        .then(function(j){if(status)status.textContent='Updated.';if(preview)preview.src=j.url;try{window.VexaAppRefresh&&window.VexaAppRefresh.apply&&window.VexaAppRefresh.apply(String(Date.now()),true)}catch(e){}})
        .catch(function(e){if(status)status.textContent=e&&e.message?e.message:'Upload failed';})
        .finally(function(){btn.disabled=false;});
    };
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensurePanel);else ensurePanel();
  document.addEventListener('click',function(){setTimeout(ensurePanel,80)},true);
})();
</script>
`;
