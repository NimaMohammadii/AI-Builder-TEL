import { miniAppHtml as baseMiniAppHtml } from './miniapp-control-v2';

const VEXA_THEME = `
:root{
  --text:#f8f8fb;
  --muted:rgba(248,248,251,.58);
  --line:rgba(255,255,255,.16);
  --panel:rgba(255,255,255,.055);
  --glass:rgba(255,255,255,.075);
  --glass2:rgba(255,255,255,.032);
  --glow:rgba(255,255,255,.34);
  --shadow:rgba(0,0,0,.72);
}
body{
  background:
    radial-gradient(circle at 50% -18%,rgba(255,255,255,.24),rgba(255,255,255,.075) 14%,transparent 34%),
    radial-gradient(circle at 18% 8%,rgba(255,255,255,.10),transparent 24%),
    radial-gradient(circle at 90% 18%,rgba(130,150,180,.12),transparent 28%),
    linear-gradient(180deg,#050506 0%,#010102 58%,#000 100%)!important;
  color:var(--text);
}
body:before{
  content:"";
  position:fixed;
  inset:-20%;
  pointer-events:none;
  background:
    radial-gradient(circle at 50% 0%,rgba(255,255,255,.12),transparent 22%),
    linear-gradient(115deg,transparent 0 44%,rgba(255,255,255,.035) 48%,transparent 54%);
  filter:blur(10px);
  opacity:.72;
}
body:after{
  content:"";
  position:fixed;
  inset:0;
  pointer-events:none;
  background-image:linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.014) 1px,transparent 1px);
  background-size:54px 54px;
  mask-image:radial-gradient(circle at 50% 18%,#000,transparent 72%);
  opacity:.36;
}
.app{position:relative;z-index:1;padding-left:18px!important;padding-right:18px!important}
.top{height:72px!important;margin-bottom:10px!important}
.brand{gap:14px!important}
.logo{
  width:58px!important;height:58px!important;border-radius:24px!important;
  color:#fff!important;background:radial-gradient(circle at 34% 22%,rgba(255,255,255,.98),rgba(255,255,255,.28) 16%,rgba(255,255,255,.06) 37%,rgba(0,0,0,.92) 69%)!important;
  border:1px solid rgba(255,255,255,.28)!important;
  box-shadow:0 0 0 1px rgba(255,255,255,.05) inset,0 0 28px rgba(255,255,255,.22),0 20px 56px rgba(0,0,0,.78)!important;
  font-size:0!important;position:relative;overflow:hidden;
}
.logo:before{content:"";position:absolute;inset:13px 10px 12px;border-radius:999px;background:#030303;border:1px solid rgba(255,255,255,.18);box-shadow:inset 0 1px 10px rgba(255,255,255,.08)}
.logo:after{content:"";position:absolute;width:8px;height:18px;border-radius:999px;background:#fff;left:19px;top:22px;box-shadow:18px 0 0 #fff,0 0 18px rgba(255,255,255,.92),18px 0 18px rgba(255,255,255,.92)}
.brand h1{font-size:21px!important;letter-spacing:-.04em!important;font-weight:850!important}
.brand h1:before{content:"Vexa FLOW";font:inherit}.brand h1{font-size:0!important}.brand h1:before{font-size:21px!important}
.brand p{font-size:12px!important;color:rgba(255,255,255,.48)!important}
.chip,.ghost,.secondary,.danger,.primary,input,select,.tabs,.card,.node-card,.preview-phone,.flow-json,.switch,.stat,.notice,.bot-row{
  backdrop-filter:blur(22px) saturate(150%);
  -webkit-backdrop-filter:blur(22px) saturate(150%);
}
.card{
  border:1px solid rgba(255,255,255,.14)!important;
  background:linear-gradient(180deg,rgba(255,255,255,.105),rgba(255,255,255,.035))!important;
  box-shadow:0 30px 90px rgba(0,0,0,.70),inset 0 1px 0 rgba(255,255,255,.13)!important;
  border-radius:34px!important;
}
.primary{
  background:linear-gradient(180deg,#fff,#d7d7dc)!important;color:#050506!important;
  box-shadow:0 0 24px rgba(255,255,255,.22),inset 0 1px 0 rgba(255,255,255,.9)!important;
}
.secondary,.ghost,.chip,.preview-actions button,.node-buttons span,.node-buttons button{
  background:linear-gradient(180deg,rgba(255,255,255,.105),rgba(255,255,255,.035))!important;
  border:1px solid rgba(255,255,255,.17)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.10),0 10px 28px rgba(0,0,0,.35)!important;
}
input,select{
  background:rgba(0,0,0,.46)!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:20px!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.07)!important;
}
.hero h2,.flow-title h2{
  letter-spacing:-.085em!important;
  text-shadow:0 0 30px rgba(255,255,255,.18);
}
.hero h2{font-size:clamp(45px,12vw,70px)!important}
.hero h2:before{content:"Build bots.\A Like magic.";white-space:pre-line}.hero h2{font-size:0!important;line-height:.9!important}.hero h2:before{font-size:clamp(45px,12vw,70px)!important}
.hero p{font-size:15px!important;color:rgba(255,255,255,.60)!important}
.tabs{
  height:68px!important;border-radius:28px!important;background:rgba(6,6,7,.76)!important;
  border:1px solid rgba(255,255,255,.16)!important;box-shadow:0 -18px 70px rgba(0,0,0,.62),inset 0 1px 0 rgba(255,255,255,.08)!important;
}
.tab{border-radius:22px!important;font-weight:750!important}.tab.active{background:linear-gradient(180deg,#fff,#dcdde2)!important;color:#040405!important;box-shadow:0 0 22px rgba(255,255,255,.20)!important}
.stat,.notice,.bot-row,.node-card,.preview-phone,.flow-json{
  background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.025))!important;
  border:1px solid rgba(255,255,255,.13)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important;
}
.round{background:radial-gradient(circle at 35% 25%,rgba(255,255,255,.9),rgba(255,255,255,.18) 18%,rgba(0,0,0,.88) 68%)!important;border:1px solid rgba(255,255,255,.20)!important;color:#fff!important;box-shadow:0 0 16px rgba(255,255,255,.12)!important}
.switch{background:rgba(7,7,8,.68)!important;border-radius:26px!important}.switch button{border-radius:20px!important}.switch button.active{background:linear-gradient(180deg,#fff,#dadbe0)!important;color:#050506!important}
.chat-bubble{background:linear-gradient(180deg,#fff,#dfe0e5)!important;color:#050506!important;box-shadow:0 0 24px rgba(255,255,255,.14)!important}
.icon-danger{background:rgba(255,255,255,.06)!important;color:#fff!important;border-color:rgba(255,255,255,.18)!important}
.toast{background:rgba(8,8,9,.86)!important;border-color:rgba(255,255,255,.17)!important;backdrop-filter:blur(22px)!important}
`;

export function miniAppHtml(): string {
  return baseMiniAppHtml()
    .replace(/<title>AI Builder TEL<\/title>/g, '<title>Vexa FLOW</title>')
    .replace(/AI Builder TEL/g, 'Vexa FLOW')
    .replace('</style>', VEXA_THEME + '</style>')
    .replace(
      ".chip{height:38px;border-radius:999px;padding:0 12px}",
      ".chip{height:38px;border-radius:999px;padding:0 12px}.icon-danger{width:38px;height:38px;border-radius:999px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#fff;font-size:16px}.flow-tools{display:flex;gap:8px;align-items:center;flex-shrink:0}"
    )
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
