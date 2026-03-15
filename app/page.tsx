'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/search/SearchBar';
import PropertyCard from '@/components/property/PropertyCard';
import PropertyCardSkeleton from '@/components/property/PropertyCardSkeleton';
import LocalityCard from '@/components/locality/LocalityCard';
import BlogCard from '@/components/ui/BlogCard';
import { useProperties } from '@/hooks/useProperties';
import { useLocalities } from '@/hooks/useLocalities';
import { useBlogs } from '@/hooks/useBlogs';
import { useMarketplaceStore } from '@/store/useMarketplaceStore';

const FEATURED_LIMIT = 6;
const LOCALITIES_LIMIT = 8;
const BLOGS_LIMIT = 6;

export default function HomePage() {
  const router = useRouter();
  const { saveProperty, recordContact, savedPropertyIds } = useMarketplaceStore();

  // Fetch all properties (no filters) then filter featured client-side
  const { properties: allProperties, loading: propertiesLoading } = useProperties();
  const { localities, loading: localitiesLoading } = useLocalities();
  const { blogs, loading: blogsLoading } = useBlogs();

  const featuredProperties = useMemo(
    () =>
      allProperties
        .filter((p) => p.badges.includes('featured'))
        .slice(0, FEATURED_LIMIT),
    [allProperties]
  );

  const displayedLocalities = useMemo(
    () => localities.slice(0, LOCALITIES_LIMIT),
    [localities]
  );

  const displayedBlogs = useMemo(
    () => blogs.slice(0, BLOGS_LIMIT),
    [blogs]
  );

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-blue-700 to-blue-900 text-white">
        <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-20" />
        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:py-24 flex flex-col items-center gap-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight">
              Find Your Dream Home
            </h1>
            <p className="mt-3 text-blue-100 text-base sm:text-lg max-w-xl mx-auto">
              Search from thousands of properties across India — buy, rent, or invest.
            </p>
          </div>

          {/* SearchBar — sticky on mobile (sticky prop) */}
          <div className="w-full max-w-3xl">
            <SearchBar sticky />
          </div>
        </div>
      </section>

      {/* ── Featured Properties ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Properties</h2>

        {propertiesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : featuredProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isSaved={savedPropertyIds.includes(property.id)}
                onSave={saveProperty}
                onContact={recordContact}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No featured properties available right now.</p>
        )}
      </section>

      {/* ── Popular Localities ────────────────────────────────────────────── */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Localities</h2>

          {localitiesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayedLocalities.map((locality) => (
                <LocalityCard
                  key={locality.id}
                  locality={locality}
                  onClick={(slug) => router.push(`/localities/${slug}`)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Latest Blog Posts ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest Blog Posts</h2>

        {blogsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedBlogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
