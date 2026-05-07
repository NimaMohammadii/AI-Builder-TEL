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

#flow .char-count{
  margin-left:auto;
  margin-right:0;
  color:rgba(255,255,255,.42);
  font-size:11px;
  font-weight:750;
  letter-spacing:.02em;
  white-space:nowrap;
  text-align:right;
  font-variant-numeric:tabular-nums;
}

#flow .wave-svg rect{
  opacity:.38;
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

@keyframes keyboardArrow{
  0%,100%{transform:translateY(-1px)}
  50%{transform:translateY(4px)}
}
`;
