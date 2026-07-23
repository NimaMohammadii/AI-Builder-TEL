import app from './index-admin-plinko';
import type { Env } from './types';
import { isAdminSession } from './admin-auth';

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
      block.innerHTML='<h3 style="margin:0 0 8px;font-size:17px">Update app cache version</h3><p class="muted small-text" style="margin:0 0 12px;color:rgba(255,255,255,.62)">Images now use stable URLs and browser cache. Use this only after changing app code, not for normal image loading.</p><button id="vexaForceRefreshBtn" class="primary" type="button">Update cache version</button><p id="vexaForceRefreshStatus" class="status" style="margin:10px 0 0"></p>';
      target.insertBefore(block,target.firstChild);
      var btn=document.getElementById('vexaForceRefreshBtn');
      var status=document.getElementById('vexaForceRefreshStatus');
      if(btn)btn.onclick=function(){
        if(status)status.textContent='Updating app version...';
        btn.disabled=true;
        fetch('/admin/api/force-app-refresh',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({source:'admin-button'})})
          .then(function(r){return r.json().then(function(j){if(!r.ok)throw new Error(j.error||'Update failed');return j})})
          .then(function(j){if(status)status.textContent='Done. New version: '+j.version; try{window.VexaAppRefresh&&window.VexaAppRefresh.apply(j.version,false)}catch(e){}})
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
    function stripCacheParams(url){
      try{
        var u=new URL(url,location.href);
        u.searchParams.delete('av');
        u.searchParams.delete('rt');
        return u.pathname+u.search+u.hash;
      }catch(e){return url}
    }
    function normalizeImages(){
      var imgs=document.querySelectorAll('img[src]');
      for(var i=0;i<imgs.length;i++){
        var img=imgs[i];
        var src=img.getAttribute('src')||'';
        var next=stripCacheParams(src);
        if(next!==src)img.setAttribute('src',next);
      }
    }
    function apply(version){
      version=String(version||'');
      if(version)localStorage.setItem(storageKey,version);
      normalizeImages();
    }
    window.VexaAppRefresh={check:function(){},apply:apply,refreshImages:function(){normalizeImages()}};
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',normalizeImages);else normalizeImages();
  } catch(e) {}
})();
`;

app.get('/app/api/app-version', async (c) => {
  const version = await getAppVersion(c.env);
  return c.json({ ok: true, version }, 200, { 'cache-control': 'public, max-age=3600' });
});

app.post('/admin/api/force-app-refresh', async (c) => {
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': 'no-store' });
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

function isAdmin(env: Env, key: string): Promise<boolean> {
  return Boolean(env.ADMIN_KEY && key && key === env.ADMIN_KEY);
}

async function isAdminRequest(c: { env: Env; req: { header: (name: string) => string | undefined } }): Promise<boolean> {
  return isAdminSession(c.env, c.req.header('cookie'));
}

function cacheStaticImageResponse(request: Request, response: Response): Response {
  const pathname = new URL(request.url).pathname;
  if (!pathname.startsWith('/app/api/section-lock-image/') && pathname !== '/app/api/home-intro-image.png') return response;
  const headers = new Headers(response.headers);
  headers.set('cache-control', 'public, max-age=31536000, immutable');
  headers.delete('pragma');
  headers.delete('expires');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const response = await app.fetch(request, env, ctx);
    const type = response.headers.get('content-type') || '';
    if (!type.includes('text/html')) return cacheStaticImageResponse(request, response);
    const html = await response.text();
    const headers = new Headers(response.headers);
    headers.delete('content-length');
    headers.set('cache-control', 'no-store');
    const url = new URL(request.url);
    const scripts = `<script>${CLIENT_REFRESH_SCRIPT}</script>${url.pathname.startsWith('/admin') ? `<script>${ADMIN_REFRESH_SCRIPT}</script>` : ''}`;
    return new Response(html.replace('</body>', `${scripts}</body>`), { status: response.status, headers });
  },
};