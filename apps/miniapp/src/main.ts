import Phaser from 'phaser';
import './styles.css';
import { PlinkoScene, type PlinkoDropResult } from './game/PlinkoScene';

const MULTIPLIERS = [10, 3, 0.5, 0.5, 3, 10] as const;

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
  }
}

let balance = 2500;
let bet = 25;
let lastWin = 0;
let phaserGame: Phaser.Game | null = null;
let plinkoScene: PlinkoScene | null = null;
let isDropping = false;

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
          ${MULTIPLIERS.map((m, i) => `<div class="slot${i === 0 || i === 5 ? ' hot' : ''}" data-slot="${i}"><b>${m}x</b></div>`).join('')}
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

const stage = document.querySelector<HTMLDivElement>('#gameStage');
if (!stage) throw new Error('Game stage not found');

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

function onDropStarted(dropBet: number): void {
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
    onPegHit: () => haptic('impact'),
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
        gravity: { y: 1.08 },
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
