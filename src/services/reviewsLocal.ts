import { getDeviceId } from './device';

const STORAGE_KEY = 'dishly_local_reviews_v1';

type LocalReview = {
  id: string;
  food_item_id: string;
  user_id: string;
  rating: number;
  text: string | null;
  created_at: string;
};

function readAll(): LocalReview[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(list: LocalReview[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function addLocalReview(foodId: string, rating: number, text: string | null) {
  const list = readAll();
  const review: LocalReview = {
    id: 'lr_' + Date.now().toString(36),
    food_item_id: foodId,
    user_id: getDeviceId(),
    rating,
    text,
    created_at: new Date().toISOString(),
  };
  list.unshift(review);
  writeAll(list);
  return review;
}

export function getLocalReviewsByFood(foodId: string): LocalReview[] {
  return readAll().filter((r) => r.food_item_id === foodId);
}

export function getLocalReviewsByUser(userId?: string): LocalReview[] {
  const uid = userId || getDeviceId();
  return readAll().filter((r) => r.user_id === uid);
}
