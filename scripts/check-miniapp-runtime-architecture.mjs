import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const read = (path) => readFileSync(resolve(root, path), 'utf8');

const files = {
  agents: read('AGENTS.md'),
  shell: read('src/miniapp/shell.ts'),
  playZone: read('src/miniapp/play-zone.ts'),
  boot: read('src/miniapp/boot-loader-script.ts'),
  backgrounds: read('src/miniapp/section-background-script.ts'),
  ghost: read('src/miniapp/ghost-run/index.ts'),
  slot: read('src/miniapp/slot/script.ts'),
  pump: read('src/miniapp/pump/section.ts'),
  back: read('src/miniapp/telegram-back-button-script.ts'),
  crashBack: read('src/miniapp/crash/scripts/back-button.ts'),
};

const failures = [];
function expect(label, condition) {
  if (!condition) failures.push(label);
}
function has(text, value) {
  return text.includes(value);
}
function between(text, start, end) {
  const from = text.indexOf(start);
  if (from < 0) return '';
  const to = text.indexOf(end, from + start.length);
  return to < 0 ? '' : text.slice(from, to);
}

expect('AGENTS.md must keep the protected runtime architecture section.', has(files.agents, '## Protected Mini App runtime architecture'));
expect('Lazy game mount must fail closed until Play Zone visibility is ready.', has(files.shell, "if(!state||!state.ready)return false;"));
expect('Lazy mount must use the existing Play Zone canOpen gate.', has(files.shell, "return typeof state.canOpen==='function'?state.canOpen(id):true;"));
const preloadBody = between(files.shell, 'function preload(){', 'window.VexaLazySections=');
expect('Lazy preload() must exist.', Boolean(preloadBody));
expect('Lazy preload() must never mount sections or execute game runtime.', !/\bmount\s*\(/.test(preloadBody));
expect('VexaLazySections must keep ensure=mount and preload=preload as separate paths.', has(files.shell, 'window.VexaLazySections={ensure:mount,preload:preload,isGame:isGame};'));

expect('Hidden games must be denied by canOpen without an admin bypass.', /canOpen:function\(id\)\{[^}]*!state\.isHidden\(id\)/.test(files.playZone));
expect('Hidden games must be denied by shouldPreload without an admin bypass.', /shouldPreload:function\(id\)\{[^}]*!state\.isHidden\(id\)/.test(files.playZone));
expect('canOpen must not contain an admin bypass.', !/canOpen:function\(id\)\{[^}]*state\.admin/.test(files.playZone));
expect('shouldPreload must not contain an admin bypass.', !/shouldPreload:function\(id\)\{[^}]*state\.admin/.test(files.playZone));
expect('Visibility failures must fail closed by hiding all game ids.', has(files.playZone, 'function fallbackHidden(){return Object.keys(gameIds)}'));
expect('A failed visibility request must remain retryable in the same session.', !/\.catch\(function\(\)\{loaded=true/.test(files.playZone));
expect('Play Hub card images must only load after visibility is ready and the card is visible.', has(files.playZone, "function shouldLoad(id){var state=visibility();return !!(state&&state.ready&&!state.isHidden(id))}"));

expect('Boot asset loading must wait for Play Zone visibility readiness.', has(files.boot, 'Promise.resolve(window.__vexaPlayZoneVisibilityReady||false)'));
expect('Per-game boot manifests must be gated by shouldPreloadGame.', has(files.boot, 'if(spec.game&&!shouldPreloadGame(spec.game))return Promise.resolve(true);'));
expect('Section background URLs in boot preload must be visibility-gated.', has(files.boot, 'if(url&&shouldPreloadGame(id))out.push(url)'));
expect('Runtime section backgrounds must use the Play Zone preload gate.', has(files.backgrounds, 'state.shouldPreload(id)'));
expect('Runtime section backgrounds must stop when visibility denies the section.', has(files.backgrounds, 'if(!visibilityAllowsSection(id))return false;'));

expect('Ghost Run runtime must require an active visible section.', has(files.ghost, "function isActive(){return !!(root&&root.classList.contains('active')&&!document.hidden)}"));
expect('Ghost Run reconnects must stop while inactive.', has(files.ghost, 'function scheduleReconnect(){if(!isActive()'));
expect('Ghost Run must expose a stopRuntime lifecycle.', has(files.ghost, 'function stopRuntime(){clearReconnect();'));
expect('Ghost Run RAF must immediately stop while inactive.', has(files.ghost, 'function tick(){raf=0;if(!isActive())return;'));
expect('Ghost Run must resync on view changes.', has(files.ghost, "window.addEventListener('vexa:view-changed',syncRuntime);"));
expect('Ghost Run must not restore the old eager startup runtime chain.', !/loadAssets\(\);renderHistory\(\);connect\(\)/.test(files.ghost));

expect('Slot runtime must be gated by active section and document visibility.', has(files.slot, "function slotActive(){var root=q('slot');return !!(root&&root.classList.contains('active')&&!document.hidden)}"));
expect('Slot reel RAF must stop when Slot is inactive.', has(files.slot, 'if(!slotActive()){finishVirtualReel();return}'));
expect('Slot background live/sound/effect work must stop when inactive.', has(files.slot, 'stopSlotSound();clearWinEffect()'));
expect('Slot observer must be scoped to #slot.', has(files.slot, "new MutationObserver(smartSlotLiveSync).observe(slotRoot,{attributes:true,attributeFilter:['class']})"));
expect('Slot must never restore a body-wide MutationObserver.', !/observe\(document\.body/.test(files.slot));

expect('Pump WebGL runtime must require an active visible section.', has(files.pump, "function active(){return !document.hidden&&root.classList.contains('active')&&document.body.contains(canvas);}"));
expect('Pump render loop must stop while inactive.', has(files.pump, 'if(!active())return;'));
expect('Pump RAF lifecycle must react to view changes.', has(files.pump, "window.addEventListener('vexa:view-changed',syncLoop);"));
expect('Pump RAF lifecycle must react to document visibility.', has(files.pump, "document.addEventListener('visibilitychange',syncLoop);"));

expect('Telegram Back Button must use the existing Play Hub navigation path.', has(files.back, 'button[data-view="playzone"]'));
expect('Telegram Back Button must observe views, not the whole body.', !/observe\(document\.body/.test(files.back));
expect('Telegram Back Button must have only the primary BackButton click path.', !/backButtonClicked/.test(files.back));
expect('Crash must not restore a second Back Button controller.', /^export const CRASH_BACK_BUTTON_SCRIPT = ''\s*;?\s*$/.test(files.crashBack.trim()));

if (failures.length) {
  console.error('\nMini App runtime architecture guard FAILED:\n');
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  console.error('\nDo not weaken or delete this guard to make a change pass. Fix the architecture or obtain an explicit user request to change the protected invariant.\n');
  process.exit(1);
}

console.log('Mini App runtime architecture guard passed.');
