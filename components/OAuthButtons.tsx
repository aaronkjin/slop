"use client";

interface OAuthButtonsProps {
  onTikTokConnect: () => void;
  onGoogleConnect: () => void;
  loading?: {
    tiktok?: boolean;
    google?: boolean;
  };
  connected?: {
    tiktok?: boolean;
    google?: boolean;
  };
}

export default function OAuthButtons({
  onTikTokConnect,
  onGoogleConnect,
  loading = {},
  connected = {},
}: OAuthButtonsProps) {
  return (
    <div className="space-y-3">
      {/* TikTok OAuth Button */}
      <button
        onClick={onTikTokConnect}
        disabled={loading.tiktok || connected.tiktok}
        className={`w-full px-4 py-3 border rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-3 focus:outline-none focus:ring-0 ${
          connected.tiktok
            ? "bg-green-50 border-green-200 text-green-700 cursor-default"
            : loading.tiktok
            ? "bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-black text-white hover:bg-gray-900 hover:shadow-md"
        }`}
      >
        {loading.tiktok ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : connected.tiktok ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43V7.93a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.36z" />
          </svg>
        )}
        <span>
          {connected.tiktok
            ? "TikTok Connected"
            : loading.tiktok
            ? "Connecting..."
            : "Connect TikTok"}
        </span>
      </button>

      {/* Google OAuth Button */}
      <button
        onClick={onGoogleConnect}
        disabled={loading.google || connected.google}
        className={`w-full px-4 py-3 border rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-3 focus:outline-none focus:ring-0 ${
          connected.google
            ? "bg-green-50 border-green-200 text-green-700 cursor-default"
            : loading.google
            ? "bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm"
        }`}
      >
        {loading.google ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : connected.google ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        <span>
          {connected.google
            ? "Google Connected"
            : loading.google
            ? "Connecting..."
            : "Connect Google"}
        </span>
      </button>
    </div>
  );
}
