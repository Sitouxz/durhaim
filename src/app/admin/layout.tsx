import Link from "next/link";
import { cookies } from "next/headers";
import { LayoutDashboard, Box, FolderTree, QrCode, Settings, Users } from "lucide-react";
import AdminSignOutButton from "@/components/AdminSignOutButton";
import { ADMIN_SESSION_COOKIE, getAdminSessionUser } from "@/lib/admin-auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionUser = await getAdminSessionUser((await cookies()).get(ADMIN_SESSION_COOKIE)?.value);

  return (
    <div className="flex h-screen bg-surface-container-lowest text-stark-white font-body-md overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-tactical-black border-r border-surface-container-highest flex flex-col hidden md:flex">
        <div className="p-stack-md border-b border-surface-container-highest">
          <Link href="/admin" className="font-display-xl text-headline-md text-stark-white uppercase tracking-tighter hover:text-signal-orange transition-colors">
            DURHAIM ADMIN
          </Link>
          <div className="font-data-mono text-xs text-signal-orange mt-1 uppercase">Command Center</div>
        </div>

        <nav className="flex-1 py-stack-md">
          <ul className="space-y-2 px-4">
            <li>
              <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-surface-container-highest text-on-surface-variant hover:text-signal-orange transition-colors">
                <LayoutDashboard className="w-5 h-5" />
                <span className="font-label-caps uppercase">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link href="/admin/products" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-surface-container-highest text-on-surface-variant hover:text-signal-orange transition-colors">
                <Box className="w-5 h-5" />
                <span className="font-label-caps uppercase">Products</span>
              </Link>
            </li>
            <li>
              <Link href="/admin/categories" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-surface-container-highest text-on-surface-variant hover:text-signal-orange transition-colors">
                <FolderTree className="w-5 h-5" />
                <span className="font-label-caps uppercase">Categories</span>
              </Link>
            </li>
            <li>
              <Link href="/admin/serials" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-surface-container-highest text-on-surface-variant hover:text-signal-orange transition-colors">
                <QrCode className="w-5 h-5" />
                <span className="font-label-caps uppercase">Serial Numbers</span>
              </Link>
            </li>
            <li>
              <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-surface-container-highest text-on-surface-variant hover:text-signal-orange transition-colors">
                <Users className="w-5 h-5" />
                <span className="font-label-caps uppercase">Users</span>
              </Link>
            </li>
            <li>
              <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-surface-container-highest text-on-surface-variant hover:text-signal-orange transition-colors">
                <Settings className="w-5 h-5" />
                <span className="font-label-caps uppercase">Settings</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="p-stack-md border-t border-surface-container-highest">
          <AdminSignOutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Topbar (Mobile support & User context) */}
        <header className="h-16 bg-tactical-black border-b border-surface-container-highest flex items-center justify-between px-stack-lg">
          <div className="font-label-caps text-on-surface-variant uppercase md:hidden">
            Durhaim Admin
          </div>
          <div className="flex-1"></div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center border border-stark-white/20">
              <span className="font-label-caps text-xs">AD</span>
            </div>
            <span className="font-data-mono text-sm text-stark-white hidden md:block">{sessionUser?.email ?? 'admin@durhaim.com'}</span>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-stack-lg bg-background">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
