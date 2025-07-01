"use client";

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
}

export default function LoadingState({
  message = "Creating your video...",
  subMessage = "This usually takes 30-60 seconds",
}: LoadingStateProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
      <div className="flex items-center justify-center space-x-2 text-gray-600">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
        <span className="text-sm">{message}</span>
      </div>
      <p className="text-xs text-gray-500 mt-2">{subMessage}</p>
    </div>
  );
}
