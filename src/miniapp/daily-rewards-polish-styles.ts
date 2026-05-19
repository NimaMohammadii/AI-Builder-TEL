export const DAILY_REWARDS_POLISH_STYLES = `
.daily-rewards-mission,.daily-rewards-mission.ready,.daily-rewards-mission.claimed{position:relative;isolation:isolate;border-radius:22px;background:linear-gradient(135deg,rgba(255,255,255,.052),rgba(255,255,255,.024))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 14px 34px rgba(0,0,0,.13)!important;overflow:hidden;opacity:1!important}
.daily-rewards-mission:before,.daily-rewards-mission.ready:before,.daily-rewards-mission.claimed:before{content:"";position:absolute;inset:0;border-radius:22px;background:radial-gradient(circle at 8% 0,rgba(255,255,255,.075),rgba(255,255,255,0) 34%);pointer-events:none;z-index:-1}
.daily-rewards-mission-icon,.daily-rewards-mission.ready .daily-rewards-mission-icon,.daily-rewards-mission.claimed .daily-rewards-mission-icon{position:relative;z-index:1;background:rgba(255,255,255,.065)!important;color:#fff!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.10)}
.daily-rewards-mission-main,.daily-rewards-xp{position:relative;z-index:1}
.daily-rewards-xp-static{background:rgba(255,255,255,.052)!important;color:rgba(255,255,255,.74)!important}
.daily-rewards-claim{border:0!important;min-width:86px;background:#fff!important;color:#14040a!important;box-shadow:0 10px 28px rgba(255,255,255,.11),0 8px 24px rgba(0,0,0,.20)!important;font-weight:950!important;letter-spacing:-.02em;cursor:pointer}
.daily-rewards-claim b{font-weight:950}
.daily-rewards-claim:disabled{opacity:.72;cursor:default}
.daily-rewards-claimed{background:rgba(255,255,255,.095)!important;color:rgba(255,255,255,.72)!important}
@media(max-width:380px){.daily-rewards-claim{min-width:76px}}
`;
