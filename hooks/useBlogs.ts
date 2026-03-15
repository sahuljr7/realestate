'use client';

import { useState } from 'react';
import { getAllBlogs } from '@/services/blogService';
import type { Blog } from '@/types/index';

export function useBlogs(): {
  blogs: Blog[];
  loading: boolean;
} {
  const [loading] = useState(false);
  const blogs = getAllBlogs();

  return { blogs, loading };
}
