/**
 * Bug Condition Exploration Tests — Task 1 / Task 5.1
 *
 * These tests encode the EXPECTED (fixed) behavior for both bugs:
 *   Bug 1 — Input text visibility (text color class must be present)
 *   Bug 2 — Property image rendering (src must be a valid Picsum URL, not /images/placeholder.jpg)
 *
 * On UNFIXED code these tests FAIL (confirming the bugs exist).
 * On FIXED code these tests PASS (confirming the bugs are resolved).
 *
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7
 */

// Mock localStorage for Zustand persist
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import SearchBar from '@/components/search/SearchBar';
import FilterSidebar from '@/components/property/FilterSidebar';
import ContactForm from '@/components/forms/ContactForm';
import QuoteForm from '@/components/forms/QuoteForm';
import PropertyCard from '@/components/property/PropertyCard';
import PropertyGallery from '@/components/property/PropertyGallery';
import type { Property, SearchFilters } from '@/types/index';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TEXT_COLOR_CLASSES = ['text-gray-900', 'text-gray-800', 'text-black', 'text-gray-700'];

function hasTextColorClass(className: string): boolean {
  return TEXT_COLOR_CLASSES.some((cls) => className.includes(cls));
}

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

const baseProperty: Property = {
  id: 'test-prop-1',
  title: 'Test Property',
  price: 5000000,
  location: 'Bandra, Mumbai',
  city: 'Mumbai',
  locality: 'Bandra',
  bhk: 2,
  area: 1000,
  type: 'Apartment',
  sellerType: 'Owner',
  furnishing: 'Furnished',
  possessionStatus: 'Ready to Move',
  propertyAge: 2,
  images: [],
  amenities: [],
  description: 'A nice property',
  badges: [],
  postedAt: '2024-01-01T00:00:00.000Z',
};

// ─── Test 1a — SearchBar Input Color ─────────────────────────────────────────

describe('Test 1a — SearchBar Input Color', () => {
  /**
   * Validates: Requirements 2.1
   * Each input/select in SearchBar must have a text color utility class.
   */
  it('location input className contains a text color utility', () => {
    const { container, unmount } = render(<SearchBar />);
    const locationInput = container.querySelector('input[id="sb-location"]') as HTMLInputElement;
    expect(locationInput).not.toBeNull();
    expect(hasTextColorClass(locationInput.className)).toBe(true);
    unmount();
  });

  it('min price input className contains a text color utility', () => {
    const { container, unmount } = render(<SearchBar />);
    const minPriceInput = container.querySelector('input[id="sb-min-price"]') as HTMLInputElement;
    expect(minPriceInput).not.toBeNull();
    expect(hasTextColorClass(minPriceInput.className)).toBe(true);
    unmount();
  });

  it('max price input className contains a text color utility', () => {
    const { container, unmount } = render(<SearchBar />);
    const maxPriceInput = container.querySelector('input[id="sb-max-price"]') as HTMLInputElement;
    expect(maxPriceInput).not.toBeNull();
    expect(hasTextColorClass(maxPriceInput.className)).toBe(true);
    unmount();
  });

  it('property type select className contains a text color utility', () => {
    const { container, unmount } = render(<SearchBar />);
    const typeSelect = container.querySelector('select[id="sb-type"]') as HTMLSelectElement;
    expect(typeSelect).not.toBeNull();
    expect(hasTextColorClass(typeSelect.className)).toBe(true);
    unmount();
  });
});

// ─── Test 1b — FilterSidebar Input Color ─────────────────────────────────────

describe('Test 1b — FilterSidebar Input Color', () => {
  /**
   * Validates: Requirements 2.2
   * Each price input and select in FilterSidebar must have a text color utility class.
   */
  it('min price input className contains a text color utility', () => {
    const { container, unmount } = render(
      <FilterSidebar filters={defaultFilters} onChange={() => {}} />
    );
    const minInput = container.querySelector('input[placeholder="Min"]') as HTMLInputElement;
    expect(minInput).not.toBeNull();
    expect(hasTextColorClass(minInput.className)).toBe(true);
    unmount();
  });

  it('max price input className contains a text color utility', () => {
    const { container, unmount } = render(
      <FilterSidebar filters={defaultFilters} onChange={() => {}} />
    );
    const maxInput = container.querySelector('input[placeholder="Max"]') as HTMLInputElement;
    expect(maxInput).not.toBeNull();
    expect(hasTextColorClass(maxInput.className)).toBe(true);
    unmount();
  });

  it('all select elements className contain a text color utility', () => {
    const { container, unmount } = render(
      <FilterSidebar filters={defaultFilters} onChange={() => {}} />
    );
    const selects = Array.from(container.querySelectorAll('select'));
    expect(selects.length).toBeGreaterThan(0);
    for (const select of selects) {
      expect(hasTextColorClass(select.className)).toBe(true);
    }
    unmount();
  });
});

// ─── Test 1c — ContactForm Input Color ───────────────────────────────────────

describe('Test 1c — ContactForm Input Color', () => {
  /**
   * Validates: Requirements 2.3
   * name/phone/message fields must have a text color utility class in the non-error state.
   */
  it('name input className contains a text color utility', () => {
    const { container, unmount } = render(<ContactForm propertyId="prop-1" />);
    const nameInput = container.querySelector('input[name="name"]') as HTMLInputElement;
    expect(nameInput).not.toBeNull();
    expect(hasTextColorClass(nameInput.className)).toBe(true);
    unmount();
  });

  it('phone input className contains a text color utility', () => {
    const { container, unmount } = render(<ContactForm propertyId="prop-1" />);
    const phoneInput = container.querySelector('input[name="phone"]') as HTMLInputElement;
    expect(phoneInput).not.toBeNull();
    expect(hasTextColorClass(phoneInput.className)).toBe(true);
    unmount();
  });

  it('message textarea className contains a text color utility', () => {
    const { container, unmount } = render(<ContactForm propertyId="prop-1" />);
    const messageTextarea = container.querySelector('textarea[name="message"]') as HTMLTextAreaElement;
    expect(messageTextarea).not.toBeNull();
    expect(hasTextColorClass(messageTextarea.className)).toBe(true);
    unmount();
  });
});

// ─── Test 1d — QuoteForm Input Color ─────────────────────────────────────────

describe('Test 1d — QuoteForm Input Color', () => {
  /**
   * Validates: Requirements 2.4
   * All inputs and selects in QuoteForm must have a text color utility class.
   */
  it('name input className contains a text color utility', () => {
    const { container, unmount } = render(<QuoteForm />);
    const nameInput = container.querySelector('input[name="name"]') as HTMLInputElement;
    expect(nameInput).not.toBeNull();
    expect(hasTextColorClass(nameInput.className)).toBe(true);
    unmount();
  });

  it('phone input className contains a text color utility', () => {
    const { container, unmount } = render(<QuoteForm />);
    const phoneInput = container.querySelector('input[name="phone"]') as HTMLInputElement;
    expect(phoneInput).not.toBeNull();
    expect(hasTextColorClass(phoneInput.className)).toBe(true);
    unmount();
  });

  it('city select className contains a text color utility', () => {
    const { container, unmount } = render(<QuoteForm />);
    const citySelect = container.querySelector('select[name="city"]') as HTMLSelectElement;
    expect(citySelect).not.toBeNull();
    expect(hasTextColorClass(citySelect.className)).toBe(true);
    unmount();
  });

  it('budget input className contains a text color utility', () => {
    const { container, unmount } = render(<QuoteForm />);
    const budgetInput = container.querySelector('input[name="budget"]') as HTMLInputElement;
    expect(budgetInput).not.toBeNull();
    expect(hasTextColorClass(budgetInput.className)).toBe(true);
    unmount();
  });
});

// ─── Test 1e — PropertyCard Empty Images ─────────────────────────────────────

describe('Test 1e — PropertyCard Empty Images', () => {
  /**
   * Validates: Requirements 2.5, 2.7
   * When images: [], the rendered image src must NOT be '/images/placeholder.jpg'
   * and must be a Picsum URL.
   */
  it('renders a Picsum URL (not /images/placeholder.jpg) when images is empty', () => {
    const property: Property = { ...baseProperty, images: [] };
    const { container, unmount } = render(<PropertyCard property={property} />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.src).not.toContain('/images/placeholder.jpg');
    expect(img.src).toContain('picsum.photos');
    unmount();
  });

  it('rendered image src is a valid URL (starts with https://)', () => {
    const property: Property = { ...baseProperty, images: [] };
    const { container, unmount } = render(<PropertyCard property={property} />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.src).toMatch(/^https:\/\//);
    unmount();
  });
});

// ─── Test 1f — PropertyGallery Empty Images ───────────────────────────────────

describe('Test 1f — PropertyGallery Empty Images', () => {
  /**
   * Validates: Requirements 2.6, 2.7
   * When images: [], the rendered image src must be a valid, non-broken URL.
   */
  it('renders a valid URL (not /images/placeholder.jpg) when images is empty', () => {
    const { container, unmount } = render(<PropertyGallery images={[]} title="Test" />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.src).not.toContain('/images/placeholder.jpg');
    unmount();
  });

  it('rendered image src is a Picsum URL', () => {
    const { container, unmount } = render(<PropertyGallery images={[]} title="Test" />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.src).toContain('picsum.photos');
    unmount();
  });

  it('rendered image src starts with https://', () => {
    const { container, unmount } = render(<PropertyGallery images={[]} title="Test" />);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.src).toMatch(/^https:\/\//);
    unmount();
  });
});
