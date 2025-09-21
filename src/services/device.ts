const STORAGE_KEY = 'dishly_device_id_v1';

function generateId(): string {
  return 'dev_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getDeviceId(): string {
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = generateId();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
