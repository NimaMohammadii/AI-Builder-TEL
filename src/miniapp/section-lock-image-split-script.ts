export const SECTION_LOCK_IMAGE_SPLIT_SCRIPT = `
(function(){
  var sections={};
  function imageFor(sectionId, isCode){
    var item=sections[sectionId];
    if(!item)return '';
    return isCode ? (item.codeImageUrl||'') : (item.lockedImageUrl||item.imageUrl||'');
  }
  function visualHtml(url){return '<img class="section-lock-image" src="'+url+'?t='+Date.now()+'" alt=""/>'}
  function patchVisuals(){
    document.querySelectorAll('.view.is-section-locked').forEach(function(view){
      var card=view.querySelector('.section-locked-card');
      if(!card)return;
      var isCode=!!card.querySelector('.section-code-input');
      var url=imageFor(view.id,isCode);
      if(!url)return;
      var current=card.querySelector('.section-lock-image');
      if(current){
        var base=current.getAttribute('src')||'';
        if(base.indexOf(url)!==0)current.setAttribute('src',url+'?t='+Date.now());
        return;
      }
      var svg=card.querySelector('svg');
      if(svg)svg.outerHTML=visualHtml(url);
      else card.insertAdjacentHTML('afterbegin',visualHtml(url));
    });
  }
  function load(){
    fetch('/app/api/section-locks',{cache:'no-store'}).then(function(r){return r.json()}).then(function(data){
      sections={};
      (data.sections||[]).forEach(function(section){sections[section.id]=section});
      patchVisuals();
    }).catch(function(){});
  }
  document.addEventListener('click',function(){setTimeout(patchVisuals,80)},true);
  load();
  setInterval(function(){load();patchVisuals();},15000);
})();
`;
