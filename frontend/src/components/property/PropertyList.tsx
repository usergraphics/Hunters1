// Property List Component

import { PropertyCard } from './PropertyCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import type { Property } from '@/types';

interface PropertyListProps {
  properties: Property[];
  isLoading?: boolean;
  favorites?: string[];
  onToggleFavorite?: (id: string) => void;
}

export function PropertyList({
  properties,
  isLoading = false,
  favorites = [],
  onToggleFavorite,
}: PropertyListProps) {
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
    <div className="flex flex-col gap-4">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          variant="compact"
          isFavorite={favorites.includes(property.id)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}

export default PropertyList;
