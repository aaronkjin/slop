"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "../../../components/AuthLayout";
import SignUpForm from "../../../components/SignUpForm";

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (data: {
    name: string;
    email: string;
    password: string;
  }) => {
    setLoading(true);

    try {
      // TODO: Implement actual signup API call
      console.log("Signing up with:", data);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // On success, redirect to OAuth connection
      router.push("/auth/connect");
    } catch (error) {
      console.error("Signup error:", error);
      // TODO: Handle signup errors
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start creating viral AI videos in minutes"
    >
      <SignUpForm onSubmit={handleSignUp} loading={loading} />

      <div className="mt-6 text-center">
        <span className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-gray-900 font-medium hover:underline"
          >
            Sign in
          </Link>
        </span>
      </div>
    </AuthLayout>
  );
}
