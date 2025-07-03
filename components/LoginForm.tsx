"use client";

import { useState } from "react";
import AuthInput from "./AuthInput";
import AuthButton from "./AuthButton";

interface LoginFormProps {
  onSubmit: (data: { email: string; password: string }) => void;
  loading?: boolean;
}

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginForm({
  onSubmit,
  loading = false,
}: LoginFormProps) {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        email: formData.email.trim(),
        password: formData.password,
      });
    }
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {errors.general}
        </div>
      )}

      <AuthInput
        label="Email"
        type="email"
        value={formData.email}
        onChange={(value) => updateField("email", value)}
        placeholder="Enter your email address"
        required
        disabled={loading}
        error={errors.email}
        autoComplete="email"
      />

      <AuthInput
        label="Password"
        type="password"
        value={formData.password}
        onChange={(value) => updateField("password", value)}
        placeholder="Enter your password"
        required
        disabled={loading}
        error={errors.password}
        autoComplete="current-password"
      />

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center">
          <input
            type="checkbox"
            className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-0 focus:ring-offset-0"
          />
          <span className="ml-2 text-gray-600">Remember me</span>
        </label>

        <button
          type="button"
          className="text-gray-600 hover:text-gray-900 hover:underline"
        >
          Forgot password?
        </button>
      </div>

      <div className="pt-2">
        <AuthButton
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading}
        >
          Sign In
        </AuthButton>
      </div>
    </form>
  );
}
