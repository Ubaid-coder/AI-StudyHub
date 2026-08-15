"use client";

import { Loader2 } from "lucide-react";

export default function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1F242E] text-white">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-blue-400" />

        <p className="text-sm text-gray-400">
          Checking your session...
        </p>
      </div>
    </div>
  );
}