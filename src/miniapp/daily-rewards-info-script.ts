export const DAILY_REWARDS_INFO_SCRIPT = `
(function(){
  var items=[
    {day:1,title:'TON Starter',en:'0.05 TON instant gift.'},
    {day:2,title:'Cashback',en:'20% loss cashback.'},
    {day:3,title:'TON Boost',en:'0.30 TON balance boost.'},
    {day:4,title:'Risk Free',en:'3 protected plays.'},
    {day:5,title:'Free Slots',en:'2 slot plays on us.'},
    {day:6,title:'Double Win',en:'Extra win power.'},
    {day:7,title:'Mega TON',en:'The biggest weekly gift.'}
  ];
  var dict={
    fa:['۰.۰۵ تون هدیه فوری.','۲۰٪ کش‌بک باخت.','۰.۳۰ تون بوست موجودی.','۳ بازی بدون ریسک.','۲ اسلات رایگان.','قدرت برد بیشتر.','بزرگ‌ترین هدیه هفته.'],
    de:['Erhalte 0,05 TON als garantierte Starter-Belohnung.','Erhalte 20 % Cashback auf Verluste für 24 Stunden nach dem Claim.','Erhalte 0,30 TON als garantierten Balance-Boost.','Erhalte 3 risikofreie Plays für ausgewählte Spiele.','Erhalte 2 kostenlose Slot-Plays. Gewinne bleiben dir, Verluste werden nicht abgezogen.','Schalte einen stärkeren Belohnungstag mit zusätzlichem Gewinnpotenzial frei.','Erreiche den letzten Tag für die größte wöchentliche Belohnungschance.'],
    tr:['Garantili başlangıç ödülü olarak 0.05 TON al.','Claim sonrası 24 saat boyunca kayıplarda %20 cashback al.','Garantili bakiye desteği olarak 0.30 TON al.','Seçili oyunlar için 3 risksiz oyun hakkı al.','2 ücretsiz slot hakkı al. Kazançlar sende kalır, kayıplar bakiyeden düşmez.','Daha güçlü bir ödül günü ve ekstra kazanma potansiyeli aç.','En büyük haftalık ödül şansı için son güne ulaş.'],
    ar:['احصل على 0.05 TON كمكافأة بداية مضمونة.','احصل على استرداد 20% من الخسائر لمدة 24 ساعة بعد المطالبة.','احصل على 0.30 TON كتعزيز مضمون للرصيد.','احصل على 3 لعبات بدون مخاطر للألعاب المحددة.','احصل على لعبتي سلوت مجانيتين؛ الأرباح لك والخسائر لا تُخصم.','افتح يوم مكافآت أقوى مع فرصة ربح إضافية.','صل إلى اليوم الأخير لأكبر فرصة مكافأة أسبوعية.'],
    ru:['Получи 0.05 TON как гарантированную стартовую награду.','Получи 20% кэшбэк с проигрышей на 24 часа после получения.','Получи 0.30 TON как гарантированный буст баланса.','Получи 3 безрисковые игры для выбранных игр.','Получи 2 бесплатные игры в слоты. Выигрыш остается, проигрыш не списывается.','Открой более сильный день наград с дополнительным потенциалом выигрыша.','Дойди до последнего дня ради крупнейшего недельного шанса на награду.'],
    uk:['Отримай 0.05 TON як гарантовану стартову нагороду.','Отримай 20% кешбеку з програшів протягом 24 годин після отримання.','Отримай 0.30 TON як гарантований буст балансу.','Отримай 3 безризикові спроби для вибраних ігор.','Отримай 2 безкоштовні ігри в слоти. Виграш твій, програш не списується.','Відкрий сильніший день нагород з додатковим потенціалом виграшу.','Дійди до останнього дня заради найбільшого тижневого шансу на нагороду.'],
    es:['Reclama 0.05 TON como recompensa inicial garantizada.','Obtén 20% de cashback en pérdidas durante 24 horas después de reclamar.','Reclama 0.30 TON como impulso garantizado de saldo.','Recibe 3 jugadas sin riesgo para juegos seleccionados.','Obtén 2 jugadas gratis en slots. Las ganancias son tuyas y las pérdidas no descuentan saldo.','Desbloquea un día de recompensa más fuerte con potencial extra de ganar.','Llega al último día para la mayor oportunidad de recompensa semanal.'],
    pt:['Receba 0.05 TON como recompensa inicial garantida.','Receba 20% de cashback nas perdas por 24 horas após resgatar.','Receba 0.30 TON como boost garantido de saldo.','Receba 3 jogadas sem risco em jogos selecionados.','Ganhe 2 jogadas grátis em slots. Os ganhos ficam com você e as perdas não descontam saldo.','Desbloqueie um dia de recompensa mais forte com potencial extra de ganho.','Chegue ao último dia para a maior chance de recompensa semanal.'],
    id:['Klaim 0.05 TON sebagai hadiah awal yang dijamin.','Dapatkan cashback 20% dari kekalahan selama 24 jam setelah klaim.','Klaim 0.30 TON sebagai boost saldo yang dijamin.','Dapatkan 3 permainan bebas risiko untuk game pilihan.','Dapatkan 2 permainan slot gratis. Kemenangan tetap milikmu dan kekalahan tidak memotong saldo.','Buka hari hadiah yang lebih kuat dengan potensi menang ekstra.','Capai hari terakhir untuk peluang hadiah mingguan terbesar.'],
    zh:['领取 0.05 TON 作为保证的新手奖励。','领取后 24 小时内获得亏损 20% 返现。','领取 0.30 TON 作为保证余额加成。','获得 3 次指定游戏无风险机会。','获得 2 次免费老虎机机会。赢了归你，输了不扣余额。','解锁更强奖励日，获得额外获胜潜力。','到达最后一天，获得本周最大奖励机会。'],
    ja:['保証されたスターター報酬として 0.05 TON を受け取る。','受け取り後24時間、損失の20%キャッシュバックを獲得。','保証された残高ブーストとして 0.30 TON を受け取る。','対象ゲームで3回のリスクフリープレイを獲得。','スロットの無料プレイを2回獲得。勝ちは自分のもの、負けても残高は減りません。','より強い報酬デーを解放し、追加の勝利チャンスを得る。','最終日に到達して、週間最大の報酬チャンスを獲得。'],
    ko:['보장된 시작 보상으로 0.05 TON을 받으세요.','클레임 후 24시간 동안 손실의 20% 캐시백을 받으세요.','보장된 잔액 부스트로 0.30 TON을 받으세요.','선택된 게임에서 3번의 무위험 플레이를 받으세요.','무료 슬롯 플레이 2회를 받으세요. 승리는 당신의 것이며 패배는 잔액에서 차감되지 않습니다.','추가 승리 가능성이 있는 더 강한 보상일을 잠금 해제하세요.','마지막 날에 도달해 주간 최대 보상 기회를 얻으세요.']
  };
  var translated=true;
  var imgCache={};
  var regionLang='en';
  var regionPromise=null;
  var lastRefreshAt=0;
  function q(id){return document.getElementById(id)}
  function isOpen(){var page=q('dailyrewardsinfo');return !!(page&&page.classList.contains('active'))}
  function currentTgUser(){try{var tg=window.Telegram&&window.Telegram.WebApp;return (tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user)||{}}catch(e){return {}}}
  function userId(){var u=currentTgUser();return String((u&&u.id)||localStorage.getItem('ownerId')||'').trim()}
  function loadRegionLang(){
    if(regionPromise)return regionPromise;
    var id=userId();
    var url='/app/api/daily-rewards'+(id?'?userId='+encodeURIComponent(id)+'&':'?')+'_localeTs='+Date.now();
    regionPromise=fetch(url,{credentials:'same-origin',cache:'no-store',headers:{'cache-control':'no-store','pragma':'no-cache'}}).then(function(r){return r.ok?r.json():null}).then(function(json){
      var locale=json&&json.locale?json.locale:{};
      var lang=String(locale.languageCode||'').trim().toLowerCase();
      if(!/^[a-z]{2,3}$/.test(lang))lang='en';
      regionLang=lang;
      try{window.__vexaCurrentRegionCode=String(locale.regionCode||'');window.__vexaCurrentLanguageCode=lang}catch(e){}
      return lang;
    }).catch(function(){regionLang='en';return regionLang}).then(function(lang){regionPromise=null;return lang});
    return regionPromise;
  }
  function esc(v){return String(v||'').replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch})}
  function textFor(i){var l=regionLang||'en';return translated&&dict[l]&&dict[l][i]?dict[l][i]:items[i].en}
  function img(day){var key=String(day);if(!imgCache[key])imgCache[key]='/app/api/daily-rewards-day-image/'+(day-1);return imgCache[key]}
  function render(){var box=q('dailyInfoList');if(!box)return;box.innerHTML=items.map(function(it,i){return '<div class="daily-info-row '+(i===0?'today':'')+'"><div class="daily-info-img"><img src="'+img(it.day)+'" alt="" decoding="async" loading="lazy" onerror="this.style.display=\\'none\\';this.parentNode.innerHTML=\\'<span>Day '+it.day+'</span>\\'"/></div><div class="daily-info-main"><em class="daily-info-day">Day '+it.day+'</em><b>'+esc(it.title)+'</b><small>'+esc(textFor(i))+'</small></div></div>'}).join('')}
  function refresh(force){var now=Date.now();if(!force&&now-lastRefreshAt<900)return;lastRefreshAt=now;var box=q('dailyInfoList');if(box)box.innerHTML='';loadRegionLang().then(render)}
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