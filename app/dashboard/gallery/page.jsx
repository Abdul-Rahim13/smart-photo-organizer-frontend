"use client"

import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Bell, User, Filter, Image as ImageIcon, 
  MoreVertical, Grid, List, User as UserIcon,
  ChevronLeft, ChevronRight, LayoutDashboard, Upload, 
  Activity, Layers, LayoutGrid, Trash2, Cpu, Settings,
  Eye, Download, Share2, Pencil, X, Check, SlidersHorizontal,
  ChevronDown, ArrowUpDown, Star, Heart
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// --- MOCK DATA ---
const galleryPhotos = [
  { id: 1, title: "Portrait Woman",   cat: "Indoor",   score: 98, color: "bg-purple-900/30",  faces: 1, size: "2.4 MB", date: "2024-01-15", starred: false },
  { id: 2, title: "City Skyline",     cat: "Urban",    score: 92, color: "bg-blue-900/30",    faces: 0, size: "3.8 MB", date: "2024-01-14", starred: true  },
  { id: 3, title: "Mountain Peak",    cat: "Outdoor",  score: 95, color: "bg-emerald-900/30", faces: 0, size: "5.1 MB", date: "2024-01-13", starred: false },
  { id: 4, title: "Family Picnic",    cat: "Outdoor",  score: 88, color: "bg-orange-900/30",  faces: 4, size: "4.2 MB", date: "2024-01-12", starred: false },
  { id: 5, title: "Neon Streets",     cat: "Urban",    score: 90, color: "bg-pink-900/30",    faces: 2, size: "2.9 MB", date: "2024-01-11", starred: true  },
  { id: 6, title: "Office Space",     cat: "Indoor",   score: 85, color: "bg-gray-700/30",    faces: 3, size: "3.1 MB", date: "2024-01-10", starred: false },
  { id: 7, title: "Forest Path",      cat: "Outdoor",  score: 94, color: "bg-green-900/30",   faces: 0, size: "6.3 MB", date: "2024-01-09", starred: false },
  { id: 8, title: "Desert Sands",     cat: "Outdoor",  score: 91, color: "bg-yellow-900/30",  faces: 0, size: "4.7 MB", date: "2024-01-08", starred: true  },
  { id: 9, title: "Rooftop Party",    cat: "Urban",    score: 87, color: "bg-red-900/30",     faces: 6, size: "3.5 MB", date: "2024-01-07", starred: false },
  { id: 10, title: "Studio Portrait", cat: "Indoor",   score: 96, color: "bg-violet-900/30",  faces: 1, size: "2.1 MB", date: "2024-01-06", starred: false },
  { id: 11, title: "Beach Sunset",    cat: "Outdoor",  score: 93, color: "bg-amber-900/30",   faces: 2, size: "5.5 MB", date: "2024-01-05", starred: true  },
  { id: 12, title: "Night Market",    cat: "Urban",    score: 89, color: "bg-cyan-900/30",    faces: 5, size: "3.3 MB", date: "2024-01-04", starred: false },
];

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

const scoreColor = (s) => s >= 95 ? 'text-green-400' : s >= 90 ? 'text-blue-400' : s >= 85 ? 'text-yellow-400' : 'text-orange-400';
const scoreBg   = (s) => s >= 95 ? 'bg-green-500/10 border-green-500/30' : s >= 90 ? 'bg-blue-500/10 border-blue-500/30' : 'bg-yellow-500/10 border-yellow-500/30';

// ─── PHOTO ACTION MENU ──────────────────────────────────────────────────────
function ActionMenu({ onClose }) {
  const actions = [
    { icon: Eye,      label: "View Photo",  color: "text-indigo-400" },
    { icon: Download, label: "Download",    color: "text-blue-400"   },
    { icon: Share2,   label: "Share",       color: "text-purple-400" },
    { icon: Pencil,   label: "Rename",      color: "text-yellow-400" },
    { icon: Heart,    label: "Favourite",   color: "text-pink-400"   },
    { icon: Trash2,   label: "Delete",      color: "text-red-400"    },
  ];
  return (
    <div className="absolute right-2 top-10 z-50 bg-[#1c1430] border border-gray-700 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden w-44 animate-in">
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={onClose}
          className={`flex items-center gap-3 w-full px-4 py-2.5 text-xs font-semibold ${a.color} hover:bg-white/5 transition-colors cursor-pointer`}
        >
          <a.icon size={14} /> {a.label}
        </button>
      ))}
    </div>
  );
}

// ─── FILTER PANEL ───────────────────────────────────────────────────────────
function FilterPanel({ filters, setFilters, onClose }) {
  const [local, setLocal] = useState(filters);

  const scoreRanges = ['Any', '85–89%', '90–94%', '95–100%'];
  const facesOpts   = ['Any', 'No Faces', '1 Face', '2+ Faces'];
  const sortOpts    = ['Date (Newest)', 'Date (Oldest)', 'Quality (High)', 'Quality (Low)', 'Name A–Z'];

  const apply = () => { setFilters(local); onClose(); };
  const reset = () => setLocal({ score: 'Any', faces: 'Any', sort: 'Date (Newest)' });

  return (
    <div className="absolute right-0 top-14 z-50 bg-[#1c1430] border border-gray-700/70 rounded-2xl shadow-2xl shadow-black/60 w-72 p-5 space-y-5 animate-in">
      <div className="flex items-center justify-between">
        <span className="font-bold text-sm flex items-center gap-2"><SlidersHorizontal size={15} className="text-indigo-400"/> Filters</span>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition cursor-pointer"><X size={16}/></button>
      </div>

      {/* Quality Score */}
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">AI Quality Score</p>
        <div className="grid grid-cols-2 gap-2">
          {scoreRanges.map(r => (
            <button key={r} onClick={() => setLocal(p => ({...p, score: r}))}
              className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${local.score === r ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-gray-700 text-gray-400 hover:border-indigo-500/50'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Faces */}
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Face Detection</p>
        <div className="grid grid-cols-2 gap-2">
          {facesOpts.map(f => (
            <button key={f} onClick={() => setLocal(p => ({...p, faces: f}))}
              className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${local.faces === f ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-gray-700 text-gray-400 hover:border-indigo-500/50'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Sort By</p>
        <div className="space-y-1">
          {sortOpts.map(s => (
            <button key={s} onClick={() => setLocal(p => ({...p, sort: s}))}
              className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${local.sort === s ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300' : 'border-transparent text-gray-400 hover:bg-white/5'}`}>
              <ArrowUpDown size={12}/> {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={reset} className="flex-1 py-2.5 rounded-xl border border-gray-700 text-xs font-bold text-gray-400 hover:text-white transition cursor-pointer">Reset</button>
        <button onClick={apply} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition cursor-pointer">Apply</button>
      </div>
    </div>
  );
}

// ─── GRID CARD ──────────────────────────────────────────────────────────────
function GridCard({ photo, selected, onSelect }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [starred, setStarred] = useState(photo.starred);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className={`bg-[#161026] rounded-[2rem] overflow-hidden border transition-all duration-300 group
      ${selected ? 'border-indigo-500 shadow-lg shadow-indigo-500/20' : 'border-gray-800 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10'}`}>
      <div className={`h-52 ${photo.color} relative flex items-center justify-center overflow-hidden`}>
        {/* Checkbox */}
        <button onClick={() => onSelect(photo.id)}
          className={`absolute top-3 left-3 z-10 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer
            ${selected ? 'bg-indigo-600 border-indigo-500' : 'bg-black/40 border-gray-600 hover:border-indigo-400'}`}>
          {selected && <Check size={12} className="text-white"/>}
        </button>

        {/* Star */}
        <button onClick={() => setStarred(s => !s)}
          className={`absolute top-3 right-10 z-10 transition-all cursor-pointer ${starred ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-400'}`}>
          <Star size={16} fill={starred ? 'currentColor' : 'none'}/>
        </button>

        {/* More menu */}
        <button onClick={() => setMenuOpen(o => !o)}
          className="absolute top-3 right-3 z-10 text-gray-400 hover:text-white transition cursor-pointer">
          <MoreVertical size={16}/>
        </button>
        {menuOpen && <ActionMenu onClose={() => setMenuOpen(false)}/>}

        <ImageIcon className="opacity-10 text-white" size={60}/>

        {/* AI Score Badge */}
        <div className={`absolute bottom-12 right-3 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-black border ${scoreColor(photo.score)} ${scoreBg(photo.score)}`}>
          {photo.score}% AI
        </div>

        {/* Face badge */}
        {photo.faces > 0 && (
          <div className="absolute bottom-12 left-3 bg-indigo-600 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
            <UserIcon size={10} className="text-white"/>
            <span className="text-[10px] text-white font-black">{photo.faces}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0a19] via-transparent to-transparent opacity-70"/>

        {/* Title overlay */}
        <div className="absolute bottom-3 left-4 right-4">
          <p className="text-sm font-bold text-white truncate">{photo.title}</p>
          <p className="text-[10px] text-gray-400 flex items-center gap-1.5 font-medium mt-0.5">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full inline-block"/>
            {photo.cat} · {photo.size}
          </p>
        </div>
      </div>

      <div className="px-4 py-3 flex justify-between items-center bg-[#1c1430]/50 border-t border-gray-800/50">
        <span className="text-[10px] text-gray-500 font-medium">{photo.date}</span>
        <div className="flex items-center gap-3">
          <button className="text-[10px] font-black uppercase tracking-wider text-gray-500 hover:text-white transition cursor-pointer">Details</button>
          <button className="text-[10px] font-black uppercase tracking-wider text-yellow-500 hover:text-yellow-300 transition cursor-pointer">View →</button>
        </div>
      </div>
    </div>
  );
}

// ─── LIST ROW ───────────────────────────────────────────────────────────────
function ListRow({ photo, selected, onSelect, isHeader }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [starred, setStarred] = useState(photo?.starred);
  const ref = useRef(null);

  useEffect(() => {
    if (!isHeader) {
      const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false); };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }
  }, [isHeader]);

  if (isHeader) {
    return (
      <div className="grid grid-cols-[2rem_3.5rem_1fr_120px_80px_90px_80px_90px_2.5rem] gap-4 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-gray-800">
        <span/>
        <span>Preview</span>
        <span>Name</span>
        <span>Scene</span>
        <span>Faces</span>
        <span>Quality</span>
        <span>Size</span>
        <span>Date</span>
        <span/>
      </div>
    );
  }

  return (
    <div ref={ref}
      className={`grid grid-cols-[2rem_3.5rem_1fr_120px_80px_90px_80px_90px_2.5rem] gap-4 px-4 py-3.5 items-center border-b border-gray-800/40 transition-all duration-200 group cursor-pointer
        ${selected ? 'bg-indigo-600/10' : 'hover:bg-white/[0.03]'}`}>

      {/* Checkbox */}
      <button onClick={() => onSelect(photo.id)}
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer flex-shrink-0
          ${selected ? 'bg-indigo-600 border-indigo-500' : 'border-gray-700 hover:border-indigo-400'}`}>
        {selected && <Check size={10} className="text-white"/>}
      </button>

      {/* Preview thumbnail */}
      <div className={`h-10 w-14 rounded-lg ${photo.color} flex items-center justify-center overflow-hidden flex-shrink-0`}>
        <ImageIcon size={16} className="opacity-20 text-white"/>
      </div>

      {/* Name + star */}
      <div className="flex items-center gap-2 min-w-0">
        <button onClick={() => setStarred(s => !s)} className={`flex-shrink-0 transition cursor-pointer ${starred ? 'text-yellow-400' : 'text-gray-700 hover:text-yellow-400'}`}>
          <Star size={12} fill={starred ? 'currentColor' : 'none'}/>
        </button>
        <span className="text-sm font-semibold text-gray-100 truncate">{photo.title}</span>
      </div>

      {/* Scene */}
      <div>
        <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
          {photo.cat}
        </span>
      </div>

      {/* Faces */}
      <div>
        {photo.faces > 0
          ? <span className="flex items-center gap-1.5 text-[11px] font-bold text-blue-400">
              <UserIcon size={12}/> {photo.faces}
            </span>
          : <span className="text-[11px] text-gray-600">—</span>
        }
      </div>

      {/* Quality */}
      <div>
        <span className={`text-[11px] font-black ${scoreColor(photo.score)}`}>{photo.score}%</span>
      </div>

      {/* Size */}
      <div>
        <span className="text-[11px] text-gray-400 font-medium">{photo.size}</span>
      </div>

      {/* Date */}
      <div>
        <span className="text-[11px] text-gray-500 font-medium">{photo.date}</span>
      </div>

      {/* Actions */}
      <div className="relative flex-shrink-0">
        <button onClick={() => setMenuOpen(o => !o)}
          className="text-gray-600 hover:text-yellow-400 transition cursor-pointer opacity-0 group-hover:opacity-100">
          <MoreVertical size={16}/>
        </button>
        {menuOpen && <div className="absolute right-0 top-6"><ActionMenu onClose={() => setMenuOpen(false)}/></div>}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
export default function GalleryPage() {
  const [isCollapsed, setIsCollapsed]     = useState(false);
  const [activeTab, setActiveTab]         = useState('All');
  const [viewMode, setViewMode]           = useState('grid');   // 'grid' | 'list'
  const [selectedIds, setSelectedIds]     = useState([]);
  const [filterOpen, setFilterOpen]       = useState(false);
  const [searchQuery, setSearchQuery]     = useState('');
  const [filters, setFilters]             = useState({ score: 'Any', faces: 'Any', sort: 'Date (Newest)' });
  const filterRef = useRef(null);
  const pathname  = usePathname();

  const tabs = ['All', 'Outdoor', 'Indoor', 'Urban'];

  // Close filter panel on outside click
  useEffect(() => {
    const h = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // ── Filter + search logic
  const filtered = galleryPhotos.filter(p => {
    const matchTab    = activeTab === 'All' || p.cat === activeTab;
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.cat.toLowerCase().includes(searchQuery.toLowerCase());
    const matchScore  = filters.score === 'Any'
      ? true
      : filters.score === '85–89%' ? p.score >= 85 && p.score < 90
      : filters.score === '90–94%' ? p.score >= 90 && p.score < 95
      : p.score >= 95;
    const matchFaces  = filters.faces === 'Any'
      ? true
      : filters.faces === 'No Faces' ? p.faces === 0
      : filters.faces === '1 Face'   ? p.faces === 1
      : p.faces >= 2;
    return matchTab && matchSearch && matchScore && matchFaces;
  }).sort((a, b) => {
    if (filters.sort === 'Quality (High)') return b.score - a.score;
    if (filters.sort === 'Quality (Low)')  return a.score - b.score;
    if (filters.sort === 'Name A–Z')       return a.title.localeCompare(b.title);
    if (filters.sort === 'Date (Oldest)')  return new Date(a.date) - new Date(b.date);
    return new Date(b.date) - new Date(a.date);
  });

  const toggleSelect = (id) => setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAll    = () => setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map(p => p.id));
  const activeFilters = [filters.score, filters.faces, filters.sort].filter(v => !['Any','Date (Newest)'].includes(v)).length;

  return (
    <div className="flex h-screen bg-[#0f0a19] text-gray-100 overflow-hidden">

      {/* ── MAIN ────────────────────────────────────────────── */}
      <main className="flex-1 h-full overflow-y-auto custom-scrollbar p-8">

        {/* HEADER */}
        <header className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">Photo Gallery</h2>
            <div className="flex items-center gap-2 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                {filtered.length} / {galleryPhotos.length} Items
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2.5 bg-[#1c1430] border border-gray-800 rounded-xl text-gray-400 hover:text-white transition cursor-pointer relative">
              <Bell size={18}/>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full"/>
            </button>
            <button className="flex items-center gap-2 bg-[#4f46e5] px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#4338ca] transition shadow-lg shadow-indigo-600/20 cursor-pointer">
              <User size={16}/> Abdul
            </button>
          </div>
        </header>

        {/* SEARCH + FILTER */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18}/>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search photos by name or scene…"
              className="bg-[#1c1430] border border-gray-800 rounded-2xl py-3.5 pl-12 pr-10 text-sm w-full outline-none focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition cursor-pointer">
                <X size={15}/>
              </button>
            )}
          </div>

          <div ref={filterRef} className="relative">
            <button onClick={() => setFilterOpen(o => !o)}
              className={`flex items-center gap-2 px-4 py-3.5 rounded-2xl border text-sm font-semibold transition-all cursor-pointer
                ${filterOpen || activeFilters > 0 ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300' : 'bg-[#1c1430] border-gray-800 text-gray-400 hover:text-white'}`}>
              <Filter size={18}/>
              {activeFilters > 0 && (
                <span className="bg-indigo-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilters}
                </span>
              )}
              <ChevronDown size={14} className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`}/>
            </button>
            {filterOpen && <FilterPanel filters={filters} setFilters={setFilters} onClose={() => setFilterOpen(false)}/>}
          </div>
        </div>

        {/* TABS + VIEW TOGGLE */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div className="flex bg-[#161026] p-1.5 rounded-2xl border border-gray-800/50 overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap cursor-pointer
                  ${activeTab === tab ? 'bg-[#facc15] text-[#161026] shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Selection info */}
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 bg-indigo-600/20 border border-indigo-500/30 px-3 py-2 rounded-xl">
                <span className="text-xs font-bold text-indigo-300">{selectedIds.length} selected</span>
                <button onClick={() => setSelectedIds([])} className="text-gray-500 hover:text-white transition cursor-pointer"><X size={12}/></button>
              </div>
            )}

            {/* Grid / List toggle */}
            <div className="bg-[#161026] flex p-1 rounded-xl border border-gray-800">
              <button onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}>
                <Grid size={16}/>
              </button>
              <button onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}>
                <List size={16}/>
              </button>
            </div>

            <select className="bg-[#1c1430] border border-gray-800 text-xs font-bold text-yellow-500 px-3 py-2.5 rounded-xl outline-none cursor-pointer hover:border-indigo-500/50 transition">
              <option>Face ({galleryPhotos.filter(p=>p.faces>0).length})</option>
              <option>Landscape ({galleryPhotos.filter(p=>p.faces===0).length})</option>
              <option>All ({galleryPhotos.length})</option>
            </select>
          </div>
        </div>

        {/* BULK ACTIONS (when items selected) */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 mb-6 p-3 bg-indigo-600/10 border border-indigo-500/30 rounded-2xl">
            <button onClick={toggleAll} className="text-xs font-bold text-indigo-300 hover:text-white transition cursor-pointer">
              {selectedIds.length === filtered.length ? 'Deselect All' : 'Select All'}
            </button>
            <div className="w-px h-4 bg-gray-700"/>
            <button className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition cursor-pointer"><Download size={13}/> Download</button>
            <button className="flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:text-purple-300 transition cursor-pointer"><Share2 size={13}/> Share</button>
            <button className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 transition cursor-pointer ml-auto"><Trash2 size={13}/> Delete</button>
          </div>
        )}

        {/* EMPTY STATE */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <ImageIcon size={48} className="text-gray-700 mb-4"/>
            <p className="text-gray-400 font-semibold">No photos match your filters</p>
            <button onClick={() => { setSearchQuery(''); setActiveTab('All'); setFilters({ score: 'Any', faces: 'Any', sort: 'Date (Newest)' }); }}
              className="mt-4 text-xs text-indigo-400 hover:text-indigo-300 transition underline underline-offset-4 cursor-pointer">
              Clear all filters
            </button>
          </div>
        )}

        {/* ── GRID VIEW ───────────────────────────── */}
        {viewMode === 'grid' && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(photo => (
              <GridCard key={photo.id} photo={photo} selected={selectedIds.includes(photo.id)} onSelect={toggleSelect}/>
            ))}
          </div>
        )}

        {/* ── LIST VIEW ───────────────────────────── */}
        {viewMode === 'list' && filtered.length > 0 && (
          <div className="bg-[#161026] border border-gray-800/70 rounded-2xl overflow-hidden">
            {/* List header */}
            <div className="grid grid-cols-[2rem_3.5rem_1fr_120px_80px_90px_80px_90px_2.5rem] gap-4 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-gray-800">
              <button onClick={toggleAll} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer
                ${selectedIds.length === filtered.length && filtered.length > 0 ? 'bg-indigo-600 border-indigo-500' : 'border-gray-700 hover:border-indigo-400'}`}>
                {selectedIds.length === filtered.length && filtered.length > 0 && <Check size={10} className="text-white"/>}
              </button>
              <span>Preview</span>
              <span>Name</span>
              <span>Scene</span>
              <span>Faces</span>
              <span>Quality</span>
              <span>Size</span>
              <span>Date</span>
              <span/>
            </div>

            {filtered.map(photo => (
              <ListRow key={photo.id} photo={photo} selected={selectedIds.includes(photo.id)} onSelect={toggleSelect}/>
            ))}
          </div>
        )}

      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2d2a3d; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4f46e5; }
        @keyframes animate-in { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        .animate-in { animation: animate-in 0.18s ease-out both; }
      `}</style>
    </div>
  );
}

// ─── SIDEBAR ITEM ────────────────────────────────────────────────────────────
function SideItem({ icon: Icon, label, active, collapsed }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-200 group
      ${active ? 'bg-indigo-600/15 text-indigo-400 font-bold border border-indigo-500/20' : 'text-gray-500 hover:bg-gray-800/60 hover:text-gray-300'}
      ${collapsed ? 'justify-center px-0' : ''}`}>
      <Icon size={20} className="flex-shrink-0"/>
      <div className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
        <span className="text-sm">{label}</span>
      </div>
    </div>
  );
}