export const SECTION_LOCK_IMAGE_SPLIT_SCRIPT = `
(function(){
  var sections={};
  var preloaded={};
  function imageFor(sectionId, isCode){
    var item=sections[sectionId];
    if(!item)return '';
    return isCode ? (item.codeImageUrl||'') : (item.lockedImageUrl||item.imageUrl||'');
  }
  function preload(url){
    if(!url||preloaded[url])return;
    preloaded[url]=true;
    var img=new Image();
    img.decoding='async';
    img.src=url;
  }
  function preloadAll(){
    Object.keys(sections).forEach(function(id){
      var item=sections[id];
      preload(item.lockedImageUrl||item.imageUrl||'');
      preload(item.codeImageUrl||'');
    });
  }
  function visualHtml(url){return '<img class="section-lock-image" src="'+url+'" alt="" decoding="async"/>'}
  function patchVisuals(){
    document.querySelectorAll('.view.is-section-locked').forEach(function(view){
      var card=view.querySelector('.section-locked-card');
      if(!card)return;
      var isCode=!!card.querySelector('.section-code-input');
      var url=imageFor(view.id,isCode);
      if(!url)return;
      preload(url);
      var current=card.querySelector('.section-lock-image');
      if(current){
        if(current.getAttribute('src')!==url)current.setAttribute('src',url);
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
      preloadAll();
      patchVisuals();
    }).catch(function(){});
  }
  document.addEventListener('click',function(){setTimeout(patchVisuals,80)},true);
  load();
  setInterval(function(){load();patchVisuals();},15000);
})();
`;
