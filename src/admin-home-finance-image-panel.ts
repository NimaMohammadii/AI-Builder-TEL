export const ADMIN_HOME_FINANCE_IMAGE_PANEL_SCRIPT = `<script>(function(){
function g(id){return document.getElementById(id)}
function add(id,title,src,endpoint,extra){
  var s=g('sectionImages');if(!s)return;
  var deleteButton=extra&&extra.deleteEndpoint?'<button class="ghost danger" id="'+id+'Delete" type="button">Delete image</button>':'';
  s.insertAdjacentHTML('beforeend','<div class="image-current"><img id="'+id+'Preview" src="'+src+'?t='+Date.now()+'"><div><strong>'+title+'</strong><p class="muted small-text">Uploadable Home image.</p></div></div><label>Upload '+title+'</label><input id="'+id+'File" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,.png,.jpg,.jpeg,.webp,.svg"><div class="image-actions"><button class="primary" id="'+id+'Upload" type="button">Upload</button>'+deleteButton+'</div><p id="'+id+'Status" class="status"></p>');
  g(id+'Upload').onclick=function(){up(id,src,endpoint,extra)};
  if(extra&&extra.deleteEndpoint&&g(id+'Delete'))g(id+'Delete').onclick=function(){del(id,src,extra.deleteEndpoint)};
}
function boot(){
  if(!g('sectionImages')||g('homeFinanceImageUpload'))return;
  add('homeIntroImage','Home intro image','/app/api/home-intro-image.png','/admin/api/upload-home-intro-image');
  add('homeFinanceImage','Home finance image','/app/api/home-finance-image.png','/admin/api/upload-home-finance-image');
  add('homeMyTicketImage','My Ticket image','/app/api/home-my-ticket-image.png','/admin/api/upload-home-my-ticket-image',{deleteEndpoint:'/admin/api/delete-home-my-ticket-image'});
  add('homeFinanceBottomImage','Home finance bottom image','/app/api/section-lock-image/home/code.png','/admin/api/section-lock-image-v2',{sectionId:'home',kind:'code'});
}
async function up(id,fallback,endpoint,extra){
  var input=g(id+'File'),status=g(id+'Status'),preview=g(id+'Preview');
  if(!input||!input.files||!input.files[0]){status.textContent='Choose an image first.';return}
  var form=new FormData();form.append('image',input.files[0]);
  if(extra&&extra.sectionId){form.append('sectionId',extra.sectionId);form.append('kind',extra.kind)}
  status.textContent='Uploading...';
  try{
    var r=await fetch(endpoint,{method:'POST',body:form});
    var j=await r.json().catch(function(){return{}});
    if(!r.ok){status.textContent=j.error||'Upload failed';return}
    var url=j.url||fallback;
    if(preview)preview.src=url+(url.indexOf('?')===-1?'?':'&')+'t='+Date.now();
    status.textContent='Uploaded.';
  }catch(e){status.textContent='Upload failed'}
}
async function del(id,fallback,endpoint){
  var status=g(id+'Status'),preview=g(id+'Preview');
  if(!confirm('Delete this image?'))return;
  if(status)status.textContent='Deleting...';
  try{
    var r=await fetch(endpoint,{method:'DELETE'});
    var j=await r.json().catch(function(){return{}});
    if(!r.ok){if(status)status.textContent=j.error||'Delete failed';return}
    if(preview)preview.src=fallback+'?t='+Date.now();
    if(status)status.textContent='Deleted.';
  }catch(e){if(status)status.textContent='Delete failed'}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();</script>`;
