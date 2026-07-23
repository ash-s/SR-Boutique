"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AdminSetupNotice() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      setIsAdmin(data?.role === "admin");
    };
    check();
  }, []);

  if (isAdmin !== false || !userId) return null;

  const sql = `UPDATE profiles SET role = 'admin' WHERE id = '${userId}';`;

  return (
    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <h3 className="font-semibold text-amber-900">Admin access required</h3>
      <p className="mt-1 text-sm text-amber-800">
        Your account is not admin yet. Run these steps in Supabase:
      </p>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-amber-900">
        <li>Open Supabase → SQL Editor → New query</li>
        <li>Paste and run the file <code className="rounded bg-amber-100 px-1">supabase/migrations/006_fix_permissions.sql</code></li>
        <li>Then run this to make yourself admin:</li>
      </ol>
      <pre className="mt-2 overflow-x-auto rounded-lg bg-gray-900 p-3 text-xs text-green-400">
        {sql}
      </pre>
      <p className="mt-2 text-xs text-amber-700">
        After running, refresh this page. You can then add products, categories, and images.
      </p>
    </div>
  );
}
