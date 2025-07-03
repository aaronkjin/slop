"use client";

interface AuthButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "outline";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export default function AuthButton({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  loading = false,
  fullWidth = true,
  className = "",
}: AuthButtonProps) {
  const baseClasses =
    "px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center space-x-2 focus:outline-none focus:ring-0";

  const variantClasses = {
    primary: `bg-gray-900 text-white hover:bg-gray-800 ${
      disabled || loading ? "opacity-50 cursor-not-allowed" : "hover:shadow-md"
    }`,
    secondary: `bg-gray-100 text-gray-900 hover:bg-gray-200 ${
      disabled || loading ? "opacity-50 cursor-not-allowed" : ""
    }`,
    outline: `border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 ${
      disabled || loading ? "opacity-50 cursor-not-allowed" : ""
    }`,
  };

  const widthClasses = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${widthClasses} ${className}`}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      <span>{children}</span>
    </button>
  );
}
