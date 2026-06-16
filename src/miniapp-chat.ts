import { miniAppShellHtml } from './miniapp/shell';

const VOICE_AI_STYLE = `
<style id="vexaVoiceAiStyle">
  .vexa-voice-ai-button {
    position: fixed;
    right: 16px;
    bottom: 94px;
    z-index: 9000;
    min-width: 132px;
    border: 0;
    border-radius: 999px;
    padding: 13px 16px;
    background: rgba(86, 16, 35, .92);
    color: #fff;
    font-weight: 900;
    box-shadow: 0 18px 42px rgba(0, 0, 0, .38);
  }

  .vexa-voice-ai-button.listening {
    background: linear-gradient(135deg, #8f1d3d, #d14363);
  }

  .vexa-voice-ai-button.thinking {
    background: rgba(42, 42, 52, .92);
  }

  .vexa-voice-ai-button.speaking {
    background: linear-gradient(135deg, #5b0f24, #8f1d3d);
  }

  .vexa-voice-ai-player {
    display: none;
  }
</style>
`;

const VOICE_AI_SCRIPT = `
<script id="vexaVoiceAiScript">
(function(){
  var audioUrl = '';
  var recorder = null;
  var streamRef = null;
  var audioContext = null;
  var analyser = null;
  var source = null;
  var chunks = [];
  var active = false;
  var state = 'idle';
  var startedAt = 0;
  var lastVoiceAt = 0;
  var frameId = 0;
  var maxTimer = null;

  var MIN_RECORD_MS = 1800;
  var SILENCE_MS = 2600;
  var MAX_RECORD_MS = 18000;
  var VOICE_LEVEL = 10;

  function byId(id) {
    return document.getElementById(id);
  }

  function button() {
    return byId('vexaVoiceAiButton');
  }

  function player() {
    return byId('vexaVoiceAiPlayer');
  }

  function telegramInitData() {
    return window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp.initData || '' : '';
  }

  function setState(nextState, text) {
    state = nextState;
    var btn = button();
    if (!btn) return;

    btn.classList.toggle('listening', state === 'listening');
    btn.classList.toggle('thinking', state === 'thinking');
    btn.classList.toggle('speaking', state === 'speaking');
    btn.textContent = text;
  }

  function recorderOptions() {
    if (!window.MediaRecorder || !MediaRecorder.isTypeSupported) return {};
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) return { mimeType: 'audio/webm;codecs=opus' };
    if (MediaRecorder.isTypeSupported('audio/webm')) return { mimeType: 'audio/webm' };
    if (MediaRecorder.isTypeSupported('audio/mp4')) return { mimeType: 'audio/mp4' };
    return {};
  }

  function stopMonitor() {
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;

    if (maxTimer) clearTimeout(maxTimer);
    maxTimer = null;
  }

  function cleanupStream() {
    stopMonitor();

    if (streamRef) {
      streamRef.getTracks().forEach(function(track){ track.stop(); });
      streamRef = null;
    }

    if (audioContext) {
      audioContext.close().catch(function(){});
      audioContext = null;
    }

    analyser = null;
    source = null;
  }

  function createVoiceMonitor(stream) {
    var AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return false;

    audioContext = new AudioCtor();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    return true;
  }

  function monitorVoice() {
    if (!analyser || state !== 'listening') return;

    var data = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(data);

    var total = 0;
    for (var i = 0; i < data.length; i++) {
      total += Math.abs(data[i] - 128);
    }

    var level = total / data.length;
    var now = Date.now();

    if (level > VOICE_LEVEL) lastVoiceAt = now;

    if (now - startedAt > MIN_RECORD_MS && now - lastVoiceAt > SILENCE_MS) {
      stopListening();
      return;
    }

    frameId = requestAnimationFrame(monitorVoice);
  }

  async function startListening() {
    if (!active || state === 'listening' || state === 'thinking' || state === 'speaking') return;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) {
      active = false;
      setState('idle', 'Mic Not Available');
      return;
    }

    try {
      streamRef = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunks = [];
      startedAt = Date.now();
      lastVoiceAt = startedAt;

      recorder = new MediaRecorder(streamRef, recorderOptions());
      recorder.ondataavailable = function(event) {
        if (event.data && event.data.size > 0) chunks.push(event.data);
      };
      recorder.onstop = function() {
        cleanupStream();
        sendAudio();
      };

      recorder.start();
      setState('listening', 'Listening...');

      if (createVoiceMonitor(streamRef)) {
        frameId = requestAnimationFrame(monitorVoice);
      }

      maxTimer = setTimeout(stopListening, MAX_RECORD_MS);
    } catch (error) {
      cleanupStream();
      active = false;
      setState('idle', 'Mic Error');
    }
  }

  function stopListening() {
    if (!recorder || recorder.state === 'inactive') return;
    setState('thinking', 'Thinking...');
    recorder.stop();
  }

  async function sendAudio() {
    if (!active) {
      setState('idle', 'AI Voice');
      return;
    }

    if (!chunks.length) {
      setState('idle', 'AI Voice');
      active = false;
      return;
    }

    try {
      var blob = new Blob(chunks, { type: 'audio/webm' });
      var form = new FormData();
      form.append('audio', blob, 'voice.webm');
      form.append('initData', telegramInitData());

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

      var audioPlayer = player();
      audioPlayer.src = audioUrl;
      setState('speaking', 'AI Speaking...');
      audioPlayer.play().catch(function(){
        setState('idle', 'Tap To Continue');
      });
    } catch (error) {
      active = false;
      setState('idle', 'AI Voice');
    }
  }

  function stopAll() {
    active = false;
    cleanupStream();

    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }

    var audioPlayer = player();
    if (audioPlayer) audioPlayer.pause();

    setState('idle', 'AI Voice');
  }

  function boot() {
    var btn = button();
    var audioPlayer = player();
    if (!btn || !audioPlayer) return;

    btn.addEventListener('click', function(){
      if (active) {
        stopAll();
        return;
      }

      active = true;
      startListening();
    });

    audioPlayer.addEventListener('ended', function(){
      if (!active) {
        setState('idle', 'AI Voice');
        return;
      }

      setState('idle', 'Listening Again...');
      setTimeout(startListening, 350);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
</script>
`;

const VOICE_AI_HTML = `
<button id="vexaVoiceAiButton" class="vexa-voice-ai-button" type="button">AI Voice</button>
<audio id="vexaVoiceAiPlayer" class="vexa-voice-ai-player"></audio>
`;

export function miniAppHtml(): string {
  return miniAppShellHtml()
    .replace('</head>', `${VOICE_AI_STYLE}</head>`)
    .replace('</body>', `${VOICE_AI_HTML}${VOICE_AI_SCRIPT}</body>`);
}
