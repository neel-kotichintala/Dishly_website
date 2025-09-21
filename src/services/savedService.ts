const STORAGE_KEY = 'dishly_saved_food_ids_v1';

export function getSavedIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isSaved(id?: string | null): boolean {
  if (!id) return false;
  return getSavedIds().includes(id);
}

export function toggleSaved(id?: string | null): boolean {
  if (!id) return false;
  const current = getSavedIds();
  const idx = current.indexOf(id);
  if (idx >= 0) {
    current.splice(idx, 1);
  } else {
    current.push(id);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  return current.includes(id);
}

export function setSaved(id: string, value: boolean) {
  const current = new Set(getSavedIds());
  if (value) current.add(id); else current.delete(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(current)));
}
