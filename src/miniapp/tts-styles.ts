export const TTS_STYLES = `
#flow{
  --configa-bg:#050505;
  --configa-fg:#fff;
  --configa-muted:#a7a7a7;
  --configa-line:#252525;
  --configa-panel:#0d0d0d;
  --configa-soft:#171717;
  background:radial-gradient(circle at top,#181818 0,#050505 45%);
  color:var(--configa-fg);
}

#flow .configa-shell{
  width:min(100%,760px);
  margin:0 auto;
  padding:32px 2px calc(32px + env(safe-area-inset-bottom));
}

#flow .configa-hero{
  padding:26px 4px 24px;
}

#flow .configa-eyebrow{
  margin:0 0 14px;
  color:var(--configa-muted);
  font-size:12px;
  letter-spacing:.18em;
  text-transform:uppercase;
}

#flow .configa-hero h1{
  margin:0;
  font-size:clamp(34px,11vw,72px);
  line-height:.95;
  letter-spacing:-.06em;
}

#flow .configa-subtitle{
  max-width:560px;
  margin:18px 0 0;
  color:var(--configa-muted);
  font-size:15px;
  line-height:1.9;
}

#flow .configa-panel{
  border:1px solid var(--configa-line);
  border-radius:28px;
  background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02));
  box-shadow:0 24px 80px rgba(0,0,0,.42);
  padding:18px;
}

#flow .configa-meta-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:10px;
  margin-bottom:18px;
}

#flow .configa-meta-card{
  position:relative;
  min-width:0;
  border:1px solid var(--configa-line);
  border-radius:20px;
  background:rgba(255,255,255,.03);
  padding:14px;
}

#flow .configa-meta-card>span,
#flow .configa-meta-copy>span{
  display:block;
  color:var(--configa-muted);
  font-size:12px;
  margin-bottom:8px;
}

#flow .configa-meta-card>strong,
#flow .configa-meta-copy>strong{
  display:block;
  color:var(--configa-fg);
  font-size:17px;
  letter-spacing:-.02em;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}

#flow .configa-voice-card{
  padding:0;
}

#flow .configa-meta-button{
  width:100%;
  min-height:100%;
  margin:0;
  border:0;
  border-radius:20px;
  background:transparent;
  color:var(--configa-fg);
  padding:14px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  text-align:left;
  cursor:pointer;
}

#flow .configa-meta-copy{
  min-width:0;
  flex:1;
}

#flow .configa-meta-button svg{
  flex:0 0 auto;
  transition:transform .22s ease;
}

#flow .voice-wrap.open .configa-meta-button svg{
  transform:rotate(180deg);
}

#flow .voice-menu{
  position:absolute;
  top:calc(100% + 8px);
  left:0;
  right:0;
  z-index:40;
  max-height:242px;
  overflow:auto;
  padding:6px;
  border:1px solid var(--configa-line);
  border-radius:18px;
  background:rgba(8,8,8,.98);
  box-shadow:0 24px 70px rgba(0,0,0,.72);
  opacity:0;
  transform:translateY(-8px) scale(.96);
  transform-origin:top center;
  pointer-events:none;
  transition:opacity .18s ease,transform .18s ease;
}

#flow .voice-wrap.open .voice-menu{
  opacity:1;
  transform:translateY(0) scale(1);
  pointer-events:auto;
}

#flow .voice-menu button{
  width:100%;
  height:34px;
  border:0;
  border-radius:13px;
  background:transparent;
  color:rgba(255,255,255,.64);
  text-align:left;
  padding:0 10px;
  font-size:12.5px;
  font-weight:560;
}

#flow .voice-menu button.active{
  background:#fff;
  color:#050505;
}

#flow .configa-field-label{
  display:block;
  margin:0 0 10px;
  color:var(--configa-fg);
  font-weight:650;
  font-size:inherit;
  letter-spacing:normal;
  text-transform:none;
}

#flow #ttsText{
  width:100%;
  min-height:220px;
  resize:vertical;
  border:1px solid var(--configa-line)!important;
  outline:none;
  border-radius:22px!important;
  background:#080808!important;
  color:var(--configa-fg);
  padding:18px!important;
  font:500 16px/1.9 inherit!important;
  letter-spacing:normal!important;
  box-shadow:none;
  transition:border-color .2s,box-shadow .2s;
}

#flow #ttsText::placeholder{
  color:rgba(255,255,255,.42);
  font-size:16px;
}

#flow #ttsText:focus{
  border-color:#fff!important;
  box-shadow:0 0 0 4px rgba(255,255,255,.1)!important;
}

#flow .configa-counter{
  min-height:18px;
  margin:10px 4px 18px;
  color:var(--configa-muted);
  font-size:12px;
  text-align:left;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:8px;
}

#flow .configa-convert{
  width:100%;
  border:0;
  border-radius:999px;
  background:#fff;
  color:#000;
  padding:17px 22px;
  font:800 15px/1 inherit;
  cursor:pointer;
  transition:transform .2s,opacity .2s;
}

#flow .configa-convert:active{
  transform:scale(.985);
}

#flow .configa-convert:disabled{
  cursor:not-allowed;
  opacity:.45;
}

#flow .configa-status{
  min-height:24px;
  margin:16px 4px 0;
  color:var(--configa-muted);
  font-size:14px;
  line-height:1.7;
}

#flow .configa-player-wrap{
  display:none;
  width:100%;
  margin-top:16px;
}

#flow .configa-player-wrap.show{
  display:block;
}

#flow .configa-player{
  width:100%;
  filter:grayscale(1);
}

#flow .char-warning{
  width:18px;
  height:18px;
  flex:0 0 auto;
  border:0;
  border-radius:50%;
  background:#ff3030;
  color:#fff;
  display:none;
  align-items:center;
  justify-content:center;
  padding:0;
  font-size:12px;
  font-weight:950;
  line-height:1;
  box-shadow:0 0 0 0 rgba(255,48,48,.55),0 0 18px rgba(255,48,48,.36);
  transform:scale(.7);
  opacity:0;
}

#flow.over-limit .char-warning{
  display:flex;
  animation:configaWarningPop .22s cubic-bezier(.2,.9,.2,1) forwards,configaWarningPulse 1.15s ease-in-out .22s infinite;
}

#flow .limit-sheet{
  position:fixed;
  inset:0;
  z-index:160;
  display:grid;
  place-items:end center;
  opacity:0;
  pointer-events:none;
  transition:opacity .22s ease;
}

#flow .limit-sheet.open{
  opacity:1;
  pointer-events:auto;
}

#flow .limit-backdrop{
  position:absolute;
  inset:0;
  border:0;
  background:rgba(0,0,0,.48);
  backdrop-filter:blur(8px);
}

#flow .limit-card{
  position:relative;
  width:calc(100% - 32px);
  max-width:460px;
  margin:0 16px calc(86px + env(safe-area-inset-bottom));
  border:1px solid rgba(255,255,255,.14);
  border-radius:28px;
  background:linear-gradient(180deg,rgba(28,28,28,.98),rgba(8,8,8,.98));
  box-shadow:0 28px 90px rgba(0,0,0,.72),inset 0 1px 0 rgba(255,255,255,.12);
  padding:18px;
  text-align:center;
  transform:translateY(26px) scale(.96);
  opacity:0;
  transition:transform .28s cubic-bezier(.2,.85,.2,1),opacity .22s ease;
}

#flow .limit-sheet.open .limit-card{
  transform:translateY(0) scale(1);
  opacity:1;
}

#flow .limit-icon{
  width:34px;
  height:34px;
  margin:0 auto 10px;
  border-radius:50%;
  background:#ff3030;
  color:#fff;
  display:grid;
  place-items:center;
  font-weight:950;
  box-shadow:0 0 24px rgba(255,48,48,.35);
}

#flow .limit-card h3{
  margin:0 0 6px;
  font-size:17px;
  font-weight:900;
  letter-spacing:-.02em;
}

#flow .limit-card p{
  margin:0 auto 14px;
  color:rgba(255,255,255,.62);
  font-size:13px;
  line-height:1.38;
  max-width:290px;
}

#flow .limit-close{
  width:100%;
  height:42px;
  border:0;
  border-radius:999px;
  background:#fff;
  color:#050505;
  font-weight:900;
}

@keyframes configaWarningPop{
  from{opacity:0;transform:scale(.7)}
  to{opacity:1;transform:scale(1)}
}

@keyframes configaWarningPulse{
  0%,100%{box-shadow:0 0 0 0 rgba(255,48,48,.48),0 0 18px rgba(255,48,48,.36)}
  50%{box-shadow:0 0 0 5px rgba(255,48,48,0),0 0 24px rgba(255,48,48,.48)}
}

@media (max-width:520px){
  #flow .configa-shell{padding-top:22px}
  #flow .configa-meta-grid{grid-template-columns:1fr}
  #flow .configa-panel{border-radius:24px;padding:14px}
  #flow #ttsText{min-height:190px}
}
`;
