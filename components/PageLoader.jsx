"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

// ✅ Fix SSR issue
const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then(mod => mod.Player),
  { ssr: false }
);

export default function PageLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, [pathname]); 

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-white/60 backdrop-blur-sm">
      
      {/* 🔥 Big animation only */}
      <Player
        autoplay
        loop
        src="/animations/loader.json"
        style={{ width: 250, height: 250 }}
      />

    </div>
  );
}