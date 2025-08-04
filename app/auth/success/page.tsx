"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AuthLayout from "../../../components/AuthLayout";
import AuthButton from "../../../components/AuthButton";

export default function SuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleContinue = () => {
    router.push("/");
  };

  return (
    <AuthLayout
      title="Welcome to Slop!"
      subtitle="Your account is ready to create viral videos"
    >
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            🎉 You&apos;re all set up!
          </h3>
          <p className="text-gray-600 text-sm">
            Your TikTok and Google accounts are connected. You can now:
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center">
              <svg
                className="w-4 h-4 text-green-600 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Generate AI videos with Google's Veo 3
            </li>
            <li className="flex items-center">
              <svg
                className="w-4 h-4 text-green-600 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Auto-publish to your TikTok account
            </li>
            <li className="flex items-center">
              <svg
                className="w-4 h-4 text-green-600 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Track performance in your dashboard
            </li>
          </ul>
        </div>

        <div>
          <AuthButton variant="primary" onClick={handleContinue}>
            Start Creating Videos
          </AuthButton>

          <p className="text-xs text-gray-500 mt-3">
            Redirecting automatically in {countdown} second
            {countdown !== 1 ? "s" : ""}...
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-blue-600 mr-2 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-left">
              <p className="text-sm text-blue-800 font-medium">
                Free Plan Active
              </p>
              <p className="text-xs text-blue-700">
                You have 5 video generations per day. Upgrade anytime for
                unlimited access.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
