import { ACTIVITY_CORE_SCRIPT } from './activity-core-script';
import { DAILY_REWARDS_SECTION } from './daily-rewards-section';
import { DAILY_REWARDS_STYLES } from './daily-rewards-styles';
import { DAILY_REWARDS_POLISH_STYLES } from './daily-rewards-polish-styles';
import { DAILY_REWARDS_SCRIPT } from './daily-rewards-script';
import { DAILY_REWARDS_INFO_SECTION } from './daily-rewards-info';

const DAILY_REWARDS_BOOTSTRAP = `
(function(){
  window.DAILY_REWARDS_SECTION = ${JSON.stringify(DAILY_REWARDS_SECTION)};
  window.DAILY_REWARDS_INFO_SECTION = ${JSON.stringify(DAILY_REWARDS_INFO_SECTION)};
  var dailyInfoLang='en';
  var dailyInfoLangReady=false;
  var dailyInfoRendered=false;
  var homeScrollTop=0;
  var dailyInfoCloseTimer=null;
  var dailyInfoRows=[
    {title:'TON Starter',en:'Claim 0.05 TON as a guaranteed starter reward.',fa:'دریافت ۰.۰۵ تون به‌عنوان جایزه شروع تضمینی.',de:'Erhalte 0,05 TON als garantierte Starter-Belohnung.',tr:'Garantili başlangıç ödülü olarak 0.05 TON al.',ar:'احصل على 0.05 TON كمكافأة بداية مضمونة.',ru:'Получи 0.05 TON как гарантированную стартовую награду.',es:'Reclama 0.05 TON como recompensa inicial garantizada.'},
    {title:'Loss Cashback',en:'Get 20% cashback on your losses for 24 hours after claiming.',fa:'دریافت ۲۰٪ کش‌بک روی باخت‌ها تا ۲۴ ساعت بعد از کلیم.',de:'Erhalte 20 % Cashback auf Verluste für 24 Stunden nach dem Claim.',tr:'Claim sonrası 24 saat boyunca kayıplarda %20 cashback al.',ar:'احصل على استرداد 20% من الخسائر لمدة 24 ساعة بعد المطالبة.',ru:'Получи 20% кэшбэк с проигрышей на 24 часа после получения.',es:'Obtén 20% de cashback en pérdidas durante 24 horas después de reclamar.'},
    {title:'TON Boost',en:'Claim 0.30 TON as a guaranteed balance boost.',fa:'دریافت ۰.۳۰ تون به‌عنوان بوست تضمینی موجودی.',de:'Erhalte 0,30 TON als garantierten Balance-Boost.',tr:'Garantili bakiye desteği olarak 0.30 TON al.',ar:'احصل على 0.30 TON كتعزيز مضمون للرصيد.',ru:'Получи 0.30 TON как гарантированный буст баланса.',es:'Reclama 0.30 TON como impulso garantizado de saldo.'},
    {title:'Risk Free x3',en:'Receive 3 risk-free plays for selected games.',fa:'دریافت ۳ بازی بدون ریسک برای بازی‌های منتخب.',de:'Erhalte 3 risikofreie Plays für ausgewählte Spiele.',tr:'Seçili oyunlar için 3 risksiz oyun hakkı al.',ar:'احصل على 3 لعبات بدون مخاطر للألعاب المحددة.',ru:'Получи 3 безрисковые игры для выбранных игр.',es:'Recibe 3 jugadas sin riesgo para juegos seleccionados.'},
    {title:'Free Slots',en:'Get 2 free slot plays. Wins stay yours and losses do not deduct balance.',fa:'دریافت ۲ بازی رایگان اسلات؛ برد برای شماست و باخت از موجودی کم نمی‌شود.',de:'Erhalte 2 kostenlose Slot-Plays. Gewinne bleiben dir, Verluste werden nicht abgezogen.',tr:'2 ücretsiz slot hakkı al. Kazançlar sende kalır, kayıplar bakiyeden düşmez.',ar:'احصل على لعبتي سلوت مجانيتين؛ الأرباح لك والخسائر لا تُخصم.',ru:'Получи 2 бесплатные игры в слоты. Выигрыш остается, проигрыш не списывается.',es:'Obtén 2 jugadas gratis en slots. Las ganancias son tuyas y las pérdidas no descuentan saldo.'},
    {title:'Double Win Day',en:'Unlock a stronger reward day with extra winning potential.',fa:'باز شدن روز جایزه قوی‌تر با شانس برد بیشتر.',de:'Schalte einen stärkeren Belohnungstag mit zusätzlichem Gewinnpotenzial frei.',tr:'Daha güçlü bir ödül günü ve ekstra kazanma potansiyeli aç.',ar:'افتح يوم مكافآت أقوى مع فرصة ربح إضافية.',ru:'Открой более сильный день наград с дополнительным потенциалом выигрыша.',es:'Desbloquea un día de recompensa más fuerte con potencial extra de ganar.'},
    {title:'Weekly Mega TON',en:'Reach the final day for the biggest weekly reward chance.',fa:'رسیدن به روز آخر برای بزرگ‌ترین شانس جایزه هفتگی.',de:'Erreiche den letzten Tag für die größte wöchentliche Belohnungschance.',tr:'En büyük haftalık ödül şansı için son güne ulaş.',ar:'صل إلى اليوم الأخير لأكبر فرصة مكافأة أسبوعية.',ru:'Дойди до последнего дня ради крупнейшего недельного шанса на награду.',es:'Llega al último día para la mayor oportunidad de recompensa semanal.'}
  ];
  if(!document.getElementById('dailyRewardsStyles')){
    var style=document.createElement('style');
    style.id='dailyRewardsStyles';
    style.textContent=${JSON.stringify(DAILY_REWARDS_STYLES + '\n' + DAILY_REWARDS_POLISH_STYLES)};
    document.head.appendChild(style);
  }
  function pingBack(){try{window.dispatchEvent(new Event('vexa-daily-info-change'))}catch(e){}}
  function countryToLang(country){country=String(country||'').toUpperCase();if(['IR','AF','TJ'].indexOf(country)>=0)return 'fa';if(['DE','AT','CH','LI'].indexOf(country)>=0)return 'de';if(country==='TR')return 'tr';if(['RU','BY','KZ','KG'].indexOf(country)>=0)return 'ru';if(['AE','SA','QA','KW','BH','OM','IQ','EG','JO','LB','SY','YE'].indexOf(country)>=0)return 'ar';if(['ES','MX','AR','CO','CL','PE','VE','EC','BO','UY','PY','GT','CR','PA','DO'].indexOf(country)>=0)return 'es';return ''}
  function timezoneToLang(){var tz='';try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||''}catch(e){};if(tz.indexOf('Tehran')>=0)return 'fa';if(tz.indexOf('Berlin')>=0||tz.indexOf('Vienna')>=0||tz.indexOf('Zurich')>=0||tz.indexOf('Vaduz')>=0)return 'de';if(tz.indexOf('Istanbul')>=0)return 'tr';if(tz.indexOf('Moscow')>=0||tz.indexOf('Volgograd')>=0||tz.indexOf('Yekaterinburg')>=0||tz.indexOf('Novosibirsk')>=0)return 'ru';if(tz.indexOf('Dubai')>=0||tz.indexOf('Riyadh')>=0||tz.indexOf('Qatar')>=0||tz.indexOf('Kuwait')>=0||tz.indexOf('Bahrain')>=0||tz.indexOf('Muscat')>=0||tz.indexOf('Baghdad')>=0||tz.indexOf('Cairo')>=0)return 'ar';if(tz.indexOf('Madrid')>=0||tz.indexOf('Mexico')>=0||tz.indexOf('Buenos_Aires')>=0||tz.indexOf('Bogota')>=0||tz.indexOf('Santiago')>=0||tz.indexOf('Lima')>=0)return 'es';return ''}
  function langFromTrace(text){var lines=String(text||'').split(String.fromCharCode(10));for(var i=0;i<lines.length;i++){var line=lines[i]||'';if(line.indexOf('loc=')===0)return countryToLang(line.slice(4,6));}return ''}
  function loadDailyInfoLang(){if(dailyInfoLangReady)return Promise.resolve(dailyInfoLang);return fetch('/cdn-cgi/trace',{cache:'no-store'}).then(function(r){return r.ok?r.text():''}).then(function(text){dailyInfoLang=langFromTrace(text)||timezoneToLang()||'en';dailyInfoLangReady=true;return dailyInfoLang;}).catch(function(){dailyInfoLang=timezoneToLang()||'en';dailyInfoLangReady=true;return dailyInfoLang})}
  function mountDailyInfo(){var current=document.getElementById('dailyrewardsinfo');if(current)return current;var main=document.querySelector('main.app')||document.body;var holder=document.createElement('div');holder.innerHTML=window.DAILY_REWARDS_INFO_SECTION||'';var section=holder.firstElementChild;if(section)main.appendChild(section);return section}
  function dailyInfoText(row){var l=dailyInfoLang||'en';return row[l]||row.en}
  function renderDailyInfo(){var box=document.getElementById('dailyInfoList');if(!box)return;box.innerHTML=dailyInfoRows.map(function(row,i){var day=i+1;return '<div class="daily-info-row '+(i===0?'today':'')+'"><div class="daily-info-img"><img src="/app/api/daily-rewards-day-image/'+i+'" alt="" decoding="async" loading="lazy"></div><div class="daily-info-main"><em class="daily-info-day">Day '+day+'</em><b>'+row.title+'</b><small>'+dailyInfoText(row)+'</small></div></div>'}).join('');dailyInfoRendered=true}
  function closeDailyInfo(){var section=document.getElementById('dailyrewardsinfo');if(!section||!section.classList.contains('active'))return false;if(dailyInfoCloseTimer)clearTimeout(dailyInfoCloseTimer);section.classList.add('is-closing');section.classList.remove('active');section.setAttribute('aria-hidden','true');var title=document.getElementById('brandTitle');if(title)title.textContent='Home';document.querySelectorAll('.tab').forEach(function(n){n.classList.toggle('active',n.getAttribute('data-view')==='home')});dailyInfoCloseTimer=setTimeout(function(){section.classList.remove('is-closing');pingBack()},220);pingBack();return true}
  function openDailyInfo(){var section=mountDailyInfo();if(!section)return;if(dailyInfoCloseTimer)clearTimeout(dailyInfoCloseTimer);var home=document.getElementById('home');if(home){homeScrollTop=home.scrollTop||0;home.classList.add('active')}if(!dailyInfoRendered)renderDailyInfo();section.setAttribute('aria-hidden','false');section.classList.remove('active','is-closing');if(home)home.scrollTop=homeScrollTop;requestAnimationFrame(function(){requestAnimationFrame(function(){section.classList.add('active');if(home)home.scrollTop=homeScrollTop;pingBack()})});loadDailyInfoLang().then(function(){renderDailyInfo();if(home)home.scrollTop=homeScrollTop})}
  window.__vexaOpenDailyInfo=openDailyInfo;
  window.__vexaCloseDailyInfo=closeDailyInfo;
  window.__vexaDailyInfoRender=renderDailyInfo;
  document.addEventListener('click',function(ev){var target=ev.target&&ev.target.closest?ev.target.closest('[data-action="open-daily-guide"]'):null;if(!target)return;ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();openDailyInfo()},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){mountDailyInfo();loadDailyInfoLang().then(renderDailyInfo)});else{mountDailyInfo();loadDailyInfoLang().then(renderDailyInfo)}
})();
`;

export const ACTIVITY_SCRIPT = DAILY_REWARDS_BOOTSTRAP + ACTIVITY_CORE_SCRIPT + DAILY_REWARDS_SCRIPT;