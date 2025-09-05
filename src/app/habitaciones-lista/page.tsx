'use client';

import React, { useState, useEffect } from 'react';
import { getApiEndpoint } from '@/lib/api-url';
import { ChevronDown, Grid, List, Search, SlidersHorizontal, X } from 'lucide-react';
import useThemeConfigStore from '@/stores/useThemeConfigStore';
import { useCompany } from '@/contexts/CompanyContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import PreviewHeader from '@/components/preview/PreviewHeader';
import PreviewFooter from '@/components/preview/PreviewFooter';
import RoomCard from './RoomCard';
import RoomsFilters from './RoomsFilters';
import RoomsPagination from './RoomsPagination';

interface Room {
  id: number;
  name: string;
  description?: string;
  basePrice: number;
  comparePrice?: number;
  maxOccupancy: number;
  viewType?: string;
  floorNumber?: number;
  squareMeters?: number;
  images?: string[];
  amenities?: string[];
  rating?: number;
  reviewCount?: number;
  isActive: boolean;
}

type SortOption = 'price_asc' | 'price_desc' | 'capacity' | 'rating' | 'name';
type ViewMode = 'grid' | 'list';

export default function RoomsListPage() {
  const { config: themeConfig } = useThemeConfigStore();
  const { company } = useCompany();
  const { selectedCurrency, baseCurrency } = useCurrency();
  const productCardsConfig = themeConfig?.productCards;
  
  // Debug logging
  console.log('Theme Config:', themeConfig);
  console.log('Product Cards Config:', productCardsConfig);
  console.log('Card Size:', productCardsConfig?.cardSize);
  console.log('Image Ratio:', productCardsConfig?.image?.defaultRatio);
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [showFilters, setShowFilters] = useState(false); // Changed to false by default
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [structuralConfig, setStructuralConfig] = useState<any>(null);
  const [globalTheme, setGlobalTheme] = useState<any>(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    priceMin: 0,
    priceMax: 10000,
    capacity: [] as number[]
  });

  // Fetch rooms and structural components on mount
  useEffect(() => {
    fetchRooms();
    fetchStructuralComponents();
    fetchGlobalTheme();
    // Load theme config if not loaded
    loadThemeConfig();
  }, []);
  
  const loadThemeConfig = async () => {
    const { fetchConfig } = useThemeConfigStore.getState();
    const companyId = parseInt(localStorage.getItem('companyId') || '1');
    await fetchConfig(companyId);
  };

  const fetchGlobalTheme = async () => {
    try {
      const companyId = localStorage.getItem('companyId') || '1';
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api';
      const response = await fetch(`${apiUrl}/global-theme-config/company/${companyId}/published`);
      
      if (response.ok) {
        const data = await response.json();
        setGlobalTheme(data);
      }
    } catch (error) {
      console.error('Error fetching global theme:', error);
    }
  };

  const fetchStructuralComponents = async () => {
    try {
      const companyId = localStorage.getItem('companyId') || '1';
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api';
      const response = await fetch(`${apiUrl}/structural-components/company/${companyId}/published`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Raw structural data:', data);
        
        // Parse the JSON strings from the API response
        const parsedComponents = {
          header: data.headerConfig ? JSON.parse(data.headerConfig) : null,
          footer: data.footerConfig ? JSON.parse(data.footerConfig) : null,
          announcementBar: data.announcementBarConfig ? JSON.parse(data.announcementBarConfig) : null,
          imageBanner: data.imageBannerConfig ? JSON.parse(data.imageBannerConfig) : null,
          cartDrawer: data.cartDrawerConfig ? JSON.parse(data.cartDrawerConfig) : null,
        };
        
        console.log('Parsed structural components:', parsedComponents);
        setStructuralConfig(parsedComponents);
      }
    } catch (error) {
      console.error('Error fetching structural components:', error);
    }
  };

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const companyId = localStorage.getItem('companyId') || '1';
      
      let response;
      
      // Check if we're in public context (no token) or authenticated context
      if (!token) {
        // Public context - use public endpoint that doesn't require authentication
        console.log('Fetching rooms in public mode');
        response = await fetch(getApiEndpoint(`/Rooms/company/${companyId}/public`));
      } else {
        // Authenticated context - use protected endpoint with token
        console.log('Fetching rooms in authenticated mode');
        response = await fetch(getApiEndpoint('/Rooms'), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
      
      if (response.ok) {
        const data = await response.json();
        // Filter only active rooms
        const activeRooms = data.filter((room: Room) => room.isActive);
        setRooms(activeRooms);
        setFilteredRooms(activeRooms);
      } else {
        console.error('Failed to fetch rooms:', response.status, response.statusText);
        // Don't redirect to login if in public mode
        if (token && response.status === 401) {
          // Only redirect if we had a token but it's invalid
          console.log('Token invalid, user might need to re-login');
        }
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and search
  useEffect(() => {
    let result = [...rooms];
    
    // Search filter
    if (searchTerm) {
      result = result.filter(room => 
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Price filter
    result = result.filter(room => 
      room.basePrice >= filters.priceMin && 
      room.basePrice <= filters.priceMax
    );
    
    // Capacity filter
    if (filters.capacity.length > 0) {
      result = result.filter(room => 
        filters.capacity.includes(room.maxOccupancy)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.basePrice - b.basePrice;
        case 'price_desc':
          return b.basePrice - a.basePrice;
        case 'capacity':
          return b.maxOccupancy - a.maxOccupancy;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });
    
    setFilteredRooms(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [rooms, searchTerm, filters, sortBy]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);

  // Get color scheme
  const colorSchemeId = 1; // Default color scheme
  const colorScheme = themeConfig?.colorSchemes?.schemes?.[colorSchemeId - 1] as any;
  const backgroundColor = colorScheme?.background?.background || '#ffffff';
  const textColor = colorScheme?.text?.text || '#171717';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor }}>
      {/* Global Header */}
      {structuralConfig?.header && (
        <PreviewHeader 
          config={structuralConfig.header}
          theme={globalTheme}
          isEditor={false}
        />
      )}

      {/* Page Header */}
      <div className="border-b" style={{ borderColor: colorScheme?.background?.border || '#e5e5e5' }}>
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: textColor }}>
            Nuestras Habitaciones
          </h1>
          <p className="text-gray-600">
            Encuentra la habitación perfecta para tu estadía
          </p>
        </div>
      </div>

      {/* Search and Controls Bar */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar habitaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ borderColor: colorScheme?.background?.border || '#e5e5e5' }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Filter Toggle - Now visible on all screen sizes */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                showFilters ? 'bg-blue-50 border-blue-500 text-blue-600' : 'hover:bg-gray-50'
              }`}
              style={{ 
                borderColor: showFilters ? undefined : (colorScheme?.background?.border || '#e5e5e5')
              }}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="hidden sm:inline">Filtros</span>
              {/* Active filters count badge */}
              {filters.capacity.length > 0 && !showFilters && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {filters.capacity.length}
                </span>
              )}
              {showFilters && <X className="w-4 h-4 ml-1" />}
            </button>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ borderColor: colorScheme?.background?.border || '#e5e5e5' }}
            >
              <option value="name">Nombre</option>
              <option value="price_asc">Precio: Menor a Mayor</option>
              <option value="price_desc">Precio: Mayor a Menor</option>
              <option value="capacity">Capacidad</option>
              <option value="rating">Calificación</option>
            </select>

            {/* View Mode */}
            <div className="flex border rounded-lg" style={{ borderColor: colorScheme?.background?.border || '#e5e5e5' }}>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : ''}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : ''}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredRooms.length)} de {filteredRooms.length} habitaciones
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-8 flex-grow">
        <div className="flex gap-6">
          {/* Filters Sidebar with smooth transition */}
          <aside className={`
            transition-all duration-300 ease-in-out
            ${showFilters ? 'w-full md:w-64' : 'w-0 overflow-hidden'}
            flex-shrink-0
          `}>
            {showFilters && (
              <div className="w-full md:w-64">
                <RoomsFilters
                  filters={filters}
                  setFilters={setFilters}
                  rooms={rooms}
                  colorScheme={colorScheme}
                />
              </div>
            )}
          </aside>

          {/* Rooms Grid/List */}
          <main className="flex-1">
            {currentRooms.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No se encontraron habitaciones con los filtros seleccionados
                </p>
                <button
                  onClick={() => {
                    setFilters({
                      priceMin: 0,
                      priceMax: 10000,
                      capacity: []
                    });
                    setSearchTerm('');
                  }}
                  className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid gap-6'
                  : 'space-y-4'
              }
              style={viewMode === 'grid' ? {
                gridTemplateColumns: `repeat(auto-fill, minmax(${Math.max(120, 240 * (productCardsConfig?.cardSize?.scale || 1))}px, 1fr))`
              } : undefined}>
                {currentRooms.map(room => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    productCardsConfig={productCardsConfig}
                    colorScheme={colorScheme}
                    viewMode={viewMode}
                    currency={selectedCurrency}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <RoomsPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                colorScheme={colorScheme}
              />
            )}
          </main>
        </div>
      </div>

      {/* Global Footer */}
      {structuralConfig?.footer && (
        <PreviewFooter 
          config={structuralConfig.footer}
          theme={globalTheme}
          isEditor={false}
        />
      )}
    </div>
  );
}
