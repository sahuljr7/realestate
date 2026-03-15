import type { Property, SearchFilters, SortOption } from '@/types/index';

export function filterProperties(
  properties: Property[],
  filters: Partial<SearchFilters>
): Property[] {
  return properties.filter((p) => {
    if (filters.city && p.city.toLowerCase() !== filters.city.toLowerCase()) return false;
    if (filters.locality && p.locality.toLowerCase() !== filters.locality.toLowerCase()) return false;
    if (filters.minPrice != null && p.price < filters.minPrice) return false;
    if (filters.maxPrice != null && p.price > filters.maxPrice) return false;
    if (filters.bhk?.length && !filters.bhk.includes(p.bhk)) return false;
    if (filters.type && p.type !== filters.type) return false;
    if (filters.sellerType && p.sellerType !== filters.sellerType) return false;
    if (filters.furnishing && p.furnishing !== filters.furnishing) return false;
    if (filters.possessionStatus && p.possessionStatus !== filters.possessionStatus) return false;
    if (filters.maxPropertyAge != null && p.propertyAge > filters.maxPropertyAge) return false;
    return true;
  });
}

export function sortProperties(
  properties: Property[],
  sort: SortOption
): Property[] {
  const copy = [...properties];
  switch (sort) {
    case 'price_asc':  return copy.sort((a, b) => a.price - b.price);
    case 'price_desc': return copy.sort((a, b) => b.price - a.price);
    case 'newest':     return copy.sort((a, b) =>
      new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
    default:           return copy; // relevance = original order
  }
}

export function paginateProperties(
  properties: Property[],
  page: number,
  pageSize = 12
): Property[] {
  const start = (page - 1) * pageSize;
  return properties.slice(start, start + pageSize);
}
