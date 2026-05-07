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
  justify-content:center;
  gap:16px;
  padding:8px 0 18px;
}

.plinko-stage{
  width:min(100%,340px);
  aspect-ratio:320/430;
  display:grid;
  place-items:center;
}

.plinko-canvas{
  width:100%;
  height:100%;
  display:block;
  background:#000;
}

.plinko-drop{
  width:min(76%,280px);
  height:44px;
  border-radius:999px;
  background:#fff;
  color:#050505;
  font-size:14px;
  font-weight:900;
}
`;
