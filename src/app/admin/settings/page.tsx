"use client";

import {
  Bell,
  Globe2,
  KeyRound,
  Mail,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { defaultSiteSettings, type SiteSettings } from "@/lib/site-settings";

const settingFields = [
  {
    key: "public_domain",
    inputMode: "url",
    icon: Globe2,
    title: "Public Domain",
    note: "Used for QR certificate links and customer-facing verification URLs.",
  },
  {
    key: "whatsapp_contact",
    inputMode: "tel",
    icon: Bell,
    title: "WhatsApp Contact",
    note: "Primary support channel shown across public pages.",
  },
  {
    key: "support_email",
    inputMode: "email",
    icon: Mail,
    title: "Support Email",
    note: "Inbox for support, product enquiries, and authenticity help.",
  },
  {
    key: "location",
    inputMode: "text",
    icon: MapPin,
    title: "Location",
    note: "Public workshop or contact address.",
  },
] as const;

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/admin/settings", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setError(data.error || "Failed to load settings.");
          return;
        }

        setSettings({ ...defaultSiteSettings, ...data });
      } catch {
        setError("Failed to connect to settings API.");
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const setField = (key: keyof SiteSettings, value: string) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const handleSaveSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Failed to save settings.");
        return;
      }

      setSettings({ ...defaultSiteSettings, ...data });
      setMessage("Settings saved.");
    } catch {
      setError("Failed to connect to settings API.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-stack-lg animate-in fade-in duration-500">
      <div>
        <h1 className="font-display-xl text-headline-lg text-stark-white uppercase">
          Settings
        </h1>
        <p className="font-body-md text-on-surface-variant">
          Edit operational configuration for storefront, support, and
          verification workflows.
        </p>
      </div>

      {error && (
        <div className="border border-error bg-error-container/20 p-4 font-body-md text-error">
          {error}
        </div>
      )}
      {message && (
        <div className="border border-operator-green bg-operator-green/10 p-4 font-body-md text-operator-green">
          {message}
        </div>
      )}

      <form
        onSubmit={handleSaveSettings}
        className="grid grid-cols-1 gap-gutter lg:grid-cols-2"
      >
        {settingFields.map((item) => {
          const Icon = item.icon;
          return (
            <section
              key={item.key}
              className="border border-surface-container-highest bg-charcoal-field p-stack-md"
            >
              <div className="mb-stack-md flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-headline-md text-headline-md uppercase text-stark-white">
                    {item.title}
                  </h2>
                  <p className="mt-2 font-body-md text-on-surface-variant">
                    {item.note}
                  </p>
                </div>
                <div className="border border-signal-orange/50 bg-tactical-black p-3 text-signal-orange">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <input
                value={settings[item.key]}
                onChange={(event) => setField(item.key, event.target.value)}
                disabled={loading}
                inputMode={item.inputMode}
                type={item.key === "support_email" ? "email" : "text"}
                className="w-full border border-surface-container-highest bg-tactical-black p-3 font-data-mono text-signal-orange focus:border-signal-orange focus:outline-none disabled:opacity-60"
                required
              />
            </section>
          );
        })}

        <section className="border border-surface-container-highest bg-charcoal-field p-stack-md lg:col-span-2">
          <div className="mb-stack-md flex items-start justify-between gap-4">
            <div>
              <h2 className="font-headline-md text-headline-md uppercase text-stark-white">
                Admin Access
              </h2>
              <p className="mt-2 font-body-md text-on-surface-variant">
                Password-protected admin sessions are enforced before
                operational pages load.
              </p>
            </div>
            <div className="border border-signal-orange/50 bg-tactical-black p-3 text-signal-orange">
              <KeyRound className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center gap-3 border-t border-surface-container-highest pt-stack-sm font-data-mono text-signal-orange">
            <ShieldCheck className="h-5 w-5" />
            Protected
          </div>
        </section>

        <div className="lg:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={saving || loading}
            className="bg-signal-orange px-5 py-3 font-label-caps text-tactical-black hover:bg-stark-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
