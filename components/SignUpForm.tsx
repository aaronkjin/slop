"use client";

import { useState } from "react";
import AuthInput from "./AuthInput";
import AuthButton from "./AuthButton";

interface SignUpFormProps {
  onSubmit: (data: { name: string; email: string; password: string }) => void;
  loading?: boolean;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignUpForm({
  onSubmit,
  loading = false,
}: SignUpFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, and number";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        name: formData.name.trim(),
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
      <AuthInput
        label="Full Name"
        value={formData.name}
        onChange={(value) => updateField("name", value)}
        placeholder="Enter your full name"
        required
        disabled={loading}
        error={errors.name}
        autoComplete="name"
      />

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
        placeholder="Create a secure password"
        required
        disabled={loading}
        error={errors.password}
        autoComplete="new-password"
      />

      <AuthInput
        label="Confirm Password"
        type="password"
        value={formData.confirmPassword}
        onChange={(value) => updateField("confirmPassword", value)}
        placeholder="Confirm your password"
        required
        disabled={loading}
        error={errors.confirmPassword}
        autoComplete="new-password"
      />

      <div className="pt-2">
        <AuthButton
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading}
        >
          Create Account
        </AuthButton>
      </div>

      <div className="text-center text-sm text-gray-600 mt-4">
        By creating an account, you agree to our{" "}
        <span className="text-gray-900 hover:underline cursor-pointer">
          Terms of Service
        </span>{" "}
        and{" "}
        <span className="text-gray-900 hover:underline cursor-pointer">
          Privacy Policy
        </span>
      </div>
    </form>
  );
}
