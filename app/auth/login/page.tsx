"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "../../../components/AuthLayout";
import LoginForm from "../../../components/LoginForm";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (data: { email: string; password: string }) => {
    setLoading(true);

    try {
      // TODO: Implement actual login API call
      console.log("Logging in with:", data);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // On success, check if user has completed onboarding
      // For now, assume they need to connect OAuth accounts
      router.push("/auth/connect");
    } catch (error) {
      console.error("Login error:", error);
      // TODO: Handle login errors
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue creating viral videos"
    >
      <LoginForm onSubmit={handleLogin} loading={loading} />

      <div className="mt-6 text-center">
        <span className="text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-gray-900 font-medium hover:underline"
          >
            Sign up
          </Link>
        </span>
      </div>
    </AuthLayout>
  );
}
