import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { requireAdminRole } from "@/lib/admin-permissions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const authorization = await requireAdminRole(supabase, ["OWNER", "ADMIN", "STAFF"]);
    if (authorization.error) return authorization.error;

    const { data, error } = await supabase
      .from("product_series")
      .select("id, name, slug, display_order, category_id, categories(name, slug)")
      .order("display_order")
      .order("name");
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("Error fetching product series:", error);
    return NextResponse.json({ error: "Product series are unavailable. Apply the storefront catalogue migration." }, { status: 503 });
  }
}
