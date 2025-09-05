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

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Resolve token: prefer override, fallback to env; require it to initialize map
    const resolvedToken = (accessTokenOverride && accessTokenOverride.trim()) || (process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '').trim();
    if (!resolvedToken) {
      console.warn('Mapbox token not available yet. Skipping map init until token is set.');
      return;
    }
    (mapboxgl as any).accessToken = resolvedToken;

    // If no coords are passed yet, do not initialize to arbitrary fallback center
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return;
    }

    const center = [longitude, latitude] as [number, number];

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center,
      zoom,
    });
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
      marker.remove();
      map.remove();
      markerRef.current = null;
      mapRef.current = null;
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
