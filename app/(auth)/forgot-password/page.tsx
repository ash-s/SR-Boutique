"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { WHATSAPP_NUMBER } from "@/lib/constants";

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get("type") === "phone" ? "phone" : "email";
  const [tab, setTab] = useState(initialTab);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleEmailReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/auth/reset-password")}`;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setMessage("Password reset link sent! Check your email inbox (and spam folder).");
    }
  };

  return (
    <AuthLayout
      title="Forgot password"
      subtitle="Reset your account password"
      footer={
        <Link href="/login" className="font-medium text-brand-900 hover:underline">
          Back to sign in
        </Link>
      }
    >
      <div className="mb-6 flex rounded-lg bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => { setTab("email"); setError(""); setMessage(""); }}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            tab === "email" ? "bg-white text-brand-900 shadow-sm" : "text-gray-600"
          }`}
        >
          Email account
        </button>
        <button
          type="button"
          onClick={() => { setTab("phone"); setError(""); setMessage(""); }}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            tab === "phone" ? "bg-white text-brand-900 shadow-sm" : "text-gray-600"
          }`}
        >
          Phone account
        </button>
      </div>

      {tab === "email" ? (
        <form onSubmit={handleEmailReset} className="space-y-4">
          <p className="text-sm text-gray-600">
            Enter your registered email and we&apos;ll send you a reset link.
          </p>
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11"
          />
          <Button type="submit" className="h-11 w-full" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg bg-brand-50 p-4 text-sm text-gray-700">
            <p className="font-medium">Phone account password help</p>
            <p className="mt-1">
              Message us on WhatsApp with your registered phone number and we&apos;ll reset it for you.
            </p>
          </div>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi, I need help resetting my SR Boutique account password.")}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="h-11 w-full">Reset via WhatsApp</Button>
          </a>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}
      {message && (
        <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">{message}</div>
      )}
    </AuthLayout>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
