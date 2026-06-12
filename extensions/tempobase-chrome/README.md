# TempoBase Chrome Extension

Browser toolbar companion for [TempoBase](https://tempobase.pmr.dev/).

## Features

- Start and stop timers from the toolbar popup.
- Pick project and task with the same access rules as the web app.
- Live duration counter while a timer is running.
- Toolbar badge shows when a timer is active.
- Background service worker polls the running timer every 15 seconds.

## Development

```bash
cd extensions/tempobase-chrome
pnpm install
pnpm dev
```

`pnpm dev` runs Vite in watch mode and rebuilds `dist/` on change. Load `dist/` as an unpacked extension in Chrome:

1. Open `chrome://extensions/`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `dist` folder.

## Build

```bash
pnpm build
```

Produces a production `dist/` folder ready for the Chrome Web Store.

## Authentication

The extension reuses the existing TempoBase session cookie. Make sure you are signed in at `https://tempobase.pmr.dev/` in the same browser profile. If not signed in, the popup shows a sign-in prompt.

## Project structure

```
src/
  api/
    client.ts    # Fetch wrapper for TempoBase API
    types.ts     # Shared response types
  background/
    background.ts # Service worker, alarm polling, badge state
    badge.ts      # Popup-to-background notification helpers
  popup/
    main.tsx      # Popup entry point
    Popup.tsx     # Timer UI
    popup.css     # Popup styles
  config.ts       # Prod API base URL and routes
```

## Notes

- Manifest V3.
- Host permission is scoped to `https://tempobase.pmr.dev/*`.
- No secrets are stored by the extension.
