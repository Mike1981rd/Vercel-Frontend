'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { geocodeAddress } from '@/lib/geocoding';
import LocationMap from '@/components/habitaciones/LocationMap';
import { useCompany } from '@/contexts/CompanyContext';
import { fetchRoomData } from '@/lib/api/rooms';

interface RoomMapConfig {
  enabled: boolean;
  title: string;
  address: string;
  neighborhood: string;
  city: string;
  description: string;
  mapImage: string;
  showExactLocation: boolean;
}

interface PreviewRoomMapProps {
  config: RoomMapConfig;
  deviceView?: 'desktop' | 'mobile' | 'tablet';
  isEditor?: boolean;
  theme?: any;
}

export default function PreviewRoomMap({ 
  config, 
  deviceView, 
  isEditor = false,
  theme 
}: PreviewRoomMapProps) {
  
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (deviceView !== undefined) return deviceView === 'mobile';
    if (typeof window !== 'undefined') return window.innerWidth < 768;
    return false;
  });
  const [roomData, setRoomData] = useState<any>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const { company } = (useCompany?.() as any) || {};

  useEffect(() => {
    if (deviceView !== undefined) {
      setIsMobile(deviceView === 'mobile');
      return;
    }
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [deviceView]);

  // Fetch room data (both in editor and live preview) to obtain coordinates
  useEffect(() => {
    const loadRoomData = async () => {
      const companyId = localStorage.getItem('companyId') || '1';
      try {
        // Use helper function that checks for slug
        const data = await fetchRoomData(companyId);
        if (data) {
          setRoomData(data);
        }
      } catch (error) {
        console.error('Error fetching room data:', error);
      }
    };

    if (config.enabled) {
      loadRoomData();
    }
  }, [config.enabled]);

  // Resolve coordinates: prefer roomData lat/lng; otherwise geocode textual address from roomData, then config
  useEffect(() => {
    const resolveCoords = async () => {
      // 1) Use coordinates from roomData if available (accept number or numeric string)
      if (roomData) {
        const latNum = typeof roomData.latitude === 'string' ? Number(roomData.latitude) : roomData.latitude;
        const lngNum = typeof roomData.longitude === 'string' ? Number(roomData.longitude) : roomData.longitude;
        if (typeof latNum === 'number' && !Number.isNaN(latNum) && typeof lngNum === 'number' && !Number.isNaN(lngNum)) {
          setCoords({ lat: latNum, lng: lngNum });
          return;
        }
      }
      // 2) Geocode when we have a textual address and no coords yet (prefer roomData fields)
      const roomAddress = [
        roomData?.streetAddress,
        roomData?.neighborhood,
        roomData?.city,
        roomData?.state,
        roomData?.postalCode,
        roomData?.country,
      ].filter(Boolean).join(', ').trim();
      const configAddress = [
        config?.address,
        config?.neighborhood,
        config?.city,
      ].filter(Boolean).join(', ').trim();
      const addressParts = roomAddress || configAddress;
      if (!addressParts) return;
      try {
        const provider = company?.geolocationProvider || 'mapbox';
        const tokenOverride = provider === 'mapbox' ? (company?.geolocationToken || undefined) : undefined;
        const countryCode = (company?.country || '').toString().toLowerCase() || undefined;
        const geo = await geocodeAddress(addressParts, countryCode, tokenOverride);
        if (geo) {
          setCoords({ lat: geo.latitude, lng: geo.longitude });
        }
      } catch (e) {
        // Best-effort geocoding; keep placeholder on failure
      }
    };

    if (config.enabled) {
      resolveCoords();
    }
  }, [config.enabled, config?.address, config?.neighborhood, config?.city, roomData, company?.geolocationProvider, company?.geolocationToken, company?.country]);

  if (!config.enabled) {
    return null;
  }

  // Use room data if available, fallback to config (for text fields)
  const displayData = roomData ? {
    address: roomData.streetAddress || config.address,
    neighborhood: roomData.neighborhood || config.neighborhood,
    city: `${roomData.city || config.city}${roomData.state ? `, ${roomData.state}` : ''}`,
    description: config.description, // Use config as room doesn't have location description
    mapImage: config.mapImage,
    showExactLocation: config.showExactLocation
  } : config;

  // Compose a human-friendly address string strictly from saved room/config fields
  const fullAddressText = useMemo(() => {
    const parts = roomData
      ? [
          roomData.streetAddress,
          roomData.neighborhood,
          roomData.city,
          roomData.state,
          roomData.postalCode,
          roomData.country,
        ]
      : [config?.address, config?.neighborhood, config?.city];
    return parts.filter(Boolean).join(', ');
  }, [roomData, config?.address, config?.neighborhood, config?.city]);

  // Resolve token override for Mapbox GL usage in LocationMap
  const mapboxTokenOverride = useMemo(() => {
    const provider = company?.geolocationProvider || 'mapbox';
    const token = (company?.geolocationToken || '').trim();
    if (provider === 'mapbox' && token) return token;
    return undefined;
  }, [company?.geolocationProvider, company?.geolocationToken]);

  return (
    <div className={`container mx-auto ${isMobile ? 'px-4 py-6' : 'px-6 py-8'} border-t`}>
      <h2 className={`font-semibold mb-6 ${isMobile ? 'text-lg text-center' : 'text-xl'}`}>
        {config.title || 'Where you\'ll be'}
      </h2>

      {/* Mobile: Show location details first */}
      {isMobile && (
        <div className="space-y-4 text-center mb-6">
          <div>
            <h3 className="font-semibold text-base mb-2">
              {displayData.neighborhood || 'Downtown'}, {displayData.city || 'San Francisco'}
            </h3>
            <p className="text-sm text-gray-600 mx-auto max-w-sm">
              {displayData.description || 'Great location with easy access to public transportation and local attractions.'}
            </p>
          </div>

          {(isEditor || displayData.showExactLocation) && fullAddressText && (
            <div className="flex flex-col items-center">
              <MapPin className="w-5 h-5 text-gray-500 mb-2" />
              <p className="text-sm text-gray-600">{fullAddressText}</p>
            </div>
          )}
        </div>
      )}

      {/* Map preview (custom image → interactive map → placeholder) */}
      <div className={`relative ${isMobile ? 'h-[300px]' : 'h-[400px]'} bg-gray-100 rounded-xl overflow-hidden ${!isMobile ? 'mb-6' : ''}`}>
        {displayData.mapImage ? (
          <img
            src={displayData.mapImage}
            alt="Location map"
            className="w-full h-full object-cover"
          />
        ) : coords ? (
          <LocationMap
            latitude={coords.lat}
            longitude={coords.lng}
            accessTokenOverride={mapboxTokenOverride}
            height={isMobile ? "300px" : "400px"}
            zoom={14}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Map preview</p>
            </div>
          </div>
        )}
        
        {!displayData.showExactLocation && (
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white rounded-lg p-4 text-center max-w-xs">
              <Navigation className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Exact location provided after booking</p>
            </div>
          </div>
        )}
      </div>

      {/* Desktop: Show location details after map */}
      {!isMobile && (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-base mb-2">
              {displayData.neighborhood || 'Downtown'}, {displayData.city || 'San Francisco'}
            </h3>
            <p className="text-sm text-gray-600">
              {displayData.description || 'Great location with easy access to public transportation and local attractions.'}
            </p>
          </div>

          {(isEditor || displayData.showExactLocation) && fullAddressText && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
              <p className="text-sm text-gray-600">{fullAddressText}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}