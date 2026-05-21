export const ADMIN_SECTION_LOADING_PANEL_SCRIPT = `<script>
(function(){
  function exp(row){var i=row&&row.querySelector('[data-lock-days]');var n=Number(i&&i.value||0);return n>0?new Date(Date.now()+n*86400000).toISOString():null}
  function patch(){
    var list=document.getElementById('locksList');if(!list)return;
    list.querySelectorAll('.lock-row').forEach(function(row){
      var base=row.querySelector('[data-lock-section]');if(!base)return;
      var id=base.getAttribute('data-lock-section');var actions=row.querySelector('.lock-actions');if(!actions||row.querySelector('[data-loading-lock]'))return;
      var b=document.createElement('button');b.type='button';b.className='lock-toggle loading';b.textContent='Loading';b.setAttribute('data-loading-lock',id);actions.appendChild(b);actions.style.gridTemplateColumns='1fr 1fr 1fr';
      b.onclick=function(){var st=document.getElementById('locksStatus');if(st)st.textContent='Saving loading...';fetch('/admin/api/section-locks/loading-timed',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({sectionId:id,expiresAt:exp(row)})}).then(function(r){return r.json().then(function(j){return {ok:r.ok,json:j}})}).then(function(res){if(!res.ok)throw new Error(res.json&&res.json.error||'Could not save');if(st)st.textContent='Saved';if(typeof loadLocks==='function')loadLocks();setTimeout(patch,300)}).catch(function(e){if(st)st.textContent=e.message||'Could not save'});};
    });
  }
  document.addEventListener('click',function(){setTimeout(patch,150)},true);setTimeout(patch,600);setTimeout(patch,1400);
})();
</script>`;
