'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminSignOutButton() {
  const router = useRouter();
  const signOut = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={signOut}
      className="flex items-center gap-3 px-4 py-3 w-full rounded-md hover:bg-surface-container-highest text-on-surface-variant hover:text-error transition-colors"
    >
      <LogOut className="w-5 h-5" />
      <span className="font-label-caps uppercase">Sign Out</span>
    </button>
  );
}
