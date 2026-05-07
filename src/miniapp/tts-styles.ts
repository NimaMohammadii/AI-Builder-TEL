export const TTS_STYLES = `
/* TTS-only sizing refinements. This file must not style the main bottom navigation. */
#flow .tts-area textarea{
  font-size:22px!important;
  line-height:1.28!important;
}

#flow .tts-area textarea::placeholder{
  font-size:22px!important;
}

#flow .tts-bottom{
  width:92%;
  max-width:480px;
  margin-left:auto!important;
  margin-right:auto!important;
  margin-bottom:18px!important;
  gap:12px!important;
}

#flow .wave-player{
  width:94%;
  margin-left:auto;
  margin-right:auto;
}

#flow .tts-generate{
  width:88%;
  margin-left:auto;
  margin-right:auto;
}

#flow .wave-svg rect{
  opacity:.38;
}
`;
