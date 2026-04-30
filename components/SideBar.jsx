"use client"

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Image as ImageIcon, Upload, Activity, 
  Layers, LayoutGrid, Trash2, Cpu, Settings,
  ChevronLeft, ChevronRight
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard",    href: "/dashboard" },
  { icon: ImageIcon,       label: "Gallery",      href: "/dashboard/gallery" },
  { icon: Upload,          label: "Upload",       href: "/dashboard/upload" },
  { icon: Activity,        label: "Processing",   href: "/dashboard/processing" },
  { icon: Layers,          label: "Albums",       href: "/dashboard/albums" },
  { icon: LayoutGrid,      label: "Smart Albums", href: "/dashboard/smart-albums" },
  { icon: Trash2,          label: "Trash",        href: "/dashboard/trash" },
  { icon: Cpu,             label: "AI Models",    href: "/dashboard/models" },
  { icon: Settings,        label: "Settings",     href: "/dashboard/settings" },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`bg-[#161026] border-r border-gray-800/50 flex flex-col transition-all duration-300 ease-in-out z-20 flex-shrink-0
        ${isCollapsed ? 'w-20' : 'w-[260px]'}`}
    >
      <div className={`pl-5 pt-5 flex-1 flex flex-col ${isCollapsed ? 'items-center px-2' : ''}`}>

        {/* Logo */}
        <div className={`flex items-center gap-3 mb-10 overflow-hidden transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="flex-shrink-0 bg-[#facc15] text-[#161026] h-10 w-10 rounded-lg flex items-center justify-center font-bold text-lg relative cursor-pointer">
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
  );
}

// ── Sub-component (local, not exported — only Sidebar needs it) ──────────────
function SideItem({ icon: Icon, label, active, collapsed }) {
  return (
    <div className={`
      flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-200 group relative
      ${active
        ? 'bg-indigo-600/15 text-indigo-400 font-bold border border-indigo-500/20'
        : 'text-gray-500 hover:bg-gray-800/60 hover:text-gray-300'}
      ${collapsed ? 'justify-center px-0' : ''}
    `}>
      <Icon size={20} className="flex-shrink-0" />

      <div className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
        <span className="text-sm">{label}</span>
      </div>

      {/* Tooltip when collapsed */}
      {collapsed && (
        <div className="absolute left-14 bg-[#1c1430] border border-gray-700 text-white text-[10px] px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
          {label}
        </div>
      )}
    </div>
  );
}