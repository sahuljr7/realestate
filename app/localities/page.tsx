'use client';

import { useRouter } from 'next/navigation';
import { useLocalities } from '@/hooks/useLocalities';
import LocalityCard from '@/components/locality/LocalityCard';
import Skeleton from '@/components/ui/Skeleton';

export default function LocalitiesPage() {
  const router = useRouter();
  const { localities, loading } = useLocalities();

  const handleClick = (slug: string) => {
    router.push(`/localities/${slug}`);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Localities</h1>
        <p className="text-gray-500 mb-8">
          Discover popular neighbourhoods and their price trends.
        </p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {localities.map((locality) => (
              <LocalityCard
                key={locality.id}
                locality={locality}
                onClick={handleClick}
              />
            ))}
          </div>
        )}

        {!loading && localities.length === 0 && (
          <p className="text-center text-gray-400 mt-16">No localities found.</p>
        )}
      </div>
    </main>
  );
}
