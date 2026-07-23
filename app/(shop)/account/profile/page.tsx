import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries";
import { ProfileEditor } from "@/components/account/ProfileEditor";

export default async function AccountProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/account/profile");

  const profile = await getProfile();
  const accountType: "email" | "phone" = user.email?.endsWith("@phone.srboutique.app")
    ? "phone"
    : "email";
  const displayEmail = accountType === "phone" ? undefined : user.email;
  const authEmail = user.email ?? undefined;

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Profile Details</h2>
      <p className="mt-1 text-sm text-gray-500">Update your name, username, and contact info</p>
      <div className="mt-6">
        <ProfileEditor
          profile={profile}
          email={displayEmail}
          authEmail={authEmail}
          accountType={accountType}
        />
      </div>
    </div>
  );
}
