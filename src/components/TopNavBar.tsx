"use client";

import Link from "next/link";
import { Search, X, Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useCommerce } from "@/components/CommerceProvider";
import type { Language } from "@/lib/commerce";

const navLinks = [
  { href: "/", labelKey: "home" },
  { href: "/catalogue", labelKey: "catalogue" },
  { href: "/battle-proven", labelKey: "battleProven" },
  { href: "/social-engagement", labelKey: "socialEngagement" },
  { href: "/our-story", labelKey: "ourStory" },
] as const;

export default function TopNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, t } = useCommerce();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);
  useEffect(() => setOpen(false), [pathname]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = search.trim();
    router.push(query ? `/catalogue?search=${encodeURIComponent(query)}` : "/catalogue");
    setOpen(false);
  }

  return (
    <header className="store-header" data-hydrated={hydrated}>
      <div className="store-header__inner">
        <Link className="store-header__brand" href="/" aria-label="DURHAIM home">
          {/* Exported Figma asset; its intrinsic whitespace is part of the desktop composition. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/storefront/figma/homepage/page-1/logo-1.png" alt="DURHAIM" />
        </Link>

        <nav className="store-header__nav" aria-label="Primary navigation">
          {navLinks.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined}>
                {t.nav[link.labelKey]}
              </Link>
            );
          })}
        </nav>

        <div className="store-header__tools">
          <form className="store-search" onSubmit={submitSearch} role="search">
            <label className="sr-only" htmlFor="catalogue-search-header">{t.nav.search}</label>
            <input
              id="catalogue-search-header"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t.nav.search.replace("...", "")}
            />
            <button type="submit" aria-label={t.common.searchCatalogue}>
              <Search aria-hidden="true" size={21} strokeWidth={1.6} />
            </button>
          </form>
          <div className="store-language" aria-label="Language">
            {(["en", "id"] as Language[]).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={language === option}
                onClick={() => setLanguage(option)}
              >
                {option}
              </button>
            ))}
          </div>
          <button
            className="store-menu-button"
            type="button"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((current) => !current)}
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="store-mobile-nav" id="mobile-navigation">
          <nav aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>{t.nav[link.labelKey]}</Link>
            ))}
          </nav>
          <form className="store-search" onSubmit={submitSearch} role="search">
            <label className="sr-only" htmlFor="catalogue-search-mobile">{t.nav.search}</label>
            <input
              id="catalogue-search-mobile"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t.nav.search.replace("...", "")}
            />
            <button type="submit" aria-label={t.common.searchCatalogue}>
              <Search aria-hidden="true" size={21} />
            </button>
          </form>
          <div className="store-language store-language--mobile" aria-label="Language">
            {(["en", "id"] as Language[]).map((option) => (
              <button key={option} type="button" aria-pressed={language === option} onClick={() => setLanguage(option)}>
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
