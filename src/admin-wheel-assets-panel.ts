export const ADMIN_WHEEL_ASSETS_PANEL_SCRIPT = `
<script>
(function(){
  var assets = [
    { key: 'ring', title: 'Wheel ring', hint: 'Outer ring overlay. Use a centered image on black/transparent background.' },
    { key: 'center', title: 'Wheel center', hint: 'Optional center cap overlay.' },
    { key: 'pointer', title: 'Wheel pointer', hint: 'Optional separate top pointer. Leave empty if pointer is inside the ring image.' }
  ];
  function row(asset){
    var id = 'wheelAsset' + asset.key.charAt(0).toUpperCase() + asset.key.slice(1);
    return '<div class="image-current" style="align-items:center!important;margin-top:10px!important"><img id="'+id+'Preview" src="/app/api/wheel-asset/'+asset.key+'.png?v='+Date.now()+'" alt="'+asset.title+'" style="background:#000;object-fit:contain"/><div><strong>'+asset.title+'</strong><p class="muted small-text">'+asset.hint+'</p><input id="'+id+'Input" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"/><button class="primary" id="'+id+'Upload" type="button" style="margin-top:8px!important">Upload '+asset.title+'</button><p id="'+id+'Status" class="status"></p></div></div>';
  }
  function wire(asset){
    var id = 'wheelAsset' + asset.key.charAt(0).toUpperCase() + asset.key.slice(1);
    var input = document.getElementById(id+'Input');
    var btn = document.getElementById(id+'Upload');
    var status = document.getElementById(id+'Status');
    var preview = document.getElementById(id+'Preview');
    if(!btn||!input)return;
    btn.onclick = function(){
      var file = input.files && input.files[0];
      if(!file){ if(status)status.textContent='Choose an image first.'; return; }
      btn.disabled = true;
      if(status)status.textContent='Uploading...';
      var fd = new FormData();
      fd.append('image', file);
      fetch('/admin/api/upload-wheel-asset/'+asset.key, { method:'POST', credentials:'same-origin', body:fd })
        .then(function(r){ return r.json().then(function(j){ if(!r.ok)throw new Error(j.error||'Upload failed'); return j; }); })
        .then(function(j){
          if(status)status.textContent='Updated.';
          if(preview)preview.src=j.url;
          try{ window.VexaAppRefresh && window.VexaAppRefresh.apply && window.VexaAppRefresh.apply(String(Date.now()), true); }catch(e){}
        })
        .catch(function(e){ if(status)status.textContent=e && e.message ? e.message : 'Upload failed'; })
        .finally(function(){ btn.disabled=false; });
    };
  }
  function ensurePanel(){
    var images = document.getElementById('sectionImages');
    if(!images || document.getElementById('wheelAssetsPanel'))return;
    var block = document.createElement('div');
    block.id = 'wheelAssetsPanel';
    block.className = 'wheel-assets-upload';
    block.style.cssText = 'margin:18px 0 0!important;padding:14px 0!important;border-top:1px solid rgba(255,255,255,.12)!important';
    block.innerHTML = '<div class="row-title"><div><h2>Wheel assets</h2><p class="muted small-text">Upload the visual images used on the Wheel game. Slices still stay code-generated.</p></div></div>' + assets.map(row).join('');
    images.appendChild(block);
    assets.forEach(wire);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensurePanel);else ensurePanel();
  document.addEventListener('click',function(){setTimeout(ensurePanel,80)},true);
})();
</script>
`;
