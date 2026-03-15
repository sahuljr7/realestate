'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Heart, PlusSquare, User } from 'lucide-react';

const navItems = [
  { label: 'Home', href: '/', Icon: Home },
  { label: 'Search', href: '/properties', Icon: Search },
  { label: 'Saved', href: '/dashboard', Icon: Heart },
  { label: 'Post Property', href: '/post-property', Icon: PlusSquare },
  { label: 'Profile', href: '/dashboard', Icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ label, href, Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={`${label}-${href}`}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isActive ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
              }`}
              aria-label={label}
            >
              <Icon size={22} />
              <span className="text-[10px] font-medium leading-tight">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
