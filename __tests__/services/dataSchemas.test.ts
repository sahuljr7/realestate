// Feature: real-estate-marketplace, Property 18: Data entities have required fields

import { describe, it } from 'vitest';
import * as fc from 'fast-check';

const properties = require('../../data/properties.json');
const localities = require('../../data/localities.json');
const agents = require('../../data/agents.json');
const blogs = require('../../data/blogs.json');

const PROPERTY_REQUIRED_KEYS = [
  'id', 'title', 'price', 'location', 'city', 'locality', 'bhk', 'area',
  'type', 'sellerType', 'furnishing', 'possessionStatus', 'propertyAge',
  'images', 'amenities', 'description', 'badges', 'postedAt',
] as const;

const LOCALITY_REQUIRED_KEYS = [
  'id', 'slug', 'name', 'city', 'avgPricePerSqft', 'trend',
  'propertyCount', 'priceHistory',
] as const;

const AGENT_REQUIRED_KEYS = [
  'id', 'name', 'phone', 'email', 'agency', 'rating', 'portfolioImage', 'specialty',
] as const;

const BLOG_REQUIRED_KEYS = [
  'id', 'title', 'excerpt', 'image', 'author', 'publishedAt', 'category',
] as const;

// Validates: Requirements 11.1, 11.2
describe('Property 18: Data entities have required fields', () => {
  it('every property entry contains all required keys with non-null values', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...properties),
        (entry: Record<string, unknown>) => {
          return PROPERTY_REQUIRED_KEYS.every(
            (key) => key in entry && entry[key] !== null && entry[key] !== undefined
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('every locality entry contains all required keys with non-null values', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...localities),
        (entry: Record<string, unknown>) => {
          return LOCALITY_REQUIRED_KEYS.every(
            (key) => key in entry && entry[key] !== null && entry[key] !== undefined
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('every locality entry has priceHistory with exactly 12 data points', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...localities),
        (entry: Record<string, unknown>) => {
          const history = entry['priceHistory'] as unknown[];
          return Array.isArray(history) && history.length === 12;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('every agent entry contains all required keys with non-null values', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...agents),
        (entry: Record<string, unknown>) => {
          return AGENT_REQUIRED_KEYS.every(
            (key) => key in entry && entry[key] !== null && entry[key] !== undefined
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('every blog entry contains all required keys with non-null values', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...blogs),
        (entry: Record<string, unknown>) => {
          return BLOG_REQUIRED_KEYS.every(
            (key) => key in entry && entry[key] !== null && entry[key] !== undefined
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
