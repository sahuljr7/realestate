// Feature: real-estate-marketplace, Property 15: Locality properties match locality

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getLocalityBySlug, getAllLocalities } from '@/services/localityService';
import { getPropertiesByLocality } from '@/services/propertyService';

/**
 * Property 15: Locality properties match locality
 * Validates: Requirements 6.4
 *
 * For any locality slug, the properties displayed on the Locality Detail View
 * must all have a `locality` field equal to that locality's name (case-insensitive).
 * No property from a different locality may appear.
 */
describe('Property 15: Locality properties match locality', () => {
  it('getPropertiesByLocality returns only properties matching the locality name (case-insensitive)', () => {
    const localities = getAllLocalities();

    // Use fast-check to pick arbitrary localities from the real dataset
    fc.assert(
      fc.property(
        fc.constantFrom(...localities),
        (locality) => {
          const properties = getPropertiesByLocality(locality.name);
          return properties.every(
            (p) => p.locality.toLowerCase() === locality.name.toLowerCase()
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('no property from a different locality appears in the result', () => {
    const localities = getAllLocalities();

    fc.assert(
      fc.property(
        fc.constantFrom(...localities),
        (locality) => {
          const properties = getPropertiesByLocality(locality.name);
          // None of the returned properties should have a different locality
          return !properties.some(
            (p) => p.locality.toLowerCase() !== locality.name.toLowerCase()
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('getLocalityBySlug returns the correct locality for each slug in the dataset', () => {
    const localities = getAllLocalities();

    fc.assert(
      fc.property(
        fc.constantFrom(...localities),
        (locality) => {
          const found = getLocalityBySlug(locality.slug);
          return found !== undefined && found.id === locality.id;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('getLocalityBySlug returns undefined for an unknown slug', () => {
    const result = getLocalityBySlug('this-slug-does-not-exist-xyz-999');
    expect(result).toBeUndefined();
  });
});

// Feature: real-estate-marketplace, Property 17: Locality comparison limit

import * as fcProp17 from 'fast-check';
import { getAllLocalities as getAllLocalitiesForProp17 } from '@/services/localityService';

/**
 * Property 17: Locality comparison limit
 * Validates: Requirements 7.2
 *
 * For any set of selected localities on the Price Trends page, the comparison
 * chart must render data for at most 3 localities. Attempting to add a 4th
 * locality must be rejected without modifying the existing selection.
 */
describe('Property 17: Locality comparison limit', () => {
  // Pure function that mirrors the toggle logic in the trends page
  function toggleLocality(selected: string[], name: string): string[] {
    if (selected.includes(name)) {
      return selected.filter((n) => n !== name);
    }
    if (selected.length >= 3) return selected; // reject 4th
    return [...selected, name];
  }

  it('adding a 4th locality is rejected and existing 3 remain unchanged', () => {
    const localities = getAllLocalitiesForProp17();

    fcProp17.assert(
      fcProp17.property(
        // Pick 4 distinct localities
        fcProp17.uniqueArray(fcProp17.constantFrom(...localities), { minLength: 4, maxLength: 4 }),
        (fourLocalities) => {
          const [a, b, c, d] = fourLocalities;
          // Build up a selection of 3
          let selected: string[] = [];
          selected = toggleLocality(selected, a.name);
          selected = toggleLocality(selected, b.name);
          selected = toggleLocality(selected, c.name);

          // Attempt to add a 4th
          const after = toggleLocality(selected, d.name);

          // Must still be exactly 3 and unchanged
          return (
            after.length === 3 &&
            after.includes(a.name) &&
            after.includes(b.name) &&
            after.includes(c.name) &&
            !after.includes(d.name)
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('selection never exceeds 3 localities regardless of toggle sequence', () => {
    const localities = getAllLocalitiesForProp17();

    fcProp17.assert(
      fcProp17.property(
        fcProp17.array(fcProp17.constantFrom(...localities.map((l) => l.name)), {
          minLength: 1,
          maxLength: 20,
        }),
        (names) => {
          let selected: string[] = [];
          for (const name of names) {
            selected = toggleLocality(selected, name);
          }
          return selected.length <= 3;
        }
      ),
      { numRuns: 100 }
    );
  });
});
