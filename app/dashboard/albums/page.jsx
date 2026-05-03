"use client"

import React, { useState } from 'react';
import {
  FolderOpen, Plus, Heart, Info, Search, Image as ImageIcon,
  Layers, Filter, Lock, Globe, Users, Star, MoreVertical,
  ChevronRight, Trash2, Edit2, Share2, Download, Grid3X3,
  Clock, SortAsc, CheckCircle, FolderPlus, X
} from 'lucide-react';

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const albumsData = [
  {
    id: 1, name: "Vacation 2024", description: "Beautiful moments from the celebration",
    photos: 156, type: "private", favorite: true,
    thumb: "bg-amber-800/60", thumbAccent: "bg-orange-700/40",
    cover: "🏖️", lastModified: "2 days ago", tags: ["travel", "beach"],
  },
  {
    id: 2, name: "Wedding Memories", description: "Our special day captured forever",
    photos: 234, type: "shared", favorite: true,
    thumb: "bg-rose-900/50", thumbAccent: "bg-pink-800/40",
    cover: "💒", lastModified: "1 week ago", tags: ["wedding", "family"],
  },
  {
    id: 3, name: "Pet Photos", description: "Adventures with our furry friends",
    photos: 123, type: "shared", favorite: true,
    thumb: "bg-slate-700/60", thumbAccent: "bg-gray-600/40",
    cover: "🐾", lastModified: "3 days ago", tags: ["pets", "fun"],
  },
  {
    id: 4, name: "Summer BBQ", description: "Backyard cookouts and good vibes",
    photos: 88, type: "private", favorite: false,
    thumb: "bg-orange-900/50", thumbAccent: "bg-red-800/40",
    cover: "🔥", lastModified: "5 days ago", tags: ["family", "food"],
  },
  {
    id: 5, name: "City Trips", description: "Exploring urban landscapes",
    photos: 201, type: "private", favorite: false,
    thumb: "bg-cyan-900/50", thumbAccent: "bg-teal-800/40",
    cover: "🌆", lastModified: "2 weeks ago", tags: ["travel", "city"],
  },
  {
    id: 6, name: "Nature Walks", description: "Peaceful escapes into the wild",
    photos: 112, type: "shared", favorite: false,
    thumb: "bg-emerald-900/50", thumbAccent: "bg-green-800/40",
    cover: "🌿", lastModified: "1 month ago", tags: ["nature", "outdoors"],
  },
];

const typeConfig = {
  private: { label: "Private", icon: Lock,  color: "text-gray-300", bg: "bg-gray-800/80 border-gray-600/40" },
  shared:  { label: "Shared",  icon: Globe, color: "text-blue-300",  bg: "bg-blue-900/60 border-blue-500/30" },
  team:    { label: "Team",    icon: Users, color: "text-purple-300",bg: "bg-purple-900/60 border-purple-500/30" },
};

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="bg-[#161026] border border-gray-800/70 rounded-2xl p-5 flex items-center gap-4 hover:border-indigo-500/30 transition-all duration-300 cursor-default">
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

// ─── ALBUM CARD ──────────────────────────────────────────────────────────────
function AlbumCard({ album, onFavorite, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered]   = useState(false);
  const cfg = typeConfig[album.type];
  const TypeIcon = cfg.icon;

  return (
    <div
      className="bg-[#161026] border border-gray-800/70 rounded-2xl overflow-hidden hover:border-indigo-500/40 transition-all duration-300 group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMenuOpen(false); }}
    >
      {/* Thumbnail */}
      <div className={`h-44 ${album.thumb} relative flex items-center justify-center cursor-pointer overflow-hidden`}>
        {/* Decorative inner shape */}
        <div className={`absolute inset-0 ${album.thumbAccent}`} style={{ clipPath: "ellipse(70% 60% at 50% 110%)" }} />

        {/* Emoji cover art */}
        <span className="text-6xl select-none z-10 drop-shadow-lg transition-transform duration-300 group-hover:scale-110">
          {album.cover}
        </span>

        {/* Badge - type */}
        <div className={`absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-bold ${cfg.color} ${cfg.bg} backdrop-blur-sm z-20`}>
          <TypeIcon size={9} />
          {cfg.label}
        </div>

        {/* Top-right actions */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
          <button
            onClick={() => onFavorite(album.id)}
            className={`w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm border transition-all cursor-pointer
              ${album.favorite
                ? 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30'
                : 'bg-black/30 border-white/10 text-gray-400 hover:text-red-400 hover:border-red-400/30'}`}
          >
            <Heart size={12} fill={album.favorite ? "currentColor" : "none"} />
          </button>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(p => !p)}
              className="w-7 h-7 rounded-full bg-black/30 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500/40 backdrop-blur-sm transition-all cursor-pointer"
            >
              <MoreVertical size={12} />
            </button>

            {/* Dropdown menu */}
            {menuOpen && (
              <div className="absolute right-0 top-9 w-40 bg-[#1c1430] border border-gray-700/60 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                {[
                  { icon: Edit2,    label: "Rename",    color: "text-gray-300" },
                  { icon: Share2,   label: "Share",     color: "text-blue-400" },
                  { icon: Download, label: "Download",   color: "text-green-400" },
                  { icon: Trash2,   label: "Delete",     color: "text-red-400", action: () => onDelete(album.id) },
                ].map(({ icon: Icon, label, color, action }) => (
                  <button
                    key={label}
                    onClick={action}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium ${color} hover:bg-white/5 transition cursor-pointer`}
                  >
                    <Icon size={12} /> {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Photo count pill at bottom */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/50 border border-white/10 px-2.5 py-1 rounded-full backdrop-blur-sm z-20">
          <ImageIcon size={10} className="text-gray-300" />
          <span className="text-[10px] font-black text-white">{album.photos} photos</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 cursor-pointer">
        <p className="text-sm font-bold text-white mb-1 truncate group-hover:text-indigo-300 transition-colors">{album.name}</p>
        <p className="text-[11px] text-gray-500 mb-3 truncate">{album.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock size={10} className="text-gray-600" />
            <span className="text-[10px] text-gray-600">{album.lastModified}</span>
          </div>
          <div className="flex items-center gap-1">
            {album.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-[9px] font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ALBUM ROW (list view) ────────────────────────────────────────────────────
function AlbumRow({ album, onFavorite, onDelete }) {
  const cfg = typeConfig[album.type];
  const TypeIcon = cfg.icon;

  return (
    <div className="grid grid-cols-[2.5rem_1fr_110px_100px_110px_100px_2.5rem] gap-4 px-5 py-4 items-center border-b border-gray-800/40 hover:bg-white/2 transition group cursor-default">
      {/* Thumb */}
      <div className={`w-9 h-9 rounded-xl ${album.thumb} flex items-center justify-center shrink-0 text-lg`}>
        {album.cover}
      </div>

      {/* Name + desc */}
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-100 truncate group-hover:text-indigo-300 transition-colors">{album.name}</p>
        <p className="text-[10px] text-gray-600 truncate">{album.description}</p>
      </div>

      {/* Type */}
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border w-fit text-[10px] font-bold ${cfg.color} ${cfg.bg}`}>
        <TypeIcon size={9} /> {cfg.label}
      </div>

      {/* Photos */}
      <div className="flex items-center gap-1.5">
        <ImageIcon size={11} className="text-gray-500" />
        <span className="text-xs font-bold text-gray-300">{album.photos}</span>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-1">
        {album.tags.slice(0, 1).map(t => (
          <span key={t} className="text-[9px] font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full">{t}</span>
        ))}
      </div>

      {/* Modified */}
      <span className="text-[10px] text-gray-600">{album.lastModified}</span>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={() => onFavorite(album.id)}
          className="cursor-pointer text-gray-600 hover:text-red-400 transition p-1"
        >
          <Heart size={13} fill={album.favorite ? "currentColor" : "none"} className={album.favorite ? "text-red-400" : ""} />
        </button>
        <button
          onClick={() => onDelete(album.id)}
          className="cursor-pointer text-gray-600 hover:text-red-400 transition p-1"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── CREATE ALBUM MODAL ───────────────────────────────────────────────────────
function CreateAlbumModal({ onClose, onCreate }) {
  const [name, setName]   = useState('');
  const [type, setType]   = useState('private');
  const [desc, setDesc]   = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate({ name: name.trim(), description: desc.trim(), type });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#161026] border border-gray-700/60 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/10 p-2 rounded-xl">
              <FolderPlus size={18} className="text-indigo-400" />
            </div>
            <h3 className="font-bold text-white">Create New Album</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Album Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Summer 2024"
              className="w-full bg-[#0f0a19] border border-gray-700/60 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/50 transition"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Description</label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Short description..."
              rows={3}
              className="w-full bg-[#0f0a19] border border-gray-700/60 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/50 transition resize-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Privacy</label>
            <div className="flex gap-2">
              {Object.entries(typeConfig).map(([key, val]) => {
                const TIcon = val.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setType(key)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer
                      ${type === key
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-[#0f0a19] border-gray-700/60 text-gray-400 hover:border-gray-500'}`}
                  >
                    <TIcon size={12} /> {val.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 text-xs font-bold hover:border-gray-500 hover:text-white transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition cursor-pointer"
          >
            Create Album
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function AlbumsPage() {
  const [albums, setAlbums]       = useState(albumsData);
  const [search, setSearch]       = useState('');
  const [viewMode, setViewMode]   = useState('grid');
  const [filter, setFilter]       = useState('All');
  const [sort, setSort]           = useState('name');
  const [showModal, setShowModal] = useState(false);

  const filters = ['All', 'Favorites', 'Private', 'Shared'];

  const handleFavorite = id =>
    setAlbums(prev => prev.map(a => a.id === id ? { ...a, favorite: !a.favorite } : a));

  const handleDelete = id =>
    setAlbums(prev => prev.filter(a => a.id !== id));

  const handleCreate = ({ name, description, type }) => {
    const emojis = ['📸', '🎨', '🌍', '🎉', '🏠', '🎵'];
    const colors = ['bg-violet-900/50', 'bg-rose-900/50', 'bg-teal-900/50', 'bg-amber-900/50'];
    setAlbums(prev => [
      {
        id: Date.now(), name, description, photos: 0, type, favorite: false,
        thumb: colors[Math.floor(Math.random() * colors.length)],
        thumbAccent: 'bg-white/5',
        cover: emojis[Math.floor(Math.random() * emojis.length)],
        lastModified: 'Just now', tags: [],
      },
      ...prev,
    ]);
  };

  const filtered = albums
    .filter(a => {
      if (filter === 'Favorites') return a.favorite;
      if (filter === 'Private')   return a.type === 'private';
      if (filter === 'Shared')    return a.type === 'shared';
      return true;
    })
    .filter(a =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === 'name')    return a.name.localeCompare(b.name);
      if (sort === 'photos')  return b.photos - a.photos;
      return 0;
    });

  const stats = {
    total:   albums.length,
    favs:    albums.filter(a => a.favorite).length,
    photos:  albums.reduce((s, a) => s + a.photos, 0),
    shared:  albums.filter(a => a.type === 'shared').length,
  };

  return (
    <div className="min-h-screen bg-[#0f0a19] text-gray-100 p-6 md:p-8">

      {/* Modal */}
      {showModal && (
        <CreateAlbumModal onClose={() => setShowModal(false)} onCreate={handleCreate} />
      )}

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-yellow-500/10 p-2 rounded-xl">
              <FolderOpen size={20} className="text-yellow-400" />
            </div>
            <h2 className="text-xl font-bold text-white">My Albums</h2>
          </div>
          <p className="text-xs text-gray-500 font-medium ml-1">Create and organize your custom photo collections</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer shadow-lg shadow-yellow-500/20"
        >
          <Plus size={15} /> Create Album
        </button>
      </header>

      {/* ── STAT CARDS ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Albums"  value={stats.total}                    icon={FolderOpen}   iconBg="bg-yellow-500/10"  iconColor="text-yellow-400" />
        <StatCard label="Favorites"     value={stats.favs}                     icon={Heart}        iconBg="bg-red-500/10"     iconColor="text-red-400"    />
        <StatCard label="Total Photos"  value={stats.photos.toLocaleString()}  icon={ImageIcon}    iconBg="bg-indigo-500/10"  iconColor="text-indigo-400" />
        <StatCard label="Shared Albums" value={stats.shared}                   icon={Share2}       iconBg="bg-blue-500/10"    iconColor="text-blue-400"   />
      </div>

      {/* ── SEARCH + CONTROLS ───────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-55">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search albums..."
            className="w-full bg-[#161026] border border-gray-800/70 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-indigo-500/50 transition"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition cursor-pointer">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex bg-[#161026] border border-gray-800 p-1 rounded-xl gap-1">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer
                ${filter === f ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 bg-[#161026] border border-gray-800 px-3 py-2 rounded-xl">
          <SortAsc size={13} className="text-gray-500" />
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="bg-transparent text-[11px] font-bold text-gray-400 outline-none cursor-pointer"
          >
            <option value="name">Name</option>
            <option value="photos">Photos</option>
          </select>
        </div>

        {/* View toggle */}
        <div className="flex bg-[#161026] border border-gray-800 p-1 rounded-xl">
          <button onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Grid3X3 size={14} />
          </button>
          <button onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Filter size={14} />
          </button>
        </div>
      </div>

      {/* ── FAVORITE ALBUMS SECTION ─────────────────────────────────────── */}
      {filter === 'All' && !search && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Heart size={15} className="text-red-400" fill="currentColor" /> Favorite Albums
            </h3>
            <button
              onClick={() => setFilter('Favorites')}
              className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
            >
              See all <ChevronRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {albums.filter(a => a.favorite).map(album => (
              <AlbumCard key={album.id} album={album} onFavorite={handleFavorite} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {/* ── ALL ALBUMS SECTION ──────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            <FolderOpen size={15} className="text-yellow-400" />
            {filter === 'All' ? 'All Albums' : `${filter} Albums`}
            <span className="text-[10px] font-bold text-gray-600 bg-gray-800/60 border border-gray-700/40 px-2 py-0.5 rounded-full">
              {filtered.length}
            </span>
          </h3>
        </div>

        {/* Grid */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(album => (
              <AlbumCard key={album.id} album={album} onFavorite={handleFavorite} onDelete={handleDelete} />
            ))}
            {filtered.length === 0 && <EmptyState onReset={() => { setSearch(''); setFilter('All'); }} />}
          </div>
        )}

        {/* List */}
        {viewMode === 'list' && (
          <div className="bg-[#161026] border border-gray-800/70 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[2.5rem_1fr_110px_100px_110px_100px_2.5rem] gap-4 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-gray-800">
              <span />
              <span>Name</span>
              <span>Type</span>
              <span>Photos</span>
              <span>Tags</span>
              <span>Modified</span>
              <span />
            </div>
            {filtered.map(album => (
              <AlbumRow key={album.id} album={album} onFavorite={handleFavorite} onDelete={handleDelete} />
            ))}
            {filtered.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-gray-500 text-sm font-semibold">No albums found</p>
                <p className="text-gray-600 text-xs mt-1">Try a different filter or search</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ onReset }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <FolderOpen size={40} className="text-gray-700 mb-3" />
      <p className="text-gray-400 font-semibold text-sm">No albums found</p>
      <p className="text-gray-600 text-xs mt-1 mb-4">Try a different filter or search term</p>
      <button
        onClick={onReset}
        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-2 cursor-pointer transition"
      >
        Clear filters
      </button>
    </div>
  );
}