import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountSidebar } from "@/components/account/AccountSidebar";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/account");

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">My Account</h1>
        <p className="mt-1 text-sm text-gray-500">Orders, profile, and saved addresses</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr] lg:gap-8">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <AccountSidebar />
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
