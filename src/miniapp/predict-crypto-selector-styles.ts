export const PREDICT_CRYPTO_SELECTOR_STYLES = `
#predictzone .predict-detail-hidden{display:none!important}
#predictzone .predict-crypto-grid{--predict-card-gap:6px;display:grid;gap:12px;margin:4px 0 22px;padding:0 0 96px}
#predictzone .predict-crypto-card{position:relative;width:100%;height:calc((100vw - (var(--predict-card-gap) * 2)) / 3 + (var(--predict-card-gap) * 2))!important;min-height:128px!important;max-height:180px!important;border:1px solid rgba(255,255,255,.10)!important;border-radius:22px!important;background:linear-gradient(180deg,rgba(255,255,255,.105),rgba(255,255,255,.045))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.20),0 14px 34px rgba(0,0,0,.16)!important;-webkit-backdrop-filter:blur(3px)!important;backdrop-filter:blur(3px)!important;display:grid;grid-template-columns:78px minmax(0,1fr) auto;align-items:center;gap:12px;padding:0!important;text-align:left;color:#fff;overflow:hidden;transition:transform .18s ease!important}
#predictzone .predict-crypto-card:active{transform:scale(.985)!important}
#predictzone .predict-crypto-card:before{content:"";display:none!important}
#predictzone .predict-crypto-card>*{position:relative;z-index:1}
#predictzone .predict-crypto-card-upload{position:absolute!important;inset:var(--predict-card-gap)!important;z-index:0!important;display:block;border-radius:16px!important;background-color:transparent!important;background-position:center!important;background-repeat:no-repeat!important;background-size:100% 100%!important;pointer-events:none;overflow:hidden;border:0!important;outline:0!important;box-shadow:none!important}
#predictzone .predict-crypto-image{width:78px;height:78px;border-radius:0;background-color:transparent!important;background-position:center;background-repeat:no-repeat;background-size:contain;box-shadow:none!important;display:block;filter:drop-shadow(0 16px 22px rgba(0,0,0,.34))}
#predictzone .predict-crypto-image:before{content:"";display:none!important}
#predictzone .predict-crypto-card-empty .predict-crypto-image,#predictzone .predict-crypto-card-empty .predict-crypto-copy{visibility:hidden!important;pointer-events:none!important}
#predictzone .predict-crypto-card-empty .predict-crypto-card-upload.has-image{filter:none!important}
#predictzone .predict-crypto-copy{display:grid;gap:6px;min-width:0}
#predictzone .predict-crypto-copy b{font-size:18px;font-weight:850;letter-spacing:-.055em;line-height:1;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#predictzone .predict-crypto-copy small{font-size:12px;font-weight:680;line-height:1.2;color:rgba(255,255,255,.52);letter-spacing:-.025em;white-space:normal}
#predictzone .predict-crypto-price{height:34px;min-width:74px;border-radius:999px;background:rgba(255,255,255,.055);box-shadow:inset 0 1px 0 rgba(255,255,255,.10);display:inline-flex;align-items:center;justify-content:center;padding:0 10px;color:rgba(255,255,255,.86);font-size:12px;font-weight:850;letter-spacing:-.035em;white-space:nowrap}
#predictzone .predict-zone-category-menu:before{content:""!important;display:none!important}
#predictzone .predict-zone-category-menu{margin-bottom:14px!important}
#predictzone .predict-zone-category-card[data-predict-group],#predictzone .predict-zone-category-card[data-predict-direct]{background:rgba(255,255,255,.055)!important}
#predictzone .predict-zone-category-card[data-predict-group] span,#predictzone .predict-zone-category-card[data-predict-direct] span{color:#fff!important;font-weight:850!important}
#predictzone .predict-zone-category-card.active{background:rgba(255,255,255,.12)!important}
@media(max-width:380px){#predictzone .predict-crypto-grid{--predict-card-gap:6px}#predictzone .predict-crypto-card{height:calc((100vw - (var(--predict-card-gap) * 2)) / 3 + (var(--predict-card-gap) * 2))!important;min-height:118px!important;max-height:150px!important;border-radius:20px!important;grid-template-columns:68px minmax(0,1fr) auto;gap:10px}#predictzone .predict-crypto-card-upload{border-radius:14px!important}#predictzone .predict-crypto-image{width:68px;height:68px}#predictzone .predict-crypto-copy b{font-size:16px}#predictzone .predict-crypto-copy small{font-size:11px}#predictzone .predict-crypto-price{min-width:66px;font-size:11px;padding:0 8px}}
`;
