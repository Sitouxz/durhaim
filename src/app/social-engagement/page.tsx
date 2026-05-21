import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Social Engagement - DURHAIM',
  description: 'Follow Durhaim field updates, project drops, and tactical gear community channels.',
};

const channels = [
  {
    name: 'Instagram',
    handle: '@durhaimgear',
    href: 'https://www.instagram.com/durhaimgear/',
    description: 'Product drops, field photos, build details, and workshop updates.',
  },
  {
    name: 'Facebook',
    handle: 'Durhaim Army Gear',
    href: 'https://www.facebook.com/durhaimarmygear/',
    description: 'Community announcements, campaign posts, and reseller updates.',
  },
  {
    name: 'YouTube',
    handle: 'Durhaim Channel',
    href: 'https://www.youtube.com/channel/UCRQa9l9_warxaVLGWLPVsXw',
    description: 'Long-form product walkthroughs, usage references, and field media.',
  },
];

export default function SocialEngagementPage() {
  return (
    <main className="bg-texture flex-grow">
      <section className="border-b border-surface-container-highest px-margin-edge py-section-gap">
        <div className="mx-auto grid max-w-[1440px] gap-gutter lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <h1 className="font-display-xl text-headline-lg-mobile uppercase tracking-tighter text-stark-white md:text-display-xl">
              Social Engagement
            </h1>
            <p className="mt-stack-md max-w-3xl border-l-2 border-signal-orange pl-4 font-body-lg text-stark-white/85">
              Track current releases, field references, and build notes through Durhaim&apos;s active public channels.
            </p>
          </div>
          <div className="lg:col-span-4 lg:text-right">
            <Link className="btn btn-primary inline-flex" href="/catalogue">
              View Catalogue
            </Link>
          </div>
        </div>
      </section>

      <section className="px-margin-edge py-section-gap">
        <div className="mx-auto grid max-w-[1440px] gap-gutter md:grid-cols-3">
          {channels.map((channel) => (
            <a
              key={channel.name}
              href={channel.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group border border-surface-container-highest bg-charcoal-field p-stack-lg transition-colors hover:border-signal-orange"
            >
              <div className="font-data-mono text-data-mono uppercase text-signal-orange">{channel.handle}</div>
              <h2 className="mt-stack-sm font-headline-md text-headline-md uppercase text-stark-white group-hover:text-signal-orange">
                {channel.name}
              </h2>
              <p className="mt-stack-md font-body-md text-on-surface-variant">{channel.description}</p>
              <div className="mt-stack-lg font-label-caps text-label-caps uppercase text-stark-white">
                Open Channel
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
