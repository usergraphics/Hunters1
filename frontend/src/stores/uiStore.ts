// UI Store - UI state management

import { create } from 'zustand';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

interface UIState {
  // Mobile menu
  isMobileMenuOpen: boolean;
  
  // Modals
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  isFilterModalOpen: boolean;
  
  // Toasts
  toasts: Toast[];
  
  // Sidebar (for dashboard)
  isSidebarCollapsed: boolean;
  
  // Actions
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  openFilterModal: () => void;
  closeFilterModal: () => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  toggleSidebar: () => void;
}

let toastId = 0;

export const useUIStore = create<UIState>()((set) => ({
  isMobileMenuOpen: false,
  isAuthModalOpen: false,
  authModalMode: 'login',
  isFilterModalOpen: false,
  toasts: [],
  isSidebarCollapsed: false,

  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),

  openAuthModal: (mode = 'login') => set({ isAuthModalOpen: true, authModalMode: mode }),

  closeAuthModal: () => set({ isAuthModalOpen: false }),

  openFilterModal: () => set({ isFilterModalOpen: true }),

  closeFilterModal: () => set({ isFilterModalOpen: false }),

  addToast: (toast) => {
    const id = String(++toastId);
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    
    // Auto remove after duration
    const duration = toast.duration || 5000;
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);
  },

  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id),
  })),

  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
}));

export default useUIStore;
