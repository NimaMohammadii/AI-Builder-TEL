export const WALLET_SECTION = `<div id="wallet" class="wallet-sheet" aria-hidden="true">
  <style>
    #wallet.wallet-sheet{position:fixed!important;inset:0!important;z-index:10070!important;display:block!important;pointer-events:none!important;visibility:hidden!important}
    #wallet.wallet-sheet.open{pointer-events:auto!important;visibility:visible!important}
    #wallet .wallet-sheet-backdrop{position:absolute!important;inset:0!important;background:rgba(0,0,0,.48)!important;backdrop-filter:blur(3px)!important;-webkit-backdrop-filter:blur(3px)!important;opacity:0!important;transition:opacity .30s ease!important}
    #wallet.open .wallet-sheet-backdrop{opacity:1!important}
    #wallet .wallet-sheet-panel{position:absolute!important;left:0!important;right:0!important;bottom:0!important;width:min(100%,560px)!important;margin:0 auto!important;padding:10px 14px calc(18px + env(safe-area-inset-bottom))!important;box-sizing:border-box!important;border:0!important;border-radius:30px 30px 0 0!important;background:rgba(12,12,13,.94)!important;box-shadow:0 -18px 52px rgba(0,0,0,.50),inset 0 1px 0 rgba(255,255,255,.08)!important;backdrop-filter:blur(22px) saturate(1.14)!important;-webkit-backdrop-filter:blur(22px) saturate(1.14)!important;transform:translateY(calc(100% + 28px))!important;transition:transform .44s cubic-bezier(.16,1,.3,1)!important}
    #wallet.open .wallet-sheet-panel{transform:translateY(0)!important}
    #wallet .wallet-sheet-handle{width:42px!important;height:4px!important;margin:2px auto 12px!important;border-radius:999px!important;background:rgba(255,255,255,.20)!important}
    #wallet .wallet-sheet-head{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:14px!important;margin:0 2px 14px!important}
    #wallet .wallet-sheet-title{min-width:0!important}
    #wallet .wallet-sheet-title strong{display:block!important;color:#fff!important;font-size:20px!important;font-weight:950!important;letter-spacing:-.035em!important;line-height:1.05!important}
    #wallet .wallet-sheet-title span{display:block!important;margin-top:5px!important;color:rgba(255,255,255,.48)!important;font-size:11px!important;font-weight:700!important}
    #wallet .wallet-sheet-close{width:38px!important;height:38px!important;min-width:38px!important;padding:0!important;border:0!important;border-radius:999px!important;background:rgba(255,255,255,.055)!important;color:#fff!important;display:grid!important;place-items:center!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important}
    #wallet .wallet-sheet-close svg{width:19px!important;height:19px!important;display:block!important}
    #wallet .wallet-sheet-actions{display:grid!important;grid-template-columns:1fr 1fr!important;gap:10px!important}
    #wallet .wallet-sheet-action{min-height:128px!important;padding:14px!important;border:0!important;border-radius:26px!important;color:#fff!important;text-align:left!important;display:flex!important;flex-direction:column!important;justify-content:space-between!important;background:rgba(255,255,255,.055)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.09),inset 0 -1px 0 rgba(255,255,255,.035),0 14px 30px rgba(0,0,0,.20)!important;transition:transform .16s ease,background .16s ease!important}
    #wallet .wallet-sheet-action:active{transform:scale(.975)!important;background:rgba(255,255,255,.075)!important}
    #wallet .wallet-sheet-action-icon{width:42px!important;height:42px!important;border-radius:17px!important;display:grid!important;place-items:center!important;background:rgba(0,0,0,.22)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.06)!important;font-size:22px!important;font-weight:950!important}
    #wallet .wallet-sheet-action.deposit .wallet-sheet-action-icon{color:#42f594!important}
    #wallet .wallet-sheet-action.withdraw .wallet-sheet-action-icon{color:#ff7181!important}
    #wallet .wallet-sheet-action strong{display:block!important;font-size:16px!important;font-weight:950!important;letter-spacing:-.03em!important}
    #wallet .wallet-sheet-action small{display:block!important;margin-top:4px!important;color:rgba(255,255,255,.46)!important;font-size:10px!important;font-weight:700!important;line-height:1.25!important}
    @media(prefers-reduced-motion:reduce){#wallet .wallet-sheet-backdrop,#wallet .wallet-sheet-panel,#wallet .wallet-sheet-action{transition:none!important}}
  </style>
  <div class="wallet-sheet-backdrop" data-action="close-wallet"></div>
  <section class="wallet-sheet-panel" role="dialog" aria-modal="true" aria-label="Balance actions">
    <div class="wallet-sheet-handle" aria-hidden="true"></div>
    <div class="wallet-sheet-head">
      <div class="wallet-sheet-title"><strong>Balance</strong><span>Deposit or withdraw</span></div>
      <button class="wallet-sheet-close" type="button" data-action="close-wallet" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg></button>
    </div>
    <div class="wallet-sheet-actions">
      <button class="wallet-sheet-action deposit" type="button" data-action="open-deposit"><span class="wallet-sheet-action-icon">↓</span><span><strong>Deposit</strong><small>Add funds to your balance</small></span></button>
      <button class="wallet-sheet-action withdraw" type="button" data-action="open-withdraw"><span class="wallet-sheet-action-icon">↑</span><span><strong>Withdraw</strong><small>Request a payout</small></span></button>
    </div>
  </section>
</div>`;
