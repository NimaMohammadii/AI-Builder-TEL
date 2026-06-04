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

  <div class="slot-control-panel" style="margin-top:-178px;overflow:hidden;max-width:100vw;background:transparent!important;border:0!important;box-shadow:none!important">
    <div class="slot-controls slot-image-controls" style="width:92%;gap:16px;overflow:hidden">
      <button id="slotSpinButton" class="slot-image-control slot-spin-button" type="button" aria-label="Start" style="height:122px;overflow:hidden;background:transparent!important;border:0!important;box-shadow:none!important;border-radius:24px!important">
        <img id="slotSpinButtonImage" class="slot-control-image" alt="" aria-hidden="true" style="inset:0;width:100%;height:100%;border:0!important;box-shadow:none!important;background:transparent!important"/>
        <span class="slot-control-fallback">Start</span>
      </button>
      <label class="slot-image-control slot-input-control" aria-label="Amount" style="height:122px;overflow:hidden;background:transparent!important;border:0!important;box-shadow:none!important;border-radius:24px!important">
        <img id="slotInputButtonImage" class="slot-control-image" alt="" aria-hidden="true" style="inset:0;width:100%;height:100%;border:0!important;box-shadow:none!important;background:transparent!important"/>
        <input id="slotAmount" inputmode="decimal" pattern="[0-9.]*" value="0.01" style="font-size:22px"/>
      </label>
    </div>
  </div>
</section>
`;
