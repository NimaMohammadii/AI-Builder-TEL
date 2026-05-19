export const PREDICT_ZONE_LIVE_BETS_STYLES = `
#predictzone .predict-zone-live-bets{left:6px!important;bottom:74px!important;width:82px!important;height:84px!important;z-index:10!important}
#predictzone .predict-zone-live-bet{left:0!important;width:82px!important;min-width:82px!important;max-width:82px!important;justify-content:flex-start!important;text-align:left!important;animation:predictLiveBetFloatFast 1.42s ease-out forwards!important}
#predictzone .predict-zone-live-bet-override{font-size:11.4px!important;font-weight:950!important;letter-spacing:-.035em!important}
@keyframes predictLiveBetFloatFast{0%{transform:translate3d(0,38px,0) scale(.94);opacity:0}14%{opacity:.98}62%{opacity:.92}100%{transform:translate3d(0,-62px,0) scale(.98);opacity:0}}
@media(max-width:380px){#predictzone .predict-zone-live-bets{left:4px!important;bottom:70px!important;width:74px!important;height:74px!important}#predictzone .predict-zone-live-bet{width:74px!important;min-width:74px!important;max-width:74px!important;font-size:10.4px!important}}
`;
