/**
 * @file ItemSelector.tsx
 * @description Modal selector for collections, products, and rooms
 * @max-lines 300
 */

import React, { useState, useEffect } from 'react';
import { API_URL } from '@/lib/constants';
import { X, Search, ChevronLeft } from 'lucide-react';

interface ItemSelectorProps {
  type: 'collections' | 'products' | 'rooms';
  selectedIds: number[];
  onSave: (ids: number[]) => void;
  onClose: () => void;
  maxItems?: number;
}

interface Item {
  id: number;
  name: string;
  price?: number;
  imageUrl?: string;
  description?: string;
}

// Sample data for development/testing
const getSampleData = (type: string): Item[] => {
  switch(type) {
    case 'collections':
      return [
        { id: 1, name: 'Restaurantes', description: 'Colección de restaurantes' },
        { id: 2, name: 'Hoteles', description: 'Colección de hoteles' },
        { id: 3, name: 'Servicios', description: 'Colección de servicios' },
      ];
    case 'products':
      return [
        { id: 1, name: 'Producto 1', price: 99.99 },
        { id: 2, name: 'Producto 2', price: 149.99 },
        { id: 3, name: 'Producto 3', price: 199.99 },
        { id: 4, name: 'Producto 4', price: 79.99 },
        { id: 5, name: 'Producto 5', price: 299.99 },
      ];
    case 'rooms':
      return [
        { id: 1, name: 'Habitación Ejecutiva', price: 2500.00 },
        { id: 2, name: 'Suite Presidencial', price: 4500.00 },
        { id: 3, name: 'Habitación Doble', price: 1500.00 },
        { id: 4, name: 'Habitación Junior', price: 1800.00 },
        { id: 5, name: 'Honeymoon Suite', price: 3500.00 },
      ];
    default:
      return [];
  }
};

export default function ItemSelector({ 
  type, 
  selectedIds, 
  onSave, 
  onClose,
  maxItems = 50 
}: ItemSelectorProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>(selectedIds);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch items from API
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        let endpoint = '';
        
        console.log('ItemSelector - Fetching:', type);
        console.log('ItemSelector - Token exists:', !!token);
        
        switch(type) {
          case 'collections':
            endpoint = `${API_URL}/Collections`;
            break;
          case 'products':
            endpoint = `${API_URL}/Products`;
            break;
          case 'rooms':
            endpoint = `${API_URL}/Rooms`;
            break;
        }

        console.log('ItemSelector - Endpoint:', endpoint);

        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('ItemSelector - Response status:', response.status);
        console.log('ItemSelector - Response ok:', response.ok);

        if (response.ok) {
          const data = await response.json();
          console.log('ItemSelector - Raw data:', data);
          console.log('ItemSelector - Data type:', typeof data);
          console.log('ItemSelector - Is array:', Array.isArray(data));
          
          // Handle different response structures
          let itemsArray = [];
          
          // Check if data is wrapped in an object
          if (data && typeof data === 'object' && !Array.isArray(data)) {
            // Check common wrapper properties
            if (Array.isArray(data.data)) {
              itemsArray = data.data;
            } else if (Array.isArray(data.items)) {
              itemsArray = data.items;
            } else if (Array.isArray(data.results)) {
              itemsArray = data.results;
            } else if (Array.isArray(data.value)) {
              itemsArray = data.value;
            } else {
              // If it's an object but not wrapped, try to extract values
              itemsArray = Object.values(data).filter(v => typeof v === 'object');
            }
          } else if (Array.isArray(data)) {
            itemsArray = data;
          }
          
          console.log('ItemSelector - Processed items:', itemsArray.length, 'items');
          console.log('ItemSelector - First item:', itemsArray[0]);
          
          // Map items to ensure consistent structure
          const mappedItems = itemsArray.map((item: any) => ({
            id: item.id || item.Id || item.ID,
            name: item.name || item.Name || item.title || item.Title || 'Sin nombre',
            price: item.price || item.Price || item.basePrice || item.BasePrice,
            imageUrl: item.imageUrl || item.ImageUrl || item.image || item.Image || 
                      (Array.isArray(item.images) && item.images[0]) ||
                      (Array.isArray(item.Images) && item.Images[0]),
            description: item.description || item.Description
          }));
          
          console.log('ItemSelector - Mapped items:', mappedItems);
          
          // If no items found, use sample data
          if (mappedItems.length === 0) {
            console.log('ItemSelector - No items from API, using sample data');
            const sampleData = getSampleData(type);
            setItems(sampleData);
            setFilteredItems(sampleData);
          } else {
            setItems(mappedItems);
            setFilteredItems(mappedItems);
          }
        } else {
          console.error('API response error:', response.status, response.statusText);
          
          // Use sample data on error
          console.log('ItemSelector - API error, using sample data');
          const sampleData = getSampleData(type);
          setItems(sampleData);
          setFilteredItems(sampleData);
        }
      } catch (error) {
        console.error('Error fetching items:', error);
        
        // Use sample data as fallback for development
        const sampleData = getSampleData(type);
        setItems(sampleData);
        setFilteredItems(sampleData);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [type]);

  // Filter items based on search
  useEffect(() => {
    // Ensure items is an array before filtering
    if (Array.isArray(items)) {
      const filtered = items.filter(item => 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems([]);
    }
  }, [searchTerm, items]);

  const toggleSelection = (id: number) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(i => i !== id));
    } else if (selectedItems.length < maxItems) {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleSave = () => {
    onSave(selectedItems);
    onClose();
  };

  const getTitle = () => {
    switch(type) {
      case 'collections': return 'Seleccionar colecciones';
      case 'products': return 'Seleccionar productos';
      case 'rooms': return 'Seleccionar habitaciones';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-medium">{getTitle()}</h2>
              <button 
                onClick={onClose}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Buscar ${type}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-blue-500 dark:bg-gray-800"
              />
            </div>

            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              Seleccionar hasta {maxItems} {type}
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="text-center py-4 text-sm text-gray-500">Cargando...</div>
            ) : Array.isArray(filteredItems) && filteredItems.length > 0 ? (
              <div className="space-y-1">
                {filteredItems.map((item: Item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleSelection(item.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.name}
                      </div>
                      {item.price && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          ${item.price.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-sm text-gray-500">
                {searchTerm ? `No se encontraron ${type} con "${searchTerm}"` : `No hay ${type} disponibles`}
              </div>
            )}
          </div>

          {/* Selected Items Preview */}
          {selectedItems.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Seleccionado: {selectedItems.length}/{maxItems}
                </span>
                {selectedItems.length > 0 && (
                  <button 
                    onClick={() => setSelectedItems([])}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Limpiar todo
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedItems.slice(0, 3).map(id => {
                  const item = items.find(i => i.id === id);
                  return item ? (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded"
                    >
                      {item.name}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelection(id);
                        }}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ) : null;
                })}
                {selectedItems.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 text-xs text-gray-500">
                    +{selectedItems.length - 3} más
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={selectedItems.length === 0}
            >
              Seleccionar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
