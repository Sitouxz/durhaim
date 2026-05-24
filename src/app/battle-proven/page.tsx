import type { Metadata } from 'next';
import Link from 'next/link';
import LocalizedText from '@/components/LocalizedText';

export const metadata: Metadata = {
  title: 'Battle Proven — DURHAIM Tactical Gear',
  description: 'Rasakan Kekuatan Inovasi yang Terbukti dalam Pertempuran. Gear engineered for high-performance.',
};

export default function BattleProvenPage() {
  return (
    <main className="flex-grow flex flex-col relative w-full">
      {/* Hero Section */}
      <section className="relative w-full h-[70vh] md:h-[85vh] flex items-center justify-center overflow-hidden bg-tactical-black">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="w-full h-full object-cover object-center opacity-60"
            alt="Tactical operators in combat gear"
            src="/images/durhaim_image_3.png"
          />
          {/* Tactical Mesh Overlay */}
          <div className="absolute inset-0 mesh-overlay"></div>
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-tactical-black via-tactical-black/50 to-transparent"></div>
        </div>
        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-margin-edge max-w-[1000px] mx-auto mt-16">
          <div className="inline-block border border-signal-orange bg-tactical-black/80 px-4 py-2 mb-stack-lg backdrop-blur-sm">
            <span className="font-data-mono text-data-mono text-signal-orange uppercase tracking-widest">
              <LocalizedText en="Operationally Ready" id="Siap Operasi" />
            </span>
          </div>
          <h1 className="font-display-xl text-headline-lg-mobile md:text-display-xl text-stark-white uppercase tracking-tighter mb-stack-md">
            <LocalizedText en="Battle Proven" id="Teruji Lapangan" />
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-stack-lg border-l-2 border-signal-orange pl-4 text-left md:text-center md:border-l-0 md:border-b-2 md:pb-4 md:pl-0">
            <LocalizedText
              en="Feel the strength of battle-proven innovation. Gear engineered for high performance, where reliability is not an option but a requirement."
              id="Rasakan kekuatan inovasi yang terbukti dalam pertempuran. Gear dirancang untuk performa tinggi, saat keandalan bukan pilihan tetapi kebutuhan."
            />
          </p>
          <div className="flex flex-col sm:flex-row gap-stack-md mt-stack-md">
            <a
              className="inline-flex items-center justify-center bg-signal-orange text-tactical-black font-label-caps text-label-caps uppercase px-8 py-4 border border-signal-orange hover:bg-tactical-black hover:text-signal-orange transition-all duration-300 active:scale-95 group"
              href="#innovation"
            >
              <LocalizedText en="Explore The Mission" id="Jelajahi Misi" />
              <span className="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">arrow_downward</span>
            </a>
          </div>
        </div>
        {/* Scroll Indicator */}
        <div className="absolute bottom-stack-lg left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce">
          <span className="font-data-mono text-data-mono text-stark-white/50 mb-2 uppercase">
            <LocalizedText en="Descend" id="Turun" />
          </span>
          <span className="material-symbols-outlined text-signal-orange">south</span>
        </div>
      </section>

      {/* Section 2: Innovation Born in Combat */}
      <section className="relative w-full py-section-gap px-margin-edge bg-charcoal-field topographic-pattern" id="innovation">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
          {/* Text Content */}
          <div className="lg:col-span-5 flex flex-col order-2 lg:order-1 relative z-10">
            <div className="flex items-center gap-2 mb-stack-md">
              <div className="h-px w-8 bg-signal-orange"></div>
              <span className="font-data-mono text-data-mono text-signal-orange uppercase">
                <LocalizedText en="Phase 01 // R&D" id="Fase 01 // R&D" />
              </span>
            </div>
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-stark-white uppercase tracking-tight mb-stack-lg leading-tight">
              <LocalizedText en="Innovation Born In Combat" id="Inovasi yang Lahir di Lapangan" />
            </h2>
            <div className="space-y-stack-md text-on-surface-variant font-body-md border-l border-surface-container-highest pl-stack-md">
              <p>
                <LocalizedText
                  en="Every stitch, every buckle, every millimeter of webbing is scrutinized. We do not design for the range; we engineer for the frontline. Our R&D process begins where standard testing ends."
                  id="Setiap jahitan, buckle, dan milimeter webbing diperiksa. Kami tidak mendesain hanya untuk latihan; kami merancang untuk garis depan. Proses R&D kami dimulai saat pengujian standar berakhir."
                />
              </p>
              <p>
                <LocalizedText
                  en="Working directly with active-duty operators, we iterate through prototypes until the gear functions as an extension of the user. Sharp, unyielding, and devoid of unnecessary decoration."
                  id="Bekerja langsung dengan operator aktif, kami mengulang prototipe sampai gear berfungsi sebagai perpanjangan dari pengguna. Tajam, tegas, dan tanpa dekorasi yang tidak perlu."
                />
              </p>
            </div>
            <div className="mt-stack-lg grid grid-cols-2 gap-stack-md">
              <div className="bg-tactical-black border border-surface-container-highest p-stack-md flex flex-col">
                <span className="material-symbols-outlined text-signal-orange mb-2 text-3xl">precision_manufacturing</span>
                <span className="font-label-caps text-label-caps text-stark-white uppercase">
                  <LocalizedText en="Machined Precision" id="Presisi Produksi" />
                </span>
              </div>
              <div className="bg-tactical-black border border-surface-container-highest p-stack-md flex flex-col">
                <span className="material-symbols-outlined text-signal-orange mb-2 text-3xl">science</span>
                <span className="font-label-caps text-label-caps text-stark-white uppercase">
                  <LocalizedText en="Iterative Testing" id="Pengujian Berulang" />
                </span>
              </div>
            </div>
          </div>
          {/* Image */}
          <div className="lg:col-span-7 order-1 lg:order-2 relative mb-stack-lg lg:mb-0">
            <div className="relative w-full aspect-[4/3] bg-tactical-black border border-surface-container-highest overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Blue training pistols in a rigid black tactical holster"
                className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 ease-in-out scale-105 group-hover:scale-100"
                src="/images/15_Holster-1.png"
              />
              {/* Overlay badge */}
              <div className="absolute top-4 right-4 bg-tactical-black/80 border border-signal-orange px-3 py-1 backdrop-blur-sm">
                <span className="font-data-mono text-data-mono text-signal-orange">
                  <LocalizedText en="STATUS: ACTIVE" id="STATUS: AKTIF" />
                </span>
              </div>
              {/* Crosshairs */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-stark-white/20 rounded-full flex items-center justify-center opacity-50">
                <div className="w-1 h-1 bg-signal-orange rounded-full"></div>
                <div className="absolute w-full h-px bg-stark-white/20"></div>
                <div className="absolute h-full w-px bg-stark-white/20"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Uncompromising Hardware — Bento Grid */}
      <section className="w-full py-section-gap px-margin-edge bg-background border-t border-surface-container-highest">
        <div className="max-w-[1440px] mx-auto flex flex-col">
          <div className="flex flex-col md:flex-row justify-between items-end mb-stack-lg gap-stack-md">
            <div>
              <div className="flex items-center gap-2 mb-stack-sm">
                <div className="h-px w-8 bg-signal-orange"></div>
                <span className="font-data-mono text-data-mono text-signal-orange uppercase">
                  <LocalizedText en="Phase 02 // Specifications" id="Fase 02 // Spesifikasi" />
                </span>
              </div>
              <h2 className="font-headline-md text-headline-md text-stark-white uppercase tracking-tight">
                <LocalizedText en="Uncompromising Hardware" id="Hardware Tanpa Kompromi" />
              </h2>
            </div>
            <Link
              className="inline-flex items-center text-stark-white font-label-caps text-label-caps uppercase hover:text-signal-orange transition-colors group"
              href="/catalogue"
            >
              <LocalizedText en="View Full Specs" id="Lihat Spesifikasi" />
              <span className="material-symbols-outlined ml-1 text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>
          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter auto-rows-[300px]">
            {/* Card 1: Large Feature */}
            <div className="md:col-span-2 bg-charcoal-field border border-surface-container-highest relative overflow-hidden group flex flex-col justify-end p-stack-lg">
              <div className="absolute inset-0 z-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-full h-full object-cover opacity-30 mix-blend-luminosity group-hover:scale-105 transition-transform duration-700"
                  alt="Heavy duty ballistic nylon fabric"
                  src="/images/durhaim_image_4.png"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-tactical-black to-transparent"></div>
              </div>
              <div className="relative z-10">
                <div className="inline-block bg-tactical-black border border-stark-white/20 px-2 py-1 mb-stack-sm">
                  <span className="font-data-mono text-data-mono text-stark-white uppercase">
                    <LocalizedText en="Material Base" id="Basis Material" />
                  </span>
                </div>
                <h3 className="font-headline-md text-headline-md text-stark-white uppercase mb-2">
                  <LocalizedText en="Ballistic Polymers" id="Polimer Balistik" />
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                  <LocalizedText
                    en="Engineered to withstand extreme tensile stress and abrasive environments without structural failure."
                    id="Dirancang untuk menahan tarikan ekstrem dan lingkungan abrasif tanpa kegagalan struktur."
                  />
                </p>
              </div>
            </div>
            {/* Card 2: Stat */}
            <div className="bg-tactical-black border border-surface-container-highest flex flex-col items-center justify-center p-stack-lg text-center group hover:border-signal-orange transition-colors">
              <span className="material-symbols-outlined text-signal-orange text-6xl mb-stack-md font-light" style={{fontVariationSettings: "'wght' 200"}}>shield</span>
              <div className="font-display-xl text-headline-lg text-stark-white mb-2">MIL-SPEC</div>
              <p className="font-body-md text-body-md text-on-surface-variant">
                <LocalizedText
                  en="Exceeds standard operational requirements for hard impact resistance."
                  id="Melampaui kebutuhan operasional standar untuk ketahanan terhadap benturan berat."
                />
              </p>
            </div>
            {/* Card 3: Modular */}
            <div className="bg-charcoal-field border border-surface-container-highest relative overflow-hidden group p-stack-lg flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="material-symbols-outlined text-stark-white text-3xl">view_module</span>
                <span className="font-data-mono text-data-mono text-signal-orange">MOD-01</span>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-stark-white uppercase mb-2">
                  <LocalizedText en="Total Modularity" id="Modularitas Penuh" />
                </h3>
                <div className="w-full h-2 bg-surface-container mt-stack-md flex gap-1">
                  <div className="h-full w-1/4 bg-signal-orange"></div>
                  <div className="h-full w-1/4 bg-signal-orange"></div>
                  <div className="h-full w-1/4 bg-surface-container-highest"></div>
                  <div className="h-full w-1/4 bg-surface-container-highest"></div>
                </div>
              </div>
            </div>
            {/* Card 4: Action */}
            <div className="md:col-span-2 bg-tactical-black border border-surface-container-highest flex flex-col md:flex-row items-center p-stack-lg gap-stack-lg group hover:bg-surface-container-low transition-colors">
              <div className="w-24 h-24 rounded-full border-2 border-signal-orange flex items-center justify-center flex-shrink-0 relative">
                <div className="absolute inset-0 rounded-full border border-signal-orange animate-ping opacity-20"></div>
                <span className="material-symbols-outlined text-signal-orange text-4xl">my_location</span>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-stark-white uppercase mb-stack-sm">
                  <LocalizedText en="Always Forward." id="Selalu Maju." />
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-stack-md max-w-lg">
                  <LocalizedText
                    en="Gear that adapts to the mission parameters dynamically. Built for those who move towards the chaos."
                    id="Gear yang beradaptasi dengan parameter misi secara dinamis. Dibuat untuk mereka yang bergerak menuju tekanan."
                  />
                </p>
                <Link
                  className="font-data-mono text-data-mono text-stark-white uppercase border-b border-stark-white pb-1 hover:text-signal-orange hover:border-signal-orange transition-colors"
                  href="/catalogue?category=vest"
                >
                  <LocalizedText en="Read Our Story" id="Baca Cerita Kami" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: CTA */}
      <section className="w-full py-section-gap px-margin-edge bg-signal-orange flex flex-col items-center text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <span className="material-symbols-outlined text-tactical-black text-5xl mb-stack-md" style={{fontVariationSettings: "'FILL' 1"}}>local_fire_department</span>
          <h2 className="font-display-xl text-headline-lg-mobile md:text-headline-lg text-tactical-black uppercase tracking-tighter mb-stack-md">
            <LocalizedText en="Equip For The Unknown" id="Siap untuk Hal yang Tidak Terduga" />
          </h2>
          <p className="font-body-lg text-body-lg text-tactical-black/80 font-medium mb-stack-lg max-w-xl">
            <LocalizedText
              en="Our catalogue is restricted to hardware that has survived rigorous field testing. Browse the current operational inventory."
              id="Katalog kami berisi hardware yang telah melewati pengujian lapangan ketat. Lihat inventori operasional terbaru."
            />
          </p>
          <Link
            className="inline-flex items-center justify-center bg-tactical-black text-stark-white font-label-caps text-label-caps uppercase px-10 py-5 border-2 border-tactical-black hover:bg-transparent hover:text-tactical-black transition-all duration-300 active:scale-95 group"
            href="/catalogue"
          >
            <LocalizedText en="Explore Full Catalogue" id="Jelajahi Katalog Lengkap" />
            <span className="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">chevron_right</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
