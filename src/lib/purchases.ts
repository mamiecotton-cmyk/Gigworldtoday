import { createServerSupabase, createSupabaseRouteClient } from "@/lib/supabaseServer";

export const RENTAL_BLUEPRINT_SLUG = "rental-blueprint";
export const RENTAL_BLUEPRINT_FILE = "no-car-gig-blueprint.pdf";
export const MEMBERS_BUCKET = "members-files";

export type MemberAccess = {
  user: { id: string; email: string | null } | null;
  hasPurchase: boolean;
};

/**
 * Returns the signed-in user (if any) and whether they own the product.
 * Ownership is matched by user id, or by the email used at checkout.
 */
export async function getMemberAccess(productSlug: string): Promise<MemberAccess> {
  const authClient = await createSupabaseRouteClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) return { user: null, hasPurchase: false };

  const admin = createServerSupabase();
  const email = user.email?.toLowerCase() ?? "";

  const filters = [`user_id.eq.${user.id}`];
  if (email) filters.push(`email.ilike.${email.replace(/[,()]/g, "")}`);

  const { data } = await admin
    .from("purchases")
    .select("id")
    .eq("product_slug", productSlug)
    .or(filters.join(","))
    .limit(1);

  return {
    user: { id: user.id, email: user.email ?? null },
    hasPurchase: !!data && data.length > 0,
  };
}
