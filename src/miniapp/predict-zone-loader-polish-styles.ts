export const PREDICT_ZONE_LOADER_POLISH_STYLES = `
#predictzone .predict-zone-chart-loader{background:radial-gradient(circle at 50% 45%,rgba(92,10,31,.18),rgba(92,10,31,0) 32%),linear-gradient(180deg,rgba(0,0,0,.06),rgba(0,0,0,.24))!important;-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)}
#predictzone .predict-zone-chart-preview.ready .predict-zone-chart-loader{opacity:0!important;visibility:hidden;transition:opacity .34s ease,visibility 0s linear .34s!important}
#predictzone .predict-zone-loader-core{width:96px!important;height:96px!important;border-radius:999px;background:radial-gradient(circle,rgba(255,255,255,.055),rgba(255,255,255,0) 58%)!important;filter:drop-shadow(0 22px 38px rgba(0,0,0,.34))!important}
#predictzone .predict-zone-loader-core:before{inset:8px!important;border:1px solid rgba(255,255,255,.10)!important;border-top-color:rgba(255,255,255,.86)!important;border-right-color:rgba(92,10,31,.70)!important;border-bottom-color:rgba(255,255,255,.10)!important;border-left-color:rgba(255,255,255,.06)!important;box-shadow:0 0 34px rgba(92,10,31,.18),inset 0 1px 0 rgba(255,255,255,.12)!important;animation:predictLoaderSpin .95s linear infinite!important}
#predictzone .predict-zone-loader-core:after{inset:24px!important;border:0!important;background:conic-gradient(from 0deg,rgba(255,255,255,0),rgba(255,255,255,.42),rgba(92,10,31,.62),rgba(255,255,255,0))!important;box-shadow:none!important;-webkit-mask:radial-gradient(circle,transparent 50%,#000 52%);mask:radial-gradient(circle,transparent 50%,#000 52%);animation:predictLoaderSpinReverse 1.45s linear infinite!important;opacity:.88!important}
#predictzone .predict-zone-loader-core span{width:12px!important;height:12px!important;background:#fff!important;box-shadow:0 0 18px rgba(255,255,255,.82),0 0 42px rgba(92,10,31,.48)!important;animation:predictLoaderDotMinimal 1.05s ease-in-out infinite!important}
#predictzone .predict-zone-loader-core span:before,#predictzone .predict-zone-loader-core span:after{content:"";position:absolute;top:50%;width:5px;height:5px;margin-top:-2.5px;border-radius:999px;background:rgba(255,255,255,.72);box-shadow:0 0 14px rgba(255,255,255,.38)}
#predictzone .predict-zone-loader-core span:before{left:-22px;animation:predictLoaderSideDot 1.05s ease-in-out .12s infinite}
#predictzone .predict-zone-loader-core span:after{right:-22px;animation:predictLoaderSideDot 1.05s ease-in-out .24s infinite}
@keyframes predictLoaderSpinReverse{to{transform:rotate(-360deg)}}
@keyframes predictLoaderDotMinimal{0%,100%{transform:scale(.76);opacity:.62}50%{transform:scale(1.08);opacity:1}}
@keyframes predictLoaderSideDot{0%,100%{transform:scale(.62);opacity:.34}50%{transform:scale(1);opacity:.9}}
`;
