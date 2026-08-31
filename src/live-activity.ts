import type { Env } from './types';

export type LiveActivityKind = 'deposit' | 'withdraw' | 'ticket';

export type LiveActivityInput = {
  kind: LiveActivityKind;
  userId: string;
  amountNano?: number;
  section?: string | null;
  quantity?: number;
  roundId?: string | null;
  prizePoolNano?: number | null;
  key?: string;
  action?: string;
  createdAt?: string;
};

export type LiveActivityEvent = {
  id: string;
  kind: LiveActivityKind;
  displayName: string;
  action: string;
  amountNano?: number | null;
  section: string | null;
  roundId?: string | null;
  prizePoolNano?: number | null;
  createdAt: string;
};

type AppUserRow = { first_name: string | null; username: string | null };

const RECENT_KEY = 'live-activity:recent:v1';
const RECENT_LIMIT = 30;

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
      const stored = await this.state.storage.get<unknown>(RECENT_KEY).catch(() => []);
      const recent = filterRecentEvents(stored);
      if (Array.isArray(stored) && recent.length !== stored.length) {
        await this.state.storage.put(RECENT_KEY, recent);
      }
      safeSend(server, { type: 'live-activity:init', events: recent });
      return new Response(null, { status: 101, webSocket: client });
    }

    if (request.method === 'POST' && url.pathname === '/publish') {
      const event = await request.json().catch(() => null) as unknown;
      if (!isLiveActivityEvent(event)) return Response.json({ ok: false }, { status: 400 });
      const stored = await this.state.storage.get<unknown>(RECENT_KEY).catch(() => []);
      const current = filterRecentEvents(stored);
      if (current.some((item) => item.id === event.id)) {
        if (Array.isArray(stored) && current.length !== stored.length) await this.state.storage.put(RECENT_KEY, current);
        return Response.json({ ok: true, duplicate: true });
      }
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
  const createdAt = normalizeDate(input.createdAt);
  return {
    id: activityId(input.kind, userId, input.key, createdAt),
    kind: input.kind,
    displayName,
    action: cleanAction(input.action) || actionFor(input),
    amountNano: cleanOptionalNano(input.amountNano),
    section: cleanSection(input.section),
    roundId: cleanRoundId(input.roundId),
    prizePoolNano: cleanOptionalNano(input.prizePoolNano),
    createdAt,
  };
}

function actionFor(input: LiveActivityInput): string {
  const amount = Math.abs(Math.floor(Number(input.amountNano) || 0));
  if (input.kind === 'deposit') return 'Deposited';
  if (input.kind === 'withdraw') return 'Requested a withdrawal';
  const quantity = Math.max(1, Math.floor(Number(input.quantity) || 1));
  if (!amount && quantity === 1) return 'Claimed a free ticket';
  return `Bought ${quantity} ticket${quantity === 1 ? '' : 's'}`;
}

function isLiveActivityKind(value: unknown): value is LiveActivityKind {
  return value === 'deposit' || value === 'withdraw' || value === 'ticket';
}

function isLiveActivityEvent(value: unknown): value is LiveActivityEvent {
  if (!value || typeof value !== 'object') return false;
  const event = value as Partial<LiveActivityEvent>;
  return Boolean(String(event.id || '').trim()) && isLiveActivityKind(event.kind);
}

function filterRecentEvents(value: unknown): LiveActivityEvent[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isLiveActivityEvent).slice(0, RECENT_LIMIT);
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

function cleanRoundId(value: unknown): string | null {
  const roundId = String(value || '').replace(/[^0-9A-Za-z_-]/g, '').slice(0, 96);
  return roundId || null;
}

function cleanOptionalNano(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const amount = Math.floor(Number(value));
  return Number.isSafeInteger(amount) && amount >= 0 ? amount : null;
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
  var heightObserver=null;
  var observedTicket=null;
  function q(s,r){return (r||document).querySelector(s)}
  function esc(v){return String(v||'').replace(/[&<>\"]/g,function(c){return c==='&'?'&amp;':c==='<'?'&lt;':c==='>'?'&gt;':'&quot;'})}
  function allowed(event){return !!event&&!!event.id&&(event.kind==='deposit'||event.kind==='withdraw'||event.kind==='ticket')}
  function gram(nano){var value=Math.max(0,Number(nano)||0)/1000000000;if(value>=1000)return value.toLocaleString('en-US',{maximumFractionDigits:1});if(value>=10)return value.toFixed(1).replace(/\\.0$/,'');return value.toFixed(2).replace(/0+$/,'').replace(/\\.$/,'')}
  function lowerFirst(value){var text=String(value||'').trim();return text?text.charAt(0).toLowerCase()+text.slice(1):''}
  function amountText(event){var raw=event&&event.amountNano;if(raw!==null&&raw!==undefined&&Number.isFinite(Number(raw))){var amount=Math.max(0,Number(raw)||0);if(amount===0&&event.kind==='ticket')return 'FREE';return gram(amount)}var action=String(event&&event.action||'');var match=action.match(/(\\d[\\d,.]*)\\s*GRAM/i);if(match)return match[1];if(event&&event.kind==='ticket'&&/free ticket/i.test(action))return 'FREE';return '0'}
  function sentence(event){var name=String(event&&event.displayName||'Player').trim()||'Player',amount=amountText(event),action=lowerFirst(event&&event.action);if(event.kind==='deposit')return name+' deposited '+amount+' GRAM';if(event.kind==='withdraw')return name+' requested a withdrawal of '+amount+' GRAM';if(event.kind==='ticket'){if(amount==='FREE')return name+' '+(action||'claimed a free ticket');return name+' '+(action||'bought a ticket')+' for '+amount+' GRAM'}return ''}
  function style(){
    if(q('#homeLiveActivityStyle'))return;
    var st=document.createElement('style');st.id='homeLiveActivityStyle';st.textContent=[
      '#home .home-ticket-finance-visual.home-ticket-card{min-height:154px!important;height:var(--home-live-activity-height,154px)!important;align-self:start!important;place-items:stretch!important;pointer-events:auto!important;overflow:hidden!important}',
      '#home .home-ticket-finance-visual.home-ticket-card>.home-live-activity{width:100%!important;height:100%!important;min-height:0!important;display:grid!important;grid-template-rows:minmax(0,1fr)!important;gap:0!important;align-content:stretch!important;min-width:0!important}',
      '.home-live-activity-list{position:relative!important;display:grid!important;grid-auto-rows:32px!important;align-content:start!important;gap:5px!important;min-height:0!important;height:100%!important;overflow-y:auto!important;overflow-x:hidden!important;padding:0!important;box-sizing:border-box!important;background:transparent!important;box-shadow:none!important;scrollbar-width:none!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior:contain!important;touch-action:pan-y!important;mask-image:none!important;-webkit-mask-image:none!important}.home-live-activity-list::-webkit-scrollbar{display:none!important}.home-live-activity-list.has-overflow:not(.is-scrolled){mask-image:linear-gradient(to bottom,#000 0,#000 calc(100% - 10px),transparent 100%)!important;-webkit-mask-image:linear-gradient(to bottom,#000 0,#000 calc(100% - 10px),transparent 100%)!important}.home-live-activity-list.has-overflow.is-scrolled:not(.is-at-bottom){mask-image:linear-gradient(to bottom,transparent 0,#000 10px,#000 calc(100% - 10px),transparent 100%)!important;-webkit-mask-image:linear-gradient(to bottom,transparent 0,#000 10px,#000 calc(100% - 10px),transparent 100%)!important}.home-live-activity-list.has-overflow.is-at-bottom{mask-image:linear-gradient(to bottom,transparent 0,#000 10px,#000 100%)!important;-webkit-mask-image:linear-gradient(to bottom,transparent 0,#000 10px,#000 100%)!important}',
      '.home-live-activity-row{position:relative!important;overflow:hidden!important;height:32px!important;min-height:32px!important;border:0!important;outline:0!important;border-radius:18px!important;background:rgba(0,0,0,.22)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.06),inset 0 -1px 0 rgba(255,255,255,.04)!important;display:flex!important;align-items:center!important;padding:0 10px!important;box-sizing:border-box!important}.home-live-activity-row.is-new{animation:homeLiveEnter .46s cubic-bezier(.18,.82,.22,1)!important}.home-live-activity-row.is-shifting{animation:homeLiveShift .46s cubic-bezier(.18,.82,.22,1)!important}@keyframes homeLiveEnter{0%{opacity:0;transform:translateY(-12px) scale(.97)}100%{opacity:1;transform:none}}@keyframes homeLiveShift{0%{transform:translateY(-7px)}100%{transform:none}}',
      '.home-live-activity-copy{min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;color:#fff!important;font-size:9px!important;line-height:1!important;font-weight:900!important;letter-spacing:-.01em!important}.home-live-activity-row.kind-deposit{box-shadow:inset 0 1px 0 rgba(196,255,217,.13),inset 0 -1px 0 rgba(31,122,70,.12)!important}.home-live-activity-row.kind-deposit .home-live-activity-copy{color:transparent!important;background:linear-gradient(180deg,#effff3 0%,#9be9b7 25%,#3a9a62 58%,#c4f6d1 100%)!important;-webkit-background-clip:text!important;background-clip:text!important;text-shadow:0 1px 0 rgba(207,255,222,.08),0 2px 4px rgba(0,0,0,.34)!important}.home-live-activity-row.kind-withdraw{box-shadow:inset 0 1px 0 rgba(255,214,221,.12),inset 0 -1px 0 rgba(112,24,45,.13)!important}.home-live-activity-row.kind-withdraw .home-live-activity-copy{color:transparent!important;background:linear-gradient(180deg,#ffe9ed 0%,#dc8293 24%,#8f2941 58%,#efacb9 100%)!important;-webkit-background-clip:text!important;background-clip:text!important;text-shadow:0 1px 0 rgba(255,220,226,.08),0 2px 4px rgba(0,0,0,.36)!important}',
      '.home-live-activity-empty{height:100%!important;display:grid!important;place-items:center!important;text-align:center!important;color:rgba(255,255,255,.34)!important;font-size:9px!important;font-weight:760!important;line-height:1.3!important;padding:0 12px!important}',
      '@media (prefers-reduced-motion:reduce){.home-live-activity-row{animation:none!important}}'
    ].join('');document.head.appendChild(st)
  }
  function syncHeight(){var host=q('#home .home-ticket-finance-visual'),ticket=q('#home .home-ticket-layout>.home-ticket-card:not(.home-ticket-finance-visual)');if(!host||!ticket)return;var h=Math.ceil(ticket.getBoundingClientRect().height||0);if(h>0)host.style.setProperty('--home-live-activity-height',Math.max(154,h)+'px')}
  function watchHeight(){var ticket=q('#home .home-ticket-layout>.home-ticket-card:not(.home-ticket-finance-visual)');if(!ticket)return;if(observedTicket===ticket){syncHeight();return}if(heightObserver){heightObserver.disconnect();heightObserver=null}observedTicket=ticket;syncHeight();if(window.ResizeObserver){heightObserver=new ResizeObserver(function(){syncHeight()});heightObserver.observe(ticket)}}
  function updateFade(){var list=q('#home .home-live-activity-list');if(!list)return;var max=Math.max(0,list.scrollHeight-list.clientHeight);var overflow=max>2;list.classList.toggle('has-overflow',overflow);list.classList.toggle('is-scrolled',overflow&&list.scrollTop>2);list.classList.toggle('is-at-bottom',overflow&&list.scrollTop>=max-2)}
  function mount(){
    style();var host=q('#home .home-ticket-finance-visual');if(!host)return false;
    host.removeAttribute('aria-hidden');host.classList.add('home-ticket-card');
    if(!q('.home-live-activity',host))host.innerHTML='<section class="home-live-activity" aria-label="Recent activity"><div class="home-live-activity-list"></div></section>';
    var list=q('.home-live-activity-list',host);if(list&&list.dataset.scrollBound!=='1'){list.dataset.scrollBound='1';list.addEventListener('scroll',updateFade,{passive:true})}
    watchHeight();
    return true
  }
  function row(event,isNew,isShifting){return '<article class="home-live-activity-row kind-'+esc(event.kind)+(isNew?' is-new':'')+(isShifting?' is-shifting':'')+'" data-live-activity-id="'+esc(event.id)+'"><div class="home-live-activity-copy">'+esc(sentence(event))+'</div></article>'}
  function render(animateFirst){if(!mount())return;var list=q('#home .home-live-activity-list');if(!list)return;var oldTop=Math.max(0,Number(list.scrollTop)||0);var first=list.querySelector('.home-live-activity-row');var shift=first?first.getBoundingClientRect().height+5:0;var preserve=animateFirst&&oldTop>8;if(!events.length){list.innerHTML='<div class="home-live-activity-empty">Recent activity will appear here</div>';updateFade();return}list.innerHTML=events.map(function(event,index){return row(event,animateFirst&&index===0,animateFirst&&index>0)}).join('');if(preserve)list.scrollTop=oldTop+shift;else if(animateFirst)list.scrollTop=0;(window.requestAnimationFrame||function(cb){return setTimeout(cb,0)})(updateFade)}
  function applyInit(list){events=(Array.isArray(list)?list:[]).filter(allowed).slice(0,30);render(false)}
  function broadcast(event){try{window.dispatchEvent(new CustomEvent('vexa:live-activity',{detail:event}))}catch(e){}}
  function applyEvent(event){if(!allowed(event))return;events=[event].concat(events.filter(function(item){return item.id!==event.id})).slice(0,30);render(true);broadcast(event)}
  function delay(){return Math.min(30000,900*Math.pow(2,Math.min(reconnectAttempt++,5)))}
  function connect(){
    if(socket||!window.WebSocket)return;
    var initData=String((tg&&tg.initData)||'');if(!initData)return
    var proto=location.protocol==='https:'?'wss:':'ws:';
    try{socket=new WebSocket(proto+'//'+location.host+'/app/api/live-activity/ws?initData='+encodeURIComponent(initData));socket.onopen=function(){reconnectAttempt=0};socket.onmessage=function(message){try{var data=JSON.parse(message.data);if(data&&data.type==='live-activity:init')applyInit(data.events);else if(data&&data.type==='live-activity:event')applyEvent(data.event)}catch(e){}};socket.onclose=function(){socket=null;clearTimeout(reconnectTimer);if(!document.hidden)reconnectTimer=setTimeout(connect,delay())};socket.onerror=function(){try{socket&&socket.close()}catch(e){}}}catch(e){socket=null;clearTimeout(reconnectTimer);reconnectTimer=setTimeout(connect,delay())}
  }
  function init(){mount();render(false);connect()}
  document.addEventListener('visibilitychange',function(){if(document.hidden){clearTimeout(reconnectTimer)}else{if(!socket)connect();syncHeight();updateFade()}});
  window.addEventListener('online',function(){if(!socket)connect()});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
</script>
`;
