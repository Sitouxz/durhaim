import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-tactical-black w-full mt-section-gap border-t border-surface-container-highest">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter px-margin-edge py-section-gap max-w-[1440px] mx-auto">
        {/* Brand Column */}
        <div className="flex flex-col">
          <Link href="/" className="font-display-xl text-headline-md text-stark-white mb-stack-md">
            DURHAIM
          </Link>
          <p className="font-label-caps text-label-caps text-signal-orange mb-stack-lg uppercase">
            &quot;Always Forward&quot;
          </p>
          <div className="flex space-x-stack-sm">
            <a
              className="w-10 h-10 border border-surface-container-highest flex items-center justify-center text-on-tertiary-fixed-variant hover:text-signal-orange hover:border-signal-orange transition-colors duration-200"
              href="https://www.facebook.com/durhaimarmygear/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="font-data-mono text-data-mono">Fb</span>
            </a>
            <a
              className="w-10 h-10 border border-surface-container-highest flex items-center justify-center text-on-tertiary-fixed-variant hover:text-signal-orange hover:border-signal-orange transition-colors duration-200"
              href="https://wa.me/6282120101473"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="font-data-mono text-data-mono">Wa</span>
            </a>
            <a
              className="w-10 h-10 border border-surface-container-highest flex items-center justify-center text-on-tertiary-fixed-variant hover:text-signal-orange hover:border-signal-orange transition-colors duration-200"
              href="https://www.youtube.com/channel/UCRQa9l9_warxaVLGWLPVsXw"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="font-data-mono text-data-mono">Yt</span>
            </a>
            <a
              className="w-10 h-10 border border-surface-container-highest flex items-center justify-center text-on-tertiary-fixed-variant hover:text-signal-orange hover:border-signal-orange transition-colors duration-200"
              href="https://www.instagram.com/durhaimgear/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="font-data-mono text-data-mono">Ig</span>
            </a>
          </div>
        </div>

        {/* Contacts Column */}
        <div className="flex flex-col">
          <h4 className="font-label-caps text-label-caps text-stark-white uppercase mb-stack-md">Contacts</h4>
          <ul className="space-y-stack-sm font-body-md text-body-md text-on-tertiary-fixed-variant">
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-sm mt-1">location_on</span>
              <span>Komp. Mitra Dago Parahyangan Jl. Anyelir No. C8 Bandung</span>
            </li>
            <li className="flex items-center gap-2 hover:text-signal-orange transition-colors">
              <span className="material-symbols-outlined text-sm">mail</span>
              <a href="mailto:durhaimgear@gmail.com">durhaimgear@gmail.com</a>
            </li>
            <li className="flex items-center gap-2 hover:text-signal-orange transition-colors">
              <span className="material-symbols-outlined text-sm">phone</span>
              <a href="tel:+6282120101473">0821-2010-1473</a>
            </li>
          </ul>
        </div>

        {/* Links Column */}
        <div className="flex flex-col">
          <h4 className="font-label-caps text-label-caps text-stark-white uppercase mb-stack-md">Navigation</h4>
          <ul className="space-y-stack-sm font-body-md text-body-md text-on-tertiary-fixed-variant flex flex-col">
            <Link className="hover:text-signal-orange hover:underline w-fit" href="/catalogue?category=vest">Vest &amp; Chestrig</Link>
            <Link className="hover:text-signal-orange hover:underline w-fit" href="/catalogue?category=pack">Pack &amp; Pouches</Link>
            <Link className="hover:text-signal-orange hover:underline w-fit" href="/catalogue?category=belt">Belt</Link>
            <Link className="hover:text-signal-orange hover:underline w-fit" href="#">Contact</Link>
            <Link className="hover:text-signal-orange hover:underline w-fit" href="#">Latest Projects</Link>
          </ul>
        </div>

        {/* Subscribe Column */}
        <div className="flex flex-col">
          <h4 className="font-label-caps text-label-caps text-stark-white uppercase mb-stack-md">Subscribe</h4>
          <p className="font-body-md text-body-md text-on-tertiary-fixed-variant mb-stack-md">
            Follow our newsletter to stay updated about agency.
          </p>
          <div className="flex">
            <input
              className="bg-charcoal-field border border-surface-container-highest text-stark-white font-data-mono text-data-mono p-3 w-full focus:outline-none focus:border-signal-orange rounded-none placeholder-on-tertiary-fixed-variant"
              placeholder="ENTER EMAIL"
              type="email"
            />
            <button className="bg-signal-orange text-tactical-black px-4 flex items-center justify-center hover:bg-stark-white transition-colors duration-200">
              <span className="material-symbols-outlined">arrow_upward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Copyright Bottom Bar */}
      <div className="w-full border-t border-surface-container-highest py-stack-md text-center">
        <span className="font-data-mono text-data-mono text-on-tertiary-fixed-variant uppercase">
          2024 DURHAIM TACTICAL. ALWAYS FORWARD.
        </span>
      </div>
    </footer>
  );
}
