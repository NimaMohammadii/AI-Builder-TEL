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
    uk:['Отримай 0.05 TON як гарантовану стартову нагороду.','Отримай 20% кешбеку з програшів протягом 24 годин після отримання.','Отримай 0.30 TON як гарантований буст балансу.','Отримай 3 безризикові спроби для вибраних ігор.','Отримай 2 безкоштовні ігри в слоти. Виграш твій, програш не списується.','Відкрий сильніший день нагород з додатковим потенціалом виграшу.','Дійди до останнього дня заради найбільшого тижневого шансу на нагороду.'],
    es:['Reclama 0.05 TON como recompensa inicial garantizada.','Obtén 20% de cashback en pérdidas durante 24 horas después de reclamar.','Reclama 0.30 TON como impulso garantizado de saldo.','Recibe 3 jugadas sin riesgo para juegos seleccionados.','Obtén 2 jugadas gratis en slots. Las ganancias son tuyas y las pérdidas no descuentan saldo.','Desbloquea un día de recompensa más fuerte con potencial extra de ganar.','Llega al último día para la mayor oportunidad de recompensa semanal.'],
    pt:['Receba 0.05 TON como recompensa inicial garantida.','Receba 20% de cashback nas perdas por 24 horas após resgatar.','Receba 0.30 TON como boost garantido de saldo.','Receba 3 jogadas sem risco em jogos selecionados.','Ganhe 2 jogadas grátis em slots. Os ganhos ficam com você e as perdas não descontam saldo.','Desbloqueie um dia de recompensa mais forte com potencial extra de ganho.','Chegue ao último dia para a maior chance de recompensa semanal.'],
    id:['Klaim 0.05 TON sebagai hadiah awal yang dijamin.','Dapatkan cashback 20% dari kekalahan selama 24 jam setelah klaim.','Klaim 0.30 TON sebagai boost saldo yang dijamin.','Dapatkan 3 permainan bebas risiko untuk game pilihan.','Dapatkan 2 permainan slot gratis. Kemenangan tetap milikmu dan kekalahan tidak memotong saldo.','Buka hari hadiah yang lebih kuat dengan potensi menang ekstra.','Capai hari terakhir untuk peluang hadiah mingguan terbesar.']
  };
  var translated=true;
  var imgCache={};
  var regionLang='';
  var regionReady=false;
  var regionPromise=null;
  var lastRefreshAt=0;
  var CACHE_PREFIX='vexa:selectedLanguageCode:';
  function q(id){return document.getElementById(id)}
  function isOpen(){var page=q('dailyrewardsinfo');return !!(page&&page.classList.contains('active'))}
  function currentTgUser(){try{var tg=window.Telegram&&window.Telegram.WebApp;return (tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user)||{}}catch(e){return {}}}
  function userId(){var u=currentTgUser();return String((u&&u.id)||localStorage.getItem('ownerId')||'').trim()}
  function cacheKey(){var id=userId();return CACHE_PREFIX+(id||'guest')}
  function cachedLang(){try{var l=String(localStorage.getItem(cacheKey())||'').trim().toLowerCase();return /^[a-z]{2,3}$/.test(l)?l:''}catch(e){return ''}}
  function saveLang(lang){try{if(/^[a-z]{2,3}$/.test(lang)){localStorage.setItem(cacheKey(),lang);localStorage.removeItem('vexa:selectedLanguageCode')}}catch(e){}}
  function loadRegionLang(force){
    if(regionReady&&!force)return Promise.resolve(regionLang||'en');
    if(regionPromise&&!force)return regionPromise;
    if(force)regionPromise=null;
    var id=userId();
    var url='/app/api/daily-rewards'+(id?'?userId='+encodeURIComponent(id)+'&':'?')+'_localeTs='+Date.now();
    regionPromise=fetch(url,{credentials:'same-origin',cache:'no-store',headers:{'cache-control':'no-store'}}).then(function(r){return r.ok?r.json():null}).then(function(json){
      var lang=String((json&&json.locale&&json.locale.languageCode)||'').trim().toLowerCase();
      if(!/^[a-z]{2,3}$/.test(lang))lang='en';
      regionLang=lang;regionReady=true;saveLang(lang);return regionLang;
    }).catch(function(){regionLang=cachedLang()||'en';regionReady=true;return regionLang});
    return regionPromise;
  }
  function detectedLang(){return regionReady?(regionLang||'en'):(cachedLang()||'en')}
  function esc(v){return String(v||'').replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch})}
  function textFor(i){var l=detectedLang();return translated&&dict[l]&&dict[l][i]?dict[l][i]:items[i].en}
  function img(day){var key=String(day);if(!imgCache[key])imgCache[key]='/app/api/daily-rewards-day-image/'+(day-1);return imgCache[key]}
  function render(){var box=q('dailyInfoList');if(!box)return;box.innerHTML=items.map(function(it,i){return '<div class="daily-info-row '+(i===0?'today':'')+'"><div class="daily-info-img"><img src="'+img(it.day)+'" alt="" decoding="async" loading="lazy" onerror="this.style.display=\\'none\\';this.parentNode.innerHTML=\\'<span>Day '+it.day+'</span>\\'"/></div><div class="daily-info-main"><em class="daily-info-day">Day '+it.day+'</em><b>'+esc(it.title)+'</b><small>'+esc(textFor(i))+'</small></div></div>'}).join('')}
  function refresh(force){var now=Date.now();if(!force&&now-lastRefreshAt<900)return;lastRefreshAt=now;var cached=cachedLang();if(cached&&!regionReady){regionLang=cached;render()}else if(!cached){var box=q('dailyInfoList');if(box&&!regionReady)box.innerHTML=''}regionReady=false;loadRegionLang(true).then(render)}
  function bind(){refresh(true)}
  window.__vexaDailyInfoRender=render;
  window.__vexaDailyInfoRefresh=function(){refresh(true)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
  document.addEventListener('click',function(){setTimeout(function(){if(isOpen())refresh(true)},20)},true);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)refresh(true)});
  window.addEventListener('focus',function(){refresh(true)});
  window.addEventListener('pageshow',function(){refresh(true)});
})();
`;