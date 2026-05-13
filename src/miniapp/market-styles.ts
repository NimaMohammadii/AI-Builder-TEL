export const MARKET_STYLES = `
#market.market-view{padding:6px 0 calc(120px + env(safe-area-inset-bottom))!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important}
#market .market-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;column-gap:10px!important;row-gap:18px!important;padding-bottom:28px!important;scroll-snap-type:y proximity!important}
#market.is-section-locked>.market-grid{display:none!important;visibility:hidden!important;pointer-events:none!important}
#market .market-nft-card{background:rgba(255,255,255,.045)!important;-webkit-backdrop-filter:blur(3px) saturate(150%)!important;backdrop-filter:blur(3px) saturate(150%)!important}
#market .market-nft-card:before,#market .market-nft-card:after{content:none!important;display:none!important}
#market .market-nft-image{aspect-ratio:1/1!important;background:#020202!important}
#market .market-nft-art,#market [class*="market-nft-art-"]{width:100%;height:100%;display:grid;place-items:center;position:relative;overflow:hidden;background:#030303!important;color:transparent!important}
#market .market-nft-art:before{content:"";position:absolute;inset:12%;border:1px solid rgba(255,255,255,.09);border-radius:22%;transform:rotate(8deg);opacity:.55}
#market .market-nft-art:after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 28% 18%,rgba(255,255,255,.08),transparent 24%),radial-gradient(circle at 50% 100%,rgba(255,46,99,.055),transparent 48%)}
#market .market-nft-art b{display:none!important}
#market .market-nft-title-row{display:flex;align-items:flex-start;justify-content:space-between;gap:7px;min-width:0}
#market .market-nft-title-row strong{font-size:14px;font-weight:930;letter-spacing:-.045em;line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#market .market-nft-title-row em{flex:0 0 auto;max-width:58px;height:20px;padding:0 7px;border:1px solid rgba(255,255,255,.14);border-radius:999px;background:rgba(0,0,0,.18);color:rgba(255,255,255,.60);font-size:8.8px;font-style:normal;font-weight:900;display:flex;align-items:center;justify-content:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#market .market-nft-info{gap:7px!important;background:transparent!important}
#market .market-nft-bottom,#market .market-price,#market .market-buy{display:none!important}
#market .market-price-button{width:100%;height:40px;border:0!important;border-radius:16px;background:rgba(255,46,99,.025)!important;-webkit-backdrop-filter:blur(1px) saturate(118%)!important;backdrop-filter:blur(1px) saturate(118%)!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;color:#fff!important;box-shadow:none!important;margin-top:2px;overflow:hidden;opacity:1!important}
#market .market-price-button img{width:20px;height:20px;object-fit:contain;border:0!important;background:transparent!important;box-shadow:none!important;display:block!important;flex:0 0 auto;opacity:1!important;visibility:visible!important;filter:drop-shadow(0 1px 6px rgba(0,0,0,.55))}
#market .market-price-button b{font-size:13.4px;font-weight:950;letter-spacing:-.035em;line-height:1;color:#fff!important;text-shadow:0 1px 10px rgba(0,0,0,.70)}
@media(max-width:380px){#market .market-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;column-gap:8px!important;row-gap:14px!important}#market .market-nft-title-row strong{font-size:12.5px}#market .market-nft-title-row em{max-width:50px;height:18px;font-size:7.8px;padding:0 6px}#market .market-price-button{height:36px;gap:7px}#market .market-price-button img{width:18px;height:18px}#market .market-price-button b{font-size:12.3px}}
`;
