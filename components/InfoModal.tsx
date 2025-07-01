"use client";

import { useEffect, useRef } from "react";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string | React.ReactNode;
  content: string | React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export default function InfoModal({
  isOpen,
  onClose,
  title = "Info",
  content,
  position = "top",
}: InfoModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      const modal = modalRef.current;
      const rect = modal.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      // Check if modal goes off screen and adjust
      if (rect.right > viewport.width - 16) {
        modal.style.transform = `translateX(${
          viewport.width - rect.right - 16
        }px)`;
      }
      if (rect.left < 16) {
        modal.style.transform = `translateX(${16 - rect.left}px)`;
      }
      if (rect.bottom > viewport.height - 16) {
        modal.style.transform = `translateY(${
          viewport.height - rect.bottom - 16
        }px)`;
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Check if we're on mobile
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  if (isMobile) {
    // On mobile, use fixed positioning centered on screen
    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-20"
          onClick={onClose}
        />

        {/* Modal - Fixed positioning on mobile */}
        <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-h-[80vh] overflow-y-auto">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Content */}
          <div className="pr-6">
            <h3 className="font-medium text-gray-900 mb-2">{title}</h3>
            <div className="text-sm text-gray-600 leading-relaxed">
              {content}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Desktop positioning
  const positionClasses = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-2",
    left: "right-full mr-2",
    right: "left-full ml-2",
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Modal - Relative positioning on desktop */}
      <div
        className={`absolute z-50 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-4 ${positionClasses[position]}`}
      >
        {/* Arrow pointer */}
        <div
          className={`absolute w-3 h-3 bg-white border transform rotate-45 ${
            position === "top"
              ? "top-full left-4 -mt-1.5 border-t-0 border-l-0"
              : position === "bottom"
              ? "bottom-full left-4 -mb-1.5 border-b-0 border-r-0"
              : position === "left"
              ? "left-full top-4 -ml-1.5 border-l-0 border-b-0"
              : "right-full top-4 -mr-1.5 border-r-0 border-t-0"
          }`}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Content */}
        <div className="pr-6">
          <h3 className="font-medium text-gray-900 mb-2">{title}</h3>
          <div className="text-sm text-gray-600 leading-relaxed">{content}</div>
        </div>
      </div>
    </>
  );
}
