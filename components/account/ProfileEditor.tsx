"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { validateUsername } from "@/lib/auth-utils";
import { ensureProfile, formatSupabaseError } from "@/lib/profile-utils";
import { Profile } from "@/lib/types";
import { useEffect } from "react";

interface ProfileEditorProps {
  profile: Profile | null;
  email: string | undefined;
  authEmail: string | undefined;
  accountType: "email" | "phone";
}

export function ProfileEditor({ profile, email, authEmail, accountType }: ProfileEditorProps) {
  const router = useRouter();
  const supabase = createClient();
  const isPhoneAccount = accountType === "phone";

  const [form, setForm] = useState({
    username: profile?.username || "",
    full_name: profile?.full_name || "",
    phone: profile?.phone?.replace("+91", "") || "",
    recovery_email: profile?.recovery_email || "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !profile) {
        await ensureProfile(supabase, user);
        router.refresh();
      }
    };
    init();
  }, [profile, router, supabase]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const usernameErr = validateUsername(form.username);
    if (usernameErr) {
      setError(usernameErr);
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    await ensureProfile(supabase, user);

    const phone = form.phone ? `+91${form.phone.replace(/\D/g, "").slice(-10)}` : null;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        username: form.username.toLowerCase(),
        full_name: form.full_name,
        phone,
        recovery_email: form.recovery_email.trim() || null,
      })
      .eq("id", user.id);

    setLoading(false);

    if (updateError) {
      if (updateError.message.includes("unique")) {
        setError("Username already taken. Choose another.");
      } else {
        setError(formatSupabaseError(updateError));
      }
    } else {
      setMessage("Profile updated successfully!");
      router.refresh();
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setMessage("Password updated!");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-900">Edit Profile</h2>
      <p className="mt-1 text-sm text-gray-500">
        Update your account details below.
      </p>

      {error && <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {message && <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-800">{message}</div>}

      <form onSubmit={saveProfile} className="mt-4 space-y-4">
        <Input
          label="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })}
          required
          className="h-11"
        />
        <Input
          label="Display Name"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          className="h-11"
        />
        <Input
          label="Phone Number"
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="9500943141"
          className="h-11"
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            {isPhoneAccount ? "Login Email (internal)" : "Login Email"}
          </label>
          <p className="rounded-lg bg-gray-50 px-3 py-2.5 text-sm text-gray-600">
            {isPhoneAccount
              ? authEmail || "Phone account"
              : email || "Not set"}
          </p>
          {isPhoneAccount && (
            <p className="mt-1 text-xs text-gray-500">
              Phone accounts use an internal email for login. Your phone number is used to sign in.
            </p>
          )}
        </div>

        <Input
          label="Recovery Email"
          type="email"
          placeholder="Backup email for password reset"
          value={form.recovery_email}
          onChange={(e) => setForm({ ...form, recovery_email: e.target.value })}
          className="h-11"
        />
        <p className="-mt-2 text-xs text-gray-500">
          Used to recover your account if you forget your password.
        </p>

        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Profile"}
        </Button>
      </form>

      <form onSubmit={changePassword} className="mt-8 space-y-4 border-t pt-6">
        <h3 className="font-medium text-gray-900">Change Password</h3>
        <PasswordInput
          label="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          minLength={6}
        />
        <PasswordInput
          label="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <Button type="submit" variant="outline" disabled={loading}>
          Update Password
        </Button>
      </form>
    </div>
  );
}
