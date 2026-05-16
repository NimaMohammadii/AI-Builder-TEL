export const TTS_STYLES = `
/* TTS-only sizing refinements. This file must not style the main bottom navigation. */
#flow .tts-head{
  align-items:center!important;
  justify-content:flex-end!important;
  gap:12px!important;
  margin-top:0!important;
  margin-bottom:14px!important;
}

#flow .tts-area{
  transform:none!important;
  margin-top:-8px!important;
}

#flow .tts-area textarea{
  font-size:14px!important;
  line-height:1.22!important;
}

#flow .tts-area textarea::placeholder{
  font-size:14px!important;
}

#flow .credit-pill{
  order:1;
  margin-left:auto;
  margin-right:0;
  margin-bottom:0;
  transform:none!important;
}

#flow .voice-wrap{
  order:2;
  margin-left:0;
  margin-right:0;
  transform:none!important;
}

#flow .tts-bottom{
  width:92%;
  max-width:480px;
  margin-left:0!important;
  margin-right:auto!important;
  margin-bottom:18px!important;
  gap:12px!important;
}

#flow .wave-player{
  width:86%;
  margin-left:0;
  margin-right:auto;
}

#flow .tts-generate-row{
  width:100%;
  display:flex;
  align-items:center;
  gap:12px;
  margin-left:0;
  margin-right:0;
}

#flow .tts-generate{
  width:min(70%,330px);
  margin-left:0;
  margin-right:0;
  flex:0 0 auto;
}

#flow .char-count-wrap{
  margin-left:auto;
  margin-right:0;
  display:flex;
  align-items:center;
  gap:7px;
}

#flow .char-count{
  color:rgba(255,255,255,.42);
  font-size:11px;
  font-weight:750;
  letter-spacing:.02em;
  white-space:nowrap;
  text-align:right;
  font-variant-numeric:tabular-nums;
}

#flow .char-warning{
  width:18px;
  height:18px;
  border-radius:50%;
  background:#ff3030;
  color:#fff;
  display:none;
  align-items:center;
  justify-content:center;
  font-size:12px;
  font-weight:950;
  line-height:1;
  box-shadow:0 0 0 0 rgba(255,48,48,.55),0 0 18px rgba(255,48,48,.36);
  transform:scale(.7);
  opacity:0;
}

#flow.over-limit .char-warning{
  display:flex;
  animation:warningPop .22s cubic-bezier(.2,.9,.2,1) forwards, warningPulse 1.15s ease-in-out .22s infinite;
}

#flow.over-limit .char-count{
  color:rgba(255,255,255,.72);
}

#flow .wave-svg rect{
  opacity:.38;
}

.limit-sheet{
  position:fixed;
  inset:0;
  z-index:60;
  display:grid;
  place-items:end center;
  opacity:0;
  pointer-events:none;
  transition:opacity .22s ease;
}

.limit-sheet.open{
  opacity:1;
  pointer-events:auto;
}

.limit-backdrop{
  position:absolute;
  inset:0;
  background:rgba(0,0,0,.48);
  backdrop-filter:blur(8px);
}

.limit-card{
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

.limit-sheet.open .limit-card{
  transform:translateY(0) scale(1);
  opacity:1;
}

.limit-icon{
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

.limit-card h3{
  margin:0 0 6px;
  font-size:17px;
  font-weight:900;
  letter-spacing:-.02em;
}

.limit-card p{
  margin:0 auto 14px;
  color:rgba(255,255,255,.62);
  font-size:13px;
  line-height:1.38;
  max-width:290px;
}

.limit-close{
  width:100%;
  height:42px;
  border-radius:999px;
  background:#fff;
  color:#050505;
  font-weight:900;
}

/* Keep the main navigation from riding above the keyboard while typing in TTS. */
body.keyboard-open #flow.active ~ .tabs,
body.keyboard-open .tabs{
  transform:translateY(160px);
  opacity:0;
  pointer-events:none;
  transition:transform .22s ease,opacity .18s ease;
}

.keyboard-dismiss{
  position:fixed;
  right:22px;
  bottom:calc(14px + env(safe-area-inset-bottom));
  z-index:30;
  width:42px;
  height:42px;
  border-radius:50%;
  border:1px solid rgba(255,255,255,.18);
  background:rgba(18,18,18,.92);
  color:#fff;
  display:grid;
  place-items:center;
  opacity:0;
  transform:translateY(12px) scale(.92);
  pointer-events:none;
  box-shadow:0 18px 40px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.12);
  transition:opacity .2s ease,transform .22s cubic-bezier(.2,.8,.2,1);
}

body.keyboard-open #flow.active .keyboard-dismiss{
  opacity:1;
  transform:translateY(0) scale(1);
  pointer-events:auto;
}

body.keyboard-open #flow.active .keyboard-dismiss svg{
  animation:keyboardArrow .95s ease-in-out infinite;
}

@keyframes warningPop{
  from{opacity:0;transform:scale(.7)}
  to{opacity:1;transform:scale(1)}
}

@keyframes warningPulse{
  0%,100%{box-shadow:0 0 0 0 rgba(255,48,48,.48),0 0 18px rgba(255,48,48,.36)}
  50%{box-shadow:0 0 0 5px rgba(255,48,48,0),0 0 24px rgba(255,48,48,.48)}
}

@keyframes keyboardArrow{
  0%,100%{transform:translateY(-1px)}
  50%{transform:translateY(4px)}
}
`;
