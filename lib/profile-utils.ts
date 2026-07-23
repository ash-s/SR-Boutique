import { SupabaseClient } from "@supabase/supabase-js";

/** Ensure profile row exists for the logged-in user */
export async function ensureProfile(
  supabase: SupabaseClient,
  user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }
) {
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return;

  const meta = user.user_metadata || {};
  const fullName = (meta.full_name as string) || (meta.name as string) || "";
  const phone = (meta.phone as string) || null;
  const username =
    (meta.username as string) ||
    user.email?.split("@")[0]?.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 30) ||
    "user";

  await supabase.from("profiles").insert({
    id: user.id,
    full_name: fullName || username,
    phone,
    username: username.toLowerCase(),
    recovery_email: user.email?.endsWith("@phone.srboutique.app") ? null : user.email,
    auth_provider: (meta.auth_provider as string) || "email",
    role: "customer",
  });
}

export async function isUserAdmin(supabase: SupabaseClient): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return data?.role === "admin";
}

export function formatSupabaseError(error: { message?: string; code?: string; details?: string }): string {
  if (error.code === "42501" || error.message?.includes("permission") || error.message?.includes("403")) {
    return "Permission denied. Make sure you ran the SQL fix in Supabase and set your account as admin.";
  }
  if (error.message?.includes("column") || error.code === "42703") {
    return "Database needs updating. Run supabase/migrations/006_fix_permissions.sql in Supabase SQL Editor.";
  }
  return error.message || "Something went wrong";
}
