export const SECTION_LOCK_BACKGROUND_FIX_STYLES = `
/*
 * Regular locked/code-locked sections should show a modal-style overlay above
 * the current page. Do not hide or replace the section content here.
 * The full black replacement UI is reserved for section-loading-mode in
 * SECTION_LOADING_LOCK_SCRIPT.
 */
.view.has-section-lock-overlay{
  overflow:auto!important;
}
.view.has-section-lock-overlay>.section-locked-view:not(.section-loading-mode){
  position:fixed!important;
  inset:0!important;
  min-height:100dvh!important;
  width:100vw!important;
  display:grid!important;
  place-items:center!important;
  padding:24px 24px calc(24px + env(safe-area-inset-bottom))!important;
  background:rgba(0,0,0,.36)!important;
  background-color:rgba(0,0,0,.36)!important;
  -webkit-backdrop-filter:blur(10px) saturate(1.08)!important;
  backdrop-filter:blur(10px) saturate(1.08)!important;
  z-index:9999!important;
}
.view.has-section-lock-overlay>.section-locked-view:not(.section-loading-mode)::before{
  display:none!important;
}
.view.has-section-lock-overlay>.section-locked-view:not(.section-loading-mode)>.section-locked-card{
  width:min(78vw,320px)!important;
  max-width:320px!important;
  padding:18px!important;
  border-radius:28px!important;
  background:linear-gradient(180deg,rgba(30,20,26,.88),rgba(8,8,8,.78))!important;
  border:1px solid rgba(255,255,255,.14)!important;
  box-shadow:0 24px 80px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.12)!important;
  -webkit-backdrop-filter:blur(18px) saturate(1.25)!important;
  backdrop-filter:blur(18px) saturate(1.25)!important;
}
body.section-code-keyboard-open .view.has-section-lock-overlay>.section-locked-view:not(.section-loading-mode){
  align-items:end!important;
  padding-bottom:calc(var(--section-keyboard-inset) + 74px)!important;
}
`;