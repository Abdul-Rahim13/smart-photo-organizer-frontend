"use client"

import { useState } from "react"
import {
  Folder,
  Heart,
  Image as ImageIcon,
  Share2,
  Search,
  Plus
} from "lucide-react"

// ─── MOCK DATA ─────────────────────────────────────────
const albums = [
  {
    id: 1,
    title: "Vacation 2024",
    photos: 156,
    type: "Private",
    image: "/images/album1.jpg"
  },
  {
    id: 2,
    title: "Wedding Memories",
    photos: 234,
    type: "Shared",
    image: "/images/album2.jpg"
  },
  {
    id: 3,
    title: "Pet Photos",
    photos: 123,
    type: "Shared",
    image: "/images/album3.jpg"
  }
]

// ─── STAT CARD ─────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-[#161026] border border-gray-800/60 rounded-xl p-5 flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <h3 className="text-xl font-bold text-white">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={18} />
      </div>
    </div>
  )
}

// ─── ALBUM CARD ────────────────────────────────────────
function AlbumCard({ album }) {
  return (
    <div className="bg-[#161026] border border-gray-800/60 rounded-xl overflow-hidden hover:border-indigo-500/40 transition">

      {/* Image */}
      <div className="h-40 bg-gray-800 relative">
        {/* Replace with next/image if needed */}
        <img
          src={album.image}
          alt={album.title}
          className="w-full h-full object-cover opacity-80"
        />

        {/* Badge */}
        <div className="absolute top-3 left-3 bg-black/60 text-[10px] px-2 py-1 rounded text-white">
          {album.type}
        </div>

        {/* Favorite */}
        <button className="absolute top-3 right-3 bg-black/60 p-1.5 rounded text-white">
          <Heart size={14} />
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-white mb-1">
          {album.title}
        </h3>
        <p className="text-xs text-gray-500">
          {album.photos} photos
        </p>
      </div>
    </div>
  )
}

// ─── MAIN PAGE ─────────────────────────────────────────
export default function AlbumsPage() {
  const [search, setSearch] = useState("")

  const filtered = albums.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#0f0a19] text-white p-6 md:p-8">

      {/* ── HEADER ───────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">

        <div>
          <h1 className="text-xl font-bold">My Albums</h1>
          <p className="text-xs text-gray-500">
            Create and organize your custom photo collections
          </p>
        </div>

        <button className="flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90">
          <Plus size={16} />
          Create Album
        </button>
      </div>

      {/* ── STATS ───────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Folder} label="Total Albums" value="6" color="bg-yellow-500/20 text-yellow-400" />
        <StatCard icon={Heart} label="Favorites" value="3" color="bg-red-500/20 text-red-400" />
        <StatCard icon={ImageIcon} label="Total Photos" value="714" color="bg-blue-500/20 text-blue-400" />
        <StatCard icon={Share2} label="Shared Albums" value="2" color="bg-green-500/20 text-green-400" />
      </div>

      {/* ── SEARCH ──────────────────────────── */}
      <div className="mb-6 flex items-center justify-between gap-3">

        <div className="relative w-full max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search albums..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#161026] border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex gap-2">
          <button className="p-2 bg-[#161026] border border-gray-800 rounded-lg">
            ▦
          </button>
          <button className="p-2 bg-[#161026] border border-gray-800 rounded-lg">
            ☰
          </button>
        </div>
      </div>

      {/* ── FAVORITE SECTION ────────────────── */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">
          Favorite Albums
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map(album => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      </div>

    </div>
  )
}