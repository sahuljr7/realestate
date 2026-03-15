'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getLocalityBySlug } from '@/services/localityService';
import { getPropertiesByLocality } from '@/services/propertyService';
import TrendChart from '@/components/locality/TrendChart';
import PropertyCard from '@/components/property/PropertyCard';
import { useMarketplaceStore } from '@/store/useMarketplaceStore';
import { formatCurrency } from '@/lib/formatters';

export default function LocalityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params.slug === 'string' ? params.slug : Array.isArray(params.slug) ? params.slug[0] : '';

  const locality = getLocalityBySlug(slug);
  const { saveProperty, unsaveProperty, savedPropertyIds } = useMarketplaceStore();

  if (!locality) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Not Found</h1>
        <p className="text-gray-500">The locality you are looking for does not exist.</p>
        <button
          onClick={() => router.push('/localities')}
          className="flex items-center gap-2 text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
        >
          <ArrowLeft size={16} />
          Back to Localities
        </button>
      </main>
    );
  }

  const properties = getPropertiesByLocality(locality.name);

  const TrendIcon =
    locality.trend === 'up' ? TrendingUp : locality.trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    locality.trend === 'up'
      ? 'text-green-500'
      : locality.trend === 'down'
      ? 'text-red-500'
      : 'text-gray-400';

  const handleSave = (id: string) => {
    if (savedPropertyIds.includes(id)) {
      unsaveProperty(id);
    } else {
      saveProperty(id);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back link */}
        <button
          onClick={() => router.push('/localities')}
          className="flex items-center gap-2 text-blue-600 hover:underline mb-6 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
        >
          <ArrowLeft size={16} />
          All Localities
        </button>

        {/* Locality header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{locality.name}</h1>
              <p className="text-gray-500 mt-1">{locality.city}</p>
            </div>
            <div className="flex items-center gap-2">
              <TrendIcon className={`h-6 w-6 ${trendColor}`} aria-label={`Trend: ${locality.trend}`} />
              <span className={`font-medium capitalize ${trendColor}`}>{locality.trend}</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Avg Price / sq ft</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {formatCurrency(locality.avgPricePerSqft)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Properties</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{locality.propertyCount}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Price Trend</p>
              <p className={`text-xl font-bold mt-1 capitalize ${trendColor}`}>{locality.trend}</p>
            </div>
          </div>
        </div>

        {/* Price history chart */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            12-Month Price Trend (₹/sq ft)
          </h2>
          <TrendChart
            data={locality.priceHistory}
            type="line"
            xKey="month"
            yKey="avgPrice"
            height={300}
          />
        </section>

        {/* Properties in this locality */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Properties in {locality.name}
          </h2>

          {properties.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <p className="text-gray-400 text-lg">No properties found in this locality.</p>
              <p className="text-gray-300 text-sm mt-2">Check back later for new listings.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isSaved={savedPropertyIds.includes(property.id)}
                  onSave={handleSave}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
