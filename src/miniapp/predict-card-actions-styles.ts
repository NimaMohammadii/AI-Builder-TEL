export const PREDICT_CARD_ACTIONS_STYLES = `
#predictzone.predict-card-list-mode .top-balance-pill{display:none!important}
#predictzone.predict-card-list-mode .predict-zone-mode-card,
#predictzone.predict-card-list-mode .predict-mode-card,
#predictzone.predict-card-list-mode [data-predict-mode-card],
#predictzone.predict-card-list-mode [data-predict-kind-card]{display:none!important}
#predictzone .predict-card-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:-4px 4px 10px}
#predictzone .predict-card-actions button,#predictzone .predict-zone-actions .predict-zone-choice{height:42px!important;border:0!important;border-radius:999px!important;background:rgba(255,255,255,.055)!important;color:#fff!important;font-size:14px!important;font-weight:900!important;letter-spacing:-.035em!important;box-shadow:0 12px 26px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.10)!important;-webkit-backdrop-filter:blur(3px)!important;backdrop-filter:blur(3px)!important;padding:0!important;overflow:visible!important;display:flex!important;align-items:center!important;justify-content:center!important;text-align:center!important}
#predictzone .predict-card-actions button[data-predict-card-side="up"],#predictzone .predict-zone-actions .predict-zone-choice-up,#predictzone .predict-zone-actions .predict-zone-choice-up.has-uploaded-image{background:rgba(34,197,94,.18)!important;box-shadow:0 12px 26px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.10)!important;color:#fff!important}
#predictzone .predict-card-actions button[data-predict-card-side="down"],#predictzone .predict-zone-actions .predict-zone-choice-down,#predictzone .predict-zone-actions .predict-zone-choice-down.has-uploaded-image{background:rgba(92,10,31,.18)!important;box-shadow:0 12px 26px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.10)!important;color:#fff!important}
#predictzone .predict-zone-actions .predict-zone-choice.has-uploaded-image{border:0!important;padding:0!important;overflow:visible!important}
#predictzone .predict-zone-actions .predict-zone-choice.has-uploaded-image .predict-zone-choice-image{display:none!important;background-image:none!important}
#predictzone .predict-zone-actions .predict-zone-choice.has-uploaded-image .predict-zone-choice-label{position:static!important;width:auto!important;height:auto!important;overflow:visible!important;clip:auto!important;white-space:normal!important;display:block!important}
@media(max-width:380px){#predictzone .predict-card-actions button,#predictzone .predict-zone-actions .predict-zone-choice{height:39px!important;font-size:13px!important}}
`;
