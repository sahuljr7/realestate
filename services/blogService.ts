import type { Blog } from '@/types/index';
import blogsData from '@/data/blogs.json';

const blogs: Blog[] = blogsData as Blog[];

export function getAllBlogs(): Blog[] {
  return blogs;
}
