/**
 * Lightweight Mapbox Geocoding helper.
 * Requires NEXT_PUBLIC_MAPBOX_TOKEN to be set.
 */
export interface GeocodeResult {
  latitude: number;
  longitude: number;
  placeName: string;
}

export async function geocodeAddress(
  address: string,
  countryCode?: string,
  tokenOverride?: string
): Promise<GeocodeResult | null> {
  const tokenRaw = tokenOverride ?? process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';
  const token = tokenRaw.trim();
  if (!token) {
    console.warn('Mapbox token not found. Set NEXT_PUBLIC_MAPBOX_TOKEN.');
    return null;
  }

  const query = encodeURIComponent(address.trim());
  const params = new URLSearchParams({
    access_token: token,
    limit: '1',
    language: 'es',
  });
  if (countryCode) {
    // Mapbox expects ISO 3166 alpha-2/alpha-3 in uppercase
    const cc = countryCode.toString().trim().toUpperCase();
    params.set('country', cc);
  }

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?${params.toString()}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const feature = data?.features?.[0];
    if (!feature?.center) return null;
    const [lng, lat] = feature.center as [number, number];
    return { latitude: lat, longitude: lng, placeName: feature.place_name };
  } catch (e) {
    console.error('Geocoding error:', e);
    return null;
  }
}
