'use client';

import { useMarketplaceStore } from '@/store/useMarketplaceStore';
import DashboardTabs from '@/components/dashboard/DashboardTabs';

const DUMMY_USER = {
  name: 'Rahul Sharma',
  email: 'rahul.sharma@example.com',
  avatar: '',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function DashboardPage() {
  const storeUser = useMarketplaceStore((s) => s.user);
  const user = storeUser ?? DUMMY_USER;
  const initials = getInitials(user.name);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Profile card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex items-center gap-5">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div
              aria-label={`Avatar for ${user.name}`}
              className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0"
            >
              <span className="text-white text-xl font-semibold select-none">{initials}</span>
            </div>
          )}
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{user.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
          </div>
        </div>

        {/* Dashboard tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <DashboardTabs />
        </div>
      </div>
    </main>
  );
}
