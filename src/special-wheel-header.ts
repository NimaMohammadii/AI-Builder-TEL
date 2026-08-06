export const SPECIAL_WHEEL_HEADER = `
<style>
  #specialWheelOverlay{top:0!important;z-index:2147483647!important;padding:0!important;align-items:stretch!important;justify-content:flex-start!important}
  body.special-wheel-active main.app>header.top{visibility:hidden!important;pointer-events:none!important}
  #specialWheelOverlay .special-wheel-page{width:min(100%,560px);height:100dvh;margin:0 auto;padding:calc(22px + env(safe-area-inset-top)) 16px calc(24px + env(safe-area-inset-bottom));display:flex;flex-direction:column;background:#000;box-sizing:border-box;overflow:hidden}
  #specialWheelOverlay .special-wheel-header-host{flex:0 0 auto;width:100%}
  #specialWheelOverlay .special-wheel-header-host .top{position:static!important;inset:auto!important;width:100%!important;height:72px!important;margin:0 0 16px!important;padding:0!important;display:flex!important;visibility:visible!important;pointer-events:none!important;background:#000!important;box-sizing:border-box!important}
  #specialWheelOverlay .special-wheel-body{min-height:0;flex:1;display:flex;align-items:center;justify-content:center;overflow:hidden}
  #specialWheelOverlay .special-wheel-body>.special-wheel-content{width:100%;max-width:520px;margin:0;transform:translateY(-1.5vh)}
</style>
<script>
(function(){
  var overlay=document.getElementById('specialWheelOverlay');
  if(!overlay)return;
  var content=overlay.querySelector('.special-wheel-content');
  if(!content)return;

  var page=document.createElement('div');
  page.className='special-wheel-page';
  var headerHost=document.createElement('div');
  headerHost.className='special-wheel-header-host';
  var body=document.createElement('div');
  body.className='special-wheel-body';
  body.appendChild(content);
  page.appendChild(headerHost);
  page.appendChild(body);
  overlay.appendChild(page);

  function removeIds(root){
    if(root.id)root.removeAttribute('id');
    var nodes=root.querySelectorAll('[id]');
    for(var i=0;i<nodes.length;i++)nodes[i].removeAttribute('id');
  }

  function syncHeader(){
    var source=document.querySelector('main.app>header.top');
    if(!source)return;
    var clone=source.cloneNode(true);
    removeIds(clone);
    headerHost.replaceChildren(clone);
  }

  syncHeader();
  var source=document.querySelector('main.app>header.top');
  if(source&&window.MutationObserver){
    new MutationObserver(syncHeader).observe(source,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['src','class','style']});
  }
  setInterval(function(){if(overlay.classList.contains('active'))syncHeader()},1000);
})();
</script>`;
