'use client';

import React, { useState, useEffect } from 'react';
import { Info, Home, Users, Eye, MapPin, Bed, Shield, Calendar } from 'lucide-react';

interface RoomData {
  id: number;
  name: string;
  description?: string;
  viewType?: string;
  roomType?: string;
  maxOccupancy?: number;
  floorNumber?: number;
  squareMeters?: number;
  neighborhood?: string;
  city?: string;
  roomDetails?: any;
  commonSpaces?: any;
  sleepingArrangements?: any;
  houseRules?: any;
  checkInInstructions?: any;
  safetyFeatures?: any;
}

export default function RoomInfoDisplay() {
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchRoomData();
  }, []);

  const fetchRoomData = async () => {
    const companyId = localStorage.getItem('companyId') || '1';
    
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api'}/rooms/company/${companyId}/first-active`
      );
      if (response.ok) {
        const data = await response.json();
        console.log('Room data loaded:', data);
        setRoomData(data);
      }
    } catch (error) {
      console.error('Error fetching room data:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseJsonField = (field: any) => {
    if (!field) return null;
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch {
        return field;
      }
    }
    return field;
  };

  if (loading) {
    return (
      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <p className="text-xs text-yellow-800 dark:text-yellow-300">
          No room data available. Please create a room first.
        </p>
      </div>
    );
  }

  const roomDetails = parseJsonField(roomData.roomDetails);
  const commonSpaces = parseJsonField(roomData.commonSpaces);
  const sleepingArrangements = parseJsonField(roomData.sleepingArrangements);

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg">
      {/* Header */}
      <div 
        className="p-3 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">
              Room Information
            </span>
          </div>
          <span className="text-xs text-blue-600 dark:text-blue-400">
            {isExpanded ? 'Hide' : 'Show'} Details
          </span>
        </div>
        <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
          {roomData.name} {roomData.roomType ? `• ${roomData.roomType}` : ''}
        </p>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-blue-200 dark:border-blue-800 pt-3">
          {/* Basic Info */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-1">
              <Home className="w-3 h-3" /> Basic Information
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {roomData.viewType && (
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">View: {roomData.viewType}</span>
                </div>
              )}
              {roomData.maxOccupancy && (
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">Max: {roomData.maxOccupancy} guests</span>
                </div>
              )}
              {roomData.floorNumber && (
                <div className="flex items-center gap-1">
                  <Home className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">Floor: {roomData.floorNumber}</span>
                </div>
              )}
              {roomData.squareMeters && (
                <div className="flex items-center gap-1">
                  <Home className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">{roomData.squareMeters} m²</span>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          {(roomData.neighborhood || roomData.city) && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Location
              </h4>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                {[roomData.neighborhood, roomData.city].filter(Boolean).join(', ')}
              </p>
            </div>
          )}

          {/* Room Details */}
          {roomDetails && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-1">
                <Bed className="w-3 h-3" /> Room Details
              </h4>
              <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                {roomDetails.workspace && <div>• Dedicated workspace</div>}
                {roomDetails.airConditioning && <div>• Air conditioning</div>}
                {roomDetails.heating && <div>• Heating</div>}
                {roomDetails.tv && <div>• TV</div>}
                {roomDetails.minibar && <div>• Minibar</div>}
                {roomDetails.safe && <div>• Safe</div>}
                {roomDetails.balcony && <div>• Balcony</div>}
                {roomDetails.privateBathroom && <div>• Private bathroom</div>}
              </div>
            </div>
          )}

          {/* Common Spaces */}
          {commonSpaces && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-1">
                <Users className="w-3 h-3" /> Common Spaces
              </h4>
              <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                {commonSpaces.kitchen && <div>• Kitchen</div>}
                {commonSpaces.pool && <div>• Pool</div>}
                {commonSpaces.gym && <div>• Gym</div>}
                {commonSpaces.garden && <div>• Garden</div>}
                {commonSpaces.parking && <div>• Free parking</div>}
                {commonSpaces.lounge && <div>• Lounge</div>}
                {commonSpaces.restaurant && <div>• Restaurant</div>}
                {commonSpaces.bar && <div>• Bar</div>}
              </div>
            </div>
          )}

          {/* Sleeping Arrangements */}
          {sleepingArrangements && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-1">
                <Bed className="w-3 h-3" /> Sleeping Arrangements
              </h4>
              <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                {sleepingArrangements.bedrooms && <div>Bedrooms: {sleepingArrangements.bedrooms}</div>}
                {sleepingArrangements.beds && <div>Beds: {sleepingArrangements.beds}</div>}
                {sleepingArrangements.bathrooms && <div>Bathrooms: {sleepingArrangements.bathrooms}</div>}
                {sleepingArrangements.bedTypes && (
                  <div>Bed types: {sleepingArrangements.bedTypes.join(', ')}</div>
                )}
              </div>
            </div>
          )}

          {/* Refresh Button */}
          <button
            onClick={fetchRoomData}
            className="w-full px-3 py-1.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Refresh Room Data
          </button>
        </div>
      )}
    </div>
  );
}