export const SLOT_SECTION = `
<section id="slot" class="view slot-view">
  <div class="slot-machine" aria-label="Slot machine game">
    <img id="slotFrameImage" class="slot-frame-image" alt="" aria-hidden="true"/>

    <div class="slot-window" aria-hidden="true">
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

    <button id="slotSpinButton" class="slot-spin-button" type="button">
      Spin
    </button>
  </div>
</section>
`;