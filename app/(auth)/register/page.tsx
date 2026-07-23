import { Suspense } from "react";
import SignUpForm from "@/components/auth/SignUpForm";

export const metadata = {
  title: "Create Account | SR Boutique",
  description: "Create your SR Boutique account",
};

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-gray-500">
          Loading...
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}
