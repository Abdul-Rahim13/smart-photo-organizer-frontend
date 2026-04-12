"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Player } from "@lottiefiles/react-lottie-player";

export default function PageLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Show loader on every route change
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, [pathname]); // ✅ triggers on every page shift

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Blurred backdrop */}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />

      {/* Loader card */}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="w-24 h-24 rounded-2xl bg-white shadow-xl shadow-violet-100 flex items-center justify-center">
          <Player autoplay loop src="/animations/loading.json" style={{ width: 72, height: 72 }} />
        </div>
        <p className="text-xs font-medium text-gray-400 tracking-wide animate-pulse">Loading...</p>
      </div>
    </div>
  );
}