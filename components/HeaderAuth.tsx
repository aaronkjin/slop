"use client";

import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";

export default function HeaderAuth() {
  return (
    <div className="flex items-center space-x-2">
      <Link href="/auth/login" passHref>
        <div className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors cursor-pointer">
          Sign In
        </div>
      </Link>
      <Link href="/auth/signup" passHref>
        <div className="bg-black text-white text-sm px-5 py-2 rounded-full hover:bg-gray-800 transition-colors flex items-center space-x-2 cursor-pointer">
          <span>Get Started</span>
          <FiArrowUpRight className="h-4 w-4" />
        </div>
      </Link>
    </div>
  );
}
