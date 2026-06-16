import { miniAppShellHtml } from './miniapp/shell';

const VOICE_AI_STYLE = `
<style id="vexaVoiceAiStyle">
  .vexa-voice-ai-button {
    position: fixed;
    right: 16px;
    bottom: 94px;
    z-index: 9000;
    border: 0;
    border-radius: 999px;
    padding: 13px 16px;
    background: rgba(86, 16, 35, .92);
    color: #fff;
    font-weight: 900;
    box-shadow: 0 18px 42px rgba(0, 0, 0, .38);
  }

  .vexa-voice-ai-sheet {
    position: fixed;
    inset: 0;
    z-index: 10050;
    display: none;
    align-items: flex-end;
    justify-content: center;
    padding: 18px;
    background: rgba(0, 0, 0, .52);
  }

  .vexa-voice-ai-sheet.open {
    display: flex;
  }

  .vexa-voice-ai-card {
    width: min(100%, 430px);
    border-radius: 28px;
    padding: 18px;
    color: #fff;
    background: rgba(18, 7, 10, .96);
    border: 1px solid rgba(255, 255, 255, .12);
    box-shadow: 0 24px 70px rgba(0, 0, 0, .55);
  }

  .vexa-voice-ai-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .vexa-voice-ai-top h3 {
    margin: 0;
    font-size: 18px;
  }

  .vexa-voice-ai-close {
    width: 38px;
    height: 38px;
    border: 0;
    border-radius: 999px;
    color: #fff;
    background: rgba(255, 255, 255, .08);
    font-size: 20px;
  }

  .vexa-voice-ai-pick {
    display: block;
    width: 100%;
    box-sizing: border-box;
    margin-top: 16px;
    padding: 18px;
    border-radius: 18px;
    text-align: center;
    color: #fff;
    font-size: 16px;
    font-weight: 900;
    background: linear-gradient(135deg, #5b0f24, #8f1d3d);
  }

  .vexa-voice-ai-file {
    display: none;
  }

  .vexa-voice-ai-status {
    min-height: 22px;
    margin: 12px 2px 0;
    color: rgba(255, 255, 255, .72);
    font-size: 13px;
  }

  .vexa-voice-ai-player {
    display: none;
    width: 100%;
    margin-top: 14px;
  }

  .vexa-voice-ai-player.ready {
    display: block;
  }
</style>
`;

const VOICE_AI_SCRIPT = `
<script id="vexaVoiceAiScript">
(function(){
  var audioUrl = '';

  function byId(id) {
    return document.getElementById(id);
  }

  function setStatus(text) {
    var node = byId('vexaVoiceAiStatus');
    if (node) node.textContent = text;
  }

  function setSheet(open) {
    var sheet = byId('vexaVoiceAiSheet');
    if (!sheet) return;
    sheet.classList.toggle('open', !!open);
    sheet.setAttribute('aria-hidden', open ? 'false' : 'true');
  }

  async function sendSelectedFile(event) {
    var input = event.target;
    var file = input && input.files && input.files[0];
    if (!file) return;

    setStatus('Thinking...');

    try {
      var form = new FormData();
      form.append('audio', file, file.name || 'voice.webm');

      var response = await fetch('/app/api/voice-ai', {
        method: 'POST',
        body: form
      });

      if (!response.ok) {
        var data = await response.json().catch(function(){ return { error: 'Voice AI failed' }; });
        throw new Error(data.error || 'Voice AI failed');
      }

      var blob = await response.blob();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      audioUrl = URL.createObjectURL(blob);

      var player = byId('vexaVoiceAiPlayer');
      player.src = audioUrl;
      player.classList.add('ready');
      setStatus('Answer ready.');
      player.play().catch(function(){});
    } catch (error) {
      setStatus(error && error.message ? error.message : 'Voice AI failed.');
    } finally {
      input.value = '';
    }
  }

  function boot() {
    var button = byId('vexaVoiceAiButton');
    if (!button) return;

    button.addEventListener('click', function(){ setSheet(true); });
    byId('vexaVoiceAiClose').addEventListener('click', function(){ setSheet(false); });
    byId('vexaVoiceAiFile').addEventListener('change', sendSelectedFile);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
</script>
`;

const VOICE_AI_HTML = `
<button id="vexaVoiceAiButton" class="vexa-voice-ai-button" type="button">AI Voice</button>
<div id="vexaVoiceAiSheet" class="vexa-voice-ai-sheet" aria-hidden="true">
  <div class="vexa-voice-ai-card">
    <div class="vexa-voice-ai-top">
      <h3>AI Voice</h3>
      <button id="vexaVoiceAiClose" class="vexa-voice-ai-close" type="button">×</button>
    </div>
    <label class="vexa-voice-ai-pick" for="vexaVoiceAiFile">Choose Voice</label>
    <input id="vexaVoiceAiFile" class="vexa-voice-ai-file" type="file" accept="audio/*" />
    <div id="vexaVoiceAiStatus" class="vexa-voice-ai-status">Choose a voice file.</div>
    <audio id="vexaVoiceAiPlayer" class="vexa-voice-ai-player" controls></audio>
  </div>
</div>
`;

export function miniAppHtml(): string {
  return miniAppShellHtml()
    .replace('</head>', `${VOICE_AI_STYLE}</head>`)
    .replace('</body>', `${VOICE_AI_HTML}${VOICE_AI_SCRIPT}</body>`);
}
