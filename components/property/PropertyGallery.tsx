'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PropertyGalleryProps {
  images: string[];
  title?: string;
}

export default function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [current, setCurrent] = useState(0);

  const list = images.length > 0 ? images : ['/images/placeholder.jpg'];
  const total = list.length;

  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/images/placeholder.jpg';
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-gray-100">
      {/* Image */}
      <img
        src={list[current]}
        alt={title ? `${title} — image ${current + 1}` : `Property image ${current + 1}`}
        className="h-72 w-full object-cover md:h-96"
        onError={handleImageError}
      />

      {/* Prev button */}
      {total > 1 && (
        <button
          onClick={prev}
          aria-label="Previous image"
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {/* Next button */}
      {total > 1 && (
        <button
          onClick={next}
          aria-label="Next image"
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {/* Index indicator */}
      {total > 1 && (
        <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          {current + 1} / {total}
        </div>
      )}
    </div>
  );
}
