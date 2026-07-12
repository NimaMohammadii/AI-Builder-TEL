export const DICE_ASSET_CACHE_SCRIPT = `
(function(){
  if(window.__vexaDiceAssetCacheReady)return;
  window.__vexaDiceAssetCacheReady='1';

  var glassStyle=document.getElementById('vexa-dice-glass-fix');
  if(!glassStyle){
    glassStyle=document.createElement('style');
    glassStyle.id='vexa-dice-glass-fix';
    document.head.appendChild(glassStyle);
  }
  glassStyle.textContent=[
    '#dice.dice-view{filter:none!important}',
    'html body #dice.dice-view .dice-range-card,html body #dice.dice-view .dice-result-card{background:rgba(255,255,255,.018)!important;background-color:rgba(255,255,255,.018)!important;background-image:none!important;border-width:1px!important;border-style:solid!important;border-color:rgba(255,255,255,.24)!important;outline:0!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important;filter:none!important;opacity:1!important;visibility:visible!important;backdrop-filter:blur(3px)!important;-webkit-backdrop-filter:blur(3px)!important}',
    'html body #dice.dice-view .dice-panel{display:grid!important;position:relative!important;opacity:1!important;visibility:visible!important;min-height:0!important;background:rgba(255,255,255,.022)!important;background-color:rgba(255,255,255,.022)!important;background-image:none!important;border-width:1px!important;border-style:solid!important;border-color:rgba(255,255,255,.26)!important;outline:0!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important;filter:none!important;backdrop-filter:blur(4px)!important;-webkit-backdrop-filter:blur(4px)!important}',
    '#dice .dice-range-card:before,#dice .dice-range-card:after,#dice .dice-result-card:before,#dice .dice-result-card:after,#dice .dice-panel:before,#dice .dice-panel:after{content:none!important;display:none!important;background:none!important;border:0!important;box-shadow:none!important}'
  ].join('');

  var PREFIX='vexa:dice-img-cache:';
  var MAX_AGE=7*24*60*60*1000;
  var inflight={};
  function isDiceAssetUrl(url){
    return typeof url==='string' && (
      url.indexOf('/app/api/dice-assets')>=0 ||
      url.indexOf('/app/api/uploaded-image/')>=0 ||
      url.indexOf('/app/api/dice-')>=0 ||
      url.indexOf('/app/api/dice/')>=0
    );
  }
  function key(url){return PREFIX+url}
  function read(url){
    try{
      var raw=localStorage.getItem(key(url));
      if(!raw)return '';
      var item=JSON.parse(raw);
      if(!item||!item.data||!item.t)return '';
      if(Date.now()-Number(item.t)>MAX_AGE){localStorage.removeItem(key(url));return ''}
      return String(item.data||'');
    }catch(e){return ''}
  }
  function write(url,data){
    try{localStorage.setItem(key(url),JSON.stringify({t:Date.now(),data:data}))}catch(e){}
  }
  function toDataUrl(url){
    if(!url||inflight[url])return;
    inflight[url]=1;
    fetch(url,{cache:'force-cache',credentials:'same-origin'}).then(function(r){return r&&r.ok?r.blob():null}).then(function(blob){
      if(!blob)return;
      var reader=new FileReader();
      reader.onload=function(){if(reader.result)write(url,String(reader.result))};
      reader.readAsDataURL(blob);
    }).catch(function(){}).finally(function(){delete inflight[url]});
  }
  var desc=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');
  if(desc&&desc.set&&desc.get){
    Object.defineProperty(HTMLImageElement.prototype,'src',{
      configurable:true,
      get:function(){return desc.get.call(this)},
      set:function(url){
        if(isDiceAssetUrl(url)){
          var cached=read(url);
          if(cached){desc.set.call(this,cached);return}
          toDataUrl(url);
        }
        desc.set.call(this,url);
      }
    });
  }
  var originalSetAttribute=HTMLImageElement.prototype.setAttribute;
  HTMLImageElement.prototype.setAttribute=function(name,value){
    if(String(name).toLowerCase()==='src'&&isDiceAssetUrl(String(value||''))){
      var cached=read(String(value));
      if(cached)value=cached;else toDataUrl(String(value));
    }
    return originalSetAttribute.call(this,name,value);
  };
  var styleDesc=CSSStyleDeclaration&&CSSStyleDeclaration.prototype&&CSSStyleDeclaration.prototype.setProperty;
  if(styleDesc){
    var originalSetProperty=CSSStyleDeclaration.prototype.setProperty;
    CSSStyleDeclaration.prototype.setProperty=function(name,value,priority){
      try{
        if(String(name)==='--dice-slider-image'){
          var m=String(value||'').match(/url\(["']?([^"')]+)["']?\)/);
          if(m&&isDiceAssetUrl(m[1])){
            var cached=read(m[1]);
            if(cached)value='url("'+cached+'")';else toDataUrl(m[1]);
          }
        }
      }catch(e){}
      return originalSetProperty.call(this,name,value,priority);
    };
  }
})();
`;