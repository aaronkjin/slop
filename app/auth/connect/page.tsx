"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "../../../components/AuthLayout";
import OAuthButtons from "../../../components/OAuthButtons";
import AuthButton from "../../../components/AuthButton";

export default function ConnectPage() {
  const [loading, setLoading] = useState({
    tiktok: false,
    google: false,
  });

  const [connected, setConnected] = useState({
    tiktok: false,
    google: false,
  });

  const router = useRouter();

  const handleTikTokConnect = async () => {
    setLoading((prev) => ({ ...prev, tiktok: true }));

    try {
      // TODO: Implement actual TikTok OAuth flow
      console.log("Connecting to TikTok...");

      // Simulate OAuth flow
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setConnected((prev) => ({ ...prev, tiktok: true }));
    } catch (error) {
      console.error("TikTok connection error:", error);
    } finally {
      setLoading((prev) => ({ ...prev, tiktok: false }));
    }
  };

  const handleGoogleConnect = async () => {
    setLoading((prev) => ({ ...prev, google: true }));

    try {
      // TODO: Implement actual Google OAuth flow
      console.log("Connecting to Google...");

      // Simulate OAuth flow
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setConnected((prev) => ({ ...prev, google: true }));
    } catch (error) {
      console.error("Google connection error:", error);
    } finally {
      setLoading((prev) => ({ ...prev, google: false }));
    }
  };

  const handleContinue = () => {
    if (isAllConnected) {
      router.push("/auth/success");
    } else {
      router.push("/");
    }
  };

  const isAllConnected = connected.tiktok && connected.google;
  const isAnyLoading = loading.tiktok || loading.google;

  return (
    <AuthLayout
      title="Connect your accounts"
      subtitle="We need access to publish videos and generate content"
    >
      <div className="space-y-6">
        <div className="text-sm text-gray-600">
          <div className="mb-4">
            <h3 className="font-medium text-gray-900 mb-2">
              Why we need these permissions:
            </h3>
            <ul className="space-y-1 text-sm">
              <li className="flex items-start">
                <span className="font-medium mr-2">TikTok:</span>
                <span>To automatically publish your generated videos</span>
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">Google:</span>
                <span>To access Veo 3 API for video generation</span>
              </li>
            </ul>
          </div>
        </div>

        <OAuthButtons
          onTikTokConnect={handleTikTokConnect}
          onGoogleConnect={handleGoogleConnect}
          loading={loading}
          connected={connected}
        />

        {isAllConnected && (
          <div className="pt-4">
            <AuthButton
              variant="primary"
              onClick={handleContinue}
              disabled={isAnyLoading}
            >
              Continue to Slop
            </AuthButton>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={handleContinue}
            className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
          >
            Skip for now (limited functionality)
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
