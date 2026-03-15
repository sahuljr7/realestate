import type { Locality } from '@/types/index';
import localitiesData from '@/data/localities.json';

const localities: Locality[] = localitiesData as Locality[];

export function getAllLocalities(): Locality[] {
  return localities;
}

export function getLocalityBySlug(slug: string): Locality | undefined {
  return localities.find((l) => l.slug === slug);
}
