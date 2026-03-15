'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Heart, Phone } from 'lucide-react';
import type { PropertyCardProps } from '@/types/index';
import { formatCurrency, formatArea } from '@/lib/formatters';
import Badge from '@/components/ui/Badge';

export default function PropertyCard({ property, onSave, onContact, isSaved }: PropertyCardProps) {
  const { id, title, price, area, location, bhk, possessionStatus, badges, images } = property;

  const [imgSrc, setImgSrc] = useState(
    images?.[0] || `https://picsum.photos/seed/${id}/800/600`
  );

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:scale-[1.02] hover:shadow-lg transition-all cursor-pointer">
      {/* Image */}
      <div className="relative h-48 w-full bg-gray-100">
        <Image
          src={imgSrc}
          alt={title}
          fill
          className="object-cover"
          onError={() => setImgSrc(`https://picsum.photos/seed/fallback/800/600`)}
        />
        {/* Badges overlay */}
        {badges.length > 0 && (
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {badges.map((badge) => (
              <Badge key={badge} label={badge} variant={badge} />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mt-1">{title}</h3>

        {/* Price */}
        <p className="text-lg font-bold text-blue-700 mt-1">{formatCurrency(price)}</p>

        {/* Meta row: area, BHK, possession */}
        <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-600">
          <span>{formatArea(area)}</span>
          <span className="text-gray-300">•</span>
          <span>{bhk} BHK</span>
          <span className="text-gray-300">•</span>
          <span>{possessionStatus}</span>
        </div>

        {/* Location */}
        <p className="text-sm text-gray-500 mt-1 truncate">{location}</p>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onSave?.(id)}
            aria-label={isSaved ? 'Unsave property' : 'Save property'}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
          >
            <Heart
              size={16}
              className={isSaved ? 'fill-red-500 text-red-500' : 'text-gray-400'}
            />
            <span className="text-gray-600">{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={() => onContact?.(id)}
            aria-label="Contact owner"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors flex-1 justify-center"
          >
            <Phone size={16} />
            <span>Contact Owner</span>
          </button>
        </div>
      </div>
    </div>
  );
}
