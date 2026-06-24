import { miniAppShellHtml } from '../miniapp/shell';

const STYLE = `<style id="miniappSecondStyle">.content>.view{display:none!important}.content>#predictzone{display:block!important;opacity:1!important;pointer-events:auto!important}.tabs,#rankPill{display:none!important}body{background:#030406!important}.top{background:rgba(3,4,6,.86)!important;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}#brandTitle{font-size:20px!important}</style>`;

const READY_SCRIPT = `<script id="miniappSecondReady">(function(){var tg=window.Telegram&&window.Telegram.WebApp;try{if(tg){tg.ready();tg.expand()}}catch(e){}function boot(){var user=(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user)||{};var uid=String((user&&user.id)||localStorage.getItem('ownerId')||'').trim();if(uid)localStorage.setItem('ownerId',uid);var root=document.getElementById('predictzone');if(root)root.classList.add('active');document.querySelectorAll('.content>.view').forEach(function(view){if(view.id!=='predictzone')view.classList.remove('active')});var title=document.getElementById('brandTitle');if(title)title.textContent='100x';var line=document.getElementById('userLine');if(line)line.textContent=(user&&user.username)?('@'+user.username):'Mini App';var logo=document.querySelector('.brand .logo');if(logo){logo.removeAttribute('src');logo.alt='100x'}if(window.VexaTonBalance&&window.VexaTonBalance.load)window.VexaTonBalance.load()}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();setTimeout(boot,80);setTimeout(boot,320)})();</script>`;

export function miniApp100xHtml(): string {
  return miniAppShellHtml()
    .replace('</head>', `${STYLE}</head>`)
    .replace('<title>Vexa FLOW</title>', '<title>100x</title>')
    .replace('id="brandTitle">Vexa FLOW', 'id="brandTitle">100x')
    .replace('id="userLine">AI Bot Control', 'id="userLine">Mini App')
    .replace('</body>\n</html>', `${READY_SCRIPT}</body>\n</html>`);
}
