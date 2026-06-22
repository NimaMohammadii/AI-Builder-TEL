export const GHOST_RUN_STYLES = `
body:has(#ghostrun.active) .tabs {
  display: none !important;
}
#ghostrun.ghost-run-view {
  min-height: 100% !important;
  background: transparent !important;
  padding: 0 !important;
  overflow: hidden !important;
}
#ghostrun .ghost-run-stage {
  width: 100%;
  min-height: 100%;
  background: transparent;
}
`;
