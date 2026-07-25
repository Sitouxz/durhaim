"use client";

import { usePathname } from "next/navigation";

/**
 * Hides customer-facing chrome on the admin surface.
 *
 * The admin section nests inside the root layout, so it inherited the storefront nav, product
 * search, language toggle, footer newsletter form and the floating WhatsApp button. The button
 * overlapped the row-level Revoke control on /admin/serials, and operators scrolled past a
 * subscribe form to reach the end of a 40,850-row table.
 */
export function StorefrontChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <>{children}</>;
}
