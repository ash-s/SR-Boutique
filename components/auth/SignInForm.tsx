"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { phoneToAuthEmail } from "@/lib/auth-utils";

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("redirect") || "/";
  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams?.get("error") === "auth") {
      setError("Sign in failed. Please try again.");
    }
  }, [searchParams]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const isPhone = !email.includes("@");
    const loginEmail = isPhone ? phoneToAuthEmail(email) : email.trim();

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    setLoading(false);
    if (error) {
      setError(isPhone ? "Invalid phone number or password" : "Invalid email or password");
    } else {
      router.push(redirect);
      router.refresh();
    }
  };

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Welcome back to SR Boutique"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href={`/register${redirect !== "/" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
            className="font-medium text-brand-900 hover:underline"
          >
            Create account
          </Link>
        </>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSignIn} className="space-y-4">
        <Input
          label="Email or phone number"
          type="text"
          placeholder="you@example.com or 9500943141"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-11"
          autoComplete="username"
        />

        <div>
          <PasswordInput
            label="Password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <p className="mt-1.5 text-right">
            <Link href="/forgot-password" className="text-sm text-brand-800 hover:underline">
              Forgot password?
            </Link>
          </p>
        </div>

        <Button type="submit" className="h-11 w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  );
}
