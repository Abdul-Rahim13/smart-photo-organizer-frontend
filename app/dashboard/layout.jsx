"use client";

import Sidebar from "../../components/SideBar";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { toast } from "sonner";

export default function DashboardLayout({ children }) {
  const router = useRouter();

  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const localToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // NOT logged in 
    if (!token && !localToken) {
      toast.error("Please login to access dashboard");
      router.replace("/login");
    }
  }, [token, router]);

  const isAuthenticated = token || (typeof window !== "undefined" && localStorage.getItem("token"));

  return (
    <div className="flex h-screen bg-[#0f0a19] text-gray-100 overflow-hidden">
      {/* Sidebar only if authenticated */}
      {isAuthenticated && <Sidebar />}

      {/* Main content */}
      <main className="flex-1 h-full overflow-y-auto custom-scrollbar">
        {isAuthenticated ? children : null}
      </main>
    </div>
  );
}