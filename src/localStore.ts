import { AppState } from "./AppState";

const KEY = "appState";

export function saveToLocalStore(state: AppState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function loadFromLocalStore(): AppState | null {
  const savedState = localStorage.getItem(KEY);
  if (savedState != null) {
    return JSON.parse(savedState);
  }

  return null;
}
