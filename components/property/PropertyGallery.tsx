'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PropertyGalleryProps {
  images: string[];
  title?: string;
}

const FALLBACK_URL = 'https://picsum.photos/seed/gallery-fallback/800/600';

export default function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [current, setCurrent] = useState(0);
  const [imgSrc, setImgSrc] = useState(
    images.length > 0 ? images[0] : FALLBACK_URL
  );

  const list = images.length > 0 ? images : [FALLBACK_URL];
  const total = list.length;

  const prev = () => {
    const newIndex = (current - 1 + total) % total;
    setCurrent(newIndex);
    setImgSrc(list[newIndex]);
  };

  const next = () => {
    const newIndex = (current + 1) % total;
    setCurrent(newIndex);
    setImgSrc(list[newIndex]);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-gray-100">
      {/* Image */}
      <div className="relative h-72 w-full md:h-96">
        <Image
          src={imgSrc}
          alt={title ? `${title} — image ${current + 1}` : `Property image ${current + 1}`}
          fill
          className="object-cover"
          onError={() => setImgSrc(FALLBACK_URL)}
        />
      </div>

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
