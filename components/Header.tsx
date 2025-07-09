"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import HeaderAuth from "./HeaderAuth";
import { FiMenu, FiX } from "react-icons/fi";

interface HeaderProps {
  variant?: "landing" | "main";
  showAuthButtons?: boolean;
}

export default function Header({
  variant = "main",
  showAuthButtons = false,
}: HeaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (isMobileMenuOpen) {
        setIsVisible(true);
        return;
      }
      const currentScrollY = window.scrollY;

      if (currentScrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isMobileMenuOpen]);

  const getHeaderClasses = () => {
    const baseClasses =
      "fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-in-out w-[90vw] md:min-w-[800px] md:w-auto";

    if (variant === "landing") {
      return `${baseClasses} ${
        isScrolled
          ? "bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg shadow-black/5"
          : "bg-white/50 backdrop-blur-lg border border-white/30 shadow-md shadow-black/5"
      } rounded-2xl md:rounded-full px-4 py-2 ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-16 opacity-0"
      }`;
    } else {
      return `${baseClasses} ${
        isScrolled
          ? "bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-lg shadow-black/10"
          : "bg-white/70 backdrop-blur-lg border border-gray-200/30 shadow-md shadow-black/5"
      } rounded-2xl md:rounded-full px-4 py-2 ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-16 opacity-0"
      }`;
    }
  };

  return (
    <>
      <header className={getHeaderClasses()}>
        <div className="flex items-center justify-between w-full md:min-w-[550px]">
          <div className="flex items-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="focus:outline-none rounded-md"
              aria-label="Go to top"
            >
              <Image
                src="/logos/slop_cropped.png"
                alt="Slop"
                width={96}
                height={28}
                className="h-7 w-auto"
              />
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {variant === "main" && (
              <div className="flex items-center space-x-6">
                <span className="text-xs text-gray-600 whitespace-nowrap">
                  5 generations remaining
                </span>
                <button className="bg-gray-900 text-white text-sm px-5 py-2.5 rounded-full hover:bg-gray-800 transition-colors whitespace-nowrap">
                  Dashboard
                </button>
              </div>
            )}
            {showAuthButtons && <HeaderAuth />}
          </div>

          {/* Mobile Menu Button */}
          {showAuthButtons && (
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-700 hover:text-gray-900 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <FiX className="h-6 w-6" />
                ) : (
                  <FiMenu className="h-6 w-6" />
                )}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && showAuthButtons && (
        <div
          className="fixed top-20 left-1/2 -translate-x-1/2 w-[90vw] z-40 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg p-4"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className="flex flex-col items-center space-y-4">
            {variant === "main" && (
              <>
                <span className="text-xs text-gray-600">
                  5 generations remaining
                </span>
                <button className="bg-gray-900 text-white text-sm px-5 py-2.5 rounded-full hover:bg-gray-800 transition-colors">
                  Dashboard
                </button>
                <div className="w-full h-px bg-gray-200/50" />
              </>
            )}
            <HeaderAuth />
          </div>
        </div>
      )}
    </>
  );
}
