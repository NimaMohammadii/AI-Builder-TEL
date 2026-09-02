import { miniAppShellHtml } from './miniapp/shell';

const EMPTY_HOME_SLOT_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
const HOME_SLOT_META_KEY = 'vexaHomeLotterySlotMeta:v1';
const DEFAULT_PAYMENT_METHOD_IMAGES = {
  stars: '/app/api/deposit-method-icon/stars.png',
  gram: '/app/api/credit-icon.png',
  nft: '/app/api/deposit-method-icon/nft.png',
} as const;

type PaymentMethodImageUrls = Partial<Record<keyof typeof DEFAULT_PAYMENT_METHOD_IMAGES, string>>;

function safeSingleQuotedJs(value: string): string {
  return String(value || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

export function miniAppHtml(homeSlotImageUrl = EMPTY_HOME_SLOT_IMAGE, paymentMethodImageUrls: PaymentMethodImageUrls = {}): string {
  const starsUrl = paymentMethodImageUrls.stars || DEFAULT_PAYMENT_METHOD_IMAGES.stars;
  const gramUrl = paymentMethodImageUrls.gram || DEFAULT_PAYMENT_METHOD_IMAGES.gram;
  const nftUrl = paymentMethodImageUrls.nft || DEFAULT_PAYMENT_METHOD_IMAGES.nft;
  const walletSource = "var src=type==='ton'?'/app/api/credit-icon.png':('/app/api/deposit-method-icon/'+(type==='nft'?'nft':'stars')+'.png');";
  const walletResolvedSource = `var src=type==='ton'?'${safeSingleQuotedJs(gramUrl)}':(type==='nft'?'${safeSingleQuotedJs(nftUrl)}':'${safeSingleQuotedJs(starsUrl)}');`;
  let shell = miniAppShellHtml()
    .replace(
      'src="/app/api/home-lottery-slot.png?v=home-lottery"',
      `src="${homeSlotImageUrl}"`,
    )
    .replace(
      /<span class="ton-mini-icon"><img src="[^"]+" alt="" decoding="async"\/><\/span>/,
      `<span class="ton-mini-icon"><img src="${gramUrl}" alt="" decoding="async"/></span>`,
    )
    .replace(walletSource, walletResolvedSource);

  const headExtras: string[] = [];
  const paymentPreloads = Array.from(new Set([starsUrl, gramUrl, nftUrl]));
  paymentPreloads.forEach((url) => {
    if (url) headExtras.push(`<link rel="preload" as="image" href="${url}">`);
  });

  if (homeSlotImageUrl && homeSlotImageUrl !== EMPTY_HOME_SLOT_IMAGE) {
    const cachedUrl = JSON.stringify(homeSlotImageUrl);
    headExtras.push(`<script>try{localStorage.setItem('${HOME_SLOT_META_KEY}',JSON.stringify({url:${cachedUrl},checkedAt:Date.now()}))}catch(e){}</script>`);
  }

  if (headExtras.length) shell = shell.replace('</head>', `${headExtras.join('')}</head>`);
  return shell;
}