import { supabase } from '@/integrations/supabase/client';

function slugify(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function uploadMenuFile(restaurantName: string, file: File) {
  const bucket = 'menus';
  const fileName = `${slugify(restaurantName)}-${Date.now()}-${file.name}`;
  const path = `${slugify(restaurantName)}/${fileName}`;

  // Upload
  const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (upErr) throw upErr;

  // Invoke edge function to process
  const { data, error } = await supabase.functions.invoke('menu-scraper', {
    body: { path, bucket, restaurant: restaurantName },
  });
  if (error) throw error;
  return data;
}
