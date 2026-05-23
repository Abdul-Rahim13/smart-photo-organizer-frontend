"use client"

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { resetAuthState } from '@/redux/slices/authSlice';
import { toast } from 'sonner';
import { 
  LayoutDashboard, Image as ImageIcon, Upload, Activity, 
  Layers, LayoutGrid, Trash2, Cpu, Settings,
  ChevronLeft, ChevronRight, LogOut
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard",    href: "/dashboard" },
  { icon: ImageIcon,       label: "Gallery",      href: "/dashboard/gallery" },
  { icon: Upload,          label: "Upload",       href: "/dashboard/upload" },
  { icon: Activity,        label: "Processing",   href: "/dashboard/processing" },
  { icon: Layers,          label: "Albums",       href: "/dashboard/albums" },
  { icon: Trash2,          label: "Trash",        href: "/dashboard/trash" },
  { icon: Cpu,             label: "AI Models",    href: "/dashboard/models" },
  { icon: Settings,        label: "Settings",     href: "/dashboard/settings" },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogoutConfirm = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch(resetAuthState());
    setShowLogoutModal(false);
    toast.success("Logged out successfully");
    // replace() instead of push() — back button won't work after logout
    router.replace("/login");
  };

  return (
    <>
      <aside
        className={`bg-[#161026] border-r border-gray-800/50 flex flex-col transition-all duration-300 ease-in-out z-20 shrink-0
          ${isCollapsed ? 'w-20' : 'w-65'}`}
      >
        <div className={`pl-5 pt-5 flex-1 flex flex-col ${isCollapsed ? 'items-center px-2' : ''}`}>

          {/* Logo */}
          <div className={`flex items-center gap-3 mb-10 overflow-hidden transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="shrink-0 bg-[#facc15] text-[#161026] h-10 w-10 rounded-lg flex items-center justify-center font-bold text-lg relative cursor-pointer">
              AI
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-[#161026] rounded-full" />
            </div>
            <div className={`transition-all duration-300 whitespace-nowrap ${isCollapsed ? 'opacity-0 w-0 pointer-events-none' : 'opacity-100 w-auto'}`}>
              <h2 className="font-bold leading-none text-sm">Smart Photo</h2>
              <p className="text-[10px] text-gray-500 uppercase mt-1">AI Powered</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1 w-full">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href} className="block">
                <SideItem
                  icon={item.icon}
                  label={item.label}
                  collapsed={isCollapsed}
                  active={pathname === item.href}
                />
              </Link>
            ))}

            {/* Logout */}
            <button onClick={() => setShowLogoutModal(true)} className="w-full block">
              <SideItem
                icon={LogOut}
                label="Logout"
                collapsed={isCollapsed}
                active={false}
                danger
              />
            </button>
          </nav>

        </div>

        {/* Footer */}
        <div className={`mb-5 border-t border-gray-800/50 space-y-2 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
          <div className={`text-center transition-all duration-300 ${isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'}`}>
            <p className="text-[10px] text-gray-500">Version 1.0.0</p>
            <p className="text-[#facc15] text-[11px] font-bold uppercase tracking-tight">FYP Dashboard</p>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center gap-2 bg-gray-800/30 py-2.5 rounded-xl text-xs text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            {isCollapsed
              ? <ChevronRight size={18} />
              : <><ChevronLeft size={14} /><span className="whitespace-nowrap">Collapse</span></>
            }
          </button>
        </div>
      </aside>

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.6)' }}
        >
          <div className="bg-[#1c1430] border border-gray-700/50 rounded-2xl p-8 w-full max-w-sm mx-4 shadow-2xl">
            
            {/* Icon */}
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
              <LogOut size={24} className="text-red-400" />
            </div>

            {/* Text */}
            <h2 className="text-white text-xl font-bold text-center mb-2">
              Sign out?
            </h2>
            <p className="text-gray-400 text-sm text-center leading-relaxed mb-8">
              Are you sure you want to logout? You will need to sign in again to access your dashboard.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-300 text-sm font-medium hover:bg-gray-800/50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="flex-1 py-3 rounded-xl bg-red-500/90 hover:bg-red-500 text-white text-sm font-bold transition cursor-pointer"
              >
                Yes, Logout
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

function SideItem({ icon: Icon, label, active, collapsed, danger }) {
  return (
    <div className={`
      flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-200 group relative
      ${danger
        ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
        : active
          ? 'bg-indigo-600/15 text-indigo-400 font-bold border border-indigo-500/20'
          : 'text-gray-500 hover:bg-gray-800/60 hover:text-gray-300'}
      ${collapsed ? 'justify-center px-0' : ''}
    `}>
      <Icon size={20} className="shrink-0" />

      <div className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
        <span className="text-sm">{label}</span>
      </div>

      {collapsed && (
        <div className="absolute left-14 bg-[#1c1430] border border-gray-700 text-white text-[10px] px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
          {label}
        </div>
      )}
    </div>
  );
}