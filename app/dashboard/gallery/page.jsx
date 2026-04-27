"use client"

import React, { useState } from 'react';
import { 
  Search, Bell, User, Filter, Image as ImageIcon, 
  MoreVertical, Grid, List, User as UserIcon,
  ChevronLeft, ChevronRight, LayoutDashboard, Upload, 
  Activity, Layers, LayoutGrid, Trash2, Cpu, Settings
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// --- MOCK DATA ---
const galleryPhotos = [
  { id: 1, title: "Portrait Woman", cat: "Indoor", score: "98%", color: "bg-purple-900/20", faces: 1 },
  { id: 2, title: "City Skyline", cat: "Urban", score: "92%", color: "bg-blue-900/20", faces: 0 },
  { id: 3, title: "Mountain Peak", cat: "Outdoor", score: "95%", color: "bg-emerald-900/20", faces: 0 },
  { id: 4, title: "Family Picnic", cat: "Outdoor", score: "88%", color: "bg-orange-900/20", faces: 4 },
  { id: 5, title: "Neon Streets", cat: "Urban", score: "90%", color: "bg-pink-900/20", faces: 2 },
  { id: 6, title: "Office Space", cat: "Indoor", score: "85%", color: "bg-gray-900/20", faces: 3 },
  { id: 7, title: "Forest Path", cat: "Outdoor", score: "94%", color: "bg-green-900/20", faces: 0 },
  { id: 8, title: "Desert Sands", cat: "Outdoor", score: "91%", color: "bg-yellow-900/20", faces: 0 },
];

export default function GalleryPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const pathname = usePathname();

  const tabs = ['All', 'Outdoor', 'Indoor', 'Urban'];

  // Menu items array for cleaner mapping and auto-active state
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: ImageIcon, label: "Gallery", href: "/dashboard/gallery" },
    { icon: Upload, label: "Upload", href: "/dashboard/upload" },
    { icon: Activity, label: "Processing", href: "/dashboard/processing" },
    { icon: Layers, label: "Albums", href: "/dashboard/albums" },
    { icon: LayoutGrid, label: "Smart Albums", href: "/dashboard/smart-albums" },
    { icon: Trash2, label: "Trash", href: "/dashboard/trash" },
    { icon: Cpu, label: "AI Models", href: "/dashboard/models" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

  return (
    <div className="flex h-screen bg-[#0f0a19] text-gray-100 overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className={`bg-[#161026] border-r border-gray-800/50 flex flex-col transition-all duration-300 ease-in-out z-20 ${isCollapsed ? 'w-20' : 'w-[260px]'}`}>
        <div className={`p-6 flex-1 flex flex-col ${isCollapsed ? 'items-center px-2' : ''}`}>
          
          {/* Logo Section */}
          <div className={`flex items-center gap-3 mb-10 overflow-hidden transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="flex-shrink-0 bg-[#facc15] text-[#161026] h-10 w-10 rounded-lg flex items-center justify-center font-bold text-lg relative">
              AI
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-[#161026] rounded-full"></span>
            </div>
            <div className={`transition-all duration-300 whitespace-nowrap ${isCollapsed ? 'opacity-0 w-0 pointer-events-none' : 'opacity-100 w-auto'}`}>
              <h2 className="font-bold leading-none text-sm md:text-base">Smart Photo</h2>
              <p className="text-[10px] text-gray-500 uppercase mt-1">AI Powered</p>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="space-y-1 w-full">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href}>
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

        {/* Sidebar Footer */}
        <div className={`p-4 border-t border-gray-800/50 space-y-2 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
          <div className={`text-center transition-all duration-300 ${isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'}`}>
            <p className="text-[10px] text-gray-500">Version 1.0.0</p>
            <p className="text-[#facc15] text-[11px] font-bold uppercase tracking-tight">FYP Dashboard</p>
          </div>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center gap-2 bg-gray-800/30 py-2.5 rounded-xl text-xs text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={14} /> <span className="whitespace-nowrap">Collapse</span></>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 h-full overflow-y-auto custom-scrollbar p-8">
        
        {/* HEADER */}
        <header className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold">Gallery</h2>
              <div className="flex items-center gap-2 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">842 Total Items</span>
              </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2.5 bg-[#1c1430] border border-gray-800 rounded-xl text-gray-400 hover:text-white transition"><Bell size={18}/></button>
            <button className="flex items-center gap-2 bg-[#4f46e5] px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#4338ca] transition shadow-lg shadow-indigo-600/20">
              <User size={16}/> Abdul
            </button>
          </div>
        </header>

        {/* SEARCH AND FILTER */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search photos by name, scene, or AI tags..." 
              className="bg-[#1c1430] border border-gray-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm w-full outline-none focus:border-indigo-500 transition-all shadow-inner" 
            />
          </div>
          <button className="bg-[#1c1430] border border-gray-800 p-3.5 rounded-2xl text-gray-400 hover:text-white transition">
            <Filter size={20} />
          </button>
        </div>

        {/* TABS AND VIEW TOGGLE */}
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <div className="flex bg-[#161026] p-1.5 rounded-2xl border border-gray-800/50">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                  activeTab === tab 
                  ? 'bg-[#facc15] text-[#161026] shadow-lg' 
                  : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
             <div className="bg-[#161026] flex p-1 rounded-xl border border-gray-800">
                <button className="p-2 bg-indigo-600 rounded-lg text-white"><Grid size={16}/></button>
                <button className="p-2 text-gray-500 hover:text-gray-300 transition"><List size={16}/></button>
             </div>
             <select className="bg-[#1c1430] border border-gray-800 text-xs font-bold text-yellow-500 px-4 py-2.5 rounded-xl outline-none cursor-pointer">
                <option>Face (21)</option>
                <option>Landscape</option>
                <option>Objects</option>
             </select>
          </div>
        </div>

        {/* PHOTO GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {galleryPhotos.map((photo) => (
            <div key={photo.id} className="bg-[#161026] rounded-[2rem] overflow-hidden border border-gray-800 group hover:border-indigo-500 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10">
              <div className={`h-56 ${photo.color} relative flex items-center justify-center transition-transform duration-700 group-hover:scale-105`}>
                <ImageIcon className="opacity-10 text-white" size={60}/>
                
                {/* AI Score Badge */}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black text-green-400 border border-green-500/30">
                  {photo.score} AI
                </div>

                {/* Face Detection Badge */}
                {photo.faces > 0 && (
                  <div className="absolute top-4 left-4 bg-indigo-600 p-2 rounded-xl shadow-lg flex items-center justify-center">
                    <UserIcon size={14} className="text-white"/>
                    <span className="absolute -top-1 -right-1 bg-white text-indigo-600 text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black border border-indigo-600">
                      {photo.faces}
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0a19] via-transparent to-transparent opacity-60"></div>
                
                {/* Photo Meta */}
                <div className="absolute bottom-4 left-5 right-5 flex justify-between items-end">
                   <div>
                     <p className="text-sm font-bold text-white mb-1">{photo.title}</p>
                     <p className="text-[10px] text-gray-400 flex items-center gap-1.5 font-medium">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span> {photo.cat}
                     </p>
                   </div>
                   <button className="text-[#facc15] hover:scale-110 transition"><MoreVertical size={18}/></button>
                </div>
              </div>
              <div className="p-4 flex justify-between items-center bg-[#1c1430]/50 backdrop-blur-sm border-t border-gray-800/50">
                 <button className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-500 hover:text-white transition">Details</button>
                 <button className="text-[10px] font-black uppercase tracking-[0.15em] text-yellow-500 hover:text-yellow-400 transition">View Photo →</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* STYLES */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2d2a3d; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4f46e5; }
      `}</style>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function SideItem({ icon: Icon, label, active, collapsed }) {
  return (
    <div className={`
      flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-300 group
      ${active ? 'bg-indigo-600/10 text-indigo-400 font-bold' : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'}
      ${collapsed ? 'justify-center px-0' : ''}
    `}>
      <Icon size={20} className="flex-shrink-0" />
      <div className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
        <span className="text-sm">{label}</span>
      </div>
    </div>
  );
}