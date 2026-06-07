'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCommerce } from '@/components/CommerceProvider';
import type { Language } from '@/lib/commerce';

const navLinks = [
  { href: '/', labelKey: 'home' },
  { href: '/catalogue', labelKey: 'catalogue' },
  { href: '/battle-proven', labelKey: 'battleProven' },
  { href: '/social-engagement', labelKey: 'socialEngagement' },
  { href: '/our-story', labelKey: 'ourStory' },
] as const;

export default function TopNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, t } = useCommerce();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState('');

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();
    router.push(query ? `/catalogue?search=${encodeURIComponent(query)}` : '/catalogue');
    setMobileMenuOpen(false);
  };

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
                  {t.nav[link.labelKey]}
                </Link>
              );
            })}
          </div>

          {/* Trailing Actions */}
          <div className="flex items-center space-x-stack-md">
            {/* Search Bar (Desktop) */}
            <form onSubmit={submitSearch} className="hidden md:flex items-center bg-charcoal-field border border-surface-container-highest rounded-none focus-within:border-signal-orange transition-colors duration-200">
              <span className="material-symbols-outlined text-stark-white opacity-60 p-2">search</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="bg-transparent border-none text-stark-white font-data-mono text-data-mono focus:ring-0 p-2 w-48 placeholder-stark-white placeholder-opacity-40"
                placeholder={t.nav.search}
                type="search"
              />
            </form>
            <div className="hidden items-center border border-surface-container-highest md:flex">
              {(['en', 'id'] as Language[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setLanguage(option)}
                  className={`px-2 py-1 font-data-mono text-data-mono uppercase ${language === option ? 'bg-signal-orange text-tactical-black' : 'text-stark-white hover:text-signal-orange'}`}
                >
                  {option}
                </button>
              ))}
            </div>
            <Link href="/cart" className="text-stark-white hover:text-signal-orange transition-colors duration-200 active:scale-95" aria-label={t.common.openCart}>
              <span className="material-symbols-outlined">shopping_cart</span>
            </Link>
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
                    {t.nav[link.labelKey]}
                  </Link>
                );
              })}
              <div className="grid grid-cols-2 gap-2">
                {(['en', 'id'] as Language[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setLanguage(option)}
                    className={`border border-surface-container-highest px-3 py-2 font-label-caps uppercase ${language === option ? 'bg-signal-orange text-tactical-black' : 'text-stark-white'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {/* Mobile Search */}
              <form onSubmit={submitSearch} className="flex items-center bg-charcoal-field border border-surface-container-highest">
                <span className="material-symbols-outlined text-stark-white opacity-60 p-2">search</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="bg-transparent border-none text-stark-white font-data-mono text-data-mono focus:ring-0 p-2 flex-1 placeholder-stark-white placeholder-opacity-40"
                  placeholder={t.nav.search}
                  type="search"
                />
              </form>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
