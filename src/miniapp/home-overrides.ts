export const HOME_OVERRIDES = `
#home .card{
  backdrop-filter:blur(22px);
  -webkit-backdrop-filter:blur(22px);
}
#home .home-deposit-btn{
  margin-top:12px;
  width:100%;
  height:58px;
  border-radius:22px;
  font-size:16px;
}
#home .connect-style-presets{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:10px;
  margin:12px 0;
}
#home .connect-style-presets button{
  min-height:64px;
  border-radius:22px;
  border:1px solid rgba(255,255,255,.12);
  background:rgba(255,255,255,.075);
  color:#fff;
}
#home .connect-style-presets b{
  display:block;
  font-size:18px;
}
#home .connect-style-presets span{
  display:block;
  margin-top:4px;
  color:rgba(255,255,255,.58);
  font-size:11px;
}
#home .deposit-sheet{position:fixed;inset:0;z-index:120;display:none}
#home .deposit-sheet.open{display:block}
#home .deposit-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.52);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
#home .deposit-panel{position:absolute;left:16px;right:16px;bottom:calc(14px + env(safe-area-inset-bottom));max-width:528px;margin:0 auto;border-radius:30px;animation:depositIn .28s cubic-bezier(.2,.8,.2,1)}
@keyframes depositIn{from{opacity:0;transform:translateY(28px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
`;
