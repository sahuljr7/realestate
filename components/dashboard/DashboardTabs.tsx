'use client';

import { useState, useMemo } from 'react';
import { Bookmark, Clock, Phone, Bell, X } from 'lucide-react';
import { useMarketplaceStore } from '@/store/useMarketplaceStore';
import { getAllProperties } from '@/services/propertyService';
import PropertyCard from '@/components/property/PropertyCard';
import type { Property } from '@/types/index';

type TabId = 'saved' | 'recent' | 'contacted' | 'alerts';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  { id: 'saved',     label: 'Saved Properties',    icon: <Bookmark size={16} /> },
  { id: 'recent',    label: 'Recently Viewed',      icon: <Clock size={16} /> },
  { id: 'contacted', label: 'Contacted Properties', icon: <Phone size={16} /> },
  { id: 'alerts',    label: 'Alerts',               icon: <Bell size={16} /> },
];

function resolveProperties(ids: string[], allProperties: Property[]): Property[] {
  return ids
    .map((id) => allProperties.find((p) => p.id === id))
    .filter((p): p is Property => p !== undefined);
}

export default function DashboardTabs() {
  const [activeTab, setActiveTab] = useState<TabId>('saved');

  const savedPropertyIds     = useMarketplaceStore((s) => s.savedPropertyIds);
  const viewHistory          = useMarketplaceStore((s) => s.viewHistory);
  const contactedPropertyIds = useMarketplaceStore((s) => s.contactedPropertyIds);
  const unsaveProperty       = useMarketplaceStore((s) => s.unsaveProperty);

  const allProperties = useMemo(() => getAllProperties(), []);

  const savedProperties     = useMemo(() => resolveProperties(savedPropertyIds, allProperties),     [savedPropertyIds, allProperties]);
  const recentProperties    = useMemo(() => resolveProperties(viewHistory, allProperties),          [viewHistory, allProperties]);
  const contactedProperties = useMemo(() => resolveProperties(contactedPropertyIds, allProperties), [contactedPropertyIds, allProperties]);

  function getTabProperties(): Property[] {
    switch (activeTab) {
      case 'saved':     return savedProperties;
      case 'recent':    return recentProperties;
      case 'contacted': return contactedProperties;
      default:          return [];
    }
  }

  const tabProperties = getTabProperties();

  return (
    <div className="w-full">
      {/* Tab bar */}
      <div className="flex overflow-x-auto border-b border-gray-200 gap-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-inset
              ${activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-6">
        {activeTab === 'alerts' ? (
          <EmptyState message="No alerts set up yet." />
        ) : tabProperties.length === 0 ? (
          <EmptyState message={getEmptyMessage(activeTab)} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tabProperties.map((property) => (
              <div key={property.id} className="relative">
                <PropertyCard
                  property={property}
                  isSaved={savedPropertyIds.includes(property.id)}
                  onSave={(id) => {
                    if (savedPropertyIds.includes(id)) unsaveProperty(id);
                  }}
                />
                {activeTab === 'saved' && (
                  <button
                    onClick={() => unsaveProperty(property.id)}
                    aria-label={`Remove ${property.title} from saved`}
                    className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded-md bg-white/90 text-red-500 text-xs font-medium shadow hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors"
                  >
                    <X size={12} />
                    Unsave
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <p className="text-base">{message}</p>
    </div>
  );
}

function getEmptyMessage(tab: TabId): string {
  switch (tab) {
    case 'saved':     return 'No saved properties yet. Save properties to see them here.';
    case 'recent':    return 'No recently viewed properties. Browse listings to see your history.';
    case 'contacted': return 'You haven\'t contacted any property owners yet.';
    default:          return 'Nothing here yet.';
  }
}
