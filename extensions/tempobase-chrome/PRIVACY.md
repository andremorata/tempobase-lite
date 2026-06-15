# Privacy Policy — TempoBase Chrome Extension

_Last updated: 2026-06-15_

The TempoBase Chrome Extension ("the extension") is a toolbar companion for the TempoBase web app at https://tempobase.pmr.dev/.

## Summary

The extension does not collect, store, sell, or share any personal data.

## What the extension does

- Reuses your existing TempoBase session cookie (set by https://tempobase.pmr.dev/) to authenticate API requests.
- Sends requests only to the TempoBase API at https://tempobase.pmr.dev/ to list projects/tasks and start/stop your own timers.
- Displays the currently running timer in the popup and toolbar badge.

## What the extension does NOT do

- It does not collect, transmit, or store personally identifiable information.
- It does not track your browsing activity.
- It does not use analytics, advertising, or third-party tracking services.
- It does not sell or share any data with third parties.
- It does not store credentials or secrets. Authentication is handled entirely by the TempoBase session cookie issued by the TempoBase web app.

## Data storage

The extension uses Chrome's local storage only for non-personal UI state (such as the last selected project/task). No data is sent off your device by the extension itself; only the TempoBase API receives the timer requests you initiate.

## Permissions

- **Host permission for `https://tempobase.pmr.dev/*`** — required to call the TempoBase API and read the session cookie you already have with TempoBase.
- **Alarms / storage** — used locally to poll the running timer and remember UI state.

## Contact

Questions about this policy can be sent to: andremorata@gmail.com
