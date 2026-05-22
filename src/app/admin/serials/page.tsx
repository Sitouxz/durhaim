'use client';

import { Plus, Search, Filter, Download } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';

type Product = {
  id: string;
  name: string;
  slug: string;
};

type Serial = {
  id: string;
  serial: string;
  status: string;
  verification_count: number;
  created_at: string;
  products: {
    id: string;
    name: string;
  } | { id: string; name: string }[] | null;
};

export default function SerialsPage() {
  const [serials, setSerials] = useState<Serial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [error, setError] = useState('');

  // Modal state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [generateCount, setGenerateCount] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchSerials = useCallback(async (searchQuery = '', nextStatus = 'ALL') => {
    setLoading(true);
    setError('');
    try {
      const url = new URL('/api/admin/serials', window.location.origin);
      if (searchQuery) url.searchParams.set('search', searchQuery);
      if (nextStatus !== 'ALL') url.searchParams.set('status', nextStatus);
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setSerials(data);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to load serial numbers.');
        setSerials([]);
      }
    } catch (e) {
      console.error(e);
      setError('Failed to connect to serial number API.');
    }
    setLoading(false);
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        if (data.length > 0) setSelectedProduct(data[0].id);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to load products for serial generation.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSerials();
    fetchProducts();
  }, [fetchSerials]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSerials(search, statusFilter);
  };

  const handleStatusFilter = (nextStatus: string) => {
    setStatusFilter(nextStatus);
    fetchSerials(search, nextStatus);
  };

  const exportCsv = () => {
    const rows = serials.map((s) => [
      s.serial,
      getProductName(s.products),
      s.status,
      s.verification_count || 0,
      new Date(s.created_at).toISOString(),
    ]);
    const csv = [['Serial', 'Product', 'Status', 'Scans', 'Generated'], ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'durhaim-serials.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadBulkQR = async () => {
    if (serials.length === 0) {
      alert('No serials available to download. Adjust filters or generate serials first.');
      return;
    }

    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 12;
      const columns = 2;
      const labelWidth = (pageWidth - margin * 2) / columns;
      const labelHeight = 82;
      const qrSize = 38;

      for (let index = 0; index < serials.length; index++) {
        if (index > 0 && index % 6 === 0) {
          pdf.addPage();
        }

        const pageIndex = index % 6;
        const col = pageIndex % columns;
        const row = Math.floor(pageIndex / columns);
        const x = margin + col * labelWidth;
        const y = margin + row * labelHeight;
        const serial = serials[index];
        const productName = getProductName(serial.products);
        const verifyUrl = `${window.location.origin}/verify/${serial.serial}`;
        const dataUrl = await QRCode.toDataURL(verifyUrl, { width: 320, margin: 2 });

        pdf.setDrawColor(40, 40, 40);
        pdf.rect(x + 2, y + 2, labelWidth - 4, labelHeight - 6);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.text('DURHAIM', x + labelWidth / 2, y + 11, { align: 'center' });
        pdf.addImage(dataUrl, 'PNG', x + (labelWidth - qrSize) / 2, y + 15, qrSize, qrSize);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.text(serial.serial, x + labelWidth / 2, y + 60, { align: 'center' });
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.text(productName.slice(0, 42), x + labelWidth / 2, y + 67, { align: 'center' });
        pdf.text('Scan to Verify Authenticity', x + labelWidth / 2, y + 74, { align: 'center' });
      }

      const date = new Date().toISOString().slice(0, 10);
      pdf.save(`durhaim-qr-labels-${date}.pdf`);
    } catch (e) {
      console.error(e);
      alert('Error generating bulk QR PDF.');
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || generateCount < 1) return;
    setIsGenerating(true);

    try {
      const res = await fetch('/api/admin/serials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: selectedProduct, count: generateCount })
      });
      if (res.ok) {
        setShowGenerateModal(false);
        fetchSerials(search, statusFilter);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to generate serials.");
      }
    } catch (e) {
      console.error(e);
      alert("Error generating serials.");
    }
    setIsGenerating(false);
  };

  const updateSerialStatus = async (id: string, status: 'INACTIVE' | 'ACTIVE' | 'REVOKED') => {
    if (!confirm(`Are you sure you want to change this serial to ${status}?`)) return;

    try {
      const res = await fetch('/api/admin/serials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serialId: id, status })
      });
      if (res.ok) {
        fetchSerials(search, statusFilter);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to update serial status.');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating serial status.');
    }
  };

  const printQR = async (serial: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked. Please allow pop-ups for this site to print QR labels.');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR - ${serial}</title>
          <style>
            body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: monospace; background: white; color: black; }
          </style>
        </head>
        <body>Generating QR label...</body>
      </html>
    `);
    printWindow.document.close();

    try {
      const verifyUrl = `${window.location.origin}/verify/${serial}`;
      const dataUrl = await QRCode.toDataURL(verifyUrl, { width: 300, margin: 2 });

      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR - ${serial}</title>
            <style>
              body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: monospace; background: white; color: black; }
              .label { text-align: center; border: 2px solid black; padding: 20px; max-width: 400px; }
              .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
              img { width: 250px; height: 250px; }
              .serial { font-size: 18px; margin-top: 10px; font-weight: bold; letter-spacing: 2px; }
              @media print { body { height: auto; } .label { border: none; } }
            </style>
          </head>
          <body></body>
        </html>
      `);
      printWindow.document.close();

      const label = printWindow.document.createElement('div');
      label.className = 'label';

      const logo = printWindow.document.createElement('div');
      logo.className = 'logo';
      logo.textContent = 'DURHAIM';

      const qrImage = printWindow.document.createElement('img');
      qrImage.alt = `QR code for ${serial}`;
      qrImage.onload = () => {
        printWindow.focus();
        setTimeout(() => printWindow.print(), 100);
      };

      const serialText = printWindow.document.createElement('div');
      serialText.className = 'serial';
      serialText.textContent = serial;

      const caption = printWindow.document.createElement('div');
      caption.style.fontSize = '12px';
      caption.style.marginTop = '5px';
      caption.textContent = 'Scan to Verify Authenticity';

      label.append(logo, qrImage, serialText, caption);
      printWindow.document.body.replaceChildren(label);
      qrImage.src = dataUrl;
    } catch (e) {
      console.error(e);
      printWindow.document.body.textContent = 'Error generating QR code. Please close this tab and try again.';
      alert('Error generating QR code');
    }
  };

  const getProductName = (prod: Serial['products']) => {
    if (Array.isArray(prod) && prod.length > 0) return prod[0].name;
    if (prod && !Array.isArray(prod) && 'name' in prod) return prod.name;
    return 'Unknown';
  };

  return (
    <div className="space-y-stack-lg animate-in fade-in duration-500 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display-xl text-headline-lg text-stark-white uppercase">Serial Numbers</h1>
          <p className="font-body-md text-on-surface-variant">Manage and generate product authenticity codes.</p>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center gap-2 bg-signal-orange text-tactical-black font-label-caps px-4 py-2 hover:bg-stark-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          GENERATE BATCH
        </button>
      </div>

      {error && (
        <div className="border border-error bg-error-container/20 p-4 font-body-md text-error">
          {error}
        </div>
      )}

      <div className="bg-charcoal-field border border-surface-container-highest">
        {/* Toolbar */}
        <div className="p-4 border-b border-surface-container-highest flex flex-col sm:flex-row gap-4 justify-between">
          <form onSubmit={handleSearch} className="flex flex-1 max-w-md bg-tactical-black border border-surface-container-highest px-3 py-2">
            <Search className="w-5 h-5 text-on-surface-variant mr-2" />
            <input
              type="text"
              placeholder="Search serials..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none text-stark-white font-data-mono w-full focus:outline-none"
            />
          </form>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(event) => handleStatusFilter(event.target.value)}
              className="border border-surface-container-highest bg-tactical-black px-4 py-2 text-on-surface-variant hover:text-signal-orange transition-colors font-label-caps"
            >
              <option value="ALL">ALL STATUS</option>
              <option value="INACTIVE">UNACTIVATED</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="REVOKED">REVOKED</option>
            </select>
            <button type="button" onClick={() => fetchSerials(search, statusFilter)} className="flex items-center gap-2 border border-surface-container-highest bg-tactical-black px-4 py-2 text-on-surface-variant hover:text-signal-orange transition-colors">
              <Filter className="w-4 h-4" />
              <span className="font-label-caps">FILTER</span>
            </button>
            <button type="button" onClick={exportCsv} className="flex items-center gap-2 border border-surface-container-highest bg-tactical-black px-4 py-2 text-on-surface-variant hover:text-signal-orange transition-colors">
              <Download className="w-4 h-4" />
              <span className="font-label-caps">EXPORT</span>
            </button>
            <button type="button" onClick={downloadBulkQR} className="flex items-center gap-2 border border-surface-container-highest bg-tactical-black px-4 py-2 text-on-surface-variant hover:text-signal-orange transition-colors">
              <Download className="w-4 h-4" />
              <span className="font-label-caps">QR PDF</span>
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
                <th className="font-label-caps text-on-surface-variant py-3 px-4 uppercase">Scans</th>
                <th className="font-label-caps text-on-surface-variant py-3 px-4 uppercase">Generated</th>
                <th className="font-label-caps text-on-surface-variant py-3 px-4 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-data-mono text-sm text-stark-white">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-on-surface-variant">Loading serials...</td></tr>
              ) : serials.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-on-surface-variant">No serials found.</td></tr>
              ) : (
                serials.map(s => (
                  <tr key={s.id} className="border-b border-surface-container-highest/50 hover:bg-surface-container-highest/30">
                    <td className="py-3 px-4 text-signal-orange">{s.serial}</td>
                    <td className="py-3 px-4">{getProductName(s.products)}</td>
                    <td className="py-3 px-4">
                      {s.status === 'INACTIVE' && <span className="bg-surface-container-highest text-on-surface-variant px-2 py-1 rounded-full text-xs">UNACTIVATED</span>}
                      {s.status === 'ACTIVE' && <span className="bg-operator-green/20 text-operator-green px-2 py-1 rounded-full text-xs">ACTIVE</span>}
                      {s.status === 'REVOKED' && <span className="bg-error/20 text-error px-2 py-1 rounded-full text-xs">REVOKED</span>}
                    </td>
                    <td className="py-3 px-4">{s.verification_count || 0}</td>
                    <td className="py-3 px-4 text-on-surface-variant">{new Date(s.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => printQR(s.serial)} className="text-on-surface-variant hover:text-signal-orange underline mr-3">Print QR</button>
                      {s.status !== 'ACTIVE' && (
                        <button onClick={() => updateSerialStatus(s.id, 'ACTIVE')} className="text-stark-white hover:text-signal-orange underline mr-3">
                          Activate
                        </button>
                      )}
                      {s.status !== 'INACTIVE' && s.status !== 'REVOKED' && (
                        <button onClick={() => updateSerialStatus(s.id, 'INACTIVE')} className="text-on-surface-variant hover:text-signal-orange underline mr-3">
                          Reset
                        </button>
                      )}
                      {s.status !== 'REVOKED' && (
                        <button onClick={() => updateSerialStatus(s.id, 'REVOKED')} className="text-error hover:text-error/80 underline">
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-tactical-black/80 backdrop-blur-sm p-4">
          <div className="bg-charcoal-field border border-surface-container-highest w-full max-w-md p-stack-lg shadow-2xl">
            <div className="flex justify-between items-center mb-stack-md">
              <h2 className="font-headline-md text-stark-white uppercase">Generate Serials</h2>
              <button onClick={() => setShowGenerateModal(false)} className="text-on-surface-variant hover:text-signal-orange">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleGenerate} className="space-y-stack-md">
              <div>
                <label className="block font-label-caps text-on-surface-variant mb-2">Target Product</label>
                <select
                  className="w-full bg-tactical-black border border-surface-container-highest text-stark-white p-3 focus:border-signal-orange"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  required
                >
                  <option value="" disabled>Select a product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-label-caps text-on-surface-variant mb-2">Quantity to Generate</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  className="w-full bg-tactical-black border border-surface-container-highest text-stark-white p-3 focus:border-signal-orange font-data-mono"
                  value={generateCount}
                  onChange={(e) => setGenerateCount(parseInt(e.target.value) || 1)}
                  required
                />
              </div>

              <div className="pt-stack-sm flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 border border-surface-container-highest text-stark-white hover:bg-surface-container-highest"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-4 py-2 bg-signal-orange text-tactical-black font-label-caps hover:bg-stark-white disabled:opacity-50"
                >
                  {isGenerating ? 'GENERATING...' : 'GENERATE BATCH'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
