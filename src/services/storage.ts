const STORAGE_KEY = 'finanzas_pro_data';

export function loadState<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${key}`);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveState<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`${STORAGE_KEY}_${key}`, JSON.stringify(data));
  } catch {
    // storage full or unavailable
  }
}

export function clearAll(): void {
  try {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(STORAGE_KEY));
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}
