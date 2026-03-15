import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { SearchFilters } from '@/types/index';

const defaultFilters: SearchFilters = {
  intent: 'Buy',
  city: '',
  locality: '',
  minPrice: null,
  maxPrice: null,
  bhk: [],
  type: null,
  sellerType: null,
  furnishing: null,
  maxPropertyAge: null,
  possessionStatus: null,
  sort: 'relevance',
};

interface MarketplaceState {
  // Persisted user activity
  savedPropertyIds: string[];
  viewHistory: string[];          // property IDs, most recent first
  contactedPropertyIds: string[];

  // Active search filters (synced with URL params)
  activeFilters: SearchFilters;

  // User profile (dummy auth)
  user: { name: string; email: string; avatar: string } | null;

  // Actions
  saveProperty: (id: string) => void;
  unsaveProperty: (id: string) => void;
  recordView: (id: string) => void;
  recordContact: (id: string) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
}

export const useMarketplaceStore = create<MarketplaceState>()(
  persist(
    (set) => ({
      savedPropertyIds: [],
      viewHistory: [],
      contactedPropertyIds: [],
      activeFilters: defaultFilters,
      user: null,

      saveProperty: (id) =>
        set((state) => ({
          savedPropertyIds: state.savedPropertyIds.includes(id)
            ? state.savedPropertyIds
            : [...state.savedPropertyIds, id],
        })),

      unsaveProperty: (id) =>
        set((state) => ({
          savedPropertyIds: state.savedPropertyIds.filter((sid) => sid !== id),
        })),

      recordView: (id) =>
        set((state) => ({
          viewHistory: [id, ...state.viewHistory.filter((vid) => vid !== id)],
        })),

      recordContact: (id) =>
        set((state) => ({
          contactedPropertyIds: state.contactedPropertyIds.includes(id)
            ? state.contactedPropertyIds
            : [...state.contactedPropertyIds, id],
        })),

      setFilters: (filters) =>
        set((state) => ({
          activeFilters: { ...state.activeFilters, ...filters },
        })),

      resetFilters: () =>
        set({ activeFilters: defaultFilters }),
    }),
    {
      name: 'marketplace-storage',
      storage: createJSONStorage(() => {
        try {
          return localStorage;
        } catch {
          // SSR or storage unavailable — use a no-op storage
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
      }),
      partialize: (state) => ({
        savedPropertyIds: state.savedPropertyIds,
        viewHistory: state.viewHistory,
        contactedPropertyIds: state.contactedPropertyIds,
      }),
    }
  )
);
