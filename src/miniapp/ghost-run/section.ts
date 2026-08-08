export const GHOST_RUN_SECTION = `
<section id="ghostrun" class="view ghost-run-view" aria-label="Ghost Run">
  <style>
    [data-lazy-section-host="ghostrun"]{display:contents!important}
    body:has(#ghostrun.active) .content,body:has(#ghostrun.active) .view.active{overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important}
    #ghostrun{width:100vw!important;width:100dvw!important;max-width:100vw!important;max-width:100dvw!important;margin-left:calc(50% - 50vw)!important;margin-right:calc(50% - 50vw)!important}
    #ghostrun.ghost-run-view{height:100%!important;min-height:0!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior-y:contain!important;scrollbar-width:none!important;-ms-overflow-style:none!important;padding:0 0 calc(128px + env(safe-area-inset-bottom))!important;touch-action:pan-y!important}
    #ghostrun.ghost-run-view::-webkit-scrollbar{display:none!important;width:0!important;height:0!important}
    #ghostrun .ghost-run-screen{width:100vw!important;width:100dvw!important;max-width:100vw!important;max-width:100dvw!important;min-height:100%!important;height:auto!important;display:flex!important;flex-direction:column!important;overflow:visible!important;padding-bottom:0!important;scrollbar-width:none!important;-ms-overflow-style:none!important}
    #ghostrun .ghost-run-screen::-webkit-scrollbar{display:none!important;width:0!important;height:0!important}
    #ghostrun .ghost-run-scene{order:1!important;width:calc(100vw - 24px)!important;width:calc(100dvw - 24px)!important;max-width:430px!important;margin:10px auto 0!important;border-radius:34px!important;box-shadow:0 24px 70px rgba(0,0,0,.50),inset 0 1px 0 rgba(255,255,255,.12)!important;background:#000!important;background-color:#000!important;background-image:none!important;border:1px solid rgba(255,255,255,.12)!important;overflow:hidden!important}
    #ghostrun .ghost-run-controls{order:2!important;margin-top:8px!important}
    #ghostrun .ghost-run-shadow-fade{display:none!important;background:none!important}
    #ghostrun .ghost-run-moon,#ghostrun .ghost-run-ground,#ghostrun .ghost-run-uploaded-trees,#ghostrun .ghost-run-uploaded-houses{display:none!important;visibility:hidden!important}
    #ghostrun .ghost-run-background-strip{position:absolute!important;left:0!important;top:0!important;bottom:0!important;width:700vw!important;width:700dvw!important;height:100%!important;z-index:1!important;display:flex!important;pointer-events:none!important;transform:translate3d(var(--ghost-bg-x,0px),0,0)!important;will-change:transform!important}
    #ghostrun .ghost-run-background-panel{flex:0 0 min(100vw - 24px,430px)!important;flex-basis:min(calc(100dvw - 24px),430px)!important;width:min(calc(100vw - 24px),430px)!important;width:min(calc(100dvw - 24px),430px)!important;height:100%!important;background-repeat:no-repeat!important;background-size:cover!important;background-position:center center!important}
    #ghostrun .ghost-run-background-panel-1{background-image:url('/app/api/ghost-run-asset/background.png')!important}
    #ghostrun .ghost-run-background-panel-2{background-image:url('/app/api/ghost-run-asset/background2.png')!important}
    #ghostrun .ghost-run-background-panel-3{background-image:url('/app/api/ghost-run-asset/background3.png')!important}
    #ghostrun .ghost-run-background-panel-4{background-image:url('/app/api/ghost-run-asset/background4.png')!important}
    #ghostrun .ghost-run-background-panel-5{background-image:url('/app/api/ghost-run-asset/background5.png')!important}
    #ghostrun .ghost-run-background-panel-6{background-image:url('/app/api/ghost-run-asset/background6.png')!important}
    #ghostrun .ghost-run-background-panel-copy{background-image:url('/app/api/ghost-run-asset/background.png')!important}
    #ghostrun .ghost-run-history{position:absolute!important;left:18px!important;right:18px!important;top:12px!important;z-index:65!important;display:flex!important;gap:6px!important;overflow-x:auto!important;overflow-y:visible!important;margin:0!important;min-height:28px!important;padding:4px!important;scrollbar-width:none!important;visibility:visible!important;opacity:1!important;clip-path:none!important;background:rgba(255,255,255,.018)!important;border:0!important;border-radius:16px!important;box-shadow:none!important;backdrop-filter:blur(2px)!important;-webkit-backdrop-filter:blur(2px)!important}
    #ghostrun .ghost-run-history::-webkit-scrollbar{display:none!important}
    #ghostrun .ghost-run-history span{flex:0 0 auto!important;border-radius:999px!important;padding:4px 8px!important;min-height:20px!important;line-height:12px!important;font-size:10px!important;font-weight:890!important;color:rgba(255,255,255,.94)!important;background:transparent!important;border:0!important;outline:0!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;overflow:visible!important;clip-path:none!important}
    #ghostrun .ghost-run-ghost{left:var(--ghost-x,16%)!important;width:64px!important;height:76px!important;bottom:76px!important;transition:left .08s linear, transform .08s linear!important}
    #ghostrun .ghost-run-move-button{height:62px!important;border-radius:999px!important;border:0!important;background:rgba(26,11,15,.54)!important;color:transparent!important;font-size:0!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.105),inset 0 -1px 0 rgba(255,255,255,.06),inset 0 0 22px rgba(255,255,255,.055),0 16px 36px rgba(0,0,0,.22)!important;backdrop-filter:blur(10px) saturate(1.12)!important;-webkit-backdrop-filter:blur(10px) saturate(1.12)!important;position:relative!important;overflow:hidden!important;touch-action:none!important;user-select:none!important;-webkit-user-select:none!important}
    #ghostrun .ghost-run-move-button:before{content:''!important;position:absolute!important;left:50%!important;top:50%!important;width:24px!important;height:24px!important;border-top:3px solid rgba(255,255,255,.92)!important;border-left:3px solid rgba(255,255,255,.92)!important;filter:drop-shadow(0 0 10px rgba(255,255,255,.22))!important}
    #ghostrun .ghost-run-move-button:after{content:''!important;position:absolute!important;left:50%!important;top:50%!important;width:42px!important;height:42px!important;border-radius:999px!important;border:1px solid rgba(255,255,255,.10)!important;transform:translate(-50%,-50%)!important}
    #ghostrun .ghost-run-back-button{grid-column:1!important}
    #ghostrun .ghost-run-forward-button{grid-column:2!important}
    #ghostrun .ghost-run-back-button:before{transform:translate(-34%,-50%) rotate(-45deg)!important}
    #ghostrun .ghost-run-forward-button:before{transform:translate(-66%,-50%) rotate(135deg)!important}
    #ghostrun .ghost-run-move-button:active,#ghostrun .ghost-run-move-button[data-holding='1']{background:rgba(26,11,15,.68)!important;transform:scale(.985)!important}
    #ghostrun .ghost-run-move-button:disabled{opacity:.28!important}
    #ghostrun .crash-live{order:3!important;margin:0 12px 10px!important;border-radius:32px!important;background:rgba(26,11,15,.54)!important;border:0!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.105),inset 0 -1px 0 rgba(255,255,255,.06),inset 0 0 22px rgba(255,255,255,.055),0 16px 36px rgba(0,0,0,.22)!important;backdrop-filter:blur(10px) saturate(1.12)!important;-webkit-backdrop-filter:blur(10px) saturate(1.12)!important;padding:14px!important;overflow:visible!important;transition:max-height .34s cubic-bezier(.2,.8,.2,1),padding .28s ease,opacity .2s ease!important;max-height:none!important;display:flex!important;flex-direction:column!important;min-height:0!important}
    #ghostrun .crash-live:not(.open){max-height:54px!important;padding-bottom:12px!important;overflow:hidden!important}
    #ghostrun .crash-live-head{display:flex!important;align-items:center!important;justify-content:space-between!important;margin-bottom:10px!important;color:rgba(255,255,255,.50)!important;font-size:13px!important;font-weight:850!important;letter-spacing:-.02em!important}
    #ghostrun .crash-live-title{display:inline-flex!important;align-items:center!important;gap:7px!important;color:rgba(255,255,255,.58)!important;min-width:0!important}
    #ghostrun .crash-live-title svg{width:17px!important;height:17px!important;color:rgba(255,255,255,.55)!important;flex:0 0 auto!important}
    #ghostrun .crash-live-title svg path{fill:none!important;stroke:currentColor!important;stroke-width:1.9!important;stroke-linecap:round!important;stroke-linejoin:round!important}
    #ghostrun .crash-live-head-actions{display:flex!important;align-items:center!important;gap:8px!important}
    #ghostrun .crash-live-head b{color:rgba(255,255,255,.92)!important;font-size:13px!important;font-weight:900!important}
    #ghostrun .crash-live-toggle{width:28px!important;height:28px!important;border:0!important;border-radius:10px!important;background:rgba(26,11,15,.54)!important;color:#fff!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:0!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.105),inset 0 -1px 0 rgba(255,255,255,.06),inset 0 0 22px rgba(255,255,255,.055),0 16px 36px rgba(0,0,0,.22)!important;backdrop-filter:blur(10px) saturate(1.12)!important;-webkit-backdrop-filter:blur(10px) saturate(1.12)!important}
    #ghostrun .crash-live-toggle svg{width:18px!important;height:18px!important;transition:transform .28s cubic-bezier(.2,.8,.2,1)!important;color:#fff!important;stroke:#fff!important;fill:none!important}
    #ghostrun .crash-live-toggle svg path{fill:none!important;stroke:#fff!important;stroke-width:2.4!important;stroke-linecap:round!important;stroke-linejoin:round!important}
    #ghostrun .crash-live.open .crash-live-toggle svg{transform:rotate(180deg)!important}
    #ghostrun .crash-live-list{display:grid!important;gap:6px!important;max-height:none!important;overflow-y:visible!important;overflow-x:hidden!important;overscroll-behavior-y:auto!important;-webkit-overflow-scrolling:touch!important;padding-right:2px!important;scrollbar-width:none!important;-ms-overflow-style:none!important}
    #ghostrun .crash-live-list::-webkit-scrollbar{display:none!important;width:0!important;height:0!important}
    #ghostrun .crash-live:not(.open) .crash-live-list{max-height:0!important;opacity:0!important;pointer-events:none!important;overflow:hidden!important}
    #ghostrun .crash-live-empty{font-size:12px!important;font-weight:820!important;color:rgba(255,255,255,.45)!important;padding:14px 0!important;text-align:center!important}
    #ghostrun .crash-live-row{display:grid!important;grid-template-columns:minmax(0,1fr) auto auto!important;align-items:center!important;gap:8px!important;min-height:34px!important;border-radius:17px!important;background:rgba(26,11,15,.54)!important;border:0!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.105),inset 0 -1px 0 rgba(255,255,255,.06),inset 0 0 22px rgba(255,255,255,.055),0 16px 36px rgba(0,0,0,.22)!important;backdrop-filter:blur(10px) saturate(1.12)!important;-webkit-backdrop-filter:blur(10px) saturate(1.12)!important;color:#fff!important;padding:2px 10px!important}
    #ghostrun .crash-live-user{min-width:0!important;font-size:12px!important;font-weight:900!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;color:rgba(255,255,255,.92)!important}
    #ghostrun .crash-live-amount{font-size:11px!important;font-weight:900!important;color:rgba(255,255,255,.62)!important;white-space:nowrap!important}
    #ghostrun .crash-live-status{display:flex!important;justify-content:flex-end!important;gap:5px!important;font-size:11px!important;font-weight:930!important;color:rgba(255,255,255,.84)!important;white-space:nowrap!important}
    #ghostrun .crash-live-mult{color:rgba(255,255,255,.62)!important;font-size:12px!important;font-weight:950!important}
    #ghostrun .crash-live-lost{color:#ff5b6b!important;font-size:12px!important;font-weight:930!important}
    #ghostrun .crash-live-row.cashout .crash-live-amount,#ghostrun .crash-live-plus{color:#78ffb3!important}
    #ghostrun .crash-live-plus{display:inline-block!important;margin-right:3px!important;font-weight:950!important}
    html body:has(#ghostrun.active) main.app #ghostrun .ghost-run-controls,
    html body:has(#ghostrun.active) main.app #ghostrun .ghost-run-win-card,
    html body:has(#ghostrun.active) main.app #ghostrun .ghost-run-bet-card,
    html body:has(#ghostrun.active) main.app #ghostrun .ghost-run-move-button,
    html body:has(#ghostrun.active) main.app #ghostrun #ghostLive,
    html body:has(#ghostrun.active) main.app #ghostrun #ghostLive .crash-live-row,
    html body:has(#ghostrun.active) main.app #ghostrun #ghostLive .crash-live-toggle{
      border:0!important;
      outline:0!important;
      background:rgba(26,11,15,.54)!important;
      background-color:rgba(26,11,15,.54)!important;
      background-image:none!important;
      box-shadow:inset 0 1px 0 rgba(255,255,255,.105),inset 0 -1px 0 rgba(255,255,255,.06),inset 0 0 22px rgba(255,255,255,.055),0 16px 36px rgba(0,0,0,.22)!important;
      backdrop-filter:blur(10px) saturate(1.12)!important;
      -webkit-backdrop-filter:blur(10px) saturate(1.12)!important;
    }
    html body:has(#ghostrun.active) main.app #ghostrun .ghost-run-controls,
    html body:has(#ghostrun.active) main.app #ghostrun .ghost-run-win-card,
    html body:has(#ghostrun.active) main.app #ghostrun #ghostLive{
      border-radius:28px!important;
    }
    html body:has(#ghostrun.active) main.app #ghostrun .ghost-run-bet-card,
    html body:has(#ghostrun.active) main.app #ghostrun .ghost-run-move-button,
    html body:has(#ghostrun.active) main.app #ghostrun #ghostLive .crash-live-row{
      border-radius:18px!important;
    }
    html body:has(#ghostrun.active) main.app #ghostrun .ghost-run-bet-card>strong,
    html body:has(#ghostrun.active) main.app #ghostrun .ghost-run-win-card>strong,
    html body:has(#ghostrun.active) main.app #ghostrun [data-ghost-bet-input],
    html body:has(#ghostrun.active) main.app #ghostrun .ghost-run-auto input{
      background:transparent!important;
      background-color:transparent!important;
      box-shadow:none!important;
      backdrop-filter:none!important;
      -webkit-backdrop-filter:none!important;
    }
    html body:has(#ghostrun.active) main.app #ghostrun #ghostLive{overflow:hidden!important}
    html body:has(#ghostrun.active) main.app #ghostrun #ghostLive .crash-live-list{max-height:none!important;overflow:visible!important;padding-right:0!important;scrollbar-width:none!important}
    html body:has(#ghostrun.active) main.app #ghostrun #ghostLive .crash-live-list::-webkit-scrollbar{display:none!important}
    @media(max-width:380px){#ghostrun .ghost-run-scene{border-radius:30px!important}#ghostrun .ghost-run-ghost{width:58px!important;height:70px!important;bottom:72px!important}}
  </style>
  <div class="ghost-run-screen" data-ghost-state="idle">
    <div class="ghost-run-scene" aria-label="Ghost Run 2D forest scene">
      <div class="ghost-run-history" data-ghost-history aria-label="Ghost Run multiplier history"></div>
      <div class="ghost-run-sky"></div>
      <div class="ghost-run-background-strip" aria-hidden="true">
        <div class="ghost-run-background-panel ghost-run-background-panel-1"></div>
        <div class="ghost-run-background-panel ghost-run-background-panel-2"></div>
        <div class="ghost-run-background-panel ghost-run-background-panel-3"></div>
        <div class="ghost-run-background-panel ghost-run-background-panel-4"></div>
        <div class="ghost-run-background-panel ghost-run-background-panel-5"></div>
        <div class="ghost-run-background-panel ghost-run-background-panel-6"></div>
        <div class="ghost-run-background-panel ghost-run-background-panel-copy"></div>
      </div>
      <div class="ghost-run-moon"></div>
      <div class="ghost-run-stars"></div>
      <div class="ghost-run-layer ghost-run-layer-far"></div>
      <div class="ghost-run-layer ghost-run-layer-mid"></div>
      <div class="ghost-run-layer ghost-run-near-realism"></div>
      <div class="ghost-run-layer ghost-run-layer-near"></div>
      <div class="ghost-run-uploaded-trees ghost-run-uploaded-tree-1"></div>
      <div class="ghost-run-uploaded-trees ghost-run-uploaded-tree-2"></div>
      <div class="ghost-run-uploaded-trees ghost-run-uploaded-tree-3"></div>
      <div class="ghost-run-uploaded-houses ghost-run-uploaded-house-1"></div>
      <div class="ghost-run-uploaded-houses ghost-run-uploaded-house-2"></div>
      <div class="ghost-run-uploaded-houses ghost-run-uploaded-house-3"></div>
      <div class="ghost-run-rock ghost-run-rock-a"></div>
      <div class="ghost-run-rock ghost-run-rock-b"></div>
      <div class="ghost-run-plant ghost-run-plant-a"><i></i><i></i><i></i></div>
      <div class="ghost-run-plant ghost-run-plant-b"><i></i><i></i><i></i></div>
      <div class="ghost-run-mushroom ghost-run-mushroom-a"></div>
      <div class="ghost-run-ground"></div>
      <div class="ghost-run-fog ghost-run-fog-a"></div>
      <div class="ghost-run-fog ghost-run-fog-b"></div>
      <div class="ghost-run-hud">
        <div class="ghost-run-fear-wrap" aria-label="Soul Fear meter">
          <div class="ghost-run-fear-top"><span>Soul Fear</span><strong data-ghost-fear-label>0%</strong></div>
          <div class="ghost-run-fear-track"><i data-ghost-fear-bar></i></div>
        </div>
        <strong class="ghost-run-multiplier" data-ghost-multiplier>1.00x</strong>
        <span class="ghost-run-state" data-ghost-message></span>
      </div>
      <div class="ghost-run-reaper" aria-hidden="true"><i></i><b></b></div>
      <div class="ghost-run-curse-overlay" aria-hidden="true"></div>
      <div class="ghost-run-result" data-ghost-result aria-live="polite">
        <strong data-ghost-result-title></strong>
        <span data-ghost-result-detail></span>
        <button type="button" data-ghost-reset>New Round</button>
      </div>
      <div class="ghost-run-ghost" aria-hidden="true">
        <span class="ghost-run-ghost-body"><i class="ghost-run-eye ghost-run-eye-left"></i><i class="ghost-run-eye ghost-run-eye-right"></i><b></b><b></b><b></b></span>
        <span class="ghost-run-ghost-glow"></span>
      </div>
      <div class="ghost-run-danger ghost-run-danger-a"></div>
      <div class="ghost-run-danger ghost-run-danger-b"></div>
      <div class="ghost-run-shadow-fade"></div>
    </div>

    <div class="ghost-run-controls" aria-label="Ghost Run controls">
      <label class="ghost-run-control-card ghost-run-bet-card">
        <span>Bet Amount</span>
        <strong><input data-ghost-bet-input type="number" min="0.01" step="0.01" inputmode="decimal" value="0.10" aria-label="Ghost Run bet amount"/></strong>
      </label>
      <div class="ghost-run-control-card ghost-run-win-card">
        <span>Auto Cash Out</span>
        <strong><span class="crash-auto ghost-run-auto"><input data-ghost-auto-cashout inputmode="decimal" pattern="[0-9.]*" value="2.00" aria-label="Ghost Run auto cash out"/><span>x</span></span></strong>
      </div>
      <button class="ghost-run-move-button ghost-run-back-button" type="button" aria-label="Move back" data-ghost-back></button>
      <button class="ghost-run-move-button ghost-run-forward-button" type="button" aria-label="Move forward" data-ghost-forward></button>
      <button class="ghost-run-main-button ghost-run-start-button" type="button" data-ghost-start>Place Bet</button>
      <button class="ghost-run-main-button ghost-run-claim-button" type="button" data-ghost-claim>Claim Escape</button>
      <p class="ghost-run-note">Push for multiplier, retreat to calm the curse, or claim before Azrael catches you.</p>
    </div>
    <div class="crash-live open" id="ghostLive">
      <div class="crash-live-head">
        <span class="crash-live-title">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.2 11.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"/><path d="M3.4 18.4c.6-3 2.3-4.6 4.8-4.6s4.2 1.6 4.8 4.6"/><path d="M16.3 10.2a2.6 2.6 0 1 0 0-5.2"/><path d="M15.4 13.6c2.4.2 3.9 1.7 4.4 4.3"/></svg>
          <span>Live Bets</span>
        </span>
        <div class="crash-live-head-actions">
          <b id="ghostLiveTotal">0 TON</b>
          <button id="ghostLiveToggle" class="crash-live-toggle" type="button" aria-label="Toggle live bets" aria-expanded="true"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5"/></svg></button>
        </div>
      </div>
      <div class="crash-live-list" id="ghostLiveList"><div class="crash-live-empty">No bets yet</div></div>
    </div>
  </div>
  <script></script>
</section>
`;
