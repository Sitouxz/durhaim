import Link from 'next/link';
import SerialChecker from '@/components/SerialChecker';

export const metadata = {
  title: 'DURHAIM - Tactical Gear',
  description: 'Battle-proven tactical gear. Vest & Chestrig, Pack & Pouches, Belt. Authenticity verification system.',
};

export default function HomePage() {
  return (
    <main className="flex-grow">
      {/* Verification Section */}
      <section
        className="py-section-gap px-margin-edge border-b border-surface-container-highest relative overflow-hidden flex justify-center items-center"
        style={{
          backgroundImage: `url('/images/11_Anaconda-MCB-1.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-tactical-black/80 via-tactical-black/60 to-background/95 z-0"></div>
        <div className="relative z-10 bg-charcoal-field/80 backdrop-blur-md border border-surface-container-highest p-8 max-w-2xl w-full text-center space-y-stack-lg shadow-2xl">
          <h2 className="font-headline-md text-headline-md text-stark-white drop-shadow-md">Input No Code Here</h2>
          <SerialChecker />
        </div>
      </section>

      {/* Product Categories */}
      <section
        className="relative py-section-gap border-b border-surface-container-highest"
        style={{
          backgroundImage: `url('/images/11_Anaconda-MCB-1.png')`,
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-background/95 z-0 backdrop-blur-[2px]"></div>
        <div className="relative z-10 flex flex-col gap-section-gap max-w-[1440px] mx-auto px-margin-edge">
          {/* VEST & CHESTRIG */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter items-center">
            <div className="order-2 md:order-1 flex justify-center bg-charcoal-field/60 backdrop-blur-sm border border-surface-container-highest p-8 aspect-[4/3] md:aspect-auto shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Vest and Chestrig Product Shot"
                className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] mix-blend-lighten max-h-[600px]"
                src="/images/29_VC-1.png"
              />
            </div>
            <div className="order-1 md:order-2 space-y-stack-md text-right drop-shadow-lg">
              <h3 className="font-display-xl text-headline-lg-mobile md:text-display-xl text-stark-white uppercase tracking-tighter">VEST &amp; CHESTRIG</h3>
              <p className="font-headline-md text-headline-md text-signal-orange uppercase">DURABILITY HARD IMPACT &amp; MODULAR</p>
              <div className="pt-stack-md">
                <Link
                  className="inline-block bg-signal-orange text-tactical-black font-label-caps text-label-caps py-3 px-8 hover:bg-stark-white transition-colors duration-200 shadow-lg"
                  href="/catalogue?category=vest"
                >
                  EXPLORE NOW
                </Link>
              </div>
            </div>
          </div>

          {/* PACK & POUCHES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter items-center">
            <div className="space-y-stack-md text-left drop-shadow-lg">
              <h3 className="font-display-xl text-headline-lg-mobile md:text-display-xl text-stark-white uppercase tracking-tighter">PACK &amp; POUCHES</h3>
              <p className="font-headline-md text-headline-md text-signal-orange uppercase">PERFECT FOR CARRYING YOUR EQUIPMENT</p>
              <div className="pt-stack-md">
                <Link
                  className="inline-block bg-signal-orange text-tactical-black font-label-caps text-label-caps py-3 px-8 hover:bg-stark-white transition-colors duration-200 shadow-lg"
                  href="/catalogue?category=pack"
                >
                  EXPLORE NOW
                </Link>
              </div>
            </div>
            <div className="flex justify-center bg-charcoal-field/60 backdrop-blur-sm border border-surface-container-highest p-8 aspect-[4/3] md:aspect-auto relative overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDEwaDQwdjJIMHptMCAyMGg0MHYySDB6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9zdmc+')] opacity-10"></div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Pack and Pouches Product Shot"
                className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] relative z-10 max-h-[600px]"
                src="/images/31_PP-1.png"
              />
            </div>
          </div>

          {/* BELT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter items-center">
            <div className="order-2 md:order-1 flex justify-center bg-charcoal-field/60 backdrop-blur-sm border border-surface-container-highest p-8 aspect-[4/3] md:aspect-auto shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Tactical Belt Product Shot"
                className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] max-h-[600px]"
                src="/images/33_B-1.png"
              />
            </div>
            <div className="order-1 md:order-2 space-y-stack-md text-right drop-shadow-lg">
              <h3 className="font-display-xl text-headline-lg-mobile md:text-display-xl text-stark-white uppercase tracking-tighter">BELT</h3>
              <p className="font-headline-md text-headline-md text-signal-orange uppercase">IT&apos;S ALL ABOUT THE WAIST</p>
              <div className="pt-stack-md">
                <Link
                  className="inline-block bg-signal-orange text-tactical-black font-label-caps text-label-caps py-3 px-8 hover:bg-stark-white transition-colors duration-200 shadow-lg"
                  href="/catalogue?category=belt"
                >
                  EXPLORE NOW
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid Showcase */}
      <section className="py-section-gap px-margin-edge border-y border-surface-container-highest bg-tactical-black relative">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter h-[600px]">
            {/* Item 1 */}
            <div className="group relative overflow-hidden border border-surface-container-highest flex items-end p-8 bg-charcoal-field">
              <div className="absolute inset-0 bg-gradient-to-t from-tactical-black via-transparent to-transparent z-10"></div>
              <div className="absolute inset-0 flex justify-center items-center p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Vest category display"
                  className="w-full h-full object-contain opacity-50 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 ease-out filter grayscale group-hover:grayscale-0"
                  src="/images/29_VC-1.png"
                />
              </div>
              <h4 className="relative z-20 font-display-xl text-headline-lg text-stark-white uppercase origin-bottom-left -rotate-90 translate-y-1/2 translate-x-4 opacity-80 group-hover:opacity-100 group-hover:text-signal-orange transition-colors">VEST CHESTRIG</h4>
            </div>
            {/* Item 2 */}
            <div className="group relative overflow-hidden border border-surface-container-highest flex items-end p-8 bg-charcoal-field">
              <div className="absolute inset-0 bg-gradient-to-t from-tactical-black via-transparent to-transparent z-10"></div>
              <div className="absolute inset-0 flex justify-center items-center p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Pack category display"
                  className="w-full h-full object-contain opacity-50 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 ease-out filter grayscale group-hover:grayscale-0"
                  src="/images/31_PP-1.png"
                />
              </div>
              <h4 className="relative z-20 font-display-xl text-headline-lg text-stark-white uppercase origin-bottom-left -rotate-90 translate-y-1/2 translate-x-4 opacity-80 group-hover:opacity-100 group-hover:text-signal-orange transition-colors">PACK POUCH</h4>
            </div>
            {/* Item 3 */}
            <div className="group relative overflow-hidden border border-surface-container-highest flex items-end p-8 bg-charcoal-field">
              <div className="absolute inset-0 bg-gradient-to-t from-tactical-black via-transparent to-transparent z-10"></div>
              <div className="absolute inset-0 flex justify-center items-center p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Belt category display"
                  className="w-full h-full object-contain opacity-50 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 ease-out filter grayscale group-hover:grayscale-0"
                  src="/images/33_B-1.png"
                />
              </div>
              <h4 className="relative z-20 font-display-xl text-headline-lg text-stark-white uppercase origin-bottom-left -rotate-90 translate-y-1/2 translate-x-4 opacity-80 group-hover:opacity-100 group-hover:text-signal-orange transition-colors">BELT</h4>
            </div>
          </div>
        </div>
      </section>

      {/* Battle Proven Hero */}
      <section
        className="relative min-h-[60vh] flex items-center bg-tactical-black overflow-hidden border-b border-surface-container-highest"
        style={{
          backgroundImage: `url('/images/11_Anaconda-MCB-1.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Scrim */}
        <div className="absolute inset-0 bg-gradient-to-r from-tactical-black/90 via-tactical-black/70 to-transparent"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDEwaDQwdjJIMHptMCAyMGg0MHYySDB6IiBmaWxsPSJyZ2JhKDAsMCwwLDAuNCkiLz48L3N2Zz4=')] opacity-50 pointer-events-none"></div>
        <div className="relative z-10 px-margin-edge max-w-[1440px] mx-auto w-full">
          <div className="max-w-2xl space-y-stack-lg">
            <h2 className="font-display-xl text-headline-lg-mobile md:text-display-xl text-stark-white uppercase tracking-tighter drop-shadow-lg">BATTLE PROVEN</h2>
            <p className="font-body-lg text-body-lg text-stark-white/90 border-l-2 border-signal-orange pl-4 shadow-sm">&quot;Rasakan Kekuatan Inovasi yang Terbukti dalam Pertempuran&quot;</p>
            <div>
              <Link
                className="inline-block border-2 border-stark-white text-stark-white font-label-caps text-label-caps py-3 px-8 hover:bg-stark-white hover:text-tactical-black transition-colors duration-200 bg-tactical-black/50 backdrop-blur-sm"
                href="/battle-proven"
              >
                EXPLORE NOW
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
