'use client';

import { useEffect, useRef } from 'react';
import mapboxgl, { Map, Marker } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Access token can be provided via prop override in future if needed.
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface LocationMapProps {
  latitude?: number;
  longitude?: number;
  onChange?: (coords: { latitude: number; longitude: number }) => void;
  height?: string;
  zoom?: number;
  accessTokenOverride?: string;
}

export default function LocationMap({ latitude, longitude, onChange, height = '320px', zoom = 14, accessTokenOverride }: LocationMapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const lastTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Resolve token: prefer override, fallback to env; require it to initialize map
    // Try override (company), then global window var, then env
    // @ts-ignore
    const globalToken = (typeof window !== 'undefined' && window.__MAPBOX_TOKEN) ? String((window as any).__MAPBOX_TOKEN) : '';
    const resolvedToken = (accessTokenOverride && accessTokenOverride.trim()) || globalToken || (process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '').trim();
    if (!resolvedToken) {
      console.warn('Mapbox token not available. Map disabled; form remains usable.');
      return;
    }
    // Mapbox GL requires a public (pk.*) token in the browser; never use sk.* here
    if (!resolvedToken.startsWith('pk.')) {
      console.warn('Mapbox token is not a public token (pk.*). Map disabled; form remains usable.');
      return;
    }
    // Re-init map if token changed
    const tokenChanged = lastTokenRef.current && lastTokenRef.current !== resolvedToken;
    if (tokenChanged && mapRef.current) {
      try { markerRef.current?.remove(); } catch {}
      try { mapRef.current?.remove(); } catch {}
      markerRef.current = null;
      mapRef.current = null;
    }
    lastTokenRef.current = resolvedToken;
    (mapboxgl as any).accessToken = resolvedToken;

    // If no coords are passed yet, do not initialize to arbitrary fallback center
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return;
    }

    const center = [longitude, latitude] as [number, number];

    let map: Map | null = null;
    try {
      map = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center,
        zoom,
      });
    } catch (e) {
      console.warn('Mapbox GL initialization failed. Map disabled; form remains usable.', e);
      return;
    }
    mapRef.current = map;

    const marker = new mapboxgl.Marker({ draggable: true })
      .setLngLat(center)
      .addTo(map);
    markerRef.current = marker;

    marker.on('dragend', () => {
      const pos = marker.getLngLat();
      onChange?.({ latitude: pos.lat, longitude: pos.lng });
    });

    return () => {
      try { marker.remove(); } catch {}
      try { map.remove(); } catch {}
      if (markerRef.current === marker) markerRef.current = null;
      if (mapRef.current === map) mapRef.current = null;
    };
  }, [accessTokenOverride, latitude, longitude, zoom]);

  // Update center/marker when props change
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    if (typeof latitude !== 'number' || typeof longitude !== 'number') return;

    const lngLat: [number, number] = [longitude, latitude];
    markerRef.current.setLngLat(lngLat);
    mapRef.current.setCenter(lngLat);
  }, [latitude, longitude]);

  return (
    <div
      ref={mapContainer}
      style={{ width: '100%', height }}
      className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
    />
  );
}
