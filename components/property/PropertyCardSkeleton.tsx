import Skeleton from '@/components/ui/Skeleton';

export default function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md">
      {/* Image area */}
      <Skeleton className="h-48 w-full" />

      <div className="p-4">
        {/* Title */}
        <Skeleton className="h-5 w-3/4 mt-3" />

        {/* Price */}
        <Skeleton className="h-6 w-1/2 mt-2" />

        {/* Meta row */}
        <Skeleton className="h-4 w-full mt-2" />
      </div>
    </div>
  );
}
