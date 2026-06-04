export const SLOT_SECTION = `
<section id="slot" class="view slot-view" style="overflow-x:hidden;max-width:100vw">
  <div class="slot-machine" aria-label="Interactive section">
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

  </div>

  <div class="slot-control-panel">
    <div class="slot-controls slot-image-controls">
      <button id="slotSpinButton" class="slot-image-control slot-spin-button" type="button" aria-label="Start">
        <img id="slotSpinButtonImage" class="slot-control-image" alt="" aria-hidden="true"/>
        <span class="slot-control-fallback">Start</span>
      </button>
      <label class="slot-image-control slot-input-control" aria-label="Amount">
        <img id="slotInputButtonImage" class="slot-control-image" alt="" aria-hidden="true"/>
        <input id="slotAmount" inputmode="decimal" pattern="[0-9.]*" value="0.01"/>
      </label>
    </div>
  </div>
</section>
`;
