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

## Before finishing any change

Perform a repository search for the feature you changed and verify:

1. No duplicate implementation was introduced.
2. No old parallel path remains unintentionally.
3. No unrelated file was modified.
4. Imports/exports still point to the authoritative implementation.
5. Feature-specific UI is not leaking into unrelated shared files.
6. The requested behavior still uses the existing backend/API path unless explicitly changed.

If duplicate/legacy code already exists but removing it would be outside the requested scope, do not silently rewrite it. Report it clearly.

## Response after coding

Keep the final report short and concrete:
- files changed
- what changed
- whether any duplicate/parallel implementation remains
- whether anything outside the requested scope was touched

## Priority

When a user instruction conflicts with this file, follow the user's explicit instruction. Otherwise these rules are mandatory.
