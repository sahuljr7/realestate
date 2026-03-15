'use client';

import { useState } from 'react';
import { getAllLocalities } from '@/services/localityService';
import type { Locality } from '@/types/index';

export function useLocalities(): {
  localities: Locality[];
  loading: boolean;
} {
  const [loading] = useState(false);
  const localities = getAllLocalities();

  return { localities, loading };
}
