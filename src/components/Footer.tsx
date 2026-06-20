"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useCommerce } from "@/components/CommerceProvider";
import { useSiteSettings } from "@/components/SiteSettingsProvider";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { buildWhatsAppUrl } from "@/lib/site-settings";

export default function Footer() {
  const { t } = useCommerce();
  const siteSettings = useSiteSettings();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const submitNewsletter = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    await res.json().catch(() => ({}));
    setMessage(res.ok ? t.footer.subscribed : t.footer.failed);
    if (res.ok) setEmail("");
  };

  return (
    <footer className="bg-tactical-black w-full mt-section-gap border-t border-surface-container-highest">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter px-margin-edge py-section-gap max-w-[1440px] mx-auto">
        {/* Brand Column */}
        <div className="flex flex-col">
          <Link
            href="/"
            className="font-display-xl text-headline-md text-stark-white mb-stack-md"
          >
            DURHAIM
          </Link>
          <p className="font-label-caps text-label-caps text-signal-orange mb-stack-lg uppercase">
            &quot;{t.footer.alwaysForward}&quot;
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
              href={buildWhatsAppUrl(siteSettings)}
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
          <h4 className="font-label-caps text-label-caps text-stark-white uppercase mb-stack-md">
            {t.footer.contacts}
          </h4>
          <ul className="space-y-stack-sm font-body-md text-body-md text-on-tertiary-fixed-variant">
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-sm mt-1">
                location_on
              </span>
              <span>{siteSettings.location}</span>
            </li>
            <li className="flex items-center gap-2 hover:text-signal-orange transition-colors">
              <span className="material-symbols-outlined text-sm">mail</span>
              <a href={`mailto:${siteSettings.support_email}`}>
                {siteSettings.support_email}
              </a>
            </li>
            <li className="flex items-center gap-2 hover:text-signal-orange transition-colors">
              <WhatsAppIcon className="h-4 w-4 shrink-0" />
              <a
                href={buildWhatsAppUrl(siteSettings)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {siteSettings.whatsapp_contact}
              </a>
            </li>
          </ul>
        </div>

        {/* Links Column */}
        <div className="flex flex-col">
          <h4 className="font-label-caps text-label-caps text-stark-white uppercase mb-stack-md">
            {t.footer.navigation}
          </h4>
          <ul className="space-y-stack-sm font-body-md text-body-md text-on-tertiary-fixed-variant flex flex-col">
            <Link
              className="hover:text-signal-orange hover:underline w-fit"
              href="/catalogue?category=vest"
            >
              {t.catalogue.categoryLabels.vest}
            </Link>
            <Link
              className="hover:text-signal-orange hover:underline w-fit"
              href="/catalogue?category=pack"
            >
              {t.catalogue.categoryLabels.pack}
            </Link>
            <Link
              className="hover:text-signal-orange hover:underline w-fit"
              href="/catalogue?category=belt"
            >
              {t.catalogue.categoryLabels.belt}
            </Link>
            <Link
              className="hover:text-signal-orange hover:underline w-fit"
              href="/contact"
            >
              {t.footer.contact}
            </Link>
            <Link
              className="hover:text-signal-orange hover:underline w-fit"
              href="/latest-projects"
            >
              {t.footer.latestProjects}
            </Link>
          </ul>
        </div>

        {/* Subscribe Column */}
        <div className="flex flex-col">
          <h4 className="font-label-caps text-label-caps text-stark-white uppercase mb-stack-md">
            {t.footer.subscribe}
          </h4>
          <p className="font-body-md text-body-md text-on-tertiary-fixed-variant mb-stack-md">
            {t.footer.newsletter}
          </p>
          <form onSubmit={submitNewsletter} className="flex">
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="bg-charcoal-field border border-surface-container-highest text-stark-white font-data-mono text-data-mono p-3 w-full focus:outline-none focus:border-signal-orange rounded-none placeholder-on-tertiary-fixed-variant"
              placeholder={t.footer.email}
              type="email"
              required
            />
            <button
              type="submit"
              className="bg-signal-orange text-tactical-black px-4 flex items-center justify-center hover:bg-stark-white transition-colors duration-200"
              aria-label={t.footer.subscribeAria}
            >
              <span className="material-symbols-outlined">arrow_upward</span>
            </button>
          </form>
          {message && (
            <p className="mt-2 font-data-mono text-data-mono text-signal-orange">
              {message}
            </p>
          )}
        </div>
      </div>

      {/* Copyright Bottom Bar */}
      <div className="w-full border-t border-surface-container-highest py-stack-md text-center">
        <span className="font-data-mono text-data-mono text-on-tertiary-fixed-variant uppercase">
          2024 DURHAIM TACTICAL. {t.footer.alwaysForward}.
        </span>
      </div>
    </footer>
  );
}
