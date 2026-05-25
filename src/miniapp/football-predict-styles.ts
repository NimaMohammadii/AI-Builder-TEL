export const FOOTBALL_PREDICT_STYLES = `
#predictzone .football-predict-view{display:none;padding:0 0 98px}
#predictzone.football-predict-open .football-predict-view{display:grid;gap:14px}
#predictzone.football-predict-open [data-vexa-predict-group-grid],#predictzone.football-predict-open [data-predict-card]{display:none!important}
#predictzone .football-hero{position:relative;border-radius:30px;padding:18px;background:rgba(255,255,255,.04);box-shadow:0 24px 60px rgba(0,0,0,.30),inset 0 1px 0 rgba(255,255,255,.10);overflow:hidden;backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}
#predictzone .football-hero:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 18% 10%,rgba(255,255,255,.09),transparent 32%),radial-gradient(circle at 88% 14%,rgba(92,10,31,.22),transparent 36%),linear-gradient(135deg,rgba(255,255,255,.045),transparent 48%);pointer-events:none}
#predictzone .football-hero>*{position:relative;z-index:1}
#predictzone .football-kicker{display:inline-flex;height:28px;align-items:center;padding:0 10px;border-radius:999px;background:rgba(255,255,255,.08);color:rgba(255,255,255,.78);font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.08em}
#predictzone .football-title{margin:12px 0 6px;font-size:25px;line-height:.95;font-weight:950;letter-spacing:-.075em;color:#fff}
#predictzone .football-sub{margin:0;color:rgba(255,255,255,.54);font-size:12px;font-weight:700;line-height:1.35;letter-spacing:-.025em}
#predictzone .football-match-list{display:grid;gap:13px}
#predictzone .football-match-card{position:relative;border:0;border-radius:30px;padding:15px;background:rgba(255,255,255,.038);box-shadow:0 20px 52px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.10);overflow:hidden;color:#fff;text-align:left;backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}
#predictzone .football-match-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:14px}
#predictzone .football-match-tag{height:26px;display:inline-flex;align-items:center;padding:0 9px;border-radius:999px;background:rgba(255,255,255,.065);font-size:10px;font-weight:900;color:rgba(255,255,255,.72);letter-spacing:-.02em}
#predictzone .football-match-time{font-size:10px;font-weight:850;color:rgba(255,255,255,.44);white-space:nowrap}
#predictzone .football-teams{display:grid;grid-template-columns:1fr 48px 1fr;align-items:center;gap:8px}
#predictzone .football-team{display:grid;justify-items:center;gap:8px;min-width:0}
#predictzone .football-team-logo{width:66px;height:66px;background-position:center;background-repeat:no-repeat;background-size:contain;filter:drop-shadow(0 14px 20px rgba(0,0,0,.34))}
#predictzone .football-team-logo:not(.has-logo){border-radius:50%;background:rgba(255,255,255,.06);box-shadow:inset 0 1px 0 rgba(255,255,255,.10)}
#predictzone .football-team b{font-size:14px;font-weight:950;letter-spacing:-.045em;color:#fff;text-align:center;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#predictzone .football-vs{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.07);box-shadow:inset 0 1px 0 rgba(255,255,255,.10);font-size:12px;font-weight:950;color:rgba(255,255,255,.82)}
#predictzone .football-pick-row{display:grid;grid-template-columns:1fr .82fr 1fr;gap:7px;margin-top:14px}
#predictzone .football-pick-row button{height:42px;border:0;border-radius:999px;background:rgba(255,255,255,.06);box-shadow:0 12px 26px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.10);color:#fff;font-size:12px;font-weight:900;letter-spacing:-.035em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 10px}
#predictzone .football-live-box{display:grid;gap:10px;margin-top:13px;padding-top:12px;border-top:1px solid rgba(255,255,255,.08)}
#predictzone .football-live-title{display:flex;align-items:center;justify-content:space-between;color:rgba(255,255,255,.72);font-size:11px;font-weight:900;letter-spacing:-.025em}
#predictzone .football-live-title i{width:7px;height:7px;border-radius:50%;background:#32ff7e;box-shadow:0 0 12px rgba(50,255,126,.5);display:inline-block;margin-right:6px}
#predictzone .football-live-question{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;padding:10px;border-radius:20px;background:rgba(0,0,0,.18);box-shadow:inset 0 1px 0 rgba(255,255,255,.06)}
#predictzone .football-live-question span{font-size:12px;font-weight:850;color:#fff;letter-spacing:-.035em}
#predictzone .football-live-actions{display:flex;gap:6px}
#predictzone .football-live-actions button{height:30px;min-width:46px;border:0;border-radius:999px;background:rgba(255,255,255,.07);color:#fff;font-size:11px;font-weight:900}
@media(max-width:380px){#predictzone .football-title{font-size:22px}#predictzone .football-team-logo{width:58px;height:58px}#predictzone .football-team b{font-size:12px}#predictzone .football-vs{width:42px;height:42px}#predictzone .football-pick-row button{height:39px;font-size:11px}}
`;
