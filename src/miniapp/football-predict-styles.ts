export const FOOTBALL_PREDICT_STYLES = `
#predictzone.football-predict-open{position:relative;isolation:isolate;background:radial-gradient(circle at 50% -12%,rgba(255,255,255,.055),rgba(255,255,255,0) 30%),radial-gradient(circle at 86% 18%,rgba(92,10,31,.18),rgba(92,10,31,0) 34%),radial-gradient(circle at 12% 36%,rgba(255,255,255,.045),rgba(255,255,255,0) 26%),linear-gradient(180deg,#050505 0%,#070707 46%,#020202 100%)}
#predictzone.football-predict-open:before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;background:linear-gradient(115deg,rgba(255,255,255,.045) 0 1px,transparent 1px 92px),linear-gradient(245deg,rgba(255,255,255,.03) 0 1px,transparent 1px 104px);opacity:.22;-webkit-mask-image:linear-gradient(180deg,transparent 0%,#000 16%,#000 72%,transparent 100%);mask-image:linear-gradient(180deg,transparent 0%,#000 16%,#000 72%,transparent 100%)}
#predictzone.football-predict-open:after{content:"";position:absolute;left:16px;right:16px;top:156px;height:420px;z-index:0;pointer-events:none;border-radius:44px;background:radial-gradient(ellipse at 50% 0%,rgba(255,255,255,.055),rgba(255,255,255,0) 58%),linear-gradient(180deg,rgba(255,255,255,.026),rgba(255,255,255,0));box-shadow:inset 0 1px 0 rgba(255,255,255,.035);opacity:.78}
#predictzone.football-predict-open .predict-zone-simple-shell,#predictzone.football-predict-open .predict-zone-category-menu,#predictzone.football-predict-open .football-predict-view{position:relative;z-index:1}
#predictzone .football-predict-view{display:none;padding:0 0 98px}
#predictzone.football-predict-open .football-predict-view{display:grid;gap:14px}
#predictzone.football-predict-open [data-vexa-predict-group-grid],#predictzone.football-predict-open [data-predict-card],#predictzone.football-predict-open .predict-toolbar-row,#predictzone.football-predict-open .predict-card-actions{display:none!important}
#predictzone .football-match-list{display:grid;gap:13px}
#predictzone .football-match-card{position:relative;border:0;border-radius:30px;padding:15px;background:linear-gradient(180deg,rgba(255,255,255,.052),rgba(255,255,255,.026));box-shadow:0 20px 52px rgba(0,0,0,.30),inset 0 1px 0 rgba(255,255,255,.105);overflow:hidden;color:#fff;text-align:left;backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}
#predictzone .football-match-card:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 18% 8%,rgba(255,255,255,.055),transparent 28%),radial-gradient(circle at 86% 12%,rgba(92,10,31,.16),transparent 34%);pointer-events:none}
#predictzone .football-match-card>*{position:relative;z-index:1}
#predictzone .football-match-card:active{transform:scale(.99)}
#predictzone .football-match-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:14px}
#predictzone .football-match-left{display:inline-flex;align-items:center;gap:7px;min-width:0}
#predictzone .football-match-tag{height:26px;display:inline-flex;align-items:center;padding:0 9px;border-radius:999px;background:rgba(255,255,255,.065);font-size:10px;font-weight:900;color:rgba(255,255,255,.72);letter-spacing:-.02em;white-space:nowrap}
#predictzone .football-live-badge{height:26px;display:inline-flex;align-items:center;gap:5px;padding:0 9px;border-radius:999px;background:rgba(92,10,31,.26);color:#8f1738;font-size:10px;font-weight:950;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap;box-shadow:0 0 18px rgba(92,10,31,.18),inset 0 1px 0 rgba(255,255,255,.08)}
#predictzone .football-live-dot{width:7px;height:7px;border-radius:50%;background:#8f1738;box-shadow:0 0 0 0 rgba(143,23,56,.52);animation:footballLivePulse 1.15s ease-in-out infinite;flex:0 0 auto}
@keyframes footballLivePulse{0%,100%{transform:scale(.86);box-shadow:0 0 0 0 rgba(143,23,56,.42);opacity:.72}50%{transform:scale(1.12);box-shadow:0 0 0 7px rgba(143,23,56,0);opacity:1}}
#predictzone .football-match-time{font-size:10px;font-weight:850;color:rgba(255,255,255,.44);white-space:nowrap}
#predictzone .football-balance-pill{height:35px!important;min-width:0!important;padding:0 12px!important;background:rgba(255,255,255,.055)!important;border:0!important;box-shadow:0 14px 34px rgba(0,0,0,.15),inset 0 1px 0 rgba(255,255,255,.14)!important}
#predictzone .football-balance-pill .ton-mini-icon{width:24px!important;height:24px!important}.football-balance-pill .ton-mini-icon img{width:24px!important;height:24px!important}.football-balance-pill b{font-size:13px!important;font-weight:820!important;color:#fff!important}
#predictzone .football-teams{display:grid;grid-template-columns:1fr 48px 1fr;align-items:center;gap:8px}
#predictzone .football-team{display:grid;justify-items:center;gap:8px;min-width:0}
#predictzone .football-team-logo{width:66px;height:66px;background-position:center;background-repeat:no-repeat;background-size:contain;filter:drop-shadow(0 14px 20px rgba(0,0,0,.34))}
#predictzone .football-team-logo:not(.has-logo){border-radius:50%;background:rgba(255,255,255,.06);box-shadow:inset 0 1px 0 rgba(255,255,255,.10)}
#predictzone .football-team b{font-size:14px;font-weight:950;letter-spacing:-.045em;color:#fff;text-align:center;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#predictzone .football-vs{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.07);box-shadow:inset 0 1px 0 rgba(255,255,255,.10);font-size:12px;font-weight:950;color:rgba(255,255,255,.82)}
#predictzone .football-pick-row{display:grid;grid-template-columns:1fr .82fr 1fr;gap:7px;margin-top:14px}
#predictzone .football-pick-row button{height:42px;border:0;border-radius:999px;background:rgba(255,255,255,.06);box-shadow:0 12px 26px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.10);color:#fff;font-size:12px;font-weight:900;letter-spacing:-.035em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 10px}
#predictzone .football-detail-page{position:relative;min-height:calc(100dvh - 250px);display:grid;align-content:start;gap:16px;padding-top:2px;animation:footballDetailIn .22s ease-out both}
#predictzone .football-detail-page:before{content:"";position:absolute;left:-10px;right:-10px;top:74px;height:470px;z-index:-1;pointer-events:none;border-radius:46px;background:radial-gradient(ellipse at 50% 0%,rgba(255,255,255,.05),rgba(255,255,255,0) 60%),radial-gradient(circle at 100% 12%,rgba(92,10,31,.13),rgba(92,10,31,0) 34%);opacity:.9}
#predictzone .football-detail-scoreboard{position:relative;display:grid;grid-template-columns:1fr 58px 1fr;align-items:center;gap:10px;border-radius:34px;padding:22px 14px;background:linear-gradient(180deg,rgba(255,255,255,.055),rgba(255,255,255,.026));box-shadow:0 24px 64px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.11);overflow:hidden;-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}
#predictzone .football-detail-scoreboard:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 18% 8%,rgba(255,255,255,.08),transparent 30%),radial-gradient(circle at 84% 12%,rgba(92,10,31,.24),transparent 38%);pointer-events:none}
#predictzone .football-detail-side{position:relative;z-index:1;display:grid;justify-items:center;gap:10px;min-width:0}
#predictzone .football-detail-logo{width:86px!important;height:86px!important}
#predictzone .football-detail-side b{font-size:21px;font-weight:950;letter-spacing:-.06em;color:#fff;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:center}
#predictzone .football-detail-vs{position:relative;z-index:1;width:58px;height:58px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.07);box-shadow:inset 0 1px 0 rgba(255,255,255,.12);font-size:15px;font-weight:950;color:#fff}
#predictzone .football-detail-question{display:grid;gap:4px;text-align:left;padding:0 4px}
#predictzone .football-detail-question strong{font-size:25px;font-weight:950;letter-spacing:-.07em;color:#fff;line-height:1}
#predictzone .football-detail-question span{font-size:12px;font-weight:760;color:rgba(255,255,255,.48)}
#predictzone .football-detail-picks{display:grid;grid-template-columns:1fr .82fr 1fr;gap:8px}
#predictzone .football-detail-pick{height:58px;border:0;border-radius:999px;background:rgba(255,255,255,.055);box-shadow:0 16px 36px rgba(0,0,0,.20),inset 0 1px 0 rgba(255,255,255,.11);color:#fff;display:grid;align-content:center;justify-items:center;gap:3px;padding:0 9px;text-align:center;transition:transform .18s ease,background .18s ease,box-shadow .18s ease;min-width:0}
#predictzone .football-detail-pick:active{transform:scale(.985)}
#predictzone .football-detail-pick.selected{background:rgba(92,10,31,.28);box-shadow:0 18px 42px rgba(0,0,0,.24),0 0 30px rgba(143,23,56,.14),inset 0 1px 0 rgba(255,255,255,.16)}
#predictzone .football-detail-pick span{font-size:13px;font-weight:950;letter-spacing:-.055em;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}
#predictzone .football-detail-pick b{display:block;background:transparent;color:rgba(255,255,255,.52);font-size:9px;font-weight:900;white-space:nowrap;line-height:1}
#predictzone .football-detail-pick.selected b{color:#fff}
#predictzone .football-confirm-pick{height:52px;border:0;border-radius:999px;background:rgba(143,23,56,.30);color:#fff;font-size:15px;font-weight:950;letter-spacing:-.035em;box-shadow:0 18px 40px rgba(0,0,0,.24),inset 0 1px 0 rgba(255,255,255,.14)}
#predictzone .football-confirm-pick:disabled{background:rgba(255,255,255,.06);color:rgba(255,255,255,.46)}
#predictzone .football-pick-status{min-height:16px;margin:0;text-align:center;color:rgba(255,255,255,.58);font-size:12px;font-weight:760;letter-spacing:-.02em}
#predictzone .football-live-questions{display:grid;gap:10px;margin-top:2px}
#predictzone .football-live-questions-head{display:flex;align-items:center;justify-content:space-between;padding:0 4px;color:#fff}
#predictzone .football-live-questions-head strong{font-size:18px;font-weight:950;letter-spacing:-.055em}.football-live-questions-head span{font-size:11px;font-weight:850;color:rgba(255,255,255,.45)}
#predictzone .football-live-question-row{display:grid;grid-template-columns:minmax(0,1fr) 58px auto;align-items:center;gap:8px;min-height:58px;padding:9px 10px;border-radius:24px;background:rgba(255,255,255,.04);box-shadow:0 14px 34px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.09)}
#predictzone .football-live-question-row>span{font-size:12px;font-weight:900;color:#fff;letter-spacing:-.035em;line-height:1.15}
#predictzone .football-live-question-row>b{height:34px;display:grid;place-items:center;border-radius:999px;background:rgba(92,10,31,.22);color:#fff;font-size:12px;font-weight:950;font-variant-numeric:tabular-nums;box-shadow:inset 0 1px 0 rgba(255,255,255,.10)}
#predictzone .football-live-question-row>b.is-ticking{transform:scale(1.04);color:#ffcad5}
#predictzone .football-live-actions{display:flex;gap:6px}.football-live-actions button{height:34px;min-width:42px;border:0;border-radius:999px;background:rgba(255,255,255,.07);color:#fff;font-size:11px;font-weight:950;box-shadow:inset 0 1px 0 rgba(255,255,255,.10)}
@keyframes footballDetailIn{from{opacity:0;transform:translateX(18px) scale(.985)}to{opacity:1;transform:none}}
@media(max-width:380px){#predictzone .football-team-logo{width:58px;height:58px}#predictzone .football-team b{font-size:12px}#predictzone .football-vs{width:42px;height:42px}#predictzone .football-pick-row button{height:39px;font-size:11px}#predictzone .football-detail-logo{width:74px!important;height:74px!important}#predictzone .football-detail-side b{font-size:18px}#predictzone .football-detail-scoreboard{grid-template-columns:1fr 50px 1fr;padding:18px 12px}#predictzone .football-detail-vs{width:50px;height:50px}#predictzone .football-detail-question strong{font-size:22px}#predictzone .football-detail-pick{height:54px;border-radius:22px}#predictzone .football-detail-pick span{font-size:11px}#predictzone .football-live-question-row{grid-template-columns:minmax(0,1fr) 52px auto;gap:6px}.football-live-actions button{min-width:36px}}
`;