const STORAGE_KEY = 'openaiKey';

export function getStoredKey(): string | null {
  const fromEnv = import.meta.env.VITE_OPENAI_API_KEY;
  if (fromEnv) return fromEnv;
  return sessionStorage.getItem(STORAGE_KEY);
}

export function storeKey(value: string): void {
  sessionStorage.setItem(STORAGE_KEY, value);
}

export function clearStoredKey(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
