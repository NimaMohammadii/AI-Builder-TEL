export const PLINKO_STYLES = `
/* Plinko-only minimal black and white layout. */
#plinko.view{
  overflow:hidden;
}

.plinko-page{
  height:100%;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:flex-start;
  gap:10px;
  padding:0 0 18px;
}

.plinko-top{
  width:min(100%,340px);
  display:flex;
  justify-content:flex-end;
  margin-top:-2px;
}

.plinko-credit{
  height:34px;
  border-radius:999px;
  border:1px solid rgba(255,255,255,.16);
  background:rgba(255,255,255,.055);
  display:flex;
  align-items:center;
  gap:8px;
  padding:0 12px;
  color:#fff;
  font-size:13px;
  font-weight:900;
  font-variant-numeric:tabular-nums;
}

.plinko-credit img{
  width:22px;
  height:22px;
  object-fit:contain;
  border:0;
  box-shadow:none;
  background:transparent;
}

.plinko-stage{
  width:min(100%,340px);
  aspect-ratio:320/430;
  display:grid;
  place-items:center;
  margin-top:-18px;
}

.plinko-canvas{
  width:100%;
  height:100%;
  display:block;
  background:#000;
}

.plinko-controls{
  width:min(88%,320px);
  display:grid;
  grid-template-columns:96px 1fr;
  align-items:center;
  gap:10px;
  margin-top:-18px;
}

.plinko-bet{
  height:42px;
  border-radius:999px;
  border:1px solid rgba(255,255,255,.16);
  background:rgba(255,255,255,.055);
  display:flex;
  align-items:center;
  gap:6px;
  padding:0 10px;
}

.plinko-bet span{
  color:rgba(255,255,255,.52);
  font-size:10px;
  font-weight:850;
  text-transform:uppercase;
  letter-spacing:.08em;
}

.plinko-bet input{
  min-width:0;
  height:auto;
  border:0!important;
  background:transparent!important;
  padding:0!important;
  color:#fff;
  font-size:13px;
  font-weight:900;
  text-align:right;
  box-shadow:none!important;
}

.plinko-drop{
  width:100%;
  height:42px;
  border-radius:999px;
  background:#fff;
  color:#050505;
  font-size:13px;
  font-weight:900;
}
`;
