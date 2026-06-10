export const PREDICT_CRYPTO_SELECTOR_STYLES = `
#predictzone .predict-detail-hidden{display:none!important}
#predictzone .predict-crypto-grid{display:grid;gap:12px;margin:4px 0 22px;padding:0 0 96px}
#predictzone .predict-crypto-card{position:relative;width:100%;min-height:150px;border:1px solid rgba(255,255,255,.11);border-radius:28px;background:rgba(255,255,255,.045)!important;box-shadow:0 18px 46px rgba(0,0,0,.24),inset 0 1px 0 rgba(255,255,255,.10)!important;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);display:grid;grid-template-columns:78px minmax(0,1fr) auto;align-items:center;gap:12px;padding:10px;text-align:left;color:#fff;overflow:hidden}
#predictzone .predict-crypto-card:before{content:"";display:none!important}
#predictzone .predict-crypto-card>*{position:relative;z-index:1}
#predictzone .predict-crypto-card-upload{position:absolute!important;inset:10px;z-index:0!important;display:block;border-radius:22px;background-color:transparent!important;background-position:center;background-repeat:no-repeat;background-size:contain;pointer-events:none;overflow:hidden}
#predictzone .predict-crypto-image{width:78px;height:78px;border-radius:0;background-color:transparent!important;background-position:center;background-repeat:no-repeat;background-size:contain;box-shadow:none!important;display:block;filter:drop-shadow(0 16px 22px rgba(0,0,0,.34))}
#predictzone .predict-crypto-image:before{content:"";display:none!important}
#predictzone .predict-crypto-card-empty .predict-crypto-image,#predictzone .predict-crypto-card-empty .predict-crypto-copy{visibility:hidden!important;pointer-events:none!important}
#predictzone .predict-crypto-card-empty .predict-crypto-card-upload.has-image{filter:drop-shadow(0 18px 28px rgba(0,0,0,.28))}
#predictzone .predict-crypto-copy{display:grid;gap:6px;min-width:0}
#predictzone .predict-crypto-copy b{font-size:18px;font-weight:850;letter-spacing:-.055em;line-height:1;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#predictzone .predict-crypto-copy small{font-size:12px;font-weight:680;line-height:1.2;color:rgba(255,255,255,.52);letter-spacing:-.025em;white-space:normal}
#predictzone .predict-crypto-price{height:34px;min-width:74px;border-radius:999px;background:rgba(255,255,255,.055);box-shadow:inset 0 1px 0 rgba(255,255,255,.10);display:inline-flex;align-items:center;justify-content:center;padding:0 10px;color:rgba(255,255,255,.86);font-size:12px;font-weight:850;letter-spacing:-.035em;white-space:nowrap}
#predictzone .predict-zone-category-menu:before{content:""!important;display:none!important}
#predictzone .predict-zone-category-menu{margin-bottom:14px!important}
#predictzone .predict-zone-category-card[data-predict-group],#predictzone .predict-zone-category-card[data-predict-direct]{background:rgba(255,255,255,.055)!important}
#predictzone .predict-zone-category-card[data-predict-group] span,#predictzone .predict-zone-category-card[data-predict-direct] span{color:#fff!important;font-weight:850!important}
#predictzone .predict-zone-category-card.active{background:rgba(255,255,255,.12)!important}
@media(max-width:380px){#predictzone .predict-crypto-card{min-height:136px;border-radius:24px;grid-template-columns:68px minmax(0,1fr) auto;padding:8px;gap:10px}#predictzone .predict-crypto-card-upload{inset:8px;border-radius:18px}#predictzone .predict-crypto-image{width:68px;height:68px}#predictzone .predict-crypto-copy b{font-size:16px}#predictzone .predict-crypto-copy small{font-size:11px}#predictzone .predict-crypto-price{min-width:66px;font-size:11px;padding:0 8px}}
`;
