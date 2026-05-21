import { Bell, Globe2, KeyRound, ShieldCheck } from 'lucide-react';

const settings = [
  {
    icon: Globe2,
    title: 'Public Domain',
    value: 'durhaim.com',
    note: 'Used for QR certificate links and customer-facing verification URLs.',
  },
  {
    icon: Bell,
    title: 'WhatsApp Contact',
    value: '+62 821-2010-1473',
    note: 'Primary support channel shown across public pages.',
  },
  {
    icon: ShieldCheck,
    title: 'Verification Mode',
    value: 'Active',
    note: 'Serial lookup and certificate pages are available.',
  },
  {
    icon: KeyRound,
    title: 'Admin Access',
    value: 'Protected',
    note: 'Authentication wiring can be connected to Supabase Auth.',
  },
];

export default function AdminSettingsPage() {
  return (
    <div className="space-y-stack-lg animate-in fade-in duration-500">
      <div>
        <h1 className="font-display-xl text-headline-lg text-stark-white uppercase">Settings</h1>
        <p className="font-body-md text-on-surface-variant">Operational configuration for storefront, support, and verification workflows.</p>
      </div>

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-2">
        {settings.map((item) => {
          const Icon = item.icon;
          return (
            <section key={item.title} className="border border-surface-container-highest bg-charcoal-field p-stack-md">
              <div className="mb-stack-md flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-headline-md text-headline-md uppercase text-stark-white">{item.title}</h2>
                  <p className="mt-2 font-body-md text-on-surface-variant">{item.note}</p>
                </div>
                <div className="border border-signal-orange/50 bg-tactical-black p-3 text-signal-orange">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="border-t border-surface-container-highest pt-stack-sm font-data-mono text-signal-orange">
                {item.value}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
