// Supabase Edge Function: menu-scraper
// Deploy with: supabase functions deploy menu-scraper
// Requires env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

interface RequestBody {
  bucket: string;
  path: string;
  restaurant: string;
}

interface ParsedItem {
  name: string;
  price?: number | null;
  description?: string | null;
  section?: string | null;
  tags?: string[] | null;
}

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const { bucket, path, restaurant } = (await req.json()) as RequestBody;
    if (!bucket || !path || !restaurant) {
      return new Response(JSON.stringify({ error: 'Missing bucket/path/restaurant' }), { status: 400 });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!SUPABASE_URL || !SERVICE_ROLE || !OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: 'Missing server environment config' }), { status: 500 });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Create a signed URL for the uploaded menu file (image/pdf)
    const { data: signed, error: signErr } = await admin.storage
      .from(bucket)
      .createSignedUrl(path, 60 * 60);
    if (signErr || !signed?.signedUrl) {
      return new Response(JSON.stringify({ error: 'Failed to sign file URL', details: signErr?.message }), { status: 500 });
    }
    const fileUrl = signed.signedUrl;

    // Ask OpenAI to extract items
    const system = `You are a precise menu parsing assistant. Extract a clean JSON array of menu items.
Return strictly JSON with this shape: { "items": [ { "name": string, "price": number|null, "description": string|null, "section": string|null, "tags": string[] } ] }.
- price: number in USD without symbols (or null if missing)
- description: null if not present
- section: a short category if present
- tags: 2-4 short keywords
Do not include any extra text outside of the JSON.`;

    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract menu items from this image. Output strict JSON.' },
            { type: 'image_url', image_url: { url: fileUrl } },
          ],
        },
      ],
      temperature: 0.2,
    } as any;

    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      return new Response(JSON.stringify({ error: 'OpenAI error', details: txt }), { status: 500 });
    }
    const aiJson = await aiRes.json();
    const content = aiJson?.choices?.[0]?.message?.content ?? '';

    let items: ParsedItem[] = [];
    try {
      const parsed = JSON.parse(content);
      items = Array.isArray(parsed?.items) ? parsed.items : [];
    } catch {
      // Try to salvage JSON blob with a simple regex fallback
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          items = Array.isArray(parsed?.items) ? parsed.items : [];
        } catch {}
      }
    }

    // Normalize items
    items = (items || []).map((it) => ({
      name: (it?.name || '').toString().trim(),
      price: typeof it?.price === 'number' ? it.price : null,
      description: it?.description ? String(it.description).trim() : null,
      section: it?.section ? String(it.section).trim() : null,
      tags: Array.isArray(it?.tags) ? it.tags.slice(0, 6).map((t: any) => String(t)) : [],
    })).filter((it) => it.name.length > 0);

    // Upsert restaurant
    const { data: restRow } = await admin
      .from('restaurants')
      .select('id, name')
      .eq('name', restaurant)
      .maybeSingle();

    let restaurantId = restRow?.id as string | undefined;
    if (!restaurantId) {
      const { data: inserted, error: restErr } = await admin
        .from('restaurants')
        .insert({ name: restaurant })
        .select('id')
        .single();
      if (restErr) {
        return new Response(JSON.stringify({ error: 'Failed to upsert restaurant', details: restErr.message }), { status: 500 });
      }
      restaurantId = inserted.id;
    }

    // Upsert food items
    let inserted = 0;
    let updated = 0;
    for (const it of items) {
      const canonical = it.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const row = {
        name: it.name,
        canonical_name: canonical,
        description: it.description,
        restaurant_id: restaurantId,
        tags: it.tags || [],
        price: typeof it.price === 'number' ? it.price : null,
      } as any;

      const { data, error } = await admin
        .from('food_items')
        .upsert(row, { onConflict: 'canonical_name,restaurant_id' })
        .select('id');
      if (error) continue;
      // crude inserted/updated guess
      if (Array.isArray(data) && data.length > 0) inserted += 1; else updated += 1;
    }

    return new Response(
      JSON.stringify({ ok: true, fileUrl, restaurant, counts: { inserted, updated }, total: items.length }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500 });
  }
});
