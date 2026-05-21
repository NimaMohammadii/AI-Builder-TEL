export const ADMIN_SECTION_LOADING_PANEL_SCRIPT = `<script>
(function(){
  var observer=null,patching=false;
  function minutes(row){var i=row&&row.querySelector('[data-loading-minutes]');return Math.max(0,Number(i&&i.value||0))}
  function patch(){
    if(patching)return;patching=true;
    var list=document.getElementById('locksList');if(!list){patching=false;return}
    list.querySelectorAll('.lock-row').forEach(function(row){
      var base=row.querySelector('[data-lock-section]');if(!base)return;
      var id=base.getAttribute('data-lock-section');var actions=row.querySelector('.lock-actions');if(!actions)return;
      actions.style.gridTemplateColumns='1fr 1fr 1fr';
      if(!row.querySelector('[data-loading-minutes]')){
        var input=document.createElement('input');input.type='number';input.min='0';input.step='1';input.placeholder='loading minutes';input.setAttribute('data-loading-minutes',id);input.style.marginTop='0';row.insertBefore(input,actions);
      }
      if(row.querySelector('[data-loading-lock]'))return;
      var b=document.createElement('button');b.type='button';b.className='lock-toggle loading';b.textContent='Loading';b.setAttribute('data-loading-lock',id);actions.appendChild(b);
      b.onclick=function(){var st=document.getElementById('locksStatus');if(st)st.textContent='Saving loading...';fetch('/admin/api/section-loading-mode',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({sectionId:id,minutes:minutes(row)})}).then(function(r){return r.json().then(function(j){return {ok:r.ok,json:j}})}).then(function(res){if(!res.ok)throw new Error(res.json&&res.json.error||'Could not save');if(st)st.textContent='Saved';if(typeof loadLocks==='function')loadLocks();setTimeout(patch,120);setTimeout(patch,500)}).catch(function(e){if(st)st.textContent=e.message||'Could not save'});};
    });
    patching=false;
  }
  function watch(){
    var list=document.getElementById('locksList');if(!list||observer)return;
    observer=new MutationObserver(function(){setTimeout(patch,20)});
    observer.observe(list,{childList:true,subtree:false});
    patch();
  }
  document.addEventListener('click',function(){setTimeout(watch,60);setTimeout(patch,150);setTimeout(patch,500)},true);
  document.addEventListener('DOMContentLoaded',function(){setTimeout(watch,300);setTimeout(patch,900)});
  setInterval(function(){watch();patch()},1200);
  watch();setTimeout(watch,600);setTimeout(patch,1400);
})();
</script>`;
