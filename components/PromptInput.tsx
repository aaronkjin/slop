"use client";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export default function PromptInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder = "Something funny, like farts...",
  maxLength = 400,
}: PromptInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="relative mb-6">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full h-32 resize-none border border-gray-200 rounded-lg shadow-sm p-6 pr-16 pb-16 focus:ring-0 focus:border-gray-300 text-gray-900 placeholder-gray-400 text-base leading-6 outline-none"
        disabled={disabled}
      />

      {/* Character Count */}
      <div className="absolute bottom-4 left-6 text-xs text-gray-400">
        {value.length}/{maxLength}
      </div>

      {/* Circular Generate Button */}
      <button
        onClick={onSubmit}
        disabled={!value.trim() || disabled}
        className={`absolute bottom-4 right-4 w-10 h-10 rounded-full transition-all duration-500 flex items-center justify-center shadow-md overflow-hidden ${
          !value.trim() || disabled
            ? "bg-gray-200 cursor-not-allowed"
            : "hover:shadow-lg hover:scale-105"
        }`}
        style={{
          background: !value.trim() || disabled ? "#e5e7eb" : "#f3f4f6",
          transform: "translate3d(0, 0, 0)",
        }}
      >
        {/* Shimmer layers container */}
        {value.trim() && !disabled && (
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="absolute inset-[-2px] rounded-full animate-shimmer-base blur-sm"></div>
            <div className="absolute inset-[-1px] rounded-full animate-shimmer-overlay blur-xs"></div>
            <div className="absolute inset-0 rounded-full animate-shimmer-accent"></div>
          </div>
        )}

        {disabled ? (
          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin z-10 relative"></div>
        ) : (
          <svg
            className={`w-5 h-5 z-10 relative ${
              !value.trim() ? "text-gray-400" : "text-gray-600"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M7 11l5-5m0 0l5 5m-5-5v12"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
