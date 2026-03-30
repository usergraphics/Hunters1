// Property Filters Component

import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { PropertyFilters, Property } from '@/types';

interface PropertyFiltersProps {
  filters: PropertyFilters;
  onFilterChange: (filters: Partial<PropertyFilters>) => void;
  onClearFilters: () => void;
  className?: string;
}

const propertyTypes: Property['propertyType'][] = [
  'apartment',
  'house',
  'condo',
  'villa',
  'studio',
  'townhouse',
];

const bedroomOptions = [1, 2, 3, 4, 5];
const bathroomOptions = [1, 2, 3, 4];

export function PropertyFilters({
  filters,
  onFilterChange,
  onClearFilters,
  className,
}: PropertyFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && (Array.isArray(value) ? value.length > 0 : true)
  );

  const handleSearchChange = (value: string) => {
    onFilterChange({ search: value || undefined });
  };

  const handleMinPriceChange = (value: string) => {
    onFilterChange({ minPrice: value ? Number(value) : undefined });
  };

  const handleMaxPriceChange = (value: string) => {
    onFilterChange({ maxPrice: value ? Number(value) : undefined });
  };

  const handleBedroomsChange = (value: number) => {
    onFilterChange({ bedrooms: filters.bedrooms === value ? undefined : value });
  };

  const handleBathroomsChange = (value: number) => {
    onFilterChange({ bathrooms: filters.bathrooms === value ? undefined : value });
  };

  const handlePropertyTypeChange = (type: Property['propertyType']) => {
    const currentTypes = filters.propertyType ? [filters.propertyType] : [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];
    onFilterChange({ propertyType: newTypes[0] as Property['propertyType'] | undefined });
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search properties..."
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
        {filters.search && (
          <button
            onClick={() => handleSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Filter Toggle Button */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1">
              Active
            </Badge>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" onClick={onClearFilters}>
            Clear all
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <Card className="p-4 space-y-4">
          {/* Price Range */}
          <div className="space-y-2">
            <Label>Price Range</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.minPrice || ''}
                onChange={(e) => handleMinPriceChange(e.target.value)}
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxPrice || ''}
                onChange={(e) => handleMaxPriceChange(e.target.value)}
              />
            </div>
          </div>

          {/* Bedrooms */}
          <div className="space-y-2">
            <Label>Bedrooms</Label>
            <div className="flex flex-wrap gap-2">
              {bedroomOptions.map((num) => (
                <Button
                  key={num}
                  variant={filters.bedrooms === num ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleBedroomsChange(num)}
                >
                  {num}+
                </Button>
              ))}
            </div>
          </div>

          {/* Bathrooms */}
          <div className="space-y-2">
            <Label>Bathrooms</Label>
            <div className="flex flex-wrap gap-2">
              {bathroomOptions.map((num) => (
                <Button
                  key={num}
                  variant={filters.bathrooms === num ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleBathroomsChange(num)}
                >
                  {num}+
                </Button>
              ))}
            </div>
          </div>

          {/* Property Type */}
          <div className="space-y-2">
            <Label>Property Type</Label>
            <div className="flex flex-wrap gap-2">
              {propertyTypes.map((type) => (
                <Button
                  key={type}
                  variant={filters.propertyType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePropertyTypeChange(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Active Filter Tags */}
      {hasActiveFilters && !isExpanded && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: {filters.search}
              <button onClick={() => handleSearchChange('')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.minPrice && (
            <Badge variant="secondary" className="gap-1">
              Min: ${filters.minPrice}
              <button onClick={() => handleMinPriceChange('')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.maxPrice && (
            <Badge variant="secondary" className="gap-1">
              Max: ${filters.maxPrice}
              <button onClick={() => handleMaxPriceChange('')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.bedrooms && (
            <Badge variant="secondary" className="gap-1">
              {filters.bedrooms}+ beds
              <button onClick={() => handleBedroomsChange(filters.bedrooms!)}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.bathrooms && (
            <Badge variant="secondary" className="gap-1">
              {filters.bathrooms}+ baths
              <button onClick={() => handleBathroomsChange(filters.bathrooms!)}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.propertyType && (
            <Badge variant="secondary" className="gap-1">
              {filters.propertyType}
              <button onClick={() => handlePropertyTypeChange(filters.propertyType!)}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

export default PropertyFilters;
