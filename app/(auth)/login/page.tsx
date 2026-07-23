import { Suspense } from "react";
import SignInForm from "@/components/auth/SignInForm";

export const metadata = {
  title: "Sign In | SR Boutique",
  description: "Sign in to your SR Boutique account",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-gray-500">
          Loading...
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
