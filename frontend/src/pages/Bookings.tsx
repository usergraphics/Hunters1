// Bookings Page - Real API Implementation

import { useState, useEffect } from 'react';
import { Calendar, Loader2, MapPin, Clock, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common';
import { useAuthStore } from '@/stores/authStore';
import bookingsService from '@/services/bookings';
import type { Booking } from '@/types';

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchBookings = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await bookingsService.getMyBookings();
        setBookings(response.data || response as any);
      } catch (err: any) {
        setError(err.message || 'Failed to load bookings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [isAuthenticated]);

  const handleCancelBooking = async (id: string) => {
    try {
      await bookingsService.cancelBooking(id);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, status: 'CANCELLED' as const } : b
        )
      );
    } catch (err: any) {
      console.error('Failed to cancel booking:', err);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'default';
      case 'PENDING':
        return 'secondary';
      case 'CANCELLED':
        return 'destructive';
      case 'COMPLETED':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
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
        <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
        <EmptyState
          icon={Calendar}
          title="Error loading bookings"
          description={error}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
        <EmptyState
          icon={Calendar}
          title="Sign in to view bookings"
          description="You need to sign in to view your bookings"
        />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
        <EmptyState
          icon={Calendar}
          title="No bookings yet"
          description="Your bookings will appear here once you schedule a property viewing"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
      <div className="space-y-4">
        {bookings.map((booking) => (
          <Card key={booking.id} className="p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={getStatusVariant(booking.status)}>
                    {booking.status}
                  </Badge>
                  {booking.is_priority && (
                    <Badge variant="destructive" className="text-xs">
                      Priority
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-lg">
                  {booking.property?.title || 'Property Viewing'}
                </h3>
                {booking.property?.location && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{booking.property.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(booking.viewing_date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(booking.viewing_time)}</span>
                  </div>
                </div>
                {booking.notes && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Note: {booking.notes}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                {booking.status === 'PENDING' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancelBooking(booking.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
