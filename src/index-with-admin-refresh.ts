import app from './index-with-fragment-detail-polish';
import type { Env } from './types';

const APP_CACHE_VERSION_KEY = 'admin:app-cache-version';
const ADMIN_REFRESH_SCRIPT = `
(function(){
  try {
    function insertButton(){
      if(document.getElementById('vexaForceRefreshBlock'))return;
      var target=document.getElementById('sectionImages')||document.querySelector('main')||document.body;
      if(!target)return;
      var block=document.createElement('div');
      block.id='vexaForceRefreshBlock';
      block.style.cssText='margin:18px 0;padding:16px;border:1px solid rgba(255,255,255,.14);border-radius:18px;background:rgba(255,255,255,.055)';
      block.innerHTML='<h3 style="margin:0 0 8px;font-size:17px">Force update all users</h3><p class="muted small-text" style="margin:0 0 12px;color:rgba(255,255,255,.62)">Use this after changing images or assets. It bumps the app cache version so Mini App clients reload images with fresh URLs.</p><button id="vexaForceRefreshBtn" class="primary" type="button">Force update all users</button><p id="vexaForceRefreshStatus" class="status" style="margin:10px 0 0"></p>';
      target.insertBefore(block,target.firstChild);
      var btn=document.getElementById('vexaForceRefreshBtn');
      var status=document.getElementById('vexaForceRefreshStatus');
      if(btn)btn.onclick=function(){
        if(status)status.textContent='Updating app version...';
        btn.disabled=true;
        fetch('/admin/api/force-app-refresh',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({source:'admin-button'})})
          .then(function(r){return r.json().then(function(j){if(!r.ok)throw new Error(j.error||'Update failed');return j})})
          .then(function(j){if(status)status.textContent='Done. New version: '+j.version+'. Users will refresh images automatically.'; try{window.VexaAppRefresh&&window.VexaAppRefresh.apply(j.version,true)}catch(e){}})
          .catch(function(e){if(status)status.textContent=e&&e.message?e.message:'Update failed';})
          .finally(function(){btn.disabled=false});
      };
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',insertButton);else insertButton();
    document.addEventListener('click',function(){setTimeout(insertButton,80)},true);
  } catch(e) {}
})();
`;

const CLIENT_REFRESH_SCRIPT = `
(function(){
  try {
    var storageKey='vexa-app-cache-version';
    var current='';
    function addParam(url,version){
      try{
        var u=new URL(url,location.href);
        if(u.origin!==location.origin)return url;
        var p=u.pathname;
        if(p.indexOf('/app/api/')!==0&&p.indexOf('/assets/')!==0)return url;
        u.searchParams.set('av',version);
        return u.pathname+u.search+u.hash;
      }catch(e){return url}
    }
    function refreshImages(version){
      if(!version)return;
      var imgs=document.querySelectorAll('img[src]');
      for(var i=0;i<imgs.length;i++){
        var img=imgs[i];
        var src=img.getAttribute('src')||'';
        var next=addParam(src,version);
        if(next!==src)img.setAttribute('src',next);
      }
      var styled=document.querySelectorAll('[style*="/app/api/"],[style*="/assets/"]');
      for(var j=0;j<styled.length;j++){
        var el=styled[j];
        var style=el.getAttribute('style')||'';
        var nextStyle=style.replace(/url\((['\"]?)([^)'\"]+)(['\"]?)\)/g,function(all,q1,url,q2){return 'url('+q1+addParam(url,version)+q2+')'});
        if(nextStyle!==style)el.setAttribute('style',nextStyle);
      }
      try{window.VexaUploadedImages&&window.VexaUploadedImages.reload&&window.VexaUploadedImages.reload()}catch(e){}
      try{window.dispatchEvent(new CustomEvent('vexa-app-cache-version',{detail:{version:version}}))}catch(e){}
    }
    function apply(version,force){
      version=String(version||'');
      if(!version)return;
      var previous=current||localStorage.getItem(storageKey)||'';
      current=version;
      localStorage.setItem(storageKey,version);
      if(force||previous!==version)refreshImages(version);
    }
    function check(){
      fetch('/app/api/app-version',{cache:'no-store'}).then(function(r){return r.json()}).then(function(j){if(j&&j.version)apply(j.version,false)}).catch(function(){});
    }
    window.VexaAppRefresh={check:check,apply:apply,refreshImages:refreshImages};
    var saved=localStorage.getItem(storageKey)||'';
    if(saved)refreshImages(saved);
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',check);else check();
    setInterval(check,30000);
    document.addEventListener('visibilitychange',function(){if(!document.hidden)check()});
  } catch(e) {}
})();
`;

app.get('/app/api/app-version', async (c) => {
  const version = await getAppVersion(c.env);
  return c.json({ ok: true, version }, 200, { 'cache-control': 'no-store' });
});

app.post('/admin/api/force-app-refresh', async (c) => {
  if (!isAdminRequest(c)) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': 'no-store' });
  const version = String(Date.now());
  await c.env.BOT_CACHE.put(APP_CACHE_VERSION_KEY, version);
  return c.json({ ok: true, version }, 200, { 'cache-control': 'no-store' });
});

async function getAppVersion(env: Env): Promise<string> {
  const value = await env.BOT_CACHE.get(APP_CACHE_VERSION_KEY).catch(() => null);
  return value || '1';
}

function adminCookieValue(cookie: string | undefined): string {
  const match = (cookie ?? '').match(/(?:^|;\s*)vexa_admin=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function isAdmin(env: Env, key: string): boolean {
  return Boolean(env.ADMIN_KEY && key && key === env.ADMIN_KEY);
}

function isAdminRequest(c: { env: Env; req: { header: (name: string) => string | undefined } }): boolean {
  return isAdmin(c.env, adminCookieValue(c.req.header('cookie')));
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const response = await app.fetch(request, env, ctx);
    const type = response.headers.get('content-type') || '';
    if (!type.includes('text/html')) return response;
    const html = await response.text();
    const headers = new Headers(response.headers);
    headers.delete('content-length');
    headers.set('cache-control', 'no-store');
    const url = new URL(request.url);
    const scripts = `<script>${CLIENT_REFRESH_SCRIPT}</script>${url.pathname.startsWith('/admin') ? `<script>${ADMIN_REFRESH_SCRIPT}</script>` : ''}`;
    return new Response(html.replace('</body>', `${scripts}</body>`), { status: response.status, headers });
  },
};
