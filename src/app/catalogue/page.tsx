import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tactical Arsenal — DURHAIM Catalogue',
  description: 'Browse the full Durhaim tactical gear catalogue. Vests, chest rigs, packs, pouches, belts. DURABILITY HARD IMPACT & MODULAR.',
};

export default function CataloguePage() {
  return (
    <div className="bg-texture selection:bg-signal-orange selection:text-stark-white relative">
      <main className="max-w-[1440px] mx-auto px-margin-edge py-section-gap grid grid-cols-1 lg:grid-cols-12 gap-gutter relative z-10">
        {/* Sidebar Filter */}
        <aside className="lg:col-span-3 space-y-stack-lg">
          <div className="bg-surface-container/50 backdrop-blur p-stack-md border border-surface-container-highest">
            <h2 className="font-headline-md text-headline-md text-stark-white uppercase tracking-wider mb-stack-md border-b border-surface-container-highest pb-unit">Equipment Categories</h2>
            <ul className="space-y-stack-sm font-label-caps text-label-caps">
              <li>
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input defaultChecked className="form-checkbox bg-surface-container-lowest border-surface-container-highest text-signal-orange focus:ring-signal-orange focus:ring-offset-background w-5 h-5 rounded-none" type="checkbox" />
                  <span className="text-signal-orange group-hover:text-signal-orange transition-colors">ALL GEAR</span>
                </label>
              </li>
              <li className="border-t border-surface-container-highest/50 pt-stack-sm">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input className="form-checkbox bg-surface-container-lowest border-surface-container-highest text-signal-orange focus:ring-signal-orange focus:ring-offset-background w-5 h-5 rounded-none" type="checkbox" />
                  <span className="text-stark-white opacity-80 group-hover:text-signal-orange transition-colors">VESTS</span>
                </label>
              </li>
              <li className="border-t border-surface-container-highest/50 pt-stack-sm">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input className="form-checkbox bg-surface-container-lowest border-surface-container-highest text-signal-orange focus:ring-signal-orange focus:ring-offset-background w-5 h-5 rounded-none" type="checkbox" />
                  <span className="text-stark-white opacity-80 group-hover:text-signal-orange transition-colors">CHEST RIGS</span>
                </label>
              </li>
              <li className="border-t border-surface-container-highest/50 pt-stack-sm">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input className="form-checkbox bg-surface-container-lowest border-surface-container-highest text-signal-orange focus:ring-signal-orange focus:ring-offset-background w-5 h-5 rounded-none" type="checkbox" />
                  <span className="text-stark-white opacity-80 group-hover:text-signal-orange transition-colors">PACKS &amp; POUCHES</span>
                </label>
              </li>
              <li className="border-t border-surface-container-highest/50 pt-stack-sm">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input className="form-checkbox bg-surface-container-lowest border-surface-container-highest text-signal-orange focus:ring-signal-orange focus:ring-offset-background w-5 h-5 rounded-none" type="checkbox" />
                  <span className="text-stark-white opacity-80 group-hover:text-signal-orange transition-colors">BELTS</span>
                </label>
              </li>
              <li className="border-t border-surface-container-highest/50 pt-stack-sm">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input className="form-checkbox bg-surface-container-lowest border-surface-container-highest text-signal-orange focus:ring-signal-orange focus:ring-offset-background w-5 h-5 rounded-none" type="checkbox" />
                  <span className="text-stark-white opacity-80 group-hover:text-signal-orange transition-colors">ACCESSORIES</span>
                </label>
              </li>
            </ul>
          </div>
          <div className="bg-surface-container/50 backdrop-blur p-stack-md border border-surface-container-highest">
            <h3 className="font-headline-md text-stark-white uppercase mb-stack-sm">Search Catalog</h3>
            <div className="relative">
              <input
                className="w-full bg-surface-container-lowest border border-surface-container-highest text-stark-white font-data-mono text-data-mono p-3 focus:border-signal-orange focus:ring-0 rounded-none placeholder-on-tertiary-fixed-variant"
                placeholder="ENTER SERIAL / KEYWORD"
                type="text"
              />
              <button className="absolute right-0 top-0 h-full px-3 text-signal-orange hover:bg-signal-orange hover:text-tactical-black transition-colors">
                <span className="material-symbols-outlined text-[20px] translate-y-[2px]">search</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <section className="lg:col-span-9">
          <div className="flex justify-between items-end mb-stack-lg border-b border-surface-container-highest pb-stack-md">
            <div>
              <h1 className="font-display-xl text-headline-lg lg:text-display-xl text-stark-white uppercase tracking-tighter">Tactical Arsenal</h1>
              <p className="font-data-mono text-data-mono text-signal-orange mt-2">DURABILITY HARD IMPACT &amp; MODULAR</p>
            </div>
            <div className="hidden sm:flex items-center space-x-2 font-data-mono text-data-mono text-stark-white opacity-60">
              <span>SORT BY:</span>
              <select className="bg-transparent border-none text-signal-orange focus:ring-0 uppercase cursor-pointer">
                <option className="bg-surface-container">NEWEST DEPLOYMENT</option>
                <option className="bg-surface-container">BATTLE PROVEN</option>
                <option className="bg-surface-container">PRICE: HIGH TO LOW</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
            {/* Product Card 1 */}
            <article className="bg-surface-container/80 backdrop-blur border border-surface-container-highest group flex flex-col hover:border-signal-orange transition-colors duration-300">
              <div className="relative aspect-[4/5] bg-surface-container-lowest/50 p-stack-md flex items-center justify-center overflow-hidden">
                <div className="absolute top-4 left-4 bg-signal-orange text-tactical-black font-data-mono text-data-mono px-2 py-1 uppercase z-10">
                  BATTLE PROVEN
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Cobra Multicam Black Vest"
                  className="object-contain w-full h-full max-h-[300px] group-hover:scale-105 transition-transform duration-500 z-0"
                  src="https://lh3.googleusercontent.com/aida/ADBb0uhHmarY6x8tQQajILZYGhdMrE_-8N5sRpGivbjfVr7JV1GKgh1VPOJ5UwwZq8boGUAATN8Qo2TJt70_N3aFkd0KyOTZdkRBzyUxSj2dm9l1ZquJ2XLAk_BfM1vXPEdXbeOy3ZRiMPtCuihStQPqlz-Ljk89EELaFmWl1P5VsCg2rZ5Tgknyxr3uqk4ZdS-STDpVubokBOe0xfV1lk0DyQ6J3FtvcnBqUk1-fyua1f5e22SHPkccNAigEb-M"
                />
              </div>
              <div className="p-stack-md flex flex-col flex-grow border-t border-surface-container-highest">
                <h3 className="font-headline-md text-headline-md text-stark-white uppercase tracking-tight mb-2">Cobra Multicam Black Vest</h3>
                <p className="font-data-mono text-data-mono text-on-surface-variant mb-4 flex-grow">MODULAR TACTICAL CARRIER / QUICK RELEASE SYSTEM / LASER CUT MOLLE</p>
                <button className="w-full bg-signal-orange text-tactical-black font-label-caps text-label-caps py-3 uppercase hover:bg-stark-white transition-colors duration-200 mt-auto flex items-center justify-center space-x-2">
                  <span>VIEW DETAILS</span>
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </article>

            {/* Product Card 2 */}
            <article className="bg-surface-container/80 backdrop-blur border border-surface-container-highest group flex flex-col hover:border-signal-orange transition-colors duration-300">
              <div className="relative aspect-[4/5] bg-surface-container-lowest/50 p-stack-md flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Black Thunder Vest"
                  className="object-contain w-full h-full max-h-[300px] group-hover:scale-105 transition-transform duration-500 z-0"
                  src="https://lh3.googleusercontent.com/aida/ADBb0uizMNhgZuQE8K5Kr6MB6l2F2tLSm2LxztpQ3QQyiGc3k1a4bGCHPtrGwYPx8k2WqeccGyjcgZJshyffU5xjr5qVTeDFDCeE7mlP2goKZvi1in6qX913WsCOquO9vIIVh3ufOl2KN7ypB0O02wgPOafINEHz9ZTxLEGLnZYTzjOL50QdIetgXo3UyuoAPX_Mufg0sPa5bq6ZIqhMOr1nHbKLlYBpDtNgbVpxNb7AESjvTfIfFkilq2wM8r4"
                />
              </div>
              <div className="p-stack-md flex flex-col flex-grow border-t border-surface-container-highest">
                <h3 className="font-headline-md text-headline-md text-stark-white uppercase tracking-tight mb-2">Black Thunder Vest</h3>
                <p className="font-data-mono text-data-mono text-on-surface-variant mb-4 flex-grow">HEAVY DUTY PLATE CARRIER / TRIPLE MAG POUCH INCLUDED / ADJUSTABLE HARNESS</p>
                <button className="w-full bg-transparent border border-stark-white text-stark-white font-label-caps text-label-caps py-3 uppercase hover:bg-signal-orange hover:border-signal-orange hover:text-tactical-black transition-colors duration-200 mt-auto flex items-center justify-center space-x-2">
                  <span>VIEW DETAILS</span>
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </article>

            {/* Product Card 3 */}
            <article className="bg-surface-container/80 backdrop-blur border border-surface-container-highest group flex flex-col hover:border-signal-orange transition-colors duration-300">
              <div className="relative aspect-[4/5] bg-surface-container-lowest/50 p-stack-md flex items-center justify-center overflow-hidden">
                <div className="absolute top-4 left-4 bg-stark-white text-tactical-black font-data-mono text-data-mono px-2 py-1 uppercase z-10">
                  NEW ARRIVAL
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Anaconda MCB Pack"
                  className="object-contain w-full h-full max-h-[300px] group-hover:scale-105 transition-transform duration-500 z-0"
                  src="https://lh3.googleusercontent.com/aida/ADBb0uiJ-0dldTUMcqTvYSs4D2qAbjpDJQUr1-nPktRvlp2KIzJkPY6OUjsjU7jtBcOMDLls2lxCoX8DdrqcJOVZ-SaP5Yxj2W0LZo3R0Wf03VwUSnWBlUfRTBOsMQdAPm4DdS9G-QksTMT-qMn50Zo5D7WaKpB7okI3X0r5vkblC2RlaxER_YVu-AoV7tJpTOL7d59f_eqEQyNdrY6eLdJvUDITW3mYc-iOy0r_MDFWHF8x3Ayuz_EkEfG5Kso"
                />
              </div>
              <div className="p-stack-md flex flex-col flex-grow border-t border-surface-container-highest">
                <h3 className="font-headline-md text-headline-md text-stark-white uppercase tracking-tight mb-2">Anaconda MCB Pack</h3>
                <p className="font-data-mono text-data-mono text-on-surface-variant mb-4 flex-grow">30L CAPACITY / HYDRATION COMPATIBLE / MULTICAM BLACK CORDURA</p>
                <button className="w-full bg-transparent border border-stark-white text-stark-white font-label-caps text-label-caps py-3 uppercase hover:bg-signal-orange hover:border-signal-orange hover:text-tactical-black transition-colors duration-200 mt-auto flex items-center justify-center space-x-2">
                  <span>VIEW DETAILS</span>
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </article>

            {/* Product Card 4 */}
            <article className="bg-surface-container/80 backdrop-blur border border-surface-container-highest group flex flex-col hover:border-signal-orange transition-colors duration-300">
              <div className="relative aspect-[4/5] bg-surface-container-lowest/50 p-stack-md flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Black Trojan Pro Belt"
                  className="object-contain w-full h-full max-h-[200px] group-hover:scale-105 transition-transform duration-500 z-0"
                  src="https://lh3.googleusercontent.com/aida/ADBb0uiGfLUwNlkyOM4_t7brXJ7tRUTTlJpCltHvq0-kb43jSMjb2P8nA8rI7yeAqXqA1l0A2NKuMA_g7ZGZRMZsdoWwXws8auj2Vx9W47RF88WNrVdVck5TfFTMrdA2Csu_6-Gp5nlSPZeUk1h0OJ00Hxh9T-PStsy_SHG4JWoqe_Q34Xg3EA0-40b71L7fOfkBfgaDUrLeKyBWIaSyBkBRKMUIbXiIBHGz_dHG7Hy2SzHjGsBxZ-PrtvxTLSPn"
                />
              </div>
              <div className="p-stack-md flex flex-col flex-grow border-t border-surface-container-highest">
                <h3 className="font-headline-md text-headline-md text-stark-white uppercase tracking-tight mb-2">Black Trojan Pro Belt</h3>
                <p className="font-data-mono text-data-mono text-on-surface-variant mb-4 flex-grow">RIGGER BELT / QUICK RELEASE BUCKLE / INTEGRATED POUCH SYSTEM</p>
                <button className="w-full bg-transparent border border-stark-white text-stark-white font-label-caps text-label-caps py-3 uppercase hover:bg-signal-orange hover:border-signal-orange hover:text-tactical-black transition-colors duration-200 mt-auto flex items-center justify-center space-x-2">
                  <span>VIEW DETAILS</span>
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </article>

            {/* Product Card 5 */}
            <article className="bg-surface-container/80 backdrop-blur border border-surface-container-highest group flex flex-col hover:border-signal-orange transition-colors duration-300">
              <div className="relative aspect-[4/5] bg-surface-container-lowest/50 p-stack-md flex items-center justify-center overflow-hidden">
                <div className="absolute top-4 left-4 bg-signal-orange text-tactical-black font-data-mono text-data-mono px-2 py-1 uppercase z-10">
                  LIMITED STOCK
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Rattle Belt MCB"
                  className="object-contain w-full h-full max-h-[200px] group-hover:scale-105 transition-transform duration-500 z-0"
                  src="https://lh3.googleusercontent.com/aida/ADBb0ugf8XCbATiLEBjkn4DG_EzmdZ7e87WonQUAZr1pHTPTAyo899lkLlCQrpA9aoSe9P3H-FkgE1PdKjWcgjphJo71Z3slpAoQdacw2f8FZ-5qekwbdbfpX7tTfZ5Kiiw9IAwfIKasrBb_-XcOX1EPYyNDxOkMhSbxVGuj0IXD9Hmka3jPhQY84q3DyZ91hJRc5FDoeLRco0kHcm_3rvnR8f9mD9B70urXJobfLZHPJKQLSGzsrBWLeH5SyZY"
                />
              </div>
              <div className="p-stack-md flex flex-col flex-grow border-t border-surface-container-highest">
                <h3 className="font-headline-md text-headline-md text-stark-white uppercase tracking-tight mb-2">Rattle Belt MCB</h3>
                <p className="font-data-mono text-data-mono text-on-surface-variant mb-4 flex-grow">TACTICAL WAIST BELT / MULTICAM BLACK / COBRA STYLE BUCKLE / MAG POUCHES</p>
                <button className="w-full bg-transparent border border-stark-white text-stark-white font-label-caps text-label-caps py-3 uppercase hover:bg-signal-orange hover:border-signal-orange hover:text-tactical-black transition-colors duration-200 mt-auto flex items-center justify-center space-x-2">
                  <span>VIEW DETAILS</span>
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </article>
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center space-x-2 mt-stack-lg pt-stack-lg border-t border-surface-container-highest">
            <button className="w-10 h-10 flex items-center justify-center border border-surface-container-highest text-stark-white hover:border-signal-orange hover:text-signal-orange transition-colors">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center bg-signal-orange text-tactical-black font-data-mono text-data-mono">1</button>
            <button className="w-10 h-10 flex items-center justify-center border border-surface-container-highest bg-surface-container/50 text-stark-white hover:border-signal-orange hover:text-signal-orange transition-colors font-data-mono text-data-mono">2</button>
            <button className="w-10 h-10 flex items-center justify-center border border-surface-container-highest bg-surface-container/50 text-stark-white hover:border-signal-orange hover:text-signal-orange transition-colors font-data-mono text-data-mono">3</button>
            <button className="w-10 h-10 flex items-center justify-center border border-surface-container-highest text-stark-white hover:border-signal-orange hover:text-signal-orange transition-colors">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
