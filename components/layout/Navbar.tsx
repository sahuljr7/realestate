'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Buy', href: '/properties?intent=Buy' },
  { label: 'Rent', href: '/properties?intent=Rent' },
  { label: 'New Projects', href: '/properties?intent=New+Projects' },
  { label: 'Post Property', href: '/post-property' },
  { label: 'Dashboard', href: '/dashboard' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            PropFind
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-blue-600 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden p-2 rounded text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4">
          <div className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block py-2 px-3 rounded text-gray-700 hover:text-blue-600 hover:bg-blue-50 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
