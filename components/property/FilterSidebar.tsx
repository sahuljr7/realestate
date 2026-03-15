'use client';

import { X } from 'lucide-react';
import type { FilterSidebarProps, PropertyType, SellerType, FurnishingStatus, PossessionStatus } from '@/types/index';

const BHK_OPTIONS = [1, 2, 3, 4, 5];

const PROPERTY_TYPES: PropertyType[] = ['Apartment', 'Villa', 'Plot', 'Commercial', 'PG'];
const SELLER_TYPES: SellerType[] = ['Owner', 'Agent', 'Builder'];
const FURNISHING_OPTIONS: FurnishingStatus[] = ['Furnished', 'Semi-Furnished', 'Unfurnished'];
const POSSESSION_OPTIONS: PossessionStatus[] = ['Ready to Move', 'Under Construction'];

export default function FilterSidebar({ filters, onChange, isOpen, onClose }: FilterSidebarProps) {
  const handleBhkChange = (bhk: number, checked: boolean) => {
    const current = filters.bhk ?? [];
    const updated = checked ? [...current, bhk] : current.filter((b) => b !== bhk);
    onChange({ bhk: updated });
  };

  const content = (
    <div className="flex flex-col gap-5 p-4">
      {/* Header (mobile only) */}
      <div className="flex items-center justify-between md:hidden">
        <h2 className="text-base font-semibold text-gray-900">Filters</h2>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close filters"
            className="p-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Price Range */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Price Range (₹)</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice ?? ''}
            onChange={(e) =>
              onChange({ minPrice: e.target.value ? Number(e.target.value) : null })
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice ?? ''}
            onChange={(e) =>
              onChange({ maxPrice: e.target.value ? Number(e.target.value) : null })
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </section>

      {/* BHK */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">BHK</h3>
        <div className="flex flex-wrap gap-2">
          {BHK_OPTIONS.map((bhk) => (
            <label key={bhk} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.bhk?.includes(bhk) ?? false}
                onChange={(e) => handleBhkChange(bhk, e.target.checked)}
                className="accent-blue-600 focus:ring-2 focus:ring-blue-400"
              />
              <span className="text-sm text-gray-700">{bhk} BHK</span>
            </label>
          ))}
        </div>
      </section>

      {/* Property Type */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Property Type</h3>
        <select
          value={filters.type ?? ''}
          onChange={(e) =>
            onChange({ type: (e.target.value as PropertyType) || null })
          }
          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">All Types</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </section>

      {/* Seller Type */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Posted By</h3>
        <select
          value={filters.sellerType ?? ''}
          onChange={(e) =>
            onChange({ sellerType: (e.target.value as SellerType) || null })
          }
          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">All</option>
          {SELLER_TYPES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </section>

      {/* Furnishing */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Furnishing</h3>
        <select
          value={filters.furnishing ?? ''}
          onChange={(e) =>
            onChange({ furnishing: (e.target.value as FurnishingStatus) || null })
          }
          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Any</option>
          {FURNISHING_OPTIONS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </section>

      {/* Property Age */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Max Property Age: {filters.maxPropertyAge != null ? `${filters.maxPropertyAge} yrs` : 'Any'}
        </h3>
        <input
          type="range"
          min={0}
          max={30}
          step={1}
          value={filters.maxPropertyAge ?? 30}
          onChange={(e) =>
            onChange({ maxPropertyAge: Number(e.target.value) === 30 ? null : Number(e.target.value) })
          }
          className="w-full accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0 yrs</span>
          <span>30 yrs</span>
        </div>
      </section>

      {/* Possession Status */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Possession Status</h3>
        <select
          value={filters.possessionStatus ?? ''}
          onChange={(e) =>
            onChange({ possessionStatus: (e.target.value as PossessionStatus) || null })
          }
          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Any</option>
          {POSSESSION_OPTIONS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </section>
    </div>
  );

  // Desktop: static sidebar
  // Mobile: slide-in drawer with overlay
  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:block w-64 shrink-0 bg-white rounded-xl shadow-sm border border-gray-100">
        {content}
      </aside>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Drawer */}
          <aside className="relative z-10 w-72 max-w-full bg-white h-full overflow-y-auto shadow-xl">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
