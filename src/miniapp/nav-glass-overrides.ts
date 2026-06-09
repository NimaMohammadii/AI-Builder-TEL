export const NAV_GLASS_OVERRIDES = `
.tabs{position:absolute!important;left:50%!important;right:auto!important;bottom:calc(12px + env(safe-area-inset-bottom))!important;width:352px!important;max-width:calc(100% - 36px)!important;height:58px!important;border:0!important;background:rgba(255,255,255,.035)!important;box-shadow:0 18px 42px rgba(0,0,0,.16),inset 0 1px 0 rgba(255,255,255,.16)!important;backdrop-filter:blur(10px) saturate(1.18)!important;-webkit-backdrop-filter:blur(10px) saturate(1.18)!important;overflow:hidden!important;transform:translateX(-50%)!important}
.tabs:before{content:"";position:absolute;inset:0;border-radius:inherit;background:transparent!important;border:0!important;pointer-events:none;z-index:0}
.tabs .tab{position:relative;z-index:1;color:rgba(255,255,255,.74)!important;text-shadow:0 1px 10px rgba(0,0,0,.28);white-space:nowrap!important;font-size:14px!important}
.tabs .tab:nth-child(2){font-size:0!important}
.tabs .tab:nth-child(2):after{content:"Play Zone";font-size:13px!important;font-weight:680;letter-spacing:-.015em;color:inherit;white-space:nowrap}
.tabs .tab.active{background:rgba(255,255,255,.92)!important;color:#050505!important;box-shadow:0 10px 26px rgba(255,255,255,.10),inset 0 1px 0 rgba(255,255,255,.78);text-shadow:none}
`;
