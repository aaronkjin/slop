"use client";

import Image from "next/image";

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="w-full px-4 py-4">
        <div className="flex items-center justify-between">
          <Image
            src="/logos/slop_cropped.png"
            alt="Slop"
            width={108}
            height={32}
            className="h-9 w-auto"
          />
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              5 generations remaining
            </span>
            <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Dashboard
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
