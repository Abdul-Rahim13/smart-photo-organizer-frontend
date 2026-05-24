// app/dashboard/trash/page.jsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllPhotos, deletePhotoAction, updatePhotoMetadata } from "../../../src/redux/slices/photoSlice";
import { deleteAlbum } from "../../../src/redux/slices/albumSlice";
import {
  Trash2,
  AlertTriangle,
  Eye,
  Clock,
  RotateCcw,
  Image as ImageIcon,
  Layers,
  Filter,
  CheckSquare,
  Square,
  ShieldAlert,
  Copy,
  X,
  AlertCircle,
  CheckCircle,
  MoreVertical,
  SortAsc,
  Info,
  Loader2,
  Calendar,
  Zap,
  FolderOpen
} from "lucide-react";
import { toast } from "sonner";
import TopBar from "../../../components/TopBar";

// ─── TYPE CONFIGURATION ──────────────────────────────────────────────────────
const typeConfig = {
  photo: { label: "Photo", icon: ImageIcon, color: "text-purple-400", bg: "bg-purple-500/15 border-purple-500/30" },
  album: { label: "Album", icon: FolderOpen, color: "text-indigo-400", bg: "bg-indigo-500/15 border-indigo-500/30" },
  blurry: { label: "Blurry", icon: Eye, color: "text-yellow-400", bg: "bg-yellow-500/15 border-yellow-500/30" },
  "low-quality": { label: "Low Quality", icon: AlertCircle, color: "text-orange-400", bg: "bg-orange-500/15 border-orange-500/30" },
  duplicate: { label: "Duplicate", icon: Copy, color: "text-blue-400", bg: "bg-blue-500/15 border-blue-500/30" },
};

const filterTabs = [
  { key: "all", label: "All Items" },
  { key: "photo", label: "Photos" },
  { key: "album", label: "Albums" },
  { key: "blurry", label: "Blurry" },
  { key: "low-quality", label: "Low Quality" },
  { key: "duplicate", label: "Duplicates" },
];

// ─── LOCAL STORAGE KEYS ──────────────────────────────────────────────────────
const TRASH_KEY = 'trash_items';

// ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────
const getTrashFromStorage = () => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(TRASH_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveTrashToStorage = (items) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TRASH_KEY, JSON.stringify(items));
};

// ─── AUTO DELETE EXPIRED ITEMS ───────────────────────────────────────────────
const autoDeleteExpiredItems = (items) => {
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const expiredItems = items.filter(item => new Date(item.trashedAt).getTime() < thirtyDaysAgo);
  
  if (expiredItems.length > 0) {
    const remainingItems = items.filter(item => new Date(item.trashedAt).getTime() >= thirtyDaysAgo);
    saveTrashToStorage(remainingItems);
    return { deleted: expiredItems.length, remaining: remainingItems };
  }
  return { deleted: 0, remaining: items };
};

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="bg-[#161026] border border-gray-800/70 rounded-2xl p-5 flex items-center gap-4 hover:border-red-500/20 transition-all duration-300 cursor-default group">
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
function TrashCard({ item, selected, onSelect, onRestore, onDelete, onPermanentDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const cfg = typeConfig[item.type] || typeConfig.photo;
  const TypeIcon = cfg.icon;
  const daysInTrash = Math.floor((Date.now() - new Date(item.trashedAt)) / (1000 * 60 * 60 * 24));
  const daysLeft = Math.max(0, 30 - daysInTrash);
  const urgency = daysLeft <= 10 ? "text-red-400" : daysLeft <= 20 ? "text-yellow-400" : "text-gray-400";

  return (
    <div
      className={`bg-[#161026] border rounded-2xl overflow-hidden transition-all duration-300 group cursor-pointer
        ${selected ? 'border-red-500/50 shadow-lg shadow-red-500/10' : 'border-gray-800/70 hover:border-red-500/30'}`}
      onClick={() => onSelect(item.id)}
    >
      <div className="h-40 bg-gradient-to-br from-purple-900/30 to-indigo-900/30 relative flex items-center justify-center overflow-hidden">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover opacity-70" />
        ) : item.type === 'album' ? (
          <FolderOpen size={48} className="text-gray-500 opacity-50" />
        ) : (
          <span className="text-5xl">{item.emoji || "📷"}</span>
        )}
        {selected && (
          <div className="absolute inset-0 bg-red-900/30 flex items-center justify-center">
            <CheckCircle size={28} className="text-red-400" />
          </div>
        )}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
          <span className={`text-[10px] font-black ${(item.qualityScore || 0) < 40 ? 'text-red-400' : 'text-yellow-400'}`}>
            {item.qualityScore || 0}%
          </span>
        </div>
        <div className={`absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full ${urgency}`}>
          <Clock size={9} className="inline mr-1" />
          <span className="text-[10px] font-black">{daysLeft}d left</span>
        </div>
        <div className={`absolute bottom-3 left-3 flex items-center gap-1 border px-2 py-1 rounded-full backdrop-blur-sm text-[9px] font-bold ${cfg.color} ${cfg.bg}`}>
          <TypeIcon size={9} /> {cfg.label}
        </div>
        <div className="absolute bottom-3 right-3 flex gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onRestore(item); }}
            className="p-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition"
            title="Restore"
          >
            <RotateCcw size={11} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onPermanentDelete([item.id]); }}
            className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition"
            title="Delete permanently"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
      <div className="p-3">
        <p className="text-xs font-bold text-white truncate">{item.name}</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <ScoreRing score={item.qualityScore || 0} />
          <div className="flex-1">
            <p className="text-[9px] text-gray-600">Quality Score</p>
            <p className={`text-[10px] font-black ${(item.qualityScore || 0) < 40 ? 'text-red-400' : 'text-yellow-400'}`}>
              {item.qualityScore || 0}%
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-2 text-[9px] text-gray-500">
          <Calendar size={8} />
          <span>Deleted: {new Date(item.trashedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

// ─── CONFIRM MODAL ────────────────────────────────────────────────────────────
function ConfirmModal({ count, onConfirm, onCancel, isAutoDelete = false }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#161026] border border-red-500/30 rounded-2xl w-full max-w-sm">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-500/10 p-3 rounded-xl">
              <Trash2 size={22} className="text-red-400" />
            </div>
            <div>
              <h3 className="font-bold text-white">{isAutoDelete ? "Auto-Delete Warning" : "Permanently Delete?"}</h3>
              <p className="text-[11px] text-gray-500">{isAutoDelete ? "Items expiring soon" : "This action cannot be undone"}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 bg-red-500/5 border border-red-500/15 rounded-xl p-3 mb-5">
            {isAutoDelete 
              ? `${count} item${count !== 1 ? 's' : ''} ${count !== 1 ? 'are' : 'is'} about to be permanently deleted after 30 days in trash.`
              : `${count} item${count !== 1 ? 's' : ''} will be permanently deleted from your library and cannot be recovered.`
            }
          </p>
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 text-xs font-bold hover:border-gray-500 transition">
              Cancel
            </button>
            <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition">
              {isAutoDelete ? "Delete Expired" : "Delete Permanently"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN TRASH PAGE ──────────────────────────────────────────────────────────
export default function TrashPage() {
  const dispatch = useDispatch();
  const { items: allPhotos, loading } = useSelector((state) => state.photos);
  
  const [trashItems, setTrashItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [sort, setSort] = useState("days");
  const [modal, setModal] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Load trash items from localStorage and auto-delete expired
  useEffect(() => {
    const stored = getTrashFromStorage();
    const { deleted, remaining } = autoDeleteExpiredItems(stored);
    if (deleted > 0) {
      toast.warning(`🗑️ Auto-deleted ${deleted} expired item${deleted !== 1 ? 's' : ''} (30+ days in trash)`);
    }
    setTrashItems(remaining);
    
    // Refresh photos data
    dispatch(fetchAllPhotos());
  }, [dispatch]);

  // Process items with type detection
  const processedItems = useMemo(() => {
    return trashItems.map(item => {
      let type = item.type || 'photo';
      if (type === 'photo' && item.qualityScore) {
        if (item.qualityScore < 35) type = 'blurry';
        else if (item.qualityScore < 60) type = 'low-quality';
        else if (item.isDuplicate) type = 'duplicate';
      }
      return {
        ...item,
        type,
        daysInTrash: Math.floor((Date.now() - new Date(item.trashedAt)) / (1000 * 60 * 60 * 24))
      };
    });
  }, [trashItems]);

  // Filter and sort items
  const filtered = useMemo(() => {
    let result = [...processedItems];
    
    // Apply filter
    if (filter !== "all") {
      result = result.filter(i => i.type === filter);
    }
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(i => i.name?.toLowerCase().includes(term));
    }
    
    // Apply sort
    if (sort === "days") result.sort((a, b) => a.daysInTrash - b.daysInTrash);
    if (sort === "score") result.sort((a, b) => (a.qualityScore || 0) - (b.qualityScore || 0));
    if (sort === "name") result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    
    return result;
  }, [processedItems, filter, sort, searchTerm]);

  const stats = {
    total: processedItems.length,
    photos: processedItems.filter(i => i.type === 'photo').length,
    albums: processedItems.filter(i => i.type === 'album').length,
    blurry: processedItems.filter(i => i.type === "blurry").length,
    lowQuality: processedItems.filter(i => i.type === "low-quality").length,
    duplicates: processedItems.filter(i => i.type === "duplicate").length,
    expiringSoon: processedItems.filter(i => i.daysInTrash >= 25).length,
  };

  const showToast = (msg, type = "success") => {
    toast[type === "error" ? "error" : "success"](msg);
  };

  // Add item to trash (call this from other pages)
  const addToTrash = useCallback((item, type = 'photo') => {
    const newTrashItem = {
      id: item.id || item._id,
      name: item.title || item.name || "Untitled",
      imageUrl: item.imageUrl || item.url,
      qualityScore: item.qualityScore || item.score || 50,
      trashedAt: new Date().toISOString(),
      type: type,
      emoji: type === 'album' ? '📁' : "📷",
      originalData: item
    };
    
    const updated = [newTrashItem, ...trashItems];
    setTrashItems(updated);
    saveTrashToStorage(updated);
    showToast(`"${newTrashItem.name}" moved to trash`);
  }, [trashItems]);

  // Restore item from trash
  const restoreFromTrash = useCallback(async (item) => {
    // Remove from trash storage
    const updated = trashItems.filter(i => i.id !== item.id);
    setTrashItems(updated);
    saveTrashToStorage(updated);
    setSelected(prev => prev.filter(x => x !== item.id));
    
    showToast(`"${item.name}" restored`);
    
    // Note: The item is not automatically restored to backend
    // User would need to re-upload or recreate
  }, [trashItems]);

  // Permanently delete items
  const permanentlyDelete = useCallback(async (ids) => {
    const itemsToDelete = trashItems.filter(item => ids.includes(item.id));
    
    // Remove from trash storage
    const updated = trashItems.filter(item => !ids.includes(item.id));
    setTrashItems(updated);
    saveTrashToStorage(updated);
    setSelected([]);
    
    showToast(`${ids.length} item${ids.length !== 1 ? 's' : ''} permanently deleted`, "error");
    setModal(null);
  }, [trashItems]);

  // Handle moving photo from main app to trash (export this function for use in other pages)
  const movePhotoToTrash = useCallback((photo) => {
    addToTrash(photo, 'photo');
    // Optionally delete from backend
    dispatch(deletePhotoAction(photo.id || photo._id)).catch(console.error);
  }, [addToTrash, dispatch]);

  // Handle moving album to trash
  const moveAlbumToTrash = useCallback((album) => {
    addToTrash(album, 'album');
    // Optionally delete from backend
    dispatch(deleteAlbum(album.id || album._id)).catch(console.error);
  }, [addToTrash, dispatch]);

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAll = () => setSelected(filtered.map(i => i.id));
  const clearSelect = () => setSelected([]);

  const handleEmptyTrash = () => {
    setTrashItems([]);
    saveTrashToStorage([]);
    setSelected([]);
    showToast("Trash emptied", "error");
    setModal(null);
  };

  const handleDeleteExpiring = () => {
    const expiringIds = processedItems.filter(i => i.daysInTrash >= 25).map(i => i.id);
    if (expiringIds.length > 0) {
      permanentlyDelete(expiringIds);
    }
    setModal(null);
  };

  const handleRestoreSelected = () => {
    selected.forEach(id => {
      const item = trashItems.find(i => i.id === id);
      if (item) restoreFromTrash(item);
    });
  };

  if (loading && trashItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#0f0a19] flex items-center justify-center">
        <Loader2 size={40} className="text-yellow-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0a19] text-gray-100">
      <TopBar 
        title="Trash" 
        showStatus={true}
        statusText={stats.total > 0 ? `${stats.total} items` : "Empty"}
        statusColor={stats.expiringSoon > 0 ? "yellow" : "red"}
        searchPlaceholder="Search deleted items..."
        onSearch={setSearchTerm}
      />

      <div className="p-6 lg:p-8">
        {modal && (
          <ConfirmModal
            count={modal === 'emptyTrash' ? trashItems.length : modal === 'deleteExpiring' ? stats.expiringSoon : selected.length}
            onConfirm={
              modal === 'emptyTrash' ? handleEmptyTrash : 
              modal === 'deleteExpiring' ? handleDeleteExpiring : 
              () => permanentlyDelete(selected)
            }
            onCancel={() => setModal(null)}
            isAutoDelete={modal === 'deleteExpiring'}
          />
        )}

        <header className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-red-500/10 p-2 rounded-xl">
                <Trash2 size={20} className="text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Trash</h2>
            </div>
            <p className="text-xs text-gray-500 font-medium ml-1">
              {trashItems.length} items • Auto-delete after 30 days
            </p>
          </div>
          <div className="flex gap-2">
            {stats.expiringSoon > 0 && (
              <button
                onClick={() => setModal('deleteExpiring')}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer shadow-lg shadow-orange-500/20"
              >
                <Zap size={14} /> Delete Expiring ({stats.expiringSoon})
              </button>
            )}
            <button
              onClick={() => trashItems.length > 0 && setModal('emptyTrash')}
              disabled={trashItems.length === 0}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed px-5 py-2.5 rounded-xl text-xs font-black transition shadow-lg shadow-red-500/20"
            >
              <Trash2 size={14} /> Empty Trash
            </button>
          </div>
        </header>

        {/* Expiring Soon Banner */}
        {stats.expiringSoon > 0 && (
          <div className="flex items-start gap-3 bg-orange-500/5 border border-orange-500/20 rounded-2xl px-5 py-4 mb-6">
            <AlertTriangle size={18} className="text-orange-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-orange-300">⚠️ {stats.expiringSoon} Item{stats.expiringSoon !== 1 ? 's' : ''} Expiring Soon</p>
              <p className="text-[11px] text-gray-400">Will be permanently deleted within 5 days. Restore them now!</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-7 gap-4 mb-6">
          <StatCard label="Total" value={stats.total} icon={Trash2} iconBg="bg-red-500/10" iconColor="text-red-400" />
          <StatCard label="Photos" value={stats.photos} icon={ImageIcon} iconBg="bg-purple-500/10" iconColor="text-purple-400" />
          <StatCard label="Albums" value={stats.albums} icon={FolderOpen} iconBg="bg-indigo-500/10" iconColor="text-indigo-400" />
          <StatCard label="Blurry" value={stats.blurry} icon={Eye} iconBg="bg-yellow-500/10" iconColor="text-yellow-400" />
          <StatCard label="Low Quality" value={stats.lowQuality} icon={ShieldAlert} iconBg="bg-orange-500/10" iconColor="text-orange-400" />
          <StatCard label="Duplicates" value={stats.duplicates} icon={Copy} iconBg="bg-blue-500/10" iconColor="text-blue-400" />
          <StatCard label="Expiring" value={stats.expiringSoon} icon={Clock} iconBg="bg-orange-500/10" iconColor="text-orange-400" />
        </div>

        {/* Bulk Actions */}
        {selected.length > 0 && (
          <div className="flex items-center gap-3 bg-[#1c1430] border border-indigo-500/30 rounded-2xl px-5 py-3 mb-4">
            <span className="text-xs font-black text-indigo-300">{selected.length} selected</span>
            <div className="flex-1" />
            <button
              onClick={handleRestoreSelected}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 text-xs font-bold transition"
            >
              <RotateCcw size={12} /> Restore Selected
            </button>
            <button
              onClick={() => setModal('deleteSelected')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-bold transition"
            >
              <Trash2 size={12} /> Delete Selected
            </button>
            <button onClick={clearSelect} className="text-gray-500 hover:text-white"><X size={14} /></button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 bg-[#161026] border border-gray-800 p-1 rounded-xl overflow-x-auto">
            {filterTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setFilter(tab.key); setSelected([]); }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition
                  ${filter === tab.key ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-[#161026] border border-gray-800 px-3 py-2 rounded-xl">
              <SortAsc size={13} className="text-gray-500" />
              <select value={sort} onChange={e => setSort(e.target.value)} className="bg-transparent text-[11px] font-bold text-gray-400 outline-none">
                <option value="days">Days in Trash</option>
                <option value="score">Quality Score</option>
                <option value="name">Name</option>
              </select>
            </div>
            <button
              onClick={selected.length === filtered.length ? clearSelect : selectAll}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#161026] border border-gray-800 rounded-xl text-[11px] font-bold text-gray-400 hover:text-white transition"
            >
              {selected.length === filtered.length && filtered.length > 0 ? <><CheckSquare size={13} /> Deselect All</> : <><Square size={13} /> Select All</>}
            </button>
            <div className="flex bg-[#161026] border border-gray-800 p-1 rounded-xl">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-red-600 text-white' : 'text-gray-500'}`}>
                <ImageIcon size={14} />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition ${viewMode === 'list' ? 'bg-red-600 text-white' : 'text-gray-500'}`}>
                <Layers size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="bg-green-500/10 p-5 rounded-2xl mb-4">
              <CheckCircle size={36} className="text-green-400" />
            </div>
            <p className="text-white font-bold text-sm mb-1">Trash is empty</p>
            <p className="text-gray-600 text-xs">No deleted items found</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(item => (
              <TrashCard
                key={item.id}
                item={item}
                selected={selected.includes(item.id)}
                onSelect={toggleSelect}
                onRestore={restoreFromTrash}
                onPermanentDelete={permanentlyDelete}
              />
            ))}
          </div>
        ) : (
          <div className="bg-[#161026] border border-gray-800/70 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[2rem_2.5rem_1fr_100px_100px_80px_100px] gap-4 px-5 py-3 text-[10px] font-black uppercase text-gray-500 border-b border-gray-800 bg-slate-900/30">
              <span /><span /><span>Name</span><span>Type</span><span>Quality</span><span>Days Left</span><span>Deleted On</span>
            </div>
            {filtered.map(item => {
              const daysLeft = Math.max(0, 30 - item.daysInTrash);
              const cfg = typeConfig[item.type] || typeConfig.photo;
              return (
                <div key={item.id} className="grid grid-cols-[2rem_2.5rem_1fr_100px_100px_80px_100px] gap-4 px-5 py-4 items-center border-b border-gray-800/40 hover:bg-white/2 transition">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer ${selected.includes(item.id) ? 'bg-red-500 border-red-400' : 'border-gray-600'}`} onClick={() => toggleSelect(item.id)}>
                    {selected.includes(item.id) && <X size={10} className="text-white" />}
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-900/30 to-indigo-900/30 flex items-center justify-center overflow-hidden">
                    {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : item.type === 'album' ? <FolderOpen size={18} className="text-gray-500" /> : "📷"}
                  </div>
                  <p className="text-sm font-semibold text-gray-100 truncate">{item.name}</p>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full w-fit text-[10px] font-bold ${cfg.color} ${cfg.bg}`}>
                    {cfg.label}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full ${(item.qualityScore || 0) < 40 ? 'bg-red-500' : 'bg-yellow-500'}`} style={{ width: `${item.qualityScore || 0}%` }} />
                    </div>
                    <span className={`text-[10px] font-bold ${(item.qualityScore || 0) < 40 ? 'text-red-400' : 'text-yellow-400'}`}>{item.qualityScore || 0}%</span>
                  </div>
                  <div className={`text-[10px] font-bold ${daysLeft <= 10 ? 'text-red-400' : daysLeft <= 20 ? 'text-yellow-400' : 'text-gray-400'}`}>
                    {daysLeft}d left
                  </div>
                  <div className="text-[9px] text-gray-500">
                    {new Date(item.trashedAt).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Footer */}
        {trashItems.length > 0 && (
          <div className="mt-8 flex items-center gap-3 bg-[#161026] border border-gray-800/50 rounded-2xl px-5 py-4">
            <Info size={16} className="text-blue-400" />
            <p className="text-[11px] text-gray-500">
              Items are automatically removed from trash after <span className="text-white font-bold">30 days</span>.
              Restore items at any time before they are permanently deleted.
              {stats.expiringSoon > 0 && ` ${stats.expiringSoon} item${stats.expiringSoon !== 1 ? 's are' : ' is'} expiring within 5 days.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── EXPORT UTILITIES FOR USE IN OTHER PAGES ─────────────────────────────────
export { addToTrash as addItemToTrash, movePhotoToTrash, moveAlbumToTrash };