'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import type {
  SearchFilters,
  SearchBarProps,
  Intent,
  PropertyType,
} from '@/types/index';
import { getAllLocalities } from '@/services/localityService';

// ─── Serialization helpers ────────────────────────────────────────────────────

export function serializeFilters(filters: Partial<SearchFilters>): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.intent) params.set('intent', filters.intent);
  if (filters.city) params.set('city', filters.city);
  if (filters.locality) params.set('locality', filters.locality);
  if (filters.minPrice != null) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice != null) params.set('maxPrice', String(filters.maxPrice));
  if (filters.bhk && filters.bhk.length > 0) params.set('bhk', filters.bhk.join(','));
  if (filters.type) params.set('type', filters.type);
  if (filters.sellerType) params.set('sellerType', filters.sellerType);
  if (filters.furnishing) params.set('furnishing', filters.furnishing);
  if (filters.possessionStatus) params.set('possessionStatus', filters.possessionStatus);
  if (filters.maxPropertyAge != null) params.set('maxPropertyAge', String(filters.maxPropertyAge));
  if (filters.sort) params.set('sort', filters.sort);

  return params;
}

export function parseFiltersFromParams(params: URLSearchParams): Partial<SearchFilters> {
  const filters: Partial<SearchFilters> = {};

  const intent = params.get('intent');
  if (intent) filters.intent = intent as Intent;

  const city = params.get('city');
  if (city) filters.city = city;

  const locality = params.get('locality');
  if (locality) filters.locality = locality;

  const minPrice = params.get('minPrice');
  if (minPrice !== null) filters.minPrice = Number(minPrice);

  const maxPrice = params.get('maxPrice');
  if (maxPrice !== null) filters.maxPrice = Number(maxPrice);

  const bhk = params.get('bhk');
  if (bhk) filters.bhk = bhk.split(',').map(Number).filter((n) => !isNaN(n));

  const type = params.get('type');
  if (type) filters.type = type as PropertyType;

  const sellerType = params.get('sellerType');
  if (sellerType) filters.sellerType = sellerType as SearchFilters['sellerType'];

  const furnishing = params.get('furnishing');
  if (furnishing) filters.furnishing = furnishing as SearchFilters['furnishing'];

  const possessionStatus = params.get('possessionStatus');
  if (possessionStatus) filters.possessionStatus = possessionStatus as SearchFilters['possessionStatus'];

  const maxPropertyAge = params.get('maxPropertyAge');
  if (maxPropertyAge !== null) filters.maxPropertyAge = Number(maxPropertyAge);

  const sort = params.get('sort');
  if (sort) filters.sort = sort as SearchFilters['sort'];

  return filters;
}

// ─── Default filter values ────────────────────────────────────────────────────

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

const INTENTS: Intent[] = ['Buy', 'Rent', 'New Projects', 'Commercial', 'PG'];
const BHK_OPTIONS = [1, 2, 3, 4, 5];
const PROPERTY_TYPES: PropertyType[] = ['Apartment', 'Villa', 'Plot', 'Commercial', 'PG'];

// ─── Component ────────────────────────────────────────────────────────────────

export default function SearchBar({ initialFilters, sticky, onSearch }: SearchBarProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<SearchFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  const [locationInput, setLocationInput] = useState(
    initialFilters?.locality || initialFilters?.city || ''
  );
  const [suggestions, setSuggestions] = useState<{ name: string; city: string }[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationChange = useCallback((value: string) => {
    setLocationInput(value);
    if (!value.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      setFilters((f) => ({ ...f, city: '', locality: '' }));
      return;
    }
    const lower = value.toLowerCase();
    const all = getAllLocalities();
    const matched = all
      .filter(
        (l) =>
          l.name.toLowerCase().includes(lower) ||
          l.city.toLowerCase().includes(lower)
      )
      .slice(0, 8)
      .map((l) => ({ name: l.name, city: l.city }));
    setSuggestions(matched);
    setShowDropdown(matched.length > 0);
  }, []);

  const handleSuggestionSelect = useCallback(
    (suggestion: { name: string; city: string }) => {
      setLocationInput(`${suggestion.name}, ${suggestion.city}`);
      setFilters((f) => ({ ...f, locality: suggestion.name, city: suggestion.city }));
      setShowDropdown(false);
    },
    []
  );

  const toggleBhk = useCallback((value: number) => {
    setFilters((f) => ({
      ...f,
      bhk: f.bhk.includes(value)
        ? f.bhk.filter((b) => b !== value)
        : [...f.bhk, value],
    }));
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSearch?.(filters);
      const params = serializeFilters(filters);
      router.push(`/properties?${params.toString()}`);
    },
    [filters, onSearch, router]
  );

  return (
    <div
      className={`bg-white rounded-xl shadow-lg p-4 w-full${sticky ? ' sticky top-0 z-40' : ''}`}
    >
      {/* Intent tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {INTENTS.map((intent) => (
          <button
            key={intent}
            type="button"
            onClick={() => setFilters((f) => ({ ...f, intent }))}
            className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              filters.intent === intent
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {intent}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* City / Locality autocomplete */}
        <div className="relative">
          <label htmlFor="sb-location" className="sr-only">
            City or Locality
          </label>
          <input
            id="sb-location"
            ref={inputRef}
            type="text"
            placeholder="Search city or locality…"
            value={locationInput}
            onChange={(e) => handleLocationChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          />
          {showDropdown && (
            <div
              ref={dropdownRef}
              role="listbox"
              className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  role="option"
                  aria-selected={false}
                  onMouseDown={() => handleSuggestionSelect(s)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 focus:outline-none focus-visible:bg-blue-50"
                >
                  <span className="font-medium">{s.name}</span>
                  <span className="text-gray-500 ml-1">— {s.city}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Budget range */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label htmlFor="sb-min-price" className="sr-only">
              Min Price
            </label>
            <input
              id="sb-min-price"
              type="number"
              placeholder="Min price (₹)"
              min={0}
              value={filters.minPrice ?? ''}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  minPrice: e.target.value === '' ? null : Number(e.target.value),
                }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="sb-max-price" className="sr-only">
              Max Price
            </label>
            <input
              id="sb-max-price"
              type="number"
              placeholder="Max price (₹)"
              min={0}
              value={filters.maxPrice ?? ''}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  maxPrice: e.target.value === '' ? null : Number(e.target.value),
                }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            />
          </div>
        </div>

        {/* BHK multi-select */}
        <fieldset>
          <legend className="text-xs font-medium text-gray-500 mb-1">BHK</legend>
          <div className="flex flex-wrap gap-2">
            {BHK_OPTIONS.map((b) => (
              <label
                key={b}
                className="flex items-center gap-1 cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={filters.bhk.includes(b)}
                  onChange={() => toggleBhk(b)}
                  className="accent-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500"
                />
                {b} BHK
              </label>
            ))}
          </div>
        </fieldset>

        {/* Property type + submit */}
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label htmlFor="sb-type" className="sr-only">
              Property Type
            </label>
            <select
              id="sb-type"
              value={filters.type ?? ''}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  type: (e.target.value as PropertyType) || null,
                }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <option value="">All Types</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Search size={16} />
            Search
          </button>
        </div>
      </form>
    </div>
  );
}
