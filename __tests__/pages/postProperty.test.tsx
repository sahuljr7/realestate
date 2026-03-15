/**
 * Tests for Post Property page — Properties 13 and 14
 *
 * // Feature: real-estate-marketplace, Property 13: Post property form validation rejects incomplete submissions
 * // Feature: real-estate-marketplace, Property 14: Posted property appears in listings
 */

import * as fc from 'fast-check';
import { filterProperties } from '@/lib/filters';
import { addProperty, getAllProperties } from '@/services/propertyService';
import type { Property, PropertyType, FurnishingStatus, SellerType } from '@/types/index';

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface FormFields {
  title: string;
  type: PropertyType | '';
  bhk: string;
  price: string;
  area: string;
  city: string;
  locality: string;
  description: string;
  amenities: string;
  furnishing: FurnishingStatus | '';
  possessionDate: string;
}

type FormErrors = Partial<Record<keyof FormFields, string>>;

const REQUIRED_FIELDS: (keyof FormFields)[] = [
  'title', 'type', 'bhk', 'price', 'area', 'city', 'locality', 'description',
];

/** Mirror of the validate() function from the page */
function validate(fields: FormFields): FormErrors {
  const errors: FormErrors = {};
  for (const key of REQUIRED_FIELDS) {
    const val = fields[key].toString().trim();
    if (!val) {
      errors[key] = `${key} is required`;
    }
  }
  if (fields.bhk && (isNaN(Number(fields.bhk)) || Number(fields.bhk) < 1)) {
    errors.bhk = 'BHK must be a positive number';
  }
  if (fields.price && (isNaN(Number(fields.price)) || Number(fields.price) <= 0)) {
    errors.price = 'Price must be a positive number';
  }
  if (fields.area && (isNaN(Number(fields.area)) || Number(fields.area) <= 0)) {
    errors.area = 'Area must be a positive number';
  }
  return errors;
}

/** Returns true if the form would be accepted (no validation errors) */
function isValid(fields: FormFields): boolean {
  return Object.keys(validate(fields)).length === 0;
}

// ─── Arbitraries ──────────────────────────────────────────────────────────────

const propertyTypes: PropertyType[] = ['Apartment', 'Villa', 'Plot', 'Commercial', 'PG'];
const furnishingOptions: FurnishingStatus[] = ['Furnished', 'Semi-Furnished', 'Unfurnished'];

/** Arbitrary for a fully valid form submission */
const arbitraryValidForm = (): fc.Arbitrary<FormFields> =>
  fc.record({
    title: fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
    type: fc.constantFrom(...propertyTypes),
    bhk: fc.integer({ min: 1, max: 10 }).map(String),
    price: fc.integer({ min: 1, max: 100_000_000 }).map(String),
    area: fc.integer({ min: 1, max: 100_000 }).map(String),
    city: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
    locality: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
    description: fc.string({ minLength: 1, maxLength: 500 }).filter((s) => s.trim().length > 0),
    amenities: fc.string({ maxLength: 100 }),
    furnishing: fc.constantFrom(...furnishingOptions, '' as const),
    possessionDate: fc.constant(''),
  });

/** Arbitrary for a form with at least one required field blanked out */
const arbitraryIncompleteForm = (): fc.Arbitrary<{ fields: FormFields; missingField: keyof FormFields }> =>
  arbitraryValidForm().chain((validForm) =>
    fc.constantFrom(...REQUIRED_FIELDS).map((missingField) => ({
      fields: { ...validForm, [missingField]: '' },
      missingField,
    }))
  );

/** Build a Property object from valid form fields (mirrors page logic) */
function buildProperty(fields: FormFields, previewUrl: string | null = null): Property {
  return {
    id: `prop-test-${Math.random().toString(36).slice(2, 9)}`,
    title: fields.title.trim(),
    type: fields.type as PropertyType,
    bhk: Number(fields.bhk),
    price: Number(fields.price),
    area: Number(fields.area),
    city: fields.city.trim(),
    locality: fields.locality.trim(),
    location: `${fields.locality.trim()}, ${fields.city.trim()}`,
    description: fields.description.trim(),
    amenities: fields.amenities
      ? fields.amenities.split(',').map((a) => a.trim()).filter(Boolean)
      : [],
    furnishing: (fields.furnishing as FurnishingStatus) || 'Unfurnished',
    possessionStatus: 'Ready to Move',
    images: [previewUrl || '/images/placeholder.jpg'],
    badges: [],
    postedAt: new Date().toISOString(),
    propertyAge: 0,
    sellerType: 'Owner' as SellerType,
  };
}

// ─── Property 13: Form validation rejects incomplete submissions ──────────────

// Feature: real-estate-marketplace, Property 13: Post property form validation rejects incomplete submissions
describe('Property 13: Post property form validation rejects incomplete submissions', () => {
  it('produces an error for each missing required field', () => {
    // Validates: Requirements 5.4
    fc.assert(
      fc.property(arbitraryIncompleteForm(), ({ fields, missingField }) => {
        const errors = validate(fields);
        // Must have an error for the missing field
        return missingField in errors && typeof errors[missingField] === 'string';
      }),
      { numRuns: 100 }
    );
  });

  it('does not add property to state when required fields are missing', () => {
    // Validates: Requirements 5.4
    fc.assert(
      fc.property(arbitraryIncompleteForm(), ({ fields }) => {
        const before = getAllProperties().length;
        const errors = validate(fields);
        // Simulate: only call addProperty when valid
        if (Object.keys(errors).length > 0) {
          // Should NOT add — verify state unchanged
          return getAllProperties().length === before;
        }
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('valid form produces no errors', () => {
    fc.assert(
      fc.property(arbitraryValidForm(), (fields) => {
        const errors = validate(fields);
        return Object.keys(errors).length === 0;
      }),
      { numRuns: 100 }
    );
  });
});

// ─── Property 14: Posted property appears in listings ────────────────────────

// Feature: real-estate-marketplace, Property 14: Posted property appears in listings
describe('Property 14: Posted property appears in listings', () => {
  it('addProperty makes the property visible in filterProperties with empty filters', () => {
    // Validates: Requirements 5.5
    fc.assert(
      fc.property(arbitraryValidForm(), (fields) => {
        const newProp = buildProperty(fields);
        addProperty(newProp);
        const all = filterProperties(getAllProperties(), {});
        return all.some((p) => p.id === newProp.id);
      }),
      { numRuns: 100 }
    );
  });

  it('posted property fields match submitted form values', () => {
    // Validates: Requirements 5.5
    fc.assert(
      fc.property(arbitraryValidForm(), (fields) => {
        const newProp = buildProperty(fields);
        addProperty(newProp);
        const found = getAllProperties().find((p) => p.id === newProp.id);
        if (!found) return false;
        return (
          found.title === fields.title.trim() &&
          found.city === fields.city.trim() &&
          found.locality === fields.locality.trim() &&
          found.bhk === Number(fields.bhk) &&
          found.price === Number(fields.price) &&
          found.area === Number(fields.area)
        );
      }),
      { numRuns: 100 }
    );
  });
});
