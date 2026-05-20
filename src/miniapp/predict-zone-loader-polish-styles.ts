export const PREDICT_ZONE_LOADER_POLISH_STYLES = `
#predictzone .predict-zone-chart-loader{background:linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.14))!important;-webkit-backdrop-filter:blur(1.5px);backdrop-filter:blur(1.5px);opacity:1!important;transition:opacity .28s ease,visibility 0s linear 0s!important}
#predictzone .predict-zone-chart-preview.ready .predict-zone-chart-loader{opacity:0!important;visibility:hidden;transition:opacity .28s ease,visibility 0s linear .28s!important}
#predictzone .predict-zone-loader-core{position:relative!important;width:54px!important;height:54px!important;border-radius:999px!important;display:grid!important;place-items:center!important;background:transparent!important;border:0!important;box-shadow:none!important;filter:none!important;overflow:visible!important}
#predictzone .predict-zone-loader-core:before{content:""!important;position:absolute!important;inset:0!important;border-radius:999px!important;border:1.5px solid rgba(255,255,255,.10)!important;border-top-color:rgba(255,255,255,.82)!important;border-right-color:rgba(255,255,255,.34)!important;background:transparent!important;box-shadow:none!important;-webkit-mask:none!important;mask:none!important;animation:predictLoaderOrbit .82s linear infinite!important}
#predictzone .predict-zone-loader-core:after{content:""!important;position:absolute!important;inset:18px!important;border-radius:999px!important;background:rgba(255,255,255,.72)!important;box-shadow:0 0 18px rgba(255,255,255,.18)!important;opacity:.78!important;animation:predictLoaderDotBreath 1.1s ease-in-out infinite!important}
#predictzone .predict-zone-loader-core span{display:none!important}
#predictzone .predict-zone-loader-core span:before,#predictzone .predict-zone-loader-core span:after{display:none!important;content:none!important}
@keyframes predictLoaderOrbit{to{transform:rotate(360deg)}}
@keyframes predictLoaderDotBreath{0%,100%{transform:scale(.72);opacity:.38}50%{transform:scale(1);opacity:.9}}
`;
