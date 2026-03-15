import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { filterProperties, sortProperties, paginateProperties } from '@/lib/filters';
import type { Property, SearchFilters } from '@/types/index';

// ─── Arbitraries ─────────────────────────────────────────────────────────────

function arbitraryProperty(): fc.Arbitrary<Property> {
  return fc.record({
    id: fc.string(),
    title: fc.string(),
    price: fc.integer({ min: 100000, max: 100000000 }),
    location: fc.string(),
    city: fc.constantFrom('Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad'),
    locality: fc.string(),
    bhk: fc.integer({ min: 0, max: 5 }),
    area: fc.integer({ min: 100, max: 10000 }),
    type: fc.constantFrom('Apartment', 'Villa', 'Plot', 'Commercial', 'PG'),
    sellerType: fc.constantFrom('Owner', 'Agent', 'Builder'),
    furnishing: fc.constantFrom('Furnished', 'Semi-Furnished', 'Unfurnished'),
    possessionStatus: fc.constantFrom('Ready to Move', 'Under Construction'),
    propertyAge: fc.integer({ min: 0, max: 30 }),
    images: fc.array(fc.string(), { minLength: 1 }),
    amenities: fc.array(fc.string()),
    description: fc.string(),
    badges: fc.array(fc.constantFrom('new', 'featured', 'verified')),
    postedAt: fc
      .date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') })
      .map((d) => d.toISOString()),
  });
}

function arbitraryFilters(): fc.Arbitrary<Partial<SearchFilters>> {
  return fc.record({
    city: fc.option(
      fc.constantFrom('Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad'),
      { nil: undefined }
    ),
    minPrice: fc.option(fc.integer({ min: 0, max: 50000000 }), { nil: undefined }),
    maxPrice: fc.option(fc.integer({ min: 0, max: 100000000 }), { nil: undefined }),
    bhk: fc.option(
      fc.array(fc.integer({ min: 1, max: 5 }), { minLength: 1 }),
      { nil: undefined }
    ),
    type: fc.option(
      fc.constantFrom('Apartment', 'Villa', 'Plot', 'Commercial', 'PG'),
      { nil: undefined }
    ),
    sellerType: fc.option(
      fc.constantFrom('Owner', 'Agent', 'Builder'),
      { nil: undefined }
    ),
    furnishing: fc.option(
      fc.constantFrom('Furnished', 'Semi-Furnished', 'Unfurnished'),
      { nil: undefined }
    ),
    possessionStatus: fc.option(
      fc.constantFrom('Ready to Move', 'Under Construction'),
      { nil: undefined }
    ),
    maxPropertyAge: fc.option(fc.integer({ min: 0, max: 30 }), { nil: undefined }),
  });
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function satisfiesFilters(p: Property, filters: Partial<SearchFilters>): boolean {
  if (filters.city && p.city.toLowerCase() !== filters.city.toLowerCase()) return false;
  if (filters.minPrice != null && p.price < filters.minPrice) return false;
  if (filters.maxPrice != null && p.price > filters.maxPrice) return false;
  if (filters.bhk?.length && !filters.bhk.includes(p.bhk)) return false;
  if (filters.type && p.type !== filters.type) return false;
  if (filters.sellerType && p.sellerType !== filters.sellerType) return false;
  if (filters.furnishing && p.furnishing !== filters.furnishing) return false;
  if (filters.possessionStatus && p.possessionStatus !== filters.possessionStatus) return false;
  if (filters.maxPropertyAge != null && p.propertyAge > filters.maxPropertyAge) return false;
  return true;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('filters', () => {
  // Feature: real-estate-marketplace, Property 1: Filter correctness — all results satisfy active criteria
  it('filterProperties: all results satisfy active criteria', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryProperty()),
        arbitraryFilters(),
        (properties, filters) => {
          const result = filterProperties(properties, filters);
          return result.every((p) => satisfiesFilters(p, filters));
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: real-estate-marketplace, Property 2: Empty filters return all properties
  it('filterProperties: empty filters return all properties', () => {
    fc.assert(
      fc.property(fc.array(arbitraryProperty()), (properties) => {
        const result = filterProperties(properties, {});
        return result.length === properties.length;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: real-estate-marketplace, Property 3: Sort order correctness
  it('sortProperties: correct order for all sort options', () => {
    const sortOptions = ['price_asc', 'price_desc', 'newest', 'relevance'] as const;

    fc.assert(
      fc.property(
        fc.array(arbitraryProperty()),
        fc.constantFrom(...sortOptions),
        (properties, sort) => {
          const result = sortProperties(properties, sort);

          if (sort === 'price_asc') {
            for (let i = 0; i < result.length - 1; i++) {
              if (result[i].price > result[i + 1].price) return false;
            }
          } else if (sort === 'price_desc') {
            for (let i = 0; i < result.length - 1; i++) {
              if (result[i].price < result[i + 1].price) return false;
            }
          } else if (sort === 'newest') {
            for (let i = 0; i < result.length - 1; i++) {
              const a = new Date(result[i].postedAt).getTime();
              const b = new Date(result[i + 1].postedAt).getTime();
              if (a < b) return false;
            }
          } else {
            // relevance: same items, same order
            if (result.length !== properties.length) return false;
            for (let i = 0; i < result.length; i++) {
              if (result[i].id !== properties[i].id) return false;
            }
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: real-estate-marketplace, Property 4: Pagination size invariant
  it('paginateProperties: at most 12 items per page and all pages cover full list', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryProperty()),
        fc.integer({ min: 1, max: 100 }),
        (properties, totalPages) => {
          const pageSize = 12;
          const actualPages = Math.ceil(properties.length / pageSize) || 1;

          // Each page has at most 12 items
          for (let page = 1; page <= actualPages; page++) {
            const slice = paginateProperties(properties, page, pageSize);
            if (slice.length > pageSize) return false;
          }

          // All pages together cover the full list
          const allItems: Property[] = [];
          for (let page = 1; page <= actualPages; page++) {
            allItems.push(...paginateProperties(properties, page, pageSize));
          }
          return allItems.length === properties.length;
        }
      ),
      { numRuns: 100 }
    );
  });
});
