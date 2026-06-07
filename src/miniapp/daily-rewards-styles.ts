export const DAILY_REWARDS_STYLES = `
#home .home-daily-rewards-section{position:relative;margin:18px 0 0;width:100%;overflow:visible!important;box-sizing:border-box;z-index:2}
#home .home-daily-rewards-section:before{content:"";position:absolute;left:8px;right:8px;top:31px;height:1px;background:linear-gradient(90deg,rgba(126,20,48,0),rgba(126,20,48,.52),rgba(255,255,255,.12),rgba(126,20,48,0));pointer-events:none;opacity:.58}
#home .home-daily-rewards-head{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin:0 2px 12px;color:#fff}
#home .home-daily-rewards-kicker{margin:0 0 6px;color:rgba(255,255,255,.46);font-size:8.5px;font-weight:850;text-transform:uppercase;letter-spacing:.18em;line-height:1}
#home .home-daily-rewards-head h2{margin:0;color:#fff;font-size:20px;font-weight:900;line-height:1;letter-spacing:-.045em;text-shadow:0 0 24px rgba(126,20,48,.18)}
#home .home-daily-rewards-status{height:26px;padding:0 10px;border-radius:999px;display:grid;place-items:center;background:rgba(255,255,255,.055);color:rgba(255,255,255,.72);font-size:8.5px;font-weight:850;white-space:nowrap;box-shadow:inset 0 1px 0 rgba(255,255,255,.10),0 10px 24px rgba(0,0,0,.14)}
#home .home-daily-rewards-days{display:flex;gap:12px;width:100%;max-width:100%;overflow-x:auto;overflow-y:visible!important;-webkit-overflow-scrolling:touch;scrollbar-width:none;scroll-snap-type:x proximity;padding:0 18px 22px;margin:0 -18px;box-sizing:border-box;overscroll-behavior-x:contain}
#home .home-daily-rewards-days::-webkit-scrollbar{display:none}
#home .daily-rewards-day{position:relative;flex:0 0 128px;width:128px;height:164px;border:0!important;outline:0!important;border-radius:28px;color:#fff;background:linear-gradient(145deg,rgba(255,255,255,.062),rgba(255,255,255,.024) 52%,rgba(255,255,255,.012))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 18px 46px rgba(0,0,0,.22)!important;backdrop-filter:blur(3px) saturate(1.14)!important;-webkit-backdrop-filter:blur(3px) saturate(1.14)!important;scroll-snap-align:start;box-sizing:border-box;overflow:hidden;padding:13px 12px;display:grid;grid-template-rows:auto minmax(0,1fr) auto;align-items:center;text-align:left;isolation:isolate;opacity:.72}
#home .daily-rewards-day:before{content:"";position:absolute;inset:0;border-radius:inherit;background:radial-gradient(circle at 78% 10%,rgba(126,20,48,.22),rgba(126,20,48,0) 50%),linear-gradient(135deg,rgba(255,255,255,.07),rgba(255,255,255,0) 34%);z-index:-1;pointer-events:none}
#home .daily-rewards-day:after{content:"";position:absolute;left:12px;right:12px;top:0;height:1px;background:linear-gradient(90deg,rgba(126,20,48,0),rgba(255,255,255,.22),rgba(126,20,48,0));opacity:.74;pointer-events:none}
#home .daily-rewards-day.past{opacity:.82;background:linear-gradient(145deg,rgba(126,20,48,.10),rgba(255,255,255,.024))!important}
#home .daily-rewards-day.today{opacity:1;background:linear-gradient(160deg,rgba(126,20,48,.36),rgba(255,255,255,.07) 54%,rgba(255,255,255,.018))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 18px 48px rgba(0,0,0,.24),0 0 34px rgba(126,20,48,.17)!important;outline:1px solid rgba(126,20,48,.42)!important}
#home .daily-rewards-day.active{outline:1px solid rgba(255,255,255,.20)!important}
#home .daily-rewards-day small{position:relative;z-index:1;color:rgba(255,255,255,.58);font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:.13em;line-height:1}
#home .daily-rewards-day span:not(.daily-rewards-day-image){position:relative;z-index:1;color:#fff;font-size:18px;font-weight:900;line-height:1;letter-spacing:-.04em}
#home .daily-rewards-day-image{position:relative;z-index:1;justify-self:center;width:68px;height:68px;border-radius:24px;display:grid;place-items:center;background:rgba(255,255,255,.055);box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 12px 26px rgba(0,0,0,.15);overflow:hidden;color:#fff;font-size:24px;font-weight:950;letter-spacing:-.05em}
#home .daily-rewards-day-image.completed:after{content:"✓";position:absolute;right:5px;bottom:5px;width:19px;height:19px;border-radius:999px;display:grid;place-items:center;background:#22d36f;color:#06160b;font-size:11px;font-weight:950;box-shadow:0 8px 16px rgba(0,0,0,.20)}
#home .daily-rewards-day-img{width:100%;height:100%;object-fit:cover;display:block}
#home .daily-rewards-day.today .daily-rewards-day-image{background:rgba(255,255,255,.075);box-shadow:inset 0 1px 0 rgba(255,255,255,.16),0 14px 30px rgba(126,20,48,.16)}
#home .daily-rewards-day.today .daily-rewards-day-image:before{content:"Today";position:absolute;left:50%;bottom:-1px;transform:translateX(-50%);height:17px;padding:0 8px;border-radius:999px;background:#fff;color:#21050d;font-size:7px;font-weight:950;display:grid;place-items:center;z-index:2;box-shadow:0 8px 16px rgba(126,20,48,.18)}
#home .daily-rewards-day strong{position:relative;z-index:1;justify-self:center;font-size:24px;font-weight:950;letter-spacing:-.05em;line-height:1;color:#fff}
@media(max-width:380px){#home .daily-rewards-day{flex-basis:118px;width:118px;height:154px;border-radius:26px;padding:12px 11px}#home .daily-rewards-day-image{width:62px;height:62px;border-radius:22px}#home .home-daily-rewards-head h2{font-size:19px}}
#home .daily-rewards-day{cursor:pointer;transition:transform .22s ease,opacity .22s ease,filter .22s ease}
#home .daily-rewards-day.future,#home .daily-rewards-day.burned{opacity:.42;filter:saturate(.55) brightness(.72)}
#home .daily-rewards-day.future .daily-rewards-day-img,#home .daily-rewards-day.burned .daily-rewards-day-img{filter:grayscale(.7) brightness(.68);opacity:.58}
#home .daily-rewards-day.claimed{opacity:.88;filter:none}
#home .daily-rewards-day.today.can-claim{animation:dailyRewardFloat 2.6s ease-in-out infinite;transform-origin:center;box-shadow:inset 0 1px 0 rgba(255,255,255,.20),0 22px 54px rgba(0,0,0,.26),0 0 38px rgba(126,20,48,.28)!important}
#home .daily-rewards-day.can-claim:active{transform:translateY(1px) scale(.985)}
#home .daily-rewards-day.claiming{pointer-events:none;filter:brightness(1.12)}
#home .daily-rewards-day em{position:relative;z-index:1;display:block;justify-self:center;max-width:100%;color:rgba(255,255,255,.58);font-size:8px;font-style:normal;font-weight:850;line-height:1.15;text-align:center;white-space:normal}
#home .daily-rewards-day.burned em{color:rgba(255,213,120,.78);font-weight:950}
#home .daily-rewards-lock{position:absolute;left:50%;top:50%;width:28px;height:28px;border-radius:11px;transform:translate(-50%,-50%);background:rgba(5,5,8,.58);box-shadow:inset 0 1px 0 rgba(255,255,255,.16),0 10px 22px rgba(0,0,0,.28);z-index:4}
#home .daily-rewards-lock:before{content:"";position:absolute;left:8px;top:6px;width:12px;height:10px;border:2px solid rgba(255,255,255,.82);border-bottom:0;border-radius:8px 8px 0 0;box-sizing:border-box}
#home .daily-rewards-lock:after{content:"";position:absolute;left:7px;right:7px;bottom:6px;height:12px;border-radius:4px;background:rgba(255,255,255,.88)}
#home .daily-rewards-day-image.burned:after{content:"";position:absolute;inset:0;background:rgba(0,0,0,.18);z-index:2}
@keyframes dailyRewardFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@media(prefers-reduced-motion:reduce){#home .daily-rewards-day.today.can-claim{animation:none}}

`;
