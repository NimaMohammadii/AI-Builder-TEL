export const SLOT_SCRIPT = `
(function(){
  var symbols = [
    { id: 'cherry', label: 'Cherry' },
    { id: 'lemon', label: 'Lemon' },
    { id: 'orange', label: 'Orange' },
    { id: 'grape', label: 'Grape' },
    { id: 'watermelon', label: 'Watermelon' },
    { id: 'diamond', label: 'Diamond' },
    { id: 'gold', label: 'Gold Star or Bell' },
    { id: 'lucky7', label: 'Lucky 7' }
  ];
  var reelCount = 3;
  var symbolHeight = 92;
  var restLoop = 6;
  var preparedLoops = 18;
  var maxSpinLoops = 10;
  var totalSpinMs = 7600;
  var reelStopGapMs = 800;
  var soundStopDelayMs = 1000;
  var NANO = 1000000000;
  var amountNano = NANO;
  var extraTurns = 0;
  var activeCostNano = 0;
  var activeFreeTurn = false;
  var spinning = false;
  var currentIndexes = [0, 1, 2];
  var slotSound = null;
  var slotAudioUrl = '';
  var slotAudio = null;
  var slotSoundTimer = null;
  var slotSoundStopTimer = null;
  var slotLiveProfiles = [
    ['AriNova', 'AriPlay', 'AriSpin', 'AriBet', 'AriWin', 'AriMax', 'AriRush', 'AriTon', 'AriLux', 'AriPro'],
    ['MayaStar', 'MayaSpin', 'MayaBet', 'MayaWin', 'MayaLux', 'MayaTon', 'MayaRush', 'MayaPlay', 'MayaPro', 'MayaNova'],
    ['LiaMoon', 'LiaSpin', 'LiaBet', 'LiaWin', 'LiaLux', 'LiaTon', 'LiaRush', 'LiaPlay', 'LiaPro', 'LiaNova'],
    ['NoraWave', 'NoraSpin', 'NoraBet', 'NoraWin', 'NoraLux', 'NoraTon', 'NoraRush', 'NoraPlay', 'NoraPro', 'NoraNova'],
    ['ElinaFox', 'ElinaSpin', 'ElinaBet', 'ElinaWin', 'ElinaLux', 'ElinaTon', 'ElinaRush', 'ElinaPlay', 'ElinaPro', 'ElinaNova'],
    ['RahaQueen', 'RahaSpin', 'RahaBet', 'RahaWin', 'RahaLux', 'RahaTon', 'RahaRush', 'RahaPlay', 'RahaPro', 'RahaNova'],
    ['YaraGold', 'YaraSpin', 'YaraBet', 'YaraWin', 'YaraLux', 'YaraTon', 'YaraRush', 'YaraPlay', 'YaraPro', 'YaraNova'],
    ['KianFlash', 'KianSpin', 'KianBet', 'KianWin', 'KianLux', 'KianRush', 'KianPlay', 'KianPro', 'KianNova'],
    ['ArmanX', 'ArmanSpin', 'ArmanBet', 'ArmanWin', 'ArmanLux', 'ArmanTon', 'ArmanRush', 'ArmanPlay', 'ArmanPro', 'ArmanNova'],
    ['SinaAce', 'SinaSpin', 'SinaBet', 'SinaWin', 'SinaLux', 'SinaTon', 'SinaRush', 'SinaPlay', 'SinaPro', 'SinaNova'],
    ['RayanJet', 'RayanSpin', 'RayanBet', 'RayanWin', 'RayanLux', 'RayanTon', 'RayanRush', 'RayanPlay', 'RayanPro', 'RayanNova'],
    ['ParsaKing', 'ParsaSpin', 'ParsaBet', 'ParsaWin', 'ParsaLux', 'ParsaTon', 'ParsaRush', 'ParsaPlay', 'ParsaPro', 'ParsaNova'],
    ['NikaRose', 'NikaSpin', 'NikaBet', 'NikaWin', 'NikaLux', 'NikaTon', 'NikaRush', 'NikaPlay', 'NikaPro', 'NikaNova'],
    ['AvaCloud', 'AvaSpin', 'AvaBet', 'AvaWin', 'AvaLux', 'AvaTon', 'AvaRush', 'AvaPlay', 'AvaPro', 'AvaNova'],
    ['DariaSun', 'DariaSpin', 'DariaBet', 'DariaWin', 'DariaLux', 'DariaRush', 'DariaPlay', 'DariaPro', 'DariaNova'],
    ['TaraBlue', 'TaraSpin', 'TaraBet', 'TaraWin', 'TaraLux', 'TaraRush', 'TaraPlay', 'TaraPro', 'TaraNova'],
    ['AmirWolf', 'AmirSpin', 'AmirBet', 'AmirWin', 'AmirLux', 'AmirRush', 'AmirPlay', 'AmirPro', 'AmirNova'],
    ['AliTiger', 'AliSpin', 'AliBet', 'AliWin', 'AliLux', 'AliRush', 'AliPlay', 'AliPro', 'AliNova'],
    ['RezaStorm', 'RezaSpin', 'RezaBet', 'RezaWin', 'RezaLux', 'RezaRush', 'RezaPlay', 'RezaPro', 'RezaNova'],
    ['AryaFire', 'AryaSpin', 'AryaBet', 'AryaWin', 'AryaLux', 'AryaRush', 'AryaPlay', 'AryaPro', 'AryaNova'],
    ['ArvinNeo', 'ArvinSpin', 'ArvinBet', 'ArvinWin', 'ArvinLux', 'ArvinRush', 'ArvinPlay', 'ArvinPro', 'ArvinNova'],
    ['SamanSky', 'SamanSpin', 'SamanBet', 'SamanWin', 'SamanLux', 'SamanRush', 'SamanPlay', 'SamanPro', 'SamanNova'],
    ['RadinHero', 'RadinSpin', 'RadinBet', 'RadinWin', 'RadinLux', 'RadinRush', 'RadinPlay', 'RadinPro', 'RadinNova'],
    ['ShayanIce', 'ShayanSpin', 'ShayanBet', 'ShayanWin', 'ShayanLux', 'ShayanRush', 'ShayanPlay', 'ShayanPro', 'ShayanNova'],
    ['MahanBolt', 'MahanSpin', 'MahanBet', 'MahanWin', 'MahanLux', 'MahanRush', 'MahanPlay', 'MahanPro', 'MahanNova'],
    ['NavidAce', 'NavidSpin', 'NavidBet', 'NavidWin', 'NavidLux', 'NavidRush', 'NavidPlay', 'NavidPro', 'NavidNova'],
    ['NimaLuck', 'NimaSpin', 'NimaBet', 'NimaWin', 'NimaLux', 'NimaRush', 'NimaPlay', 'NimaPro', 'NimaNova'],
    ['NikanFox', 'NikanSpin', 'NikanBet', 'NikanWin', 'NikanLux', 'NikanRush', 'NikanPlay', 'NikanPro', 'NikanNova'],
    ['KavehLion', 'KavehSpin', 'KavehBet', 'KavehWin', 'KavehLux', 'KavehRush', 'KavehPlay', 'KavehPro', 'KavehNova'],
    ['SepehrX', 'SepehrSpin', 'SepehrBet', 'SepehrWin', 'SepehrLux', 'SepehrRush', 'SepehrPlay', 'SepehrPro', 'SepehrNova'],
    ['TahaPeak', 'TahaSpin', 'TahaBet', 'TahaWin', 'TahaLux', 'TahaRush', 'TahaPlay', 'TahaPro', 'TahaNova'],
    ['ErfanMax', 'ErfanSpin', 'ErfanBet', 'ErfanWin', 'ErfanLux', 'ErfanRush', 'ErfanPlay', 'ErfanPro', 'ErfanNova'],
    ['AminRock', 'AminSpin', 'AminBet', 'AminWin', 'AminLux', 'AminRush', 'AminPlay', 'AminPro', 'AminNova'],
    ['IlyaRay', 'IlyaSpin', 'IlyaBet', 'IlyaWin', 'IlyaLux', 'IlyaRush', 'IlyaPlay', 'IlyaPro', 'IlyaNova'],
    ['BardiaOne', 'BardiaSpin', 'BardiaBet', 'BardiaWin', 'BardiaLux', 'BardiaRush', 'BardiaPlay', 'BardiaPro', 'BardiaNova'],
    ['HiradMoon', 'HiradSpin', 'HiradBet', 'HiradWin', 'HiradLux', 'HiradRush', 'HiradPlay', 'HiradPro', 'HiradNova'],
    ['OmidLite', 'OmidSpin', 'OmidBet', 'OmidWin', 'OmidLux', 'OmidRush', 'OmidPlay', 'OmidPro', 'OmidNova'],
    ['PouyaGem', 'PouyaSpin', 'PouyaBet', 'PouyaWin', 'PouyaLux', 'PouyaRush', 'PouyaPlay', 'PouyaPro', 'PouyaNova'],
    ['KasraZen', 'KasraSpin', 'KasraBet', 'KasraWin', 'KasraLux', 'KasraRush', 'KasraPlay', 'KasraPro', 'KasraNova'],
    ['AradTime', 'AradSpin', 'AradBet', 'AradWin', 'AradLux', 'AradRush', 'AradPlay', 'AradPro', 'AradNova'],
    ['MehradVip', 'MehradSpin', 'MehradBet', 'MehradWin', 'MehradLux', 'MehradRush', 'MehradPlay', 'MehradPro', 'MehradNova'],
    ['MiraPearl', 'MiraSpin', 'MiraBet', 'MiraWin', 'MiraLux', 'MiraRush', 'MiraPlay', 'MiraPro', 'MiraNova'],
    ['LunaNight', 'LunaSpin', 'LunaBet', 'LunaWin', 'LunaLux', 'LunaRush', 'LunaPlay', 'LunaPro', 'LunaNova'],
    ['VianDream', 'VianSpin', 'VianBet', 'VianWin', 'VianLux', 'VianRush', 'VianPlay', 'VianPro', 'VianNova'],
    ['MinaBloom', 'MinaSpin', 'MinaBet', 'MinaWin', 'MinaLux', 'MinaRush', 'MinaPlay', 'MinaPro', 'MinaNova'],
    ['RoyaMagic', 'RoyaSpin', 'RoyaBet', 'RoyaWin', 'RoyaLux', 'RoyaRush', 'RoyaPlay', 'RoyaPro', 'RoyaNova'],
    ['AylinStar', 'AylinSpin', 'AylinBet', 'AylinWin', 'AylinLux', 'AylinRush', 'AylinPlay', 'AylinPro', 'AylinNova'],
    ['ZaraGlow', 'ZaraSpin', 'ZaraBet', 'ZaraWin', 'ZaraLux', 'ZaraRush', 'ZaraPlay', 'ZaraPro', 'ZaraNova'],
    ['NeginGem', 'NeginSpin', 'NeginBet', 'NeginWin', 'NeginLux', 'NeginRush', 'NeginPlay', 'NeginPro', 'NeginNova'],
    ['DorsaCharm', 'DorsaSpin', 'DorsaBet', 'DorsaWin', 'DorsaLux', 'DorsaRush', 'DorsaPlay', 'DorsaPro', 'DorsaNova'],
  ];
  var slotLiveRows = [];
  var slotLiveTimer = null;
  var slotLiveRendered = '';
  var slotLiveRealProfileIndex = -1;
  var slotLiveEventNonce = 0;

  function q(id){
    return document.getElementById(id);
  }

  function clamp(value, min, max){
    return Math.max(min, Math.min(max, value));
  }

  function toNano(value){
    return Math.max(0, Math.floor((Number(String(value || '').replace(',', '.')) || 0) * NANO));
  }

  function fromNano(value){
    var amount = Math.max(0, Math.floor(Number(value) || 0)) / NANO;
    return amount.toFixed(2);
  }

  function readPointBalance(){
    return window.VexaTonBalance ? Math.max(0, Math.floor(Number(window.VexaTonBalance.read()) || 0)) : 0;
  }

  function addPointDelta(deltaNano){
    var delta = Math.floor(Number(deltaNano) || 0);
    if(window.VexaTonBalance){
      window.VexaTonBalance.add(delta);
      return;
    }
    window.dispatchEvent(new CustomEvent('vexa-ton-balance-game-change', { detail: { deltaNano: delta } }));
  }

  function awardXP(amount, source, metadata){
    if(window.VexaLevel && typeof window.VexaLevel.add === 'function') window.VexaLevel.add(amount, source, metadata || { section: 'slot' });
  }

  function setBrand(title){
    var brand = q('brandTitle');
    if(brand) brand.textContent = title;
  }

  function setResultText(text){
    var node = q('slotResultText');
    if(node) node.textContent = text;
  }

  function setMultiplierText(value){
    var node = q('slotMultiplier');
    if(!node) return;
    node.textContent = Number(value || 0).toFixed(2) + 'x';
  }

  function cleanText(value){
    return String(value == null ? '' : value).replace(/[&<>"']/g, function(ch){
      return ch === '&' ? '&amp;' : ch === '<' ? '&lt;' : ch === '>' ? '&gt;' : ch === '"' ? '&quot;' : '&#39;';
    });
  }


  function slotLiveCleanName(value){
    return String(value == null ? '' : value)
      .replace(/[<>]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 18);
  }

  function slotLiveTelegramUser(){
    try{
      return (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) || null;
    }catch(e){
      return null;
    }
  }

  function slotLiveAccountName(user){
    var first = slotLiveCleanName(user && user.first_name);
    var last = slotLiveCleanName(user && user.last_name);
    var full = slotLiveCleanName([first, last].filter(Boolean).join(' '));
    return full || first || slotLiveCleanName(localStorage.getItem('ownerName') || localStorage.getItem('slotLiveName') || '');
  }

  function slotLiveCurrentUserNames(){
    var base = slotLiveAccountName(slotLiveTelegramUser() || {});
    if(!base) return [];
    try{ localStorage.setItem('slotLiveName', base); }catch(e){}
    return [base];
  }

  function ensureSlotLiveRealProfile(){
    var names = slotLiveCurrentUserNames();
    if(!names.length) return;
    if(slotLiveRealProfileIndex >= 0 && slotLiveProfiles[slotLiveRealProfileIndex]){
      slotLiveProfiles[slotLiveRealProfileIndex] = names;
      return;
    }
    slotLiveProfiles.unshift(names);
    slotLiveRealProfileIndex = 0;
  }

  function slotLiveSymbolFallback(symbol){
    var iconById = { cherry: '🍒', lemon: '🍋', orange: '🍊', grape: '🍇', watermelon: '🍉', diamond: '💎', gold: '⭐', lucky7: '7️⃣' };
    if(!symbol) return '—';
    return iconById[symbol.id] || symbol.label || symbol.id || '—';
  }

  function randomSlotLiveSymbolIndex(seed){
    if(seed == null && window.crypto && window.crypto.getRandomValues){
      var values = new Uint32Array(1);
      window.crypto.getRandomValues(values);
      return values[0] % symbols.length;
    }
    var numericSeed = Number(seed == null ? Date.now() : seed) || 0;
    var x = Math.sin(numericSeed * 9301.77 + 49297.13) * 233280;
    return Math.abs(Math.floor(x)) % symbols.length;
  }

  function slotLiveResult(seed){
    var result = [];
    for(var i = 0; i < reelCount; i++){
    // truncated but full file replacement includes unchanged content? Wait this content is incomplete?
`;}