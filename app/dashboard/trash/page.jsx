"use client"

import React, { useState } from 'react';
import {
  Trash2, AlertTriangle, Eye, Clock, RotateCcw,
  Image as ImageIcon, Zap, Filter, CheckSquare,
  Square, ShieldAlert, Layers, Copy, Blend,
  X, AlertCircle, CheckCircle, MoreVertical,
  SortAsc, Info
} from 'lucide-react';

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const trashItems = [
  { id: 1,  name: "Blurry Sunset",     type: "blurry",     score: 35, days: 28, emoji: "🌅", color: "bg-orange-900/70",  accent: "bg-orange-800/40" },
  { id: 2,  name: "Dark Image",        type: "low-quality", score: 28, days: 25, emoji: "🌌", color: "bg-indigo-900/70",  accent: "bg-blue-800/40"   },
  { id: 3,  name: "Overexposed",       type: "low-quality", score: 42, days: 30, emoji: "🌆", color: "bg-slate-800/70",   accent: "bg-gray-700/40"   },
  { id: 4,  name: "Motion Blur",       type: "blurry",     score: 31, days: 22, emoji: "☕", color: "bg-stone-800/70",   accent: "bg-amber-900/40"  },
  { id: 5,  name: "Noisy Photo",       type: "low-quality", score: 38, days: 27, emoji: "🌲", color: "bg-green-900/70",   accent: "bg-emerald-800/40"},
  { id: 6,  name: "Duplicate Shot",    type: "duplicate",  score: 91, days: 15, emoji: "🏔️", color: "bg-cyan-900/70",    accent: "bg-teal-800/40"   },
  { id: 7,  name: "Out of Focus",      type: "blurry",     score: 22, days: 20, emoji: "🌸", color: "bg-pink-900/70",    accent: "bg-rose-800/40"   },
  { id: 8,  name: "Duplicate Copy",    type: "duplicate",  score: 89, days: 10, emoji: "🏖️", color: "bg-amber-900/70",   accent: "bg-yellow-800/40" },
  { id: 9,  name: "Grainy Night",      type: "low-quality", score: 19, days: 18, emoji: "🌃", color: "bg-violet-900/70",  accent: "bg-purple-800/40" },
  { id: 10, name: "Camera Shake",      type: "blurry",     score: 27, days: 29, emoji: "🌊", color: "bg-blue-900/70",    accent: "bg-cyan-800/40"   },
  { id: 11, name: "Washed Out",        type: "low-quality", score: 33, days: 12, emoji: "🌄", color: "bg-red-900/70",     accent: "bg-rose-800/40"   },
  { id: 12, name: "Duplicate Frame",   type: "duplicate",  score: 88, days: 8,  emoji: "🎡", color: "bg-teal-900/70",    accent: "bg-emerald-800/40"},
];

const typeConfig = {
  blurry:       { label: "Blurry",      icon: Blend,       color: "text-yellow-400", bg: "bg-yellow-500/15 border-yellow-500/30", dot: "bg-yellow-400",  statIcon: Eye         },
  "low-quality":{ label: "Low Quality", icon: AlertCircle, color: "text-orange-400", bg: "bg-orange-500/15 border-orange-500/30", dot: "bg-orange-400",  statIcon: ShieldAlert },
  duplicate:    { label: "Duplicate",   icon: Copy,        color: "text-blue-400",   bg: "bg-blue-500/15   border-blue-500/30",   dot: "bg-blue-400",    statIcon: Layers      },
};

const filterTabs = [
  { key: "all",         label: "All Items"   },
  { key: "blurry",      label: "Blurry"      },
  { key: "low-quality", label: "Low Quality" },
  { key: "duplicate",   label: "Duplicates"  },
];

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="bg-[#161026] border border-gray-800/70 rounded-2xl p-5 flex items-center gap-4 hover:border-red-500/20 transition-all duration-300 cursor-default group">
      <div className={`${iconBg} ${iconColor} p-3 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">{label}</p>
        <p className="text-2xl font-black text-white leading-none">{value}</p>
      </div>
    </div>
  );
}

// ─── SCORE RING ───────────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#eab308" : "#ef4444";
  const r = 10;
  const circ = 2 * Math.PI * r;
  return (
    <svg width="28" height="28" className="-rotate-90">
      <circle cx="14" cy="14" r={r} fill="none" stroke="#1e1a2e" strokeWidth="3" />
      <circle cx="14" cy="14" r={r} fill="none" stroke={color} strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ - (score / 100) * circ}
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
    </svg>
  );
}

// ─── TRASH CARD ──────────────────────────────────────────────────────────────
function TrashCard({ item, selected, onSelect, onRestore, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const cfg = typeConfig[item.type];
  const TypeIcon = cfg.icon;
  const urgency = item.days <= 10 ? "text-red-400" : item.days <= 20 ? "text-yellow-400" : "text-gray-400";

  return (
    <div
      className={`bg-[#161026] border rounded-2xl overflow-hidden transition-all duration-300 group cursor-pointer
        ${selected
          ? 'border-red-500/50 shadow-lg shadow-red-500/10'
          : 'border-gray-800/70 hover:border-red-500/30'}`}
      onClick={() => onSelect(item.id)}
      onMouseLeave={() => setMenuOpen(false)}
    >
      {/* Thumbnail */}
      <div className={`h-40 ${item.color} relative flex items-center justify-center overflow-hidden`}>
        <div className={`absolute inset-0 ${item.accent}`} style={{ clipPath: "ellipse(70% 60% at 50% 110%)" }} />
        <span className="text-5xl select-none z-10 drop-shadow-lg transition-transform duration-300 group-hover:scale-110 opacity-80">
          {item.emoji}
        </span>

        {/* Overlay dimming on select */}
        {selected && (
          <div className="absolute inset-0 bg-red-900/30 z-10 flex items-center justify-center">
            <CheckCircle size={28} className="text-red-400" />
          </div>
        )}

        {/* Top-left: quality score */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 border border-white/10 backdrop-blur-sm px-2 py-1 rounded-full z-20">
          <span className={`text-[10px] font-black ${item.score < 40 ? 'text-red-400' : 'text-yellow-400'}`}>
            {item.score}%
          </span>
        </div>

        {/* Top-right: days remaining */}
        <div className={`absolute top-3 right-3 flex items-center gap-1 bg-black/60 border border-white/10 backdrop-blur-sm px-2 py-1 rounded-full z-20 ${urgency}`}>
          <Clock size={9} />
          <span className="text-[10px] font-black">{item.days}d</span>
        </div>

        {/* Type badge bottom-left */}
        <div className={`absolute bottom-3 left-3 flex items-center gap-1 border px-2 py-1 rounded-full backdrop-blur-sm z-20 text-[9px] font-bold ${cfg.color} ${cfg.bg}`}>
          <TypeIcon size={9} />
          {cfg.label}
        </div>

        {/* Menu btn */}
        <div className="absolute bottom-3 right-3 z-20">
          <button
            onClick={e => { e.stopPropagation(); setMenuOpen(p => !p); }}
            className="w-6 h-6 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition cursor-pointer opacity-0 group-hover:opacity-100"
          >
            <MoreVertical size={11} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 bottom-7 w-36 bg-[#1c1430] border border-gray-700/60 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
              <button
                onClick={e => { e.stopPropagation(); onRestore(item.id); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-green-400 hover:bg-white/5 transition cursor-pointer"
              >
                <RotateCcw size={11} /> Restore
              </button>
              <button
                onClick={e => { e.stopPropagation(); onDelete(item.id); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:bg-white/5 transition cursor-pointer"
              >
                <Trash2 size={11} /> Delete Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs font-bold text-white truncate">{item.name}</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <ScoreRing score={item.score} />
          <div>
            <p className="text-[9px] text-gray-600">Quality Score</p>
            <p className={`text-[10px] font-black ${item.score < 40 ? 'text-red-400' : 'text-yellow-400'}`}>{item.score}%</p>
          </div>
          <div className="ml-auto flex gap-1.5">
            <button
              onClick={e => { e.stopPropagation(); onRestore(item.id); }}
              className="p-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition cursor-pointer"
              title="Restore"
            >
              <RotateCcw size={11} />
            </button>
            <button
              onClick={e => { e.stopPropagation(); onDelete(item.id); }}
              className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition cursor-pointer"
              title="Delete permanently"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TRASH ROW (List view) ────────────────────────────────────────────────────
function TrashRow({ item, selected, onSelect, onRestore, onDelete }) {
  const cfg = typeConfig[item.type];
  const TypeIcon = cfg.icon;
  const urgency = item.days <= 10 ? "text-red-400" : item.days <= 20 ? "text-yellow-400" : "text-gray-400";

  return (
    <div
      onClick={() => onSelect(item.id)}
      className={`grid grid-cols-[2rem_2.5rem_1fr_110px_100px_80px_130px_5rem] gap-4 px-5 py-4 items-center border-b border-gray-800/40 hover:bg-white/[0.02] transition group cursor-pointer
        ${selected ? 'bg-red-500/5' : ''}`}
    >
      {/* Checkbox */}
      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition
        ${selected ? 'bg-red-500 border-red-400' : 'border-gray-600 group-hover:border-gray-400'}`}>
        {selected && <X size={10} className="text-white" />}
      </div>

      {/* Thumb */}
      <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center text-xl flex-shrink-0`}>
        {item.emoji}
      </div>

      {/* Name */}
      <p className="text-sm font-semibold text-gray-100 truncate">{item.name}</p>

      {/* Type */}
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold w-fit ${cfg.color} ${cfg.bg}`}>
        <TypeIcon size={9} /> {cfg.label}
      </div>

      {/* Score */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${item.score < 40 ? 'bg-red-500' : 'bg-yellow-500'}`}
            style={{ width: `${item.score}%` }}
          />
        </div>
        <span className={`text-[10px] font-black w-8 text-right ${item.score < 40 ? 'text-red-400' : 'text-yellow-400'}`}>
          {item.score}%
        </span>
      </div>

      {/* Days */}
      <div className={`flex items-center gap-1 ${urgency}`}>
        <Clock size={10} />
        <span className="text-[10px] font-bold">{item.days}d left</span>
      </div>

      {/* Score bar label */}
      <p className="text-[10px] text-gray-600">Quality Score</p>

      {/* Actions */}
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={e => { e.stopPropagation(); onRestore(item.id); }}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 text-[10px] font-bold cursor-pointer transition"
        >
          <RotateCcw size={10} /> Restore
        </button>
        <button
          onClick={e => { e.stopPropagation(); onDelete(item.id); }}
          className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 cursor-pointer transition"
        >
          <Trash2 size={10} />
        </button>
      </div>
    </div>
  );
}

// ─── CONFIRM MODAL ────────────────────────────────────────────────────────────
function ConfirmModal({ count, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#161026] border border-red-500/30 rounded-2xl w-full max-w-sm shadow-2xl shadow-red-500/10">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-500/10 p-3 rounded-xl">
              <Trash2 size={22} className="text-red-400" />
            </div>
            <div>
              <h3 className="font-bold text-white">Permanently Delete?</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">This action cannot be undone</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 bg-red-500/5 border border-red-500/15 rounded-xl p-3 mb-5">
            {count} photo{count !== 1 ? 's' : ''} will be <span className="text-red-400 font-bold">permanently deleted</span> from your library and cannot be recovered.
          </p>
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 text-xs font-bold hover:border-gray-500 transition cursor-pointer">
              Cancel
            </button>
            <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition cursor-pointer">
              Delete Permanently
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function TrashPage() {
  const [items,     setItems]     = useState(trashItems);
  const [filter,    setFilter]    = useState("all");
  const [selected,  setSelected]  = useState([]);
  const [viewMode,  setViewMode]  = useState("grid");
  const [sort,      setSort]      = useState("days");
  const [modal,     setModal]     = useState(null); // null | 'emptyTrash' | 'deleteSelected'
  const [toast,     setToast]     = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const filtered = items
    .filter(i => filter === "all" ? true : i.type === filter)
    .sort((a, b) => sort === "days" ? a.days - b.days : sort === "score" ? a.score - b.score : a.name.localeCompare(b.name));

  const toggleSelect = id =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const selectAll = () =>
    setSelected(filtered.map(i => i.id));

  const clearSelect = () => setSelected([]);

  const restore = id => {
    setItems(prev => prev.filter(i => i.id !== id));
    setSelected(prev => prev.filter(x => x !== id));
    showToast("Photo restored successfully");
  };

  const deleteItem = id => {
    setItems(prev => prev.filter(i => i.id !== id));
    setSelected(prev => prev.filter(x => x !== id));
    showToast("Photo permanently deleted", "error");
  };

  const restoreSelected = () => {
    setItems(prev => prev.filter(i => !selected.includes(i.id)));
    showToast(`${selected.length} photo${selected.length > 1 ? 's' : ''} restored`);
    setSelected([]);
  };

  const confirmDelete = () => {
    if (modal === 'emptyTrash') {
      setItems([]);
      setSelected([]);
    } else {
      setItems(prev => prev.filter(i => !selected.includes(i.id)));
      setSelected([]);
    }
    setModal(null);
    showToast("Photos permanently deleted", "error");
  };

  const stats = {
    total:      items.length,
    blurry:     items.filter(i => i.type === "blurry").length,
    lowQuality: items.filter(i => i.type === "low-quality").length,
    duplicates: items.filter(i => i.type === "duplicate").length,
  };

  return (
    <div className="min-h-screen bg-[#0f0a19] text-gray-100 p-6 md:p-8 relative">

      {/* ── MODALS ─────────────────────────────────────────────────────── */}
      {modal && (
        <ConfirmModal
          count={modal === 'emptyTrash' ? items.length : selected.length}
          onConfirm={confirmDelete}
          onCancel={() => setModal(null)}
        />
      )}

      {/* ── TOAST ──────────────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-2xl text-xs font-bold transition-all
          ${toast.type === 'error'
            ? 'bg-red-900/80 border-red-500/40 text-red-200'
            : 'bg-green-900/80 border-green-500/40 text-green-200'}`}>
          {toast.type === 'error' ? <Trash2 size={13} /> : <CheckCircle size={13} />}
          {toast.msg}
        </div>
      )}

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-red-500/10 p-2 rounded-xl">
              <Trash2 size={20} className="text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Trash &amp; Low Quality Photos</h2>
          </div>
          <p className="text-xs text-gray-500 font-medium ml-1">
            {items.length} photos • Photos will be permanently deleted after 30 days
          </p>
        </div>

        <button
          onClick={() => items.length > 0 && setModal('emptyTrash')}
          disabled={items.length === 0}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer shadow-lg shadow-red-500/20"
        >
          <Trash2 size={14} /> Empty Trash
        </button>
      </header>

      {/* ── WARNING BANNER ──────────────────────────────────────────────── */}
      {items.length > 0 && (
        <div className="flex items-start gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl px-5 py-4 mb-6">
          <AlertTriangle size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-yellow-300 mb-0.5">Photos in Trash</p>
            <p className="text-[11px] text-gray-400">
              These photos have been flagged for deletion due to low quality or duplicate detection.
              You can restore them or they will be permanently deleted after 30 days.
            </p>
          </div>
        </div>
      )}

      {/* ── STAT CARDS ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Items"   value={stats.total}      icon={Trash2}      iconBg="bg-red-500/10"    iconColor="text-red-400"    />
        <StatCard label="Blurry Photos" value={stats.blurry}     icon={Eye}         iconBg="bg-yellow-500/10" iconColor="text-yellow-400" />
        <StatCard label="Low Quality"   value={stats.lowQuality} icon={ShieldAlert} iconBg="bg-orange-500/10" iconColor="text-orange-400" />
        <StatCard label="Duplicates"    value={stats.duplicates} icon={Copy}        iconBg="bg-blue-500/10"   iconColor="text-blue-400"   />
      </div>

      {/* ── BULK ACTIONS BAR (when items selected) ──────────────────────── */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 bg-[#1c1430] border border-indigo-500/30 rounded-2xl px-5 py-3 mb-4">
          <span className="text-xs font-black text-indigo-300">{selected.length} selected</span>
          <div className="flex-1" />
          <button
            onClick={restoreSelected}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 text-xs font-bold cursor-pointer transition"
          >
            <RotateCcw size={12} /> Restore Selected
          </button>
          <button
            onClick={() => setModal('deleteSelected')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-bold cursor-pointer transition"
          >
            <Trash2 size={12} /> Delete Selected
          </button>
          <button onClick={clearSelect} className="text-gray-500 hover:text-white transition cursor-pointer p-1">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── FILTER TABS + CONTROLS ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        {/* Tabs */}
        <div className="flex items-center gap-2 bg-[#161026] border border-gray-800 p-1 rounded-xl">
          {filterTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setFilter(tab.key); setSelected([]); }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer
                ${filter === tab.key ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Sort */}
          <div className="flex items-center gap-2 bg-[#161026] border border-gray-800 px-3 py-2 rounded-xl">
            <SortAsc size={13} className="text-gray-500" />
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="bg-transparent text-[11px] font-bold text-gray-400 outline-none cursor-pointer"
            >
              <option value="days">Days Left</option>
              <option value="score">Quality Score</option>
              <option value="name">Name</option>
            </select>
          </div>

          {/* Select all */}
          <button
            onClick={selected.length === filtered.length ? clearSelect : selectAll}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#161026] border border-gray-800 rounded-xl text-[11px] font-bold text-gray-400 hover:text-white hover:border-gray-600 transition cursor-pointer"
          >
            {selected.length === filtered.length && filtered.length > 0
              ? <><CheckSquare size={13} className="text-red-400" /> Deselect All</>
              : <><Square size={13} /> Select All</>}
          </button>

          {/* View toggle */}
          <div className="flex bg-[#161026] border border-gray-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === 'grid' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <ImageIcon size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === 'list' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Layers size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── GRID VIEW ───────────────────────────────────────────────────── */}
      {viewMode === 'grid' && (
        <>
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map(item => (
                <TrashCard
                  key={item.id}
                  item={item}
                  selected={selected.includes(item.id)}
                  onSelect={toggleSelect}
                  onRestore={restore}
                  onDelete={deleteItem}
                />
              ))}
            </div>
          ) : <EmptyTrash />}
        </>
      )}

      {/* ── LIST VIEW ───────────────────────────────────────────────────── */}
      {viewMode === 'list' && (
        <div className="bg-[#161026] border border-gray-800/70 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[2rem_2.5rem_1fr_110px_100px_80px_130px_5rem] gap-4 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-gray-800">
            <span />
            <span />
            <span>Name</span>
            <span>Type</span>
            <span>Quality</span>
            <span>Expires</span>
            <span />
            <span>Actions</span>
          </div>
          {filtered.length > 0
            ? filtered.map(item => (
                <TrashRow
                  key={item.id}
                  item={item}
                  selected={selected.includes(item.id)}
                  onSelect={toggleSelect}
                  onRestore={restore}
                  onDelete={deleteItem}
                />
              ))
            : <div className="py-16 text-center">
                <p className="text-gray-500 text-sm font-semibold">No items in this category</p>
              </div>}
        </div>
      )}

      {/* ── INFO FOOTER ─────────────────────────────────────────────────── */}
      {items.length > 0 && (
        <div className="mt-8 flex items-center gap-3 bg-[#161026] border border-gray-800/50 rounded-2xl px-5 py-4">
          <div className="bg-blue-500/10 p-2 rounded-xl flex-shrink-0">
            <Info size={16} className="text-blue-400" />
          </div>
          <p className="text-[11px] text-gray-500">
            Photos are automatically removed from trash after <span className="text-white font-bold">30 days</span>.
            Restore photos at any time before they are permanently deleted.
          </p>
        </div>
      )}

    </div>
  );
}

function EmptyTrash() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="bg-green-500/10 p-5 rounded-2xl mb-4">
        <CheckCircle size={36} className="text-green-400" />
      </div>
      <p className="text-white font-bold text-sm mb-1">Trash is empty</p>
      <p className="text-gray-600 text-xs">No low quality or deleted photos found</p>
    </div>
  );
}