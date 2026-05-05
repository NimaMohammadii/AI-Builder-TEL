import { miniAppHtml as baseMiniAppHtml } from './miniapp-control-v2';
import { VEXA_THEME_CSS } from './vexa-theme';

const COMPACT_TTS_CSS = `
.tts-head{gap:10px!important;margin-bottom:7px!important}
.tts-head h2{font-size:34px!important;line-height:.88!important;margin:2px 0 5px!important;letter-spacing:-.075em!important}
.tts-head p{font-size:12px!important;line-height:1.3!important}
.voice-btn{height:42px!important;min-width:116px!important;padding:0 13px!important;font-size:15px!important;gap:10px!important}
.voice-btn svg{width:16px!important;height:16px!important}
.voice-menu{top:48px!important;width:158px!important;max-height:282px!important;padding:5px!important;border-radius:20px!important}
.voice-menu button{height:34px!important;border-radius:14px!important;font-size:13px!important;padding:0 11px!important}
.tts-label{font-size:10px!important;margin:5px 0 8px!important}
.tts-area textarea{font-size:24px!important;line-height:1.32!important}
.tts-bottom{gap:8px!important;margin-top:8px!important;padding-bottom:0!important}
.tts-generate{height:52px!important;font-size:15px!important;box-shadow:0 0 22px rgba(255,255,255,.16)!important}
.wave-player{padding:9px 11px!important;border-radius:24px!important;gap:10px!important}
.wave-play{width:36px!important;height:36px!important;font-size:13px!important}
.wave-svg{height:34px!important}
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
      '<button class="chip" data-action="refresh-flow">Refresh</button>',
      '<div class="flow-tools"><button class="icon-danger" data-action="reset-flow" title="Clear flow">🗑</button><button class="chip" data-action="refresh-flow">Refresh</button></div>'
    )
    .replace(
      "async function deleteBot(){if(!selectedBot)return toast('Select a bot first');if(!confirm('Delete this bot?'))return;try{await api('/app/api/bots/'+encodeURIComponent(selectedBot.id),{method:'DELETE'});selectedBot=null;bots=[];await loadBots(true);text('botInfo','Choose a bot.');renderFlowPanel();toast('Bot deleted')}catch(x){toast(x.message)}}function bind()",
      "async function deleteBot(){if(!selectedBot)return toast('Select a bot first');if(!confirm('Delete this bot?'))return;try{await api('/app/api/bots/'+encodeURIComponent(selectedBot.id),{method:'DELETE'});selectedBot=null;bots=[];await loadBots(true);text('botInfo','Choose a bot.');renderFlowPanel();toast('Bot deleted')}catch(x){toast(x.message)}}async function resetFlow(){if(!selectedBot)return toast('Select a bot first');if(!confirm('همه منوها و ساختار ربات پاک شود؟'))return;try{var d=await api('/app/api/bots/'+encodeURIComponent(selectedBot.id)+'/chat',{method:'POST',body:JSON.stringify({instruction:'__RESET_FLOW__'})});selectedBot.flow=d.flow;previewNodeId=(d.flow&&d.flow.start)||'';renderFlowPanel();toast('Flow cleared. Build from scratch.')}catch(x){toast(x.message)}}function bind()"
    )
    .replace(
      "if(a==='delete')deleteBot()",
      "if(a==='delete')deleteBot();if(a==='reset-flow')resetFlow()"
    );
}
