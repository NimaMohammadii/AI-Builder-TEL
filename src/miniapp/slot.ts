export const SLOT_SECTION = `
<section id="slot" class="view slot-view">
  <div class="slot-topbar">
    <button id="slotBackButton" class="slot-back-button" type="button" aria-label="Back to Play Zone">
      <span>‹</span>
      <b>Play Zone</b>
    </button>
  </div>

  <div class="slot-machine" aria-label="Slot machine game">
    <div class="slot-frame-glow"></div>

    <div class="slot-window" aria-hidden="true">
      <div class="slot-payline"></div>
      <div class="slot-reel" data-slot-reel="0">
        <div class="slot-reel-strip"></div>
      </div>
      <div class="slot-reel" data-slot-reel="1">
        <div class="slot-reel-strip"></div>
      </div>
      <div class="slot-reel" data-slot-reel="2">
        <div class="slot-reel-strip"></div>
      </div>
      <div class="slot-reel" data-slot-reel="3">
        <div class="slot-reel-strip"></div>
      </div>
    </div>

    <div class="slot-status-card">
      <span id="slotStatusText">Ready to spin</span>
    </div>

    <button id="slotSpinButton" class="slot-spin-button" type="button">
      Spin
    </button>
  </div>
</section>
`;
