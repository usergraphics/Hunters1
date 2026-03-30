// Favorites Page - Real API Implementation

import { useState, useEffect } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { PropertyGrid } from '@/components/property';
import { EmptyState } from '@/components/common';
import { useAuthStore } from '@/stores/authStore';
import propertiesService from '@/services/properties';
import type { Property } from '@/types';

export default function Favorites() {
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await propertiesService.getFavorites(user.id);
        setFavorites(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load favorites');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [isAuthenticated, user]);

  const handleToggleFavorite = async (id: string) => {
    try {
      await propertiesService.toggleFavorite(id);
      setFavorites((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      console.error('Failed to remove favorite:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Favorites</h1>
        <EmptyState
          icon={Heart}
          title="Error loading favorites"
          description={error}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Favorites</h1>
        <EmptyState
          icon={Heart}
          title="Sign in to view favorites"
          description="You need to sign in to view your saved properties"
        />
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Favorites</h1>
        <EmptyState
          icon={Heart}
          title="No favorites yet"
          description="Start exploring properties and save your favorites here"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Favorites</h1>
      <PropertyGrid
        properties={favorites}
        favorites={favorites.map((p) => p.id)}
        onToggleFavorite={handleToggleFavorite}
      />
    </div>
  );
}
