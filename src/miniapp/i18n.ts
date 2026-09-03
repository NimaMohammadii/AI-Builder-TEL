export const VEXA_LOCALES = [
  'en', 'fa', 'ru', 'tr', 'ar', 'es', 'pt-BR', 'id', 'hi', 'de', 'fr',
  'it', 'uk', 'pl', 'vi', 'th', 'ko', 'ja', 'ur', 'fil', 'ms', 'zh-Hant',
] as const;

export type VexaLocale = typeof VEXA_LOCALES[number];

export const DEFAULT_VEXA_LOCALE: VexaLocale = 'en';

export const VEXA_LOCALE_LABELS: Readonly<Record<VexaLocale, string>> = {
  en: 'English', fa: 'فارسی', ru: 'Русский', tr: 'Türkçe', ar: 'العربية',
  es: 'Español', 'pt-BR': 'Português (Brasil)', id: 'Bahasa Indonesia', hi: 'हिन्दी',
  de: 'Deutsch', fr: 'Français', it: 'Italiano', uk: 'Українська', pl: 'Polski',
  vi: 'Tiếng Việt', th: 'ไทย', ko: '한국어', ja: '日本語', ur: 'اردو',
  fil: 'Filipino', ms: 'Bahasa Melayu', 'zh-Hant': '繁體中文',
};

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

export type LotteryHomeText = Readonly<{
  previousWinners: string;
  lottery: string;
  drawAt: string;
  prizeSplit: string;
  howItWorks: string;
  threeWinners: string;
  ticketNote: string;
  waitingForDraw: string;
  noResults: string;
  player: string;
}>;

/** Copy used by the single Lucky Zone Lottery implementation. */
export const LOTTERY_HOME_TEXT: Readonly<Record<VexaLocale, LotteryHomeText>> = {
  en: { previousWinners: 'Previous winners', lottery: 'Lottery', drawAt: 'Next draw', prizeSplit: 'Prize split', howItWorks: 'How it works', threeWinners: 'Three unique winners share the full prize pool.', ticketNote: 'Every ticket joins the next draw.', waitingForDraw: 'Waiting for draw', noResults: 'No results this round', player: 'Player' },
  fa: { previousWinners: 'برنده‌های قبلی', lottery: 'لاتاری', drawAt: 'قرعه‌کشی بعدی', prizeSplit: 'تقسیم جایزه', howItWorks: 'نحوهٔ لاتاری', threeWinners: 'سه برندهٔ متفاوت، کل Prize Pool را تقسیم می‌کنند.', ticketNote: 'هر تیکت وارد قرعه‌کشی بعدی می‌شود.', waitingForDraw: 'در انتظار قرعه‌کشی', noResults: 'برای این دور نتیجه‌ای نیست', player: 'بازیکن' },
  ru: { previousWinners: 'Предыдущие победители', lottery: 'Лотерея', drawAt: 'Следующий розыгрыш', prizeSplit: 'Распределение призов', howItWorks: 'Как это работает', threeWinners: 'Три разных победителя делят весь призовой фонд.', ticketNote: 'Каждый билет участвует в следующем розыгрыше.', waitingForDraw: 'Ожидание розыгрыша', noResults: 'В этом раунде нет результатов', player: 'Игрок' },
  tr: { previousWinners: 'Önceki kazananlar', lottery: 'Çekiliş', drawAt: 'Sonraki çekiliş', prizeSplit: 'Ödül dağılımı', howItWorks: 'Nasıl çalışır', threeWinners: 'Üç farklı kazanan tüm ödül havuzunu paylaşır.', ticketNote: 'Her bilet sonraki çekilişe katılır.', waitingForDraw: 'Çekiliş bekleniyor', noResults: 'Bu turda sonuç yok', player: 'Oyuncu' },
  ar: { previousWinners: 'الفائزون السابقون', lottery: 'السحب', drawAt: 'السحب التالي', prizeSplit: 'توزيع الجوائز', howItWorks: 'كيف يعمل', threeWinners: 'ثلاثة فائزين مختلفين يتقاسمون كامل الجائزة.', ticketNote: 'كل تذكرة تدخل السحب التالي.', waitingForDraw: 'بانتظار السحب', noResults: 'لا نتائج لهذه الجولة', player: 'لاعب' },
  es: { previousWinners: 'Ganadores anteriores', lottery: 'Sorteo', drawAt: 'Próximo sorteo', prizeSplit: 'Reparto de premios', howItWorks: 'Cómo funciona', threeWinners: 'Tres ganadores distintos comparten todo el premio.', ticketNote: 'Cada boleto participa en el próximo sorteo.', waitingForDraw: 'Esperando el sorteo', noResults: 'Sin resultados en esta ronda', player: 'Jugador' },
  'pt-BR': { previousWinners: 'Vencedores anteriores', lottery: 'Sorteio', drawAt: 'Próximo sorteio', prizeSplit: 'Divisão do prêmio', howItWorks: 'Como funciona', threeWinners: 'Três vencedores diferentes dividem todo o prêmio.', ticketNote: 'Cada bilhete participa do próximo sorteio.', waitingForDraw: 'Aguardando sorteio', noResults: 'Sem resultados nesta rodada', player: 'Jogador' },
  id: { previousWinners: 'Pemenang sebelumnya', lottery: 'Undian', drawAt: 'Undian berikutnya', prizeSplit: 'Pembagian hadiah', howItWorks: 'Cara kerja', threeWinners: 'Tiga pemenang berbeda berbagi seluruh hadiah.', ticketNote: 'Setiap tiket masuk ke undian berikutnya.', waitingForDraw: 'Menunggu undian', noResults: 'Belum ada hasil ronde ini', player: 'Pemain' },
  hi: { previousWinners: 'पिछले विजेता', lottery: 'लॉटरी', drawAt: 'अगला ड्रॉ', prizeSplit: 'इनाम का बंटवारा', howItWorks: 'यह कैसे काम करता है', threeWinners: 'तीन अलग विजेता पूरा प्राइज़ पूल बाँटते हैं।', ticketNote: 'हर टिकट अगले ड्रॉ में शामिल होता है।', waitingForDraw: 'ड्रॉ की प्रतीक्षा है', noResults: 'इस राउंड का कोई परिणाम नहीं', player: 'खिलाड़ी' },
  de: { previousWinners: 'Letzte Gewinner', lottery: 'Lotterie', drawAt: 'Nächste Ziehung', prizeSplit: 'Preisaufteilung', howItWorks: 'So funktioniert es', threeWinners: 'Drei verschiedene Gewinner teilen den gesamten Preispool.', ticketNote: 'Jedes Ticket nimmt an der nächsten Ziehung teil.', waitingForDraw: 'Warte auf Ziehung', noResults: 'Keine Ergebnisse in dieser Runde', player: 'Spieler' },
  fr: { previousWinners: 'Derniers gagnants', lottery: 'Loterie', drawAt: 'Prochain tirage', prizeSplit: 'Répartition des prix', howItWorks: 'Comment ça marche', threeWinners: 'Trois gagnants différents se partagent tout le lot.', ticketNote: 'Chaque ticket participe au prochain tirage.', waitingForDraw: 'En attente du tirage', noResults: 'Aucun résultat pour ce tour', player: 'Joueur' },
  it: { previousWinners: 'Ultimi vincitori', lottery: 'Lotteria', drawAt: 'Prossima estrazione', prizeSplit: 'Divisione premi', howItWorks: 'Come funziona', threeWinners: 'Tre vincitori diversi condividono l’intero montepremi.', ticketNote: 'Ogni biglietto partecipa alla prossima estrazione.', waitingForDraw: 'In attesa dell’estrazione', noResults: 'Nessun risultato in questo turno', player: 'Giocatore' },
  uk: { previousWinners: 'Попередні переможці', lottery: 'Лотерея', drawAt: 'Наступний розіграш', prizeSplit: 'Розподіл призів', howItWorks: 'Як це працює', threeWinners: 'Три різні переможці ділять весь призовий фонд.', ticketNote: 'Кожен квиток бере участь у наступному розіграші.', waitingForDraw: 'Очікування розіграшу', noResults: 'У цьому раунді немає результатів', player: 'Гравець' },
  pl: { previousWinners: 'Poprzedni zwycięzcy', lottery: 'Loteria', drawAt: 'Następne losowanie', prizeSplit: 'Podział nagród', howItWorks: 'Jak to działa', threeWinners: 'Trzech różnych zwycięzców dzieli całą pulę nagród.', ticketNote: 'Każdy los bierze udział w następnym losowaniu.', waitingForDraw: 'Oczekiwanie na losowanie', noResults: 'Brak wyników tej rundy', player: 'Gracz' },
  vi: { previousWinners: 'Người thắng trước đó', lottery: 'Xổ số', drawAt: 'Kỳ quay tiếp theo', prizeSplit: 'Chia giải thưởng', howItWorks: 'Cách hoạt động', threeWinners: 'Ba người thắng khác nhau chia toàn bộ giải thưởng.', ticketNote: 'Mỗi vé tham gia kỳ quay tiếp theo.', waitingForDraw: 'Đang chờ quay', noResults: 'Chưa có kết quả vòng này', player: 'Người chơi' },
  th: { previousWinners: 'ผู้ชนะก่อนหน้า', lottery: 'ลอตเตอรี่', drawAt: 'รอบถัดไป', prizeSplit: 'การแบ่งรางวัล', howItWorks: 'วิธีการทำงาน', threeWinners: 'ผู้ชนะสามคนที่ไม่ซ้ำกันจะแบ่งรางวัลทั้งหมด', ticketNote: 'ตั๋วทุกใบเข้าร่วมรอบถัดไป', waitingForDraw: 'กำลังรอผลรางวัล', noResults: 'รอบนี้ยังไม่มีผล', player: 'ผู้เล่น' },
  ko: { previousWinners: '이전 당첨자', lottery: '복권', drawAt: '다음 추첨', prizeSplit: '상금 분배', howItWorks: '이용 방법', threeWinners: '서로 다른 세 명의 당첨자가 전체 상금을 나눕니다.', ticketNote: '모든 티켓은 다음 추첨에 참여합니다.', waitingForDraw: '추첨 대기 중', noResults: '이번 라운드 결과 없음', player: '플레이어' },
  ja: { previousWinners: '前回の当選者', lottery: '抽選', drawAt: '次回の抽選', prizeSplit: '賞金の配分', howItWorks: '仕組み', threeWinners: '異なる3人の当選者で賞金プール全額を分けます。', ticketNote: 'すべてのチケットが次回の抽選に参加します。', waitingForDraw: '抽選を待っています', noResults: 'このラウンドの結果はありません', player: 'プレイヤー' },
  ur: { previousWinners: 'پچھلے فاتحین', lottery: 'لاٹری', drawAt: 'اگلا ڈرا', prizeSplit: 'انعام کی تقسیم', howItWorks: 'یہ کیسے کام کرتی ہے', threeWinners: 'تین مختلف فاتحین پورا انعامی پول بانٹتے ہیں۔', ticketNote: 'ہر ٹکٹ اگلے ڈرا میں شامل ہوتا ہے۔', waitingForDraw: 'ڈرا کا انتظار ہے', noResults: 'اس راؤنڈ کا کوئی نتیجہ نہیں', player: 'کھلاڑی' },
  fil: { previousWinners: 'Nakaraang nanalo', lottery: 'Lottery', drawAt: 'Susunod na draw', prizeSplit: 'Hati ng premyo', howItWorks: 'Paano ito gumagana', threeWinners: 'Tatlong magkakaibang nanalo ang maghahati sa buong premyo.', ticketNote: 'Bawat ticket ay kasali sa susunod na draw.', waitingForDraw: 'Naghihintay ng draw', noResults: 'Walang resulta sa round na ito', player: 'Manlalaro' },
  ms: { previousWinners: 'Pemenang terdahulu', lottery: 'Loteri', drawAt: 'Cabutan seterusnya', prizeSplit: 'Pembahagian hadiah', howItWorks: 'Cara ia berfungsi', threeWinners: 'Tiga pemenang berbeza berkongsi keseluruhan hadiah.', ticketNote: 'Setiap tiket menyertai cabutan seterusnya.', waitingForDraw: 'Menunggu cabutan', noResults: 'Tiada keputusan untuk pusingan ini', player: 'Pemain' },
  'zh-Hant': { previousWinners: '上期得獎者', lottery: '抽獎', drawAt: '下次抽獎', prizeSplit: '獎金分配', howItWorks: '玩法說明', threeWinners: '三位不同得獎者平分全部獎金池。', ticketNote: '每張票都會參加下次抽獎。', waitingForDraw: '等待抽獎', noResults: '本輪尚無結果', player: '玩家' },
};

export const SHARE_INVITE_TEXT: VexaText = {
  en: '🎮 𝗖𝗼𝗺𝗲 𝗽𝗹𝗮𝘆 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 𝘄𝗶𝘁𝗵 𝗺𝗲!\n\n𝗢𝗻 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲, 𝘆𝗼𝘂 𝗰𝗮𝗻 𝗽𝗹𝗮𝘆 𝗠𝗶𝗻𝗲𝘀, 𝗣𝗹𝗶𝗻𝗸𝗼, 𝗖𝗿𝗮𝘀𝗵, 𝗪𝗵𝗲𝗲𝗹, 𝗗𝗶𝗰𝗲, 𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿, 𝗦𝗹𝗼𝘁 — 𝘁𝗵𝗲𝗻 𝗰𝗼𝗺𝗽𝗲𝘁𝗲 𝘄𝗶𝘁𝗵 𝗼𝘁𝗵𝗲𝗿 𝗽𝗹𝗮𝘆𝗲𝗿𝘀. 🏆\n\n𝗬𝗼𝘂 𝗰𝗮𝗻 𝗮𝗹𝘀𝗼 𝗽𝗿𝗲𝗱𝗶𝗰𝘁 𝘁𝗵𝗲 𝗱𝗶𝗿𝗲𝗰𝘁𝗶𝗼𝗻 𝗼𝗳 𝗕𝗶𝘁𝗰𝗼𝗶𝗻, 𝗴𝗼𝗹𝗱, 𝗮𝗻𝗱 𝗼𝗶𝗹 𝗽𝗿𝗶𝗰𝗲𝘀, 𝗮𝗹𝗼𝗻𝗴 𝘄𝗶𝘁𝗵 𝘁𝗵𝗲 𝗼𝘂𝘁𝗰𝗼𝗺𝗲𝘀 𝗼𝗳 𝗺𝗮𝗷𝗼𝗿 𝘄𝗼𝗿𝗹𝗱 𝗲𝘃𝗲𝗻𝘁𝘀, 𝗮𝗻𝗱 𝗽𝘂𝘁 𝘆𝗼𝘂𝗿 𝘀𝗸𝗶𝗹𝗹𝘀 𝘁𝗼 𝘁𝗵𝗲 𝘁𝗲𝘀𝘁. 🧩\n\n𝗜’𝗺 𝗼𝗻 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 𝘁𝗼𝗼 — 𝗰𝗼𝗺𝗲 𝗽𝗹𝗮𝘆 𝘄𝗶𝘁𝗵 𝗺𝗲 😄',
  fa: '🎮 بیا باهم توی 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 بازی کنیم!\n\nتوی 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 می‌تونی بازی‌هایی مثل 𝗠𝗶𝗻𝗲𝘀، 𝗣𝗹𝗶𝗻𝗸𝗼، 𝗖𝗿𝗮𝘀𝗵، 𝗪𝗵𝗲𝗲𝗹، 𝗗𝗶𝗰𝗲، 𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿، 𝗦𝗹𝗼𝘁 رو تجربه کنی و با بقیه رقابت کنی. 🏆\n\nهمچنین می‌تونی روند قیمت <b>بیت‌کوین، طلا و نفت و نتیجهٔ رویدادهای مهم دنیا</b> رو پیش‌بینی کنی و مهارتت رو به چالش بکشی. 🧩\n\nمن هم داخل 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 هستم؛ بیا باهم بازی کنیم 😄',
  ru: '🎮 Давай играть в 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 вместе!\n\nВ 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 тебя ждут 𝗠𝗶𝗻𝗲𝘀, 𝗣𝗹𝗶𝗻𝗸𝗼, 𝗖𝗿𝗮𝘀𝗵, 𝗪𝗵𝗲𝗲𝗹, 𝗗𝗶𝗰𝗲, 𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿, 𝗦𝗹𝗼𝘁 — соревнуйся с другими игроками. 🏆\n\nТакже можно прогнозировать движение цен <b>биткоина, золота и нефти, а ещё исходы важных мировых событий</b>. Проверь свои навыки! 🧩\n\nЯ тоже в 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 — присоединяйся 😄',
  tr: '🎮 Gel, 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲’da birlikte oynayalım!\n\n𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲’da 𝗠𝗶𝗻𝗲𝘀, 𝗣𝗹𝗶𝗻𝗸𝗼, 𝗖𝗿𝗮𝘀𝗵, 𝗪𝗵𝗲𝗲𝗹, 𝗗𝗶𝗰𝗲, 𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿, 𝗦𝗹𝗼𝘁 oynayabilir, diğer oyuncularla yarışabilirsin. 🏆\n\nAyrıca <b>Bitcoin, altın ve petrol fiyatlarının yönünü ve önemli dünya olaylarının sonuçlarını</b> tahmin ederek yeteneğini test edebilirsin. 🧩\n\nBen de 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲’dayım — katıl 😄',
  ar: '🎮 تعال نلعب معًا في 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲!\n\nفي 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 يمكنك تجربة 𝗠𝗶𝗻𝗲𝘀 و𝗣𝗹𝗶𝗻𝗸𝗼 و𝗖𝗿𝗮𝘀𝗵 و𝗪𝗵𝗲𝗲𝗹 و𝗗𝗶𝗰𝗲 و𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿 و𝗦𝗹𝗼𝘁  والتنافس مع الآخرين. 🏆\n\nويمكنك أيضًا توقّع اتجاه <b>أسعار بيتكوين والذهب والنفط ونتائج أهم الأحداث العالمية</b> واختبار مهاراتك. 🧩\n\nأنا أيضًا في 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 — انضم إليّ 😄',
  es: '🎮 ¡Ven a jugar 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 conmigo!\n\nEn 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 puedes jugar 𝗠𝗶𝗻𝗲𝘀, 𝗣𝗹𝗶𝗻𝗸𝗼, 𝗖𝗿𝗮𝘀𝗵, 𝗪𝗵𝗲𝗲𝗹, 𝗗𝗶𝗰𝗲, 𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿, 𝗦𝗹𝗼𝘁, y competir con otros jugadores. 🏆\n\nTambién puedes predecir la tendencia de <b>Bitcoin, oro y petróleo, además de los resultados de grandes eventos mundiales</b>, y poner a prueba tus habilidades. 🧩\n\n¡Yo también estoy en 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 — únete! 😄',
  'pt-BR': '🎮 Vem jogar 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 comigo!\n\nNo 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 você pode jogar 𝗠𝗶𝗻𝗲𝘀, 𝗣𝗹𝗶𝗻𝗸𝗼, 𝗖𝗿𝗮𝘀𝗵, 𝗪𝗵𝗲𝗲𝗹, 𝗗𝗶𝗰𝗲, 𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿, 𝗦𝗹𝗼𝘁 e competir com outros jogadores. 🏆\n\nVocê também pode prever a direção dos preços de <b>Bitcoin, ouro e petróleo, além dos resultados de grandes acontecimentos mundiais</b>, e testar suas habilidades. 🧩\n\nEu também estou no 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 — vem jogar! 😄',
  id: '🎮 Yuk, main 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 bareng!\n\nDi 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 kamu bisa memainkan 𝗠𝗶𝗻𝗲𝘀, 𝗣𝗹𝗶𝗻𝗸𝗼, 𝗖𝗿𝗮𝘀𝗵, 𝗪𝗵𝗲𝗲𝗹, 𝗗𝗶𝗰𝗲, 𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿, 𝗦𝗹𝗼𝘁, lalu bersaing dengan pemain lain. 🏆\n\nKamu juga bisa memprediksi arah harga <b>Bitcoin, emas, dan minyak, serta hasil peristiwa penting dunia</b> untuk menguji kemampuanmu. 🧩\n\nAku juga ada di 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 — ayo bergabung 😄',
  hi: '🎮 आओ, 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 पर साथ खेलें!\n\n𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 पर आप 𝗠𝗶𝗻𝗲𝘀, 𝗣𝗹𝗶𝗻𝗸𝗼, 𝗖𝗿𝗮𝘀𝗵, 𝗪𝗵𝗲𝗲𝗹, 𝗗𝗶𝗰𝗲, 𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿, 𝗦𝗹𝗼𝘁 खेल सकते हैं और दूसरे खिलाड़ियों से मुकाबला कर सकते हैं। 🏆\n\nआप <b>बिटकॉइन, सोने और तेल की कीमतों की दिशा और दुनिया की बड़ी घटनाओं के नतीजों</b> का अनुमान लगाकर अपनी क्षमता भी आज़मा सकते हैं। 🧩\n\nमैं भी 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 पर हूँ — जुड़िए 😄',
  de: '🎮 Komm, spiel mit mir bei 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲!\n\nBei 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 kannst du 𝗠𝗶𝗻𝗲𝘀, 𝗣𝗹𝗶𝗻𝗸𝗼, 𝗖𝗿𝗮𝘀𝗵, 𝗪𝗵𝗲𝗲𝗹, 𝗗𝗶𝗰𝗲, 𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿, 𝗦𝗹𝗼𝘁 spielen und gegen andere Spieler antreten. 🏆\n\nDu kannst außerdem die Entwicklung von <b>Bitcoin-, Gold- und Ölpreisen sowie die Ergebnisse wichtiger Weltereignisse</b> vorhersagen und dein Können testen. 🧩\n\nIch bin auch bei 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 — komm dazu 😄',
  fr: '🎮 Viens jouer à 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 avec moi !\n\nSur 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲, tu peux jouer à 𝗠𝗶𝗻𝗲𝘀, 𝗣𝗹𝗶𝗻𝗸𝗼, 𝗖𝗿𝗮𝘀𝗵, 𝗪𝗵𝗲𝗲𝗹, 𝗗𝗶𝗰𝗲, 𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿, 𝗦𝗹𝗼𝘁, puis rivaliser avec d’autres joueurs. 🏆\n\nTu peux aussi prévoir l’évolution du <b>Bitcoin, de l’or et du pétrole, ainsi que les résultats des grands événements mondiaux</b>, pour tester tes compétences. 🧩\n\nJe suis aussi sur 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 — rejoins-moi 😄',
  it: '🎮 Vieni a giocare a 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 con me!\n\nSu 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 puoi giocare a 𝗠𝗶𝗻𝗲𝘀, 𝗣𝗹𝗶𝗻𝗸𝗼, 𝗖𝗿𝗮𝘀𝗵, 𝗪𝗵𝗲𝗲𝗹, 𝗗𝗶𝗰𝗲, 𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿, 𝗦𝗹𝗼𝘁 e sfidare gli altri giocatori. 🏆\n\nPuoi anche prevedere l’andamento dei prezzi di <b>Bitcoin, oro e petrolio e gli esiti dei principali eventi mondiali</b>, mettendo alla prova le tue abilità. 🧩\n\nCi sono anch’io su 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 — unisciti a me 😄',
  uk: '🎮 Ходімо грати у 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 разом!\n\nУ 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 ти можеш грати в 𝗠𝗶𝗻𝗲𝘀, 𝗣𝗹𝗶𝗻𝗸𝗼, 𝗖𝗿𝗮𝘀𝗵, 𝗪𝗵𝗲𝗲𝗹, 𝗗𝗶𝗰𝗲, 𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿, 𝗦𝗹𝗼𝘁 та змагатися з іншими гравцями. 🏆\n\nТакож можна передбачати рух цін на <b>біткоїн, золото й нафту та результати важливих світових подій</b> — перевір свої навички. 🧩\n\nЯ теж у 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 — приєднуйся 😄',
  pl: '🎮 Chodź, zagrajmy razem w 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲!\n\nW 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 możesz grać w 𝗠𝗶𝗻𝗲𝘀, 𝗣𝗹𝗶𝗻𝗸𝗼, 𝗖𝗿𝗮𝘀𝗵, 𝗪𝗵𝗲𝗲𝗹, 𝗗𝗶𝗰𝗲, 𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿, 𝗦𝗹𝗼𝘁 oraz rywalizować z innymi graczami. 🏆\n\nMożesz też przewidywać kierunek cen <b>Bitcoina, złota i ropy oraz wyniki ważnych wydarzeń na świecie</b> i sprawdzić swoje umiejętności. 🧩\n\nJa też jestem w 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 — dołącz 😄',
  vi: '🎮 Vào 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 chơi cùng mình nhé!\n\nTại 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲, bạn có thể chơi 𝗠𝗶𝗻𝗲𝘀, 𝗣𝗹𝗶𝗻𝗸𝗼, 𝗖𝗿𝗮𝘀𝗵, 𝗪𝗵𝗲𝗲𝗹, 𝗗𝗶𝗰𝗲, 𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿, 𝗦𝗹𝗼𝘁, rồi cạnh tranh với những người chơi khác. 🏆\n\nBạn cũng có thể dự đoán xu hướng giá <b>Bitcoin, vàng và dầu cùng kết quả các sự kiện lớn trên thế giới</b> để thử sức. 🧩\n\nMình cũng ở 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 — tham gia nhé 😄',
  th: '🎮 มาเล่น 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 ด้วยกัน!\n\nใน 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 คุณสามารถเล่น 𝗠𝗶𝗻𝗲𝘀, 𝗣𝗹𝗶𝗻𝗸𝗼, 𝗖𝗿𝗮𝘀𝗵, 𝗪𝗵𝗲𝗲𝗹, 𝗗𝗶𝗰𝗲, 𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿, 𝗦𝗹𝗼𝘁 พร้อมแข่งขันกับผู้เล่นคนอื่นได้ 🏆\n\nคุณยังทายทิศทาง<b>ราคาบิตคอยน์ ทองคำ และน้ำมัน รวมถึงผลของเหตุการณ์สำคัญทั่วโลก</b> เพื่อทดสอบทักษะของคุณได้อีกด้วย 🧩\n\nฉันก็อยู่ใน 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 — มาร่วมเล่นกัน 😄',
  ko: '🎮 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲에서 함께 게임해요!\n\n𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲에서는 𝗠𝗶𝗻𝗲𝘀, 𝗣𝗹𝗶𝗻𝗸𝗼, 𝗖𝗿𝗮𝘀𝗵, 𝗪𝗵𝗲𝗲𝗹, 𝗗𝗶𝗰𝗲, 𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿, 𝗦𝗹𝗼𝘁을 즐기고 다른 플레이어와 경쟁할 수 있어요. 🏆\n\n<b>비트코인, 금, 석유 가격의 흐름과 중요한 세계 이벤트의 결과</b>도 예측하며 실력을 시험해 보세요. 🧩\n\n저도 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲에 있어요 — 함께해요 😄',
  ja: '🎮 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲を一緒にプレイしよう！\n\n𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲では、𝗠𝗶𝗻𝗲𝘀、𝗣𝗹𝗶𝗻𝗸𝗼、𝗖𝗿𝗮𝘀𝗵、𝗪𝗵𝗲𝗲𝗹、𝗗𝗶𝗰𝗲、𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿、𝗦𝗹𝗼𝘁を楽しみ、ほかのプレイヤーと競えます。🏆\n\n<b>ビットコイン、金、石油の価格の動きや、世界の重要な出来事の結果</b>も予想して腕試しできます。🧩\n\n私も𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲にいるよ — 一緒に遊ぼう 😄',
  ur: '🎮 آؤ، 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 پر میرے ساتھ کھیلیں!\n\n𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 میں آپ 𝗠𝗶𝗻𝗲𝘀، 𝗣𝗹𝗶𝗻𝗸𝗼، 𝗖𝗿𝗮𝘀𝗵، 𝗪𝗵𝗲𝗲𝗹، 𝗗𝗶𝗰𝗲، 𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿، 𝗦𝗹𝗼𝘁 کھیل سکتے ہیں اور دوسرے کھلاڑیوں سے مقابلہ کر سکتے ہیں۔ 🏆\n\nآپ <b>بٹ کوائن، سونے اور تیل کی قیمتوں کی سمت اور دنیا کے اہم واقعات کے نتائج</b> کی پیش گوئی کر کے اپنی مہارت بھی آزما سکتے ہیں۔ 🧩\n\nمیں بھی 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 میں ہوں — شامل ہوں 😄',
  fil: '🎮 Tara, maglaro tayo sa 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲!\n\nSa 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲, puwede kang maglaro ng 𝗠𝗶𝗻𝗲𝘀, 𝗣𝗹𝗶𝗻𝗸𝗼, 𝗖𝗿𝗮𝘀𝗵, 𝗪𝗵𝗲𝗲𝗹, 𝗗𝗶𝗰𝗲, 𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿, 𝗦𝗹𝗼𝘁 at makipagkumpitensya sa ibang manlalaro. 🏆\n\nMaaari mo ring hulaan ang galaw ng presyo ng <b>Bitcoin, ginto at langis, pati ang resulta ng mahahalagang pangyayari sa mundo</b>, para subukan ang iyong husay. 🧩\n\nNasa 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 din ako — sumali ka 😄',
  ms: '🎮 Jom bermain 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 bersama saya!\n\nDi 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲, anda boleh bermain 𝗠𝗶𝗻𝗲𝘀, 𝗣𝗹𝗶𝗻𝗸𝗼, 𝗖𝗿𝗮𝘀𝗵, 𝗪𝗵𝗲𝗲𝗹, 𝗗𝗶𝗰𝗲, 𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿, 𝗦𝗹𝗼𝘁 serta bersaing dengan pemain lain. 🏆\n\nAnda juga boleh meramalkan arah harga <b>Bitcoin, emas dan minyak, serta hasil peristiwa penting dunia</b> untuk menguji kemahiran anda. 🧩\n\nSaya juga di 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 — sertai saya 😄',
  'zh-Hant': '🎮 一起來玩 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 吧！\n\n在 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲，你可以體驗 𝗠𝗶𝗻𝗲𝘀、𝗣𝗹𝗶𝗻𝗸𝗼、𝗖𝗿𝗮𝘀𝗵、𝗪𝗵𝗲𝗲𝗹、𝗗𝗶𝗰𝗲、𝗗𝗿𝗮𝗴𝗼𝗻 𝗧𝗼𝘄𝗲𝗿、𝗦𝗹𝗼𝘁，並與其他玩家競爭。🏆\n\n你也可以預測<b>比特幣、黃金與石油價格的走勢，以及世界重要事件的結果</b>，挑戰自己的實力。🧩\n\n我也在 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 — 快來一起玩 😄',
};

export const SHARE_INVITE_BUTTON_TEXT: VexaText = {
  en: '🎪 𝗘𝗻𝘁𝗲𝗿 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲',
  fa: '🎪 ورود به 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲', ru: '🎪 Открыть 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲', tr: '🎪 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲’ya gir',
  ar: '🎪 دخول 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲', es: '🎪 Entrar a 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲', 'pt-BR': '🎪 Entrar no 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲',
  id: '🎪 Masuk ke 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲', hi: '🎪 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 खोलें', de: '🎪 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 öffnen',
  fr: '🎪 Ouvrir 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲', it: '🎪 Apri 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲', uk: '🎪 Відкрити 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲',
  pl: '🎪 Otwórz 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲', vi: '🎪 Mở 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲', th: '🎪 เปิด 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲',
  ko: '🎪 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 열기', ja: '🎪 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲を開く', ur: '🎪 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲 کھولیں',
  fil: '🎪 Buksan ang 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲', ms: '🎪 Buka 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲', 'zh-Hant': '🎪 開啟 𝗩𝗲𝘅𝗮 𝗚𝗮𝗺𝗲',
};

export const VEXA_APP_DEEP_LINK = 'https://t.me/VexaAppBOT?startapp';

export function vexaLocaleForCountry(countryCode: string | null | undefined): VexaLocale {
  return COUNTRY_TO_VEXA_LOCALE[String(countryCode || '').trim().toUpperCase()] || DEFAULT_VEXA_LOCALE;
}

export function vexaTextForCountry(text: VexaText, countryCode: string | null | undefined): string {
  return text[vexaLocaleForCountry(countryCode)] || text[DEFAULT_VEXA_LOCALE];
}
