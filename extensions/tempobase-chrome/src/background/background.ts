import { getRunningTimer, TempoBaseError } from '@/api/client';

const BADGE_POLL_ALARM = 'tempobase-poll-running';
const BADGE_POLL_INTERVAL_MINUTES = 0.25; // 15 seconds

interface RunningTimerState {
  entryId: string | null;
  startTime: string | null;
}

async function readRunningState(): Promise<RunningTimerState> {
  const data = await chrome.storage.session.get(['runningEntryId', 'runningStartTime']);
  return {
    entryId: (data.runningEntryId as string | undefined) ?? null,
    startTime: (data.runningStartTime as string | undefined) ?? null,
  };
}

async function writeRunningState(state: RunningTimerState): Promise<void> {
  await chrome.storage.session.set({
    runningEntryId: state.entryId,
    runningStartTime: state.startTime,
  });
}

const ICON_SIZE = 128;

async function loadIconImage(): Promise<ImageBitmap> {
  const response = await fetch(chrome.runtime.getURL('icon128.png'));
  const blob = await response.blob();
  return createImageBitmap(blob);
}

async function setToolbarIcon(running: boolean): Promise<void> {
  const offscreen = new OffscreenCanvas(ICON_SIZE, ICON_SIZE);
  const ctx = offscreen.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2d context');
  }

  const icon = await loadIconImage();
  ctx.drawImage(icon, 0, 0, ICON_SIZE, ICON_SIZE);

  if (running) {
    // Small red dot in the top-right corner, on top of the icon
    const dotRadius = ICON_SIZE * 0.12;
    const cx = ICON_SIZE - dotRadius * 1.4;
    const cy = dotRadius * 1.4;
    ctx.beginPath();
    ctx.arc(cx, cy, dotRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#dc2626';
    ctx.fill();
    // Subtle border for visibility on any background
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = Math.max(1, ICON_SIZE * 0.01);
    ctx.stroke();
  }

  const imageData = ctx.getImageData(0, 0, ICON_SIZE, ICON_SIZE);
  await chrome.action.setIcon({ imageData });
}

async function updateBadge(running: { id: string; startTime: string } | null): Promise<void> {
  if (running) {
    await setToolbarIcon(true);
    await chrome.action.setBadgeText({ text: '' });
    await chrome.action.setTitle({ title: 'TempoBase — timer running' });
  } else {
    await setToolbarIcon(false);
    await chrome.action.setBadgeText({ text: '' });
    await chrome.action.setTitle({ title: 'TempoBase' });
  }
}

async function refreshRunningTimer(): Promise<void> {
  try {
    const entry = await getRunningTimer();
    const nextState: RunningTimerState = entry?.isRunning
      ? { entryId: entry.id, startTime: entry.startTime }
      : { entryId: null, startTime: null };

    const current = await readRunningState();
    if (current.entryId !== nextState.entryId || current.startTime !== nextState.startTime) {
      await writeRunningState(nextState);
      await updateBadge(nextState.entryId ? { id: nextState.entryId, startTime: nextState.startTime! } : null);
    }
  } catch (error) {
    if (error instanceof TempoBaseError && error.status === 401) {
      // User is not logged in; clear badge and state.
      await writeRunningState({ entryId: null, startTime: null });
      await updateBadge(null);
    }
    // Swallow other transient errors to avoid noisy badge flickering.
  }
}

async function setupAlarm(): Promise<void> {
  const existing = await chrome.alarms.get(BADGE_POLL_ALARM);
  if (existing) return;
  await chrome.alarms.create(BADGE_POLL_ALARM, {
    periodInMinutes: BADGE_POLL_INTERVAL_MINUTES,
  });
}

chrome.runtime.onStartup.addListener(() => {
  void refreshRunningTimer();
  void setupAlarm();
});

chrome.runtime.onInstalled.addListener(() => {
  void refreshRunningTimer();
  void setupAlarm();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === BADGE_POLL_ALARM) {
    void refreshRunningTimer();
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'TIMER_STARTED' && typeof message.entryId === 'string' && typeof message.startTime === 'string') {
    void writeRunningState({ entryId: message.entryId, startTime: message.startTime });
    void updateBadge({ id: message.entryId, startTime: message.startTime });
    sendResponse({ ok: true });
    return true;
  }

  if (message?.type === 'TIMER_STOPPED') {
    void writeRunningState({ entryId: null, startTime: null });
    void updateBadge(null);
    sendResponse({ ok: true });
    return true;
  }

  if (message?.type === 'REFRESH_TIMER') {
    void refreshRunningTimer().then(() => sendResponse({ ok: true }));
    return true;
  }

  return false;
});

// Initialize immediately on load in case the event is long-lived.
void refreshRunningTimer();
void setupAlarm();
