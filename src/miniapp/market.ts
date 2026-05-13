const creditLogo = '/app/api/uploaded-image/credit-icon.png';

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
  return `<button class="market-nft-card game-card" type="button" data-market-item="${id}"><span class="market-nft-image game-image"><span class="market-nft-art market-nft-art-${id}"><b>${title.split(' ').map((part) => part[0]).join('').slice(0, 2)}</b></span></span><span class="market-nft-info game-info"><span class="market-nft-title-row"><strong>${title}</strong><em>${badge}</em></span><small>Internal Vexa NFT</small><span class="market-price-button"><img src="${creditLogo}" alt="Credit" decoding="async" onerror="this.style.display='none'"/><b>${price}</b></span></span></button>`;
}

export const MARKET_SECTION = `<section id="market" class="view market-view"><div class="market-grid game-grid">${marketItems.map(nftCard).join('')}</div></section>`;
