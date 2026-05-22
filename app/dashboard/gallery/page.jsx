// "use client"

// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { toast } from 'sonner';
// import {
//   Filter, Image as ImageIcon,
//   MoreVertical, Grid, List, User as UserIcon,
//   Download, Share2, Pencil, X, Check, SlidersHorizontal,
//   ChevronDown, ArrowUpDown, Star, Heart, Eye, Trash2,
//   Loader2, RefreshCw,
// } from 'lucide-react';

// import TopBar from '../../../components/TopBar';
// import {
//   fetchAllPhotos,
//   searchPhotos,
//   filterPhotos,
//   fetchPhotosByScene,
//   deletePhotoAction,      
//   clearDisplayedPhotos,
//   toggleStarred,
// } from '../../../src/redux/slices/photoSlice';

// // ─── Score colour helpers ────────────────────────────────────────────────────
// const scoreColor = (s) =>
//   s >= 95 ? 'text-green-400' : s >= 90 ? 'text-blue-400' : s >= 85 ? 'text-yellow-400' : 'text-orange-400';
// const scoreBg = (s) =>
//   s >= 95
//     ? 'bg-green-500/10 border-green-500/30'
//     : s >= 90
//     ? 'bg-blue-500/10 border-blue-500/30'
//     : 'bg-yellow-500/10 border-yellow-500/30';

// /**
//  * Normalise a raw backend photo object so the UI always sees the same shape.
//  * Adjust field names below to match whatever your API actually returns.
//  */
// const normalise = (p) => ({
//   id:      p._id  || p.id,
//   title:   p.title || p.originalName || p.filename || 'Untitled',
//   cat:     p.scene || p.category     || 'Uncategorised',
//   score:   p.aiScore ?? p.qualityScore ?? p.score ?? 0,
//   faces:   p.faceCount ?? p.faces ?? 0,
//   size:    p.fileSize   || p.size    || '—',
//   date:    p.createdAt  ? new Date(p.createdAt).toISOString().slice(0, 10) : (p.date || '—'),
//   starred: p.starred    ?? p.isFavorite ?? false,
//   url:     p.url        || p.imageUrl   || p.path || null,
//   color:   categoryColor(p.scene || p.category),
// });

// const categoryColor = (cat) => {
//   const map = {
//     Indoor:  'bg-purple-900/30',
//     Outdoor: 'bg-emerald-900/30',
//     Urban:   'bg-blue-900/30',
//   };
//   return map[cat] || 'bg-gray-700/30';
// };

// // ─── ACTION MENU ─────────────────────────────────────────────────────────────
// function ActionMenu({ photo, onClose, onDelete }) {
//   const actions = [
//     { icon: Eye,      label: 'View Photo',  color: 'text-indigo-400', onClick: () => { onClose(); } },
//     { icon: Download, label: 'Download',    color: 'text-blue-400',   onClick: () => {
//         if (photo.url) { const a = document.createElement('a'); a.href = photo.url; a.download = photo.title; a.click(); }
//         onClose();
//       }
//     },
//     { icon: Share2,   label: 'Share',       color: 'text-purple-400', onClick: () => { onClose(); } },
//     { icon: Pencil,   label: 'Rename',      color: 'text-yellow-400', onClick: () => { onClose(); } },
//     { icon: Heart,    label: 'Favourite',   color: 'text-pink-400',   onClick: () => { onClose(); } },
//     { icon: Trash2,   label: 'Delete',      color: 'text-red-400',    onClick: () => { onDelete(photo.id); onClose(); } },
//   ];
//   return (
//     <div className="absolute right-2 top-10 z-50 bg-[#1c1430] border border-gray-700 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden w-44 animate-in">
//       {actions.map((a) => (
//         <button
//           key={a.label}
//           onClick={a.onClick}
//           className={`flex items-center gap-3 w-full px-4 py-2.5 text-xs font-semibold ${a.color} hover:bg-white/5 transition-colors cursor-pointer`}
//         >
//           <a.icon size={14} /> {a.label}
//         </button>
//       ))}
//     </div>
//   );
// }

// // ─── FILTER PANEL ────────────────────────────────────────────────────────────
// function FilterPanel({ filters, setFilters, onApply, onClose }) {
//   const [local, setLocal] = useState(filters);

//   const scoreRanges = ['Any', '85–89%', '90–94%', '95–100%'];
//   const facesOpts   = ['Any', 'No Faces', '1 Face', '2+ Faces'];
//   const sortOpts    = ['Date (Newest)', 'Date (Oldest)', 'Quality (High)', 'Quality (Low)', 'Name A–Z'];

//   const apply = () => { setFilters(local); onApply(local); onClose(); };
//   const reset = () => setLocal({ score: 'Any', faces: 'Any', sort: 'Date (Newest)' });

//   return (
//     <div className="absolute right-0 top-14 z-50 bg-[#1c1430] border border-gray-700/70 rounded-2xl shadow-2xl shadow-black/60 w-72 p-5 space-y-5 animate-in">
//       <div className="flex items-center justify-between">
//         <span className="font-bold text-sm flex items-center gap-2">
//           <SlidersHorizontal size={15} className="text-indigo-400" /> Filters
//         </span>
//         <button onClick={onClose} className="text-gray-500 hover:text-white transition cursor-pointer"><X size={16} /></button>
//       </div>

//       {/* Quality Score */}
//       <div className="space-y-2">
//         <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">AI Quality Score</p>
//         <div className="grid grid-cols-2 gap-2">
//           {scoreRanges.map(r => (
//             <button key={r} onClick={() => setLocal(p => ({ ...p, score: r }))}
//               className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer
//                 ${local.score === r ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-gray-700 text-gray-400 hover:border-indigo-500/50'}`}>
//               {r}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Faces */}
//       <div className="space-y-2">
//         <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Face Detection</p>
//         <div className="grid grid-cols-2 gap-2">
//           {facesOpts.map(f => (
//             <button key={f} onClick={() => setLocal(p => ({ ...p, faces: f }))}
//               className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer
//                 ${local.faces === f ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-gray-700 text-gray-400 hover:border-indigo-500/50'}`}>
//               {f}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Sort */}
//       <div className="space-y-2">
//         <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Sort By</p>
//         <div className="space-y-1">
//           {sortOpts.map(s => (
//             <button key={s} onClick={() => setLocal(p => ({ ...p, sort: s }))}
//               className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer
//                 ${local.sort === s ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300' : 'border-transparent text-gray-400 hover:bg-white/5'}`}>
//               <ArrowUpDown size={12} /> {s}
//             </button>
//           ))}
//         </div>
//       </div>

//       <div className="flex gap-2 pt-1">
//         <button onClick={reset} className="flex-1 py-2.5 rounded-xl border border-gray-700 text-xs font-bold text-gray-400 hover:text-white transition cursor-pointer">Reset</button>
//         <button onClick={apply} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition cursor-pointer">Apply</button>
//       </div>
//     </div>
//   );
// }

// // ─── GRID CARD ───────────────────────────────────────────────────────────────
// function GridCard({ photo, selected, onSelect, onDelete, onToggleStar }) {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const ref = useRef(null);

//   useEffect(() => {
//     const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false); };
//     document.addEventListener('mousedown', h);
//     return () => document.removeEventListener('mousedown', h);
//   }, []);

//   return (
//     <div ref={ref} className={`bg-[#161026] rounded-4xl overflow-hidden border transition-all duration-300 group
//       ${selected ? 'border-indigo-500 shadow-lg shadow-indigo-500/20' : 'border-gray-800 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10'}`}>

//       <div className={`h-52 ${photo.color} relative flex items-center justify-center overflow-hidden`}>
//         {/* Checkbox */}
//         <button onClick={() => onSelect(photo.id)}
//           className={`absolute top-3 left-3 z-10 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer
//             ${selected ? 'bg-indigo-600 border-indigo-500' : 'bg-black/40 border-gray-600 hover:border-indigo-400'}`}>
//           {selected && <Check size={12} className="text-white" />}
//         </button>

//         {/* Star */}
//         <button onClick={() => onToggleStar(photo.id)}
//           className={`absolute top-3 right-10 z-10 transition-all cursor-pointer ${photo.starred ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-400'}`}>
//           <Star size={16} fill={photo.starred ? 'currentColor' : 'none'} />
//         </button>

//         {/* More menu */}
//         <button onClick={() => setMenuOpen(o => !o)}
//           className="absolute top-3 right-3 z-10 text-gray-400 hover:text-white transition cursor-pointer">
//           <MoreVertical size={16} />
//         </button>
//         {menuOpen && <ActionMenu photo={photo} onClose={() => setMenuOpen(false)} onDelete={onDelete} />}

//         {/* Thumbnail or placeholder */}
//         {photo.url
//           ? <img src={photo.url} alt={photo.title} className="absolute inset-0 w-full h-full object-cover opacity-80" />
//           : <ImageIcon className="opacity-10 text-white" size={60} />
//         }

//         {/* AI Score Badge */}
//         <div className={`absolute bottom-12 right-3 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-black border ${scoreColor(photo.score)} ${scoreBg(photo.score)}`}>
//           {photo.score}% AI
//         </div>

//         {/* Face badge */}
//         {photo.faces > 0 && (
//           <div className="absolute bottom-12 left-3 bg-indigo-600 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
//             <UserIcon size={10} className="text-white" />
//             <span className="text-[10px] text-white font-black">{photo.faces}</span>
//           </div>
//         )}

//         <div className="absolute inset-0 bg-linear-to-t from-[#0f0a19] via-transparent to-transparent opacity-70" />

//         <div className="absolute bottom-3 left-4 right-4">
//           <p className="text-sm font-bold text-white truncate">{photo.title}</p>
//           <p className="text-[10px] text-gray-400 flex items-center gap-1.5 font-medium mt-0.5">
//             <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full inline-block" />
//             {photo.cat} · {photo.size}
//           </p>
//         </div>
//       </div>

//       <div className="px-4 py-3 flex justify-between items-center bg-[#1c1430]/50 border-t border-gray-800/50">
//         <span className="text-[10px] text-gray-500 font-medium">{photo.date}</span>
//         <div className="flex items-center gap-3">
//           <button className="text-[10px] font-black uppercase tracking-wider text-gray-500 hover:text-white transition cursor-pointer">Details</button>
//           <button className="text-[10px] font-black uppercase tracking-wider text-yellow-500 hover:text-yellow-300 transition cursor-pointer">View →</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── LIST ROW ────────────────────────────────────────────────────────────────
// function ListRow({ photo, selected, onSelect, onDelete, onToggleStar }) {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const ref = useRef(null);

//   useEffect(() => {
//     const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false); };
//     document.addEventListener('mousedown', h);
//     return () => document.removeEventListener('mousedown', h);
//   }, []);

//   return (
//     <div ref={ref}
//       className={`grid grid-cols-[2rem_3.5rem_1fr_120px_80px_90px_80px_90px_2.5rem] gap-4 px-4 py-3.5 items-center border-b border-gray-800/40 transition-all duration-200 group cursor-pointer
//         ${selected ? 'bg-indigo-600/10' : 'hover:bg-white/3'}`}>

//       <button onClick={() => onSelect(photo.id)}
//         className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer shrink-0
//           ${selected ? 'bg-indigo-600 border-indigo-500' : 'border-gray-700 hover:border-indigo-400'}`}>
//         {selected && <Check size={10} className="text-white" />}
//       </button>

//       <div className={`h-10 w-14 rounded-lg ${photo.color} flex items-center justify-center overflow-hidden shrink-0 relative`}>
//         {photo.url
//           ? <img src={photo.url} alt={photo.title} className="absolute inset-0 w-full h-full object-cover" />
//           : <ImageIcon size={16} className="opacity-20 text-white" />
//         }
//       </div>

//       <div className="flex items-center gap-2 min-w-0">
//         <button onClick={() => onToggleStar(photo.id)}
//           className={`shrink-0 transition cursor-pointer ${photo.starred ? 'text-yellow-400' : 'text-gray-700 hover:text-yellow-400'}`}>
//           <Star size={12} fill={photo.starred ? 'currentColor' : 'none'} />
//         </button>
//         <span className="text-sm font-semibold text-gray-100 truncate">{photo.title}</span>
//       </div>

//       <div>
//         <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
//           {photo.cat}
//         </span>
//       </div>

//       <div>
//         {photo.faces > 0
//           ? <span className="flex items-center gap-1.5 text-[11px] font-bold text-blue-400"><UserIcon size={12} /> {photo.faces}</span>
//           : <span className="text-[11px] text-gray-600">—</span>
//         }
//       </div>

//       <div><span className={`text-[11px] font-black ${scoreColor(photo.score)}`}>{photo.score}%</span></div>
//       <div><span className="text-[11px] text-gray-400 font-medium">{photo.size}</span></div>
//       <div><span className="text-[11px] text-gray-500 font-medium">{photo.date}</span></div>

//       <div className="relative shrink-0">
//         <button onClick={() => setMenuOpen(o => !o)}
//           className="text-gray-600 hover:text-yellow-400 transition cursor-pointer opacity-0 group-hover:opacity-100">
//           <MoreVertical size={16} />
//         </button>
//         {menuOpen && (
//           <div className="absolute right-0 top-6">
//             <ActionMenu photo={photo} onClose={() => setMenuOpen(false)} onDelete={onDelete} />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // ─── LOADING SKELETON ─────────────────────────────────────────────────────────
// function GridSkeleton() {
//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//       {Array.from({ length: 8 }).map((_, i) => (
//         <div key={i} className="bg-[#161026] rounded-4xl overflow-hidden border border-gray-800 animate-pulse">
//           <div className="h-52 bg-gray-800/50" />
//           <div className="px-4 py-3 bg-[#1c1430]/50 border-t border-gray-800/50">
//             <div className="h-3 bg-gray-700/50 rounded w-3/4 mb-2" />
//             <div className="h-2 bg-gray-700/30 rounded w-1/2" />
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// // ─── MAIN PAGE ────────────────────────────────────────────────────────────────
// export default function GalleryPage() {
//   const dispatch = useDispatch();
//   const {
//   gallery:         allPhotos    = [],
//   displayedPhotos = [],
//   loading     = false,
//   error       = null,
//   isSearching = false,
//   isFiltering = false,
// } = useSelector((s) => s.photos ?? {});
//   const [activeTab,    setActiveTab]    = useState('All');
//   const [viewMode,     setViewMode]     = useState('grid');
//   const [selectedIds,  setSelectedIds]  = useState([]);
//   const [filterOpen,   setFilterOpen]   = useState(false);
//   const [searchQuery,  setSearchQuery]  = useState('');
//   const [filters,      setFilters]      = useState({ score: 'Any', faces: 'Any', sort: 'Date (Newest)' });
//   const [deleteTarget, setDeleteTarget] = useState(null); // id pending confirmation
//   const filterRef = useRef(null);

//   // ── initial load ────────────────────────────────────────────────────────────
//   useEffect(() => {
//     dispatch(fetchAllPhotos());
//   }, [dispatch]);

//   // ── close filter panel on outside click ─────────────────────────────────────
//   useEffect(() => {
//     const h = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false); };
//     document.addEventListener('mousedown', h);
//     return () => document.removeEventListener('mousedown', h);
//   }, []);

//   // ── debounced search ─────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (!searchQuery.trim()) {
//       dispatch(clearDisplayedPhotos());
//       return;
//     }
//     const t = setTimeout(() => dispatch(searchPhotos(searchQuery)), 400);
//     return () => clearTimeout(t);
//   }, [searchQuery, dispatch]);

//   // ── tab → scene filter ───────────────────────────────────────────────────────
//   const handleTabChange = (tab) => {
//     setActiveTab(tab);
//     setSearchQuery('');
//     if (tab === 'All') {
//       dispatch(clearFilters());
//     } else {
//       dispatch(fetchPhotosByScene(tab));
//     }
//   };

//   // ── apply filter panel ───────────────────────────────────────────────────────
//   const handleApplyFilters = useCallback((f) => {
//     const scoreMap = {
//       'Any':      { minScore: undefined,  maxScore: undefined  },
//       '85–89%':   { minScore: 85,         maxScore: 89         },
//       '90–94%':   { minScore: 90,         maxScore: 94         },
//       '95–100%':  { minScore: 95,         maxScore: 100        },
//     };
//     const facesMap = {
//       'Any':       { faces: undefined },
//       'No Faces':  { faces: 0         },
//       '1 Face':    { faces: 1         },
//       '2+ Faces':  { faces: 2         },   // back-end interprets as "at least"
//     };
//     const sortMap = {
//       'Date (Newest)': { sortBy: 'createdAt', sortOrder: 'desc' },
//       'Date (Oldest)': { sortBy: 'createdAt', sortOrder: 'asc'  },
//       'Quality (High)':{ sortBy: 'aiScore',   sortOrder: 'desc' },
//       'Quality (Low)': { sortBy: 'aiScore',   sortOrder: 'asc'  },
//       'Name A–Z':      { sortBy: 'title',     sortOrder: 'asc'  },
//     };
//     const params = {
//       ...scoreMap[f.score],
//       ...facesMap[f.faces],
//       ...sortMap[f.sort],
//     };
//     dispatch(filterPhotos(params));
//   }, [dispatch]);

//   // ── delete with confirmation ─────────────────────────────────────────────────
//   const handleDelete = async (id) => {
//     const result = await dispatch(deletePhotoAction(id));
//     if (deletePhotoAction.fulfilled.match(result)) {
//       toast.success('Photo deleted');
//       setSelectedIds(p => p.filter(x => x !== id));
//     } else {
//       toast.error(result.payload || 'Delete failed');
//     }
//     setDeleteTarget(null);
//   };

//   const handleBulkDelete = async () => {
//     await Promise.all(selectedIds.map(id => dispatch(deletePhotoAction(id))));
//     toast.success(`${selectedIds.length} photo(s) deleted`);
//     setSelectedIds([]);
//   };

//   // ── normalise displayed list ─────────────────────────────────────────────────
//   const photos = (displayedPhotos || []).map(normalise);

//   const toggleSelect = (id) => setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
//   const toggleAll    = () => setSelectedIds(selectedIds.length === photos.length ? [] : photos.map(p => p.id));
//   const onToggleStar = (id) => dispatch(toggleStarred(id));

//   const activeFilters = [filters.score, filters.faces, filters.sort]
//     .filter(v => !['Any', 'Date (Newest)'].includes(v)).length;

//   const tabs = ['All', 'Outdoor', 'Indoor', 'Urban'];

//   return (
//     <div className="flex h-screen bg-[#0f0a19] text-gray-100 overflow-hidden">
//       <main className="flex-1 h-full overflow-y-auto custom-scrollbar p-8">

//         {/* ── TOP BAR (replaces custom header) ── */}
//         <TopBar
//           title="Photo Gallery"
//           showStatus={false}
//           searchPlaceholder="Search photos by name or scene…"
//           onSearch={(q) => setSearchQuery(q)}
//         />

//         {/* ── Item count pill ────────────────────────────────────── */}
//         <div className="flex items-center gap-3 mb-6 -mt-4">
//           <div className="flex items-center gap-2 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
//             <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
//               {photos.length} / {allPhotos.length} Items
//             </span>
//           </div>
//           {error && (
//             <div className="flex items-center gap-2 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
//               <span className="text-[10px] text-red-400 font-bold">{error}</span>
//               <button onClick={() => dispatch(fetchAllPhotos())} className="text-red-400 hover:text-red-300 cursor-pointer">
//                 <RefreshCw size={10} />
//               </button>
//             </div>
//           )}
//         </div>

//         {/* ── FILTER ROW ─────────────────────────────────────────── */}
//         <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
//           {/* Filter button only — search is in TopBar */}
//           <div ref={filterRef} className="relative ml-auto">
//             <button onClick={() => setFilterOpen(o => !o)}
//               className={`flex items-center gap-2 px-4 py-3.5 rounded-2xl border text-sm font-semibold transition-all cursor-pointer
//                 ${filterOpen || activeFilters > 0 ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300' : 'bg-[#1c1430] border-gray-800 text-gray-400 hover:text-white'}`}>
//               <Filter size={18} />
//               {activeFilters > 0 && (
//                 <span className="bg-indigo-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
//                   {activeFilters}
//                 </span>
//               )}
//               <ChevronDown size={14} className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
//             </button>
//             {filterOpen && (
//               <FilterPanel
//                 filters={filters}
//                 setFilters={setFilters}
//                 onApply={handleApplyFilters}
//                 onClose={() => setFilterOpen(false)}
//               />
//             )}
//           </div>
//         </div>

//         {/* ── TABS + VIEW TOGGLE ─────────────────────────────────── */}
//         <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
//           <div className="flex bg-[#161026] p-1.5 rounded-2xl border border-gray-800/50 overflow-x-auto">
//             {tabs.map(tab => (
//               <button key={tab} onClick={() => handleTabChange(tab)}
//                 className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap cursor-pointer
//                   ${activeTab === tab ? 'bg-[#facc15] text-[#161026] shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>
//                 {tab}
//               </button>
//             ))}
//           </div>

//           <div className="flex items-center gap-3">
//             {selectedIds.length > 0 && (
//               <div className="flex items-center gap-2 bg-indigo-600/20 border border-indigo-500/30 px-3 py-2 rounded-xl">
//                 <span className="text-xs font-bold text-indigo-300">{selectedIds.length} selected</span>
//                 <button onClick={() => setSelectedIds([])} className="text-gray-500 hover:text-white transition cursor-pointer"><X size={12} /></button>
//               </div>
//             )}

//             {/* Grid / List toggle */}
//             <div className="bg-[#161026] flex p-1 rounded-xl border border-gray-800">
//               <button onClick={() => setViewMode('grid')}
//                 className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}>
//                 <Grid size={16} />
//               </button>
//               <button onClick={() => setViewMode('list')}
//                 className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}>
//                 <List size={16} />
//               </button>
//             </div>

//             <select
//               onChange={e => {
//                 const v = e.target.value;
//                 if (v === 'faces')     dispatch(fetchAllPhotos()); // swap to fetchPhotosWithFaces if preferred
//                 else if (v === 'all')  dispatch(clearDisplayedPhotos());
//               }}
//               className="bg-[#1c1430] border border-gray-800 text-xs font-bold text-yellow-500 px-3 py-2.5 rounded-xl outline-none cursor-pointer hover:border-indigo-500/50 transition">
//               <option value="all">All ({allPhotos.length})</option>
//               <option value="faces">With Faces ({allPhotos.filter(p => (p.faceCount ?? p.faces ?? 0) > 0).length})</option>
//             </select>
//           </div>
//         </div>

//         {/* ── BULK ACTIONS ───────────────────────────────────────── */}
//         {selectedIds.length > 0 && (
//           <div className="flex items-center gap-3 mb-6 p-3 bg-indigo-600/10 border border-indigo-500/30 rounded-2xl">
//             <button onClick={toggleAll} className="text-xs font-bold text-indigo-300 hover:text-white transition cursor-pointer">
//               {selectedIds.length === photos.length ? 'Deselect All' : 'Select All'}
//             </button>
//             <div className="w-px h-4 bg-gray-700" />
//             <button className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition cursor-pointer">
//               <Download size={13} /> Download
//             </button>
//             <button className="flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:text-purple-300 transition cursor-pointer">
//               <Share2 size={13} /> Share
//             </button>
//             <button
//               onClick={handleBulkDelete}
//               className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 transition cursor-pointer ml-auto">
//               <Trash2 size={13} /> Delete ({selectedIds.length})
//             </button>
//           </div>
//         )}

//         {/* ── LOADING STATE ──────────────────────────────────────── */}
//         {loading && photos.length === 0 && <GridSkeleton />}

//         {/* ── LOADING OVERLAY (refetching) ───────────────────────── */}
//         {loading && photos.length > 0 && (
//           <div className="flex items-center gap-2 mb-4 text-xs text-indigo-400">
//             <Loader2 size={14} className="animate-spin" /> Refreshing…
//           </div>
//         )}

//         {/* ── EMPTY STATE ────────────────────────────────────────── */}
//         {!loading && photos.length === 0 && (
//           <div className="flex flex-col items-center justify-center py-24 text-center">
//             <ImageIcon size={48} className="text-gray-700 mb-4" />
//             <p className="text-gray-400 font-semibold">No photos match your filters</p>
//             <button
//               onClick={() => {
//                 setSearchQuery('');
//                 setActiveTab('All');
//                 setFilters({ score: 'Any', faces: 'Any', sort: 'Date (Newest)' });
//                 dispatch(fetchAllPhotos());
//               }}
//               className="mt-4 text-xs text-indigo-400 hover:text-indigo-300 transition underline underline-offset-4 cursor-pointer">
//               Clear all filters
//             </button>
//           </div>
//         )}

//         {/* ── GRID VIEW ──────────────────────────────────────────── */}
//         {!loading && viewMode === 'grid' && photos.length > 0 && (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {photos.map(photo => (
//               <GridCard
//                 key={photo.id}
//                 photo={photo}
//                 selected={selectedIds.includes(photo.id)}
//                 onSelect={toggleSelect}
//                 onDelete={(id) => setDeleteTarget(id)}
//                 onToggleStar={onToggleStar}
//               />
//             ))}
//           </div>
//         )}

//         {/* ── LIST VIEW ──────────────────────────────────────────── */}
//         {!loading && viewMode === 'list' && photos.length > 0 && (
//           <div className="bg-[#161026] border border-gray-800/70 rounded-2xl overflow-hidden">
//             {/* List header */}
//             <div className="grid grid-cols-[2rem_3.5rem_1fr_120px_80px_90px_80px_90px_2.5rem] gap-4 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-gray-800">
//               <button onClick={toggleAll}
//                 className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer
//                   ${selectedIds.length === photos.length && photos.length > 0 ? 'bg-indigo-600 border-indigo-500' : 'border-gray-700 hover:border-indigo-400'}`}>
//                 {selectedIds.length === photos.length && photos.length > 0 && <Check size={10} className="text-white" />}
//               </button>
//               <span>Preview</span><span>Name</span><span>Scene</span>
//               <span>Faces</span><span>Quality</span><span>Size</span>
//               <span>Date</span><span />
//             </div>

//             {photos.map(photo => (
//               <ListRow
//                 key={photo.id}
//                 photo={photo}
//                 selected={selectedIds.includes(photo.id)}
//                 onSelect={toggleSelect}
//                 onDelete={(id) => setDeleteTarget(id)}
//                 onToggleStar={onToggleStar}
//               />
//             ))}
//           </div>
//         )}

//         {/* ── DELETE CONFIRMATION MODAL ──────────────────────────── */}
//         {deleteTarget && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center"
//             style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.6)' }}>
//             <div className="bg-[#1c1430] border border-gray-700/50 rounded-2xl p-8 w-full max-w-sm mx-4 shadow-2xl">
//               <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
//                 <Trash2 size={24} className="text-red-400" />
//               </div>
//               <h2 className="text-white text-xl font-bold text-center mb-2">Delete Photo?</h2>
//               <p className="text-gray-400 text-sm text-center leading-relaxed mb-8">
//                 This action cannot be undone. The photo will be permanently removed.
//               </p>
//               <div className="flex gap-3">
//                 <button onClick={() => setDeleteTarget(null)}
//                   className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-300 text-sm font-medium hover:bg-gray-800/50 transition cursor-pointer">
//                   Cancel
//                 </button>
//                 <button onClick={() => handleDelete(deleteTarget)}
//                   className="flex-1 py-3 rounded-xl bg-red-500/90 hover:bg-red-500 text-white text-sm font-bold transition cursor-pointer">
//                   Yes, Delete
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//       </main>

//       <style jsx global>{`
//         .custom-scrollbar::-webkit-scrollbar { width: 5px; }
//         .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
//         .custom-scrollbar::-webkit-scrollbar-thumb { background: #2d2a3d; border-radius: 10px; }
//         .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4f46e5; }
//         @keyframes animate-in { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
//         .animate-in { animation: animate-in 0.18s ease-out both; }
//       `}</style>
//     </div>
//   );
// }