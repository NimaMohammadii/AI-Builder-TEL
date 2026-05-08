import Phaser from 'phaser';
import './styles.css';
import { PlinkoScene, type PlinkoDropResult } from './game/PlinkoScene';

const UI_MULTIPLIERS = [5, 2, 1.2, 0.5, 0.5, 1.2, 2, 5] as const;

type TelegramWebApp = {
  ready?: () => void;
  expand?: () => void;
  HapticFeedback?: {
    impactOccurred?: (style: 'light' | 'medium' | 'heavy') => void;
    notificationOccurred?: (type: 'success' | 'warning' | 'error') => void;
  };
};

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
    webkitAudioContext?: typeof AudioContext;
  }
}

let balance = 2500;
let bet = 25;
let lastWin = 0;
let phaserGame: Phaser.Game | null = null;
let plinkoScene: PlinkoScene | null = null;
let isDropping = false;
let audioContext: AudioContext | null = null;
let lastPegSoundAt = 0;
let pegToneIndex = 0;

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App root not found');
}

window.Telegram?.WebApp?.ready?.();
window.Telegram?.WebApp?.expand?.();

app.innerHTML = `
  <main class="app-shell">
    <header class="topbar">
      <div class="topbar__close">Close</div>
      <div class="topbar__brand"><strong>VEXA</strong><span>mini app</span></div>
      <button class="topbar__menu" aria-label="Menu">⋯</button>
    </header>

    <section class="plinko-page">
      <div class="hero-head">
        <div class="vexa-mark" aria-hidden="true">
          <svg viewBox="0 0 100 100" fill="none">
            <path d="M8 18L48 83L32 42L50 59L68 42L52 83L92 18L50 47L8 18Z" fill="url(#g)"/>
            <defs><linearGradient id="g" x1="14" y1="15" x2="76" y2="82" gradientUnits="userSpaceOnUse"><stop stop-color="#fff"/><stop offset=".45" stop-color="#a8a8a8"/><stop offset="1" stop-color="#222"/></linearGradient></defs>
          </svg>
        </div>
        <div class="title-block"><h1>Plinko Arena</h1><p>Premium drop game</p></div>
        <div class="credit-pill"><span class="coin">$</span><span id="balanceValue">2,500</span><button aria-label="Add credits">+</button></div>
      </div>

      <div class="game-card">
        <div id="gameStage" class="game-stage"></div>
        <div class="drop-gate"><span>∨</span></div>
        <div class="slots" id="slots">
          ${UI_MULTIPLIERS.map((m, i) => `<div class="slot${i === 0 || i === UI_MULTIPLIERS.length - 1 ? ' hot' : ''}" data-slot="${i}"><b>${m}x</b></div>`).join('')}
        </div>
      </div>

      <div class="hud-row">
        <div class="hud-card">
          <div class="hud-icon">◉</div>
          <div><span class="hud-label">Bet</span><strong id="betValue" class="hud-value">25</strong></div>
          <div class="bet-buttons"><button data-action="bet-down">−</button><button data-action="bet-up">+</button></div>
        </div>
        <div class="hud-card">
          <div class="hud-icon">♕</div>
          <div><span class="hud-label">Last win</span><strong id="lastWinValue" class="hud-value">0</strong></div>
        </div>
      </div>

      <button id="dropButton" class="drop-button" data-action="drop"><span class="ball-icon"></span><span>DROP BALL</span></button>
      <div id="resultPill" class="result-pill"><span>Ready</span></div>
    </section>

    <nav class="bottom-nav">
      <button class="nav-item"><i>⌂</i><span>Home</span></button>
      <button class="nav-item"><i>☑</i><span>Tasks</span></button>
      <button class="nav-item active"><i>⠿</i><span>Plinko</span></button>
      <button class="nav-item"><i>♕</i><span>Leaderboard</span></button>
      <button class="nav-item"><i>◎</i><span>Profile</span></button>
    </nav>
  </main>
`;

const stageElement = document.querySelector<HTMLDivElement>('#gameStage');
if (!stageElement) throw new Error('Game stage not found');
const stage = stageElement;

function getAudioContext(): AudioContext | null {
  const AudioContextCtor = window.AudioContext ?? window.webkitAudioContext;
  if (!AudioContextCtor) return null;
  if (!audioContext) audioContext = new AudioContextCtor();
  return audioContext;
}

function primeAudio(): void {
  void getAudioContext()?.resume();
}

function playPegHitSound(): void {
  const context = getAudioContext();
  if (!context) return;

  const nowMs = performance.now();
  if (nowMs - lastPegSoundAt < 130) return;
  lastPegSoundAt = nowMs;
  void context.resume();

  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();
  const tones = [820, 980, 1160, 1320];
  const tone = tones[pegToneIndex % tones.length] + Phaser.Math.Between(-55, 55);
  pegToneIndex += 1;

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(tone, now);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(220, tone * 0.58), now + 0.055);
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(tone, now);
  filter.Q.setValueAtTime(8, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.095, now + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

  oscillator.connect(filter).connect(gain).connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.075);
}

function playGlassBreakSound(): void {
  const context = getAudioContext();
  if (!context) return;
  void context.resume();

  const now = context.currentTime;
  const noiseBuffer = context.createBuffer(1, Math.floor(context.sampleRate * 0.34), context.sampleRate);
  const samples = noiseBuffer.getChannelData(0);
  for (let i = 0; i < samples.length; i += 1) {
    const fade = 1 - i / samples.length;
    samples[i] = (Math.random() * 2 - 1) * fade * fade;
  }

  const noise = context.createBufferSource();
  noise.buffer = noiseBuffer;
  const highpass = context.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.setValueAtTime(1800, now);
  const noiseGain = context.createGain();
  noiseGain.gain.setValueAtTime(0.0001, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.38, now + 0.012);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
  noise.connect(highpass).connect(noiseGain).connect(context.destination);
  noise.start(now);
  noise.stop(now + 0.36);

  for (let i = 0; i < 9; i += 1) {
    const ping = context.createOscillator();
    const pingGain = context.createGain();
    const start = now + i * 0.012;
    ping.type = 'triangle';
    ping.frequency.setValueAtTime(Phaser.Math.Between(1800, 5200), start);
    pingGain.gain.setValueAtTime(0.0001, start);
    pingGain.gain.exponentialRampToValueAtTime(0.07, start + 0.004);
    pingGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.095);
    ping.connect(pingGain).connect(context.destination);
    ping.start(start);
    ping.stop(start + 0.11);
  }
}

function haptic(kind: 'impact' | 'success'): void {
  try {
    const hapticFeedback = window.Telegram?.WebApp?.HapticFeedback;
    if (kind === 'success') hapticFeedback?.notificationOccurred?.('success');
    else hapticFeedback?.impactOccurred?.('light');
  } catch {
    // Telegram haptics are optional.
  }
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}

function updateHud(): void {
  document.querySelector('#balanceValue')!.textContent = formatNumber(balance);
  document.querySelector('#betValue')!.textContent = String(bet);
  document.querySelector('#lastWinValue')!.textContent = String(lastWin);
  const dropButton = document.querySelector<HTMLButtonElement>('#dropButton');
  if (dropButton) dropButton.disabled = isDropping || balance < bet;
}

function setResult(text: string, win = false): void {
  const pill = document.querySelector<HTMLDivElement>('#resultPill');
  if (!pill) return;
  pill.innerHTML = `<span>${text}</span>`;
  pill.classList.toggle('win', win);
  if (win) setTimeout(() => pill.classList.remove('win'), 650);
}

function clearActiveSlot(): void {
  document.querySelectorAll('.slot').forEach((slot) => slot.classList.remove('active'));
}

function setActiveSlot(slot: number): void {
  clearActiveSlot();
  document.querySelector(`.slot[data-slot="${slot}"]`)?.classList.add('active');
}

function triggerSlotBreak(slot: number): void {
  const slotElement = document.querySelector<HTMLDivElement>(`.slot[data-slot="${slot}"]`);
  if (!slotElement) return;
  slotElement.classList.remove('breaking');
  void slotElement.offsetWidth;
  slotElement.classList.add('breaking');
  window.setTimeout(() => slotElement.classList.remove('breaking'), 760);
}

function onDropStarted(dropBet: number): void {
  primeAudio();
  isDropping = true;
  balance -= dropBet;
  clearActiveSlot();
  setResult('Dropping…');
  document.querySelector('#dropButton span:last-child')!.textContent = 'DROPPING…';
  updateHud();
  haptic('impact');
}

function onDropFinished(result: PlinkoDropResult): void {
  isDropping = false;
  balance += result.win;
  lastWin = result.win;
  setActiveSlot(result.slot);
  setResult(`${result.multiplier}x  +${result.win}`, true);
  document.querySelector('#dropButton span:last-child')!.textContent = 'DROP BALL';
  updateHud();
  haptic(result.multiplier >= 10 ? 'success' : 'impact');
}

function mountGame(): void {
  const width = Math.max(300, stage.clientWidth || 360);
  const height = Math.max(330, stage.clientHeight || 430);

  plinkoScene = new PlinkoScene({
    onDropStarted,
    onDropFinished,
    onPegHit: () => {
      playPegHitSound();
      haptic('impact');
    },
    onGlassBreak: (slot) => {
      triggerSlotBreak(slot);
      playGlassBreakSound();
      haptic('impact');
    },
  });

  phaserGame = new Phaser.Game({
    type: Phaser.CANVAS,
    parent: stage,
    width,
    height,
    transparent: true,
    backgroundColor: 'rgba(0,0,0,0)',
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'matter',
      matter: {
        debug: false,
        gravity: { x: 0, y: 1.08 },
      },
    },
    scene: plinkoScene,
  });
}

function changeBet(delta: number): void {
  bet = Math.max(25, Math.min(500, bet + delta));
  updateHud();
}

document.body.addEventListener('click', (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button');
  if (!button) return;
  const action = button.dataset.action;
  if (action === 'bet-down') changeBet(-25);
  if (action === 'bet-up') changeBet(25);
  if (action === 'drop') {
    if (balance < bet) {
      setResult('Low credits');
      return;
    }
    plinkoScene?.drop(bet);
  }
});

window.addEventListener('resize', () => {
  if (!phaserGame) return;
  phaserGame.scale.resize(Math.max(300, stage.clientWidth || 360), Math.max(330, stage.clientHeight || 430));
});

mountGame();
updateHud();
