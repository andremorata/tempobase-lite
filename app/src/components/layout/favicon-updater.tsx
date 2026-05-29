"use client";

import { useEffect } from "react";
import { useRunningEntry } from "@/lib/api/hooks/time-entries";

const ACTIVE_FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#15211b"/>
  <g fill="none" stroke="#34d399" stroke-width="28" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="256" cy="256" r="132"/>
    <polyline points="256,176.8 256,256 308.8,282.4"/>
  </g>
  <circle cx="420" cy="420" r="78" fill="#ef4444" stroke="#15211b" stroke-width="20"/>
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
