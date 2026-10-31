import { useSyncExternalStore } from "react";
import type { Draft, Lang, Reference, Style } from "./types";
import { todayIso } from "./text";

export type LibraryState = { items: Reference[]; style: Style; lang: Lang };

const STORAGE_KEY = "sitasi:v1";
const DEFAULT_STATE: LibraryState = { items: [], style: "apa", lang: "id" };

let state = DEFAULT_STATE;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw) as Partial<LibraryState>;
    state = {
      items: Array.isArray(saved.items) ? saved.items : [],
      style: saved.style === "ieee" || saved.style === "harvard" ? saved.style : "apa",
      lang: saved.lang === "en" ? "en" : "id",
    };
  } catch {
    state = DEFAULT_STATE;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    loaded = false;
    load();
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  load();
  return state;
}

export function updateLibrary(fn: (s: LibraryState) => LibraryState) {
  load();
  state = fn(state);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Penyimpanan penuh atau diblokir (mode privat); daftar tetap jalan selama tab terbuka.
  }
  listeners.forEach((l) => l());
}

export function useLibrary(): LibraryState {
  return useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_STATE);
}

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function emptyDraft(): Draft {
  return { type: "journal", authors: [], title: "" };
}

export function withDefaults(d: Draft): Draft {
  return d.type === "web" && !d.accessed ? { ...d, accessed: todayIso() } : d;
}
