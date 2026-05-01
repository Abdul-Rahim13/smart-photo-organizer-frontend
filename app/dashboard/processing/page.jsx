"use client"

import React, { useState, useEffect } from 'react';
import {
  Bell, User, Search, Cpu, CheckCircle, Clock, 
  Layers, Zap, RefreshCw, Filter, MoreVertical,
  Image as ImageIcon, XCircle, PlayCircle, PauseCircle,
  ChevronDown, AlertTriangle
} from 'lucide-react';

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const queueItems = [
  { id: 1,  title: "Sunset Beach",    status: "processing", progress: 54,  stage: "Applying filters",  color: "bg-blue-900/40",    badge: "bg-yellow-500" },
  { id: 2,  title: "Mountain Peak",   status: "processing", progress: 86,  stage: "Optimizing",        color: "bg-emerald-900/40", badge: "bg-yellow-500" },
  { id: 3,  title: "City Skyline",    status: "processing", progress: 48,  stage: "Finalizing",        color: "bg-indigo-900/40",  badge: "bg-yellow-500" },
  { id: 4,  title: "Coffee Shop",     status: "complete",   progress: 100, stage: "Done",              color: "bg-orange-900/40",  badge: "bg-green-500"  },
  { id: 5,  title: "Forest Path",     status: "complete",   progress: 100, stage: "Done",              color: "bg-green-900/40",   badge: "bg-green-500"  },
  { id: 6,  title: "Desert Road",     status: "queued",     progress: 0,   stage: "Waiting",           color: "bg-gray-800/60",    badge: "bg-gray-500"   },
  { id: 7,  title: "Harbor View",     status: "analyzing",  progress: 22,  stage: "Analyzing",         color: "bg-cyan-900/40",    badge: "bg-blue-500"   },
  { id: 8,  title: "Night Market",    status: "queued",     progress: 0,   stage: "Waiting",           color: "bg-pink-900/40",    badge: "bg-gray-500"   },
];

const statusConfig = {
  queued:     { label: "Queued",     color: "text-gray-400",   bg: "bg-gray-500/15  border-gray-500/30",  dot: "bg-gray-400"   },
  analyzing:  { label: "Analyzing",  color: "text-blue-400",   bg: "bg-blue-500/15  border-blue-500/30",  dot: "bg-blue-400"   },
  processing: { label: "Processing", color: "text-yellow-400", bg: "bg-yellow-500/15 border-yellow-500/30", dot: "bg-yellow-400" },
  complete:   { label: "Complete",   color: "text-green-400",  bg: "bg-green-500/15 border-green-500/30", dot: "bg-green-400"  },
};

// ─── CIRCULAR PROGRESS ───────────────────────────────────────────────────────
function CircularProgress({ percent, status }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  const trackColor = "#1e1a2e";
  const fillColor  = status === "complete" ? "#22c55e" : status === "analyzing" ? "#3b82f6" : "#facc15";

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke={trackColor} strokeWidth="7"/>
        <circle
          cx="48" cy="48" r={r} fill="none"
          stroke={fillColor} strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <span className="absolute text-sm font-black text-white">{percent}%</span>
    </div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="bg-[#161026] border border-gray-800/70 rounded-2xl p-5 flex items-center gap-4">
      <div className={`${iconBg} ${iconColor} p-3 rounded-xl flex-shrink-0`}>
        <Icon size={20}/>
      </div>
      <div>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">{label}</p>
        <p className="text-2xl font-black text-white leading-none">{value}</p>
      </div>
    </div>
  );
}

// ─── QUEUE CARD ──────────────────────────────────────────────────────────────
function QueueCard({ item }) {
  const cfg = statusConfig[item.status];
  const barColor = item.status === "complete" ? "bg-green-500" : item.status === "analyzing" ? "bg-blue-500" : "bg-yellow-500";

  return (
    <div className="bg-[#161026] border border-gray-800/70 rounded-2xl overflow-hidden hover:border-indigo-500/40 transition-all duration-300 group">
      {/* Thumbnail area */}
      <div className={`h-40 ${item.color} relative flex items-center justify-center`}>
        <ImageIcon size={40} className="opacity-10 text-white"/>

        {/* Status badge */}
        <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black text-white ${item.badge}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse"/>
          {cfg.label}
        </div>

        {/* Circular progress centered */}
        <div className="absolute inset-0 flex items-center justify-center">
          <CircularProgress percent={item.progress} status={item.status}/>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <p className="text-sm font-bold text-white truncate">{item.title}</p>
          <button className="text-gray-600 hover:text-gray-300 transition cursor-pointer flex-shrink-0">
            <MoreVertical size={14}/>
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${item.progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[10px] text-gray-500 font-medium">{item.stage}</p>
          <p className={`text-[10px] font-black ${cfg.color}`}>{item.progress}%</p>
        </div>
      </div>
    </div>
  );
}

// ─── LIST ROW ────────────────────────────────────────────────────────────────
function QueueRow({ item }) {
  const cfg = statusConfig[item.status];
  const barColor = item.status === "complete" ? "bg-green-500" : item.status === "analyzing" ? "bg-blue-500" : "bg-yellow-500";

  return (
    <div className="grid grid-cols-[2.5rem_1fr_120px_160px_80px_2rem] gap-4 px-5 py-4 items-center border-b border-gray-800/40 hover:bg-white/[0.02] transition group cursor-default">
      {/* Thumbnail */}
      <div className={`w-9 h-9 rounded-lg ${item.color} flex items-center justify-center flex-shrink-0`}>
        <ImageIcon size={14} className="opacity-30 text-white"/>
      </div>

      {/* Name */}
      <p className="text-sm font-semibold text-gray-100 truncate">{item.title}</p>

      {/* Status */}
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border w-fit text-[10px] font-bold ${cfg.color} ${cfg.bg}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}/>
        {cfg.label}
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${item.progress}%` }}/>
        </div>
        <span className={`text-[10px] font-black w-8 text-right ${cfg.color}`}>{item.progress}%</span>
      </div>

      {/* Stage */}
      <p className="text-[10px] text-gray-500 font-medium truncate">{item.stage}</p>

      {/* Menu */}
      <button className="text-gray-700 hover:text-gray-300 transition cursor-pointer opacity-0 group-hover:opacity-100">
        <MoreVertical size={14}/>
      </button>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function ProcessingPage() {
  const [viewMode, setViewMode]   = useState('grid');
  const [filter, setFilter]       = useState('All');
  const [overall, setOverall]     = useState(76);

  const filters = ['All', 'Queued', 'Analyzing', 'Processing', 'Complete'];

  const filtered = queueItems.filter(i =>
    filter === 'All' ? true : i.status === filter.toLowerCase()
  );

  const stats = {
    total:      queueItems.length,
    queued:     queueItems.filter(i => i.status === 'queued').length,
    processing: queueItems.filter(i => i.status === 'processing').length,
    complete:   queueItems.filter(i => i.status === 'complete').length,
  };

  return (
    <div className="min-h-screen bg-[#0f0a19] text-gray-100 p-6 md:p-8">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold">AI Processing</h2>
              <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/>
                <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Active</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium">Your photos are being analyzed and enhanced by AI</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Overall progress pill */}
          <div className="hidden sm:flex items-center gap-3 bg-[#1c1430] border border-gray-800 px-4 py-2.5 rounded-xl">
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Overall Progress</p>
              <p className="text-xl font-black text-white leading-none">{overall}%</p>
            </div>
            <div className="w-10 h-10 relative">
              <svg width="40" height="40" className="-rotate-90">
                <circle cx="20" cy="20" r="14" fill="none" stroke="#1e1a2e" strokeWidth="4"/>
                <circle cx="20" cy="20" r="14" fill="none" stroke="#6366f1" strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 14}
                  strokeDashoffset={2 * Math.PI * 14 * (1 - overall / 100)}
                  style={{ transition: "stroke-dashoffset 0.6s ease" }}
                />
              </svg>
            </div>
          </div>

          <button className="p-2.5 bg-[#1c1430] border border-gray-800 rounded-xl text-gray-400 hover:text-white transition cursor-pointer">
            <Bell size={18}/>
          </button>
          <button className="flex items-center gap-2 bg-[#4f46e5] px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-500 transition cursor-pointer">
            <User size={15}/> Abdul
          </button>
        </div>
      </header>

      {/* ── STAT CARDS ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Photos"  value={stats.total}      icon={ImageIcon}    iconBg="bg-indigo-500/10" iconColor="text-indigo-400"/>
        <StatCard label="In Queue"      value={stats.queued}     icon={Clock}        iconBg="bg-gray-500/10"   iconColor="text-gray-400"  />
        <StatCard label="Processing"    value={stats.processing} icon={RefreshCw}    iconBg="bg-yellow-500/10" iconColor="text-yellow-400"/>
        <StatCard label="Completed"     value={stats.complete}   icon={CheckCircle}  iconBg="bg-green-500/10"  iconColor="text-green-400" />
      </div>

      {/* ── LEGEND + CONTROLS ───────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Zap size={16} className="text-yellow-400"/> Processing Queue
          </h3>
          {/* Legend */}
          <div className="hidden md:flex items-center gap-4 ml-2">
            {Object.entries(statusConfig).map(([key, val]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${val.dot}`}/>
                <span className="text-[10px] text-gray-500 font-medium">{val.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter tabs */}
          <div className="flex bg-[#161026] border border-gray-800 p-1 rounded-xl gap-1 overflow-x-auto">
            {filters.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer
                  ${filter === f ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                {f}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex bg-[#161026] border border-gray-800 p-1 rounded-xl">
            <button onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
              <Layers size={14}/>
            </button>
            <button onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
              <Filter size={14}/>
            </button>
          </div>
        </div>
      </div>

      {/* ── QUEUE — GRID VIEW ───────────────────────────────────────────── */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(item => <QueueCard key={item.id} item={item}/>)}
          {filtered.length === 0 && <EmptyState/>}
        </div>
      )}

      {/* ── QUEUE — LIST VIEW ───────────────────────────────────────────── */}
      {viewMode === 'list' && (
        <div className="bg-[#161026] border border-gray-800/70 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[2.5rem_1fr_120px_160px_80px_2rem] gap-4 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-gray-800">
            <span/>
            <span>Name</span>
            <span>Status</span>
            <span>Progress</span>
            <span>Stage</span>
            <span/>
          </div>
          {filtered.map(item => <QueueRow key={item.id} item={item}/>)}
          {filtered.length === 0 && <EmptyState/>}
        </div>
      )}

      {/* ── BOTTOM ACTIONS ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 mt-8">
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer">
          <PlayCircle size={15}/> Resume All
        </button>
        <button className="flex items-center gap-2 bg-[#1c1430] border border-gray-800 hover:border-gray-600 px-5 py-2.5 rounded-xl text-xs font-bold text-gray-300 transition cursor-pointer">
          <PauseCircle size={15}/> Pause Queue
        </button>
        <button className="flex items-center gap-2 bg-[#1c1430] border border-gray-800 hover:border-red-500/40 px-5 py-2.5 rounded-xl text-xs font-bold text-red-400 transition cursor-pointer ml-auto">
          <XCircle size={15}/> Clear Completed
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <AlertTriangle size={40} className="text-gray-700 mb-3"/>
      <p className="text-gray-400 font-semibold text-sm">No items in this category</p>
      <p className="text-gray-600 text-xs mt-1">Try selecting a different filter</p>
    </div>
  );
}