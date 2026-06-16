export const DAILY_REWARDS_INFO_SCRIPT = `
(function(){
  var items=[
    {day:1,title:'TON Starter',en:'Claim 0.05 TON as a guaranteed starter reward.'},
    {day:2,title:'Loss Cashback',en:'Get 20% cashback on your losses for 24 hours after claiming.'},
    {day:3,title:'TON Boost',en:'Claim 0.30 TON as a guaranteed balance boost.'},
    {day:4,title:'Risk Free x3',en:'Receive 3 risk-free plays for selected games.'},
    {day:5,title:'Free Slots',en:'Get 2 free slot plays. Wins stay yours and losses do not deduct balance.'},
    {day:6,title:'Double Win Day',en:'Unlock a stronger reward day with extra winning potential.'},
    {day:7,title:'Weekly Mega TON',en:'Reach the final day for the biggest weekly reward chance.'}
  ];
  var dict={
    fa:['دریافت ۰.۰۵ تون به‌عنوان جایزه شروع تضمینی.','دریافت ۲۰٪ کش‌بک روی باخت‌ها تا ۲۴ ساعت بعد از کلیم.','دریافت ۰.۳۰ تون به‌عنوان بوست تضمینی موجودی.','دریافت ۳ بازی بدون ریسک برای بازی‌های منتخب.','دریافت ۲ بازی رایگان اسلات؛ برد برای شماست و باخت از موجودی کم نمی‌شود.','باز شدن روز جایزه قوی‌تر با شانس برد بیشتر.','رسیدن به روز آخر برای بزرگ‌ترین شانس جایزه هفتگی.'],
    de:['Erhalte 0,05 TON als garantierte Starter-Belohnung.','Erhalte 20 % Cashback auf Verluste für 24 Stunden nach dem Claim.','Erhalte 0,30 TON als garantierten Balance-Boost.','Erhalte 3 risikofreie Plays für ausgewählte Spiele.','Erhalte 2 kostenlose Slot-Plays. Gewinne bleiben dir, Verluste werden nicht abgezogen.','Schalte einen stärkeren Belohnungstag mit zusätzlichem Gewinnpotenzial frei.','Erreiche den letzten Tag für die größte wöchentliche Belohnungschance.'],
    tr:['Garantili başlangıç ödülü olarak 0.05 TON al.','Claim sonrası 24 saat boyunca kayıplarda %20 cashback al.','Garantili bakiye desteği olarak 0.30 TON al.','Seçili oyunlar için 3 risksiz oyun hakkı al.','2 ücretsiz slot hakkı al. Kazançlar sende kalır, kayıplar bakiyeden düşmez.','Daha güçlü bir ödül günü ve ekstra kazanma potansiyeli aç.','En büyük haftalık ödül şansı için son güne ulaş.'],
    ar:['احصل على 0.05 TON كمكافأة بداية مضمونة.','احصل على استرداد 20% من الخسائر لمدة 24 ساعة بعد المطالبة.','احصل على 0.30 TON كتعزيز مضمون للرصيد.','احصل على 3 لعبات بدون مخاطر للألعاب المحددة.','احصل على لعبتي سلوت مجانيتين؛ الأرباح لك والخسائر لا تُخصم.','افتح يوم مكافآت أقوى مع فرصة ربح إضافية.','صل إلى اليوم الأخير لأكبر فرصة مكافأة أسبوعية.'],
    ru:['Получи 0.05 TON как гарантированную стартовую награду.','Получи 20% кэшбэк с проигрышей на 24 часа после получения.','Получи 0.30 TON как гарантированный буст баланса.','Получи 3 безрисковые игры для выбранных игр.','Получи 2 бесплатные игры в слоты. Выигрыш остается, проигрыш не списывается.','Открой более сильный день наград с дополнительным потенциалом выигрыша.','Дойди до последнего дня ради крупнейшего недельного шанса на награду.'],
    es:['Reclama 0.05 TON como recompensa inicial garantizada.','Obtén 20% de cashback en pérdidas durante 24 horas después de reclamar.','Reclama 0.30 TON como impulso garantizado de saldo.','Recibe 3 jugadas sin riesgo para juegos seleccionados.','Obtén 2 jugadas gratis en slots. Las ganancias son tuyas y las pérdidas no descuentan saldo.','Desbloquea un día de recompensa más fuerte con potencial extra de ganar.','Llega al último día para la mayor oportunidad de recompensa semanal.']
  };
  var translated=false;
  var imgCache={};
  function q(id){return document.getElementById(id)}
  function detectedLang(){
    var tg=window.Telegram&&window.Telegram.WebApp;
    var raw=(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user&&tg.initDataUnsafe.user.language_code)||navigator.language||'en';
    var l=String(raw).toLowerCase().split('-')[0];
    if(dict[l])return l;
    var tz='';try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||''}catch(e){}
    if(/Berlin|Vienna|Zurich/i.test(tz))return 'de';
    if(/Tehran/i.test(tz))return 'fa';
    if(/Istanbul/i.test(tz))return 'tr';
    if(/Moscow|Volgograd|Yekaterinburg|Novosibirsk/i.test(tz))return 'ru';
    if(/Dubai|Riyadh|Qatar|Kuwait|Bahrain|Muscat|Baghdad|Cairo/i.test(tz))return 'ar';
    if(/Madrid|Mexico|Buenos_Aires|Bogota|Santiago|Lima/i.test(tz))return 'es';
    return dict[l]?l:'de';
  }
  function esc(v){return String(v||'').replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch})}
  function textFor(i){var l=detectedLang();return translated&&dict[l]&&dict[l][i]?dict[l][i]:items[i].en}
  function img(day){var key=String(day);if(!imgCache[key])imgCache[key]='/app/api/daily-rewards-day-image/'+(day-1);return imgCache[key]}
  function render(){var box=q('dailyInfoList');if(!box)return;box.innerHTML=items.map(function(it,i){return '<div class="daily-info-row '+(i===0?'today':'')+'"><div class="daily-info-img"><img src="'+img(it.day)+'" alt="" decoding="async" loading="lazy" onerror="this.style.display=\\'none\\';this.parentNode.innerHTML=\\'<span>Day '+it.day+'</span>\\'"/></div><div class="daily-info-main"><em class="daily-info-day">Day '+it.day+'</em><b>'+esc(it.title)+'</b><small>'+esc(textFor(i))+'</small></div></div>'}).join('')}
  function bind(){var b=q('dailyInfoTranslate');if(b&&!b.__bound){b.__bound=true;b.onclick=function(){translated=!translated;b.textContent=translated?'English':'Translate';render()}}render()}
  window.__vexaDailyInfoRender=render;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
  document.addEventListener('click',function(){setTimeout(function(){if(q('dailyrewardsinfo')&&q('dailyrewardsinfo').classList.contains('active'))bind()},90)},true);
})();
`;
