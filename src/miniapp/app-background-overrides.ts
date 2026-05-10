export const APP_BACKGROUND_OVERRIDES = `
html,body{background:#060304!important}
body:before{content:"";position:fixed;inset:0;z-index:-3;background:radial-gradient(ellipse 88% 42% at 20% -8%,rgba(110,22,45,.72),transparent 62%),radial-gradient(ellipse 68% 38% at 92% 6%,rgba(66,12,30,.64),transparent 64%),radial-gradient(ellipse 78% 54% at 62% 34%,rgba(142,24,52,.28),transparent 60%),linear-gradient(180deg,#080304 0%,#12070a 28%,#090506 58%,#020202 100%)}
body:after{content:"";position:fixed;inset:0;z-index:-2;background:radial-gradient(ellipse 56% 28% at 56% 12%,rgba(255,255,255,.075),transparent 58%),linear-gradient(180deg,rgba(255,255,255,.035),transparent 18%,rgba(0,0,0,.18) 100%);pointer-events:none}
.app{background:transparent!important}
.app:before{content:"";position:absolute;left:-18%;right:-18%;top:-8%;height:44%;z-index:0;background:radial-gradient(ellipse 54% 58% at 32% 16%,rgba(168,38,70,.38),transparent 66%),radial-gradient(ellipse 62% 64% at 76% 2%,rgba(66,9,28,.7),transparent 72%);filter:blur(0px);pointer-events:none}
.app:after{content:"";position:absolute;inset:0;z-index:0;background:linear-gradient(180deg,rgba(255,255,255,.018),transparent 22%,rgba(0,0,0,.10) 100%);pointer-events:none}
.top,.content,.tabs,.toast{position:relative;z-index:1}
.vexa-boot{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:radial-gradient(ellipse 92% 43% at 18% -7%,rgba(123,28,52,.82),transparent 64%),radial-gradient(ellipse 70% 39% at 92% 4%,rgba(73,12,31,.72),transparent 64%),linear-gradient(180deg,#0a0305 0%,#16070c 30%,#100a0b 62%,#050505 100%);transition:opacity .34s ease,visibility .34s ease;overflow:hidden}
.vexa-boot:before{content:"";position:absolute;left:-18%;right:-18%;top:-10%;height:48%;background:radial-gradient(ellipse 58% 64% at 28% 14%,rgba(175,43,76,.46),transparent 68%),radial-gradient(ellipse 66% 70% at 76% 1%,rgba(72,11,30,.72),transparent 72%)}
.vexa-boot-card{position:relative;display:grid;place-items:center;gap:14px;transform:translateY(-12px);animation:vexaBootIn .48s cubic-bezier(.2,.8,.2,1)}
.vexa-boot-logo{width:104px;height:104px;border-radius:42px;object-fit:cover;filter:drop-shadow(0 22px 50px rgba(0,0,0,.48))}
.vexa-boot-title{margin:0;color:#fff;font-size:24px;font-weight:850;letter-spacing:-.055em;text-shadow:0 8px 28px rgba(0,0,0,.34)}
.vexa-boot-sub{margin:-7px 0 0;color:rgba(255,255,255,.52);font-size:12px;font-weight:560;letter-spacing:.08em;text-transform:uppercase}
.vexa-boot.hide{opacity:0;visibility:hidden;pointer-events:none}
@keyframes vexaBootIn{from{opacity:0;transform:translateY(8px) scale(.94)}to{opacity:1;transform:translateY(-12px) scale(1)}}
`;
