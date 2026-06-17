export const ADMIN_ANNOUNCEMENT_PANEL_SCRIPT = `<script>
(function(){
  function q(id){return document.getElementById(id)}
  function ensure(){
    if(q('announcementPanel'))return;
    var css=document.createElement('style');
    css.textContent='#announcementPanel{margin:16px 0;padding:16px;border-radius:22px;background:rgba(255,255,255,.045);color:#fff;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)}#announcementPanel h3{margin:0 0 6px;font-size:16px}#announcementPanel p{margin:0 0 12px;color:rgba(255,255,255,.58);font-size:12px;line-height:1.35}#announcementPanel textarea,#announcementPanel input,#announcementPanel select{width:100%;border:0;outline:0;border-radius:16px;background:rgba(0,0,0,.24);color:#fff;padding:11px 12px;box-sizing:border-box;margin:0 0 8px;font-size:13px}#announcementPanel textarea{min-height:92px;resize:vertical}#announcementPanel .ann-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px}#announcementPanel button{height:40px;border:0;border-radius:999px;background:rgba(255,255,255,.10);color:#fff;font-weight:850;font-size:12px}#announcementPanel button.primary{background:linear-gradient(135deg,#5b0f24,#9f294b)}#announcementPanel .ann-regions{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:6px 0 10px}#announcementPanel label{font-size:11px;color:rgba(255,255,255,.72);display:flex;align-items:center;gap:4px;background:rgba(255,255,255,.06);border-radius:999px;padding:8px 7px}#announcementPanel audio{width:100%;margin:8px 0}#announcementStatus{white-space:pre-wrap;color:rgba(255,255,255,.62);font-size:11px;margin-top:8px}';
    document.head.appendChild(css);
    var s=document.createElement('section');
    s.id='announcementPanel';
    s.innerHTML='<h3>Vexa Admin Message</h3><p>Write text, generate audio preview, listen, then approve and send by region.</p><input id="annTitle" value="Vexa wants to say something" placeholder="Small popup title"><textarea id="annText" placeholder="Write the message text here..."></textarea><div class="ann-grid"><select id="annLang"><option value="en">English</option><option value="fa">Persian</option><option value="tr">Turkish</option><option value="ru">Russian</option></select><button type="button" data-ann="preview">Generate Preview</button></div><div class="ann-regions"><label><input type="checkbox" value="ALL" checked>All</label><label><input type="checkbox" value="EN">EN</label><label><input type="checkbox" value="IR">IR</label><label><input type="checkbox" value="TR">TR</label><label><input type="checkbox" value="RU">RU</label></div><audio id="annPlayer" controls hidden></audio><div class="ann-grid"><button class="primary" type="button" data-ann="publish">Approve & Send</button><button type="button" data-ann="disable">Disable Message</button></div><div id="announcementStatus"></div>';
    var target=document.querySelector('main')||document.querySelector('.admin-content')||document.body;
    target.appendChild(s);
  }
  function regions(){var a=[];document.querySelectorAll('#announcementPanel input[type=checkbox]:checked').forEach(function(x){a.push(x.value)});return a.length?a:['ALL']}
  function status(t){var n=q('announcementStatus');if(n)n.textContent=t}
  async function post(path,body){var r=await fetch(path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body||{})});var j=await r.json().catch(function(){return{error:'Bad response'}});if(!r.ok)throw new Error(j.error||'Request failed');return j}
  var draftId='';
  document.addEventListener('click',async function(e){
    var b=e.target&&e.target.closest?e.target.closest('[data-ann]'):null;if(!b)return;
    try{
      var act=b.getAttribute('data-ann');status('Working...');
      if(act==='preview'){
        var res=await post('/admin/api/vexa-voice/preview',{title:q('annTitle').value,text:q('annText').value,language:q('annLang').value,regions:regions()});
        draftId=res.draftId||'';
        var p=q('annPlayer');p.hidden=false;p.src=res.previewUrl;p.play().catch(function(){});
        status('Preview ready. Listen first, then approve.');
      }
      if(act==='publish'){
        if(!draftId)throw new Error('Generate preview first.');
        status(JSON.stringify(await post('/admin/api/vexa-voice/publish',{draftId:draftId,regions:regions()}),null,2));
      }
      if(act==='disable')status(JSON.stringify(await post('/admin/api/vexa-voice/admin-message',{enabled:false,regions:regions()}),null,2));
    }catch(err){status(err&&err.message?err.message:'Failed')}
  },true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensure);else ensure();
})();
</script>`;
