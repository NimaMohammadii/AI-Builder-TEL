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

  .vexa-voice-ai-record {
    display: block;
    width: 100%;
    box-sizing: border-box;
    margin-top: 16px;
    padding: 18px;
    border: 0;
    border-radius: 18px;
    text-align: center;
    color: #fff;
    font-size: 16px;
    font-weight: 900;
    background: linear-gradient(135deg, #5b0f24, #8f1d3d);
  }

  .vexa-voice-ai-record.listening {
    background: linear-gradient(135deg, #9f1d3f, #d14363);
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
  var recorder = null;
  var streamRef = null;
  var chunks = [];
  var isListening = false;
  var maxTimer = null;

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

  function setListening(value) {
    isListening = !!value;
    var button = byId('vexaVoiceAiRecord');
    if (!button) return;
    button.classList.toggle('listening', isListening);
    button.textContent = isListening ? 'Listening...' : 'Start Talking';
  }

  function cleanupStream() {
    if (maxTimer) clearTimeout(maxTimer);
    maxTimer = null;

    if (streamRef) {
      streamRef.getTracks().forEach(function(track){ track.stop(); });
      streamRef = null;
    }
  }

  function recorderOptions() {
    if (!window.MediaRecorder || !MediaRecorder.isTypeSupported) return {};
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) return { mimeType: 'audio/webm;codecs=opus' };
    if (MediaRecorder.isTypeSupported('audio/webm')) return { mimeType: 'audio/webm' };
    if (MediaRecorder.isTypeSupported('audio/mp4')) return { mimeType: 'audio/mp4' };
    return {};
  }

  async function startConversation() {
    if (isListening) return;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) {
      setStatus('Microphone is not available.');
      return;
    }

    try {
      streamRef = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunks = [];
      recorder = new MediaRecorder(streamRef, recorderOptions());

      recorder.ondataavailable = function(event) {
        if (event.data && event.data.size > 0) chunks.push(event.data);
      };

      recorder.onstop = function() {
        cleanupStream();
        setListening(false);
        sendAudio();
      };

      recorder.start();
      setListening(true);
      setStatus('Speak now. I will answer after you stop.');

      maxTimer = setTimeout(stopConversation, 9000);
    } catch (error) {
      cleanupStream();
      setListening(false);
      setStatus('Microphone permission denied.');
    }
  }

  function stopConversation() {
    if (!recorder || recorder.state === 'inactive') return;
    setStatus('Thinking...');
    recorder.stop();
  }

  async function sendAudio() {
    if (!chunks.length) {
      setStatus('No voice recorded.');
      return;
    }

    try {
      var blob = new Blob(chunks, { type: 'audio/webm' });
      var form = new FormData();
      form.append('audio', blob, 'voice.webm');

      var response = await fetch('/app/api/voice-ai', {
        method: 'POST',
        body: form
      });

      if (!response.ok) {
        var data = await response.json().catch(function(){ return { error: 'Voice AI failed' }; });
        throw new Error(data.error || 'Voice AI failed');
      }

      var audioBlob = await response.blob();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      audioUrl = URL.createObjectURL(audioBlob);

      var player = byId('vexaVoiceAiPlayer');
      player.src = audioUrl;
      player.classList.add('ready');
      setStatus('Answer ready. Tap Start Talking again to continue.');
      player.play().catch(function(){});
    } catch (error) {
      setStatus(error && error.message ? error.message : 'Voice AI failed.');
    }
  }

  function boot() {
    var button = byId('vexaVoiceAiButton');
    var record = byId('vexaVoiceAiRecord');
    if (!button || !record) return;

    button.addEventListener('click', function(){ setSheet(true); });
    byId('vexaVoiceAiClose').addEventListener('click', function(){ setSheet(false); });
    record.addEventListener('click', function(){
      if (isListening) stopConversation();
      else startConversation();
    });
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
    <button id="vexaVoiceAiRecord" class="vexa-voice-ai-record" type="button">Start Talking</button>
    <div id="vexaVoiceAiStatus" class="vexa-voice-ai-status">Tap Start Talking, speak, then I answer.</div>
    <audio id="vexaVoiceAiPlayer" class="vexa-voice-ai-player" controls></audio>
  </div>
</div>
`;

export function miniAppHtml(): string {
  return miniAppShellHtml()
    .replace('</head>', `${VOICE_AI_STYLE}</head>`)
    .replace('</body>', `${VOICE_AI_HTML}${VOICE_AI_SCRIPT}</body>`);
}
