# Vexa Mini App

A separate, production-oriented Telegram Mini App frontend for the premium Plinko experience.

## Stack

- Vite
- TypeScript
- Phaser 3
- Matter Physics

## Run locally

```bash
cd apps/miniapp
npm install
npm run dev
```

Open the Vite URL in a browser. Telegram WebApp APIs are optional and safely ignored outside Telegram.

## Build

```bash
cd apps/miniapp
npm run build
```

The output is written to `apps/miniapp/dist`.

## Why this exists

The legacy Worker miniapp injects large HTML/CSS/JS strings. That is too fragile for a high-quality game UI. This folder isolates the real game frontend so Phaser, Matter physics, assets, animation states, and future Rive integration can be developed safely.

## Next production steps

1. Replace placeholder vector/shape rendering with final board art from Blender or Spline.
2. Add Rive animations for the drop button, active slot, result pill, and big-win state.
3. Serve `dist` from Cloudflare Pages or connect the Worker to serve the built static assets.
4. Move balance and drop settlement to backend APIs if credits become real value.
