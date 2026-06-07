export const DAILY_REWARDS_STYLES = `
#home .home-daily-rewards-section{position:relative;margin:18px 0 0;width:100%;overflow:visible!important;box-sizing:border-box;z-index:2}
#home .home-daily-rewards-head{display:none!important}
#home .home-daily-rewards-days{display:flex;gap:12px;width:100%;max-width:100%;overflow-x:auto;overflow-y:visible!important;-webkit-overflow-scrolling:touch;scrollbar-width:none;scroll-snap-type:x proximity;padding:0 18px 22px;box-sizing:border-box;overscroll-behavior-x:contain}
#home .home-daily-rewards-days::-webkit-scrollbar{display:none}
#home .daily-rewards-day{position:relative;flex:0 0 128px;width:128px;height:164px;border:0!important;outline:0!important;border-radius:0!important;background:transparent!important;background-image:none!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;scroll-snap-align:start;box-sizing:border-box;overflow:visible!important;padding:0!important;display:block!important;cursor:pointer;appearance:none!important;-webkit-appearance:none!important;transition:opacity .22s ease,filter .22s ease,transform .18s ease}
#home .daily-rewards-day:before,#home .daily-rewards-day:after{display:none!important;content:none!important;background:none!important;border:0!important;box-shadow:none!important}
#home .daily-rewards-card-img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:center;display:block;border:0!important;outline:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;opacity:1;filter:none}
#home .daily-rewards-day.locked{opacity:1!important;filter:none!important;background:transparent!important;box-shadow:none!important}
#home .daily-rewards-day.locked .daily-rewards-card-img{filter:grayscale(.35) brightness(.62);opacity:.48}
#home .daily-rewards-day.claimed{opacity:1!important;filter:none!important;background:transparent!important;box-shadow:none!important}
#home .daily-rewards-day.claimed .daily-rewards-card-img{opacity:.72;filter:saturate(.82) brightness(.82)}
#home .daily-rewards-day.today{opacity:1!important;filter:none!important;background:transparent!important;box-shadow:none!important}
#home .daily-rewards-day.can-claim:active{transform:scale(.985)}
#home .daily-rewards-day.claiming{pointer-events:none;filter:brightness(1.08)!important}
@media(max-width:380px){#home .daily-rewards-day{flex-basis:118px;width:118px;height:154px}#home .daily-rewards-card-img{border-radius:0!important}}
`;