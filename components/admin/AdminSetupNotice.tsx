"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AdminSetupNotice() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [hasServiceKey, setHasServiceKey] = useState<boolean | null>(null);

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

      try {
        const res = await fetch("/api/admin/orders", { cache: "no-store" });
        setHasServiceKey(res.status !== 500);
      } catch {
        setHasServiceKey(false);
      }
    };
    check();
  }, []);

  if (!userId) return null;

  const adminSql = `UPDATE profiles SET role = 'admin' WHERE id = '${userId}';`;

  return (
    <>
      {isAdmin === false && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="font-semibold text-amber-900">Admin access required</h3>
          <p className="mt-1 text-sm text-amber-800">
            Run in Supabase SQL Editor, then refresh:
          </p>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-gray-900 p-3 text-xs text-green-400">
            {adminSql}
          </pre>
        </div>
      )}

      {isAdmin && (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <h3 className="font-semibold">Setup for orders &amp; WhatsApp</h3>
          <ol className="mt-2 list-decimal space-y-2 pl-5">
            <li>
              Add to <code className="rounded bg-blue-100 px-1">.env.local</code> then redeploy:
              <pre className="mt-1 overflow-x-auto rounded bg-gray-900 p-2 text-xs text-green-400">
{`SUPABASE_SERVICE_ROLE_KEY=your_key_from_supabase_settings_api
CALLMEBOT_API_KEY=your_key
CALLMEBOT_PHONE=+919500943141`}
              </pre>
              Service role: Supabase → Project Settings → API → service_role key
            </li>
            <li>
              Run SQL file <code className="rounded bg-blue-100 px-1">supabase/migrations/011_admin_orders_fix.sql</code> in Supabase SQL Editor
            </li>
            <li>
              CallMeBot (free auto WhatsApp): add +34 684 73 39 54 on WhatsApp, send{" "}
              <strong>I allow callmebot to send me messages</strong>, copy API key from reply
            </li>
          </ol>
          {hasServiceKey === false && (
            <p className="mt-2 text-amber-800">
              Orders may not load until SUPABASE_SERVICE_ROLE_KEY is added.
            </p>
          )}
        </div>
      )}
    </>
  );
}
