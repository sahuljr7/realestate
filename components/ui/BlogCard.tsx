'use client';

import { useState } from 'react';
import Badge from './Badge';
import { formatDate } from '@/lib/formatters';
import type { BlogCardProps } from '@/types/index';

const PLACEHOLDER = '/images/placeholder.jpg';

export default function BlogCard({ blog }: BlogCardProps) {
  const [imgSrc, setImgSrc] = useState(blog.image || PLACEHOLDER);

  return (
    <article className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-48 bg-gray-100">
        <img
          src={imgSrc}
          alt={blog.title}
          className="w-full h-full object-cover"
          onError={() => setImgSrc(PLACEHOLDER)}
        />
      </div>
      <div className="p-4 flex flex-col gap-2">
        <Badge label={blog.category} variant="new" />
        <h3 className="text-base font-semibold text-gray-900 leading-snug">
          {blog.title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2">{blog.excerpt}</p>
        <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
          <span>{blog.author}</span>
          <span>{formatDate(blog.publishedAt)}</span>
        </div>
      </div>
    </article>
  );
}
