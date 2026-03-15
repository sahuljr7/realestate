// Feature: real-estate-marketplace, Property 7: PropertyCard renders all required fields

import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import PropertyCard from '@/components/property/PropertyCard';
import { formatCurrency, formatArea } from '@/lib/formatters';
import type { Property } from '@/types/index';

// ─── Arbitrary ────────────────────────────────────────────────────────────────

/** Generate a non-empty string with visible characters (no whitespace-only) */
function visibleString(minLength = 3, maxLength = 60): fc.Arbitrary<string> {
  return fc
    .string({ minLength, maxLength, unit: 'grapheme-ascii' })
    .filter((s) => s.trim().length > 0);
}

function arbitraryProperty(): fc.Arbitrary<Property> {
  return fc.record({
    id: fc.uuid(),
    title: visibleString(3, 80),
    price: fc.integer({ min: 100_000, max: 100_000_000 }),
    location: visibleString(3, 60),
    city: fc.constantFrom('Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad'),
    locality: visibleString(2, 40),
    bhk: fc.integer({ min: 1, max: 5 }),
    area: fc.integer({ min: 100, max: 10_000 }),
    type: fc.constantFrom('Apartment', 'Villa', 'Plot', 'Commercial', 'PG'),
    sellerType: fc.constantFrom('Owner', 'Agent', 'Builder'),
    furnishing: fc.constantFrom('Furnished', 'Semi-Furnished', 'Unfurnished'),
    possessionStatus: fc.constantFrom('Ready to Move', 'Under Construction'),
    propertyAge: fc.integer({ min: 0, max: 30 }),
    images: fc.array(fc.webUrl(), { minLength: 1, maxLength: 5 }),
    amenities: fc.array(visibleString(2, 20)),
    description: visibleString(5, 200),
    badges: fc.uniqueArray(fc.constantFrom<'new' | 'featured' | 'verified'>('new', 'featured', 'verified'), { maxLength: 3 }),
    postedAt: fc
      .date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') })
      .map((d) => d.toISOString()),
    agentId: fc.option(fc.string(), { nil: undefined }),
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('PropertyCard', () => {
  // Feature: real-estate-marketplace, Property 7: PropertyCard renders all required fields
  it('renders all required fields for any valid Property object', () => {
    fc.assert(
      fc.property(arbitraryProperty(), (property) => {
        const { container, unmount } = render(
          <PropertyCard property={property} />
        );

        const text = container.textContent ?? '';

        // Title
        if (!text.includes(property.title)) { unmount(); return false; }

        // Price (formatted)
        if (!text.includes(formatCurrency(property.price))) { unmount(); return false; }

        // Area (formatted)
        if (!text.includes(formatArea(property.area))) { unmount(); return false; }

        // Location
        if (!text.includes(property.location)) { unmount(); return false; }

        // BHK count — rendered as "X BHK"
        if (!text.includes(`${property.bhk} BHK`)) { unmount(); return false; }

        // Possession status
        if (!text.includes(property.possessionStatus)) { unmount(); return false; }

        // All badge labels
        for (const badge of property.badges) {
          if (!text.includes(badge)) { unmount(); return false; }
        }

        unmount();
        return true;
      }),
      { numRuns: 100 }
    );
  });
});
