export type LatLng = { lat: number; lng: number };

const RESTAURANT_COORDS: { [key: string]: LatLng } = {
  'Triple XXX Family Restaurant': { lat: 40.4242, lng: -86.9081 },
  'Nine Irish Brothers': { lat: 40.4236, lng: -86.9067 },
  'Mad Mushroom': { lat: 40.4239, lng: -86.9075 },
  'Greyhouse Coffee': { lat: 40.4251, lng: -86.9086 },
  "Bruno's Swiss Inn": { lat: 40.4189, lng: -86.8842 },
  "Harry's Chocolate Shop": { lat: 40.4238, lng: -86.9073 },
  "Puccini's Smiling Teeth": { lat: 40.4156, lng: -86.8683 },
  'Korea Garden': { lat: 40.4235, lng: -86.9065 },
};

export function getApproximateCoordinates(restaurantName?: string | null): LatLng | null {
  if (!restaurantName) return null;
  return RESTAURANT_COORDS[restaurantName] || { lat: 40.4259, lng: -86.9081 };
}

export function haversineMiles(a: LatLng, b: LatLng): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 3958.8; // Earth radius in miles
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}
