'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/catalogue', label: 'Catalogue' },
  { href: '/battle-proven', label: 'Battle Proven' },
  { href: '/social-engagement', label: 'Social Engagement' },
  { href: '/our-story', label: 'Our Story' },
];

export default function TopNavBar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="bg-tactical-black w-full top-0 sticky z-50 border-b border-surface-container-highest">
        <div className="flex justify-between items-center px-margin-edge py-stack-md max-w-[1440px] mx-auto">
          {/* Brand Logo */}
          <Link href="/" className="font-display-xl text-headline-lg text-stark-white tracking-tighter hover:text-signal-orange transition-colors duration-200 uppercase">
            DURHAIM
          </Link>

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex space-x-gutter items-center">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-label-caps text-label-caps uppercase transition-colors duration-200 ${
                    isActive
                      ? 'text-signal-orange border-b-2 border-signal-orange pb-2'
                      : 'text-stark-white opacity-80 hover:text-signal-orange'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Trailing Actions */}
          <div className="flex items-center space-x-stack-md">
            {/* Search Bar (Desktop) */}
            <div className="hidden md:flex items-center bg-charcoal-field border border-surface-container-highest rounded-none focus-within:border-signal-orange transition-colors duration-200">
              <span className="material-symbols-outlined text-stark-white opacity-60 p-2">search</span>
              <input
                className="bg-transparent border-none text-stark-white font-data-mono text-data-mono focus:ring-0 p-2 w-48 placeholder-stark-white placeholder-opacity-40"
                placeholder="Search..."
                type="text"
              />
            </div>
            <button className="text-stark-white hover:text-signal-orange transition-colors duration-200 active:scale-95">
              <span className="material-symbols-outlined">shopping_cart</span>
            </button>
            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-stark-white hover:text-signal-orange transition-colors duration-200 active:scale-95"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-tactical-black border-t border-surface-container-highest">
            <div className="flex flex-col px-margin-edge py-stack-md gap-stack-md">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`font-label-caps text-label-caps uppercase transition-colors duration-200 py-2 border-b border-surface-container-highest ${
                      isActive ? 'text-signal-orange' : 'text-stark-white opacity-80 hover:text-signal-orange'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
              {/* Mobile Search */}
              <div className="flex items-center bg-charcoal-field border border-surface-container-highest">
                <span className="material-symbols-outlined text-stark-white opacity-60 p-2">search</span>
                <input
                  className="bg-transparent border-none text-stark-white font-data-mono text-data-mono focus:ring-0 p-2 flex-1 placeholder-stark-white placeholder-opacity-40"
                  placeholder="Search..."
                  type="text"
                />
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
