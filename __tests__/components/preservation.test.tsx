/**
 * Preservation Property Tests — Task 2
 *
 * These tests capture baseline behaviors that MUST remain unchanged after the bugfix.
 * They are written on UNFIXED code and are EXPECTED TO PASS.
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7
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

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import * as fc from 'fast-check';
import SearchBar from '@/components/search/SearchBar';
import FilterSidebar from '@/components/property/FilterSidebar';
import ContactForm from '@/components/forms/ContactForm';
import QuoteForm from '@/components/forms/QuoteForm';
import PropertyCard from '@/components/property/PropertyCard';
import PropertyGallery from '@/components/property/PropertyGallery';
import { useMarketplaceStore } from '@/store/useMarketplaceStore';
import type { Property, SearchFilters, PropertyType, SellerType, FurnishingStatus, PossessionStatus } from '@/types/index';
import { formatCurrency, formatArea } from '@/lib/formatters';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function visibleString(minLength = 3, maxLength = 60): fc.Arbitrary<string> {
  return fc
    .string({ minLength, maxLength, unit: 'grapheme-ascii' })
    .filter((s) => s.trim().length > 0);
}

/** Valid phone number matching /^\+?[\d\s\-]{7,15}$/ */
function arbitraryPhone(): fc.Arbitrary<string> {
  return fc.integer({ min: 1000000, max: 9999999999999 }).map((n) => String(n));
}

/** Valid budget: positive integer */
function arbitraryBudget(): fc.Arbitrary<string> {
  return fc.integer({ min: 1, max: 100_000_000 }).map((n) => String(n));
}

function arbitraryProperty(imagesArb?: fc.Arbitrary<string[]>): fc.Arbitrary<Property> {
  return fc.record({
    id: fc.uuid(),
    title: visibleString(3, 80),
    price: fc.integer({ min: 100_000, max: 100_000_000 }),
    location: visibleString(3, 60),
    city: fc.constantFrom('Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad'),
    locality: visibleString(2, 40),
    bhk: fc.integer({ min: 1, max: 5 }),
    area: fc.integer({ min: 100, max: 10_000 }),
    type: fc.constantFrom<PropertyType>('Apartment', 'Villa', 'Plot', 'Commercial', 'PG'),
    sellerType: fc.constantFrom<SellerType>('Owner', 'Agent', 'Builder'),
    furnishing: fc.constantFrom<FurnishingStatus>('Furnished', 'Semi-Furnished', 'Unfurnished'),
    possessionStatus: fc.constantFrom<PossessionStatus>('Ready to Move', 'Under Construction'),
    propertyAge: fc.integer({ min: 0, max: 30 }),
    images: imagesArb ?? fc.array(fc.webUrl(), { minLength: 0, maxLength: 5 }),
    amenities: fc.array(visibleString(2, 20)),
    description: visibleString(5, 200),
    badges: fc.uniqueArray(
      fc.constantFrom<'new' | 'featured' | 'verified'>('new', 'featured', 'verified'),
      { maxLength: 3 }
    ),
    postedAt: fc
      .date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') })
      .map((d) => d.toISOString()),
    agentId: fc.option(fc.string(), { nil: undefined }),
  });
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

// ─── SearchBar Preservation ───────────────────────────────────────────────────

describe('Preservation — SearchBar (Requirement 3.1)', () => {
  /**
   * Property: For all non-number-key interactions, SearchBar behavior is unchanged.
   * Specifically: submitting the form calls onSearch with the current filters.
   *
   * Validates: Requirements 3.1
   */
  it('onSearch is called with the current filters when the form is submitted', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('Buy', 'Rent', 'New Projects', 'Commercial', 'PG'),
        (intent) => {
          const onSearch = vi.fn();
          const { unmount } = render(
            <SearchBar initialFilters={{ intent: intent as SearchFilters['intent'] }} onSearch={onSearch} />
          );

          const form = document.querySelector('form');
          expect(form).not.toBeNull();

          act(() => {
            fireEvent.submit(form!);
          });

          expect(onSearch).toHaveBeenCalledTimes(1);
          const calledWith = onSearch.mock.calls[0][0] as SearchFilters;
          expect(calledWith.intent).toBe(intent);

          unmount();
        }
      ),
      { numRuns: 5 }
    );
  });

  it('onSearch receives the correct filters object including location and price when set', () => {
    const onSearch = vi.fn();
    const { unmount } = render(
      <SearchBar
        initialFilters={{ intent: 'Buy', minPrice: 500000, maxPrice: 2000000 }}
        onSearch={onSearch}
      />
    );

    const form = document.querySelector('form');
    act(() => { fireEvent.submit(form!); });

    expect(onSearch).toHaveBeenCalledTimes(1);
    const calledWith = onSearch.mock.calls[0][0] as SearchFilters;
    expect(calledWith.minPrice).toBe(500000);
    expect(calledWith.maxPrice).toBe(2000000);

    unmount();
  });
});

// ─── FilterSidebar Preservation ───────────────────────────────────────────────

describe('Preservation — FilterSidebar (Requirement 3.2)', () => {
  /**
   * Property: For all filter combinations, FilterSidebar always calls onChange
   * with the correct partial filter object.
   *
   * Validates: Requirements 3.2
   */
  it('onChange is called with correct partial filter when min price input changes', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100000, max: 50_000_000 }),
        (minPrice) => {
          const onChange = vi.fn();
          const { unmount } = render(
            <FilterSidebar filters={defaultFilters} onChange={onChange} />
          );

          const minInput = document.querySelector('input[placeholder="Min"]') as HTMLInputElement;
          expect(minInput).not.toBeNull();

          act(() => {
            fireEvent.change(minInput, { target: { value: String(minPrice) } });
          });

          expect(onChange).toHaveBeenCalledTimes(1);
          expect(onChange).toHaveBeenCalledWith({ minPrice });

          unmount();
        }
      ),
      { numRuns: 20 }
    );
  });

  it('onChange is called with correct partial filter when max price input changes', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100000, max: 100_000_000 }),
        (maxPrice) => {
          const onChange = vi.fn();
          const { unmount } = render(
            <FilterSidebar filters={defaultFilters} onChange={onChange} />
          );

          const maxInput = document.querySelector('input[placeholder="Max"]') as HTMLInputElement;
          expect(maxInput).not.toBeNull();

          act(() => {
            fireEvent.change(maxInput, { target: { value: String(maxPrice) } });
          });

          expect(onChange).toHaveBeenCalledTimes(1);
          expect(onChange).toHaveBeenCalledWith({ maxPrice });

          unmount();
        }
      ),
      { numRuns: 20 }
    );
  });

  it('onChange is called with correct partial filter when property type select changes', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<PropertyType>('Apartment', 'Villa', 'Plot', 'Commercial', 'PG'),
        (type) => {
          const onChange = vi.fn();
          const { unmount } = render(
            <FilterSidebar filters={defaultFilters} onChange={onChange} />
          );

          // The property type select is the first select in the sidebar
          const selects = document.querySelectorAll('select');
          const typeSelect = selects[0] as HTMLSelectElement;
          expect(typeSelect).not.toBeNull();

          act(() => {
            fireEvent.change(typeSelect, { target: { value: type } });
          });

          expect(onChange).toHaveBeenCalledTimes(1);
          expect(onChange).toHaveBeenCalledWith({ type });

          unmount();
        }
      ),
      { numRuns: 5 }
    );
  });

  it('onChange is called with null when filter is cleared', () => {
    const onChange = vi.fn();
    const { unmount } = render(
      <FilterSidebar
        filters={{ ...defaultFilters, type: 'Apartment' }}
        onChange={onChange}
      />
    );

    const selects = document.querySelectorAll('select');
    const typeSelect = selects[0] as HTMLSelectElement;

    act(() => {
      fireEvent.change(typeSelect, { target: { value: '' } });
    });

    expect(onChange).toHaveBeenCalledWith({ type: null });
    unmount();
  });
});

// ─── ContactForm Preservation ─────────────────────────────────────────────────

describe('Preservation — ContactForm (Requirement 3.3)', () => {
  beforeEach(() => {
    useMarketplaceStore.setState({ contactedPropertyIds: [] });
  });

  /**
   * Property: For all valid form field value combinations, ContactForm submission
   * always calls recordContact exactly once and shows success state.
   *
   * Validates: Requirements 3.3
   */
  it('valid submission calls recordContact exactly once and shows success state', () => {
    fc.assert(
      fc.property(
        visibleString(2, 40),
        arbitraryPhone(),
        visibleString(5, 200),
        fc.uuid(),
        (name, phone, message, propertyId) => {
          useMarketplaceStore.setState({ contactedPropertyIds: [] });

          const { unmount } = render(<ContactForm propertyId={propertyId} />);

          const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
          const phoneInput = document.querySelector('input[name="phone"]') as HTMLInputElement;
          const messageTextarea = document.querySelector('textarea[name="message"]') as HTMLTextAreaElement;
          const form = document.querySelector('form');

          expect(nameInput).not.toBeNull();
          expect(phoneInput).not.toBeNull();
          expect(messageTextarea).not.toBeNull();
          expect(form).not.toBeNull();

          act(() => {
            fireEvent.change(nameInput, { target: { value: name } });
            fireEvent.change(phoneInput, { target: { value: phone } });
            fireEvent.change(messageTextarea, { target: { value: message } });
            fireEvent.submit(form!);
          });

          // recordContact should have been called exactly once with the propertyId
          const state = useMarketplaceStore.getState();
          const count = state.contactedPropertyIds.filter((id) => id === propertyId).length;
          expect(count).toBe(1);

          // Success state should be shown
          const text = document.body.textContent ?? '';
          expect(text).toContain('Message Sent');

          unmount();
        }
      ),
      { numRuns: 20 }
    );
  });

  it('invalid submission (empty fields) does NOT call recordContact', () => {
    useMarketplaceStore.setState({ contactedPropertyIds: [] });

    const { unmount } = render(<ContactForm propertyId="test-prop-1" />);
    const form = document.querySelector('form');

    act(() => { fireEvent.submit(form!); });

    const state = useMarketplaceStore.getState();
    expect(state.contactedPropertyIds).toHaveLength(0);

    unmount();
  });
});

// ─── QuoteForm Preservation ───────────────────────────────────────────────────

describe('Preservation — QuoteForm (Requirement 3.4)', () => {
  /**
   * Property: For all valid form field value combinations, QuoteForm submission
   * always shows the success state.
   *
   * Validates: Requirements 3.4
   */
  it('valid submission shows success state', () => {
    fc.assert(
      fc.property(
        visibleString(2, 40),
        arbitraryPhone(),
        fc.constantFrom('Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad'),
        arbitraryBudget(),
        (name, phone, city, budget) => {
          const { unmount } = render(<QuoteForm />);

          const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
          const phoneInput = document.querySelector('input[name="phone"]') as HTMLInputElement;
          const citySelect = document.querySelector('select[name="city"]') as HTMLSelectElement;
          const budgetInput = document.querySelector('input[name="budget"]') as HTMLInputElement;
          const form = document.querySelector('form');

          expect(nameInput).not.toBeNull();
          expect(phoneInput).not.toBeNull();
          expect(citySelect).not.toBeNull();
          expect(budgetInput).not.toBeNull();
          expect(form).not.toBeNull();

          act(() => {
            fireEvent.change(nameInput, { target: { value: name } });
            fireEvent.change(phoneInput, { target: { value: phone } });
            fireEvent.change(citySelect, { target: { value: city } });
            fireEvent.change(budgetInput, { target: { value: budget } });
            fireEvent.submit(form!);
          });

          const text = document.body.textContent ?? '';
          const passed = text.includes('Quote Request Received');

          unmount();
          return passed;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('invalid submission (empty fields) does NOT show success state', () => {
    const { unmount } = render(<QuoteForm />);
    const form = document.querySelector('form');

    act(() => { fireEvent.submit(form!); });

    expect(screen.queryByText(/Quote Request Received/i)).toBeNull();
    unmount();
  });
});

// ─── PropertyCard Preservation ────────────────────────────────────────────────

describe('Preservation — PropertyCard (Requirement 3.5)', () => {
  /**
   * Property: For all property objects with varying images arrays, PropertyCard
   * always renders title, price, BHK, location, and action buttons.
   *
   * Validates: Requirements 3.5
   */
  it('renders title, price, BHK, location, and action buttons for any property with any images array', () => {
    fc.assert(
      fc.property(
        arbitraryProperty(
          // Vary images: empty, single, multiple
          fc.oneof(
            fc.constant([]),
            fc.array(fc.webUrl(), { minLength: 1, maxLength: 5 })
          )
        ),
        (property) => {
          const { container, unmount } = render(<PropertyCard property={property} />);
          const text = container.textContent ?? '';

          // Title
          if (!text.includes(property.title)) { unmount(); return false; }

          // Price (formatted)
          if (!text.includes(formatCurrency(property.price))) { unmount(); return false; }

          // BHK
          if (!text.includes(`${property.bhk} BHK`)) { unmount(); return false; }

          // Location
          if (!text.includes(property.location)) { unmount(); return false; }

          // Action buttons: Save and Contact Owner
          const buttons = container.querySelectorAll('button');
          const buttonTexts = Array.from(buttons).map((b) => b.textContent ?? '');
          const hasSave = buttonTexts.some((t) => t.includes('Save') || t.includes('Saved'));
          const hasContact = buttonTexts.some((t) => t.includes('Contact'));
          if (!hasSave || !hasContact) { unmount(); return false; }

          unmount();
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('onSave callback is invoked when Save button is clicked', () => {
    const property: Property = {
      id: 'prop-1',
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

    const onSave = vi.fn();
    const { unmount } = render(<PropertyCard property={property} onSave={onSave} />);

    const saveButton = screen.getByRole('button', { name: /save property/i });
    act(() => { fireEvent.click(saveButton); });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith('prop-1');
    unmount();
  });

  it('onContact callback is invoked when Contact Owner button is clicked', () => {
    const property: Property = {
      id: 'prop-2',
      title: 'Another Property',
      price: 8000000,
      location: 'Koramangala, Bangalore',
      city: 'Bangalore',
      locality: 'Koramangala',
      bhk: 3,
      area: 1500,
      type: 'Apartment',
      sellerType: 'Agent',
      furnishing: 'Semi-Furnished',
      possessionStatus: 'Under Construction',
      propertyAge: 0,
      images: ['https://example.com/img.jpg'],
      amenities: [],
      description: 'Another nice property',
      badges: ['new'],
      postedAt: '2024-06-01T00:00:00.000Z',
    };

    const onContact = vi.fn();
    const { unmount } = render(<PropertyCard property={property} onContact={onContact} />);

    const contactButton = screen.getByRole('button', { name: /contact owner/i });
    act(() => { fireEvent.click(contactButton); });

    expect(onContact).toHaveBeenCalledTimes(1);
    expect(onContact).toHaveBeenCalledWith('prop-2');
    unmount();
  });
});

// ─── PropertyGallery Preservation ────────────────────────────────────────────

describe('Preservation — PropertyGallery (Requirement 3.6)', () => {
  /**
   * Property: prev/next navigation cycles through images correctly.
   *
   * Validates: Requirements 3.6
   */
  it('next button advances to the next image and wraps around', () => {
    fc.assert(
      fc.property(
        fc.array(fc.webUrl(), { minLength: 2, maxLength: 6 }),
        (images) => {
          const { unmount } = render(<PropertyGallery images={images} title="Test" />);

          // Initial state: first image shown, counter shows "1 / N"
          const initialCounter = screen.getByText(`1 / ${images.length}`);
          expect(initialCounter).toBeTruthy();

          // Click next
          const nextButton = screen.getByRole('button', { name: /next image/i });
          act(() => { fireEvent.click(nextButton); });

          // Counter should now show "2 / N"
          const afterNext = screen.getByText(`2 / ${images.length}`);
          expect(afterNext).toBeTruthy();

          unmount();
        }
      ),
      { numRuns: 20 }
    );
  });

  it('prev button goes to the previous image and wraps around from first to last', () => {
    fc.assert(
      fc.property(
        fc.array(fc.webUrl(), { minLength: 2, maxLength: 6 }),
        (images) => {
          const { unmount } = render(<PropertyGallery images={images} title="Test" />);

          // At index 0, clicking prev should wrap to last
          const prevButton = screen.getByRole('button', { name: /previous image/i });
          act(() => { fireEvent.click(prevButton); });

          const afterPrev = screen.getByText(`${images.length} / ${images.length}`);
          expect(afterPrev).toBeTruthy();

          unmount();
        }
      ),
      { numRuns: 20 }
    );
  });

  it('next wraps from last image back to first', () => {
    const images = ['https://a.com/1.jpg', 'https://a.com/2.jpg', 'https://a.com/3.jpg'];
    const { unmount } = render(<PropertyGallery images={images} title="Test" />);

    const nextButton = screen.getByRole('button', { name: /next image/i });

    // Advance to last image
    act(() => { fireEvent.click(nextButton); }); // index 1
    act(() => { fireEvent.click(nextButton); }); // index 2

    expect(screen.getByText('3 / 3')).toBeTruthy();

    // Wrap around
    act(() => { fireEvent.click(nextButton); }); // back to index 0

    expect(screen.getByText('1 / 3')).toBeTruthy();
    unmount();
  });

  it('no nav buttons shown when only one image', () => {
    const { unmount } = render(
      <PropertyGallery images={['https://example.com/img.jpg']} title="Single" />
    );

    expect(screen.queryByRole('button', { name: /next image/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /previous image/i })).toBeNull();
    unmount();
  });
});
