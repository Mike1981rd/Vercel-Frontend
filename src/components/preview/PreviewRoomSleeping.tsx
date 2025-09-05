'use client';

import React, { useState, useEffect } from 'react';
import { Bed, Users, Moon } from 'lucide-react';
import * as Icons from 'lucide-react';
import { fetchRoomData } from '@/lib/api/rooms';

interface SleepingArea {
  id: string;
  icon: string;
  title: string;
  description: string;
  image?: string;
}

interface RoomSleepingConfig {
  enabled: boolean;
  title: string;
  areas: SleepingArea[];
}

interface PreviewRoomSleepingProps {
  config: RoomSleepingConfig;
  deviceView?: 'desktop' | 'mobile';
  isEditor?: boolean;
  theme?: any;
}

export default function PreviewRoomSleeping({ 
  config, 
  deviceView, 
  isEditor = false,
  theme 
}: PreviewRoomSleepingProps) {
  
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (deviceView !== undefined) return deviceView === 'mobile';
    if (typeof window !== 'undefined') return window.innerWidth < 768;
    return false;
  });

  const [roomData, setRoomData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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

  // Auto-fetch room data
  useEffect(() => {
    const loadRoomData = async () => {
      const companyId = localStorage.getItem('companyId') || '1';
      
      setLoading(true);
      try {
        // Use helper function that checks for slug
        const data = await fetchRoomData(companyId);
        if (data) {
          setRoomData(data);
        }
      } catch (error) {
        console.error('Error fetching room data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch in both editor and preview modes
    if (config.enabled) {
      loadRoomData();
    }
  }, [config.enabled]);

  if (!config.enabled) {
    return null;
  }

  const getIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons];
    return IconComponent ? <IconComponent className="w-6 h-6" /> : <Bed className="w-6 h-6" />;
  };

  // Parse SleepingArrangements if available
  const sleepingArrangements = roomData?.sleepingArrangements ? 
    (typeof roomData.sleepingArrangements === 'string' ? 
      JSON.parse(roomData.sleepingArrangements) : 
      roomData.sleepingArrangements) : null;

  // Map sleeping areas from room data if available
  const displayAreas = sleepingArrangements?.bedrooms ? 
    sleepingArrangements.bedrooms.map((bedroom: any, index: number) => ({
      id: index.toString(),
      icon: 'Bed',
      title: bedroom.name || `Bedroom ${index + 1}`,
      description: bedroom.beds?.map((bed: any) => 
        `${bed.quantity} ${bed.type}`
      ).join(', ') || 'Double bed',
      image: roomData.images?.[index] // Use room images if available
    })) : config.areas;

  if (displayAreas.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-6 py-8 border-t">
      <h2 className="text-xl font-semibold mb-6">
        {config.title || 'Where you\'ll sleep'}
      </h2>
      
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'} gap-6`}>
        {displayAreas.map((area: SleepingArea) => (
          <div key={area.id} className="space-y-3">
            {area.image ? (
              <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={area.image}
                  alt={area.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-[4/3] bg-gray-100 rounded-lg flex items-center justify-center">
                {getIcon(area.icon)}
              </div>
            )}
            <div>
              <h3 className="font-medium text-base mb-1">{area.title}</h3>
              <p className="text-sm text-gray-600">{area.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}