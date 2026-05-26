export const FOOTBALL_PREDICT_STYLES = `
#predictzone .football-predict-view{display:none;padding:0 0 98px}
#predictzone.football-predict-open .football-predict-view{display:grid;gap:14px}
#predictzone.football-predict-open [data-vexa-predict-group-grid],#predictzone.football-predict-open [data-predict-card],#predictzone.football-predict-open .predict-toolbar-row,#predictzone.football-predict-open .predict-card-actions{display:none!important}
#predictzone .football-hero{position:relative;border-radius:30px;padding:18px;background:rgba(255,255,255,.04);box-shadow:0 24px 60px rgba(0,0,0,.30),inset 0 1px 0 rgba(255,255,255,.10);overflow:hidden;backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}
#predictzone .football-hero:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 18% 10%,rgba(255,255,255,.09),transparent 32%),radial-gradient(circle at 88% 14%,rgba(92,10,31,.22),transparent 36%),linear-gradient(135deg,rgba(255,255,255,.045),transparent 48%);pointer-events:none}
#predictzone .football-hero>*{position:relative;z-index:1}
#predictzone .football-kicker{display:inline-flex;height:28px;align-items:center;padding:0 10px;border-radius:999px;background:rgba(255,255,255,.08);color:rgba(255,255,255,.78);font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.08em}
#predictzone .football-title{margin:12px 0 6px;font-size:25px;line-height:.95;font-weight:950;letter-spacing:-.075em;color:#fff}
#predictzone .football-sub{margin:0;color:rgba(255,255,255,.54);font-size:12px;font-weight:700;line-height:1.35;letter-spacing:-.025em}
#predictzone .football-match-list{display:grid;gap:13px}
#predictzone .football-match-card{position:relative;border:0;border-radius:30px;padding:15px;background:rgba(255,255,255,.038);box-shadow:0 20px 52px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.10);overflow:hidden;color:#fff;text-align:left;backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}
#predictzone .football-match-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:14px}
#predictzone .football-match-left{display:inline-flex;align-items:center;gap:7px;min-width:0}
#predictzone .football-match-tag{height:26px;display:inline-flex;align-items:center;padding:0 9px;border-radius:999px;background:rgba(255,255,255,.065);font-size:10px;font-weight:900;color:rgba(255,255,255,.72);letter-spacing:-.02em;white-space:nowrap}
#predictzone .football-live-badge{height:26px;display:inline-flex;align-items:center;gap:5px;padding:0 9px;border-radius:999px;background:rgba(92,10,31,.26);color:#8f1738;font-size:10px;font-weight:950;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap;box-shadow:0 0 18px rgba(92,10,31,.18),inset 0 1px 0 rgba(255,255,255,.08)}
#predictzone .football-live-dot{width:7px;height:7px;border-radius:50%;background:#8f1738;box-shadow:0 0 0 0 rgba(143,23,56,.52);animation:footballLivePulse 1.15s ease-in-out infinite;flex:0 0 auto}
@keyframes footballLivePulse{0%,100%{transform:scale(.86);box-shadow:0 0 0 0 rgba(143,23,56,.42);opacity:.72}50%{transform:scale(1.12);box-shadow:0 0 0 7px rgba(143,23,56,0);opacity:1}}
#predictzone .football-match-time{font-size:10px;font-weight:850;color:rgba(255,255,255,.44);white-space:nowrap}
#predictzone .football-teams{display:grid;grid-template-columns:1fr 48px 1fr;align-items:center;gap:8px}
#predictzone .football-team{display:grid;justify-items:center;gap:8px;min-width:0}
#predictzone .football-team-logo{width:66px;height:66px;background-position:center;background-repeat:no-repeat;background-size:contain;filter:drop-shadow(0 14px 20px rgba(0,0,0,.34))}
#predictzone .football-team-logo:not(.has-logo){border-radius:50%;background:rgba(255,255,255,.06);box-shadow:inset 0 1px 0 rgba(255,255,255,.10)}
#predictzone .football-team b{font-size:14px;font-weight:950;letter-spacing:-.045em;color:#fff;text-align:center;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#predictzone .football-vs{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.07);box-shadow:inset 0 1px 0 rgba(255,255,255,.10);font-size:12px;font-weight:950;color:rgba(255,255,255,.82)}
#predictzone .football-pick-row{display:grid;grid-template-columns:1fr .82fr 1fr;gap:7px;margin-top:14px}
#predictzone .football-pick-row button{height:42px;border:0;border-radius:999px;background:rgba(255,255,255,.06);box-shadow:0 12px 26px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.10);color:#fff;font-size:12px;font-weight:900;letter-spacing:-.035em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 10px}
#predictzone .football-detail-view{display:grid;gap:12px;animation:footballDetailIn .22s ease-out both}
#predictzone .football-detail-back{justify-self:start;height:38px;border:0;border-radius:999px;background:rgba(255,255,255,.065);color:#fff;padding:0 14px;font-size:13px;font-weight:900;box-shadow:0 14px 32px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.10);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}
#predictzone .football-detail-card{position:relative;border-radius:32px;padding:16px;background:rgba(255,255,255,.04);box-shadow:0 24px 64px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.11);overflow:hidden;color:#fff;-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}
#predictzone .football-detail-card:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 18% 8%,rgba(255,255,255,.08),transparent 30%),radial-gradient(circle at 84% 12%,rgba(92,10,31,.24),transparent 38%);pointer-events:none}
#predictzone .football-detail-card>*{position:relative;z-index:1}
#predictzone .football-detail-title{display:grid;gap:4px;margin:10px 0 14px;text-align:center}
#predictzone .football-detail-title strong{font-size:25px;font-weight:950;letter-spacing:-.065em;color:#fff}
#predictzone .football-detail-title span{font-size:12px;font-weight:760;color:rgba(255,255,255,.50);letter-spacing:-.025em}
#predictzone .football-detail-teams{display:grid;grid-template-columns:1fr;gap:10px}
#predictzone .football-winner-card{min-height:104px;border:0;border-radius:26px;background:rgba(255,255,255,.055);box-shadow:0 16px 36px rgba(0,0,0,.20),inset 0 1px 0 rgba(255,255,255,.11);color:#fff;display:grid;grid-template-columns:76px minmax(0,1fr) auto;align-items:center;gap:10px;padding:12px;text-align:left;transition:transform .18s ease,background .18s ease,box-shadow .18s ease}
#predictzone .football-winner-card:active{transform:scale(.985)}
#predictzone .football-winner-card.selected{background:rgba(92,10,31,.28);box-shadow:0 18px 42px rgba(0,0,0,.24),0 0 30px rgba(143,23,56,.14),inset 0 1px 0 rgba(255,255,255,.16)}
#predictzone .football-winner-card .football-team-logo{width:64px;height:64px}
#predictzone .football-winner-card b{font-size:19px;font-weight:950;letter-spacing:-.055em;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#predictzone .football-winner-card span{height:30px;display:inline-flex;align-items:center;padding:0 11px;border-radius:999px;background:rgba(255,255,255,.07);color:rgba(255,255,255,.70);font-size:11px;font-weight:900;white-space:nowrap}
#predictzone .football-winner-card.selected span{background:rgba(143,23,56,.34);color:#fff}
#predictzone .football-winner-draw i{width:64px;height:64px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.07);box-shadow:inset 0 1px 0 rgba(255,255,255,.12);font-style:normal;font-size:14px;font-weight:950;color:#fff}
#predictzone .football-submit-pick{height:50px;margin-top:14px;border:0;border-radius:999px;background:rgba(143,23,56,.30);color:#fff;font-size:14px;font-weight:950;letter-spacing:-.035em;box-shadow:0 18px 40px rgba(0,0,0,.24),inset 0 1px 0 rgba(255,255,255,.14)}
#predictzone .football-submit-pick:disabled{background:rgba(255,255,255,.06);color:rgba(255,255,255,.46)}
#predictzone .football-pick-status{min-height:16px;margin:10px 0 0;text-align:center;color:rgba(255,255,255,.58);font-size:12px;font-weight:760;letter-spacing:-.02em}
@keyframes footballDetailIn{from{opacity:0;transform:translateY(10px) scale(.985)}to{opacity:1;transform:none}}
#predictzone .football-live-box{display:grid;gap:10px;margin-top:13px;padding-top:12px;border-top:1px solid rgba(255,255,255,.08)}
#predictzone .football-live-title{display:flex;align-items:center;justify-content:space-between;color:rgba(255,255,255,.72);font-size:11px;font-weight:900;letter-spacing:-.025em}
#predictzone .football-live-title i{width:7px;height:7px;border-radius:50%;background:#32ff7e;box-shadow:0 0 12px rgba(50,255,126,.5);display:inline-block;margin-right:6px}
#predictzone .football-live-question{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;padding:10px;border-radius:20px;background:rgba(0,0,0,.18);box-shadow:inset 0 1px 0 rgba(255,255,255,.06)}
#predictzone .football-live-question span{font-size:12px;font-weight:850;color:#fff;letter-spacing:-.035em}
#predictzone .football-live-actions{display:flex;gap:6px}
#predictzone .football-live-actions button{height:30px;min-width:46px;border:0;border-radius:999px;background:rgba(255,255,255,.07);color:#fff;font-size:11px;font-weight:900}
@media(max-width:380px){#predictzone .football-title{font-size:22px}#predictzone .football-team-logo{width:58px;height:58px}#predictzone .football-team b{font-size:12px}#predictzone .football-vs{width:42px;height:42px}#predictzone .football-pick-row button{height:39px;font-size:11px}#predictzone .football-detail-title strong{font-size:22px}#predictzone .football-winner-card{grid-template-columns:68px minmax(0,1fr) auto;min-height:94px;padding:10px}#predictzone .football-winner-card .football-team-logo,#predictzone .football-winner-draw i{width:56px;height:56px}#predictzone .football-winner-card b{font-size:17px}}
`;