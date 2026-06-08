export const DAILY_REWARDS_STYLES = `
.content:has(#home.active){overflow:visible!important}
#home.view.active{overflow-y:hidden!important;overflow-x:visible!important;padding-bottom:0!important}
#home .home-daily-rewards-section{position:absolute;left:0;right:0;top:0;bottom:0;width:100%;height:100%;overflow:visible!important;box-sizing:border-box;z-index:35;pointer-events:none;margin:0!important;padding:0!important}
#home .home-daily-rewards-head{display:none!important}
#home .home-daily-rewards-days{position:absolute;left:0;right:0;top:0;bottom:0;width:100%;height:100%;overflow:visible!important;pointer-events:none;margin:0!important;padding:0!important;contain:none!important}
#home .home-daily-rewards-days::-webkit-scrollbar{display:none}
#home .daily-rewards-drop-banner{position:absolute;left:54%;top:0;width:172px;height:224px;border:0!important;outline:0!important;border-radius:0!important;background:transparent!important;background-image:none!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;box-sizing:border-box;overflow:visible!important;padding:0!important;display:block!important;cursor:pointer;appearance:none!important;-webkit-appearance:none!important;pointer-events:auto;transform:translate(-42%,0);animation:dailyRewardBannerDrop .86s cubic-bezier(.16,.92,.2,1.03) both;will-change:transform,opacity;z-index:36}
#home .daily-rewards-drop-banner:before,#home .daily-rewards-drop-banner:after{display:none!important;content:none!important;background:none!important;border:0!important;box-shadow:none!important}
#home .daily-rewards-banner-frame{position:absolute;inset:0;display:block;border-radius:0!important;overflow:visible!important;background:transparent!important}
#home .daily-rewards-banner-img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:center top;display:block;border:0!important;outline:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;opacity:1;filter:brightness(.94);transform:none!important;transform-origin:center center}
#home .daily-rewards-drop-banner.locked .daily-rewards-banner-img{filter:grayscale(.35) brightness(.62);opacity:.48}
#home .daily-rewards-drop-banner.claimed .daily-rewards-banner-img{opacity:.72;filter:saturate(.82) brightness(.82)}
#home .daily-rewards-drop-banner.can-claim:active{transform:translate(-42%,0) scale(.985)}
#home .daily-rewards-drop-banner.claiming{pointer-events:none;filter:brightness(1.08)!important}
@keyframes dailyRewardBannerDrop{0%{opacity:0;transform:translate(-42%,-130%)}72%{opacity:1;transform:translate(-42%,6px)}100%{opacity:1;transform:translate(-42%,0)}}
@media(max-width:380px){#home .daily-rewards-drop-banner{left:55%;width:158px;height:206px;transform:translate(-42%,0)}#home .daily-rewards-drop-banner.can-claim:active{transform:translate(-42%,0) scale(.985)}@keyframes dailyRewardBannerDrop{0%{opacity:0;transform:translate(-42%,-130%)}72%{opacity:1;transform:translate(-42%,6px)}100%{opacity:1;transform:translate(-42%,0)}}}
`;