import { miniAppHtml as baseMiniAppHtml } from './miniapp-control-v2';
import { VEXA_THEME_CSS } from './vexa-theme';

export function miniAppHtml(): string {
  return baseMiniAppHtml()
    .replace(/AI Builder TEL/g, 'Vexa FLOW')
    .replace('Connect. Monitor. Configure.', 'Build bots. Like magic.')
    .replace('Connect your bot, view results, and manage settings. AI chat runs inside Telegram.', 'A premium AI control center for creating Telegram bots from natural language.')
    .replace('</style>', VEXA_THEME_CSS + '</style>')
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
