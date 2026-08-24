import type { Env } from './types';

export type LiveActivityKind = 'deposit' | 'win' | 'loss' | 'ticket' | 'winner';

export type LiveActivityInput = {
  kind: LiveActivityKind;
  userId: string;
  amountNano?: number;
  section?: string | null;
  quantity?: number;
  rank?: number;
  key?: string;
  action?: string;
  createdAt?: string;
};

export type LiveActivityEvent = {
  id: string;
  kind: LiveActivityKind;
  displayName: string;
  avatarUrl: string | null;
  action: string;
  section: string | null;
  createdAt: string;
};

type AppUserRow = { first_name: string | null; username: string | null };

const RECENT_KEY = 'live-activity:recent:v1';
const RECENT_LIMIT = 12;

export class LiveActivityRoom {
  private sessions = new Set<WebSocket>();

  constructor(private state: DurableObjectState) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (request.headers.get('Upgrade') === 'websocket' && url.pathname === '/connect') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      server.accept();
      this.sessions.add(server);
      server.addEventListener('close', () => this.sessions.delete(server));
      server.addEventListener('error', () => this.sessions.delete(server));
      const recent = await this.state.storage.get<LiveActivityEvent[]>(RECENT_KEY).catch(() => []);
      safeSend(server, { type: 'live-activity:init', events: Array.isArray(recent) ? recent : [] });
      return new Response(null, { status: 101, webSocket: client });
    }

    if (request.method === 'POST' && url.pathname === '/publish') {
      const event = await request.json().catch(() => null) as LiveActivityEvent | null;
      if (!event?.id) return Response.json({ ok: false }, { status: 400 });
      const recent = await this.state.storage.get<LiveActivityEvent[]>(RECENT_KEY).catch(() => []);
      const current = Array.isArray(recent) ? recent : [];
      if (current.some((item) => item.id === event.id)) return Response.json({ ok: true, duplicate: true });
      const next = [event, ...current].slice(0, RECENT_LIMIT);
      await this.state.storage.put(RECENT_KEY, next);
      const payload = { type: 'live-activity:event', event };
      for (const socket of [...this.sessions]) {
        if (!safeSend(socket, payload)) this.sessions.delete(socket);
      }
      return Response.json({ ok: true });
    }

    return new Response('Not found', { status: 404 });
  }
}

export async function publishLiveActivity(env: Env, input: LiveActivityInput): Promise<void> {
  const userId = cleanUserId(input.userId);
  const event = await buildEvent(env, userId, input);
  const id = env.LIVE_ACTIVITY.idFromName('global');
  await env.LIVE_ACTIVITY.get(id).fetch('https://live-activity/publish', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(event),
  });
}

async function buildEvent(env: Env, userId: string, input: LiveActivityInput): Promise<LiveActivityEvent> {
  const row = await env.DB.prepare('SELECT first_name,username FROM app_users WHERE telegram_user_id=? LIMIT 1')
    .bind(userId)
    .first<AppUserRow>()
    .catch(() => null);
  const username = cleanUsername(row?.username);
  const firstName = cleanName(row?.first_name);
  const suffix = userId.slice(-4);
  const displayName = firstName || (username ? `@${username}` : `Player ${suffix || '—'}`);
  const avatarUrl = username ? `https://t.me/i/userpic/320/${encodeURIComponent(username)}.jpg` : null;
  const createdAt = normalizeDate(input.createdAt);
  return {
    id: activityId(input.kind, userId, input.key, createdAt),
    kind: input.kind,
    displayName,
    avatarUrl,
    action: cleanAction(input.action) || actionFor(input),
    section: cleanSection(input.section),
    createdAt,
  };
}

function actionFor(input: LiveActivityInput): string {
  const amount = Math.abs(Math.floor(Number(input.amountNano) || 0));
  const value = amount > 0 ? formatGram(amount) : '';
  const section = cleanSection(input.section);
  const place = section ? ` · ${sectionLabel(section)}` : '';
  if (input.kind === 'deposit') return value ? `Deposited ${value} GRAM` : 'Made a deposit';
  if (input.kind === 'win') return value ? `Won ${value} GRAM${place}` : `Won a game${place}`;
  if (input.kind === 'loss') return value ? `Lost ${value} GRAM${place}` : `Lost a game${place}`;
  if (input.kind === 'ticket') {
    const quantity = Math.max(1, Math.floor(Number(input.quantity) || 1));
    if (!amount && quantity === 1) return 'Claimed a free ticket';
    return `Bought ${quantity} ticket${quantity === 1 ? '' : 's'}`;
  }
  if (input.kind === 'winner') {
    const rank = Math.max(1, Math.floor(Number(input.rank) || 1));
    return value ? `Lottery winner #${rank} · ${value} GRAM` : `Lottery winner #${rank}`;
  }
  return 'Activity';
}

function activityId(kind: LiveActivityKind, userId: string, key: string | undefined, createdAt: string): string {
  if (key) {
    const stable = `${kind}_${userId}_${key}`.replace(/[^0-9A-Za-z_-]/g, '').slice(0, 110);
    if (stable) return `la_${stable}`;
  }
  return `la_${kind}_${Date.parse(createdAt) || Date.now()}_${randomHex(10)}`;
}

function safeSend(socket: WebSocket, payload: unknown): boolean {
  try { socket.send(JSON.stringify(payload)); return true; } catch { return false; }
}

function formatGram(nano: number): string {
  const value = Math.max(0, Number(nano) || 0) / 1_000_000_000;
  if (value >= 1000) return value.toLocaleString('en-US', { maximumFractionDigits: 1 });
  if (value >= 10) return value.toFixed(1).replace(/\.0$/, '');
  return value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

function sectionLabel(section: string): string {
  return ({ playzone: 'Play Hub', coinflip: 'Pump', ghostrun: 'Ghost Run' } as Record<string, string>)[section]
    || section.charAt(0).toUpperCase() + section.slice(1);
}

function normalizeDate(value: unknown): string {
  const parsed = Date.parse(String(value || ''));
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : new Date().toISOString();
}

function cleanUserId(value: unknown): string {
  const id = String(value || '').replace(/[^0-9A-Za-z_-]/g, '').slice(0, 80);
  if (!id) throw new Error('Missing live activity user');
  return id;
}

function cleanUsername(value: unknown): string {
  return String(value || '').replace(/^@+/, '').replace(/[^0-9A-Za-z_]/g, '').slice(0, 64);
}

function cleanName(value: unknown): string {
  return String(value || '').replace(/[<>]/g, '').trim().slice(0, 48);
}

function cleanAction(value: unknown): string {
  return String(value || '').replace(/[<>]/g, '').trim().slice(0, 120);
}

function cleanSection(value: unknown): string | null {
  const section = String(value || '').toLowerCase().replace(/[^0-9a-z_-]/g, '').slice(0, 32);
  return section || null;
}

function randomHex(length: number): string {
  const bytes = new Uint8Array(Math.ceil(length / 2));
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((value) => value.toString(16).padStart(2, '0')).join('').slice(0, length);
}

export const LIVE_ACTIVITY_CLIENT_SCRIPT = `
<script>
(function(){
  var tg=window.Telegram&&window.Telegram.WebApp;
  var events=[];
  var socket=null;
  var reconnectTimer=0;
  var reconnectAttempt=0;
  var clockTimer=0;
  function q(s,r){return (r||document).querySelector(s)}
  function esc(v){return String(v||'').replace(/[&<>\"]/g,function(c){return c==='&'?'&amp;':c==='<'?'&lt;':c==='>'?'&gt;':'&quot;'})}
  function initials(name){var parts=String(name||'').trim().split(/\\s+/).filter(Boolean);return ((parts[0]&&parts[0][0])||'V')+((parts[1]&&parts[1][0])||'')}
  function relTime(value){var t=Date.parse(String(value||''));if(!Number.isFinite(t))return 'now';var s=Math.max(0,Math.floor((Date.now()-t)/1000));if(s<45)return 'now';if(s<3600)return Math.max(1,Math.floor(s/60))+'m';if(s<86400)return Math.floor(s/3600)+'h';return Math.floor(s/86400)+'d'}
  function style(){
    if(q('#homeLiveActivityStyle'))return;
    var st=document.createElement('style');st.id='homeLiveActivityStyle';st.textContent=[
      '#home .home-ticket-finance-visual{min-height:154px!important;height:100%!important;position:relative!important;display:block!important;pointer-events:none!important;overflow:hidden!important;border-radius:28px!important;padding:10px 10px 9px!important;box-sizing:border-box!important;background:transparent!important;background-color:transparent!important;background-image:none!important;border:0!important;outline:0!important;box-shadow:0 12px 30px rgba(31,1,10,.32),0 0 18px rgba(69,5,26,.15),inset 3px 3px .5px -3.5px rgba(255,255,255,.10),inset -3px -3px .5px -3.5px rgba(156,38,70,.48),inset 1px 1px 1px -.5px rgba(140,29,61,.30),inset -1px -1px 1px -.5px rgba(124,22,53,.24),inset 0 0 6px 6px rgba(255,255,255,.055),inset 0 0 2px 2px rgba(255,255,255,.035)!important;backdrop-filter:blur(22px) saturate(1.40) brightness(1.05) contrast(1.04)!important;-webkit-backdrop-filter:blur(22px) saturate(1.40) brightness(1.05) contrast(1.04)!important;isolation:isolate!important;transform:translateZ(0)!important}',
      '#home .home-ticket-finance-visual:before{content:""!important;position:absolute!important;inset:0!important;border-radius:inherit!important;pointer-events:none!important;background:radial-gradient(118% 76% at 10% -16%,rgba(255,255,255,.10),rgba(255,255,255,.025) 32%,transparent 60%),radial-gradient(88% 72% at 100% 108%,rgba(92,10,35,.13),transparent 64%)!important;z-index:0!important}',
      '.home-live-activity{position:relative!important;z-index:1!important;height:100%!important;display:grid!important;grid-template-rows:24px minmax(0,1fr)!important;gap:5px!important;min-width:0!important}',
      '.home-live-activity-head{display:flex!important;align-items:center!important;justify-content:space-between!important;min-width:0!important;padding:0 2px!important}.home-live-activity-title{display:flex!important;align-items:center!important;gap:6px!important;min-width:0!important;color:#fff!important;font-size:11.5px!important;font-weight:950!important;letter-spacing:-.025em!important;white-space:nowrap!important}.home-live-activity-live{display:flex!important;align-items:center!important;gap:4px!important;color:rgba(255,255,255,.42)!important;font-size:7.5px!important;font-weight:900!important;letter-spacing:.08em!important;text-transform:uppercase!important}.home-live-activity-dot{width:6px!important;height:6px!important;border-radius:50%!important;background:#6f253a!important;box-shadow:0 0 0 0 rgba(255,78,123,0)!important;position:relative!important}.home-live-activity.is-connected .home-live-activity-dot{background:#ff4f78!important;animation:homeLivePulse 1.45s ease-out infinite!important;box-shadow:0 0 10px rgba(255,79,120,.5)!important}@keyframes homeLivePulse{0%{box-shadow:0 0 0 0 rgba(255,79,120,.42)}70%{box-shadow:0 0 0 7px rgba(255,79,120,0)}100%{box-shadow:0 0 0 0 rgba(255,79,120,0)}}',
      '.home-live-activity-list{display:grid!important;align-content:start!important;gap:4px!important;min-height:0!important;overflow:hidden!important}.home-live-activity-row{height:35px!important;border-radius:14px!important;background:rgba(0,0,0,.16)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.055),inset 0 -1px 0 rgba(255,255,255,.025)!important;display:grid!important;grid-template-columns:27px minmax(0,1fr) auto!important;align-items:center!important;gap:6px!important;padding:0 7px 0 5px!important;min-width:0!important}.home-live-activity-row.is-new{animation:homeLiveEnter .46s cubic-bezier(.18,.82,.22,1)!important}@keyframes homeLiveEnter{0%{opacity:0;transform:translateY(-7px) scale(.97)}100%{opacity:1;transform:none}}',
      '.home-live-activity-avatar{width:27px!important;height:27px!important;border-radius:50%!important;overflow:hidden!important;display:grid!important;place-items:center!important;position:relative!important;background:radial-gradient(circle at 32% 24%,rgba(255,255,255,.19),rgba(92,10,35,.42) 48%,rgba(13,4,7,.72) 100%)!important;color:#fff!important;font-size:8.5px!important;font-weight:950!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.12)!important}.home-live-activity-avatar img{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;object-fit:cover!important;display:block!important}.home-live-activity-copy{min-width:0!important;display:grid!important;gap:1px!important}.home-live-activity-name{min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;color:#fff!important;font-size:9.5px!important;font-weight:900!important;line-height:1.08!important}.home-live-activity-action{min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;color:rgba(255,255,255,.50)!important;font-size:8px!important;font-weight:720!important;line-height:1.08!important}.home-live-activity-time{align-self:center!important;color:rgba(255,255,255,.28)!important;font-size:7.5px!important;font-weight:800!important;white-space:nowrap!important;margin-left:2px!important}',
      '.home-live-activity-empty{height:76px!important;display:grid!important;place-items:center!important;text-align:center!important;color:rgba(255,255,255,.34)!important;font-size:9px!important;font-weight:760!important;line-height:1.3!important;padding:0 12px!important}',
      '@media (prefers-reduced-motion:reduce){.home-live-activity-dot,.home-live-activity-row{animation:none!important}}'
    ].join('');document.head.appendChild(st)
  }
  function mount(){
    style();var host=q('#home .home-ticket-finance-visual');if(!host)return false;
    host.removeAttribute('aria-hidden');
    if(!q('.home-live-activity',host))host.innerHTML='<section class="home-live-activity" aria-label="Live Activity"><div class="home-live-activity-head"><div class="home-live-activity-title">Live Activity</div><div class="home-live-activity-live"><i class="home-live-activity-dot"></i><span>Live</span></div></div><div class="home-live-activity-list"></div></section>';
    return true
  }
  function avatar(event){var fallback='<span>'+esc(initials(event.displayName))+'</span>';if(!event.avatarUrl)return '<div class="home-live-activity-avatar">'+fallback+'</div>';return '<div class="home-live-activity-avatar">'+fallback+'<img src="'+esc(event.avatarUrl)+'" alt="" loading="lazy" onerror="this.remove()"></div>'}
  function row(event,isNew){return '<article class="home-live-activity-row'+(isNew?' is-new':'')+'" data-live-activity-id="'+esc(event.id)+'">'+avatar(event)+'<div class="home-live-activity-copy"><div class="home-live-activity-name">'+esc(event.displayName)+'</div><div class="home-live-activity-action">'+esc(event.action)+'</div></div><time class="home-live-activity-time" datetime="'+esc(event.createdAt)+'">'+relTime(event.createdAt)+'</time></article>'}
  function render(animateFirst){if(!mount())return;var list=q('#home .home-live-activity-list');if(!list)return;if(!events.length){list.innerHTML='<div class="home-live-activity-empty">Real activity will appear here live</div>';return}list.innerHTML=events.slice(0,3).map(function(event,index){return row(event,animateFirst&&index===0)}).join('')}
  function setConnected(value){var root=q('#home .home-live-activity');if(root)root.classList.toggle('is-connected',!!value)}
  function applyInit(list){events=(Array.isArray(list)?list:[]).filter(function(x){return x&&x.id}).slice(0,12);render(false)}
  function applyEvent(event){if(!event||!event.id)return;events=[event].concat(events.filter(function(item){return item.id!==event.id})).slice(0,12);render(true)}
  function delay(){return Math.min(30000,900*Math.pow(2,Math.min(reconnectAttempt++,5)))}
  function connect(){
    if(socket||!window.WebSocket)return;
    var initData=String((tg&&tg.initData)||'');if(!initData){setConnected(false);return}
    var proto=location.protocol==='https:'?'wss:':'ws:';
    try{socket=new WebSocket(proto+'//'+location.host+'/app/api/live-activity/ws?initData='+encodeURIComponent(initData));socket.onopen=function(){reconnectAttempt=0;setConnected(true)};socket.onmessage=function(message){try{var data=JSON.parse(message.data);if(data&&data.type==='live-activity:init')applyInit(data.events);else if(data&&data.type==='live-activity:event')applyEvent(data.event)}catch(e){}};socket.onclose=function(){socket=null;setConnected(false);clearTimeout(reconnectTimer);if(!document.hidden)reconnectTimer=setTimeout(connect,delay())};socket.onerror=function(){try{socket&&socket.close()}catch(e){}}}catch(e){socket=null;setConnected(false);clearTimeout(reconnectTimer);reconnectTimer=setTimeout(connect,delay())}
  }
  function refreshTimes(){document.querySelectorAll('#home .home-live-activity-time').forEach(function(el){el.textContent=relTime(el.getAttribute('datetime'))});clearTimeout(clockTimer);clockTimer=setTimeout(refreshTimes,30000)}
  function init(){mount();render(false);connect();refreshTimes()}
  document.addEventListener('visibilitychange',function(){if(document.hidden){clearTimeout(reconnectTimer)}else{if(!socket)connect();refreshTimes()}});
  window.addEventListener('online',function(){if(!socket)connect()});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
</script>
`;
