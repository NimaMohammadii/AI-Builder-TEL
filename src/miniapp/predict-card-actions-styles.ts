export const PREDICT_CARD_ACTIONS_STYLES = `
#predictzone.predict-card-list-mode .top-balance-pill{display:none!important}
#predictzone.predict-card-list-mode .predict-zone-mode-card,
#predictzone.predict-card-list-mode .predict-mode-card,
#predictzone.predict-card-list-mode [data-predict-mode-card],
#predictzone.predict-card-list-mode [data-predict-kind-card]{display:none!important}
#predictzone .predict-card-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:-4px 4px 10px}
#predictzone .predict-card-actions button{height:42px;border:0;border-radius:999px;background:rgba(255,255,255,.055);color:#fff;font-size:14px;font-weight:900;letter-spacing:-.035em;box-shadow:0 12px 26px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.10);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}
#predictzone .predict-card-actions button[data-predict-card-side="up"]{background:rgba(255,255,255,.095)}
#predictzone .predict-card-actions button[data-predict-card-side="down"]{background:rgba(92,10,31,.18)}
#predictzone .predict-zone-choice.has-uploaded-image{background:rgba(255,255,255,.04)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.10),0 14px 26px rgba(0,0,0,.12)!important;border:0!important;padding:0!important;overflow:visible!important;color:#fff!important}
#predictzone .predict-zone-choice.has-uploaded-image .predict-zone-choice-image{display:none!important;background-image:none!important}
#predictzone .predict-zone-choice.has-uploaded-image .predict-zone-choice-label{position:static!important;width:auto!important;height:auto!important;overflow:visible!important;clip:auto!important;white-space:normal!important}
#predictzone .predict-zone-choice-up.has-uploaded-image{background:linear-gradient(135deg,rgba(255,255,255,.10),rgba(255,255,255,.035))!important}
#predictzone .predict-zone-choice-down.has-uploaded-image{background:rgba(255,255,255,.03)!important;color:rgba(255,255,255,.86)!important}
@media(max-width:380px){#predictzone .predict-card-actions button{height:39px;font-size:13px}}
`;
