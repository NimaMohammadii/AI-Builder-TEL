import { miniAppHtml as baseMiniAppHtml } from './miniapp-control-v2';
import { VEXA_THEME_CSS } from './vexa-theme';

const COMPACT_TTS_CSS = `
.tts-head{gap:8px!important;margin-bottom:5px!important}
.tts-head h2{font-size:31px!important;line-height:.88!important;margin:1px 0 4px!important}
.tts-head p{font-size:11px!important;line-height:1.25!important;max-width:260px!important}
.tts-top-tools{display:grid!important;gap:7px!important;justify-items:end!important}
.credit-pill{height:34px!important;border-radius:999px!important;border:1px solid rgba(255,255,255,.13)!important;background:rgba(255,255,255,.055)!important;color:#fff!important;display:flex!important;align-items:center!important;gap:7px!important;padding:0 10px!important;font-size:13px!important;font-weight:850!important}
.credit-pill img{width:19px!important;height:19px!important;border-radius:50%!important;object-fit:cover!important}
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

export function miniAppHtml(): string {
  return baseMiniAppHtml()
    .replace(/AI Builder TEL/g, 'Vexa FLOW')
    .replace('Connect. Monitor. Configure.', 'Build bots. Like magic.')
    .replace('Connect your bot, view results, and manage settings. AI chat runs inside Telegram.', 'A premium AI control center for creating Telegram bots from natural language.')
    .replace('</style>', VEXA_THEME_CSS + COMPACT_TTS_CSS + '</style>')
    .replace(
      '<div id="voiceWrap" class="voice-wrap"><button class="voice-btn" data-action="toggle-voice">',
      '<div class="tts-top-tools"><div class="credit-pill"><img src="/app/api/credit-icon.png" alt=""/><span id="creditCount">0</span></div><div id="voiceWrap" class="voice-wrap"><button class="voice-btn" data-action="toggle-voice">'
    )
    .replace('</div></div></div><div class="tts-area">', '</div></div></div></div><div class="tts-area">');
}
