export const VEXA_LOCALES = [
  'en', 'fa', 'ru', 'tr', 'ar', 'es', 'pt-BR', 'id', 'hi', 'de', 'fr',
  'it', 'uk', 'pl', 'vi', 'th', 'ko', 'ja', 'ur', 'fil', 'ms', 'zh-Hant',
] as const;

export type VexaLocale = typeof VEXA_LOCALES[number];

export const DEFAULT_VEXA_LOCALE: VexaLocale = 'en';

/**
 * Country is detected from the Mini App's time-zone/IP decision.
 * Countries that are not mapped here intentionally use English.
 */
export const COUNTRY_TO_VEXA_LOCALE: Readonly<Record<string, VexaLocale>> = {
  AF: 'fa', IR: 'fa',
  RU: 'ru', BY: 'ru', KZ: 'ru', KG: 'ru',
  TR: 'tr',
  AE: 'ar', BH: 'ar', DZ: 'ar', EG: 'ar', EH: 'ar', IQ: 'ar', JO: 'ar',
  KW: 'ar', LB: 'ar', LY: 'ar', MA: 'ar', OM: 'ar', PS: 'ar', QA: 'ar',
  SA: 'ar', SD: 'ar', SO: 'ar', SS: 'ar', SY: 'ar', TD: 'ar', TN: 'ar',
  YE: 'ar',
  AR: 'es', BO: 'es', CL: 'es', CO: 'es', CR: 'es', CU: 'es', DO: 'es',
  EC: 'es', ES: 'es', GT: 'es', HN: 'es', MX: 'es', NI: 'es', PA: 'es',
  PE: 'es', PR: 'es', PY: 'es', SV: 'es', UY: 'es', VE: 'es',
  BR: 'pt-BR', PT: 'pt-BR', AO: 'pt-BR', CV: 'pt-BR', GW: 'pt-BR',
  MZ: 'pt-BR', ST: 'pt-BR', TL: 'pt-BR',
  ID: 'id',
  IN: 'hi',
  DE: 'de', AT: 'de',
  FR: 'fr', BE: 'fr', BJ: 'fr', BF: 'fr', CD: 'fr', CI: 'fr', CM: 'fr',
  CG: 'fr', DJ: 'fr', GA: 'fr', GF: 'fr', GN: 'fr', GP: 'fr', HT: 'fr',
  MC: 'fr', MG: 'fr', ML: 'fr', MQ: 'fr', NC: 'fr', NE: 'fr', PF: 'fr',
  RE: 'fr', SN: 'fr', TG: 'fr', YT: 'fr',
  IT: 'it', SM: 'it', VA: 'it',
  UA: 'uk',
  PL: 'pl',
  VN: 'vi',
  TH: 'th',
  KR: 'ko',
  JP: 'ja',
  PK: 'ur',
  PH: 'fil',
  MY: 'ms', BN: 'ms',
  TW: 'zh-Hant', HK: 'zh-Hant', MO: 'zh-Hant',
};

export type VexaText = Readonly<Record<VexaLocale, string>>;

export const SHARE_INVITE_TEXT: VexaText = {
  en: '🎮 𝗖𝗼𝗺𝗲 𝗽𝗹𝗮𝘆 𝗩𝗲𝘅𝗮 𝘄𝗶𝘁𝗵 𝗺𝗲!\n\n𝗢𝗻 𝗩𝗲𝘅𝗮, 𝘆𝗼𝘂 𝗰𝗮𝗻 𝗽𝗹𝗮𝘆 𝗠𝗶𝗻𝗲𝘀, 𝗣𝗹𝗶𝗻𝗸𝗼, 𝗖𝗿𝗮𝘀𝗵, 𝗪𝗵𝗲𝗲𝗹, 𝗗𝗶𝗰𝗲, 𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿, 𝗦𝗹𝗼𝘁, 𝗮𝗻𝗱 𝗚𝗵𝗼𝘀𝘁 𝗥𝘂𝗻 — 𝘁𝗵𝗲𝗻 𝗰𝗼𝗺𝗽𝗲𝘁𝗲 𝘄𝗶𝘁𝗵 𝗼𝘁𝗵𝗲𝗿 𝗽𝗹𝗮𝘆𝗲𝗿𝘀. 🏆\n\n𝗬𝗼𝘂 𝗰𝗮𝗻 𝗮𝗹𝘀𝗼 𝗽𝗿𝗲𝗱𝗶𝗰𝘁 𝘁𝗵𝗲 𝗱𝗶𝗿𝗲𝗰𝘁𝗶𝗼𝗻 𝗼𝗳 𝗕𝗶𝘁𝗰𝗼𝗶𝗻, 𝗴𝗼𝗹𝗱, 𝗮𝗻𝗱 𝗼𝗶𝗹 𝗽𝗿𝗶𝗰𝗲𝘀, 𝗮𝗹𝗼𝗻𝗴 𝘄𝗶𝘁𝗵 𝘁𝗵𝗲 𝗼𝘂𝘁𝗰𝗼𝗺𝗲𝘀 𝗼𝗳 𝗺𝗮𝗷𝗼𝗿 𝘄𝗼𝗿𝗹𝗱 𝗲𝘃𝗲𝗻𝘁𝘀, 𝗮𝗻𝗱 𝗽𝘂𝘁 𝘆𝗼𝘂𝗿 𝘀𝗸𝗶𝗹𝗹𝘀 𝘁𝗼 𝘁𝗵𝗲 𝘁𝗲𝘀𝘁. 🧩\n\n𝗜’𝗺 𝗼𝗻 𝗩𝗲𝘅𝗮 𝘁𝗼𝗼 — 𝗰𝗼𝗺𝗲 𝗽𝗹𝗮𝘆 𝘄𝗶𝘁𝗵 𝗺𝗲 😄',
  fa: '🎮 بیا باهم توی 𝗩𝗲𝘅𝗮 بازی کنیم!\n\nتوی 𝗩𝗲𝘅𝗮 می‌تونی بازی‌هایی مثل 𝗠𝗶𝗻𝗲𝘀، 𝗣𝗹𝗶𝗻𝗸𝗼، 𝗖𝗿𝗮𝘀𝗵، 𝗪𝗵𝗲𝗲𝗹، 𝗗𝗶𝗰𝗲، 𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿، 𝗦𝗹𝗼𝘁 و 𝗚𝗵𝗼𝘀𝘁 𝗥𝘂𝗻 رو تجربه کنی و با بقیه رقابت کنی. 🏆\n\nهمچنین می‌تونی روند قیمت بیت‌کوین، طلا و نفت و نتیجهٔ رویدادهای مهم دنیا رو پیش‌بینی کنی و مهارتت رو به چالش بکشی. 🧩\n\nمن هم داخل 𝗩𝗲𝘅𝗮 هستم؛ بیا باهم بازی کنیم 😄',
  ru: '🎮 Давай играть в 𝗩𝗲𝘅𝗮 вместе!\n\nВ 𝗩𝗲𝘅𝗮 тебя ждут 𝗠𝗶𝗻𝗲𝘀, 𝗣𝗹𝗶𝗻𝗸𝗼, 𝗖𝗿𝗮𝘀𝗵, 𝗪𝗵𝗲𝗲𝗹, 𝗗𝗶𝗰𝗲, 𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿, 𝗦𝗹𝗼𝘁 и 𝗚𝗵𝗼𝘀𝘁 𝗥𝘂𝗻 — соревнуйся с другими игроками. 🏆\n\nТакже можно прогнозировать движение цен биткоина, золота и нефти, а ещё исходы важных мировых событий. Проверь свои навыки! 🧩\n\nЯ тоже в 𝗩𝗲𝘅𝗮 — присоединяйся 😄',
  tr: '🎮 Gel, 𝗩𝗲𝘅𝗮’da birlikte oynayalım!\n\n𝗩𝗲𝘅𝗮’da 𝗠𝗶𝗻𝗲𝘀, 𝗣𝗹𝗶𝗻𝗸𝗼, 𝗖𝗿𝗮𝘀𝗵, 𝗪𝗵𝗲𝗲𝗹, 𝗗𝗶𝗰𝗲, 𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿, 𝗦𝗹𝗼𝘁 ve 𝗚𝗵𝗼𝘀𝘁 𝗥𝘂𝗻 oynayabilir, diğer oyuncularla yarışabilirsin. 🏆\n\nAyrıca Bitcoin, altın ve petrol fiyatlarının yönünü ve önemli dünya olaylarının sonuçlarını tahmin ederek yeteneğini test edebilirsin. 🧩\n\nBen de 𝗩𝗲𝘅𝗮’dayım — katıl 😄',
  ar: '🎮 تعال نلعب معًا في 𝗩𝗲𝘅𝗮!\n\nفي 𝗩𝗲𝘅𝗮 يمكنك تجربة 𝗠𝗶𝗻𝗲𝘀 و𝗣𝗹𝗶𝗻𝗸𝗼 و𝗖𝗿𝗮𝘀𝗵 و𝗪𝗵𝗲𝗲𝗹 و𝗗𝗶𝗰𝗲 و𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿 و𝗦𝗹𝗼𝘁 و𝗚𝗵𝗼𝘀𝘁 𝗥𝘂𝗻 والتنافس مع الآخرين. 🏆\n\nويمكنك أيضًا توقّع اتجاه أسعار بيتكوين والذهب والنفط ونتائج أهم الأحداث العالمية واختبار مهاراتك. 🧩\n\nأنا أيضًا في 𝗩𝗲𝘅𝗮 — انضم إليّ 😄',
  es: '🎮 ¡Ven a jugar 𝗩𝗲𝘅𝗮 conmigo!\n\nEn 𝗩𝗲𝘅𝗮 puedes jugar 𝗠𝗶𝗻𝗲𝘀, 𝗣𝗹𝗶𝗻𝗸𝗼, 𝗖𝗿𝗮𝘀𝗵, 𝗪𝗵𝗲𝗲𝗹, 𝗗𝗶𝗰𝗲, 𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿, 𝗦𝗹𝗼𝘁 y 𝗚𝗵𝗼𝘀𝘁 𝗥𝘂𝗻, y competir con otros jugadores. 🏆\n\nTambién puedes predecir la tendencia de Bitcoin, oro y petróleo, además de los resultados de grandes eventos mundiales, y poner a prueba tus habilidades. 🧩\n\n¡Yo también estoy en 𝗩𝗲𝘅𝗮 — únete! 😄',
  'pt-BR': '🎮 Vem jogar 𝗩𝗲𝘅𝗮 comigo!\n\nNo 𝗩𝗲𝘅𝗮 você pode jogar 𝗠𝗶𝗻𝗲𝘀, 𝗣𝗹𝗶𝗻𝗸𝗼, 𝗖𝗿𝗮𝘀𝗵, 𝗪𝗵𝗲𝗲𝗹, 𝗗𝗶𝗰𝗲, 𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿, 𝗦𝗹𝗼𝘁 e 𝗚𝗵𝗼𝘀𝘁 𝗥𝘂𝗻 e competir com outros jogadores. 🏆\n\nVocê também pode prever a direção dos preços de Bitcoin, ouro e petróleo, além dos resultados de grandes acontecimentos mundiais, e testar suas habilidades. 🧩\n\nEu também estou no 𝗩𝗲𝘅𝗮 — vem jogar! 😄',
  id: '🎮 Yuk, main 𝗩𝗲𝘅𝗮 bareng!\n\nDi 𝗩𝗲𝘅𝗮 kamu bisa memainkan 𝗠𝗶𝗻𝗲𝘀, 𝗣𝗹𝗶𝗻𝗸𝗼, 𝗖𝗿𝗮𝘀𝗵, 𝗪𝗵𝗲𝗲𝗹, 𝗗𝗶𝗰𝗲, 𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿, 𝗦𝗹𝗼𝘁, dan 𝗚𝗵𝗼𝘀𝘁 𝗥𝘂𝗻, lalu bersaing dengan pemain lain. 🏆\n\nKamu juga bisa memprediksi arah harga Bitcoin, emas, dan minyak, serta hasil peristiwa penting dunia untuk menguji kemampuanmu. 🧩\n\nAku juga ada di 𝗩𝗲𝘅𝗮 — ayo bergabung 😄',
  hi: '🎮 आओ, 𝗩𝗲𝘅𝗮 पर साथ खेलें!\n\n𝗩𝗲𝘅𝗮 पर आप 𝗠𝗶𝗻𝗲𝘀, 𝗣𝗹𝗶𝗻𝗸𝗼, 𝗖𝗿𝗮𝘀𝗵, 𝗪𝗵𝗲𝗲𝗹, 𝗗𝗶𝗰𝗲, 𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿, 𝗦𝗹𝗼𝘁 और 𝗚𝗵𝗼𝘀𝘁 𝗥𝘂𝗻 खेल सकते हैं और दूसरे खिलाड़ियों से मुकाबला कर सकते हैं। 🏆\n\nआप बिटकॉइन, सोने और तेल की कीमतों की दिशा और दुनिया की बड़ी घटनाओं के नतीजों का अनुमान लगाकर अपनी क्षमता भी आज़मा सकते हैं। 🧩\n\nमैं भी 𝗩𝗲𝘅𝗮 पर हूँ — जुड़िए 😄',
  de: '🎮 Komm, spiel mit mir bei 𝗩𝗲𝘅𝗮!\n\nBei 𝗩𝗲𝘅𝗮 kannst du 𝗠𝗶𝗻𝗲𝘀, 𝗣𝗹𝗶𝗻𝗸𝗼, 𝗖𝗿𝗮𝘀𝗵, 𝗪𝗵𝗲𝗲𝗹, 𝗗𝗶𝗰𝗲, 𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿, 𝗦𝗹𝗼𝘁 und 𝗚𝗵𝗼𝘀𝘁 𝗥𝘂𝗻 spielen und gegen andere Spieler antreten. 🏆\n\nDu kannst außerdem die Entwicklung von Bitcoin-, Gold- und Ölpreisen sowie die Ergebnisse wichtiger Weltereignisse vorhersagen und dein Können testen. 🧩\n\nIch bin auch bei 𝗩𝗲𝘅𝗮 — komm dazu 😄',
  fr: '🎮 Viens jouer à 𝗩𝗲𝘅𝗮 avec moi !\n\nSur 𝗩𝗲𝘅𝗮, tu peux jouer à 𝗠𝗶𝗻𝗲𝘀, 𝗣𝗹𝗶𝗻𝗸𝗼, 𝗖𝗿𝗮𝘀𝗵, 𝗪𝗵𝗲𝗲𝗹, 𝗗𝗶𝗰𝗲, 𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿, 𝗦𝗹𝗼𝘁 et 𝗚𝗵𝗼𝘀𝘁 𝗥𝘂𝗻, puis rivaliser avec d’autres joueurs. 🏆\n\nTu peux aussi prévoir l’évolution du Bitcoin, de l’or et du pétrole, ainsi que les résultats des grands événements mondiaux, pour tester tes compétences. 🧩\n\nJe suis aussi sur 𝗩𝗲𝘅𝗮 — rejoins-moi 😄',
  it: '🎮 Vieni a giocare a 𝗩𝗲𝘅𝗮 con me!\n\nSu 𝗩𝗲𝘅𝗮 puoi giocare a 𝗠𝗶𝗻𝗲𝘀, 𝗣𝗹𝗶𝗻𝗸𝗼, 𝗖𝗿𝗮𝘀𝗵, 𝗪𝗵𝗲𝗲𝗹, 𝗗𝗶𝗰𝗲, 𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿, 𝗦𝗹𝗼𝘁 e 𝗚𝗵𝗼𝘀𝘁 𝗥𝘂𝗻 e sfidare gli altri giocatori. 🏆\n\nPuoi anche prevedere l’andamento dei prezzi di Bitcoin, oro e petrolio e gli esiti dei principali eventi mondiali, mettendo alla prova le tue abilità. 🧩\n\nCi sono anch’io su 𝗩𝗲𝘅𝗮 — unisciti a me 😄',
  uk: '🎮 Ходімо грати у 𝗩𝗲𝘅𝗮 разом!\n\nУ 𝗩𝗲𝘅𝗮 ти можеш грати в 𝗠𝗶𝗻𝗲𝘀, 𝗣𝗹𝗶𝗻𝗸𝗼, 𝗖𝗿𝗮𝘀𝗵, 𝗪𝗵𝗲𝗲𝗹, 𝗗𝗶𝗰𝗲, 𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿, 𝗦𝗹𝗼𝘁 і 𝗚𝗵𝗼𝘀𝘁 𝗥𝘂𝗻 та змагатися з іншими гравцями. 🏆\n\nТакож можна передбачати рух цін на біткоїн, золото й нафту та результати важливих світових подій — перевір свої навички. 🧩\n\nЯ теж у 𝗩𝗲𝘅𝗮 — приєднуйся 😄',
  pl: '🎮 Chodź, zagrajmy razem w 𝗩𝗲𝘅𝗮!\n\nW 𝗩𝗲𝘅𝗮 możesz grać w 𝗠𝗶𝗻𝗲𝘀, 𝗣𝗹𝗶𝗻𝗸𝗼, 𝗖𝗿𝗮𝘀𝗵, 𝗪𝗵𝗲𝗲𝗹, 𝗗𝗶𝗰𝗲, 𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿, 𝗦𝗹𝗼𝘁 i 𝗚𝗵𝗼𝘀𝘁 𝗥𝘂𝗻 oraz rywalizować z innymi graczami. 🏆\n\nMożesz też przewidywać kierunek cen Bitcoina, złota i ropy oraz wyniki ważnych wydarzeń na świecie i sprawdzić swoje umiejętności. 🧩\n\nJa też jestem w 𝗩𝗲𝘅𝗮 — dołącz 😄',
  vi: '🎮 Vào 𝗩𝗲𝘅𝗮 chơi cùng mình nhé!\n\nTại 𝗩𝗲𝘅𝗮, bạn có thể chơi 𝗠𝗶𝗻𝗲𝘀, 𝗣𝗹𝗶𝗻𝗸𝗼, 𝗖𝗿𝗮𝘀𝗵, 𝗪𝗵𝗲𝗲𝗹, 𝗗𝗶𝗰𝗲, 𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿, 𝗦𝗹𝗼𝘁 và 𝗚𝗵𝗼𝘀𝘁 𝗥𝘂𝗻, rồi cạnh tranh với những người chơi khác. 🏆\n\nBạn cũng có thể dự đoán xu hướng giá Bitcoin, vàng và dầu cùng kết quả các sự kiện lớn trên thế giới để thử sức. 🧩\n\nMình cũng ở 𝗩𝗲𝘅𝗮 — tham gia nhé 😄',
  th: '🎮 มาเล่น 𝗩𝗲𝘅𝗮 ด้วยกัน!\n\nใน 𝗩𝗲𝘅𝗮 คุณสามารถเล่น 𝗠𝗶𝗻𝗲𝘀, 𝗣𝗹𝗶𝗻𝗸𝗼, 𝗖𝗿𝗮𝘀𝗵, 𝗪𝗵𝗲𝗲𝗹, 𝗗𝗶𝗰𝗲, 𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿, 𝗦𝗹𝗼𝘁 และ 𝗚𝗵𝗼𝘀𝘁 𝗥𝘂𝗻 พร้อมแข่งขันกับผู้เล่นคนอื่นได้ 🏆\n\nคุณยังทายทิศทางราคาบิตคอยน์ ทองคำ และน้ำมัน รวมถึงผลของเหตุการณ์สำคัญทั่วโลก เพื่อทดสอบทักษะของคุณได้อีกด้วย 🧩\n\nฉันก็อยู่ใน 𝗩𝗲𝘅𝗮 — มาร่วมเล่นกัน 😄',
  ko: '🎮 𝗩𝗲𝘅𝗮에서 함께 게임해요!\n\n𝗩𝗲𝘅𝗮에서는 𝗠𝗶𝗻𝗲𝘀, 𝗣𝗹𝗶𝗻𝗸𝗼, 𝗖𝗿𝗮𝘀𝗵, 𝗪𝗵𝗲𝗲𝗹, 𝗗𝗶𝗰𝗲, 𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿, 𝗦𝗹𝗼𝘁, 𝗚𝗵𝗼𝘀𝘁 𝗥𝘂𝗻을 즐기고 다른 플레이어와 경쟁할 수 있어요. 🏆\n\n비트코인, 금, 석유 가격의 흐름과 중요한 세계 이벤트의 결과도 예측하며 실력을 시험해 보세요. 🧩\n\n저도 𝗩𝗲𝘅𝗮에 있어요 — 함께해요 😄',
  ja: '🎮 𝗩𝗲𝘅𝗮を一緒にプレイしよう！\n\n𝗩𝗲𝘅𝗮では、𝗠𝗶𝗻𝗲𝘀、𝗣𝗹𝗶𝗻𝗸𝗼、𝗖𝗿𝗮𝘀𝗵、𝗪𝗵𝗲𝗲𝗹、𝗗𝗶𝗰𝗲、𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿、𝗦𝗹𝗼𝘁、𝗚𝗵𝗼𝘀𝘁 𝗥𝘂𝗻を楽しみ、ほかのプレイヤーと競えます。🏆\n\nビットコイン、金、石油の価格の動きや、世界の重要な出来事の結果も予想して腕試しできます。🧩\n\n私も𝗩𝗲𝘅𝗮にいるよ — 一緒に遊ぼう 😄',
  ur: '🎮 آؤ، 𝗩𝗲𝘅𝗮 پر میرے ساتھ کھیلیں!\n\n𝗩𝗲𝘅𝗮 میں آپ 𝗠𝗶𝗻𝗲𝘀، 𝗣𝗹𝗶𝗻𝗸𝗼، 𝗖𝗿𝗮𝘀𝗵، 𝗪𝗵𝗲𝗲𝗹، 𝗗𝗶𝗰𝗲، 𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿، 𝗦𝗹𝗼𝘁 اور 𝗚𝗵𝗼𝘀𝘁 𝗥𝘂𝗻 کھیل سکتے ہیں اور دوسرے کھلاڑیوں سے مقابلہ کر سکتے ہیں۔ 🏆\n\nآپ بٹ کوائن، سونے اور تیل کی قیمتوں کی سمت اور دنیا کے اہم واقعات کے نتائج کی پیش گوئی کر کے اپنی مہارت بھی آزما سکتے ہیں۔ 🧩\n\nمیں بھی 𝗩𝗲𝘅𝗮 میں ہوں — شامل ہوں 😄',
  fil: '🎮 Tara, maglaro tayo sa 𝗩𝗲𝘅𝗮!\n\nSa 𝗩𝗲𝘅𝗮, puwede kang maglaro ng 𝗠𝗶𝗻𝗲𝘀, 𝗣𝗹𝗶𝗻𝗸𝗼, 𝗖𝗿𝗮𝘀𝗵, 𝗪𝗵𝗲𝗲𝗹, 𝗗𝗶𝗰𝗲, 𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿, 𝗦𝗹𝗼𝘁 at 𝗚𝗵𝗼𝘀𝘁 𝗥𝘂𝗻 at makipagkumpitensya sa ibang manlalaro. 🏆\n\nMaaari mo ring hulaan ang galaw ng presyo ng Bitcoin, ginto at langis, pati ang resulta ng mahahalagang pangyayari sa mundo, para subukan ang iyong husay. 🧩\n\nNasa 𝗩𝗲𝘅𝗮 din ako — sumali ka 😄',
  ms: '🎮 Jom bermain 𝗩𝗲𝘅𝗮 bersama saya!\n\nDi 𝗩𝗲𝘅𝗮, anda boleh bermain 𝗠𝗶𝗻𝗲𝘀, 𝗣𝗹𝗶𝗻𝗸𝗼, 𝗖𝗿𝗮𝘀𝗵, 𝗪𝗵𝗲𝗲𝗹, 𝗗𝗶𝗰𝗲, 𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿, 𝗦𝗹𝗼𝘁 dan 𝗚𝗵𝗼𝘀𝘁 𝗥𝘂𝗻 serta bersaing dengan pemain lain. 🏆\n\nAnda juga boleh meramalkan arah harga Bitcoin, emas dan minyak, serta hasil peristiwa penting dunia untuk menguji kemahiran anda. 🧩\n\nSaya juga di 𝗩𝗲𝘅𝗮 — sertai saya 😄',
  'zh-Hant': '🎮 一起來玩 𝗩𝗲𝘅𝗮 吧！\n\n在 𝗩𝗲𝘅𝗮，你可以體驗 𝗠𝗶𝗻𝗲𝘀、𝗣𝗹𝗶𝗻𝗸𝗼、𝗖𝗿𝗮𝘀𝗵、𝗪𝗵𝗲𝗲𝗹、𝗗𝗶𝗰𝗲、𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿、𝗦𝗹𝗼𝘁 和 𝗚𝗵𝗼𝘀𝘁 𝗥𝘂𝗻，並與其他玩家競爭。🏆\n\n你也可以預測比特幣、黃金與石油價格的走勢，以及世界重要事件的結果，挑戰自己的實力。🧩\n\n我也在 𝗩𝗲𝘅𝗮 — 快來一起玩 😄',
};

export const SHARE_INVITE_BUTTON_TEXT: VexaText = {
  en: '🎪 𝗘𝗻𝘁𝗲𝗿 𝗩𝗲𝘅𝗮',
  fa: '🎪 ورود به 𝗩𝗲𝘅𝗮', ru: '🎪 Открыть 𝗩𝗲𝘅𝗮', tr: '🎪 𝗩𝗲𝘅𝗮’ya gir',
  ar: '🎪 دخول 𝗩𝗲𝘅𝗮', es: '🎪 Entrar a 𝗩𝗲𝘅𝗮', 'pt-BR': '🎪 Entrar no 𝗩𝗲𝘅𝗮',
  id: '🎪 Masuk ke 𝗩𝗲𝘅𝗮', hi: '🎪 𝗩𝗲𝘅𝗮 खोलें', de: '🎪 𝗩𝗲𝘅𝗮 öffnen',
  fr: '🎪 Ouvrir 𝗩𝗲𝘅𝗮', it: '🎪 Apri 𝗩𝗲𝘅𝗮', uk: '🎪 Відкрити 𝗩𝗲𝘅𝗮',
  pl: '🎪 Otwórz 𝗩𝗲𝘅𝗮', vi: '🎪 Mở 𝗩𝗲𝘅𝗮', th: '🎪 เปิด 𝗩𝗲𝘅𝗮',
  ko: '🎪 𝗩𝗲𝘅𝗮 열기', ja: '🎪 𝗩𝗲𝘅𝗮を開く', ur: '🎪 𝗩𝗲𝘅𝗮 کھولیں',
  fil: '🎪 Buksan ang 𝗩𝗲𝘅𝗮', ms: '🎪 Buka 𝗩𝗲𝘅𝗮', 'zh-Hant': '🎪 開啟 𝗩𝗲𝘅𝗮',
};

export const SHARE_INVITE_IMAGE_FILE_KEY = 'share-invite:telegram-photo-file-id';
export const VEXA_APP_DEEP_LINK = 'https://t.me/VexaAppBOT?startapp';

export function vexaLocaleForCountry(countryCode: string | null | undefined): VexaLocale {
  return COUNTRY_TO_VEXA_LOCALE[String(countryCode || '').trim().toUpperCase()] || DEFAULT_VEXA_LOCALE;
}

export function vexaTextForCountry(text: VexaText, countryCode: string | null | undefined): string {
  return text[vexaLocaleForCountry(countryCode)] || text[DEFAULT_VEXA_LOCALE];
}
