const STORAGE_KEY = 'dishly_recent_food_ids_v1';

export function getRecentIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function pushRecent(id?: string | null) {
  if (!id) return;
  const list = getRecentIds();
  const filtered = list.filter((x) => x !== id);
  filtered.unshift(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function clearRecent() {
  localStorage.removeItem(STORAGE_KEY);
}
