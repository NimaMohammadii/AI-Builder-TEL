const creditLogo = '/app/api/uploaded-image/credit-icon.png';
const fallbackCreditLogo = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"%3E%3Cdefs%3E%3CradialGradient id="g" cx="32%25" cy="24%25" r="70%25"%3E%3Cstop offset="0" stop-color="%23ffffff"/%3E%3Cstop offset=".34" stop-color="%23ffd7e4"/%3E%3Cstop offset=".72" stop-color="%23ff2e63"/%3E%3Cstop offset="1" stop-color="%235b0f24"/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx="32" cy="32" r="28" fill="url(%23g)"/%3E%3Ccircle cx="32" cy="32" r="21" fill="none" stroke="rgba(255,255,255,.72)" stroke-width="3"/%3E%3Cpath d="M35 17 24 35h9l-4 12 13-20h-9l2-10Z" fill="white"/%3E%3C/svg%3E';

const marketItems = [
  ['genesis', 'Genesis Vexa', '1/100', '12.5'],
  ['ruby', 'Ruby Core', 'Rare', '8.0'],
  ['nova', 'Nova Mask', 'Epic', '15.75'],
  ['shadow', 'Shadow Pass', 'Limited', '6.25'],
  ['orbit', 'Orbit Key', 'Utility', '4.5'],
  ['pulse', 'Pulse Badge', 'Common', '2.0'],
  ['onyx', 'Onyx Crown', 'Legend', '22.0'],
  ['flare', 'Flare Wing', 'Rare', '9.5'],
  ['ghost', 'Ghost Node', 'Epic', '14.0'],
  ['matrix', 'Matrix Chip', 'Utility', '5.75'],
  ['crystal', 'Crystal Bot', 'Rare', '7.25'],
  ['void', 'Void Signal', 'Limited', '18.5'],
  ['neon', 'Neon Fang', 'Common', '3.0'],
  ['omega', 'Omega Key', 'Epic', '16.0'],
  ['prism', 'Prism Eye', 'Rare', '10.25'],
  ['alpha', 'Alpha Mark', '1/50', '25.0'],
] as const;

function nftCard([id, title, badge, price]: typeof marketItems[number]): string {
  return `<button class="market-nft-card game-card" type="button" data-market-item="${id}"><span class="market-nft-image game-image"><span class="market-nft-art market-nft-art-${id}"><b>${title.split(' ').map((part) => part[0]).join('').slice(0, 2)}</b></span></span><span class="market-nft-info game-info"><span class="market-nft-title-row"><strong>${title}</strong><em>${badge}</em></span><span class="market-price-button"><img src="${creditLogo}" alt="Credit" decoding="async" onerror="this.onerror=null;this.src='${fallbackCreditLogo}'"/><b>${price}</b></span></span></button>`;
}

export const MARKET_SECTION = `<section id="market" class="view market-view"><div class="market-grid game-grid">${marketItems.map(nftCard).join('')}</div></section>`;
