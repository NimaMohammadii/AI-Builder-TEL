# AGENTS.md

These rules apply to every coding agent working in this repository.

## Core rule: one feature, one path

Every feature must have one clear source of truth.

Before writing code:
1. Search the repository for the existing implementation.
2. Trace the current HTML/CSS/client logic/backend path for the feature.
3. Identify the authoritative file(s).
4. Modify the existing path instead of creating a parallel one.

Do not create a second implementation just because it is easier.

## Responsive layout vocabulary

The Vexa Game Web App is mobile-first and has only two responsive layout states:

- **Compact Layout**: the default/base Web App layout. It is owned by the mobile/portrait implementation and must be used by phone portrait, iPad portrait, tablet portrait, and comparable portrait/narrow viewports. iPad/tablet portrait may naturally have more available space, but it must not have a separate layout implementation.
- **Wide Layout**: the single shared wide Web App layout for phone landscape, iPad/tablet landscape, laptop, desktop, and other genuinely wide viewports. Wide may use fluid sizing to fit different widths, but it remains one layout state and one implementation.

There is no Medium Layout and there must not be an iPad-specific, tablet-specific, laptop-specific, desktop-specific, portrait-specific, or landscape-specific implementation of the same feature.

These names describe Web App viewport/layout states, not native-device code paths.

### Default instruction behavior

1. **Compact/mobile is always the default target.** If the user asks to move, resize, restyle, add, remove, or otherwise change UI without explicitly naming a layout, make the change in the authoritative base/Compact implementation first.
2. A Compact change must automatically apply to phone portrait and iPad/tablet portrait because they share the same DOM/component, CSS base, state, backend, and runtime path. Do not repeat the same change in a second portrait rule.
3. Do not add a special iPad/tablet portrait media query just to copy or preserve a Compact/mobile change. If portrait needs more breathing room, use intrinsic/fluid sizing that does not create another layout state.
4. A Wide-only change is made only when the user explicitly scopes the request to **Wide Layout**, landscape, laptop/desktop, or clearly describes a wide-screen arrangement.
5. A Wide change must apply through the same Wide implementation to phone landscape, iPad/tablet landscape, laptop, and desktop. Do not duplicate the change per device.
6. Larger widths inside Wide may refine spacing, max-width, or fluid size. Such refinements must not become a third layout, alternate DOM, separate component, alternate route, or different runtime path.

### Responsive implementation rules

1. Never use OS/device-name detection to choose a UI implementation. Use Web viewport/layout conditions and intrinsic/fluid CSS.
2. Compact and Wide must reuse the same authoritative DOM/component, state, backend, and runtime path.
3. Responsive changes belong in the existing feature owner file. Do not create `*-responsive`, `*-tablet`, `*-ipad`, `*-desktop`, `*-portrait`, `*-landscape`, `*-wide`, or similar parallel files.
4. The base CSS/markup is Compact. Wide is an override of that same implementation, not a second implementation.
5. Prefer content-driven/fluid CSS such as `min()`, `max()`, `clamp()`, `minmax()`, flexible Grid/Flex sizing, and max-width constraints so the same Compact or Wide state can fit different screen sizes cleanly.
6. Do not create a new breakpoint merely because one device has a different physical screen size. A breakpoint is allowed only as a size refinement inside Compact or Wide and must not define a new layout state.
7. If an existing Medium/iPad-portrait branch is encountered while working on that feature, remove/refactor that branch into the authoritative Compact base when safe and within the requested scope; do not preserve it as a parallel path.
8. If a breakpoint contract must change, update the existing authoritative responsive rule in place; do not introduce a competing breakpoint path.
9. Preserve internal component geometry when it is intentionally coupled. For example, an image and coordinate-based overlay that form one visual unit must scale/move as one unit rather than being independently resized.

## Strictly forbidden unless explicitly requested

- Duplicate implementations of the same feature.
- New override files to fix an existing UI.
- New fallback implementations that run beside an existing implementation.
- Copying existing logic into another file.
- Injecting a second CSS or JS path for a component already owned elsewhere.
- Adding temporary patches instead of fixing the authoritative implementation.
- Creating a new file when the feature already has an appropriate owner file.
- Moving unrelated code while working on a scoped task.
- Refactoring unrelated sections "for cleanup".
- Creating test/demo/backup/legacy files unless the user explicitly asks for them.

If an existing implementation is wrong, fix or refactor that implementation. Do not layer another implementation on top of it.

## UI ownership

UI for a feature should live in that feature's main Mini App file whenever practical. HTML, feature-specific CSS, and feature-specific client behavior must not be scattered across unrelated files.

Current ownership map:

- Wallet / Deposit / Withdraw / Transactions UI and client behavior -> `src/miniapp/wallet.ts`
- Plinko UI and client game behavior -> `src/miniapp/plinko.ts`
- Crash UI and client game behavior -> `src/miniapp/crash.ts`
- Mines UI and client game behavior -> `src/miniapp/mines.ts`
- Slot UI and client game behavior -> `src/miniapp/slot.ts`
- Home UI -> `src/miniapp/home.ts`
- Shared app shell / mounting / composition only -> `src/miniapp/shell.ts`
- Shared global Mini App behavior only -> `src/miniapp/script.ts`
- Shared global styles only -> `src/miniapp/styles.ts`
- Top balance state/client sync -> `src/miniapp/ton-balance-script.ts`
- Top balance header appearance -> `src/miniapp/balance-overrides.ts`
- TON deposit backend -> `src/ton-deposits.ts`
- Stars deposit backend -> `src/stars-deposits.ts`
- TON withdrawal backend -> `src/ton-withdrawals.ts`
- TON transaction ledger/history backend -> `src/ton-transactions.ts`
- Finance limits/admin settings -> `src/admin-finance-controls.ts`

Do not put feature-specific Wallet/Plinko/Crash/etc. CSS or behavior into generic override/shared files simply to make a change work.

## Shared files are not patch buckets

Files such as `shell.ts`, `script.ts`, `styles.ts`, and generic override files must only contain genuinely shared application behavior.

A shared file must not contain selectors, event handlers, markup, or business logic for one specific feature when that feature already has an owner file.

If feature-specific code is found in a shared file while working on that same feature, prefer moving it into the authoritative feature file when safe and within scope.

## Minimal-change rule

Make the smallest correct change.

- Touch only files required for the requested task.
- Preserve existing behavior that the user did not ask to change.
- Do not rename, reorganize, or modernize unrelated code.
- Do not change backend/API/database code for a UI-only request.
- Do not change UI for a backend-only request.

## No blind fixes

Never guess the implementation path.

Before editing, search for:
- relevant IDs/classes/selectors
- function names
- event handlers
- imports/exports
- API routes used by the feature
- duplicate or override implementations

Read the current file before changing it.

## CSS rule

Do not solve styling problems by adding another higher-specificity rule or more `!important` rules if the same component is already styled elsewhere.

First locate the existing authoritative style and modify/remove the conflicting rule.

Feature-specific CSS belongs with the feature owner whenever possible.

## JavaScript rule

There must not be multiple listeners or scripts independently controlling the same action/state unless the architecture explicitly requires it.

For example, opening/closing one sheet, modal, game panel, or input state should have one controlling path.

Do not add another listener to compensate for a broken existing listener. Fix the existing path.

## Backend rule

Do not create parallel API routes for the same operation.

Reuse existing services/routes and extend the authoritative implementation. Preserve validation, authentication, accounting, idempotency, and transaction behavior unless the task explicitly requires changing them.

## Protected Mini App runtime architecture

The current Mini App runtime lifecycle is intentional and protected. Do not change, weaken, bypass, or duplicate it as part of unrelated UI, styling, copy, game-balance, admin, or feature work.

Protected invariants:

- A Hidden game must not mount, execute embedded/runtime scripts, open WebSockets, start RAF/WebGL loops, or preload heavy game-specific assets.
- Play Zone visibility is the single source of truth for whether a game may mount or preload.
- Hidden means hidden for every user, including admins. Do not add an admin bypass to `canOpen`, `shouldPreload`, card-image loading, direct links, or background loading.
- Visibility uncertainty/failure must be fail-closed. Do not make unknown visibility behave as Visible.
- A failed visibility request must remain retryable; do not permanently lock a session onto a failure fallback.
- Lazy `preload()` must never call `mount()` or execute a game's runtime. `ensure()`/mount is the on-demand execution path.
- A Visible but unopened game may warm approved resources, but it must not start the game runtime.
- Heavy runtime must stop/suspend when the game is inactive or the document is hidden.
- Ghost Run must not keep its RAF/WebSocket/reconnect loop alive after leaving Ghost Run.
- Slot must not keep reel RAF, live timers, sound, win effects, or a body-wide MutationObserver alive after leaving Slot.
- Pump WebGL rendering must stop when Pump is inactive or the document is hidden.
- Telegram Back Button has one shared controller. Do not restore a Crash-specific controller or another independent Back Button path.
- Do not restore body-wide MutationObservers for runtime/navigation lifecycle when a section-scoped observer or `vexa:view-changed` already owns the state transition.
- Do not restore eager lazy-section mounting during boot.

Protected implementation areas include:

- `src/miniapp/shell.ts`
- `src/miniapp/play-zone.ts`
- `src/miniapp/boot-loader-script.ts`
- `src/miniapp/section-background-script.ts`
- `src/miniapp/telegram-back-button-script.ts`
- `src/miniapp/crash/scripts/back-button.ts`
- `src/miniapp/ghost-run/index.ts`
- `src/miniapp/slot/script.ts`
- `src/miniapp/pump/section.ts`

Rules for agents working near these files:

1. Do not alter the protected lifecycle merely because another implementation seems simpler.
2. If a task only changes appearance/content/controls, preserve the runtime lifecycle exactly.
3. If a requested change appears to conflict with a protected invariant, identify the conflict before editing. Only redesign the invariant when the user explicitly asks to change that runtime behavior.
4. Never delete, bypass, weaken, or rewrite `scripts/check-miniapp-runtime-architecture.mjs` just to make a change pass.
5. Never remove the runtime architecture GitHub Action or the deploy guard merely to make CI/deploy pass.
6. After touching any protected implementation area, run `npm run guard:runtime` and `npm run typecheck` before finishing.
7. If the guard fails, fix the implementation. Do not change the guard unless the user explicitly requested a new runtime architecture and the guard must be updated to represent that new architecture.

## Protected TON/Gram wallet connection flow

The current TON/Gram wallet connection behavior in `src/miniapp/wallet.ts` is known-good and protected. Do not change, refactor, simplify, bypass, relocate, duplicate, or remove this connection logic unless the user explicitly asks to change the TON wallet connection behavior itself. A general Wallet UI, payment, copy, styling, cleanup, dependency, or refactor task is not authorization to touch it.

Protected invariants:

- `connectionRestored`, `ui.connected`, `ui.wallet`, and a cached account alone must never make an HTTP/Bridge wallet eligible for TON payment.
- A fresh HTTP/Bridge wallet connection status event may persist a trusted-session proof containing the exact TonConnect session ID, wallet address, and current Telegram user ID.
- An HTTP/Bridge wallet restored from TonConnect storage is verified only when its current session ID, wallet address, and Telegram user ID exactly match that trusted-session proof. The restore must fail closed when the proof or runtime session ID is missing.
- An unverified restored HTTP/Bridge session must show the existing Connect Wallet gate, not the TON payment form.
- When the user connects from that gate, the unrecognized HTTP/Bridge session must be cleared before the wallet modal opens and a fresh connection is accepted.
- Injected wallet restoration may remain usable without the HTTP/Bridge refresh requirement.
- A disconnect event or stale-session cleanup must reset Bridge verification and delete the persisted trusted-session proof.
- `confirmTonPayment()` must reject every unverified wallet before creating a deposit or calling `sendTransaction()`.
- `UNKNOWN_APP_ERROR` handling must keep clearing the stale local session and returning to the existing Connect Wallet gate.
- Do not add polling timers, synthetic transactions, signing prompts, duplicate listeners, alternate wallet clients, or parallel connection paths to infer wallet authorization. A one-shot connection timeout is not polling and may remain.

Protected implementation symbols include:

- `tonBridgeSessionVerified`
- `TON_VERIFIED_SESSION_KEY`
- `isHttpWalletConnection()`
- `verifiedWalletConnection()`
- `forgetVerifiedWalletSession()`
- `readVerifiedWalletSession()`
- `tonWalletSessionId()`
- `rememberVerifiedWalletSession()`
- `restoreVerifiedWalletSession()`
- `clearStaleWalletSession()`
- `waitForTonConnectionRestore()`
- `waitForWalletConnection()`
- `syncTonConnectionUi()`
- `bindTonStatus()`
- `prepareTonEntry()`
- `connectTonWallet()`
- the connection guard at the start of `confirmTonPayment()`

If the user explicitly requests a future change to this protected flow, first re-check the exact pinned TonConnect UI/SDK behavior and preserve a single event-driven connection path. Verify at minimum these cases before finishing: an HTTP restore without matching proof is denied, the same previously verified HTTP session is restored without reconnecting, a different session/address/user is denied, a fresh HTTP connection is accepted, injected restore remains accepted, disconnect deletes verification proof, and no deposit is created before verification.

## Before finishing any change

Perform a repository search for the feature you changed and verify:

1. No duplicate implementation was introduced.
2. No old parallel path remains unintentionally.
3. No unrelated file was modified.
4. Imports/exports still point to the authoritative implementation.
5. Feature-specific UI is not leaking into unrelated shared files.
6. The requested behavior still uses the existing backend/API path unless explicitly changed.
7. If a protected Mini App runtime file was touched, `npm run guard:runtime` still passes.

If duplicate/legacy code already exists but removing it would be outside the requested scope, do not silently rewrite it. Report it clearly.

## Response after coding

Keep the final report short and concrete:
- files changed
- what changed
- whether any duplicate/parallel implementation remains
- whether anything outside the requested scope was touched

## Priority

When a user instruction conflicts with this file, follow the user's explicit instruction. Otherwise these rules are mandatory.
