import type { Property } from '@/types/index';
import propertiesData from '@/data/properties.json';

// In-memory list — copy of imported data to support addProperty
let properties: Property[] = [...(propertiesData as Property[])];

export function getAllProperties(): Property[] {
  return properties;
}

export function getPropertyById(id: string): Property | undefined {
  return properties.find((p) => p.id === id);
}

export function getPropertiesByLocality(locality: string): Property[] {
  return properties.filter(
    (p) => p.locality.toLowerCase() === locality.toLowerCase()
  );
}

export function addProperty(p: Property): void {
  properties.push(p);
}
