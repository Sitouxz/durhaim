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
  common: {
    exploreNow: string;
    viewCatalogue: string;
    openChannel: string;
    contactSupport: string;
    followSocialUpdates: string;
    verifySerial: string;
    priceRegion: string;
    openCart: string;
    searchCatalogue: string;
  };
  catalogue: {
    categoryLabels: {
      all: string;
      vest: string;
      pack: string;
      belt: string;
      accessories: string;
      uncategorized: string;
    };
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
    unableToLoad: string;
  };
  product: {
    enquire: string;
    back: string;
    enquiry: (name: string, slug: string) => string;
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
  serialChecker: {
    loading: string;
    prompt: string;
    scanPrompt: string;
    scanStarting: string;
    scanActive: string;
    scanDetected: string;
    scanUnsupported: string;
    scanBlocked: string;
    scanError: string;
    scanVideoLabel: string;
    scanQrCode: string;
    manualEntry: string;
    tryScanAgain: string;
    authentic: string;
    viewCertificate: string;
    notFound: string;
    revokedTitle: string;
    notRegistered: string;
    connectionError: string;
    instructions: string;
    verifying: string;
    verify: string;
    qrGuide: string;
  };
  verify: {
    title: string;
    intro: string;
    button: string;
    secureNotice: string;
    faqQuestion: string;
    faqAnswer: string;
    faqLocationQuestion: string;
    authenticityCertificate: string;
    officialRegistry: string;
    certifiedProduct: string;
    productNotFound: string;
    serialNumber: string;
    certificateId: string;
    registered: string;
    verificationCount: string;
    issued: string;
    authority: string;
    verified: string;
    supportNote: string;
    contactSupport: string;
    backHome: string;
    verifyAnother: string;
    status: {
      authentic: string;
      revoked: string;
      unverified: string;
      authenticHeadline: string;
      authenticBody: string;
      revokedHeadline: string;
      revokedBody: string;
      unverifiedHeadline: string;
      unverifiedBody: string;
    };
  };
  footer: {
    contacts: string;
    navigation: string;
    subscribe: string;
    newsletter: string;
    email: string;
    subscribed: string;
    failed: string;
    alwaysForward: string;
    contact: string;
    latestProjects: string;
    subscribeAria: string;
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
    common: {
      exploreNow: 'Explore Now',
      viewCatalogue: 'View Catalogue',
      openChannel: 'Open Channel',
      contactSupport: 'Contact Support',
      followSocialUpdates: 'Follow Social Updates',
      verifySerial: 'Verify a Serial',
      priceRegion: 'Price region',
      openCart: 'Open cart',
      searchCatalogue: 'Search catalogue',
    },
    catalogue: {
      categoryLabels: {
        all: 'All Gear',
        vest: 'Vest & Chestrig',
        pack: 'Pack & Pouches',
        belt: 'Belt',
        accessories: 'Accessories',
        uncategorized: 'Unassigned',
      },
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
      unableToLoad: 'Unable to load catalogue.',
    },
    product: {
      enquire: 'Enquire on WhatsApp',
      back: 'Back to Catalogue',
      enquiry: (name, slug) => `Hi Durhaim, I would like to ask about ${name}. Product URL: /catalogue/${slug}`,
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
    serialChecker: {
      loading: '...loading...',
      prompt: 'Enter serial number below',
      scanPrompt: 'Scan the QR code on your Durhaim label',
      scanStarting: 'Starting camera...',
      scanActive: 'Scanning QR code...',
      scanDetected: 'QR code detected. Verifying...',
      scanUnsupported: 'Camera scanning is not supported in this browser.',
      scanBlocked: 'Camera access is blocked. Allow camera access or type the serial manually.',
      scanError: 'Scanner error. Try again or type the serial manually.',
      scanVideoLabel: 'Durhaim QR code scanner camera preview',
      scanQrCode: 'SCAN QR CODE',
      manualEntry: 'TYPE SERIAL MANUALLY',
      tryScanAgain: 'TRY SCAN AGAIN',
      authentic: 'AUTHENTIC',
      viewCertificate: 'VIEW CERTIFICATE',
      notFound: 'SERIAL NOT FOUND',
      revokedTitle: 'SERIAL REVOKED',
      notRegistered: 'This serial number is not registered in our system.',
      connectionError: 'Connection error. Please try again.',
      instructions: 'Make sure the serial number is typed correctly, including any hyphens in the code, for example XXXX-XXXX-XXXX. Check the serial again before submitting. If you have trouble entering the code or see an error, contact Durhaim customer service.',
      verifying: 'VERIFYING...',
      verify: 'VERIFY SERIAL',
      qrGuide: 'Guidelines if you have a QR code',
    },
    verify: {
      title: 'Authenticity Checker',
      intro: "Enter your product's unique serial number below to verify its authenticity and view the digital certificate. Include any hyphens (e.g., DRH-XXXX-XXXX).",
      button: 'Verify Product',
      secureNotice: 'Secure system // do not share your serial code externally',
      faqQuestion: 'How do I verify a DURHAIM product?',
      faqAnswer: 'Enter the product serial number in the DURHAIM authenticity checker. The system confirms whether the serial is registered, active, or revoked.',
      faqLocationQuestion: 'Where is the DURHAIM authenticity checker?',
      authenticityCertificate: 'Authenticity Certificate',
      officialRegistry: 'Official Registry',
      certifiedProduct: 'Certified product',
      productNotFound: 'Product Not Found',
      serialNumber: 'Serial Number',
      certificateId: 'Certificate ID',
      registered: 'Registered',
      verificationCount: 'Verification Count',
      issued: 'Issued',
      authority: 'Authority',
      verified: 'Verified',
      supportNote: 'Match this serial with the label on your product. If anything looks different, contact Durhaim support before use.',
      contactSupport: 'Contact Support',
      backHome: 'Back to Home',
      verifyAnother: 'Verify another serial number',
      status: {
        authentic: 'AUTHENTIC',
        revoked: 'REVOKED',
        unverified: 'UNVERIFIED',
        authenticHeadline: 'Verified Authentic',
        authenticBody: 'This product serial is registered in the official DURHAIM verification system.',
        revokedHeadline: 'Certificate Revoked',
        revokedBody: 'This serial number exists but has been revoked by DURHAIM. Please contact support before using this product certificate.',
        unverifiedHeadline: 'Serial Not Registered',
        unverifiedBody: 'This serial number is not registered in the DURHAIM system. If you believe this is an error, please contact support.',
      },
    },
    footer: {
      contacts: 'Contacts',
      navigation: 'Navigation',
      subscribe: 'Subscribe',
      newsletter: 'Follow our newsletter to stay updated about Durhaim.',
      email: 'ENTER EMAIL',
      subscribed: 'Subscribed.',
      failed: 'Subscription failed.',
      alwaysForward: 'Always Forward',
      contact: 'Contact',
      latestProjects: 'Latest Projects',
      subscribeAria: 'Subscribe to newsletter',
    },
  },
  id: {
    nav: {
      home: 'Beranda',
      catalogue: 'Katalog',
      battleProven: 'Teruji Lapangan',
      socialEngagement: 'Media Sosial',
      ourStory: 'Cerita Kami',
      search: 'Cari...',
    },
    common: {
      exploreNow: 'Jelajahi',
      viewCatalogue: 'Lihat Katalog',
      openChannel: 'Buka Kanal',
      contactSupport: 'Hubungi Bantuan',
      followSocialUpdates: 'Ikuti Media Sosial',
      verifySerial: 'Verifikasi Serial',
      priceRegion: 'Wilayah harga',
      openCart: 'Buka keranjang',
      searchCatalogue: 'Cari katalog',
    },
    catalogue: {
      categoryLabels: {
        all: 'Semua Produk',
        vest: 'Vest & Chestrig',
        pack: 'Pack & Pouch',
        belt: 'Belt',
        accessories: 'Aksesori',
        uncategorized: 'Tanpa Kategori',
      },
      categories: 'Kategori Peralatan',
      allGear: 'Semua Produk',
      vests: 'Vest & Chestrig',
      packs: 'Pack & Pouches',
      belts: 'Belt',
      accessories: 'Aksesori',
      searchCatalog: 'Cari Katalog',
      keyword: 'Masukkan kata kunci',
      title: 'Arsenal Taktis',
      summary: (total) => `${total} PRODUK // TAHAN BENTURAN BERAT & MODULAR`,
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
      unableToLoad: 'Katalog belum dapat dimuat.',
    },
    product: {
      enquire: 'Tanya via WhatsApp',
      back: 'Kembali ke Katalog',
      enquiry: (name, slug) => `Halo Durhaim, saya ingin bertanya tentang ${name}. URL produk: /catalogue/${slug}`,
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
    serialChecker: {
      loading: '...memuat...',
      prompt: 'Masukkan nomor serial di bawah ini',
      scanPrompt: 'Pindai kode QR pada label Durhaim Anda',
      scanStarting: 'Menyalakan kamera...',
      scanActive: 'Memindai kode QR...',
      scanDetected: 'Kode QR terdeteksi. Memverifikasi...',
      scanUnsupported: 'Pemindaian kamera tidak didukung di browser ini.',
      scanBlocked: 'Akses kamera diblokir. Izinkan kamera atau masukkan serial manual.',
      scanError: 'Pemindai bermasalah. Coba lagi atau masukkan serial manual.',
      scanVideoLabel: 'Pratinjau kamera pemindai kode QR Durhaim',
      scanQrCode: 'PINDAI KODE QR',
      manualEntry: 'KETIK SERIAL MANUAL',
      tryScanAgain: 'COBA PINDAI LAGI',
      authentic: 'ASLI',
      viewCertificate: 'LIHAT SERTIFIKAT',
      notFound: 'SERIAL TIDAK DITEMUKAN',
      revokedTitle: 'SERIAL DICABUT',
      notRegistered: 'Nomor serial ini tidak terdaftar di sistem kami.',
      connectionError: 'Koneksi bermasalah. Silakan coba lagi.',
      instructions: 'Pastikan nomor serial diisi dengan benar dan sesuai, termasuk tanda - (strip) yang ada pada nomor serial, misalnya XXXX-XXXX-XXXX. Periksa kembali nomor serial sebelum dikirim. Jika mengalami kendala saat penginputan atau terjadi error, silakan hubungi customer service Durhaim.',
      verifying: 'MEMVERIFIKASI...',
      verify: 'VERIFIKASI SERIAL',
      qrGuide: 'Panduan jika Anda memiliki kode QR',
    },
    verify: {
      title: 'Pemeriksa Keaslian',
      intro: 'Masukkan nomor serial unik produk Anda untuk memverifikasi keaslian dan melihat sertifikat digital. Sertakan tanda strip jika ada, contoh DRH-XXXX-XXXX.',
      button: 'Verifikasi Produk',
      secureNotice: 'Sistem aman // jangan bagikan kode serial Anda ke pihak lain',
      faqQuestion: 'Bagaimana cara memverifikasi produk DURHAIM?',
      faqAnswer: 'Masukkan nomor serial produk di pemeriksa keaslian DURHAIM. Sistem akan memastikan apakah serial terdaftar, aktif, atau dicabut.',
      faqLocationQuestion: 'Di mana pemeriksa keaslian DURHAIM?',
      authenticityCertificate: 'Sertifikat Keaslian',
      officialRegistry: 'Registri Resmi',
      certifiedProduct: 'Produk tersertifikasi',
      productNotFound: 'Produk Tidak Ditemukan',
      serialNumber: 'Nomor Serial',
      certificateId: 'ID Sertifikat',
      registered: 'Terdaftar',
      verificationCount: 'Jumlah Verifikasi',
      issued: 'Diterbitkan',
      authority: 'Otoritas',
      verified: 'Terverifikasi',
      supportNote: 'Cocokkan serial ini dengan label pada produk Anda. Jika ada perbedaan, hubungi bantuan Durhaim sebelum digunakan.',
      contactSupport: 'Hubungi Bantuan',
      backHome: 'Kembali ke Beranda',
      verifyAnother: 'Verifikasi nomor serial lain',
      status: {
        authentic: 'ASLI',
        revoked: 'DICABUT',
        unverified: 'BELUM TERVERIFIKASI',
        authenticHeadline: 'Keaslian Terverifikasi',
        authenticBody: 'Nomor serial produk ini terdaftar di sistem verifikasi resmi DURHAIM.',
        revokedHeadline: 'Sertifikat Dicabut',
        revokedBody: 'Nomor serial ini ada, tetapi telah dicabut oleh DURHAIM. Hubungi bantuan sebelum menggunakan sertifikat produk ini.',
        unverifiedHeadline: 'Serial Tidak Terdaftar',
        unverifiedBody: 'Nomor serial ini tidak terdaftar di sistem DURHAIM. Jika Anda yakin ini kesalahan, silakan hubungi bantuan.',
      },
    },
    footer: {
      contacts: 'Kontak',
      navigation: 'Navigasi',
      subscribe: 'Berlangganan',
      newsletter: 'Ikuti newsletter kami untuk mendapatkan kabar terbaru dari Durhaim.',
      email: 'MASUKKAN EMAIL',
      subscribed: 'Berhasil berlangganan.',
      failed: 'Gagal berlangganan.',
      alwaysForward: 'Selalu Maju',
      contact: 'Kontak',
      latestProjects: 'Proyek Terbaru',
      subscribeAria: 'Berlangganan newsletter',
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

type CommerceProviderProps = {
  children: React.ReactNode;
  initialLanguage?: Language;
  initialRegion?: RegionCode;
};

export function CommerceProvider({
  children,
  initialLanguage = 'en',
  initialRegion = 'GLOBAL',
}: CommerceProviderProps) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);
  const [region, setRegionState] = useState<RegionCode>(initialRegion);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryLanguage = params.get('lang');
    const storedLanguage = window.localStorage.getItem('durhaimLanguage');
    const storedRegion = window.localStorage.getItem('durhaimRegion') as RegionCode | null;
    const detectedRegion = storedRegion && regionConfigs[storedRegion] ? storedRegion : detectRegionFromBrowser();
    const detectedLanguage = queryLanguage
      ? normalizeLanguage(queryLanguage)
      : storedLanguage
        ? normalizeLanguage(storedLanguage)
        : detectedRegion === 'ID'
          ? 'id'
          : normalizeLanguage(navigator.language);

    setLanguageState(detectedLanguage);
    setRegionState(detectedRegion);
    document.documentElement.lang = detectedLanguage;
    if (queryLanguage) window.localStorage.setItem('durhaimLanguage', detectedLanguage);
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
