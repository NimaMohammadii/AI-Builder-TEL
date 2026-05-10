export const NAV_GLASS_OVERRIDES = `
.tabs{background:linear-gradient(135deg,rgba(255,255,255,.18),rgba(255,255,255,.055))!important;border:1px solid rgba(255,255,255,.28)!important;box-shadow:0 18px 42px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.38),inset 0 -1px 0 rgba(255,255,255,.08)!important;backdrop-filter:blur(1.5px) saturate(1.25)!important;-webkit-backdrop-filter:blur(1.5px) saturate(1.25)!important;overflow:hidden!important}
.tabs:before{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(180deg,rgba(255,255,255,.22),rgba(255,255,255,.035) 45%,rgba(255,255,255,.075));pointer-events:none;z-index:0}
.tabs .tab{position:relative;z-index:1;color:rgba(255,255,255,.74)!important;text-shadow:0 1px 10px rgba(0,0,0,.28)}
.tabs .tab.active{background:rgba(255,255,255,.92)!important;color:#050505!important;box-shadow:0 10px 26px rgba(255,255,255,.10),inset 0 1px 0 rgba(255,255,255,.78);text-shadow:none}
`;
