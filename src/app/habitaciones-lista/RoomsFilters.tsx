import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface RoomsFiltersProps {
  filters: {
    priceMin: number;
    priceMax: number;
    capacity: number[];
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  rooms: any[];
  colorScheme?: any;
}

export default function RoomsFilters({ filters, setFilters, rooms, colorScheme }: RoomsFiltersProps) {
  const [expandedSections, setExpandedSections] = React.useState({
    price: true,
    capacity: true
  });

  // Extract unique values from rooms
  const uniqueCapacities = [...new Set(rooms.map(r => r.maxOccupancy))].sort((a, b) => a - b);

  // Get min and max prices
  const minPrice = Math.min(...rooms.map(r => r.basePrice));
  const maxPrice = Math.max(...rooms.map(r => r.basePrice));

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCapacityToggle = (capacity: number) => {
    setFilters((prev: typeof filters) => ({
      ...prev,
      capacity: prev.capacity.includes(capacity)
        ? prev.capacity.filter(c => c !== capacity)
        : [...prev.capacity, capacity]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      priceMin: minPrice,
      priceMax: maxPrice,
      capacity: []
    });
  };

  const borderColor = colorScheme?.background?.border || '#e5e5e5';
  const textColor = colorScheme?.text?.text || '#171717';
  const mutedTextColor = colorScheme?.text?.muted || '#737373';

  return (
    <div className="bg-white rounded-lg border" style={{ borderColor }}>
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor }}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold" style={{ color: textColor }}>Filtros</h2>
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Limpiar todo
          </button>
        </div>
      </div>

      {/* Price Range */}
      <div className="border-b" style={{ borderColor }}>
        <button
          onClick={() => toggleSection('price')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
        >
          <span className="font-medium" style={{ color: textColor }}>Precio por noche</span>
          {expandedSections.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {expandedSections.price && (
          <div className="px-4 pb-4">
            <div className="space-y-2">
              <div>
                <label className="text-sm" style={{ color: mutedTextColor }}>
                  Mínimo: ${filters.priceMin}
                </label>
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={filters.priceMin}
                  onChange={(e) => setFilters((prev: typeof filters) => ({
                    ...prev,
                    priceMin: Number(e.target.value)
                  }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm" style={{ color: mutedTextColor }}>
                  Máximo: ${filters.priceMax}
                </label>
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={filters.priceMax}
                  onChange={(e) => setFilters((prev: typeof filters) => ({
                    ...prev,
                    priceMax: Number(e.target.value)
                  }))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Capacity */}
      <div className="border-b" style={{ borderColor }}>
        <button
          onClick={() => toggleSection('capacity')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
        >
          <span className="font-medium" style={{ color: textColor }}>Capacidad</span>
          {expandedSections.capacity ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {expandedSections.capacity && (
          <div className="px-4 pb-4 space-y-2">
            {uniqueCapacities.map(capacity => (
              <label key={capacity} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.capacity.includes(capacity)}
                  onChange={() => handleCapacityToggle(capacity)}
                  className="mr-2 rounded"
                />
                <span className="text-sm" style={{ color: textColor }}>
                  {capacity} {capacity === 1 ? 'persona' : 'personas'}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}