// Feature: real-estate-marketplace, Property 11: Autocomplete suggestions match typed prefix
// Feature: real-estate-marketplace, Property 12: Search filters serialize to URL parameters

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { getAllLocalities } from '@/services/localityService';
import { serializeFilters, parseFiltersFromParams } from '@/components/search/SearchBar';
import type { SearchFilters, Intent, PropertyType, SortOption } from '@/types/index';

// ─── Autocomplete logic (mirrored from SearchBar) ─────────────────────────────

function getAutocompleteSuggestions(input: string): { name: string; city: string }[] {
  if (!input.trim()) return [];
  const lower = input.toLowerCase();
  const all = getAllLocalities();
  return all
    .filter(
      (l) =>
        l.name.toLowerCase().includes(lower) ||
        l.city.toLowerCase().includes(lower)
    )
    .slice(0, 8)
    .map((l) => ({ name: l.name, city: l.city }));
}

// ─── Arbitraries ─────────────────────────────────────────────────────────────

function arbitrarySearchFilters(): fc.Arbitrary<Partial<SearchFilters>> {
  return fc.record({
    intent: fc.option(
      fc.constantFrom<Intent>('Buy', 'Rent', 'New Projects', 'Commercial', 'PG'),
      { nil: undefined }
    ),
    city: fc.option(
      fc.constantFrom('Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad'),
      { nil: undefined }
    ),
    locality: fc.option(
      fc.constantFrom('Bandra West', 'Juhu', 'Koramangala', 'Whitefield', 'Andheri East'),
      { nil: undefined }
    ),
    minPrice: fc.option(fc.integer({ min: 0, max: 50_000_000 }), { nil: undefined }),
    maxPrice: fc.option(fc.integer({ min: 0, max: 100_000_000 }), { nil: undefined }),
    bhk: fc.option(
      fc.array(fc.integer({ min: 1, max: 5 }), { minLength: 1, maxLength: 5 }),
      { nil: undefined }
    ),
    type: fc.option(
      fc.constantFrom<PropertyType>('Apartment', 'Villa', 'Plot', 'Commercial', 'PG'),
      { nil: undefined }
    ),
    sort: fc.option(
      fc.constantFrom<SortOption>('relevance', 'price_asc', 'price_desc', 'newest'),
      { nil: undefined }
    ),
  }).filter((f) => {
    // Ensure at least one non-default value is present
    return (
      f.intent !== undefined ||
      (f.city !== undefined && f.city !== '') ||
      (f.locality !== undefined && f.locality !== '') ||
      f.minPrice !== undefined ||
      f.maxPrice !== undefined ||
      (f.bhk !== undefined && f.bhk.length > 0) ||
      f.type !== undefined ||
      (f.sort !== undefined && f.sort !== 'relevance')
    );
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('SearchBar', () => {
  // Feature: real-estate-marketplace, Property 11: Autocomplete suggestions match typed prefix
  it('autocomplete: every suggestion contains the typed string as a case-insensitive substring', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        (input) => {
          const suggestions = getAutocompleteSuggestions(input);
          const lower = input.toLowerCase();
          const allLocalities = getAllLocalities();

          // Every suggestion must contain the input as a case-insensitive substring
          const allMatch = suggestions.every(
            (s) =>
              s.name.toLowerCase().includes(lower) ||
              s.city.toLowerCase().includes(lower)
          );

          // Result length must be at most 8
          const withinLimit = suggestions.length <= 8;

          // Every suggestion must be a member of the localities dataset
          const allFromDataset = suggestions.every((s) =>
            allLocalities.some((l) => l.name === s.name && l.city === s.city)
          );

          return allMatch && withinLimit && allFromDataset;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: real-estate-marketplace, Property 12: Search filters serialize to URL parameters
  it('serializeFilters / parseFiltersFromParams: round-trip produces equivalent object', () => {
    fc.assert(
      fc.property(
        arbitrarySearchFilters(),
        (filters) => {
          const params = serializeFilters(filters);
          const parsed = parseFiltersFromParams(params);

          // intent round-trip
          if (filters.intent !== undefined) {
            if (parsed.intent !== filters.intent) return false;
          }

          // city round-trip
          if (filters.city !== undefined && filters.city !== '') {
            if (parsed.city !== filters.city) return false;
          }

          // locality round-trip
          if (filters.locality !== undefined && filters.locality !== '') {
            if (parsed.locality !== filters.locality) return false;
          }

          // minPrice round-trip
          if (filters.minPrice !== undefined) {
            if (parsed.minPrice !== filters.minPrice) return false;
          }

          // maxPrice round-trip
          if (filters.maxPrice !== undefined) {
            if (parsed.maxPrice !== filters.maxPrice) return false;
          }

          // bhk round-trip (order-insensitive)
          if (filters.bhk !== undefined && filters.bhk.length > 0) {
            if (!parsed.bhk) return false;
            const sortedOriginal = [...filters.bhk].sort((a, b) => a - b);
            const sortedParsed = [...parsed.bhk].sort((a, b) => a - b);
            if (sortedOriginal.length !== sortedParsed.length) return false;
            if (!sortedOriginal.every((v, i) => v === sortedParsed[i])) return false;
          }

          // type round-trip
          if (filters.type !== undefined) {
            if (parsed.type !== filters.type) return false;
          }

          // sort round-trip
          if (filters.sort !== undefined) {
            if (parsed.sort !== filters.sort) return false;
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
