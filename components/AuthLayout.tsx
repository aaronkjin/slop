"use client";

import Image from "next/image";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showLogo?: boolean;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  showLogo = true,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {showLogo && (
          <div className="flex justify-center mb-8">
            <Image
              src="/logos/slop_cropped.png"
              alt="Slop"
              width={120}
              height={36}
              className="h-10 w-auto"
            />
          </div>
        )}

        <div className="text-center">
          <h2 className="text-2xl font-medium text-gray-900 mb-2">{title}</h2>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-6 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
