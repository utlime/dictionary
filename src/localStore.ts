import { AppState } from "./AppState";

export function saveToLocalStore(state: AppState) {
  localStorage.setItem("appState", JSON.stringify(state));
}

export function loadFromLocalStore(): AppState | null {
  const savedState = localStorage.getItem("appState");
  if (savedState != null) {
    return JSON.parse(savedState);
  }

  return null;
}
