"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { AuthLayout } from "@/components/auth/AuthLayout";
import {
  phoneToAuthEmail,
  normalizePhone,
  validateUsername,
  usernameFromEmail,
} from "@/lib/auth-utils";

export default function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("redirect") || "/";
  const supabase = useMemo(() => createClient(), []);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const finish = () => {
    router.push(redirect === "/" ? "/account" : redirect);
    router.refresh();
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    const usingPhone = Boolean(phone.trim()) && !email.trim();
    const usingEmail = Boolean(email.trim());

    if (!usingPhone && !usingEmail) {
      setError("Enter your email address or phone number");
      return;
    }

    if (usingPhone && usingEmail) {
      setError("Use either email or phone number, not both");
      return;
    }

    setLoading(true);

    let result;
    if (usingPhone) {
      const uname = fullName.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 30);
      const unameErr = validateUsername(uname);
      if (unameErr) {
        setLoading(false);
        setError("Please enter a valid name (letters/numbers, min 3 characters)");
        return;
      }
      result = await supabase.auth.signUp({
        email: phoneToAuthEmail(phone),
        password,
        options: {
          data: {
            username: uname,
            full_name: fullName,
            phone: normalizePhone(phone),
            auth_provider: "phone",
          },
        },
      });
    } else {
      result = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName || usernameFromEmail(email),
            username: usernameFromEmail(email),
            auth_provider: "email",
          },
        },
      });
    }

    setLoading(false);
    if (result.error) {
      const msg = result.error.message;
      if (msg.includes("registered") || msg.includes("already")) {
        setError("This account already exists. Try signing in.");
      } else {
        setError(msg);
      }
    } else {
      finish();
    }
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Join SR Boutique — shop with Cash on Delivery"
      footer={
        <>
          Already have an account?{" "}
          <Link
            href={`/login${redirect !== "/" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
            className="font-medium text-brand-900 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSignUp} className="space-y-4">
        <Input
          label="Full name"
          placeholder="Your name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="h-11"
          autoComplete="name"
        />

        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11"
          autoComplete="email"
        />

        <Input
          label="Phone number (optional)"
          type="tel"
          placeholder="9500943141 — use this instead of email if you prefer"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="h-11"
          autoComplete="tel"
        />

        <PasswordInput
          label="Password"
          placeholder="Min. 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
          autoComplete="new-password"
        />

        <Button type="submit" className="h-11 w-full" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  );
}
