export const HOME_IMAGE_VERSION_SCRIPT = `
(function(){
  var CACHE_NAME='vexa-home-images-v1';
  var URL_PATH='/app/api/home-intro-image.png';
  var FINANCE_BOTTOM_PATH='/app/api/section-lock-image/home/code.png';
  var EMPTY='data:image/gif;base64,R0lGODlhAQABAAAAACw=';
  var state=window.__vexaHomeIntroImageState=window.__vexaHomeIntroImageState||{objectUrl:'',promise:null,loaded:false};
  function installCss(){
    if(document.getElementById('vexaHomeIntroNoCssReload'))return;
    var style=document.createElement('style');
    style.id='vexaHomeIntroNoCssReload';
    style.textContent='#home .home-intro-card{background-image:none!important;background-color:transparent!important}#home .home-intro-card h2,#home .home-intro-card p{display:none!important}#home .home-intro-image-frame{display:block!important;width:100%!important;height:100%!important;min-height:144px!important;overflow:hidden!important;border:0!important;border-radius:24px!important;background:transparent!important;box-shadow:none!important}#home img.home-intro-image{display:block!important;width:100%!important;height:100%!important;min-height:144px!important;object-fit:cover!important;object-position:center!important;border:0!important;border-radius:23px!important;background:transparent!important;box-shadow:none!important}#home .home-finance-split{align-items:start!important}#home .home-finance-actions{display:grid!important;grid-template-rows:92px 92px 92px!important;grid-auto-rows:92px!important;align-content:start!important;gap:10px!important}#home .home-finance-actions>.home-finance-card{min-height:0!important;height:92px!important;max-height:92px!important;margin:0!important;box-sizing:border-box!important}#home .home-referral-card,#home .home-referral-mini{width:auto!important;border-radius:28px!important;padding:12px 10px!important;display:grid!important;place-items:center!important;align-content:center!important;text-align:center!important;gap:6px!important;background:rgba(255,255,255,.026)!important}#home .home-referral-card .home-referral-copy{display:contents!important}#home .home-referral-card .home-referral-icon{width:34px!important;height:34px!important;min-width:34px!important;border-radius:15px!important;background:rgba(255,255,255,.06)!important}#home .home-referral-card .home-referral-icon svg{width:26px!important;height:26px!important}#home .home-finance-visual-stack{min-width:0!important;display:grid!important;grid-template-rows:178px 92px!important;gap:10px!important;align-items:start!important}#home .home-finance-visual{min-height:178px!important;height:178px!important}#home .home-finance-extra-visual{min-height:0!important;height:92px!important;margin:0!important}#home .home-finance-extra-visual img{object-fit:cover!important;object-position:center!important}';
    document.head.appendChild(style);
  }
  function card(){return document.querySelector('#home .home-intro-card')}
  function ensureImg(){
    var c=card();
    if(!c)return null;
    var img=c.querySelector('img.home-intro-image');
    if(!img){
      c.innerHTML='<span class="home-intro-image-frame"><img class="home-intro-image" src="'+EMPTY+'" alt="" decoding="async" loading="eager"/></span>';
      img=c.querySelector('img.home-intro-image');
    }
    return img;
  }
  function ensureFinanceBottom(){
    var img=document.querySelector('#home .home-finance-extra-visual img');
    if(img&&img.getAttribute('src')!==FINANCE_BOTTOM_PATH)img.src=FINANCE_BOTTOM_PATH;
  }
  function imageBlob(){
    if(state.promise)return state.promise;
    if(!('caches' in window)||!window.fetch){state.promise=Promise.resolve(null);return state.promise;}
    state.promise=caches.open(CACHE_NAME).then(function(cache){return cache.match(URL_PATH).then(function(hit){if(hit)return hit.blob();return fetch(URL_PATH,{credentials:'same-origin',cache:'force-cache'}).then(function(res){if(!res||!res.ok)throw new Error('home image failed');cache.put(URL_PATH,res.clone()).catch(function(){});return res.blob();});});}).catch(function(){state.promise=null;return null});
    return state.promise;
  }
  function pin(img,src,key){
    if(!img||!src)return;
    img.onerror=function(){this.onerror=null;if(this.getAttribute('src')!==URL_PATH)this.src=URL_PATH};
    if(img.getAttribute('data-home-intro-cache-key')===key&&img.getAttribute('src')===src)return;
    img.setAttribute('data-home-intro-cache-key',key);img.src=src;state.loaded=true;
  }
  function load(){installCss();ensureFinanceBottom();var img=ensureImg();if(!img)return;if(state.objectUrl){pin(img,state.objectUrl,URL_PATH);return;}if(state.loaded&&img.getAttribute('src')&&img.getAttribute('src')!==EMPTY)return;if(!('caches' in window)||!window.fetch){pin(img,URL_PATH,URL_PATH);return;}imageBlob().then(function(blob){if(!blob){pin(img,URL_PATH,URL_PATH);return;}if(!state.objectUrl)state.objectUrl=URL.createObjectURL(blob);pin(img,state.objectUrl,URL_PATH);}).catch(function(){pin(img,URL_PATH,URL_PATH)});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
  setTimeout(load,120);setTimeout(load,500);
})();
`;