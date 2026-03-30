// MapView Page - Split-view map page (60% properties / 40% map)

import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PropertyFilters, ViewToggle, PropertyGrid, PropertyList } from '@/components/property';
import { Pagination } from '@/components/common';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useFilterStore, useMapStore } from '@/stores';
import type { Property } from '@/types';
import { Search } from 'lucide-react';

// Fix for default marker icon
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon
const createCustomIcon = (isSelected: boolean) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div class="w-8 h-8 rounded-full ${isSelected ? 'bg-primary' : 'bg-white'} border-2 ${isSelected ? 'border-white' : 'border-primary'} shadow-lg flex items-center justify-center"><span class="text-xs font-bold ${isSelected ? 'text-white' : 'text-primary'}">$</span></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

// Map events component
function MapEvents({ onBoundsChange }: { onBoundsChange: (bounds: L.LatLngBounds) => void }) {
  const map = useMapEvents({
    moveend: () => {
      onBoundsChange(map.getBounds());
    },
    zoomend: () => {
      onBoundsChange(map.getBounds());
    },
  });
  return null;
}

// Fly to location component
function FlyToMarker({ position }: { position: [number, number] | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, { duration: 0.5 });
    }
  }, [position, map]);
  
  return null;
}

// Mock data for demo
const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Modern Downtown Apartment',
    description: 'Beautiful modern apartment in the heart of downtown',
    price: 2500,
    location: {
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      coordinates: { lat: 40.7128, lng: -74.006 },
    },
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
    amenities: ['WiFi', 'Parking', 'Pool'],
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    propertyType: 'apartment',
    status: 'available',
    landlordId: '1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '2',
    title: 'Cozy Studio in Brooklyn',
    description: 'Charming studio apartment with city views',
    price: 1800,
    location: {
      address: '456 Park Ave',
      city: 'Brooklyn',
      state: 'NY',
      zipCode: '11201',
      coordinates: { lat: 40.6892, lng: -73.9442 },
    },
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
    amenities: ['WiFi', 'Laundry'],
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    propertyType: 'studio',
    status: 'available',
    landlordId: '2',
    createdAt: '2024-01-02',
    updatedAt: '2024-01-02',
  },
  {
    id: '3',
    title: 'Luxury Penthouse',
    description: 'Stunning penthouse with panoramic views',
    price: 5000,
    location: {
      address: '789 Fifth Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10022',
      coordinates: { lat: 40.758, lng: -73.9855 },
    },
    images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'],
    amenities: ['WiFi', 'Parking', 'Pool', 'Gym', 'Doorman'],
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    propertyType: 'apartment',
    status: 'available',
    landlordId: '3',
    createdAt: '2024-01-03',
    updatedAt: '2024-01-03',
  },
  {
    id: '4',
    title: 'Charming Brownstone',
    description: 'Historic brownstone with modern amenities',
    price: 3500,
    location: {
      address: '321 Bergen St',
      city: 'Brooklyn',
      state: 'NY',
      zipCode: '11217',
      coordinates: { lat: 40.6782, lng: -73.9742 },
    },
    images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'],
    amenities: ['WiFi', 'Garden', 'Parking'],
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 5,
    propertyType: 'townhouse',
    status: 'available',
    landlordId: '4',
    createdAt: '2024-01-04',
    updatedAt: '2024-01-04',
  },
];

export default function MapView() {
  const { filters, viewMode, page, setFilters, setViewMode, setPage, clearFilters } = useFilterStore();
  const { selectedPropertyId, selectProperty, center } = useMapStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>(mockProperties);

  useEffect(() => {
    // Simulate API call
    setIsLoading(true);
    const timer = setTimeout(() => {
      setProperties(mockProperties);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters]);

  const handleBoundsChange = useCallback((bounds: L.LatLngBounds) => {
    // In a real app, this would fetch properties within bounds
    console.log('Bounds changed:', bounds);
  }, []);

  const handleMapMarkerClick = (propertyId: string) => {
    selectProperty(propertyId);
  };

  const totalPages = Math.ceil(properties.length / 12);

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Left Panel - Property List (60%) */}
      <div className="w-[60%] h-full flex flex-col border-r">
        {/* Filters Bar */}
        <div className="p-4 border-b bg-background">
          <div className="flex items-center justify-between gap-4">
            <PropertyFilters
              filters={filters}
              onFilterChange={setFilters}
              onClearFilters={clearFilters}
              className="flex-1"
            />
            <ViewToggle viewMode={viewMode} onChange={setViewMode} />
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            {properties.length} properties found
          </div>
        </div>

        {/* Property List */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : viewMode === 'grid' ? (
            <PropertyGrid
              properties={properties}
              onToggleFavorite={() => {}}
            />
          ) : (
            <PropertyList
              properties={properties}
              onToggleFavorite={() => {}}
            />
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Right Panel - Map (40%) */}
      <div className="w-[40%] h-full relative">
        <MapContainer
          center={center}
          zoom={12}
          className="h-full w-full"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEvents onBoundsChange={handleBoundsChange} />
          <FlyToMarker position={selectedPropertyId ? 
            properties.find(p => p.id === selectedPropertyId)?.location.coordinates ? [properties.find(p => p.id === selectedPropertyId)!.location.coordinates.lat, properties.find(p => p.id === selectedPropertyId)!.location.coordinates.lng] as [number, number] : null
          : null} 
          />
          
          {properties.map((property) => (
            <Marker
              key={property.id}
              position={[property.location.coordinates.lat, property.location.coordinates.lng]}
              icon={createCustomIcon(
                selectedPropertyId === property.id
              )}
              eventHandlers={{
                click: () => handleMapMarkerClick(property.id),
              }}
            >
              <Popup>
                <div className="w-48">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-24 object-cover rounded"
                  />
                  <h3 className="font-semibold mt-2">{property.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {property.location.city}, {property.location.state}
                  </p>
                  <p className="font-bold mt-1">${property.price}/mo</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Search This Area Button */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
          <button className="bg-white shadow-lg rounded-full px-4 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors">
            <Search className="w-4 h-4" />
            <span className="text-sm font-medium">Search this area</span>
          </button>
        </div>
      </div>
    </div>
  );
}
