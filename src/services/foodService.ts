import { supabase } from '@/integrations/supabase/client';

export interface FoodItem {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  avg_rating?: number | null;
  rating_count?: number | null;
  price?: number | null;
  is_trending?: boolean | null;
  tags?: string[] | null;
  restaurants?: { name?: string | null; city?: string | null; state?: string | null } | null;
}

export async function fetchTrendingFoods(limit = 4): Promise<FoodItem[]> {
  const { data, error } = await supabase
    .from('food_items')
    .select(`*, restaurants (name, city, state)`) 
    .eq('is_trending', true)
    .order('avg_rating', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('fetchTrendingFoods error', error);
    return [];
  }
  return data ?? [];
}

export async function fetchRecommendedFoods(limit = 4): Promise<FoodItem[]> {
  // Simple heuristic: top-rated non-trending items
  const { data, error } = await supabase
    .from('food_items')
    .select(`*, restaurants (name, city, state)`) 
    .eq('is_trending', false)
    .order('avg_rating', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('fetchRecommendedFoods error', error);
    return [];
  }
  return data ?? [];
}

// Optional: seed helper (not auto-run). Call manually if needed in development.
export async function seedFromLocalJson(restaurants: any[]): Promise<void> {
  // Warning: Requires Supabase RLS policies allowing inserts for anon or use a service role key server-side.
  for (const r of restaurants) {
    const { data: upsertRestaurant, error: restErr } = await supabase
      .from('restaurants')
      .upsert({ name: r.name, address: r.address || null, city: r.city || null, state: r.state || null })
      .select('id, name')
      .single();
    if (restErr || !upsertRestaurant) continue;

    const menus = r.menus || [];
    for (const m of menus) {
      const items = m.items || [];
      for (const it of items) {
        const name: string = it.name;
        const canonicalName = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const tags: string[] = m.section ? [m.section] : [];
        await supabase
          .from('food_items')
          .upsert({
            name,
            canonical_name: canonicalName,
            restaurant_id: (upsertRestaurant as any).id,
            description: it.description || null,
            price: typeof it.price === 'number' ? it.price : null,
            tags,
          });
      }
    }
  }
}
