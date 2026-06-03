export const SECTION_LOCK_BACKGROUND_FIX_STYLES = `
body.section-lock-screen-active,
body.section-lock-screen-active .app,
body.section-lock-screen-active .content,
body.section-lock-screen-active .view.active{
  background:#000!important;
  background-color:#000!important;
  background-image:none!important;
  box-shadow:none!important;
}
body.section-lock-screen-active::before,
body.section-lock-screen-active::after,
body.section-lock-screen-active .app::before,
body.section-lock-screen-active .app::after{
  opacity:0!important;
  visibility:hidden!important;
}
body.section-lock-screen-active .top,
body.section-lock-screen-active .tabs{
  opacity:0!important;
  visibility:hidden!important;
  pointer-events:none!important;
}
body.section-lock-screen-active .content,
body.section-lock-screen-active .view.active{
  overflow:hidden!important;
}
.view.is-section-locked{
  position:relative!important;
  background:#000!important;
  background-color:#000!important;
  background-image:none!important;
  overflow:hidden!important;
  isolation:isolate!important;
}
.view.is-section-locked>.section-locked-view{
  position:fixed!important;
  inset:0!important;
  min-height:100dvh!important;
  width:100vw!important;
  background:#000!important;
  background-color:#000!important;
  background-image:none!important;
  z-index:98!important;
  padding:calc(22px + env(safe-area-inset-top)) 24px calc(28px + env(safe-area-inset-bottom))!important;
}
.view.is-section-locked>.section-locked-view::before{
  content:"";
  position:absolute;
  inset:0;
  background:#000;
  z-index:-1;
}
body.section-lock-code-active .view.is-section-locked>.section-code-view{
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
}
body.section-code-keyboard-open .view.is-section-locked>.section-code-view{
  z-index:120!important;
}
`;
