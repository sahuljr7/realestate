import type { ReactNode } from 'react';

// ─── Union Types ─────────────────────────────────────────────────────────────

export type Intent = 'Buy' | 'Rent' | 'New Projects' | 'Commercial' | 'PG';
export type PropertyType = 'Apartment' | 'Villa' | 'Plot' | 'Commercial' | 'PG';
export type SellerType = 'Owner' | 'Agent' | 'Builder';
export type FurnishingStatus = 'Furnished' | 'Semi-Furnished' | 'Unfurnished';
export type PossessionStatus = 'Ready to Move' | 'Under Construction';
export type BadgeVariant = 'new' | 'featured' | 'verified';
export type TrendDirection = 'up' | 'down' | 'stable';
export type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'newest';

// ─── Data Interfaces ──────────────────────────────────────────────────────────

export interface Property {
  id: string;
  title: string;
  price: number;            // in INR
  location: string;         // "Locality, City"
  city: string;
  locality: string;
  bhk: number;
  area: number;             // sq ft
  type: PropertyType;
  sellerType: SellerType;
  furnishing: FurnishingStatus;
  possessionStatus: PossessionStatus;
  propertyAge: number;      // years; 0 = new
  images: string[];         // URLs or local paths
  amenities: string[];
  description: string;
  badges: BadgeVariant[];
  postedAt: string;         // ISO date string
  agentId?: string;
}

export interface PricePoint {
  month: string;            // "Jan 2024"
  avgPrice: number;         // avg price/sqft
}

export interface Locality {
  id: string;
  slug: string;
  name: string;
  city: string;
  avgPricePerSqft: number;
  trend: TrendDirection;
  propertyCount: number;
  priceHistory: PricePoint[];  // 12 months
}

export interface Agent {
  id: string;
  name: string;
  phone: string;
  email: string;
  agency: string;
  rating: number;
  portfolioImage: string;
  specialty: string;
}

export interface Blog {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  publishedAt: string;
  category: string;
}

export interface SearchFilters {
  intent: Intent;
  city: string;
  locality: string;
  minPrice: number | null;
  maxPrice: number | null;
  bhk: number[];
  type: PropertyType | null;
  sellerType: SellerType | null;
  furnishing: FurnishingStatus | null;
  maxPropertyAge: number | null;
  possessionStatus: PossessionStatus | null;
  sort: SortOption;
}

// ─── Component Props Interfaces ───────────────────────────────────────────────

export interface PropertyCardProps {
  property: Property;
  onSave?: (id: string) => void;
  onContact?: (id: string) => void;
  isSaved?: boolean;
}

export interface FilterSidebarProps {
  filters: SearchFilters;
  onChange: (filters: Partial<SearchFilters>) => void;
  isOpen?: boolean;         // mobile drawer state
  onClose?: () => void;
}

export interface SearchBarProps {
  initialFilters?: Partial<SearchFilters>;
  sticky?: boolean;
  onSearch?: (filters: SearchFilters) => void;
}

export interface BadgeProps {
  label: string;
  variant: BadgeVariant;
}

export interface TrendChartProps {
  data: PricePoint[];
  localities?: string[];    // up to 3 for comparison
  type: 'line' | 'bar';
  xKey: string;
  yKey: string;
  height?: number;
}

export interface LocalityCardProps {
  locality: Locality;
  onClick?: (slug: string) => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export interface BlogCardProps {
  blog: Blog;
}
