// Map Store - Map state management

import { create } from 'zustand';

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface MapState {
  center: [number, number]; // [lat, lng]
  zoom: number;
  bounds: MapBounds | null;
  selectedPropertyId: string | null;
  isMapLoading: boolean;
  showSearchArea: boolean;
  
  // Actions
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  setBounds: (bounds: MapBounds | null) => void;
  selectProperty: (propertyId: string | null) => void;
  setMapLoading: (loading: boolean) => void;
  toggleSearchArea: (show?: boolean) => void;
  reset: () => void;
}

const defaultCenter: [number, number] = [40.7128, -74.006]; // Default to NYC
const defaultZoom = 12;

export const useMapStore = create<MapState>()((set) => ({
  center: defaultCenter,
  zoom: defaultZoom,
  bounds: null,
  selectedPropertyId: null,
  isMapLoading: false,
  showSearchArea: false,

  setCenter: (center) => set({ center }),

  setZoom: (zoom) => set({ zoom }),

  setBounds: (bounds) => set({ bounds, showSearchArea: !!bounds }),

  selectProperty: (selectedPropertyId) => set({ selectedPropertyId }),

  setMapLoading: (isMapLoading) => set({ isMapLoading }),

  toggleSearchArea: (show) => set((state) => ({ 
    showSearchArea: show !== undefined ? show : !state.showSearchArea 
  })),

  reset: () => set({
    center: defaultCenter,
    zoom: defaultZoom,
    bounds: null,
    selectedPropertyId: null,
    isMapLoading: false,
    showSearchArea: false,
  }),
}));

export default useMapStore;
