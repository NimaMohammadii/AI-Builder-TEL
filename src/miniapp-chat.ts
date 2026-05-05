import { miniAppHtml as baseMiniAppHtml } from './miniapp-control-v2';
import { VEXA_THEME_CSS } from './vexa-theme';

const COMPACT_TTS_CSS = `
.tts-head{gap:8px!important;margin-bottom:5px!important}
.tts-head h2{font-size:31px!important;line-height:.88!important;margin:1px 0 4px!important}
.tts-head p{font-size:11px!important;line-height:1.25!important;max-width:260px!important}
.tts-top-tools{display:grid!important;gap:7px!important;justify-items:end!important}
.credit-pill{height:34px!important;border-radius:999px!important;border:1px solid rgba(255,255,255,.13)!important;background:rgba(255,255,255,.055)!important;color:#fff!important;display:flex!important;align-items:center!important;gap:7px!important;padding:0 10px!important;font-size:13px!important;font-weight:850!important;overflow:visible!important}
.credit-pill img{width:24px!important;height:24px!important;border:0!important;border-radius:0!important;object-fit:contain!important;background:none!important;background-color:transparent!important;box-shadow:none!important;display:block!important;padding:0!important;margin:0!important;mix-blend-mode:normal!important;filter:none!important}
.voice-btn{height:38px!important;min-width:104px!important;padding:0 11px!important;font-size:14px!important;gap:8px!important}
.voice-btn svg{width:15px!important;height:15px!important}
.voice-menu{top:43px!important;width:150px!important;max-height:260px!important;padding:5px!important;border-radius:18px!important}
.voice-menu button{height:32px!important;border-radius:13px!important;font-size:12.5px!important;padding:0 10px!important}
.tts-label{font-size:9.5px!important;margin:4px 0 7px!important}
.tts-area textarea{font-size:23px!important;line-height:1.3!important}
.tts-bottom{gap:7px!important;margin-top:6px!important;padding-bottom:0!important;transform:translateY(-10px)!important}
.tts-generate{height:46px!important;font-size:14px!important;box-shadow:0 0 18px rgba(255,255,255,.14)!important}
.wave-player{padding:8px 10px!important;border-radius:22px!important;gap:9px!important}
.wave-play{width:34px!important;height:34px!important;font-size:12px!important}
.wave-svg{height:32px!important}
.wave-svg rect{animation:none!important;opacity:.42!important}
.wave-time{font-size:11px!important}
.tts-status-line{display:none!important}
`;

const PLINKO_CSS = `
.plinko-page{height:100%;display:flex;flex-direction:column;gap:12px;overflow:hidden}
.plinko-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.plinko-head h2{font-size:42px;line-height:.86;letter-spacing:-.08em;margin:2px 0 7px;color:#fff}
.plinko-head p{margin:0;color:var(--muted);font-size:12px;line-height:1.35;max-width:255px}
.plinko-credit{height:36px;border:1px solid rgba(255,255,255,.13);border-radius:999px;background:rgba(255,255,255,.055);display:flex;align-items:center;gap:8px;padding:0 11px;font-weight:900;color:#fff;white-space:nowrap}
.plinko-credit img{width:22px;height:22px;object-fit:contain;background:transparent;border:0;border-radius:0;box-shadow:none}
.plinko-board{position:relative;flex:1;min-height:0;border:1px solid rgba(255,255,255,.10);border-radius:34px;background:radial-gradient(circle at 50% 0%,rgba(255,255,255,.09),rgba(255,255,255,.025) 38%,rgba(255,255,255,.01));overflow:hidden;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)}
.plinko-svg{position:absolute;inset:0;width:100%;height:100%}.peg{fill:#fff;opacity:.42}.slot{fill:rgba(255,255,255,.075);stroke:rgba(255,255,255,.13);stroke-width:1}.slot-text{fill:#fff;font:700 11px Inter,system-ui;opacity:.78;text-anchor:middle}.plinko-ball{fill:#fff;filter:drop-shadow(0 0 18px rgba(255,255,255,.45));transition:transform .8s cubic-bezier(.18,.82,.18,1)}
.plinko-controls{display:grid;grid-template-columns:1fr 1fr;gap:9px}.plinko-chip{border:1px solid rgba(255,255,255,.12);border-radius:22px;background:rgba(255,255,255,.055);padding:11px 12px;color:#fff}.plinko-chip span{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-bottom:5px}.plinko-chip b{font-size:20px;letter-spacing:-.04em}
.plinko-drop{height:50px;border-radius:999px;background:#fff;color:#050505;font-weight:950;font-size:15px;box-shadow:0 0 24px rgba(255,255,255,.16)}
.plinko-result{height:50px;border:1px solid rgba(255,255,255,.12);border-radius:999px;background:rgba(255,255,255,.045);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.72);font-weight:850}
`;

const SETTINGS_SECTION = `<section id="settings" class="view"><section class="card"><div class="pad"><div class="title"><h3>Account</h3><span>Settings</span></div><div class="field"><label>Telegram User ID</label><input id="ownerId"/></div><button class="primary" data-action="save-user">Save User</button></div></section><section class="card"><div class="pad"><div class="title"><h3>Bot Settings</h3><span>Control</span></div><div class="field"><label>Bot</label><select id="botSelect"></select></div><div class="toolbar"><button class="ghost" data-action="publish">Publish</button><button class="ghost" data-action="toggle-pause" id="pauseBtn">Pause</button><button class="danger" data-action="delete">Delete</button></div></div></section></section>`;

const PLINKO_SECTION = `<section id="settings" class="view"><div class="plinko-page"><div class="plinko-head"><div><h2>Plinko</h2><p>Drop the ball, hit the pins, and land on a multiplier.</p></div><div class="plinko-credit"><img src="/app/api/credit-icon.png" alt=""/><span id="plinkoCredits">0</span></div></div><div class="plinko-board"><svg class="plinko-svg" viewBox="0 0 320 430" preserveAspectRatio="none"><g id="plinkoPegs"><circle class="peg" cx="160" cy="64" r="4"/><circle class="peg" cx="128" cy="104" r="4"/><circle class="peg" cx="192" cy="104" r="4"/><circle class="peg" cx="96" cy="144" r="4"/><circle class="peg" cx="160" cy="144" r="4"/><circle class="peg" cx="224" cy="144" r="4"/><circle class="peg" cx="64" cy="184" r="4"/><circle class="peg" cx="128" cy="184" r="4"/><circle class="peg" cx="192" cy="184" r="4"/><circle class="peg" cx="256" cy="184" r="4"/><circle class="peg" cx="96" cy="224" r="4"/><circle class="peg" cx="160" cy="224" r="4"/><circle class="peg" cx="224" cy="224" r="4"/><circle class="peg" cx="64" cy="264" r="4"/><circle class="peg" cx="128" cy="264" r="4"/><circle class="peg" cx="192" cy="264" r="4"/><circle class="peg" cx="256" cy="264" r="4"/></g><g><rect class="slot" x="22" y="356" width="42" height="42" rx="16"/><rect class="slot" x="70" y="356" width="42" height="42" rx="16"/><rect class="slot" x="118" y="356" width="42" height="42" rx="16"/><rect class="slot" x="166" y="356" width="42" height="42" rx="16"/><rect class="slot" x="214" y="356" width="42" height="42" rx="16"/><rect class="slot" x="262" y="356" width="42" height="42" rx="16"/><text class="slot-text" x="43" y="381">0.5x</text><text class="slot-text" x="91" y="381">1x</text><text class="slot-text" x="139" y="381">2x</text><text class="slot-text" x="187" y="381">3x</text><text class="slot-text" x="235" y="381">5x</text><text class="slot-text" x="283" y="381">10x</text></g><circle id="plinkoBall" class="plinko-ball" cx="160" cy="30" r="9"/></svg></div><div class="plinko-controls"><div class="plinko-chip"><span>Bet</span><b id="plinkoBet">1</b></div><div class="plinko-chip"><span>Last win</span><b id="plinkoWin">0</b></div></div><button class="plinko-drop" data-action="drop-plinko">Drop Ball</button><div id="plinkoResult" class="plinko-result">Ready</div></div></section>`;

const PLINKO_JS = `function dropPlinko(){var ball=q('plinkoBall');var result=q('plinkoResult');if(!ball||!result)return;var slots=[0.5,1,2,3,5,10];var xs=[43,91,139,187,235,283];var i=Math.floor(Math.random()*slots.length);var wiggle=(Math.random()>.5?1:-1)*(18+Math.floor(Math.random()*34));ball.style.transition='none';ball.setAttribute('cx','160');ball.setAttribute('cy','30');setTimeout(function(){ball.style.transition='transform .85s cubic-bezier(.18,.82,.18,1)';ball.style.transform='translate('+((xs[i]-160)+wiggle/2)+'px,145px)'},20);setTimeout(function(){ball.style.transform='translate('+(xs[i]-160)+'px,334px)';var win=slots[i];setText('plinkoWin',String(win)+'x');result.textContent='Landed on '+win+'x'},520)}`;

export function miniAppHtml(): string {
  return baseMiniAppHtml()
    .replace(/AI Builder TEL/g, 'Vexa FLOW')
    .replace('Connect. Monitor. Configure.', 'Build bots. Like magic.')
    .replace('Connect your bot, view results, and manage settings. AI chat runs inside Telegram.', 'A premium AI control center for creating Telegram bots from natural language.')
    .replace('</style>', VEXA_THEME_CSS + COMPACT_TTS_CSS + PLINKO_CSS + '</style>')
    .replace(SETTINGS_SECTION, PLINKO_SECTION)
    .replace('<button class="tab" data-view="settings">Settings</button>', '<button class="tab" data-view="settings">Plinko</button>')
    .replace(
      '<div id="voiceWrap" class="voice-wrap"><button class="voice-btn" data-action="toggle-voice">',
      '<div class="tts-top-tools"><div class="credit-pill"><img src="/app/api/credit-icon.png" alt=""/><span id="creditCount">0</span></div><div id="voiceWrap" class="voice-wrap"><button class="voice-btn" data-action="toggle-voice">'
    )
    .replace('</div></div></div><div class="tts-area">', '</div></div></div></div><div class="tts-area">')
    .replace('function playTts(){', PLINKO_JS + 'function playTts(){')
    .replace("if(a==='play-tts')playTts();", "if(a==='play-tts')playTts();if(a==='drop-plinko')dropPlinko();");
}
