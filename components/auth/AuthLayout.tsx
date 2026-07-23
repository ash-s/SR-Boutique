"use client";

import Link from "next/link";
import { BRAND_NAME } from "@/lib/constants";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="text-2xl font-semibold text-brand-900">
            {BRAND_NAME}
          </Link>
          <h1 className="mt-4 text-xl font-semibold text-gray-900">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          {children}
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">{footer}</div>
        <p className="mt-3 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-brand-900">
            ← Back to store
          </Link>
        </p>
      </div>
    </div>
  );
}
