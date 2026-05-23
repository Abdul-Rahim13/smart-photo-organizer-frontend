"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
  FolderOpen,
  Plus,
  Search,
  Image as ImageIcon,
  Filter,
  Lock,
  Globe,
  MoreVertical,
  Trash2,
  Edit2,
  Share2,
  Grid3X3,
  X,
  Loader2,
  AlertTriangle,
  Check,
  Camera,
  Star,
  ArrowLeft,
  Download,
  Eye,
} from "lucide-react";

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="bg-[#161026] border border-gray-800/70 rounded-2xl p-5 flex items-center gap-4 cursor-default hover:border-indigo-500/30 transition-all duration-300">
      <div className={`${iconBg} ${iconColor} p-3 rounded-xl shrink-0`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">{label}</p>
        <p className="text-2xl font-black text-white leading-none">{value}</p>
      </div>
    </div>
  );
}

// ─── ACTION MENU ──────────────────────────────────────────────────────────────
function ActionMenu({ album, onClose, onEdit, onDelete, onFavorite, onDownload, onView, isTogglingFavorite }) {
  const actions = [
    { icon: Eye, label: 'View Full', color: 'text-slate-300 hover:text-white',
      onClick: () => { onView(album); onClose(); } },
    { icon: Star, label: album.isFavorite ? 'Remove Star' : 'Add Star', color: album.isFavorite ? 'text-amber-400' : 'text-slate-300 hover:text-amber-400',
      onClick: () => { onFavorite(album.id); onClose(); }, loading: isTogglingFavorite },
    { icon: Download, label: 'Download Album', color: 'text-slate-300 hover:text-white',
      onClick: () => { onDownload(album); onClose(); } },
    { icon: Share2, label: 'Share Album', color: 'text-slate-300 hover:text-white',
      onClick: () => { onShare(album); onClose(); } },
    { icon: Edit2, label: 'Edit Album', color: 'text-slate-300 hover:text-blue-400',
      onClick: () => { onEdit(album); onClose(); } },
    { icon: Trash2, label: 'Delete Album', color: 'text-red-400 hover:text-red-300',
      onClick: () => { onDelete(album.id); onClose(); } },
  ];
  
  return (
    <div className="absolute right-0 top-8 z-50 bg-[#1a1430] border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden w-44">
      {actions.map((a) => (
        <button key={a.label} onClick={a.onClick} disabled={a.loading}
          className={`flex items-center gap-3 w-full px-4 py-2.5 text-xs font-medium ${a.color} hover:bg-white/5 transition-colors disabled:opacity-50 cursor-pointer`}>
          {a.loading ? <Loader2 size={14} className="animate-spin" /> : <a.icon size={14} />} {a.label}
        </button>
      ))}
    </div>
  );
}

// ─── ALBUM CARD (Grid View) ─────────────────────────────────────────────────
function AlbumCard({ album, onFavorite, onDelete, onEdit, onClick, onDownload, onView, isTogglingFavorite }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef(null);
  
  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);
  
  const coverPhoto = album.photosList?.[0];
  const photoCount = album.photosList?.length || 0;

  return (
    <div ref={ref} className="bg-[#1a1430] rounded-2xl overflow-hidden border border-slate-800/60 hover:border-slate-700 transition-all duration-300 group relative flex flex-col cursor-pointer" onClick={onClick}>
      <div className="h-40 relative bg-gradient-to-br from-purple-900/30 to-indigo-900/30 flex items-center justify-center overflow-hidden">
        {coverPhoto?.imageUrl ? (
          <img src={coverPhoto.imageUrl} alt={album.name} className="w-full h-full object-cover" />
        ) : (
          <FolderOpen size={48} className="text-gray-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
        
        {/* Action Buttons - Always Visible */}
        <div className="absolute top-2 right-2 z-20 flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); onFavorite(album.id); }} disabled={isTogglingFavorite}
            className={`p-1.5 rounded-md bg-black/60 backdrop-blur-md transition-all disabled:opacity-50 cursor-pointer
              ${album.isFavorite ? 'text-amber-400' : 'text-slate-300 hover:text-amber-400'}`}
            title={album.isFavorite ? 'Remove Star' : 'Add Star'}>
            {isTogglingFavorite ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} fill={album.isFavorite ? 'currentColor' : 'none'} />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="p-1.5 rounded-md bg-black/60 backdrop-blur-md text-slate-300 hover:text-white transition cursor-pointer"
            title="More Options">
            <MoreVertical size={14} />
          </button>
        </div>

        {menuOpen && <ActionMenu album={album} onClose={() => setMenuOpen(false)} onEdit={onEdit} onDelete={onDelete} onFavorite={onFavorite} onDownload={onDownload} onView={onView} isTogglingFavorite={isTogglingFavorite} />}

        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1">
          <ImageIcon size={10} className="text-slate-300" />
          <span className="text-[10px] text-white font-medium">{photoCount} photos</span>
        </div>
      </div>
      <div className="p-3">
        <h4 className="text-sm font-semibold text-white truncate cursor-default">{album.name}</h4>
        <p className="text-[10px] text-gray-500 mt-1 cursor-default">{album.description || "No description"}</p>
        <div className="flex items-center justify-between mt-2 text-[9px] text-gray-600">
          <span className="cursor-default">{album.lastModified}</span>
          {album.type === "private" ? <Lock size={10} className="cursor-default" /> : <Globe size={10} className="cursor-default" />}
        </div>
      </div>
    </div>
  );
}

// ─── ALBUM MODAL ────────────────────────────────────
function AlbumModal({ isOpen, onClose, onSubmit, loading, availablePhotos, editAlbum }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [type, setType] = useState("private");
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (editAlbum && isOpen) {
      setName(editAlbum.name || "");
      setDesc(editAlbum.description || "");
      setType(editAlbum.type || "private");
      setSelectedPhotos(editAlbum.photosList?.map(p => p._id || p.id) || []);
    } else if (!isOpen) {
      setName("");
      setDesc("");
      setType("private");
      setSelectedPhotos([]);
      setSearchTerm("");
    }
  }, [editAlbum, isOpen]);

  const filteredPhotos = useMemo(() => {
    if (!availablePhotos) return [];
    let filtered = [...availablePhotos];
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [availablePhotos, searchTerm]);

  const togglePhoto = (photoId) => {
    setSelectedPhotos(prev => 
      prev.includes(photoId) ? prev.filter(id => id !== photoId) : [...prev, photoId]
    );
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Please enter an album name");
      return;
    }
    
    if (editAlbum) {
      onSubmit({
        id: editAlbum.id,
        title: name.trim(),
        description: desc.trim(),
        type,
        photos: selectedPhotos,
      });
    } else {
      onSubmit({
        title: name.trim(),
        description: desc.trim(),
        type,
        photos: selectedPhotos,
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-pointer" onClick={onClose}>
      <div className="bg-[#161026] border border-gray-700/60 rounded-2xl w-full max-w-4xl shadow-2xl cursor-default" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div>
            <h3 className="font-bold text-white text-lg">{editAlbum ? "Edit Album" : "Create Album"}</h3>
            <p className="text-[10px] text-gray-500">Organize your photos into albums</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white cursor-pointer transition"><X size={18} /></button>
        </div>

        <div className="flex flex-col md:flex-row gap-6 p-6 max-h-[70vh] overflow-y-auto">
          {/* Left Side - Album Details */}
          <div className="flex-1 space-y-5">
            <div>
              <label className="text-[11px] font-bold text-gray-400 mb-1 block">Album Name *</label>
              <input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="e.g., Beach Vacation, Birthday Party" 
                className="w-full bg-[#0f0a19] border border-gray-700/60 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 transition cursor-text" 
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 mb-1 block">Description</label>
              <textarea 
                value={desc} 
                onChange={e => setDesc(e.target.value)} 
                rows={2} 
                placeholder="Add a description..." 
                className="w-full bg-[#0f0a19] border border-gray-700/60 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 resize-none transition cursor-text" 
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 mb-1 block">Privacy</label>
              <div className="flex gap-2">
                <button onClick={() => setType("private")} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border text-sm font-medium transition cursor-pointer ${type === "private" ? "bg-indigo-600 border-indigo-500 text-white" : "bg-[#0f0a19] border-gray-700 text-gray-400 hover:border-gray-500"}`}>
                  <Lock size={14} /> Private
                </button>
                <button onClick={() => setType("shared")} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border text-sm font-medium transition cursor-pointer ${type === "shared" ? "bg-indigo-600 border-indigo-500 text-white" : "bg-[#0f0a19] border-gray-700 text-gray-400 hover:border-gray-500"}`}>
                  <Globe size={14} /> Shared
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - Photo Selection */}
          <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-800/60 pt-4 md:pt-0 md:pl-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-[11px] font-bold text-gray-400">Select Photos to Add</label>
              <span className="text-[10px] font-medium bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">
                {selectedPhotos.length} selected
              </span>
            </div>
            
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                placeholder="Search photos..." 
                className="w-full bg-[#0f0a19] border border-gray-700/60 rounded-xl pl-9 pr-3 py-2 text-sm text-white outline-none focus:border-indigo-500/50 transition cursor-text" 
              />
            </div>

            <div className="bg-[#0f0a19] border border-gray-800 rounded-xl p-2 max-h-[350px] overflow-y-auto">
              {filteredPhotos.length === 0 ? (
                <div className="text-center py-8">
                  <ImageIcon size={32} className="text-gray-700 mx-auto mb-2" />
                  <p className="text-[11px] text-gray-500">No photos available</p>
                  <p className="text-[9px] text-gray-600 mt-1">Upload photos first from the Upload page</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {filteredPhotos.map(photo => {
                    const photoId = photo._id || photo.id;
                    const isSelected = selectedPhotos.includes(photoId);
                    const imageUrl = photo.imageUrl || photo.url;
                    
                    return (
                      <div 
                        key={photoId} 
                        onClick={() => togglePhoto(photoId)} 
                        className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                          isSelected ? "border-indigo-500 ring-2 ring-indigo-500/30" : "border-transparent hover:border-gray-600"
                        }`}
                      >
                        {imageUrl ? (
                          <img src={imageUrl} alt={photo.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-black/40 flex items-center justify-center">
                            <Camera size={24} className="text-gray-500" />
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-indigo-600 rounded-full p-0.5">
                            <Check size={12} className="text-white" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {selectedPhotos.length > 0 && (
              <p className="text-[9px] text-indigo-400 text-center mt-2">
                ✓ {selectedPhotos.length} photo(s) will be added to this album
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6 pt-4 border-t border-gray-800/40">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 text-sm font-medium hover:border-gray-500 hover:text-white transition cursor-pointer">
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={!name.trim() || loading} 
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {editAlbum ? "Update Album" : "Create Album"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── EMPTY STATE ────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <FolderOpen size={48} className="text-gray-700 mb-3" />
      <p className="text-gray-400 font-semibold text-sm">No albums found</p>
      <p className="text-gray-600 text-xs mt-1">Click "Create Album" to get started</p>
    </div>
  );
}

// ─── ALBUM ROW (List View) ───────────────────────────────────────────────────
function AlbumRow({ album, selected, onSelect, onDelete, onEdit, onClick, onDownload, onView, onToggleStar, isTogglingFavorite }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className={`grid grid-cols-[2rem_3rem_1fr_100px_100px_2.5rem] gap-3 px-4 py-2.5 items-center border-b border-slate-800/40 hover:bg-white/5 transition-all group
      ${selected ? 'bg-indigo-600/10' : ''}`}>

      <button onClick={() => onSelect(album.id)}
        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer
          ${selected ? 'bg-indigo-600 border-indigo-500' : 'border-slate-600 hover:border-slate-400'}`}>
        {selected && <Check size={10} className="text-white" />}
      </button>

      <div className="h-10 w-12 rounded-lg bg-slate-800/50 overflow-hidden relative cursor-pointer" onClick={() => window.open(album.photosList?.[0]?.imageUrl, '_blank')}>
        {album.photosList?.[0]?.imageUrl ? (
          <img src={album.photosList[0].imageUrl} alt={album.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <FolderOpen size={18} className="absolute inset-0 m-auto text-gray-500" />
        )}
      </div>

      <div className="flex items-center gap-2 min-w-0">
        <button onClick={() => onToggleStar(album.id)} disabled={isTogglingFavorite} 
          className={`shrink-0 transition disabled:opacity-50 cursor-pointer ${album.isFavorite ? 'text-amber-400' : 'text-slate-500 hover:text-amber-400'}`}
          title={album.isFavorite ? 'Remove Star' : 'Add Star'}>
          {isTogglingFavorite ? <Loader2 size={13} className="animate-spin" /> : <Star size={13} fill={album.isFavorite ? 'currentColor' : 'none'} />}
        </button>
        <span className="text-sm font-medium text-slate-200 truncate">{album.name}</span>
      </div>

      <span className="text-sm text-gray-400">{album.photosCount} photos</span>
      <span className="text-[11px] text-gray-500">{album.lastModified}</span>

      <div className="relative flex justify-end">
        <button onClick={() => setMenuOpen(!menuOpen)} 
          className="text-slate-500 hover:text-slate-300 transition cursor-pointer"
          title="More Options">
          <MoreVertical size={16} />
        </button>
        {menuOpen && <ActionMenu album={album} onClose={() => setMenuOpen(false)} onEdit={onEdit} onDelete={onDelete} onFavorite={onToggleStar} onDownload={onDownload} onView={onView} isTogglingFavorite={isTogglingFavorite} />}
      </div>
    </div>
  );
}

// ─── DOWNLOAD ENTIRE ALBUM AS ZIP ─────────────────────────────────────────────
async function downloadAlbumAsZip(album) {
  if (!album.photosList || album.photosList.length === 0) {
    toast.error("No photos to download");
    return;
  }
  
  const loadingToast = toast.loading(`Preparing ${album.photosList.length} photos for download...`);
  const zip = new JSZip();
  let successCount = 0;
  let failCount = 0;
  
  try {
    for (let i = 0; i < album.photosList.length; i++) {
      const photo = album.photosList[i];
      const imageUrl = photo.imageUrl || photo.url;
      if (imageUrl) {
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const extension = blob.type.split('/')[1] || 'jpg';
          const fileName = `${String(i + 1).padStart(3, '0')}_${photo.title?.replace(/[^a-z0-9]/gi, '_') || 'photo'}.${extension}`;
          zip.file(fileName, blob);
          successCount++;
          
          // Update progress every 5 photos
          if (i % 5 === 0) {
            toast.loading(`Downloading photos... ${successCount}/${album.photosList.length}`, { id: loadingToast });
          }
        } catch (err) {
          failCount++;
          console.error(`Failed to download ${imageUrl}:`, err);
        }
      }
    }
    
    if (successCount > 0) {
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${album.name.replace(/[^a-z0-9]/gi, '_')}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      if (failCount > 0) {
        toast.success(`Downloaded ${successCount}/${album.photosList.length} photos as ZIP`, { id: loadingToast });
      } else {
        toast.success(`✅ Downloaded ${successCount} photos as "${album.name}.zip"`, { id: loadingToast });
      }
    } else {
      toast.error("Failed to download any photos", { id: loadingToast });
    }
  } catch (error) {
    console.error("ZIP creation failed:", error);
    toast.error("Failed to create ZIP file", { id: loadingToast });
  }
}

// ─── MAIN ALBUMS PAGE ───────────────────────────────────────────────────────
export default function AlbumsPage() {
  const dispatch = useDispatch();
  const { items, loading, submitting, error } = useSelector((state) => state.albums);
  const { items: photos } = useSelector((state) => state.photos);

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [showModal, setShowModal] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [togglingFavoriteId, setTogglingFavoriteId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    dispatch(fetchAlbums());
    dispatch(fetchAllPhotos());
  }, [dispatch]);

  const albums = useMemo(() => {
    if (!items) return [];
    const albumsArray = Array.isArray(items) ? items : (items.data || []);
    
    return albumsArray.map(album => ({
      id: album._id || album.id,
      name: album.title || "Untitled",
      description: album.description || "",
      type: album.type || "private",
      isFavorite: album.isFavorite || false,
      photosCount: album.photos?.length || 0,
      photosList: album.photos || [],
      lastModified: album.updatedAt ? new Date(album.updatedAt).toLocaleDateString() : "Just now",
    }));
  }, [items]);

  const availablePhotos = useMemo(() => {
    if (!photos) return [];
    return Array.isArray(photos) ? photos : (photos.data || []);
  }, [photos]);

  const filteredAlbums = useMemo(() => {
    if (!search) return albums;
    return albums.filter(a => 
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description?.toLowerCase().includes(search.toLowerCase())
    );
  }, [albums, search]);

  const handleToggleStar = async (id) => {
    setTogglingFavoriteId(id);
    try {
      await dispatch(toggleFavoriteAlbum(id)).unwrap();
      const album = albums.find(a => a.id === id);
      toast.success(album?.isFavorite ? "⭐ Removed from favorites" : "⭐ Added to favorites");
      dispatch(fetchAlbums());
    } catch (err) {
      toast.error("Failed to update favorite status");
    } finally {
      setTogglingFavoriteId(null);
    }
  };
  
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this album?")) {
      try {
        await dispatch(deleteAlbum(id)).unwrap();
        if (selectedAlbum?.id === id) setSelectedAlbum(null);
        toast.success("🗑️ Album deleted successfully");
        dispatch(fetchAlbums());
      } catch (err) {
        toast.error("Failed to delete album");
      }
    }
  };

  const handleCreate = async (payload) => {
    try {
      const result = await dispatch(createAlbum(payload)).unwrap();
      if (result) {
        toast.success(`✨ Album "${payload.title}" created with ${payload.photos?.length || 0} photos`);
        dispatch(fetchAlbums());
      }
    } catch (err) {
      toast.error(err.message || "Failed to create album");
    }
  };
  
  const handleUpdate = async (payload) => {
    try {
      await dispatch(updateAlbum(payload)).unwrap();
      toast.success(`📁 Album "${payload.title}" updated successfully`);
      dispatch(fetchAlbums());
    } catch (err) {
      toast.error("Failed to update album");
    }
  };

  const handleViewAlbum = (album) => {
    setSelectedAlbum(album);
  };

  const handleShareAlbum = async (album) => {
    const albumUrl = `${window.location.origin}/albums/${album.id}`;
    try {
      await navigator.clipboard.writeText(albumUrl);
      toast.success("📋 Album link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const stats = {
    total: albums.length,
    photos: albums.reduce((s, a) => s + a.photosCount, 0),
  };

  const selectedAlbumPhotos = selectedAlbum?.photosList || [];
  
  const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => setSelectedIds(selectedIds.length === filteredAlbums.length ? [] : filteredAlbums.map(a => a.id));

  return (
    <div className="min-h-screen bg-[#0a0815] text-slate-100">
      <TopBar 
        title="My Albums" 
        showStatus={false}
        searchPlaceholder="Search albums..."
        onSearch={setSearch}
      />
      
      <div className="p-6 lg:p-8">
        <AlbumModal
          isOpen={showModal}
          onClose={() => { setShowModal(false); setEditingAlbum(null); }}
          onSubmit={editingAlbum ? handleUpdate : handleCreate}
          loading={submitting}
          availablePhotos={availablePhotos}
          editAlbum={editingAlbum}
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              📁 My Albums
              <span className="text-xs font-normal text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full">
                {stats.total} albums
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">{stats.total} albums • {stats.photos} photos</p>
          </div>
          <button 
            onClick={() => { setEditingAlbum(null); setShowModal(true); }} 
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer"
          >
            <Plus size={16} /> Create Album
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Albums" value={stats.total} icon={FolderOpen} iconBg="bg-yellow-500/10" iconColor="text-yellow-400" />
          <StatCard label="Total Photos" value={stats.photos} icon={ImageIcon} iconBg="bg-indigo-500/10" iconColor="text-indigo-400" />
          <StatCard label="Starred" value={albums.filter(a => a.isFavorite).length} icon={Star} iconBg="bg-yellow-500/10" iconColor="text-yellow-400" />
        </div>

        {/* Search & View Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search albums..." 
              className="w-full bg-[#161026] border border-slate-800/70 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500/50 transition cursor-text" 
            />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer"><X size={14} /></button>}
          </div>
          <div className="flex gap-2 bg-slate-900/30 p-1 rounded-xl">
            <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === "grid" ? "bg-indigo-600/20 text-indigo-400" : "text-slate-500 hover:text-white"}`} title="Grid View">
              <Grid3X3 size={16} />
            </button>
            <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === "list" ? "bg-indigo-600/20 text-indigo-400" : "text-slate-500 hover:text-white"}`} title="List View">
              <Filter size={16} />
            </button>
          </div>
        </div>

        {/* Selected Album Preview */}
        {selectedAlbum && (
          <div className="mb-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedAlbum(null)} className="text-gray-400 hover:text-white transition cursor-pointer">
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <p className="text-[10px] text-indigo-400 uppercase tracking-wider">Selected Album</p>
                  <h3 className="text-lg font-bold text-white">{selectedAlbum.name}</h3>
                  <p className="text-xs text-gray-400">{selectedAlbum.description}</p>
                </div>
              </div>
              <button 
                onClick={() => downloadAlbumAsZip(selectedAlbum)}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition cursor-pointer bg-indigo-500/10 px-2 py-1 rounded-lg"
              >
                <Download size={12} /> Download ZIP
              </button>
            </div>
            {selectedAlbumPhotos.length > 0 ? (
              <>
                <p className="text-[11px] text-gray-400 mb-2">{selectedAlbumPhotos.length} photos in this album</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {selectedAlbumPhotos.map(photo => {
                    const imageUrl = photo.imageUrl || photo.url;
                    return (
                      <div key={photo._id || photo.id} className="group relative aspect-square rounded-lg bg-black/40 border border-white/10 overflow-hidden cursor-pointer hover:border-indigo-500/50 transition">
                        {imageUrl ? (
                          <img src={imageUrl} alt={photo.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Camera size={20} className="text-gray-500" /></div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <p className="text-[9px] text-white text-center px-1 truncate">{photo.title || "Untitled"}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500">No photos in this album yet</p>
                <button 
                  onClick={() => { setEditingAlbum(selectedAlbum); setShowModal(true); }} 
                  className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
                >
                  + Add photos
                </button>
              </div>
            )}
          </div>
        )}

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-4 mb-6 p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-xl">
            <button onClick={toggleAll} className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition cursor-pointer">
              {selectedIds.length === filteredAlbums.length ? 'Deselect All' : 'Select All'}
            </button>
            <button 
              onClick={() => {
                selectedIds.forEach(id => handleDelete(id));
                setSelectedIds([]);
              }} 
              className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 transition cursor-pointer ml-auto"
            >
              <Trash2 size={13} /> Delete ({selectedIds.length})
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="text-indigo-400 animate-spin" />
            <p className="ml-3 text-gray-400 text-sm">Loading albums...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
            <AlertTriangle className="mx-auto text-red-400 mb-2" size={24} />
            <p className="text-sm text-gray-300">{error}</p>
            <button onClick={() => dispatch(fetchAlbums())} className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer transition">Try Again</button>
          </div>
        )}

        {/* Albums Grid/List - No extra div causing scroll */}
        {!loading && !error && (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAlbums.map(album => (
                <AlbumCard 
                  key={album.id} 
                  album={album} 
                  onFavorite={handleToggleStar} 
                  onDelete={handleDelete} 
                  onEdit={(a) => { setEditingAlbum(a); setShowModal(true); }} 
                  onClick={() => handleViewAlbum(album)}
                  onDownload={downloadAlbumAsZip}
                  onView={handleViewAlbum}
                  isTogglingFavorite={togglingFavoriteId === album.id}
                />
              ))}
              {filteredAlbums.length === 0 && <EmptyState />}
            </div>
          ) : (
            <div className="bg-[#1a1430] border border-slate-800/80 rounded-xl overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-[2rem_3rem_1fr_100px_100px_2.5rem] gap-3 px-4 py-3 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-800/80 bg-slate-900/30">
                  <button onClick={toggleAll} className={`w-5 h-5 rounded-md border flex items-center justify-center transition cursor-pointer ${selectedIds.length === filteredAlbums.length ? 'bg-indigo-600 border-indigo-500' : 'border-slate-600 hover:border-slate-400'}`}>
                    {selectedIds.length === filteredAlbums.length && <Check size={10} className="text-white" />}
                  </button>
                  <span>Preview</span>
                  <span>Name</span>
                  <span>Photos</span>
                  <span>Modified</span>
                  <span>Actions</span>
                </div>
                {filteredAlbums.map(album => (
                  <AlbumRow 
                    key={album.id} 
                    album={album} 
                    selected={selectedIds.includes(album.id)}
                    onSelect={toggleSelect}
                    onDelete={handleDelete} 
                    onEdit={(a) => { setEditingAlbum(a); setShowModal(true); }} 
                    onClick={() => handleViewAlbum(album)}
                    onDownload={downloadAlbumAsZip}
                    onView={handleViewAlbum}
                    onToggleStar={handleToggleStar}
                    isTogglingFavorite={togglingFavoriteId === album.id}
                  />
                ))}
                {filteredAlbums.length === 0 && (
                  <div className="py-16 text-center">
                    <p className="text-gray-500">No albums found</p>
                    <button onClick={() => setShowModal(true)} className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 transition cursor-pointer">Create your first album</button>
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}