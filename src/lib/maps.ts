const EMBED_KEY = import.meta.env.VITE_GOOGLE_MAPS_EMBED_API_KEY as string | undefined;

function ensureKey(): string | null {
  return EMBED_KEY && EMBED_KEY.trim().length > 0 ? EMBED_KEY : null;
}

export function buildEmbedPlaceUrl(query: string, opts?: { zoom?: number }): string | null {
  const key = ensureKey();
  if (!key) return null;
  const q = encodeURIComponent(query);
  const zoom = opts?.zoom ?? 15;
  // Place mode via q parameter (search embed)
  return `https://www.google.com/maps/embed/v1/search?key=${key}&q=${q}&zoom=${zoom}`;
}

export function buildEmbedSearchForFoods(foods: Array<{ name?: string; restaurants?: { name?: string | null; city?: string | null; state?: string | null } | null }>): string | null {
  const key = ensureKey();
  if (!key) return null;
  const terms = foods
    .map((f) => {
      const place = [f.name, f.restaurants?.name, f.restaurants?.city, f.restaurants?.state]
        .filter(Boolean)
        .join(' ');
      return place;
    })
    .filter(Boolean);
  const q = encodeURIComponent(terms.join(', '));
  return `https://www.google.com/maps/embed/v1/search?key=${key}&q=${q}&zoom=13`;
}

export function buildDirectionsLink(destinationParts: Array<string | undefined | null>): string {
  const destination = destinationParts.filter(Boolean).join(', ');
  const encoded = encodeURIComponent(destination);
  return `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;
}

export function buildEmbedDirectionsUrl(origin: { lat: number; lng: number } | null, destination: string, mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'): string | null {
  const key = ensureKey();
  if (!key) return null;
  if (!destination) return null;
  const dest = encodeURIComponent(destination);
  if (!origin) {
    // Without origin, fall back to place search embed
    return `https://www.google.com/maps/embed/v1/search?key=${key}&q=${dest}`;
  }
  const originParam = `${origin.lat},${origin.lng}`;
  return `https://www.google.com/maps/embed/v1/directions?key=${key}&origin=${encodeURIComponent(originParam)}&destination=${dest}&mode=${mode}`;
}
