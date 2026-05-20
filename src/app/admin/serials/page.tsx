import { Plus, Search, Filter, Download } from "lucide-react";

export default function SerialsPage() {
  return (
    <div className="space-y-stack-lg animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display-xl text-headline-lg text-stark-white uppercase">Serial Numbers</h1>
          <p className="font-body-md text-on-surface-variant">Manage and generate product authenticity codes.</p>
        </div>
        <button className="flex items-center gap-2 bg-signal-orange text-tactical-black font-label-caps px-4 py-2 hover:bg-stark-white transition-colors">
          <Plus className="w-4 h-4" />
          GENERATE BATCH
        </button>
      </div>

      <div className="bg-charcoal-field border border-surface-container-highest">
        {/* Toolbar */}
        <div className="p-4 border-b border-surface-container-highest flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-1 max-w-md bg-tactical-black border border-surface-container-highest px-3 py-2">
            <Search className="w-5 h-5 text-on-surface-variant mr-2" />
            <input 
              type="text" 
              placeholder="Search serials..." 
              className="bg-transparent border-none text-stark-white font-data-mono w-full focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 border border-surface-container-highest bg-tactical-black px-4 py-2 text-on-surface-variant hover:text-signal-orange transition-colors">
              <Filter className="w-4 h-4" />
              <span className="font-label-caps">FILTER</span>
            </button>
            <button className="flex items-center gap-2 border border-surface-container-highest bg-tactical-black px-4 py-2 text-on-surface-variant hover:text-signal-orange transition-colors">
              <Download className="w-4 h-4" />
              <span className="font-label-caps">EXPORT</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-container-highest bg-surface-container-lowest">
                <th className="font-label-caps text-on-surface-variant py-3 px-4 uppercase">Serial Code</th>
                <th className="font-label-caps text-on-surface-variant py-3 px-4 uppercase">Product</th>
                <th className="font-label-caps text-on-surface-variant py-3 px-4 uppercase">Status</th>
                <th className="font-label-caps text-on-surface-variant py-3 px-4 uppercase">Generated</th>
                <th className="font-label-caps text-on-surface-variant py-3 px-4 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-data-mono text-sm text-stark-white">
              {/* Mock Row 1 */}
              <tr className="border-b border-surface-container-highest/50 hover:bg-surface-container-highest/30">
                <td className="py-3 px-4 text-signal-orange">DRH-VEST-2605-A1B2</td>
                <td className="py-3 px-4">TBP VEST MK-IV</td>
                <td className="py-3 px-4"><span className="bg-operator-green/20 text-operator-green px-2 py-1 rounded-full text-xs">ACTIVE</span></td>
                <td className="py-3 px-4 text-on-surface-variant">2026-05-20</td>
                <td className="py-3 px-4 text-right">
                  <button className="text-on-surface-variant hover:text-signal-orange underline mr-3">Print QR</button>
                  <button className="text-on-surface-variant hover:text-error underline">Revoke</button>
                </td>
              </tr>
              {/* Mock Row 2 */}
              <tr className="border-b border-surface-container-highest/50 hover:bg-surface-container-highest/30">
                <td className="py-3 px-4 text-signal-orange">DRH-PACK-2605-X9Y8</td>
                <td className="py-3 px-4">RECON DAYPACK 25L</td>
                <td className="py-3 px-4"><span className="bg-surface-container-highest text-on-surface-variant px-2 py-1 rounded-full text-xs">USED</span></td>
                <td className="py-3 px-4 text-on-surface-variant">2026-05-18</td>
                <td className="py-3 px-4 text-right">
                  <button className="text-on-surface-variant hover:text-signal-orange underline mr-3">Print QR</button>
                  <button className="text-on-surface-variant hover:text-error underline">Revoke</button>
                </td>
              </tr>
              {/* Mock Row 3 */}
              <tr className="hover:bg-surface-container-highest/30">
                <td className="py-3 px-4 text-signal-orange">DRH-BELT-2605-77PQ</td>
                <td className="py-3 px-4">OPERATOR BELT GEN 2</td>
                <td className="py-3 px-4"><span className="bg-error/20 text-error px-2 py-1 rounded-full text-xs">REVOKED</span></td>
                <td className="py-3 px-4 text-on-surface-variant">2026-05-15</td>
                <td className="py-3 px-4 text-right">
                  <button className="text-on-surface-variant hover:text-signal-orange underline mr-3">Print QR</button>
                  <button className="text-on-surface-variant hover:text-stark-white underline">Restore</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
