import { miniAppShellHtml } from './miniapp/shell';
import { CONNECT_SECTION } from './miniapp/connect';

const CONNECT_ONLY_STYLE = '<style id="builderConnectOnly">.content>.view{display:none!important}.content>#connect{display:block!important}.tabs,#rankPill{display:none!important}</style>';

const CONNECT_READY_SCRIPT = `<script>(function(){var tg=window.Telegram&&window.Telegram.WebApp;function uid(){return localStorage.getItem('ownerId')||String(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user&&tg.initDataUnsafe.user.id||'')}function header(){document.body.classList.add('connect-only');var id=uid();if(id)localStorage.setItem('ownerId',id);var t=document.getElementById('brandTitle');var l=document.getElementById('userLine');var p=document.getElementById('rankPill');var logo=document.querySelector('.brand .logo');var b=document.querySelector('.top-balance-pill');if(t)t.textContent='Connect';if(l)l.textContent=id||'';if(p)p.style.display='none';if(logo){logo.src='https://t.me/i/userpic/320/VexaFlowBOT.jpg';logo.alt='Vexa bot'}if(b){b.style.display='flex';b.setAttribute('data-action','connect-deposit');b.setAttribute('aria-label','Charge TON balance')}}function openDeposit(){var tx=document.getElementById('transactionsSheet');if(tx){tx.classList.remove('open');tx.setAttribute('aria-hidden','true')}document.body.classList.remove('transactions-open');var s=document.getElementById('depositSheet');if(!s)return;document.body.classList.add('deposit-open');s.classList.add('open');s.setAttribute('aria-hidden','false')}document.addEventListener('click',function(e){var b=e.target&&e.target.closest?e.target.closest('.top-balance-pill'):null;if(!b)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();header();openDeposit()},true);function boot(){header();if(window.VexaTonBalance&&window.VexaTonBalance.load)window.VexaTonBalance.load();if(window.VexaLoadBots)window.VexaLoadBots(true);if(window.VexaLoadGroups)window.VexaLoadGroups(true)}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();setTimeout(boot,80);setTimeout(boot,300);setInterval(header,1800)})();</script>`;

export function miniAppHtml(): string {
  const marker = '<div class="content">';
  return miniAppShellHtml()
    .split(marker).join(marker + CONNECT_SECTION)
    .replace('</head>', CONNECT_ONLY_STYLE + '</head>')
    .replace('id="brandTitle">Vexa FLOW', 'id="brandTitle">Connect')
    .replace('id="userLine">AI Bot Control', 'id="userLine">')
    .replace('data-action="open-transactions" aria-label="Open transaction history"', 'data-action="connect-deposit" aria-label="Charge TON balance"')
    .replace('</body></html>', CONNECT_READY_SCRIPT + '</body></html>');
}
