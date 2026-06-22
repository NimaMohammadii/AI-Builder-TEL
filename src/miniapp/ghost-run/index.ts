export const GHOST_RUN_SECTION = `
<section id="ghostrun" class="view ghost-run-view" aria-label="Ghost Run">
  <div class="ghost-run-empty" aria-hidden="true"></div>
</section>
`;

export const GHOST_RUN_STYLES = `
#ghostrun.ghost-run-view {
  min-height: 100dvh !important;
  background: #000 !important;
  padding: 0 !important;
  overflow: hidden !important;
}
#ghostrun .ghost-run-empty {
  width: 100%;
  min-height: 100dvh;
  background: #000;
}
body:has(#ghostrun.active) .content,
body:has(#ghostrun.active) .view.active,
body:has(#ghostrun.active) header.top {
  background: #000 !important;
}
`;
