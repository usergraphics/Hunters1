// Filter Store - Property filters state

import { create } from 'zustand';
import type { PropertyFilters, PropertySort } from '../types';

interface FilterState {
  filters: PropertyFilters;
  sort: PropertySort;
  viewMode: 'grid' | 'list';
  page: number;
  
  // Actions
  setFilters: (filters: Partial<PropertyFilters>) => void;
  clearFilters: () => void;
  setSort: (sort: PropertySort) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setPage: (page: number) => void;
  reset: () => void;
}

const defaultFilters: PropertyFilters = {};
const defaultSort: PropertySort = { field: 'createdAt', order: 'desc' };

export const useFilterStore = create<FilterState>()((set) => ({
  filters: defaultFilters,
  sort: defaultSort,
  viewMode: 'grid',
  page: 1,

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      page: 1, // Reset to first page when filters change
    })),

  clearFilters: () => set({ filters: defaultFilters, page: 1 }),

  setSort: (sort) => set({ sort }),

  setViewMode: (viewMode) => set({ viewMode }),

  setPage: (page) => set({ page }),

  reset: () =>
    set({
      filters: defaultFilters,
      sort: defaultSort,
      viewMode: 'grid',
      page: 1,
    }),
}));

export default useFilterStore;
