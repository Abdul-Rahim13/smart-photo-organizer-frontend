"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import JSZip from "jszip";
import {
  fetchAlbums,
  createAlbum,
  toggleFavoriteAlbum,
  deleteAlbum,
  updateAlbum,
} from "../../../src/redux/slices/albumSlice";
import { fetchAllPhotos } from "../../../src/redux/slices/photoSlice";
import TopBar from "../../../components/TopBar";
import {
  FolderOpen, Plus, Search, Image as ImageIcon, Filter, Lock, Globe,
  MoreVertical, Trash2, Edit2, Share2, Grid3X3, X, Loader2,
  AlertTriangle, Check, Camera, Star, ArrowLeft, Download, Eye,
  Users, Heart, User, Home, TreePine, Sun, Moon, ChevronDown, ChevronRight
} from "lucide-react";

// ─── TRASH HELPER FUNCTIONS ──────────────────────────────────────────────────────
const addToTrash = (item, type = 'album') => {
  if (typeof window === 'undefined') return;
  
  const trashItem = {
    id: item.id,
    name: item.name,
    imageUrl: item.photosList?.[0]?.imageUrl || null,
    qualityScore: 50,
    trashedAt: new Date().toISOString(),
    type: type,
    emoji: '📁',
    originalData: item
  };
  
  const existingTrash = JSON.parse(localStorage.getItem('trash_items') || '[]');
  localStorage.setItem('trash_items', JSON.stringify([trashItem, ...existingTrash]));
};

// ─── CONFIRM MODAL ──────────────────────────────────────────────────────────────
function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, icon: Icon, iconColor }) {
  if (!isOpen) return null;
  
  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#161026] border border-gray-700/60 rounded-2xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-xl ${iconColor} bg-opacity-10`}>
              {Icon && <Icon size={24} className={iconColor} />}
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">{title}</h3>
              <p className="text-sm text-gray-400 mt-1">{message}</p>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 text-sm font-medium hover:border-gray-500 hover:text-white transition cursor-pointer">
              {cancelText || "Cancel"}
            </button>
            <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition cursor-pointer">
              {confirmText || "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="bg-[#161026] border border-gray-800/70 rounded-2xl p-5 flex items-center gap-4 cursor-default hover:border-indigo-500/30 transition-all duration-300">
      <div className={`${iconBg} ${iconColor} p-3 rounded-xl shrink-0`}><Icon size={20} /></div>
      <div>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">{label}</p>
        <p className="text-2xl font-black text-white leading-none">{value}</p>
      </div>
    </div>
  );
}

// ─── PORTAL ACTION MENU ───────────────────────────────────────────────────────
const MENU_HEIGHT = 230;
const MENU_WIDTH  = 176;

function ActionMenu({ album, anchorRect, onClose, onEdit, onDelete, onFavorite, onDownload, onView, isTogglingFavorite }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handle = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handle, true);
    return () => document.removeEventListener("mousedown", handle, true);
  }, [onClose]);

  useEffect(() => {
    const close = () => onClose();
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => { window.removeEventListener("scroll", close, true); window.removeEventListener("resize", close); };
  }, [onClose]);

  const handleShare = async () => {
    try { await navigator.clipboard.writeText(`${window.location.origin}/albums/${album.id}`); toast.success("📋 Link copied!"); }
    catch { toast.error("Failed to copy link"); }
    onClose();
  };

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const spaceBelow = vh - anchorRect.bottom;
  const openAbove  = spaceBelow < MENU_HEIGHT + 8;

  let left = anchorRect.right - MENU_WIDTH;
  if (left < 8) left = 8;
  if (left + MENU_WIDTH > vw - 8) left = vw - MENU_WIDTH - 8;

  const top = openAbove ? anchorRect.top - MENU_HEIGHT - 6 : anchorRect.bottom + 6;

  const actions = [
    { icon: Eye,    label: "View Full",    color: "text-slate-300 hover:text-white",     onClick: () => { onView(album);       onClose(); } },
    { icon: Star,   label: album.isFavorite ? "Remove Star" : "Add Star",
                                           color: album.isFavorite ? "text-amber-400" : "text-slate-300 hover:text-amber-400",
                                                                                          onClick: () => { onFavorite(album.id); onClose(); }, loading: isTogglingFavorite },
    { icon: Download, label: "Download",   color: "text-slate-300 hover:text-white",     onClick: () => { onDownload(album);   onClose(); } },
    { icon: Share2, label: "Share",        color: "text-slate-300 hover:text-white",     onClick: handleShare },
    { icon: Edit2,  label: "Edit",         color: "text-slate-300 hover:text-blue-400",  onClick: () => { onEdit(album);       onClose(); } },
    { icon: Trash2, label: "Delete",       color: "text-red-400 hover:text-red-300",     onClick: () => { onDelete(album.id);  onClose(); } },
  ];

  if (typeof document === "undefined") return null;
  return ReactDOM.createPortal(
    <div ref={menuRef} style={{ position: "fixed", top, left, zIndex: 99999, width: MENU_WIDTH }}
      className="bg-[#1a1430] border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden">
      {actions.map((a) => (
        <button key={a.label} onClick={a.onClick} disabled={a.loading}
          className={`flex items-center gap-3 w-full px-4 py-2.5 text-xs font-medium ${a.color} hover:bg-white/5 transition-colors disabled:opacity-50 cursor-pointer`}>
          {a.loading ? <Loader2 size={14} className="animate-spin" /> : <a.icon size={14} />}
          {a.label}
        </button>
      ))}
    </div>,
    document.body
  );
}

// ─── useMenuState hook ────────────────────────────────────────────────────────
function useMenuState() {
  const [anchorRect, setAnchorRect] = useState(null);
  const btnRef = useRef(null);
  const open  = useCallback((e) => {
    e?.stopPropagation();
    setAnchorRect((prev) => prev ? null : btnRef.current.getBoundingClientRect());
  }, []);
  const close = useCallback(() => setAnchorRect(null), []);
  return { btnRef, anchorRect, open, close };
}

// ─── ALBUM CARD (Grid View) ──────────────────────────────────────────────────
function AlbumCard({ album, onFavorite, onDelete, onEdit, onClick, onDownload, onView, isTogglingFavorite }) {
  const { btnRef, anchorRect, open, close } = useMenuState();
  const coverPhoto = album.photosList?.[0];

  return (
    <div className="bg-[#1a1430] rounded-2xl border border-slate-800/60 hover:border-slate-700 transition-all duration-300 flex flex-col cursor-pointer" onClick={onClick}>
      <div className="h-40 relative bg-linear-to-br from-purple-900/30 to-indigo-900/30 flex items-center justify-center overflow-hidden rounded-t-2xl">
        {coverPhoto?.imageUrl ? <img src={coverPhoto.imageUrl} alt={album.name} className="w-full h-full object-cover" /> : <FolderOpen size={48} className="text-gray-600" />}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-2 right-2 z-10 flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); onFavorite(album.id); }} disabled={isTogglingFavorite}
            title={album.isFavorite ? "Remove Star" : "Add Star"}
            className={`p-1.5 rounded-md bg-black/60 backdrop-blur-md transition-all disabled:opacity-50 cursor-pointer ${album.isFavorite ? "text-amber-400" : "text-slate-300 hover:text-amber-400"}`}>
            {isTogglingFavorite ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} fill={album.isFavorite ? "currentColor" : "none"} />}
          </button>
          <button ref={btnRef} onClick={open} title="More Options"
            className="p-1.5 rounded-md bg-black/60 backdrop-blur-md text-slate-300 hover:text-white transition cursor-pointer">
            <MoreVertical size={14} />
          </button>
        </div>
        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1">
          <ImageIcon size={10} className="text-slate-300" />
          <span className="text-[10px] text-white font-medium">{album.photosList?.length || 0} photos</span>
        </div>
      </div>
      <div className="p-3">
        <h4 className="text-sm font-semibold text-white truncate">{album.name}</h4>
        <p className="text-[10px] text-gray-500 mt-1">{album.description || "No description"}</p>
        <div className="flex items-center justify-between mt-2 text-[9px] text-gray-600">
          <span>{album.lastModified}</span>
          {album.type === "private" ? <Lock size={10} /> : <Globe size={10} />}
        </div>
      </div>
      {anchorRect && <ActionMenu album={album} anchorRect={anchorRect} onClose={close} onEdit={onEdit} onDelete={onDelete} onFavorite={onFavorite} onDownload={onDownload} onView={onView} isTogglingFavorite={isTogglingFavorite} />}
    </div>
  );
}

// ─── ALBUM ROW (List View) ───────────────────────────────────────────────────
function AlbumRow({ album, selected, onSelect, onDelete, onEdit, onDownload, onView, onToggleStar, isTogglingFavorite }) {
  const { btnRef, anchorRect, open, close } = useMenuState();

  return (
    <div className={`grid grid-cols-[2rem_3rem_1fr_100px_100px_2.5rem] gap-3 px-4 py-2.5 items-center border-b border-slate-800/40 hover:bg-white/5 transition-all ${selected ? "bg-indigo-600/10" : ""}`}>
      <button onClick={() => onSelect(album.id)}
        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${selected ? "bg-indigo-600 border-indigo-500" : "border-slate-600 hover:border-slate-400"}`}>
        {selected && <Check size={10} className="text-white" />}
      </button>
      <div className="h-10 w-12 rounded-lg bg-slate-800/50 overflow-hidden relative">
        {album.photosList?.[0]?.imageUrl ? <img src={album.photosList[0].imageUrl} alt={album.name} className="absolute inset-0 w-full h-full object-cover" /> : <FolderOpen size={18} className="absolute inset-0 m-auto text-gray-500" />}
      </div>
      <div className="flex items-center gap-2 min-w-0">
        <button onClick={() => onToggleStar(album.id)} disabled={isTogglingFavorite}
          className={`shrink-0 transition disabled:opacity-50 cursor-pointer ${album.isFavorite ? "text-amber-400" : "text-slate-500 hover:text-amber-400"}`}>
          {isTogglingFavorite ? <Loader2 size={13} className="animate-spin" /> : <Star size={13} fill={album.isFavorite ? "currentColor" : "none"} />}
        </button>
        <span className="text-sm font-medium text-slate-200 truncate">{album.name}</span>
      </div>
      <span className="text-sm text-gray-400">{album.photosCount} photos</span>
      <span className="text-[11px] text-gray-500">{album.lastModified}</span>
      <div className="flex justify-end">
        <button ref={btnRef} onClick={open} title="More Options" className="text-slate-500 hover:text-slate-300 transition cursor-pointer">
          <MoreVertical size={16} />
        </button>
        {anchorRect && <ActionMenu album={album} anchorRect={anchorRect} onClose={close} onEdit={onEdit} onDelete={onDelete} onFavorite={onToggleStar} onDownload={onDownload} onView={onView} isTogglingFavorite={isTogglingFavorite} />}
      </div>
    </div>
  );
}

// ─── PHOTO SELECTION SECTION WITH BLOCK-WISE COLUMN LAYOUT ─────────────────────────────────
function PhotoSelectionSection({ photos, selectedPhotos, onTogglePhoto, searchTerm, onSearchChange }) {
  const [expandedSections, setExpandedSections] = useState({
    environment: true,
    socialGroup: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const photosByEnvironment = useMemo(() => {
    const groups = { Indoor: [], Outdoor: [], Unknown: [] };
    photos.forEach(photo => {
      const env = photo.environment || (photo.sceneCategory === 'Outdoor' ? 'Outdoor' : 'Unknown');
      if (env === 'Indoor') groups.Indoor.push(photo);
      else if (env === 'Outdoor') groups.Outdoor.push(photo);
      else groups.Unknown.push(photo);
    });
    return groups;
  }, [photos]);

  const photosBySocialGroup = useMemo(() => {
    const groups = { Solo: [], Couple: [], Group: [], Empty: [] };
    photos.forEach(photo => {
      const social = photo.socialGroup || 'Solo';
      if (groups[social]) groups[social].push(photo);
      else groups.Empty.push(photo);
    });
    return groups;
  }, [photos]);

  const environmentIcons = { Indoor: <Home size={14} />, Outdoor: <TreePine size={14} />, Unknown: <ImageIcon size={14} /> };
  const socialIcons = { Solo: <User size={14} />, Couple: <Heart size={14} />, Group: <Users size={14} />, Empty: <ImageIcon size={14} /> };

  const socialColors = {
    Solo: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    Couple: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    Group: "text-green-400 bg-green-500/10 border-green-500/20",
    Empty: "text-gray-400 bg-gray-500/10 border-gray-500/20"
  };

  const environmentColors = {
    Indoor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    Outdoor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    Unknown: "text-gray-400 bg-gray-500/10 border-gray-500/20"
  };

  const filterPhotos = (photoList) => {
    if (!searchTerm) return photoList;
    return photoList.filter(p => 
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const renderPhotoGrid = (photosList, categoryName) => {
    if (photosList.length === 0) return null;
    
    return (
      <div className="mb-6">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg w-fit mb-3 ${socialColors[categoryName] || environmentColors[categoryName] || "text-gray-400 bg-gray-500/10"}`}>
          {socialIcons[categoryName] || environmentIcons[categoryName] || <ImageIcon size={14} />}
          <span className="text-xs font-bold uppercase">{categoryName}</span>
          <span className="text-[10px]">({photosList.length})</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {photosList.map((photo) => {
            const photoId = photo._id || photo.id;
            const isSelected = selectedPhotos.includes(photoId);
            const imageUrl = photo.imageUrl || photo.url;
            return (
              <div key={photoId} onClick={() => onTogglePhoto(photoId)}
                className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${isSelected ? "border-indigo-500 ring-2 ring-indigo-500/30" : "border-transparent hover:border-gray-600"}`}>
                {imageUrl ? <img src={imageUrl} alt={photo.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-black/40 flex items-center justify-center"><Camera size={24} className="text-gray-500" /></div>}
                {isSelected && <div className="absolute top-1 right-1 bg-indigo-600 rounded-full p-0.5"><Check size={12} className="text-white" /></div>}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1"><p className="text-[8px] text-white truncate">{photo.title || "Untitled"}</p></div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} placeholder="Search photos by name or category..."
          className="w-full bg-[#0f0a19] border border-gray-700/60 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/50 transition" />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <button onClick={() => toggleSection('environment')}
            className="w-full flex items-center justify-between p-3 bg-linear-to-r from-amber-500/10 to-orange-500/10 rounded-xl border border-gray-800 hover:bg-white/5 transition mb-3">
            <div className="flex items-center gap-2">
              {expandedSections.environment ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <Sun size={16} className="text-yellow-400" />
              <span className="text-sm font-bold text-white">By Environment</span>
              <span className="text-[10px] text-gray-500">({photos.length} photos)</span>
            </div>
          </button>
          {expandedSections.environment && (
            <div className="space-y-4 max-h-125 overflow-y-auto pr-2">
              {renderPhotoGrid(filterPhotos(photosByEnvironment.Indoor), "Indoor")}
              {renderPhotoGrid(filterPhotos(photosByEnvironment.Outdoor), "Outdoor")}
              {renderPhotoGrid(filterPhotos(photosByEnvironment.Unknown), "Unknown")}
            </div>
          )}
        </div>

        <div className="flex-1">
          <button onClick={() => toggleSection('socialGroup')}
            className="w-full flex items-center justify-between p-3 bg-linear-to-r from-pink-500/10 to-rose-500/10 rounded-xl border border-gray-800 hover:bg-white/5 transition mb-3">
            <div className="flex items-center gap-2">
              {expandedSections.socialGroup ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <Users size={16} className="text-pink-400" />
              <span className="text-sm font-bold text-white">By Social Group</span>
              <span className="text-[10px] text-gray-500">({photos.length} photos)</span>
            </div>
          </button>
          {expandedSections.socialGroup && (
            <div className="space-y-4 max-h-125 overflow-y-auto pr-2">
              {renderPhotoGrid(filterPhotos(photosBySocialGroup.Solo), "Solo")}
              {renderPhotoGrid(filterPhotos(photosBySocialGroup.Couple), "Couple")}
              {renderPhotoGrid(filterPhotos(photosBySocialGroup.Group), "Group")}
              {renderPhotoGrid(filterPhotos(photosBySocialGroup.Empty), "Empty")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ALBUM MODAL WITH BLOCK-WISE COLUMN LAYOUT ─────────────────────────────
function AlbumModal({ isOpen, onClose, onSubmit, loading, availablePhotos, editAlbum }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [type, setType] = useState("private");
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (editAlbum && isOpen) {
      setName(editAlbum.name || ""); setDesc(editAlbum.description || "");
      setType(editAlbum.type || "private");
      setSelectedPhotos(editAlbum.photosList?.map((p) => p._id || p.id) || []);
    } else if (!isOpen) { setName(""); setDesc(""); setType("private"); setSelectedPhotos([]); setSearchTerm(""); }
  }, [editAlbum, isOpen]);

  const togglePhoto = (id) => setSelectedPhotos((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleSubmit = () => {
    if (!name.trim()) { toast.error("Please enter an album name"); return; }
    onSubmit(editAlbum
      ? { id: editAlbum.id, title: name.trim(), description: desc.trim(), type, photos: selectedPhotos }
      : { title: name.trim(), description: desc.trim(), type, photos: selectedPhotos }
    );
    onClose();
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#161026] border border-gray-700/60 rounded-2xl w-full max-w-6xl shadow-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 shrink-0">
          <div><h3 className="font-bold text-white text-lg">{editAlbum ? "Edit Album" : "Create Album"}</h3><p className="text-[10px] text-gray-500">Organize your photos by environment and social groups</p></div>
          <button onClick={onClose} className="text-gray-500 hover:text-white cursor-pointer transition"><X size={18} /></button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 p-6 overflow-y-auto flex-1">
          <div className="w-full md:w-80 shrink-0 space-y-5">
            <div><label className="text-[11px] font-bold text-gray-400 mb-1 block">Album Name *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Beach Vacation" className="w-full bg-[#0f0a19] border border-gray-700/60 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 transition" /></div>
            <div><label className="text-[11px] font-bold text-gray-400 mb-1 block">Description</label>
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} placeholder="Add a description..." className="w-full bg-[#0f0a19] border border-gray-700/60 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 resize-none transition" /></div>
            <div><label className="text-[11px] font-bold text-gray-400 mb-1 block">Privacy</label>
              <div className="flex gap-2">{["private", "shared"].map((t) => (<button key={t} onClick={() => setType(t)} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border text-sm font-medium transition cursor-pointer capitalize ${type === t ? "bg-indigo-600 border-indigo-500 text-white" : "bg-[#0f0a19] border-gray-700 text-gray-400 hover:border-gray-500"}`}>{t === "private" ? <Lock size={14} /> : <Globe size={14} />} {t}</button>))}</div></div>
            {selectedPhotos.length > 0 && (<div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4"><p className="text-[10px] font-semibold text-indigo-400 mb-1">Selected Photos</p><p className="text-3xl font-bold text-white">{selectedPhotos.length}</p><p className="text-[9px] text-gray-400">photos will be added to this album</p></div>)}
          </div>
          
          <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-800/60 pt-4 md:pt-0 md:pl-6">
            <PhotoSelectionSection photos={availablePhotos} selectedPhotos={selectedPhotos} onTogglePhoto={togglePhoto} searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          </div>
        </div>
        
        <div className="flex gap-3 px-6 pb-6 pt-4 border-t border-gray-800/40 shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 text-sm font-medium hover:border-gray-500 hover:text-white transition cursor-pointer">Cancel</button>
          <button onClick={handleSubmit} disabled={!name.trim() || loading} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium transition flex items-center justify-center gap-2 cursor-pointer">{loading && <Loader2 size={16} className="animate-spin" />}{editAlbum ? "Update Album" : "Create Album"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <FolderOpen size={48} className="text-gray-700 mb-3" />
      <p className="text-gray-400 font-semibold text-sm">No albums found</p>
      <p className="text-gray-600 text-xs mt-1">Click "Create Album" to get started</p>
    </div>
  );
}

// ─── DOWNLOAD AS ZIP ─────────────────────────────────────────────────────────
async function downloadAlbumAsZip(album) {
  if (!album.photosList?.length) { toast.error("No photos to download"); return; }
  const tid = toast.loading(`Preparing ${album.photosList.length} photos...`);
  const zip = new JSZip();
  let ok = 0, fail = 0;
  try {
    for (let i = 0; i < album.photosList.length; i++) {
      const photo = album.photosList[i];
      const url = photo.imageUrl || photo.url;
      if (url) {
        try {
          const blob = await (await fetch(url)).blob();
          const ext = blob.type.split("/")[1] || "jpg";
          zip.file(`${String(i + 1).padStart(3, "0")}_${photo.title?.replace(/[^a-z0-9]/gi, "_") || "photo"}.${ext}`, blob);
          ok++;
          if (i % 5 === 0) toast.loading(`Downloading... ${ok}/${album.photosList.length}`, { id: tid });
        } catch { fail++; }
      }
    }
    if (ok > 0) {
      const content = await zip.generateAsync({ type: "blob" });
      const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(content), download: `${album.name.replace(/[^a-z0-9]/gi, "_")}.zip` });
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      toast.success(fail > 0 ? `Downloaded ${ok}/${album.photosList.length} photos` : `✅ "${album.name}.zip" downloaded`, { id: tid });
    } else { toast.error("Failed to download any photos", { id: tid }); }
  } catch { toast.error("Failed to create ZIP", { id: tid }); }
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function AlbumsPage() {
  const dispatch = useDispatch();
  const { items, loading, submitting, error } = useSelector((s) => s.albums);
  const { items: photos } = useSelector((s) => s.photos);

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [showModal, setShowModal] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [togglingFavoriteId, setTogglingFavoriteId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Modal states
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, albumId: null, albumName: "" });
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState({ isOpen: false, count: 0 });

  useEffect(() => { dispatch(fetchAlbums()); dispatch(fetchAllPhotos()); }, [dispatch]);

  const albums = useMemo(() => {
    if (!items) return [];
    return (Array.isArray(items) ? items : items.data || []).map((a) => ({
      id: a._id || a.id, name: a.title || "Untitled", description: a.description || "",
      type: a.type || "private", isFavorite: a.isFavorite || false,
      photosCount: a.photos?.length || 0, photosList: a.photos || [],
      lastModified: a.updatedAt ? new Date(a.updatedAt).toLocaleDateString() : "Just now",
    }));
  }, [items]);

  const availablePhotos = useMemo(() => {
    if (!photos) return [];
    return Array.isArray(photos) ? photos : photos.data || [];
  }, [photos]);

  const filteredAlbums = useMemo(() => {
    if (!search) return albums;
    const q = search.toLowerCase();
    return albums.filter((a) => a.name.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q));
  }, [albums, search]);

  const handleToggleStar = useCallback(async (id) => {
    if (togglingFavoriteId === id) return;
    setTogglingFavoriteId(id);
    try {
      const result = await dispatch(toggleFavoriteAlbum(id)).unwrap();
      toast.success(result?.isFavorite ? "⭐ Added to favorites" : "Removed from favorites");
      await dispatch(fetchAlbums());
    } catch (err) {
      toast.error(err || "Failed to update favorite — please try again.");
    } finally { setTogglingFavoriteId(null); }
  }, [dispatch, togglingFavoriteId]);

  // Single delete with modal
  const handleDeleteClick = (id, name) => {
    setDeleteConfirm({ isOpen: true, albumId: id, albumName: name });
  };

  const handleConfirmDelete = async () => {
    const { albumId, albumName } = deleteConfirm;
    setDeleteConfirm({ isOpen: false, albumId: null, albumName: "" });
    
    const albumToDelete = albums.find(album => album.id === albumId);
    if (albumToDelete) {
      addToTrash(albumToDelete, 'album');
      toast.info(`📁 "${albumName}" moved to trash`);
    }
    
    try {
      await dispatch(deleteAlbum(albumId)).unwrap();
      if (selectedAlbum?.id === albumId) setSelectedAlbum(null);
      dispatch(fetchAlbums());
    } catch {
      toast.error("Failed to delete album");
    }
  };

  // Bulk delete with modal
  const handleBulkDeleteClick = () => {
    setBulkDeleteConfirm({ isOpen: true, count: selectedIds.length });
  };

  const handleConfirmBulkDelete = async () => {
    const count = bulkDeleteConfirm.count;
    setBulkDeleteConfirm({ isOpen: false, count: 0 });
    
    const albumsToDelete = albums.filter(album => selectedIds.includes(album.id));
    albumsToDelete.forEach(album => addToTrash(album, 'album'));
    toast.info(`📁 ${count} album(s) moved to trash`);
    
    for (const id of selectedIds) {
      await dispatch(deleteAlbum(id)).unwrap();
    }
    if (selectedAlbum && selectedIds.includes(selectedAlbum.id)) setSelectedAlbum(null);
    dispatch(fetchAlbums());
    setSelectedIds([]);
  };

  const handleCreate = async (payload) => {
    try { await dispatch(createAlbum(payload)).unwrap(); toast.success(`✨ Album "${payload.title}" created`); dispatch(fetchAlbums()); }
    catch (err) { toast.error(err.message || "Failed to create album"); }
  };

  const handleUpdate = async (payload) => {
    try { await dispatch(updateAlbum(payload)).unwrap(); toast.success(`📁 Album "${payload.title}" updated`); dispatch(fetchAlbums()); }
    catch { toast.error("Failed to update album"); }
  };

  const stats = { total: albums.length, photos: albums.reduce((s, a) => s + a.photosCount, 0), starred: albums.filter((a) => a.isFavorite).length };
  const toggleSelect = (id) => setSelectedIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const toggleAll = () => setSelectedIds(selectedIds.length === filteredAlbums.length ? [] : filteredAlbums.map((a) => a.id));

  return (
    <div className="m-7 min-h-screen bg-[#0a0815] text-slate-100">
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, albumId: null, albumName: "" })}
        onConfirm={handleConfirmDelete}
        title="Move to Trash?"
        message={`Are you sure you want to move "${deleteConfirm.albumName}" to trash? You can restore it within 30 days.`}
        confirmText="Move to Trash"
        cancelText="Cancel"
        icon={Trash2}
        iconColor="text-red-400"
      />

      <ConfirmModal
        isOpen={bulkDeleteConfirm.isOpen}
        onClose={() => setBulkDeleteConfirm({ isOpen: false, count: 0 })}
        onConfirm={handleConfirmBulkDelete}
        title="Move Multiple Albums to Trash?"
        message={`Are you sure you want to move ${bulkDeleteConfirm.count} album(s) to trash? You can restore them within 30 days.`}
        confirmText="Move to Trash"
        cancelText="Cancel"
        icon={Trash2}
        iconColor="text-red-400"
      />

      <TopBar title="My Albums" showStatus={false} searchPlaceholder="Search albums..." onSearch={setSearch} />

      <div className="p-6 lg:p-8">
        <AlbumModal isOpen={showModal} onClose={() => { setShowModal(false); setEditingAlbum(null); }}
          onSubmit={editingAlbum ? handleUpdate : handleCreate} loading={submitting}
          availablePhotos={availablePhotos} editAlbum={editingAlbum} />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">📁 My Albums<span className="text-xs font-normal text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full">{stats.total} albums</span></h1>
            <p className="text-slate-400 text-sm mt-1">{stats.total} albums • {stats.photos} photos</p>
          </div>
          <button onClick={() => { setEditingAlbum(null); setShowModal(true); }} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer"><Plus size={16} /> Create Album</button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Albums" value={stats.total} icon={FolderOpen} iconBg="bg-yellow-500/10" iconColor="text-yellow-400" />
          <StatCard label="Total Photos" value={stats.photos} icon={ImageIcon} iconBg="bg-indigo-500/10" iconColor="text-indigo-400" />
          <StatCard label="Starred" value={stats.starred} icon={Star} iconBg="bg-yellow-500/10" iconColor="text-yellow-400" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search albums..." className="w-full bg-[#161026] border border-slate-800/70 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500/50 transition" />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer"><X size={14} /></button>}
          </div>
          <div className="flex gap-2 bg-slate-900/30 p-1 rounded-xl">
            <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === "grid" ? "bg-indigo-600/20 text-indigo-400" : "text-slate-500 hover:text-white"}`}><Grid3X3 size={16} /></button>
            <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === "list" ? "bg-indigo-600/20 text-indigo-400" : "text-slate-500 hover:text-white"}`}><Filter size={16} /></button>
          </div>
        </div>

        {selectedAlbum && (
          <div className="mb-6 bg-linear-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedAlbum(null)} className="text-gray-400 hover:text-white transition cursor-pointer"><ArrowLeft size={18} /></button>
                <div><p className="text-[10px] text-indigo-400 uppercase tracking-wider">Selected Album</p><h3 className="text-lg font-bold text-white">{selectedAlbum.name}</h3><p className="text-xs text-gray-400">{selectedAlbum.description}</p></div>
              </div>
              <button onClick={() => downloadAlbumAsZip(selectedAlbum)} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition cursor-pointer bg-indigo-500/10 px-2 py-1 rounded-lg"><Download size={12} /> Download ZIP</button>
            </div>
            {selectedAlbum.photosList?.length > 0 ? (
              <><p className="text-[11px] text-gray-400 mb-2">{selectedAlbum.photosList.length} photos</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {selectedAlbum.photosList.map((photo) => { const imageUrl = photo.imageUrl || photo.url; return (<div key={photo._id || photo.id} className="group relative aspect-square rounded-lg bg-black/40 border border-white/10 overflow-hidden cursor-pointer hover:border-indigo-500/50 transition">{imageUrl ? <img src={imageUrl} alt={photo.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Camera size={20} className="text-gray-500" /></div>}<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"><p className="text-[9px] text-white text-center px-1 truncate">{photo.title || "Untitled"}</p></div></div>); })}
              </div></>
            ) : (<div className="text-center py-6"><p className="text-sm text-gray-500">No photos yet</p><button onClick={() => { setEditingAlbum(selectedAlbum); setShowModal(true); }} className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 transition cursor-pointer">+ Add photos</button></div>)}
          </div>
        )}

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-4 mb-6 p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-xl">
            <button onClick={toggleAll} className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition cursor-pointer">{selectedIds.length === filteredAlbums.length ? "Deselect All" : "Select All"}</button>
            <button onClick={handleBulkDeleteClick} className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 transition cursor-pointer ml-auto"><Trash2 size={13} /> Move to Trash ({selectedIds.length})</button>
          </div>
        )}

        {loading && <div className="flex justify-center items-center py-20"><Loader2 size={32} className="text-indigo-400 animate-spin" /><p className="ml-3 text-gray-400 text-sm">Loading albums...</p></div>}
        {error && (<div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center"><AlertTriangle className="mx-auto text-red-400 mb-2" size={24} /><p className="text-sm text-gray-300">{error}</p><button onClick={() => dispatch(fetchAlbums())} className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer transition">Try Again</button></div>)}

        {!loading && !error && (viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAlbums.map((album) => (<AlbumCard key={album.id} album={album} onFavorite={handleToggleStar} onDelete={handleDeleteClick} onEdit={(a) => { setEditingAlbum(a); setShowModal(true); }} onClick={() => setSelectedAlbum(album)} onDownload={downloadAlbumAsZip} onView={setSelectedAlbum} isTogglingFavorite={togglingFavoriteId === album.id} />))}
            {filteredAlbums.length === 0 && <EmptyState />}
          </div>
        ) : (
          <div className="bg-[#1a1430] border border-slate-800/80 rounded-xl overflow-x-auto">
            <div className="min-w-200">
              <div className="grid grid-cols-[2rem_3rem_1fr_100px_100px_2.5rem] gap-3 px-4 py-3 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-800/80 bg-slate-900/30">
                <button onClick={toggleAll} className={`w-5 h-5 rounded-md border flex items-center justify-center transition cursor-pointer ${selectedIds.length === filteredAlbums.length ? "bg-indigo-600 border-indigo-500" : "border-slate-600 hover:border-slate-400"}`}>{selectedIds.length === filteredAlbums.length && <Check size={10} className="text-white" />}</button>
                <span>Preview</span><span>Name</span><span>Photos</span><span>Modified</span><span>Actions</span>
              </div>
              {filteredAlbums.map((album) => (<AlbumRow key={album.id} album={album} selected={selectedIds.includes(album.id)} onSelect={toggleSelect} onDelete={handleDeleteClick} onEdit={(a) => { setEditingAlbum(a); setShowModal(true); }} onDownload={downloadAlbumAsZip} onView={setSelectedAlbum} onToggleStar={handleToggleStar} isTogglingFavorite={togglingFavoriteId === album.id} />))}
              {filteredAlbums.length === 0 && (<div className="py-16 text-center"><p className="text-gray-500">No albums found</p><button onClick={() => setShowModal(true)} className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 transition cursor-pointer">Create your first album</button></div>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}