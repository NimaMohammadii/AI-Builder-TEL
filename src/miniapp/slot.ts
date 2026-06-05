export const SLOT_SECTION = `
<section id="slot" class="view slot-view" style="overflow-x:hidden;max-width:100vw;transform:translateY(-10px)">
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

  <div class="slot-control-panel" style="margin-top:-220px;overflow:hidden;max-width:100vw;background:transparent!important;border:0!important;box-shadow:none!important;clip-path:inset(18px 0 0 0)">
    <div class="slot-controls slot-image-controls" style="width:88%;gap:2px;overflow:hidden">
      <button id="slotSpinButton" class="slot-image-control slot-spin-button" type="button" aria-label="Start" style="height:150px;overflow:hidden;background:transparent!important;border:0!important;box-shadow:none!important;border-radius:24px!important">
        <img id="slotSpinButtonImage" class="slot-control-image" alt="" aria-hidden="true" style="inset:0;width:100%;height:100%;border:0!important;box-shadow:none!important;background:transparent!important"/>
        <span class="slot-control-fallback">Start</span>
      </button>
      <label class="slot-image-control slot-input-control" aria-label="Amount" style="height:150px;overflow:hidden;background:transparent!important;border:0!important;box-shadow:none!important;border-radius:24px!important;transform:translateX(-6px)">
        <img id="slotInputButtonImage" class="slot-control-image" alt="" aria-hidden="true" style="inset:0;width:100%;height:100%;border:0!important;box-shadow:none!important;background:transparent!important"/>
        <input id="slotAmount" inputmode="decimal" pattern="[0-9.]*" value="0.01" style="font-size:22px"/>
      </label>
    </div>
  </div>

  <div class="slot-live open" id="slotLive" style="margin-top:-18px!important">
    <div class="slot-live-head">
      <span class="slot-live-title">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.2 11.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"/><path d="M3.4 18.4c.6-3 2.3-4.6 4.8-4.6s4.2 1.6 4.8 4.6"/><path d="M16.3 10.2a2.6 2.6 0 1 0 0-5.2"/><path d="M15.4 13.6c2.4.2 3.9 1.7 4.4 4.3"/></svg>
        <span>Live Bets</span>
      </span>
      <div class="slot-live-head-actions">
        <button id="slotLiveToggle" class="slot-live-toggle" type="button" aria-label="Toggle live slot results" aria-expanded="true">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5"/></svg>
        </button>
      </div>
    </div>
    <div class="slot-live-list" id="slotLiveList"><div class="slot-live-empty">Loading players</div></div>
  </div>
</section>
`;