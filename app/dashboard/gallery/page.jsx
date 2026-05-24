"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
  Filter, Image as ImageIcon,
  MoreVertical, Grid, List, User as UserIcon,
  Download, Share2, X, Check, SlidersHorizontal,
  ChevronDown, ArrowUpDown, Star, Trash2,
  Loader2, RefreshCw, ChevronRight, Home, AlertTriangle,
  Maximize2, Calendar
} from 'lucide-react';

import TopBar from '../../../components/TopBar';
import {
  fetchAllPhotos,
  searchPhotos,
  filterPhotos,
  fetchPhotosByScene,
  deletePhotoAction,
  clearDisplayedPhotos,
  toggleStarred,
} from '../../../src/redux/slices/photoSlice';

// ─── TRASH HELPER FUNCTION ──────────────────────────────────────────────
const addToTrash = (photo, type = 'photo') => {
  if (typeof window === 'undefined') return;
  
  const trashItem = {
    id: photo.id,
    name: photo.title || "Untitled",
    imageUrl: photo.url || photo.imageUrl,
    qualityScore: photo.score || 50,
    trashedAt: new Date().toISOString(),
    type: type,
    emoji: '📷',
    originalData: photo
  };
  
  const existingTrash = JSON.parse(localStorage.getItem('trash_items') || '[]');
  localStorage.setItem('trash_items', JSON.stringify([trashItem, ...existingTrash]));
};

// ─── CONFIRM MODAL ──────────────────────────────────────────────────────
function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText, icon: Icon, iconColor, loading }) {
  if (!isOpen) return null;
  
  return (
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
              Cancel
            </button>
            <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
              {loading ? <Loader2 size={16} className="animate-spin" /> : confirmText || "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CLOUDINARY URL OPTIMIZATION ──────────────────────────────────────────────
const optimizeCloudinaryUrl = (url, options = { width: 400, quality: 'auto', format: 'auto' }) => {
  if (!url) return null;
  
  if (url.includes('res.cloudinary.com')) {
    try {
      const [base, upload, ...rest] = url.split('/upload/');
      if (rest.length) {
        const transformations = [];
        if (options.width) transformations.push(`w_${options.width}`);
        if (options.quality) transformations.push(`q_${options.quality}`);
        if (options.format) transformations.push(`f_${options.format}`);
        transformations.push('c_limit');
        
        const transformString = transformations.length ? `${transformations.join(',')}/` : '';
        return `${base}/upload/${transformString}${rest.join('/')}`;
      }
    } catch (err) {
      console.warn('Cloudinary URL optimization failed:', err);
    }
  }
  
  return url;
};

// ─── NORMALIZE PHOTO ─────────────────────────────────────────────
const normalise = (p) => {
  const id = p._id || p.id || "";

  const title = p.title || p.name || p.fileName || p.filename || 
    p.originalName || p.originalname || `Photo-${String(id).slice(-6)}`;

  const originalUrl = p.url || p.imageUrl || p.secure_url || null;
  const optimizedUrl = originalUrl && originalUrl.includes('res.cloudinary.com') 
    ? optimizeCloudinaryUrl(originalUrl, { width: 400 })
    : originalUrl;

  return {
    id,
    title,
    category: p.sceneCategory || p.category || "General",
    environment: p.environment || "Indoor",
    socialGroup: p.socialGroup || "Empty",
    score: p.qualityScore || p.score || 0,
    faces: p.faceCount || p.faces || 0,
    dimensions: p.dimensions || `${p.width || 1920}×${p.height || 1080}`,
    date: p.createdAt ? new Date(p.createdAt).toISOString().slice(0, 10) : "—",
    starred: p.isStarred || p.starred || false,
    url: optimizedUrl,
    originalUrl: originalUrl,
    publicId: p.publicId || null,
  };
};

// ─── AUTH WARNING BANNER ───────────────────────────────────────
function AuthWarningBanner() {
  const [noToken, setNoToken] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    setNoToken(!token);
  }, []);
  if (!noToken) return null;
  return (
    <div className="flex items-center gap-3 mb-4 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-400 font-medium">
      <AlertTriangle size={14} className="shrink-0" />
      <span>No auth token found — please login again.</span>
    </div>
  );
}

// ─── IMAGE WITH FALLBACK ───────────────────────────────────────
function PhotoImage({ src, alt, className }) {
  const [errored, setErrored] = useState(false);

  useEffect(() => { setErrored(false); }, [src]);

  if (!src || errored) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-slate-900/50">
        <ImageIcon size={28} className="text-slate-600" />
        <span className="text-xs text-slate-500">No image</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        console.warn(`Image load failed: ${src}`);
        setErrored(true);
      }}
    />
  );
}

// ─── ACTION MENU ────────────────────────────────────────────────
function ActionMenu({ photo, onClose, onDelete, onToggleStar, isTogglingStar }) {
  const actions = [
    { icon: Maximize2, label: 'View Full', color: 'text-slate-300 hover:text-white',
      onClick: () => { window.open(photo.originalUrl || photo.url, '_blank'); onClose(); } },
    { icon: Star, label: photo.starred ? 'Remove Star' : 'Add Star', color: photo.starred ? 'text-amber-400' : 'text-slate-300 hover:text-amber-400',
      onClick: () => { onToggleStar(photo.id); onClose(); }, loading: isTogglingStar },
    { icon: Download, label: 'Download', color: 'text-slate-300 hover:text-white',
      onClick: async () => {
        try {
          toast.loading('Downloading...', { id: 'download' });
          const response = await fetch(photo.originalUrl || photo.url);
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = photo.title || 'photo';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.success('Download started!', { id: 'download' });
        } catch (err) {
          toast.error('Download failed', { id: 'download' });
        }
        onClose();
      } },
    { icon: Share2, label: 'Copy Link', color: 'text-slate-300 hover:text-white',
      onClick: () => {
        if (photo.url) {
          navigator.clipboard.writeText(photo.url);
          toast.success('Link copied!');
        }
        onClose();
      } },
    { icon: Trash2, label: 'Move to Trash', color: 'text-red-400 hover:text-red-300',
      onClick: () => { onDelete(photo.id); onClose(); } },
  ];
  
  return (
    <div className="absolute right-2 top-10 z-50 bg-[#1a1430] border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden w-44">
      {actions.map((a) => (
        <button key={a.label} onClick={a.onClick} disabled={a.loading}
          className={`flex items-center gap-3 w-full px-4 py-2.5 text-xs font-medium ${a.color} hover:bg-white/5 transition-colors disabled:opacity-50 cursor-pointer`}>
          {a.loading ? <Loader2 size={14} className="animate-spin" /> : <a.icon size={14} />} {a.label}
        </button>
      ))}
    </div>
  );
}

// ─── FILTER PANEL ───────────────────────────────────────────────
function FilterPanel({ filters, setFilters, onApply, onClose }) {
  const [local, setLocal] = useState(filters);
  
  const environmentOpts = ['Any', 'Indoor', 'Outdoor'];
  const socialOpts = ['Any', 'Solo', 'Couple', 'Group', 'Empty'];
  const sortOpts = [
    { value: 'newest', label: 'Date (Newest)', icon: Calendar },
    { value: 'oldest', label: 'Date (Oldest)', icon: Calendar },
    { value: 'stars', label: 'Most Starred', icon: Star },
    { value: 'faces', label: 'Most Faces', icon: UserIcon },
  ];

  const apply = () => { setFilters(local); onApply(local); onClose(); };
  const reset = () => setLocal({ environment: 'Any', socialGroup: 'Any', sort: 'newest' });

  return (
    <div className="absolute right-0 top-14 z-50 bg-[#1a1430] border border-slate-700/80 rounded-2xl shadow-2xl w-80 p-5 space-y-5">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-sm flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-indigo-400" /> Filter Gallery
        </span>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition cursor-pointer p-1">
          <X size={16} />
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">🌍 Environment</p>
        <div className="flex gap-2">
          {environmentOpts.map(opt => (
            <button key={opt} onClick={() => setLocal(p => ({ ...p, environment: opt }))}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer
                ${local.environment === opt ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white'}`}>
              {opt === 'Indoor' ? '🏠 Indoor' : opt === 'Outdoor' ? '🌿 Outdoor' : 'Any'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">👥 Social Group</p>
        <div className="grid grid-cols-2 gap-2">
          {socialOpts.map(opt => (
            <button key={opt} onClick={() => setLocal(p => ({ ...p, socialGroup: opt }))}
              className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer
                ${local.socialGroup === opt ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white'}`}>
              {opt === 'Solo' ? '👤 Solo' : opt === 'Couple' ? '👥 Couple' : opt === 'Group' ? '👪 Group' : opt === 'Empty' ? '🖼️ Empty' : 'Any'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">📅 Sort By</p>
        <div className="space-y-1">
          {sortOpts.map(({ value, label, icon: Icon }) => (
            <button key={value} onClick={() => setLocal(p => ({ ...p, sort: value }))}
              className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer
                ${local.sort === value ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={reset} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer">
          Reset
        </button>
        <button onClick={apply} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition cursor-pointer">
          Apply Filters
        </button>
      </div>
    </div>
  );
}

// ─── GRID CARD ─────────────────────────────────────────────────
function GridCard({ photo, selected, onSelect, onDelete, onToggleStar, onBreadcrumbClick, isTogglingStar }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className={`bg-[#1a1430] rounded-2xl overflow-hidden border transition-all duration-300 group
      ${selected ? 'border-indigo-500 ring-1 ring-indigo-500/30' : 'border-slate-800/60 hover:border-slate-700'}`}>

      <div className="h-52 relative bg-slate-900/50">
        {/* Action Buttons - Always Visible */}
        <div className="absolute top-3 right-3 z-20 flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); onToggleStar(photo.id); }} disabled={isTogglingStar}
            className={`p-1.5 rounded-md bg-black/60 backdrop-blur-md transition-all disabled:opacity-50 cursor-pointer
              ${photo.starred ? 'text-amber-400' : 'text-slate-300 hover:text-amber-400'}`}
            title={photo.starred ? 'Remove Star' : 'Add Star'}>
            {isTogglingStar ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} fill={photo.starred ? 'currentColor' : 'none'} />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="p-1.5 rounded-md bg-black/60 backdrop-blur-md text-slate-300 hover:text-white transition cursor-pointer"
            title="More Options">
            <MoreVertical size={14} />
          </button>
        </div>

        {/* Select checkbox */}
        <div className="absolute top-3 left-3 z-20">
          <button onClick={(e) => { e.stopPropagation(); onSelect(photo.id); }}
            className={`w-6 h-6 rounded-lg border flex items-center justify-center backdrop-blur-md transition cursor-pointer
              ${selected ? 'bg-indigo-600 border-indigo-500' : 'bg-black/60 border-slate-600 hover:border-slate-400'}`}
            title="Select">
            {selected && <Check size={12} className="text-white" />}
          </button>
        </div>

        {menuOpen && <ActionMenu photo={photo} onClose={() => setMenuOpen(false)} onDelete={onDelete} onToggleStar={onToggleStar} isTogglingStar={isTogglingStar} />}

        <PhotoImage src={photo.url} alt={photo.title} className="absolute inset-0 w-full h-full object-cover" />

        {photo.faces > 0 && (
          <div className="absolute bottom-3 left-3 z-10 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1">
            <UserIcon size={10} className="text-slate-300" />
            <span className="text-[10px] text-slate-200 font-medium">{photo.faces}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
      </div>

      <div className="p-3">
        <h4 className="text-sm font-semibold text-slate-200 truncate" title={photo.title}>{photo.title}</h4>
        <div className="flex items-center justify-between mt-1">
          <button onClick={() => onBreadcrumbClick(photo.category)}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium uppercase tracking-wider transition cursor-pointer">
            {photo.category}
          </button>
          <div className="flex gap-2 text-[10px] text-slate-500">
            <span>{photo.environment === 'Outdoor' ? '🌿' : '🏠'}</span>
            <span>{photo.socialGroup === 'Solo' ? '👤' : photo.socialGroup === 'Couple' ? '👥' : photo.socialGroup === 'Group' ? '👪' : '🖼️'}</span>
          </div>
        </div>
        <div className="flex justify-between mt-1.5 text-[10px] text-slate-500">
          <span>{photo.dimensions}</span>
          <span>{photo.date}</span>
        </div>
      </div>
    </div>
  );
}

// ─── LIST ROW ─────────────────────────────────────────────────
function ListRow({ photo, selected, onSelect, onDelete, onToggleStar, onBreadcrumbClick, isTogglingStar }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className={`grid grid-cols-[2rem_3rem_1fr_100px_70px_90px_2.5rem] gap-3 px-4 py-2.5 items-center border-b border-slate-800/40 hover:bg-white/5 transition-all group
      ${selected ? 'bg-indigo-600/10' : ''}`}>

      <button onClick={() => onSelect(photo.id)}
        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer
          ${selected ? 'bg-indigo-600 border-indigo-500' : 'border-slate-600 hover:border-slate-400'}`}>
        {selected && <Check size={10} className="text-white" />}
      </button>

      <div className="h-10 w-12 rounded-lg bg-slate-800/50 overflow-hidden relative cursor-pointer" onClick={() => window.open(photo.originalUrl || photo.url, '_blank')}>
        <PhotoImage src={photo.url} alt={photo.title} className="absolute inset-0 w-full h-full object-cover" />
      </div>

      <div className="flex items-center gap-2 min-w-0">
        <button onClick={() => onToggleStar(photo.id)} disabled={isTogglingStar} 
          className={`shrink-0 transition disabled:opacity-50 cursor-pointer ${photo.starred ? 'text-amber-400' : 'text-slate-500 hover:text-amber-400'}`}
          title={photo.starred ? 'Remove Star' : 'Add Star'}>
          {isTogglingStar ? <Loader2 size={13} className="animate-spin" /> : <Star size={13} fill={photo.starred ? 'currentColor' : 'none'} />}
        </button>
        <span className="text-sm font-medium text-slate-200 truncate">{photo.title}</span>
      </div>

      <button onClick={() => onBreadcrumbClick(photo.category)} 
        className="text-[10px] font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded w-fit uppercase transition cursor-pointer">
        {photo.category}
      </button>

      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <UserIcon size={12} /> {photo.faces || '—'}
      </div>

      <div><span className="text-xs text-slate-400">{photo.score > 0 ? `${photo.score}%` : '—'}</span></div>

      <div className="relative flex justify-end">
        <button onClick={() => setMenuOpen(!menuOpen)} 
          className="text-slate-500 hover:text-slate-300 transition cursor-pointer"
          title="More Options">
          <MoreVertical size={16} />
        </button>
        {menuOpen && <ActionMenu photo={photo} onClose={() => setMenuOpen(false)} onDelete={onDelete} onToggleStar={onToggleStar} isTogglingStar={isTogglingStar} />}
      </div>
    </div>
  );
}

// ─── LOADING SKELETON ─────────────────────────────────────────
function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-[#1a1430] rounded-2xl overflow-hidden border border-slate-800/60 animate-pulse">
          <div className="h-52 bg-slate-800/30" />
          <div className="p-4 space-y-2">
            <div className="h-3 bg-slate-800/50 rounded w-3/4" />
            <div className="h-2 bg-slate-800/50 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────
export default function GalleryPage() {
  const dispatch = useDispatch();

  const { items: allPhotos = [], displayedPhotos = [], loading = false, error = null } = useSelector((s) => s.photos ?? {});

  const [currentPath, setCurrentPath] = useState({ root: 'All Photos', category: null });
  const [viewMode, setViewMode] = useState('grid');
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ environment: 'Any', socialGroup: 'Any', sort: 'newest' });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [togglingStarId, setTogglingStarId] = useState(null);
  const [deletingIds, setDeletingIds] = useState([]);
  const [deleting, setDeleting] = useState(false);

  const filterRef = useRef(null);
  const hasFetchedRef = useRef(false);

  // Initial fetch
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      dispatch(fetchAllPhotos());
    }
  }, [dispatch]);

  // Close filter on outside click
  useEffect(() => {
    const handleClick = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      if (currentPath.category) dispatch(fetchPhotosByScene(currentPath.category));
      else dispatch(clearDisplayedPhotos());
      return;
    }
    const timer = setTimeout(() => dispatch(searchPhotos(searchQuery)), 400);
    return () => clearTimeout(timer);
  }, [searchQuery, currentPath.category, dispatch]);

  const handleResetBreadcrumbs = () => {
    setCurrentPath({ root: 'All Photos', category: null });
    setSearchQuery('');
    dispatch(fetchAllPhotos());
  };

  const handleCategorySelect = (categoryName) => {
    setCurrentPath({ root: 'All Photos', category: categoryName });
    setSearchQuery('');
    dispatch(fetchPhotosByScene(categoryName));
  };

  const handleApplyFilters = useCallback((f) => {
    const params = {};
    
    if (f.environment !== 'Any') {
      params.environment = f.environment;
    }
    
    if (f.socialGroup !== 'Any') {
      params.socialGroup = f.socialGroup;
    }
    
    if (f.sort === 'newest') { params.sortBy = 'createdAt'; params.sortOrder = 'desc'; }
    else if (f.sort === 'oldest') { params.sortBy = 'createdAt'; params.sortOrder = 'asc'; }
    else if (f.sort === 'stars') { params.sortBy = 'isStarred'; params.sortOrder = 'desc'; }
    else if (f.sort === 'faces') { params.sortBy = 'faceCount'; params.sortOrder = 'desc'; }
    
    console.log('Applying filters:', params);
    dispatch(filterPhotos(params));
  }, [dispatch]);

  const handleToggleStar = async (id) => {
    setTogglingStarId(id);
    try {
      await dispatch(toggleStarred(id)).unwrap();
      toast.success('Star updated');
    } catch (err) {
      toast.error('Failed to update star');
    } finally {
      setTogglingStarId(null);
    }
  };

  // ─── UPDATED HANDLE DELETE WITH TRASH INTEGRATION ──────────────────────────
  const handleDelete = async (id) => {
    setDeletingIds(prev => [...prev, id]);
    
    // Find the photo to delete
    const photoToDelete = photos.find(p => p.id === id);
    
    if (photoToDelete) {
      // Add to trash storage
      addToTrash(photoToDelete, 'photo');
      toast.info(`📷 "${photoToDelete.title}" moved to trash`);
    }
    
    try {
      await dispatch(deletePhotoAction(id)).unwrap();
      setSelectedIds(prev => prev.filter(x => x !== id));
    } catch (err) {
      toast.error('Delete failed');
    } finally {
      setDeletingIds(prev => prev.filter(x => x !== id));
      setDeleteTarget(null);
    }
  };

  // ─── UPDATED BULK DELETE WITH TRASH INTEGRATION ───────────────────────────
  const handleBulkDelete = async () => {
    setDeleting(true);
    
    // Add all selected photos to trash
    const photosToDelete = photos.filter(p => selectedIds.includes(p.id));
    photosToDelete.forEach(photo => {
      addToTrash(photo, 'photo');
    });
    toast.info(`📷 ${selectedIds.length} photo(s) moved to trash`);
    
    try {
      await Promise.all(selectedIds.map(id => dispatch(deletePhotoAction(id)).unwrap()));
      toast.success(`${selectedIds.length} photo(s) moved to trash`);
      setSelectedIds([]);
    } catch (err) {
      toast.error('Some deletions failed');
    } finally {
      setDeleting(false);
    }
  };

  // Apply client-side filtering when filters change
  const getFilteredPhotos = useCallback(() => {
    let filtered = [...displayedPhotos];
    
    if (filters.environment !== 'Any') {
      filtered = filtered.filter(p => p.environment === filters.environment);
    }
    
    if (filters.socialGroup !== 'Any') {
      filtered = filtered.filter(p => p.socialGroup === filters.socialGroup);
    }
    
    if (filters.sort === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (filters.sort === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (filters.sort === 'stars') {
      filtered.sort((a, b) => (b.isStarred ? 1 : 0) - (a.isStarred ? 1 : 0));
    } else if (filters.sort === 'faces') {
      filtered.sort((a, b) => (b.faceCount || 0) - (a.faceCount || 0));
    }
    
    return filtered;
  }, [displayedPhotos, filters]);

  const photos = getFilteredPhotos().map(normalise);
  const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => setSelectedIds(selectedIds.length === photos.length ? [] : photos.map(p => p.id));
  const onToggleStar = (id) => handleToggleStar(id);
  const activeFilters = [filters.environment, filters.socialGroup].filter(v => v !== 'Any').length;

  const isGlobalLoading = loading && allPhotos.length === 0;

  return (
    <div className="flex h-screen bg-[#0a0815] text-slate-100 overflow-hidden">
      <main className="flex-1 h-full overflow-y-auto custom-scrollbar p-6 lg:p-8">
        <TopBar title="Photo Gallery" showStatus={false} searchPlaceholder="Search photos by name or category..." onSearch={setSearchQuery} />

        {process.env.NODE_ENV === 'development' && <AuthWarningBanner />}

        {/* Page Header with Action Buttons */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              📸 Photo Gallery
              <span className="text-xs font-normal text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full">
                {photos.length} photos
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Browse, organize, and manage your photo collection</p>
          </div>
          
          {/* Quick Action Buttons */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <button onClick={toggleAll} className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 rounded-lg transition cursor-pointer">
                {selectedIds.length === photos.length ? 'Deselect All' : 'Select All'}
              </button>
              <button onClick={handleBulkDelete} disabled={deleting} className="px-3 py-1.5 text-xs font-medium bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 rounded-lg transition cursor-pointer disabled:opacity-50">
                {deleting ? <Loader2 size={12} className="animate-spin" /> : `Move to Trash (${selectedIds.length})`}
              </button>
            </div>
          )}
        </div>

        {/* Metrics & Filters */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/5 px-3 py-1 rounded-full border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Showing {photos.length} of {allPhotos.length} items</span>
            </div>
            {activeFilters > 0 && (
              <div className="text-[10px] text-indigo-400 bg-indigo-600/10 px-2 py-1 rounded-full">
                {activeFilters} filter(s) active
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                <span className="text-[10px] text-rose-400">{error}</span>
                <button onClick={() => dispatch(fetchAllPhotos())} className="cursor-pointer"><RefreshCw size={10} className="text-rose-400" /></button>
              </div>
            )}
          </div>

          <div ref={filterRef} className="relative">
            <button onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer
                ${filterOpen || activeFilters > 0 ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-400' : 'bg-[#1a1430] border-slate-700 text-slate-400 hover:text-white'}`}>
              <Filter size={14} /> Filters
              {activeFilters > 0 && <span className="bg-indigo-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{activeFilters}</span>}
              <ChevronDown size={12} className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
            </button>
            {filterOpen && <FilterPanel filters={filters} setFilters={setFilters} onApply={handleApplyFilters} onClose={() => setFilterOpen(false)} />}
          </div>
        </div>

        {/* Breadcrumbs & View Controls */}
        <div className="flex flex-wrap justify-between items-center pb-5 mb-6 gap-4 border-b border-slate-800/40">
          <nav className="flex items-center gap-2 text-xs font-medium bg-slate-900/30 px-4 py-2 rounded-xl border border-slate-800/60">
            <button onClick={handleResetBreadcrumbs} className={`flex items-center gap-1.5 transition cursor-pointer ${!currentPath.category ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>
              <Home size={14} /> {currentPath.root}
            </button>
            {currentPath.category && (
              <>
                <ChevronRight size={14} className="text-slate-600" />
                <button onClick={() => handleCategorySelect(currentPath.category)} className="text-indigo-400 font-bold uppercase text-[11px] cursor-pointer">
                  {currentPath.category}
                </button>
              </>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex gap-2 bg-slate-900/30 p-1 rounded-xl">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === 'grid' ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-500 hover:text-white'}`} title="Grid View">
                <Grid size={18} />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === 'list' ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-500 hover:text-white'}`} title="List View">
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Loading - only for initial load */}
        {isGlobalLoading && <GridSkeleton />}

        {/* Empty State */}
        {!isGlobalLoading && photos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-slate-800/30 flex items-center justify-center mb-4">
              <ImageIcon size={40} className="text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-300 mb-1">No photos found</h3>
            <p className="text-slate-500 text-sm">{error || 'Try adjusting your filters or upload some photos'}</p>
            {(activeFilters > 0 || currentPath.category) && (
              <button onClick={handleResetBreadcrumbs} className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-medium transition cursor-pointer">
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Grid View */}
        {!isGlobalLoading && viewMode === 'grid' && photos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {photos.map(photo => (
              <GridCard key={photo.id} photo={photo} selected={selectedIds.includes(photo.id)} onSelect={toggleSelect}
                onDelete={(id) => setDeleteTarget(id)} onToggleStar={onToggleStar} onBreadcrumbClick={handleCategorySelect}
                isTogglingStar={togglingStarId === photo.id} />
            ))}
          </div>
        )}

        {/* List View */}
        {!isGlobalLoading && viewMode === 'list' && photos.length > 0 && (
          <div className="bg-[#1a1430] border border-slate-800/80 rounded-xl overflow-x-auto">
            <div className="min-w-200">
              <div className="grid grid-cols-[2rem_3rem_1fr_100px_70px_90px_2.5rem] gap-3 px-4 py-3 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-800/80 bg-slate-900/30">
                <button onClick={toggleAll} className={`w-5 h-5 rounded-md border flex items-center justify-center transition cursor-pointer ${selectedIds.length === photos.length ? 'bg-indigo-600 border-indigo-500' : 'border-slate-600 hover:border-slate-400'}`}>
                  {selectedIds.length === photos.length && <Check size={10} className="text-white" />}
                </button>
                <span>Preview</span>
                <span>Name</span>
                <span>Category</span>
                <span>Faces</span>
                <span>Quality</span>
                <span>Actions</span>
              </div>
              {photos.map(photo => (
                <ListRow key={photo.id} photo={photo} selected={selectedIds.includes(photo.id)} onSelect={toggleSelect}
                  onDelete={(id) => setDeleteTarget(id)} onToggleStar={onToggleStar} onBreadcrumbClick={handleCategorySelect}
                  isTogglingStar={togglingStarId === photo.id} />
              ))}
            </div>
          </div>
        )}

        {/* Delete Modal */}
        <ConfirmModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
          title="Move to Trash?"
          message="This photo will be moved to trash and will be automatically deleted after 30 days. You can restore it from trash."
          confirmText="Move to Trash"
          icon={Trash2}
          iconColor="text-red-400"
          loading={deleteTarget && deletingIds.includes(deleteTarget)}
        />
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2a2340; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3a2f60; }
        button, a, .cursor-pointer { cursor: pointer; }
      `}</style>
    </div>
  );
}