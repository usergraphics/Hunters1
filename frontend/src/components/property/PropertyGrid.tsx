// Property Grid Component

import { PropertyCard } from './PropertyCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import type { Property } from '@/types';

interface PropertyGridProps {
  properties: Property[];
  isLoading?: boolean;
  favorites?: string[];
  onToggleFavorite?: (id: string) => void;
}

export function PropertyGrid({
  properties,
  isLoading = false,
  favorites = [],
  onToggleFavorite,
}: PropertyGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <EmptyState
        title="No properties found"
        description="Try adjusting your filters or search criteria"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          isFavorite={favorites.includes(property.id)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}

export default PropertyGrid;
