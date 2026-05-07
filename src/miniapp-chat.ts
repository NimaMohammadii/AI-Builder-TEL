import { miniAppHtml as baseMiniAppHtml } from './miniapp-control-v2';
import { VEXA_THEME_CSS } from './vexa-theme';

const TTS_LAYOUT_PATCH_CSS = `
.logo,.logo-img,.top .logo,.avatar{border:0!important;box-shadow:none!important;background:transparent!important;outline:0!important}
.app{padding-bottom:calc(76px + env(safe-area-inset-bottom))!important}
.content{height:calc(100dvh - 68px - 92px - env(safe-area-inset-top) - env(safe-area-inset-bottom))!important}
.tabs{height:58px!important;border-radius:25px!important;padding:6px!important}
.tab{border-radius:20px!important;font-size:14px!important;font-weight:800!important}
.tts-head{align-items:center!important;margin:2px 0 18px!important}
.tts-head h2,.tts-head p{display:none!important}
.credit-pill{height:36px!important;border-radius:999px!important;border:1px solid rgba(255,255,255,.13)!important;background:rgba(255,255,255,.055)!important;color:#fff!important;display:flex!important;align-items:center!important;gap:8px!important;padding:0 11px!important;font-size:13px!important;font-weight:850!important}
.credit-pill img{width:24px!important;height:24px!important;object-fit:contain!important;border:0!important;background:transparent!important;box-shadow:none!important}
.voice-btn{height:36px!important;min-width:104px!important;padding:0 13px!important;font-size:14px!important;gap:8px!important;justify-content:center!important}
.voice-menu{top:44px!important;width:150px!important;max-height:242px!important;border-radius:18px!important;padding:6px!important;transition:opacity .18s ease,transform .18s ease!important}
.voice-menu button{height:32px!important;border-radius:13px!important;font-size:12.5px!important;padding:0 10px!important}
.tts-bottom{gap:8px!important;margin-top:10px!important;padding-bottom:0!important}
.tts-generate{height:44px!important;font-size:14px!important;border-radius:999px!important}
.wave-player{padding:8px 10px!important;border-radius:22px!important}
.wave-play{width:34px!important;height:34px!important}
.wave-svg{height:28px!important}
.tts-status-line{display:none!important}
`;

export function miniAppHtml(): string {
  return baseMiniAppHtml()
    .replace(/AI Builder TEL/g, 'Vexa FLOW')
    .replace('Connect. Monitor. Configure.', 'Build bots. Like magic.')
    .replace('Connect your bot, view results, and manage settings. AI chat runs inside Telegram.', 'A premium AI control center for creating Telegram bots from natural language.')
    .replace('width=device-width,initial-scale=1,viewport-fit=cover', 'width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover')
    .replace('<h1>Vexa FLOW</h1>', '<h1 id="brandTitle">Vexa FLOW</h1>')
    .replace('</style>', VEXA_THEME_CSS + TTS_LAYOUT_PATCH_CSS + '</style>')
    .replace('<div class="tts-head"><div><h2>Text To Speech</h2><p>Write naturally. Choose a voice. Generate audio.</p></div><div id="voiceWrap" class="voice-wrap">', '<div class="tts-head"><div class="credit-pill"><img src="/app/api/credit-icon.png" alt=""/><span id="creditCount">1000</span></div><div id="voiceWrap" class="voice-wrap">')
    .replace('<div class="tts-status-line"><span id="ttsStatus">Ready</span><span id="ttsVoiceValue">Liam</span></div>', '')
    .replace("function show(id){document.querySelectorAll('.view').forEach(function(n){n.classList.remove('active')});var v=q(id);if(v)v.classList.add('active');document.querySelectorAll('.tab').forEach(function(n){n.classList.toggle('active',n.getAttribute('data-view')===id)});loadBots(false)}", "function show(id){document.querySelectorAll('.view').forEach(function(n){n.classList.remove('active')});var v=q(id);if(v)v.classList.add('active');document.querySelectorAll('.tab').forEach(function(n){n.classList.toggle('active',n.getAttribute('data-view')===id)});setText('brandTitle',id==='flow'?'Text To Speech':'Vexa FLOW');loadBots(false)}");
}
