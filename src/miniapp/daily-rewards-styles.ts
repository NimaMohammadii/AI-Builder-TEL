export const DAILY_REWARDS_STYLES = `
.content:has(#home.active){overflow:visible!important}
#home.view.active{overflow-y:hidden!important;overflow-x:visible!important;padding-bottom:0!important}
#home .home-daily-rewards-section{position:fixed;left:50%;top:0;width:min(100%,560px);height:100dvh;transform:translateX(-50%);overflow:visible!important;box-sizing:border-box;z-index:95;pointer-events:none;margin:0!important;padding:0!important}
#home .home-daily-rewards-head{display:none!important}
#home .home-daily-rewards-days{position:absolute;left:0;right:0;top:0;bottom:0;width:100%;height:100%;overflow:visible!important;pointer-events:none;margin:0!important;padding:0!important;contain:none!important}
#home .home-daily-rewards-days::-webkit-scrollbar{display:none}
#home .daily-rewards-drop-banner{position:absolute;left:47.5%;top:calc(-16px + env(safe-area-inset-top));width:148px;height:194px;border:0!important;outline:0!important;border-radius:0!important;background:transparent!important;background-image:none!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;box-sizing:border-box;overflow:visible!important;padding:0!important;display:block!important;cursor:pointer;appearance:none!important;-webkit-appearance:none!important;pointer-events:auto;transform:translate3d(-42%,0,0);transform-origin:50% 0;animation:dailyRewardFlagDrop .82s cubic-bezier(.2,.84,.18,1) both;will-change:transform,opacity;z-index:96;backface-visibility:hidden;-webkit-backface-visibility:hidden}
#home .daily-rewards-drop-banner:before,#home .daily-rewards-drop-banner:after{display:none!important;content:none!important;background:none!important;border:0!important;box-shadow:none!important}
#home .daily-rewards-banner-frame{position:absolute;inset:0;display:block;border-radius:0!important;overflow:visible!important;background:transparent!important;transform-origin:50% 0;animation:dailyRewardFlagSettle .82s cubic-bezier(.2,.84,.18,1) both;will-change:transform;backface-visibility:hidden;-webkit-backface-visibility:hidden}
#home .daily-rewards-banner-img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:center top;display:block;border:0!important;outline:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;opacity:1;filter:brightness(.94);transform-origin:50% 0;animation:dailyRewardFlagSoftWave .82s ease-out both;will-change:transform;backface-visibility:hidden;-webkit-backface-visibility:hidden}
#home .daily-rewards-drop-banner.locked .daily-rewards-banner-img{filter:grayscale(.35) brightness(.62);opacity:.48}
#home .daily-rewards-drop-banner.claimed .daily-rewards-banner-img{opacity:.72;filter:saturate(.82) brightness(.82)}
#home .daily-rewards-drop-banner.can-claim:active{transform:translate3d(-42%,0,0) scale(.985)}
#home .daily-rewards-drop-banner.claiming{pointer-events:none;filter:brightness(1.08)!important}
#home .daily-rewards-drop-banner.collecting{pointer-events:none!important;animation:dailyRewardFlagCollect .52s cubic-bezier(.2,.78,.22,1) forwards!important}
#home .daily-rewards-drop-banner.collecting .daily-rewards-banner-frame{animation:dailyRewardFlagFold .52s cubic-bezier(.2,.78,.22,1) forwards!important}
@keyframes dailyRewardFlagDrop{0%{opacity:0;transform:translate3d(-42%,-122%,0)}62%{opacity:1;transform:translate3d(-42%,8px,0)}82%{opacity:1;transform:translate3d(-42%,-3px,0)}100%{opacity:1;transform:translate3d(-42%,0,0)}}
@keyframes dailyRewardFlagSettle{0%{transform:scaleY(.96)}58%{transform:scaleY(1.018)}82%{transform:scaleY(.994)}100%{transform:scaleY(1)}}
@keyframes dailyRewardFlagSoftWave{0%{transform:skewX(0deg)}52%{transform:skewX(-.9deg)}76%{transform:skewX(.45deg)}100%{transform:skewX(0deg)}}
@keyframes dailyRewardFlagCollect{0%{opacity:1;transform:translate3d(-42%,0,0) scale(1)}42%{opacity:1;transform:translate3d(-42%,-8px,0) scale(.94)}100%{opacity:0;transform:translate3d(-42%,-34px,0) scale(.72)}}
@keyframes dailyRewardFlagFold{0%{transform:scaleY(1)}45%{transform:scaleY(.42)}100%{transform:scaleY(.06)}}
@media(max-width:380px){#home .daily-rewards-drop-banner{left:48.5%;top:calc(-18px + env(safe-area-inset-top));width:136px;height:178px;transform:translate3d(-42%,0,0)}#home .daily-rewards-drop-banner.can-claim:active{transform:translate3d(-42%,0,0) scale(.985)}}
`;