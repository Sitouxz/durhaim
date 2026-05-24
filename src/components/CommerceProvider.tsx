'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  detectRegionFromBrowser,
  formatRegionalPrice,
  normalizeLanguage,
  regionConfigs,
  type Language,
  type RegionCode,
  type RegionalPrices,
} from '@/lib/commerce';

type Dictionary = {
  nav: {
    home: string;
    catalogue: string;
    battleProven: string;
    socialEngagement: string;
    ourStory: string;
    search: string;
  };
  catalogue: {
    categories: string;
    allGear: string;
    vests: string;
    packs: string;
    belts: string;
    accessories: string;
    searchCatalog: string;
    keyword: string;
    title: string;
    summary: (total: number) => string;
    sortBy: string;
    newest: string;
    oldest: string;
    priceHigh: string;
    priceLow: string;
    nameAz: string;
    nameZa: string;
    loading: string;
    empty: string;
    viewDetails: string;
  };
  product: {
    enquire: string;
    back: string;
  };
  cart: {
    title: string;
    intro: string;
    empty: string;
    view: string;
    send: string;
    browse: string;
    clear: string;
    added: string;
    add: string;
    enquiry: (names: string) => string;
    genericEnquiry: string;
  };
};

export const dictionaries: Record<Language, Dictionary> = {
  en: {
    nav: {
      home: 'Home',
      catalogue: 'Catalogue',
      battleProven: 'Battle Proven',
      socialEngagement: 'Social Engagement',
      ourStory: 'Our Story',
      search: 'Search...',
    },
    catalogue: {
      categories: 'Equipment Categories',
      allGear: 'All Gear',
      vests: 'Vests & Chestrig',
      packs: 'Packs & Pouches',
      belts: 'Belts',
      accessories: 'Accessories',
      searchCatalog: 'Search Catalog',
      keyword: 'Enter keyword',
      title: 'Tactical Arsenal',
      summary: (total) => `${total} ITEMS // DURABILITY HARD IMPACT & MODULAR`,
      sortBy: 'Sort by:',
      newest: 'New',
      oldest: 'Old',
      priceHigh: 'Price High',
      priceLow: 'Price Low',
      nameAz: 'A-Z',
      nameZa: 'Z-A',
      loading: 'Loading catalogue...',
      empty: 'No products match this filter.',
      viewDetails: 'View Details',
    },
    product: {
      enquire: 'Enquire on WhatsApp',
      back: 'Back to Catalogue',
    },
    cart: {
      title: 'Enquiry Cart',
      intro: 'Collect products from catalogue detail pages and send them to Durhaim in one WhatsApp enquiry.',
      empty: 'Your enquiry cart is empty.',
      view: 'View',
      send: 'Send WhatsApp Enquiry',
      browse: 'Browse Catalogue',
      clear: 'Clear',
      added: 'Added to Enquiry Cart',
      add: 'Add to Enquiry Cart',
      enquiry: (names) => `Hi Durhaim, I would like to ask about: ${names}`,
      genericEnquiry: 'Hi Durhaim, I would like to ask about your products.',
    },
  },
  id: {
    nav: {
      home: 'Beranda',
      catalogue: 'Katalog',
      battleProven: 'Teruji Lapangan',
      socialEngagement: 'Kegiatan Sosial',
      ourStory: 'Cerita Kami',
      search: 'Cari...',
    },
    catalogue: {
      categories: 'Kategori Peralatan',
      allGear: 'Semua Produk',
      vests: 'Vest & Chestrig',
      packs: 'Pack & Pouches',
      belts: 'Belt',
      accessories: 'Aksesori',
      searchCatalog: 'Cari Katalog',
      keyword: 'Masukkan kata kunci',
      title: 'Arsenal Taktis',
      summary: (total) => `${total} PRODUK // DURABILITY HARD IMPACT & MODULAR`,
      sortBy: 'Urutkan:',
      newest: 'Baru',
      oldest: 'Lama',
      priceHigh: 'Harga Tinggi',
      priceLow: 'Harga Rendah',
      nameAz: 'A-Z',
      nameZa: 'Z-A',
      loading: 'Memuat katalog...',
      empty: 'Tidak ada produk yang cocok.',
      viewDetails: 'Lihat Detail',
    },
    product: {
      enquire: 'Tanya via WhatsApp',
      back: 'Kembali ke Katalog',
    },
    cart: {
      title: 'Keranjang Pertanyaan',
      intro: 'Kumpulkan produk dari halaman detail lalu kirim ke Durhaim dalam satu pertanyaan WhatsApp.',
      empty: 'Keranjang pertanyaan masih kosong.',
      view: 'Lihat',
      send: 'Kirim Pertanyaan WhatsApp',
      browse: 'Lihat Katalog',
      clear: 'Bersihkan',
      added: 'Ditambahkan ke Keranjang',
      add: 'Tambah ke Keranjang',
      enquiry: (names) => `Halo Durhaim, saya ingin bertanya tentang: ${names}`,
      genericEnquiry: 'Halo Durhaim, saya ingin bertanya tentang produk Durhaim.',
    },
  },
};

type CommerceContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  region: RegionCode;
  setRegion: (region: RegionCode) => void;
  t: Dictionary;
  formatPrice: (basePrice: number, regionalPrices?: RegionalPrices) => string;
};

const CommerceContext = createContext<CommerceContextValue | null>(null);

export function CommerceProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [region, setRegionState] = useState<RegionCode>('GLOBAL');

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem('durhaimLanguage');
    const storedRegion = window.localStorage.getItem('durhaimRegion') as RegionCode | null;

    setLanguageState(normalizeLanguage(storedLanguage || navigator.language));
    setRegionState(storedRegion && regionConfigs[storedRegion] ? storedRegion : detectRegionFromBrowser());
  }, []);

  const value = useMemo<CommerceContextValue>(() => ({
    language,
    setLanguage: (nextLanguage) => {
      setLanguageState(nextLanguage);
      window.localStorage.setItem('durhaimLanguage', nextLanguage);
      document.documentElement.lang = nextLanguage;
    },
    region,
    setRegion: (nextRegion) => {
      setRegionState(nextRegion);
      window.localStorage.setItem('durhaimRegion', nextRegion);
    },
    t: dictionaries[language],
    formatPrice: (basePrice, regionalPrices) => formatRegionalPrice(basePrice, regionalPrices, region),
  }), [language, region]);

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
}

export function useCommerce() {
  const context = useContext(CommerceContext);
  if (!context) throw new Error('useCommerce must be used inside CommerceProvider.');
  return context;
}
