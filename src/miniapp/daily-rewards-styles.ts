export const DAILY_REWARDS_STYLES = `
#home .home-daily-rewards-section{position:relative;margin:18px 0 0;width:100%;overflow:visible!important;box-sizing:border-box;z-index:2}
#home .home-daily-rewards-head{display:none!important}
#home .home-daily-rewards-days{display:flex;gap:12px;width:100%;max-width:100%;overflow-x:auto;overflow-y:visible!important;-webkit-overflow-scrolling:touch;scrollbar-width:none;scroll-snap-type:x proximity;padding:0 18px 22px;box-sizing:border-box;overscroll-behavior-x:contain}
#home .home-daily-rewards-days::-webkit-scrollbar{display:none}
#home .daily-rewards-day{position:relative;flex:0 0 128px;width:128px;height:164px;border:0!important;outline:0!important;border-radius:28px;background:rgba(255,255,255,.034)!important;background-image:none!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.09),0 16px 42px rgba(0,0,0,.24)!important;backdrop-filter:blur(3px) saturate(1.14)!important;-webkit-backdrop-filter:blur(3px) saturate(1.14)!important;scroll-snap-align:start;box-sizing:border-box;overflow:hidden!important;padding:0!important;display:block!important;cursor:pointer;transition:opacity .22s ease,filter .22s ease,transform .18s ease}
#home .daily-rewards-day:before,#home .daily-rewards-day:after{display:none!important;content:none!important;background:none!important;border:0!important;box-shadow:none!important}
#home .daily-rewards-card-img{position:absolute;inset:6px;width:calc(100% - 12px);height:calc(100% - 12px);object-fit:cover;object-position:center;display:block;border:0!important;outline:0!important;border-radius:23px;background:transparent!important;box-shadow:none!important;opacity:1;filter:none}
#home .daily-rewards-day.locked{opacity:1!important;filter:none!important;background:rgba(255,255,255,.026)!important}
#home .daily-rewards-day.locked .daily-rewards-card-img{filter:grayscale(.35) brightness(.62);opacity:.48}
#home .daily-rewards-day.claimed{opacity:1!important;filter:none!important;background:rgba(255,255,255,.030)!important}
#home .daily-rewards-day.claimed .daily-rewards-card-img{opacity:.72;filter:saturate(.82) brightness(.82)}
#home .daily-rewards-day.today{opacity:1!important;filter:none!important;background:rgba(255,255,255,.04)!important}
#home .daily-rewards-day.can-claim:active{transform:scale(.985)}
#home .daily-rewards-day.claiming{pointer-events:none;filter:brightness(1.08)!important}
@media(max-width:380px){#home .daily-rewards-day{flex-basis:118px;width:118px;height:154px;border-radius:26px}#home .daily-rewards-card-img{border-radius:22px}}
`;