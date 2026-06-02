export const WHEEL_ASSETS_SCRIPT = `
(function(){
  var assets = [
    { key:'ring', cls:'wheel-ring-asset', z:'3' },
    { key:'center', cls:'wheel-center-asset', z:'4' },
    { key:'pointer', cls:'wheel-pointer-asset', z:'6' }
  ];
  function versioned(key){ return '/app/api/wheel-asset/' + key + '.png?v=' + Date.now(); }
  function applyStyles(){
    if(document.getElementById('vexa-wheel-assets-style'))return;
    var style=document.createElement('style');
    style.id='vexa-wheel-assets-style';
    style.textContent=[
      '#wheel .wheel-stage{position:relative!important}',
      '#wheel .wheel-canvas{position:relative!important;z-index:2!important}',
      '#wheel .wheel-ring-asset{position:absolute!important;left:50%!important;top:50%!important;width:min(390px,96vw)!important;height:min(390px,96vw)!important;transform:translate(-50%,-50%)!important;object-fit:contain!important;z-index:3!important;pointer-events:none!important;display:block!important}',
      '#wheel .wheel-center-asset{position:absolute!important;left:50%!important;top:50%!important;width:82px!important;height:82px!important;transform:translate(-50%,-50%)!important;object-fit:contain!important;z-index:4!important;pointer-events:none!important;display:none}',
      '#wheel .wheel-center-asset[src]{display:block!important}',
      '#wheel .wheel-pointer-asset{position:absolute!important;left:50%!important;top:2px!important;width:72px!important;height:72px!important;transform:translateX(-50%)!important;object-fit:contain!important;z-index:6!important;pointer-events:none!important;display:none}',
      '#wheel .wheel-pointer-asset[src]{display:block!important}',
      '#wheel .wheel-ring-asset[src]+.wheel-pointer-hide{}'
    ].join('');
    document.head.appendChild(style);
  }
  function makeImg(stage, asset){
    var img=stage.querySelector('.'+asset.cls);
    if(!img){
      img=document.createElement('img');
      img.className=asset.cls;
      img.alt='Wheel '+asset.key;
      img.decoding='async';
      img.loading='eager';
      img.onerror=function(){ img.removeAttribute('src'); img.style.display='none'; };
      img.onload=function(){ img.style.display='block'; if(asset.key==='ring'){ var pointer=stage.querySelector('.wheel-pointer'); if(pointer) pointer.style.display='none'; } };
      var canvas=stage.querySelector('[data-wheel-canvas]');
      if(asset.key==='ring' && canvas && canvas.nextSibling) stage.insertBefore(img, canvas.nextSibling); else stage.appendChild(img);
    }
    if(!img.getAttribute('src')) img.src=versioned(asset.key);
  }
  function boot(){
    applyStyles();
    var root=document.getElementById('wheel');
    if(!root)return;
    var stage=root.querySelector('.wheel-stage');
    if(!stage)return;
    assets.forEach(function(asset){ makeImg(stage, asset); });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  document.addEventListener('click',function(){setTimeout(boot,80)},true);
  window.VexaWheelAssetsRefresh=boot;
})();
`;
