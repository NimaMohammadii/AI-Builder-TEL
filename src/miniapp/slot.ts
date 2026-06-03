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

    <div class="slot-marquee">
      <span class="slot-bulbs slot-bulbs-left" aria-hidden="true"></span>
      <strong>VEXA SLOTS</strong>
      <span class="slot-bulbs slot-bulbs-right" aria-hidden="true"></span>
    </div>

    <div class="slot-cabinet-body">
      <div class="slot-side-lights slot-side-lights-left" aria-hidden="true"></div>
      <div class="slot-side-lights slot-side-lights-right" aria-hidden="true"></div>

      <div class="slot-window" aria-hidden="true">
        <div class="slot-payline"></div>
        <div class="slot-glass-shine"></div>

        <div class="slot-reel" data-slot-reel="0">
          <div class="slot-reel-strip"></div>
        </div>
        <div class="slot-reel" data-slot-reel="1">
          <div class="slot-reel-strip"></div>
        </div>
        <div class="slot-reel" data-slot-reel="2">
          <div class="slot-reel-strip"></div>
        </div>
      </div>

      <button id="slotLever" class="slot-lever" type="button" aria-label="Pull slot lever">
        <span class="slot-lever-knob"></span>
        <span class="slot-lever-stick"></span>
      </button>
    </div>

    <div class="slot-control-panel">
      <div class="slot-status-card">
        <span id="slotStatusText">Ready to spin</span>
      </div>

      <button id="slotSpinButton" class="slot-spin-button" type="button">
        Spin
      </button>
    </div>
  </div>
</section>
`;
