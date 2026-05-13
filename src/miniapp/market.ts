const tonLogo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAEiklEQVR42u3dQXajQAwFQMPL/a9Mtll4kcQNLelXHWDGbtCXRMjM6wUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADbHVU/2HVdl8vDyKI7jjJ1d7oc8Hxzq9LgBAAET7kCAIJDQABAMAEAwVOAAAATAJDoyzgEAkDhgxVA8cPTdr4ZeCh8yA2BM/FLg+IvtAIAoQFgCkD3Dw4AYGMAVfkgKx8IVpkqPv1O06ajCecx7T4tMwGsPIwpP12Y9FOSCd9lYpOyAkCwUgFgCkD3NwEAqQEwaQpY8V3szvu75tTuX3YCsApg9LcCAKkBYApA9w+fACa8CJP+HKD7/j/9Po5ZAUwBuF8aBoBVAKO/CQBIDYDuU4Bfee5zdkndv9UEkF5EHdeX5JWry/16KibIvS9aBYAHghj9TQBAagB0nQLSXgjq9AJQavdvOwFYBVD8VgAgNQBMAej+JoDY0HJWxAdA4hTQ4XOmfcbOYdV+ArAKoPitAEBqAJgC0P3DJ4AuF2P6C0Ep/wLQlIeUVgBTgOtqBTAFuFkUf1r3NwGACWCWDlPA1OcAVfd/3T9sAvAWGe4rK4BnAbh+qQHggSBGfxOAcdKZkBoA06eASp+p2vno/gJAV8H9YwWY2+VwnQSAVQCjvwBIDaYKgeS/ABcApgB0fwEgBFD8AgAQAKYA3eaJM9D9BYDxN/DvRgB4FiD8dH8BIAQUv+IXAALHd0MAmAI2/B13f27dXwDoXrhOAsCu6zwQAFYBxa/7CwBBs7+w/AtAAgBTgO4vAHCzOk8BQPsuCgJA13KOCACThKlDAKB7OT8BgJvYuQkAQAAwtZv9ZrevsP/r/gIAEACmAOeEAHBzOx8EAPc+B/DzfwGALudcBAAgANDtnIcAwE3vHAQAQ7x72OcBoABA9/P9BQAgANAFfW8BwMxi+LnzP73/K34BAAgA0rqi7i8ACC0OxS8AgCqB7AhqmvhSju5vAgAEAGndUvcXAIQWjeIXAIAAIK176v4CABAApHVR3V8AEFpMil8AAAKAtK6q+wsAQACQ1l11fwFAaJEpfgEACADSuq3uLwAILTrFLwAAAUBa99X9BQAgAEjrwrq/ACA0BBS/AAAEAGlTgO4vAAABQNoUoPsPu18cwVwr/3chhW8CIHQaUPwmAAKnAYUPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC08Q2FibINJmxEUAAAAABJRU5ErkJggg==';

const marketItems = [
  ['genesis', 'Genesis Vexa', '1/100', '12.5'],
  ['ruby', 'Ruby Core', 'Rare', '8.0'],
  ['nova', 'Nova Mask', 'Epic', '15.75'],
  ['shadow', 'Shadow Pass', 'Limited', '6.25'],
  ['orbit', 'Orbit Key', 'Utility', '4.5'],
  ['pulse', 'Pulse Badge', 'Common', '2.0'],
] as const;

function nftCard([id, title, badge, price]: typeof marketItems[number]): string {
  return `<button class="market-nft-card game-card" type="button" data-market-item="${id}"><span class="market-nft-image game-image"><span class="market-nft-art market-nft-art-${id}"><b>${title.split(' ').map((part) => part[0]).join('').slice(0, 2)}</b></span></span><span class="market-nft-info game-info"><span class="market-nft-title-row"><strong>${title}</strong><em>${badge}</em></span><small>Internal Vexa NFT</small><span class="market-nft-bottom"><span class="market-price"><img src="${tonLogo}" alt="TON" decoding="async"/>${price}</span><span class="market-buy game-open">Buy</span></span></span></button>`;
}

export const MARKET_SECTION = `<section id="market" class="view market-view"><div class="market-grid game-grid">${marketItems.map(nftCard).join('')}</div></section>`;
