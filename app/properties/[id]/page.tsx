'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Home, Layers, User, Calendar, Ruler, Heart } from 'lucide-react';
import { getPropertyById, getAllProperties } from '@/services/propertyService';
import { useMarketplaceStore } from '@/store/useMarketplaceStore';
import PropertyGallery from '@/components/property/PropertyGallery';
import EMICalculator from '@/components/tools/EMICalculator';
import ContactForm from '@/components/forms/ContactForm';
import PropertyCard from '@/components/property/PropertyCard';
import Badge from '@/components/ui/Badge';
import { formatCurrency, formatArea } from '@/lib/formatters';
import type { Property } from '@/types/index';

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null | undefined>(undefined);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);

  const { recordView, saveProperty, unsaveProperty, savedPropertyIds } = useMarketplaceStore();
  const isSaved = property ? savedPropertyIds.includes(property.id) : false;

  useEffect(() => {
    if (!id) return;
    const found = getPropertyById(id);
    setProperty(found ?? null);

    if (found) {
      recordView(found.id);
      const similar = getAllProperties()
        .filter((p) => p.city === found.city && p.type === found.type && p.id !== found.id)
        .slice(0, 4);
      setSimilarProperties(similar);
    }
  }, [id]);

  // Loading state
  if (property === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // Not found
  if (property === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <Home size={48} className="text-gray-300" />
        <h1 className="text-2xl font-bold text-gray-800">Property Not Found</h1>
        <p className="text-gray-500">The property you're looking for doesn't exist or has been removed.</p>
        <Link
          href="/properties"
          className="mt-2 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Browse Properties
        </Link>
      </div>
    );
  }

  const {
    title, price, area, bhk, type, possessionStatus, sellerType,
    amenities, description, location, city, locality, badges, images,
  } = property;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Main Content ── */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* Gallery */}
            <PropertyGallery images={images} title={title} />

            {/* Title + badges + save */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {badges.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {badges.map((b) => <Badge key={b} label={b} variant={b} />)}
                    </div>
                  )}
                  <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                  <p className="flex items-center gap-1 text-gray-500 mt-1 text-sm">
                    <MapPin size={14} /> {location}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="text-3xl font-bold text-blue-700">{formatCurrency(price)}</p>
                  <button
                    onClick={() => isSaved ? unsaveProperty(property.id) : saveProperty(property.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
                  >
                    <Heart size={16} className={isSaved ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                  </button>
                </div>
              </div>

              {/* Key details grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
                <DetailItem icon={<Ruler size={16} />} label="Area" value={formatArea(area)} />
                <DetailItem icon={<Home size={16} />} label="BHK" value={`${bhk} BHK`} />
                <DetailItem icon={<Layers size={16} />} label="Type" value={type} />
                <DetailItem icon={<Calendar size={16} />} label="Possession" value={possessionStatus} />
                <DetailItem icon={<User size={16} />} label="Seller Type" value={sellerType} />
                <DetailItem icon={<MapPin size={16} />} label="Locality" value={locality} />
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Description</h2>
              <p className="text-gray-600 leading-relaxed text-sm">{description}</p>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((a) => (
                    <span key={a} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Floor Plan placeholder */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Floor Plan</h2>
              <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                Floor plan image coming soon
              </div>
            </div>

            {/* Map placeholder */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Location Map</h2>
              <div className="h-56 bg-gray-100 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 text-sm">
                <MapPin size={32} className="text-gray-300" />
                <span>{locality}, {city}</span>
                <span className="text-xs">Map integration coming soon</span>
              </div>
            </div>

            {/* EMI Calculator */}
            <EMICalculator initialLoanAmount={price} />

            {/* Contact Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Contact Owner</h2>
              <ContactForm propertyId={property.id} />
            </div>
          </div>

          {/* ── Sidebar ── */}
          <aside className="w-full lg:w-80 xl:w-96 shrink-0 space-y-6">
            {/* Similar Properties */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Similar Properties</h2>
              {similarProperties.length === 0 ? (
                <p className="text-sm text-gray-400">No similar properties found.</p>
              ) : (
                <div className="space-y-4">
                  {similarProperties.map((p) => (
                    <Link key={p.id} href={`/properties/${p.id}`} className="block">
                      <PropertyCard
                        property={p}
                        isSaved={savedPropertyIds.includes(p.id)}
                        onSave={(pid) => savedPropertyIds.includes(pid) ? unsaveProperty(pid) : saveProperty(pid)}
                      />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-blue-500 mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );
}
