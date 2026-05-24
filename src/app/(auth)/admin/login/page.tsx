'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Login failed.');
        return;
      }

      router.replace('/admin');
      router.refresh();
    } catch {
      setError('Unable to connect to admin login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-tactical-black px-margin-edge py-section-gap flex items-center justify-center">
      <form onSubmit={submitLogin} className="w-full max-w-md border border-surface-container-highest bg-charcoal-field p-stack-lg">
        <h1 className="font-display-xl text-headline-lg uppercase text-stark-white">Admin Login</h1>
        <p className="mt-stack-sm font-body-md text-on-surface-variant">
          Enter the admin password to access the Durhaim command center.
        </p>
        <div className="mt-stack-lg space-y-stack-md">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            className="w-full bg-tactical-black border border-surface-container-highest p-3 font-data-mono text-stark-white focus:border-signal-orange focus:outline-none"
            placeholder="USER EMAIL"
            required
          />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            className="w-full bg-tactical-black border border-surface-container-highest p-3 font-data-mono text-stark-white focus:border-signal-orange focus:outline-none"
            placeholder="ADMIN PASSWORD"
            required
          />
          {error && <p className="font-data-mono text-data-mono text-error">{error}</p>}
          <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-60">
            {loading ? 'Checking...' : 'Enter Admin'}
          </button>
        </div>
      </form>
    </main>
  );
}
