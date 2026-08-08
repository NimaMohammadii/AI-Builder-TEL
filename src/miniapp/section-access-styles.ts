export const SECTION_ACCESS_STYLES = `
html.vexa-access-locked,html.vexa-access-locked body{background:#000!important;overflow:hidden!important}
.vexa-access-lock-screen{position:fixed;z-index:2147483647;inset:0;width:100%;min-height:100dvh;display:grid;place-items:center;background:#000;padding:28px;color:#fff}
.vexa-access-lock-card{width:min(74vw,420px);text-align:center}
.vexa-access-lock-title{margin:0 0 18px;color:#fff;font-size:13px;font-weight:800;text-transform:uppercase;display:flex;align-items:center;justify-content:center;gap:7px}
.vexa-access-lock-title>span:first-child{letter-spacing:.34em}
.vexa-access-lock-dots{display:inline-flex;align-items:center;gap:3px;margin-left:-2px}
.vexa-access-lock-dots i{display:block;width:3px;height:3px;border-radius:50%;background:#fff;opacity:.25;animation:vexaAccessLockDot 1.05s ease-in-out infinite}
.vexa-access-lock-dots i:nth-child(2){animation-delay:.14s}.vexa-access-lock-dots i:nth-child(3){animation-delay:.28s}
@keyframes vexaAccessLockDot{0%,70%,100%{opacity:.22;transform:translateY(0) scale(.82)}35%{opacity:1;transform:translateY(-2px) scale(1)}}
.vexa-access-lock-bar{direction:ltr;height:4px;border-radius:999px;background:#121212;overflow:hidden;box-shadow:0 0 0 1px rgba(255,255,255,.06),0 18px 60px rgba(255,255,255,.12)}
.vexa-access-lock-bar span{display:block;width:0;transform-origin:left center;height:100%;border-radius:999px;background:linear-gradient(90deg,#fff,#8f8f8f,#fff);box-shadow:0 0 24px rgba(255,255,255,.72);transition:width .45s ease}
`;
