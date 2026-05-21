'use client';

import { QrCode, Activity, Box, AlertTriangle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type Serial = {
  id: string;
  serial: string;
  status: string;
  verification_count: number;
  created_at: string;
  products?: { name?: string } | { name?: string }[] | null;
};

type Product = {
  id: string;
  name: string;
};

function getProductName(product: Serial['products']) {
  if (Array.isArray(product)) return product[0]?.name ?? 'Unknown';
  return product?.name ?? 'Unknown';
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [serials, setSerials] = useState<Serial[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [productsRes, serialsRes] = await Promise.all([
          fetch('/api/admin/products'),
          fetch('/api/admin/serials'),
        ]);

        const productsData = await productsRes.json().catch(() => []);
        const serialsData = await serialsRes.json().catch(() => []);

        if (!productsRes.ok) throw new Error(productsData.error || 'Failed to load products.');
        if (!serialsRes.ok) throw new Error(serialsData.error || 'Failed to load serials.');

        setProducts(productsData);
        setSerials(serialsData);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const metrics = useMemo(() => {
    return {
      activeSerials: serials.filter((serial) => serial.status === 'ACTIVE').length,
      revokedSerials: serials.filter((serial) => serial.status === 'REVOKED').length,
      verificationTotal: serials.reduce((sum, serial) => sum + (serial.verification_count || 0), 0),
    };
  }, [serials]);

  const recentSerials = serials.slice(0, 5);

  return (
    <div className="space-y-stack-lg animate-in fade-in duration-500">
      <div>
        <h1 className="font-display-xl text-headline-lg text-stark-white uppercase">Overview</h1>
        <p className="font-body-md text-on-surface-variant">System status and operational metrics.</p>
      </div>

      {error && (
        <div className="flex items-start gap-3 border border-error bg-error-container/20 p-4 text-error">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
        <MetricCard label="Total Products" value={loading ? '...' : products.length.toString()} icon={<Box className="text-signal-orange w-5 h-5" />} />
        <MetricCard label="Active Serials" value={loading ? '...' : metrics.activeSerials.toString()} icon={<QrCode className="text-signal-orange w-5 h-5" />} />
        <MetricCard label="Verifications" value={loading ? '...' : metrics.verificationTotal.toString()} icon={<Activity className="text-signal-orange w-5 h-5" />} />
        <MetricCard label="Revoked" value={loading ? '...' : metrics.revokedSerials.toString()} icon={<div className="w-2 h-2 rounded-full bg-error" />} />
      </div>

      <div className="bg-charcoal-field border border-surface-container-highest p-stack-lg">
        <h2 className="font-headline-md text-stark-white uppercase mb-stack-md">Recent Serials</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-container-highest">
                <th className="font-label-caps text-on-surface-variant py-3 px-4 uppercase">Serial Number</th>
                <th className="font-label-caps text-on-surface-variant py-3 px-4 uppercase">Product</th>
                <th className="font-label-caps text-on-surface-variant py-3 px-4 uppercase">Status</th>
                <th className="font-label-caps text-on-surface-variant py-3 px-4 uppercase">Scans</th>
              </tr>
            </thead>
            <tbody className="font-data-mono text-sm text-stark-white">
              {loading ? (
                <tr><td className="py-8 text-center text-on-surface-variant" colSpan={4}>Loading...</td></tr>
              ) : recentSerials.length === 0 ? (
                <tr><td className="py-8 text-center text-on-surface-variant" colSpan={4}>No serial data available.</td></tr>
              ) : (
                recentSerials.map((serial) => (
                  <tr key={serial.id} className="border-b border-surface-container-highest/50 hover:bg-surface-container-highest/30">
                    <td className="py-3 px-4 text-signal-orange">{serial.serial}</td>
                    <td className="py-3 px-4">{getProductName(serial.products)}</td>
                    <td className="py-3 px-4">{serial.status}</td>
                    <td className="py-3 px-4 text-on-surface-variant">{serial.verification_count || 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-charcoal-field border border-surface-container-highest p-stack-md flex flex-col gap-4 shadow-sm hover:border-signal-orange transition-colors">
      <div className="flex items-center justify-between">
        <span className="font-label-caps text-on-surface-variant uppercase">{label}</span>
        {icon}
      </div>
      <span className="font-display-xl text-4xl text-stark-white">{value}</span>
    </div>
  );
}
