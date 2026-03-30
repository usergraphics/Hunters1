// Property Card Component - Airbnb-style design

import { Link } from 'react-router-dom';
import { Heart, MapPin, Bed, Bath, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Property } from '@/types';

interface PropertyCardProps {
  property: Property;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  className?: string;
  variant?: 'default' | 'compact';
}

export function PropertyCard({
  property,
  isFavorite = false,
  onToggleFavorite,
  className,
  variant = 'default',
}: PropertyCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(property.id);
  };

  if (variant === 'compact') {
    return (
      <Link to={`/properties/${property.id}`} className="block">
        <Card className={cn('overflow-hidden hover:shadow-md transition-shadow', className)}>
          <div className="flex gap-3 p-3">
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={property.images[0] || '/placeholder.jpg'}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{property.title}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {property.location.city}, {property.location.state}
              </p>
              <p className="font-semibold mt-1">${property.price}/mo</p>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Link to={`/properties/${property.id}`} className="block">
      <Card className={cn('overflow-hidden group hover:shadow-lg transition-all duration-300', className)}>
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
          <img
            src={property.images[0] || '/placeholder.jpg'}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
          >
            <Heart
              className={cn(
                'w-5 h-5',
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
              )}
            />
          </button>

          {/* Status Badge */}
          {property.status !== 'available' && (
            <Badge
              className="absolute top-3 left-3"
              variant={property.status === 'occupied' ? 'secondary' : 'destructive'}
            >
              {property.status}
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-lg truncate">{property.title}</h3>
              <p className="text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" />
                {property.location.city}, {property.location.state}
              </p>
            </div>
          </div>

          {/* Property Features */}
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              {property.bedrooms} {property.bedrooms === 1 ? 'bed' : 'beds'}
            </span>
            <span className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              {property.bathrooms} {property.bathrooms === 1 ? 'bath' : 'baths'}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {property.maxGuests} guests
            </span>
          </div>

          {/* Price */}
          <div className="mt-3">
            <span className="text-lg font-bold">${property.price}</span>
            <span className="text-muted-foreground"> /month</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default PropertyCard;
