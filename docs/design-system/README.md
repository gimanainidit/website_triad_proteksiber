# Design system snapshot

Snapshot of the account design system "Triad PRO-TX Siber x Eranusasiber".

- Source: artifact https://claude.ai/artifact/GoEeTPA2F4dFGvALRqreq3
- Synced: 2026-10-20

| File | Content |
|---|---|
| `tokens.json` | Color, type, spacing, radius, shadow and breakpoint tokens. Reference for the drift test `frontend/src/test/design-tokens.test.ts`. |
| `components.css` | The `tps-*` component styles (artifact `bundle.css`). Reference only, not imported by the app. Its Google Fonts `@import` is not used: the app self-hosts fonts via `@fontsource`. |
| `layout.md` | Spacing, grid and page frame. |
| `dos-donts.md` | Do and don't rules. |

To update, re-sync from the artifact and edit `frontend/src/index.css` until the drift test passes.
