'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import SearchBar, { parseFiltersFromParams, serializeFilters } from '@/components/search/SearchBar';
import FilterSidebar from '@/components/property/FilterSidebar';
import PropertyCard from '@/components/property/PropertyCard';
import PropertyCardSkeleton from '@/components/property/PropertyCardSkeleton';
import Modal from '@/components/ui/Modal';
import ContactForm from '@/components/forms/ContactForm';
import { useProperties } from '@/hooks/useProperties';
import { useMarketplaceStore } from '@/store/useMarketplaceStore';
import type { SearchFilters, SortOption } from '@/types/index';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price (Low to High)' },
  { value: 'price_desc', label: 'Price (High to Low)' },
  { value: 'newest', label: 'Newest' },
];

const DEFAULT_FILTERS: SearchFilters = {
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

export default function PropertiesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize filters from URL params
  const [filters, setFilters] = useState<SearchFilters>(() => ({
    ...DEFAULT_FILTERS,
    ...parseFiltersFromParams(searchParams),
  }));

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [contactPropertyId, setContactPropertyId] = useState<string | null>(null);

  const { saveProperty, unsaveProperty, savedPropertyIds } = useMarketplaceStore();

  const { properties, total, page, setPage, loading } = useProperties(filters);

  const totalPages = Math.ceil(total / 12);

  // Sync filter changes back to URL
  const updateFilters = useCallback(
    (partial: Partial<SearchFilters>) => {
      setFilters((prev) => {
        const next = { ...prev, ...partial };
        const params = serializeFilters(next);
        router.replace(`/properties?${params.toString()}`, { scroll: false });
        return next;
      });
    },
    [router]
  );

  // Keep filters in sync if URL changes externally (e.g. SearchBar navigation)
  useEffect(() => {
    const parsed = parseFiltersFromParams(searchParams);
    setFilters({ ...DEFAULT_FILTERS, ...parsed });
  }, [searchParams]);

  const handleSave = useCallback(
    (id: string) => {
      if (savedPropertyIds.includes(id)) {
        unsaveProperty(id);
      } else {
        saveProperty(id);
      }
    },
    [savedPropertyIds, saveProperty, unsaveProperty]
  );

  const handleContact = useCallback((id: string) => {
    setContactPropertyId(id);
  }, []);

  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateFilters({ sort: e.target.value as SortOption });
    },
    [updateFilters]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky SearchBar on mobile */}
      <div className="md:hidden sticky top-0 z-40 bg-white shadow-sm px-4 py-2">
        <SearchBar
          initialFilters={filters}
          sticky
          onSearch={(f) => updateFilters(f)}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Desktop SearchBar */}
        <div className="hidden md:block mb-6">
          <SearchBar
            initialFilters={filters}
            onSearch={(f) => updateFilters(f)}
          />
        </div>

        <div className="flex gap-6">
          {/* Filter Sidebar */}
          <FilterSidebar
            filters={filters}
            onChange={updateFilters}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar: result count + mobile filter button + sort */}
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{total}</span> properties found
              </p>

              <div className="flex items-center gap-3">
                {/* Mobile filter button */}
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="md:hidden flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <SlidersHorizontal size={16} />
                  Filters
                </button>

                {/* Sort dropdown */}
                <div className="flex items-center gap-2">
                  <label htmlFor="sort-select" className="text-sm text-gray-600 whitespace-nowrap">
                    Sort by:
                  </label>
                  <select
                    id="sort-select"
                    value={filters.sort}
                    onChange={handleSortChange}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Property grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading
                ? Array.from({ length: 12 }).map((_, i) => (
                    <PropertyCardSkeleton key={i} />
                  ))
                : properties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      isSaved={savedPropertyIds.includes(property.id)}
                      onSave={handleSave}
                      onContact={handleContact}
                    />
                  ))}
            </div>

            {/* Empty state */}
            {!loading && properties.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-lg font-semibold text-gray-700">No properties found</p>
                <p className="text-sm text-gray-500 mt-1">
                  Try adjusting your filters or search criteria.
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <span className="text-sm text-gray-600">
                  Page <span className="font-semibold">{page}</span> of{' '}
                  <span className="font-semibold">{totalPages}</span>
                </span>

                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <Modal
        isOpen={contactPropertyId !== null}
        onClose={() => setContactPropertyId(null)}
        title="Contact Owner"
      >
        {contactPropertyId && <ContactForm propertyId={contactPropertyId} />}
      </Modal>
    </div>
  );
}
