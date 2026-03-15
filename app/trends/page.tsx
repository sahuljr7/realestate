'use client';

import { useState, useMemo } from 'react';
import { getAllLocalities } from '@/services/localityService';
import { getAllProperties } from '@/services/propertyService';
import TrendChart from '@/components/locality/TrendChart';
import type { PropertyType } from '@/types/index';

// Derive unique cities from localities data
const allLocalities = getAllLocalities();
const allProperties = getAllProperties();

const uniqueCities = Array.from(new Set(allLocalities.map((l) => l.city))).sort();

// Compute avg price/sqft per property type for the bar chart
const PROPERTY_TYPES: PropertyType[] = ['Apartment', 'Villa', 'Plot', 'Commercial', 'PG'];

function computeAvgPriceByType() {
  return PROPERTY_TYPES.map((type) => {
    const props = allProperties.filter((p) => p.type === type);
    if (props.length === 0) return { type, avgPrice: 0 };
    const avg = Math.round(
      props.reduce((sum, p) => sum + p.price / p.area, 0) / props.length
    );
    return { type, avgPrice: avg };
  }).filter((d) => d.avgPrice > 0);
}

const priceByTypeData = computeAvgPriceByType();

export default function TrendsPage() {
  const [selectedCity, setSelectedCity] = useState<string>(uniqueCities[0] ?? '');
  const [selectedLocalities, setSelectedLocalities] = useState<string[]>([]);

  // Localities for the selected city
  const cityLocalities = useMemo(
    () => allLocalities.filter((l) => l.city === selectedCity),
    [selectedCity]
  );

  // Reset locality selection when city changes
  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setSelectedLocalities([]);
  };

  // Toggle locality selection — enforce max 3
  const handleLocalityToggle = (name: string) => {
    setSelectedLocalities((prev) => {
      if (prev.includes(name)) {
        return prev.filter((n) => n !== name);
      }
      // Reject 4th selection
      if (prev.length >= 3) return prev;
      return [...prev, name];
    });
  };

  // Merge priceHistory for selected localities into a single dataset
  const mergedLineData = useMemo(() => {
    const active =
      selectedLocalities.length > 0
        ? cityLocalities.filter((l) => selectedLocalities.includes(l.name))
        : cityLocalities.slice(0, 1);

    if (active.length === 0) return [];

    // Use the first locality's months as the base
    return active[0].priceHistory.map((point, idx) => {
      const entry: Record<string, string | number> = { month: point.month };
      for (const loc of active) {
        entry[loc.name] = loc.priceHistory[idx]?.avgPrice ?? 0;
      }
      return entry;
    });
  }, [selectedLocalities, cityLocalities]);

  const activeLocalityNames = useMemo(() => {
    if (selectedLocalities.length > 0) return selectedLocalities;
    return cityLocalities.slice(0, 1).map((l) => l.name);
  }, [selectedLocalities, cityLocalities]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Price Trends</h1>
      <p className="text-gray-500 mb-8">
        Explore historical price trends and compare localities side by side.
      </p>

      {/* City Selector */}
      <section className="mb-8">
        <label htmlFor="city-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select City
        </label>
        <select
          id="city-select"
          value={selectedCity}
          onChange={(e) => handleCityChange(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {uniqueCities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </section>

      {/* Locality Multi-Select (max 3) */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Compare Localities</h2>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            Select up to 3
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          {cityLocalities.map((loc) => {
            const isSelected = selectedLocalities.includes(loc.name);
            const isDisabled = !isSelected && selectedLocalities.length >= 3;
            return (
              <label
                key={loc.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : isDisabled
                    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={isDisabled}
                  onChange={() => !isDisabled && handleLocalityToggle(loc.name)}
                  className="sr-only"
                />
                <span className="text-sm font-medium">{loc.name}</span>
              </label>
            );
          })}
        </div>
        {selectedLocalities.length === 3 && (
          <p className="mt-2 text-xs text-amber-600">
            Maximum 3 localities selected. Deselect one to add another.
          </p>
        )}
      </section>

      {/* Line Chart — price trends over time */}
      <section className="mb-10 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">
          Average Price / sq ft Over Time
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          {activeLocalityNames.join(', ')} — {selectedCity}
        </p>
        {mergedLineData.length > 0 ? (
          <TrendChart
            data={mergedLineData as any}
            type="line"
            xKey="month"
            yKey={activeLocalityNames[0]}
            localities={activeLocalityNames}
            height={320}
          />
        ) : (
          <p className="text-gray-400 text-sm">No data available for this city.</p>
        )}
      </section>

      {/* Bar Chart — avg price/sqft by property type */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">
          Avg Price / sq ft by Property Type
        </h2>
        <p className="text-sm text-gray-500 mb-4">Across all cities</p>
        <TrendChart
          data={priceByTypeData as any}
          type="bar"
          xKey="type"
          yKey="avgPrice"
          height={320}
        />
      </section>
    </main>
  );
}
