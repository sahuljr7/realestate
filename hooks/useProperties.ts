'use client';

import { useState, useEffect } from 'react';
import { getAllProperties } from '@/services/propertyService';
import { filterProperties, sortProperties, paginateProperties } from '@/lib/filters';
import type { SearchFilters, Property } from '@/types/index';

const PAGE_SIZE = 12;

export function useProperties(filters?: Partial<SearchFilters>): {
  properties: Property[];
  total: number;
  page: number;
  setPage: (p: number) => void;
  loading: boolean;
} {
  const [page, setPage] = useState(1);
  const [loading] = useState(false);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  const all = getAllProperties();
  const filtered = filterProperties(all, filters ?? {});
  const sorted = sortProperties(filtered, filters?.sort ?? 'relevance');
  const paginated = paginateProperties(sorted, page, PAGE_SIZE);

  return {
    properties: paginated,
    total: filtered.length,
    page,
    setPage,
    loading,
  };
}
