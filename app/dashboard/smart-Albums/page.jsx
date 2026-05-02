"use client"

import React, { useState } from 'react';
import {
  Sparkles, Zap, Users, Image as ImageIcon, Calendar,
  Star, ChevronRight, RefreshCw, Plus, SortAsc,
  Brain, ScanFace, Layers, Award, Clock, TrendingUp,
  MoreVertical, CheckCircle, AlertCircle, Cpu
} from 'lucide-react';

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const suggestions = [
  {
    id: 1, title: "New Face Detected",
    desc: "15 photos with unrecognized face",
    action: "Create Album", actionType: "create",
    emoji: "👤", color: "bg-indigo-900/50", accent: "bg-indigo-800/30",
  },
  {
    id: 2, title: "Weekend Photos",
    desc: "42 photos from last weekend",
    action: "Auto-Generate", actionType: "generate",
    emoji: "🏕️", color: "bg-orange-900/50", accent: "bg-amber-800/30",
  },
  {
    id: 3, title: "Food Photography",
    desc: "23 food photos detected",
    action: "Create Album", actionType: "create",
    emoji: "🍜", color: "bg-rose-900/50", accent: "bg-red-800/30",
  },
];

const allAlbums = [
  // Face albums
  { id: 1,  name: "Person 1",           sub: "Confidence",  value: 95, type: "face",   photos: 47,  updated: "2 hours ago",  emoji: "👨",  color: "bg-blue-900/50",    accent: "bg-blue-800/30",   generated: true  },
  { id: 2,  name: "Person 2",           sub: "Confidence",  value: 92, type: "face",   photos: 32,  updated: "5 hours ago",  emoji: "👩",  color: "bg-rose-900/50",    accent: "bg-pink-800/30",   generated: true  },
  { id: 3,  name: "Person 3",           sub: "Confidence",  value: 88, type: "face",   photos: 28,  updated: "1 day ago",    emoji: "🧑",  color: "bg-amber-900/50",   accent: "bg-yellow-800/30", generated: true  },
  // Scene albums
  { id: 4,  name: "Outdoor Adventures", sub: "Scene Score", value: 94, type: "scene",  photos: 156, updated: "3 hours ago",  emoji: "🏔️", color: "bg-cyan-900/50",    accent: "bg-teal-800/30",   generated: true  },
  { id: 5,  name: "City Life",          sub: "Scene Score", value: 87, type: "scene",  photos: 67,  updated: "Yesterday",    emoji: "🌆",  color: "bg-slate-800/60",   accent: "bg-gray-700/30",   generated: true  },
  { id: 6,  name: "Nature & Forests",   sub: "Scene Score", value: 91, type: "scene",  photos: 134, updated: "2 days ago",   emoji: "🌿",  color: "bg-green-900/50",   accent: "bg-emerald-800/30",generated: true  },
  { id: 7,  name: "Interiors",          sub: "Scene Score", value: 79, type: "scene",  photos: 89,  updated: "4 days ago",   emoji: "🛋️", color: "bg-orange-900/50",  accent: "bg-amber-800/30",  generated: false },
  // Event albums
  { id: 8,  name: "Sunset Collection",  sub: "Event Score", value: 98, type: "event",  photos: 234, updated: "6 hours ago",  emoji: "🌅",  color: "bg-pink-900/50",    accent: "bg-rose-800/30",   generated: true  },
  { id: 9,  name: "Weekend Vibes",      sub: "Event Score", value: 85, type: "event",  photos: 42,  updated: "3 days ago",   emoji: "🏕️", color: "bg-violet-900/50",  accent: "bg-purple-800/30", generated: true  },
  { id: 10, name: "Birthday Party",     sub: "Event Score", value: 96, type: "event",  photos: 110, updated: "1 week ago",   emoji: "🎂",  color: "bg-yellow-900/50",  accent: "bg-amber-800/30",  generated: false },
  // Quality albums
  { id: 11, name: "Best Shots",         sub: "Quality",     value: 99, type: "quality",photos: 23,  updated: "12 hours ago", emoji: "⭐",  color: "bg-indigo-900/50",  accent: "bg-blue-800/30",   generated: true  },
  { id: 12, name: "Top Portraits",      sub: "Quality",     value: 97, type: "quality",photos: 18,  updated: "2 days ago",   emoji: "🏆",  color: "bg-teal-900/50",    accent: "bg-cyan-800/30",   generated: true  },
];

const tabConfig = [
  { key: "all",     label: "All Albums", icon: Layers,   count: 12 },
  { key: "face",    label: "By Faces",   icon: ScanFace, count: 3  },
  { key: "scene",   label: "By Scenes",  icon: ImageIcon,count: 4  },
  { key: "event",   label: "By Events",  icon: Calendar, count: 3  },
  { key: "quality", label: "By Quality", icon: Award,    count: 2  },
];

const sortOptions = ["Name", "Photos", "Updated", "Confidence"];

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="bg-[#161026] border border-gray-800/70 rounded-2xl p-5 flex items-center gap-4 hover:border-indigo-500/30 transition-all duration-300 cursor-default group">
      <div className={`${iconBg} ${iconColor} p-3 rounded-xl shrink-0 group-hover:scale-110 transition-transform`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">{label}</p>
        <p className="text-2xl font-black text-white leading-none">{value}</p>
      </div>
    </div>
  );
}

// ─── SUGGESTION CARD ──────────────────────────────────────────────────────────
function SuggestionCard({ item }) {
  const [done, setDone] = useState(false);

  if (done) return (
    <div className="bg-[#161026] border border-green-500/20 rounded-2xl p-4 flex items-center gap-3">
      <CheckCircle size={18} className="text-green-400" />
      <span className="text-xs text-green-400 font-semibold">Album created!</span>
    </div>
  );

  return (
    <div className={`${item.color} border border-white/5 rounded-2xl overflow-hidden flex items-stretch hover:border-indigo-500/30 transition-all duration-300 group cursor-default`}>
      {/* Emoji thumbnail */}
      <div className={`w-20 ${item.accent} flex items-center justify-center shrink-0 text-4xl select-none`}>
        {item.emoji}
      </div>
      {/* Info */}
      <div className="p-4 flex flex-col justify-between flex-1 min-w-0">
        <div>
          <p className="text-sm font-bold text-white truncate">{item.title}</p>
          <p className="text-[11px] text-gray-400 mt-0.5 truncate">{item.desc}</p>
        </div>
        <button
          onClick={() => setDone(true)}
          className={`mt-3 flex items-center gap-1.5 text-[11px] font-black w-fit cursor-pointer transition-all
            ${item.actionType === 'generate'
              ? 'text-yellow-400 hover:text-yellow-300'
              : 'text-indigo-400 hover:text-indigo-300'}`}
        >
          {item.actionType === 'generate'
            ? <><Sparkles size={11} /> {item.action}</>
            : <><Plus size={11} /> {item.action}</>}
        </button>
      </div>
    </div>
  );
}

// ─── CONFIDENCE BAR ───────────────────────────────────────────────────────────
function ConfidenceBar({ value, type }) {
  const color =
    type === "face"    ? "bg-indigo-500" :
    type === "scene"   ? "bg-cyan-500"   :
    type === "event"   ? "bg-rose-500"   :
    type === "quality" ? "bg-yellow-500" : "bg-gray-500";

  const textColor =
    type === "face"    ? "text-indigo-400" :
    type === "scene"   ? "text-cyan-400"   :
    type === "event"   ? "text-rose-400"   :
    type === "quality" ? "text-yellow-400" : "text-gray-400";

  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className={`text-[10px] font-black ${textColor} w-8 text-right`}>{value}%</span>
    </div>
  );
}

// ─── ALBUM CARD (Grid) ────────────────────────────────────────────────────────
function SmartAlbumCard({ album }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const typeBadge = {
    face:    { label: "Face",    color: "bg-indigo-500/20 border-indigo-500/30 text-indigo-300" },
    scene:   { label: "Scene",   color: "bg-cyan-500/20 border-cyan-500/30 text-cyan-300"       },
    event:   { label: "Event",   color: "bg-rose-500/20 border-rose-500/30 text-rose-300"       },
    quality: { label: "Quality", color: "bg-yellow-500/20 border-yellow-500/30 text-yellow-300" },
  };
  const badge = typeBadge[album.type];

  return (
    <div
      className="bg-[#161026] border border-gray-800/70 rounded-2xl overflow-hidden hover:border-indigo-500/40 transition-all duration-300 group cursor-pointer"
      onMouseLeave={() => setMenuOpen(false)}
    >
      {/* Thumbnail */}
      <div className={`h-40 ${album.color} relative flex items-center justify-center overflow-hidden`}>
        <div className={`absolute inset-0 ${album.accent}`} style={{ clipPath: "ellipse(70% 60% at 50% 110%)" }} />
        <span className="text-6xl select-none z-10 drop-shadow-lg transition-transform duration-300 group-hover:scale-110">
          {album.emoji}
        </span>

        {/* Photo count — top right */}
        <div className="absolute top-3 right-3 bg-black/60 border border-white/10 backdrop-blur-sm px-2 py-1 rounded-full z-20">
          <span className="text-[10px] font-black text-white">{album.photos} photos</span>
        </div>

        {/* AI Generated badge — bottom left */}
        {album.generated && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-yellow-500/20 border border-yellow-500/30 backdrop-blur-sm px-2 py-1 rounded-full z-20">
            <Sparkles size={9} className="text-yellow-400" />
            <span className="text-[9px] font-black text-yellow-300">AI Generated</span>
          </div>
        )}

        {/* Type badge — top left */}
        <div className={`absolute top-3 left-3 border px-2 py-1 rounded-full text-[9px] font-bold z-20 ${badge.color}`}>
          {badge.label}
        </div>

        {/* Menu btn */}
        <div className="absolute top-10 right-3 z-20">
          <button
            onClick={e => { e.stopPropagation(); setMenuOpen(p => !p); }}
            className="w-6 h-6 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition cursor-pointer opacity-0 group-hover:opacity-100"
          >
            <MoreVertical size={11} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-7 w-36 bg-[#1c1430] border border-gray-700/60 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
              {["Open", "Rename", "Share", "Delete"].map(item => (
                <button key={item}
                  className={`w-full text-left px-3 py-2 text-xs font-medium transition cursor-pointer hover:bg-white/5
                    ${item === "Delete" ? "text-red-400" : "text-gray-300"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
            {album.name}
          </p>
          <ChevronRight size={14} className="text-gray-600 group-hover:text-indigo-400 transition-colors shrink-0 mt-0.5" />
        </div>

        <p className="text-[10px] text-gray-500 mt-0.5">{album.sub}</p>
        <ConfidenceBar value={album.value} type={album.type} />

        <div className="flex items-center gap-1.5 mt-3">
          <Clock size={10} className="text-gray-600" />
          <span className="text-[10px] text-gray-600">Updated {album.updated}</span>
        </div>
      </div>
    </div>
  );
}

// ─── ALBUM ROW (List) ─────────────────────────────────────────────────────────
function SmartAlbumRow({ album }) {
  const typeBadge = {
    face:    "bg-indigo-500/15 border-indigo-500/30 text-indigo-400",
    scene:   "bg-cyan-500/15 border-cyan-500/30 text-cyan-400",
    event:   "bg-rose-500/15 border-rose-500/30 text-rose-400",
    quality: "bg-yellow-500/15 border-yellow-500/30 text-yellow-400",
  };

  return (
    <div className="grid grid-cols-[2.5rem_1fr_90px_90px_130px_110px_2rem] gap-4 px-5 py-4 items-center border-b border-gray-800/40 hover:bg-white/2 transition group cursor-pointer">
      <div className={`w-9 h-9 rounded-xl ${album.color} flex items-center justify-center text-xl shrink-0`}>
        {album.emoji}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-100 truncate group-hover:text-indigo-300 transition-colors">{album.name}</p>
        {album.generated && (
          <div className="flex items-center gap-1 mt-0.5">
            <Sparkles size={8} className="text-yellow-400" />
            <span className="text-[9px] text-yellow-400 font-bold">AI Generated</span>
          </div>
        )}
      </div>
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-bold w-fit ${typeBadge[album.type]}`}>
        {album.type.charAt(0).toUpperCase() + album.type.slice(1)}
      </div>
      <div className="flex items-center gap-1.5">
        <ImageIcon size={11} className="text-gray-500" />
        <span className="text-xs font-bold text-gray-300">{album.photos}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full
              ${album.type === 'face' ? 'bg-indigo-500' : album.type === 'scene' ? 'bg-cyan-500' : album.type === 'event' ? 'bg-rose-500' : 'bg-yellow-500'}`}
            style={{ width: `${album.value}%` }}
          />
        </div>
        <span className="text-[10px] font-black text-gray-400 w-8 text-right">{album.value}%</span>
      </div>
      <span className="text-[10px] text-gray-600">{album.updated}</span>
      <ChevronRight size={13} className="text-gray-700 group-hover:text-indigo-400 transition-colors" />
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function SmartAlbumsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode,  setViewMode]  = useState("grid");
  const [sort,      setSort]      = useState("Name");
  const [generating, setGenerating] = useState(false);

  const filtered = activeTab === "all"
    ? allAlbums
    : allAlbums.filter(a => a.type === activeTab);

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "Name")       return a.name.localeCompare(b.name);
    if (sort === "Photos")     return b.photos - a.photos;
    if (sort === "Confidence") return b.value - a.value;
    return 0;
  });

  const handleAutoGenerate = () => {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 2500);
  };

  const stats = {
    total:   allAlbums.length,
    faces:   allAlbums.filter(a => a.type === "face").length,
    scenes:  allAlbums.filter(a => a.type === "scene").length,
    events:  allAlbums.filter(a => a.type === "event").length,
  };

  return (
    <div className="min-h-screen bg-[#0f0a19] text-gray-100 p-6 md:p-8">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-yellow-500/10 p-2 rounded-xl">
              <Sparkles size={20} className="text-yellow-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Smart Albums</h2>
          </div>
          <p className="text-xs text-gray-500 font-medium ml-1">
            AI-powered organization based on faces, scenes, events, and quality
          </p>
        </div>

        <button
          onClick={handleAutoGenerate}
          disabled={generating}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-70 px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer shadow-lg shadow-indigo-500/20"
        >
          {generating
            ? <><RefreshCw size={14} className="animate-spin" /> Generating...</>
            : <><Zap size={14} /> Auto-Generate Albums</>}
        </button>
      </header>

      {/* ── STAT CARDS ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Smart Albums" value={stats.total}  icon={Brain}     iconBg="bg-yellow-500/10"  iconColor="text-yellow-400" />
        <StatCard label="Face Albums"         value={stats.faces}  icon={ScanFace}  iconBg="bg-indigo-500/10"  iconColor="text-indigo-400" />
        <StatCard label="Scene Albums"        value={stats.scenes} icon={ImageIcon} iconBg="bg-cyan-500/10"    iconColor="text-cyan-400"   />
        <StatCard label="Event Albums"        value={stats.events} icon={Calendar}  iconBg="bg-rose-500/10"    iconColor="text-rose-400"   />
      </div>

      {/* ── AI SUGGESTIONS ──────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Brain size={15} className="text-yellow-400" /> AI Suggestions
          </h3>
          <div className="flex items-center gap-1 bg-yellow-500/15 border border-yellow-500/30 px-2 py-0.5 rounded-full">
            <span className="text-[9px] font-black text-yellow-400">3 New</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {suggestions.map(s => <SuggestionCard key={s.id} item={s} />)}
        </div>
      </div>

      {/* ── FILTER TABS ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {tabConfig.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold whitespace-nowrap transition-all cursor-pointer
                ${active
                  ? 'bg-yellow-500/15 border-yellow-500/40 text-yellow-400'
                  : 'bg-[#161026] border-gray-800 text-gray-500 hover:text-gray-300 hover:border-gray-600'}`}
            >
              <Icon size={12} />
              {tab.label}
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${active ? 'bg-yellow-500/20 text-yellow-300' : 'bg-gray-800 text-gray-500'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── ALBUMS GRID / LIST ──────────────────────────────────────────── */}
      <div>
        {/* Section title + controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h3 className="font-bold text-white">
            All Smart Albums
            <span className="text-[11px] text-gray-500 ml-2 font-normal">({sorted.length})</span>
          </h3>

          <div className="flex items-center gap-3">
            {/* Sort */}
            <div className="flex items-center gap-2 bg-[#161026] border border-gray-800 px-3 py-2 rounded-xl">
              <SortAsc size={13} className="text-gray-500" />
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="bg-transparent text-[11px] font-bold text-gray-400 outline-none cursor-pointer"
              >
                {sortOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            {/* View toggle */}
            <div className="flex bg-[#161026] border border-gray-800 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <Cpu size={14} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <Layers size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Grid view */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {sorted.map(album => <SmartAlbumCard key={album.id} album={album} />)}
          </div>
        )}

        {/* List view */}
        {viewMode === 'list' && (
          <div className="bg-[#161026] border border-gray-800/70 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[2.5rem_1fr_90px_90px_130px_110px_2rem] gap-4 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-gray-800">
              <span />
              <span>Name</span>
              <span>Type</span>
              <span>Photos</span>
              <span>Score</span>
              <span>Updated</span>
              <span />
            </div>
            {sorted.map(album => <SmartAlbumRow key={album.id} album={album} />)}
          </div>
        )}
      </div>

      {/* ── FOOTER INFO ─────────────────────────────────────────────────── */}
      <div className="mt-8 flex items-center gap-3 bg-[#161026] border border-gray-800/50 rounded-2xl px-5 py-4">
        <div className="bg-indigo-500/10 p-2 rounded-xl shrink-0">
          <TrendingUp size={16} className="text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white">AI is continuously learning</p>
          <p className="text-[10px] text-gray-500">Smart Albums improve as more photos are added. Confidence scores update automatically.</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] text-green-400 font-bold">Model Active</span>
        </div>
      </div>

    </div>
  );
}