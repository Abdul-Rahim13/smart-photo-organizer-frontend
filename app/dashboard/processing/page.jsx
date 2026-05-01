"use client"

import React, { useState, useEffect } from 'react';
import {
  Bell, User, Search, Cpu, CheckCircle, Clock, 
  Layers, Zap, RefreshCw, Filter, MoreVertical,
  Image as ImageIcon, XCircle, PlayCircle, PauseCircle,
  Home, Upload, Box, Folder, Grid, Trash2, Settings, 
  ChevronRight, Search as SearchIcon
} from 'lucide-react';

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const INITIAL_QUEUE = [
  { id: 1, title: "Sunset Beach", status: "processing", progress: 54, stage: "Applying filters", color: "bg-[url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80')]" },
  { id: 2, title: "Mountain Peak", status: "processing", progress: 86, stage: "Optimizing...", color: "bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=300&q=80')]" },
  { id: 3, title: "City Skyline", status: "processing", progress: 48, stage: "Finalizing...", color: "bg-[url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=300&q=80')]" },
  { id: 4, title: "Coffee Shop", status: "processing", progress: 100, stage: "Applying filters...", color: "bg-[url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=300&q=80')]" },
  { id: 5, title: "Forest Path", status: "complete", progress: 100, stage: "Done", color: "bg-[url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=300&q=80')]" },
  { id: 6, title: "Desert Road", status: "queued", progress: 0, stage: "Waiting", color: "bg-[url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=300&q=80')]" },
];

const statusConfig = {
  queued: { label: "Queued", color: "text-gray-400", dot: "bg-gray-400", badge: "bg-gray-500/80" },
  analyzing: { label: "Analyzing", color: "text-blue-400", dot: "bg-blue-400", badge: "bg-blue-500/80" },
  processing: { label: "Processing", color: "text-yellow-400", dot: "bg-yellow-400", badge: "bg-yellow-500/80" },
  complete: { label: "Complete", color: "text-green-400", dot: "bg-green-400", badge: "bg-green-500/80" },
};

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function CircularProgress({ percent }) {
  const r = 32; // Radius
  const circ = 2 * Math.PI * r; // Circumference
  // Offset formula: circ - (percent / 100) * circ
  const offset = circ - (percent / 100) * circ;

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg width="96" height="96" className="-rotate-90">
        {/* Background Track */}
        <circle 
          cx="48" cy="48" r={r} 
          fill="none" 
          stroke="rgba(255,255,255,0.1)" 
          strokeWidth="5"
        />
        {/* Progress Bar */}
        <circle 
          cx="48" cy="48" r={r} 
          fill="none" 
          stroke="#facc15" 
          strokeWidth="5" 
          strokeLinecap="round"
          strokeDasharray={circ} 
          strokeDashoffset={offset} 
          className="transition-all duration-700 ease-out" 
        />
      </svg>
      <span className="absolute text-sm font-black text-white drop-shadow-md">
        {Math.round(percent)}%
      </span>
    </div>
  );
}

function SidebarIcon({ icon: Icon, active = false }) {
  return (
    <div className={`p-3 cursor-pointer transition-colors ${active ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}>
      <Icon size={20} />
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [items, setItems] = useState(INITIAL_QUEUE);
  
  // Simulation: Increment progress for all "processing" items
  useEffect(() => {
    const interval = setInterval(() => {
      setItems(prev => prev.map(item => {
        if (item.status === 'processing' && item.progress < 100) {
          const nextProgress = item.progress + 1;
          return { 
            ...item, 
            progress: nextProgress,
            status: nextProgress >= 100 ? 'complete' : 'processing',
            stage: nextProgress >= 100 ? 'Done' : item.stage
          };
        }
        return item;
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0d0b14] text-white font-sans selection:bg-indigo-500/30">


      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER
        <header className="h-16 flex items-center justify-between px-8 bg-[#151221]/80 backdrop-blur-xl border-b border-gray-800/30">
          <div className="flex items-center gap-6">
            <h1 className="text-sm font-bold tracking-tight">Dashboard</h1>
            <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[9px] text-green-400 font-bold uppercase tracking-widest">System Active</span>
            </div>
          </div>

          <div className="flex-1 max-w-lg px-8">
            <div className="relative group">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={14} />
              <input 
                type="text" 
                placeholder="Search photos, albums, or tags..." 
                className="w-full bg-[#1c192b]/50 border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-gray-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="text-gray-500 hover:text-white p-2.5 bg-[#1c192b] rounded-xl border border-gray-800/50 transition-all">
              <Bell size={16}/>
            </button>
            <button className="flex items-center gap-2 bg-[#4f46e5] hover:bg-[#4338ca] px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20">
              <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center"><User size={12}/></div>
              Abdul
            </button>
          </div>
        </header> */}

        {/* SCROLLABLE AREA */}
        <div className="p-8 overflow-y-auto custom-scrollbar">
          
          <div className="flex justify-between items-end mb-10">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-3xl font-black tracking-tight">AI Processing</h2>
                <span className="text-green-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 rounded-md">
                   <div className="w-1 h-1 bg-green-500 rounded-full" /> Active
                </span>
              </div>
              <p className="text-gray-500 text-sm">Your photos are being analyzed and enhanced by our neural engine.</p>
            </div>
            <div className="text-right">
                <div className="text-4xl font-black tracking-tighter text-indigo-400">76%</div>
                <div className="text-[9px] text-gray-600 uppercase tracking-[0.2em] font-bold mb-2">Overall Progress</div>
                <div className="w-40 h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all duration-1000" style={{width: '76%'}} />
                </div>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-4 gap-5 mb-12">
            {[
              { label: "Total Photos", val: "10", icon: ImageIcon, color: "text-indigo-400", bg: "bg-indigo-500/10" },
              { label: "In Queue", val: "0", icon: Clock, color: "text-gray-400", bg: "bg-gray-500/10" },
              { label: "Processing", val: "7", icon: RefreshCw, color: "text-yellow-400", bg: "bg-yellow-500/10" },
              { label: "Completed", val: "3", icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10" },
            ].map((s, i) => (
              <div key={i} className="bg-[#151221] border border-gray-800/40 p-5 rounded-2xl flex justify-between items-center hover:bg-[#1c192b] transition-colors cursor-default">
                <div>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">{s.label}</p>
                  <p className="text-2xl font-black">{s.val}</p>
                </div>
                <div className={`${s.bg} ${s.color} p-2.5 rounded-xl`}>
                  <s.icon size={20} />
                </div>
              </div>
            ))}
          </div>

          {/* QUEUE */}
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <Zap size={14} className="text-yellow-500 fill-yellow-500" /> Processing Queue
            </h3>
            <div className="flex gap-5">
               {['Queued', 'Analyzing', 'Processing', 'Complete'].map(t => (
                 <div key={t} className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity cursor-default">
                    <div className={`w-1.5 h-1.5 rounded-full ${statusConfig[t.toLowerCase()].dot}`} />
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{t}</span>
                 </div>
               ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-10">
            {items.map((item) => (
              <div key={item.id} className="bg-[#151221] border border-gray-800/30 rounded-3xl overflow-hidden group hover:border-indigo-500/30 transition-all hover:shadow-2xl hover:shadow-black/50">
                {/* Image Section */}
                <div className={`h-48 relative bg-cover bg-center transition-transform duration-700 group-hover:scale-105 ${item.color}`}>
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
                  
                  {/* Status Badge */}
                  <div className={`absolute top-4 right-4 ${statusConfig[item.status].badge} backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 border border-white/5`}>
                    <Zap size={10} className={`${item.status === 'complete' ? 'text-green-400 fill-green-400' : 'text-yellow-400 fill-yellow-400'}`}/>
                    <span className="text-[9px] font-black uppercase tracking-tighter text-white">{item.status}</span>
                  </div>

                  {/* Circular Progress Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CircularProgress percent={item.progress} />
                  </div>
                </div>

                {/* Info Section */}
                <div className="p-6 bg-[#151221] relative z-10">
                  <div className="flex justify-between items-center mb-5">
                    <h4 className="font-bold text-xs tracking-tight">{item.title}</h4>
                    <button className="text-gray-600 hover:text-white transition-colors"><MoreVertical size={14} /></button>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-gray-800/50 rounded-full mb-3 overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-1000 ease-in-out ${item.status === 'complete' ? 'bg-green-500' : 'bg-yellow-500'}`} 
                        style={{ width: `${item.progress}%` }} 
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-gray-500 font-bold italic tracking-wide">{item.stage}</span>
                    <span className={`text-[10px] font-black ${item.status === 'complete' ? 'text-green-500' : 'text-yellow-500'}`}>
                      {Math.round(item.progress)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}