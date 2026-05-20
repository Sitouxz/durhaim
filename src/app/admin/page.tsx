import { QrCode, Activity } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="space-y-stack-lg animate-in fade-in duration-500">
      <div>
        <h1 className="font-display-xl text-headline-lg text-stark-white uppercase">Overview</h1>
        <p className="font-body-md text-on-surface-variant">System status and operational metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
        <div className="bg-charcoal-field border border-surface-container-highest p-stack-md flex flex-col gap-4 shadow-sm hover:border-signal-orange transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-on-surface-variant uppercase">Total Products</span>
            <BoxIcon className="text-signal-orange w-5 h-5" />
          </div>
          <span className="font-display-xl text-4xl text-stark-white">3</span>
        </div>
        <div className="bg-charcoal-field border border-surface-container-highest p-stack-md flex flex-col gap-4 shadow-sm hover:border-signal-orange transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-on-surface-variant uppercase">Active Serials</span>
            <QrCode className="text-signal-orange w-5 h-5" />
          </div>
          <span className="font-display-xl text-4xl text-stark-white">1,240</span>
        </div>
        <div className="bg-charcoal-field border border-surface-container-highest p-stack-md flex flex-col gap-4 shadow-sm hover:border-signal-orange transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-on-surface-variant uppercase">Verifications (30d)</span>
            <Activity className="text-signal-orange w-5 h-5" />
          </div>
          <span className="font-display-xl text-4xl text-stark-white">85</span>
        </div>
        <div className="bg-charcoal-field border border-surface-container-highest p-stack-md flex flex-col gap-4 shadow-sm hover:border-signal-orange transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-on-surface-variant uppercase">System Status</span>
            <div className="w-2 h-2 rounded-full bg-operator-green animate-pulse"></div>
          </div>
          <span className="font-data-mono text-operator-green text-lg">OPERATIONAL</span>
        </div>
      </div>

      <div className="bg-charcoal-field border border-surface-container-highest p-stack-lg">
        <h2 className="font-headline-md text-stark-white uppercase mb-stack-md">Recent Verifications</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-container-highest">
                <th className="font-label-caps text-on-surface-variant py-3 px-4 uppercase">Serial Number</th>
                <th className="font-label-caps text-on-surface-variant py-3 px-4 uppercase">Product</th>
                <th className="font-label-caps text-on-surface-variant py-3 px-4 uppercase">Status</th>
                <th className="font-label-caps text-on-surface-variant py-3 px-4 uppercase">Time</th>
              </tr>
            </thead>
            <tbody className="font-data-mono text-sm text-stark-white">
              <tr className="border-b border-surface-container-highest/50 hover:bg-surface-container-highest/30">
                <td className="py-3 px-4 text-signal-orange">DRH-VEST-2605-A1B2</td>
                <td className="py-3 px-4">TBP VEST MK-IV</td>
                <td className="py-3 px-4 text-operator-green">SUCCESS</td>
                <td className="py-3 px-4 text-on-surface-variant">2 mins ago</td>
              </tr>
              <tr className="border-b border-surface-container-highest/50 hover:bg-surface-container-highest/30">
                <td className="py-3 px-4 text-signal-orange">DRH-PACK-2605-X9Y8</td>
                <td className="py-3 px-4">RECON DAYPACK 25L</td>
                <td className="py-3 px-4 text-error">FAILED</td>
                <td className="py-3 px-4 text-on-surface-variant">15 mins ago</td>
              </tr>
              <tr className="hover:bg-surface-container-highest/30">
                <td className="py-3 px-4 text-signal-orange">DRH-BELT-2605-77PQ</td>
                <td className="py-3 px-4">OPERATOR BELT GEN 2</td>
                <td className="py-3 px-4 text-operator-green">SUCCESS</td>
                <td className="py-3 px-4 text-on-surface-variant">1 hour ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function BoxIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}
