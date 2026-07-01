import app from './index';
import { approveTonWithdrawal, listAdminTonWithdrawals, rejectTonWithdrawal } from './ton-withdrawals';
import { isAdminSession } from './admin-auth';

app.get('/admin/withdrawals', async (c) => {
  if (!(await isAdminRequest(c))) return c.redirect('/admin');
  return new Response(withdrawalsHtml(), { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
});

app.get('/admin/api/ton/withdrawals', async (c) => {
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': 'no-store' });
  try {
    return c.json(await listAdminTonWithdrawals(c.env, c.req.query('status') || 'pending'), 200, { 'cache-control': 'no-store' });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not load withdrawals' }, 400, { 'cache-control': 'no-store' });
  }
});

app.post('/admin/api/ton/withdrawals/:id/approve', async (c) => {
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': 'no-store' });
  try {
    return c.json(await approveTonWithdrawal(c.env, c.req.param('id')), 200, { 'cache-control': 'no-store' });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not approve withdrawal' }, 400, { 'cache-control': 'no-store' });
  }
});

app.post('/admin/api/ton/withdrawals/:id/reject', async (c) => {
  if (!(await isAdminRequest(c))) return c.json({ error: 'Unauthorized. Login again.' }, 401, { 'cache-control': 'no-store' });
  try {
    const body = await c.req.json().catch(() => ({})) as { reason?: unknown };
    return c.json(await rejectTonWithdrawal(c.env, c.req.param('id'), body.reason), 200, { 'cache-control': 'no-store' });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Could not reject withdrawal' }, 400, { 'cache-control': 'no-store' });
  }
});

function withdrawalsHtml(): string {
  return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Vexa Withdrawals</title><style>body{margin:0;background:#050505;color:#fff;font-family:system-ui,-apple-system,Segoe UI,sans-serif;padding:18px}.page{max-width:760px;margin:auto}.top{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:16px}a{color:#fff;text-decoration:none}.btn,button,select{height:38px;border:0;border-radius:999px;background:rgba(255,255,255,.09);color:#fff;padding:0 14px;font-weight:800}button.green{background:linear-gradient(135deg,#1bc477,#6dffad);color:#06130b}button.red{background:rgba(255,78,105,.18);color:#ffbac5}.card{border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);border-radius:24px;padding:14px;margin:10px 0}.row{display:flex;justify-content:space-between;gap:12px}.meta{font-size:12px;color:rgba(255,255,255,.58);word-break:break-all;margin:8px 0;display:grid;gap:5px}.pill{display:inline-block;border-radius:999px;background:rgba(255,255,255,.08);padding:5px 9px;font-size:10px;text-transform:uppercase}.actions{display:flex;gap:8px;flex-wrap:wrap}.status{color:rgba(255,255,255,.58);font-size:12px}.empty{border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:16px;color:rgba(255,255,255,.55)}</style></head><body><main class="page"><div class="top"><div><h1>Withdrawals</h1><p class="status">Approve processes the request through the configured payout endpoint. Reject refunds user balance.</p></div><a class="btn" href="/admin/panel">Panel</a></div><div class="top"><select id="filter"><option value="pending">Pending</option><option value="failed">Failed</option><option value="processing">Processing</option><option value="paid">Paid</option><option value="rejected">Rejected</option><option value="all">All</option></select><button id="refresh">Refresh</button></div><p id="status" class="status"></p><div id="list"><div class="empty">Loading...</div></div></main><script>const list=document.getElementById('list'),statusEl=document.getElementById('status'),filter=document.getElementById('filter');function esc(v){return String(v??'').replace(/[&<>]/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[s]||s))}function ton(nano){const n=Math.abs(Number(nano)||0),w=Math.floor(n/1e9),f=String(n%1e9).padStart(9,'0').replace(/0+$/,'');return(f?w+'.'+f:w)+' TON'}async function api(path,opt){const r=await fetch(path,Object.assign({credentials:'same-origin',headers:{'content-type':'application/json'}},opt||{}));const j=await r.json().catch(()=>({error:'Invalid response'}));if(!r.ok)throw new Error(j.error||'Request failed');return j}function row(w){const st=String(w.status||'pending').toLowerCase(),can=st==='pending'||st==='failed';return'<article class="card"><div class="row"><div><b>'+esc(w.userId)+'</b><br><span class="pill">'+esc(st)+'</span></div><strong>'+ton(w.amountNano)+'</strong></div><div class="meta"><span>Wallet: '+esc(w.walletAddress)+'</span><span>ID: '+esc(w.id)+'</span><span>Created: '+esc(new Date(w.createdAt).toLocaleString())+'</span>'+(w.txHash?'<span>Tx: '+esc(w.txHash)+'</span>':'')+(w.errorMessage?'<span>Error: '+esc(w.errorMessage)+'</span>':'')+'</div><div class="actions">'+(can?'<button class="green" onclick="approve(\\''+esc(w.id)+'\\')">Approve</button><button class="red" onclick="rejectW(\\''+esc(w.id)+'\\')">Reject & Refund</button>':'')+'</div></article>'}async function load(){statusEl.textContent='Loading...';try{const data=await api('/admin/api/ton/withdrawals?status='+encodeURIComponent(filter.value));const rows=data.withdrawals||[];statusEl.textContent='Updated '+new Date().toLocaleTimeString();list.innerHTML=rows.length?rows.map(row).join(''):'<div class="empty">No withdrawals.</div>'}catch(e){statusEl.textContent=e.message;list.innerHTML='<div class="empty">'+esc(e.message)+'</div>'}}async function approve(id){if(!confirm('Approve this withdrawal?'))return;try{await api('/admin/api/ton/withdrawals/'+encodeURIComponent(id)+'/approve',{method:'POST'});load()}catch(e){alert(e.message);load()}}async function rejectW(id){const reason=prompt('Reject reason','Rejected by admin');if(reason===null)return;try{await api('/admin/api/ton/withdrawals/'+encodeURIComponent(id)+'/reject',{method:'POST',body:JSON.stringify({reason})});load()}catch(e){alert(e.message);load()}}document.getElementById('refresh').onclick=load;filter.onchange=load;load();</script></body></html>`;
}

async function isAdminRequest(c: { env: { ADMIN_KEY?: string }; req: { header: (name: string) => string | undefined } }): Promise<boolean> {
  return isAdminSession(c.env, c.req.header('cookie'));
}
