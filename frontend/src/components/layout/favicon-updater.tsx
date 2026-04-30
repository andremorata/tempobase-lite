"use client";

import { useEffect } from "react";
import { useRunningEntry } from "@/lib/api/hooks/time-entries";

const ACTIVE_FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="7" fill="url(#bg)"/>
  <rect x="7" y="7.5" width="18" height="3.5" rx="1.75" fill="#fff"/>
  <rect x="14.25" y="9" width="3.5" height="16.5" rx="1.75" fill="#fff"/>
  <circle cx="16" cy="27" r="1.2" fill="rgba(255,255,255,0.5)"/>
  <circle cx="27" cy="27" r="5" fill="#ef4444"/>
</svg>`;

function getOrCreateFaviconLink(): HTMLLinkElement {
  const existing = document.querySelector<HTMLLinkElement>("link[rel='icon']");
  if (existing) return existing;
  const link = document.createElement("link");
  link.rel = "icon";
  link.type = "image/svg+xml";
  document.head.appendChild(link);
  return link;
}

export function FaviconUpdater() {
  const { data: runningEntry } = useRunningEntry();
  const isRunning = !!runningEntry;

  useEffect(() => {
    const link = getOrCreateFaviconLink();
    if (isRunning) {
      link.href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(ACTIVE_FAVICON_SVG)}`;
    } else {
      link.href = "/icon.svg";
    }
  }, [isRunning]);

  return null;
}
