"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useCommerce } from "@/components/CommerceProvider";
import { useSiteSettings } from "@/components/SiteSettingsProvider";
import { buildWhatsAppUrl } from "@/lib/site-settings";

const socialLinks = [
  ["FB", "https://www.facebook.com/durhaimarmygear/"],
  ["YT", "https://www.youtube.com/channel/UCRQa9l9_warxaVLGWLPVsXw"],
  ["IG", "https://www.instagram.com/durhaimgear/"],
] as const;

export default function Footer() {
  const { t } = useCommerce();
  const siteSettings = useSiteSettings();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function submitNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    await response.json().catch(() => ({}));
    setMessage(response.ok ? t.footer.subscribed : t.footer.failed);
    if (response.ok) setEmail("");
  }

  return (
    <footer className="store-footer" data-visual-diff-mask="retained-footer">
      <div className="store-footer__grid">
        <section className="store-footer__brand" aria-label="DURHAIM">
          <Link href="/">DURHAIM</Link>
          <p>“{t.footer.alwaysForward}”</p>
          <div className="store-footer__social">
            {socialLinks.map(([label, href]) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>{label}</a>
            ))}
            <a href={buildWhatsAppUrl(siteSettings)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">WA</a>
          </div>
        </section>

        <section>
          <h2>{t.footer.contacts}</h2>
          <address>
            <span>{siteSettings.location}</span>
            <a href={`mailto:${siteSettings.support_email}`}>{siteSettings.support_email}</a>
            <a href={buildWhatsAppUrl(siteSettings)} target="_blank" rel="noopener noreferrer">
              {siteSettings.whatsapp_contact}
            </a>
          </address>
        </section>

        <section>
          <h2>{t.footer.navigation}</h2>
          <nav className="store-footer__links" aria-label="Footer navigation">
            <Link href="/catalogue?category=vest">{t.catalogue.categoryLabels.vest}</Link>
            <Link href="/catalogue?category=pack">{t.catalogue.categoryLabels.pack}</Link>
            <Link href="/catalogue?category=belt">{t.catalogue.categoryLabels.belt}</Link>
            <Link href="/contact">{t.footer.contact}</Link>
            <Link href="/latest-projects">{t.footer.latestProjects}</Link>
          </nav>
        </section>

        <section>
          <h2>{t.footer.subscribe}</h2>
          <p>{t.footer.newsletter}</p>
          <form className="store-footer__form" onSubmit={submitNewsletter}>
            <label className="sr-only" htmlFor="newsletter-email">{t.footer.email}</label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t.footer.email}
            />
            <button type="submit" aria-label={t.footer.subscribeAria}>
              <ArrowUp aria-hidden="true" />
            </button>
          </form>
          <p className="store-footer__message" aria-live="polite">{message}</p>
        </section>
      </div>
      <div className="store-footer__legal">© 2026 DURHAIM TACTICAL. {t.footer.alwaysForward}.</div>
    </footer>
  );
}
