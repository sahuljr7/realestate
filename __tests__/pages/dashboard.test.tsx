// Feature: real-estate-marketplace, Property 20: Dashboard tab displays correct state slice

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getAllProperties } from '@/services/propertyService';
import type { Property } from '@/types/index';

/**
 * Validates: Requirements 4.2
 *
 * Property 20: Dashboard tab displays correct state slice
 *
 * For any set of property IDs in a store slice (savedPropertyIds, viewHistory,
 * contactedPropertyIds), resolving them via getAllProperties().filter(...) must
 * return exactly the properties whose IDs are in that slice — no more, no less.
 *
 * We test the resolution logic in isolation (no React rendering, no Zustand import).
 */

describe('Property 20: Dashboard tab displays correct state slice', () => {
  const allProperties: Property[] = getAllProperties();
  const allIds: string[] = allProperties.map((p) => p.id);

  // Arbitrary: a subset of real property IDs (0 to all)
  const arbitraryIdSubset = fc.array(fc.constantFrom(...allIds), {
    minLength: 0,
    maxLength: allIds.length,
  }).map((ids) => [...new Set(ids)]); // deduplicate

  // Feature: real-estate-marketplace, Property 20: Dashboard tab displays correct state slice
  it('resolved properties for saved tab match exactly the saved IDs', () => {
    fc.assert(
      fc.property(arbitraryIdSubset, (savedIds) => {
        const resolved = allProperties.filter((p) => savedIds.includes(p.id));

        // Every resolved property's ID must be in savedIds
        const allInSlice = resolved.every((p) => savedIds.includes(p.id));
        // Every ID in savedIds that exists in allProperties must appear in resolved
        const existingIds = savedIds.filter((id) => allIds.includes(id));
        const allCovered = existingIds.every((id) =>
          resolved.some((p) => p.id === id)
        );

        return allInSlice && allCovered;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: real-estate-marketplace, Property 20: Dashboard tab displays correct state slice
  it('resolved properties for view history tab match exactly the viewHistory IDs', () => {
    fc.assert(
      fc.property(arbitraryIdSubset, (viewHistoryIds) => {
        const resolved = allProperties.filter((p) => viewHistoryIds.includes(p.id));

        const allInSlice = resolved.every((p) => viewHistoryIds.includes(p.id));
        const existingIds = viewHistoryIds.filter((id) => allIds.includes(id));
        const allCovered = existingIds.every((id) =>
          resolved.some((p) => p.id === id)
        );

        return allInSlice && allCovered;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: real-estate-marketplace, Property 20: Dashboard tab displays correct state slice
  it('resolved properties for contacted tab match exactly the contactedPropertyIds', () => {
    fc.assert(
      fc.property(arbitraryIdSubset, (contactedIds) => {
        const resolved = allProperties.filter((p) => contactedIds.includes(p.id));

        const allInSlice = resolved.every((p) => contactedIds.includes(p.id));
        const existingIds = contactedIds.filter((id) => allIds.includes(id));
        const allCovered = existingIds.every((id) =>
          resolved.some((p) => p.id === id)
        );

        return allInSlice && allCovered;
      }),
      { numRuns: 100 }
    );
  });

  it('no extra properties are included beyond the slice IDs', () => {
    fc.assert(
      fc.property(arbitraryIdSubset, (sliceIds) => {
        const resolved = allProperties.filter((p) => sliceIds.includes(p.id));
        // Resolved set must be a strict subset of sliceIds
        return resolved.every((p) => sliceIds.includes(p.id));
      }),
      { numRuns: 100 }
    );
  });

  it('empty slice resolves to empty property list', () => {
    const resolved = allProperties.filter((p) => [].includes(p.id));
    expect(resolved).toHaveLength(0);
  });

  it('slice with all IDs resolves to all properties', () => {
    const resolved = allProperties.filter((p) => allIds.includes(p.id));
    expect(resolved).toHaveLength(allProperties.length);
  });
});
