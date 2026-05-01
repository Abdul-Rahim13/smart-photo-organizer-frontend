"use client"

import { useState } from "react"
import {
  Sparkles,
  Folder,
  Users,
  Image as ImageIcon,
  Calendar,
  Wand2,
  ChevronRight
} from "lucide-react"

// ─── MOCK DATA ─────────────────────────────────────────
const suggestions = [
  {
    id: 1,
    title: "New Face Detected",
    desc: "15 photos with unrecognized face",
    action: "Create Album",
    image: "/images/user.jpg"
  },
  {
    id: 2,
    title: "Weekend Photos",
    desc: "42 photos from last weekend",
    action: "Auto-Generate",
    image: "/images/weekend.jpg"
  },
  {
    id: 3,
    title: "Food Photography",
    desc: "23 food photos detected",
    action: "Create Album",
    image: "/images/food.jpg"
  }
]

// ─── SMART ALBUMS DATA ─────────────────────────────────
const smartAlbums = [
  {
    id: 1,
    title: "Person 1",
    photos: 47,
    type: "Face",
    confidence: "95%",
    image: "/images/p1.jpg",
    updated: "2 hours ago"
  },
  {
    id: 2,
    title: "Person 2",
    photos: 32,
    type: "Face",
    confidence: "92%",
    image: "/images/p2.jpg",
    updated: "5 hours ago"
  },
  {
    id: 3,
    title: "Person 3",
    photos: 28,
    type: "Face",
    confidence: "88%",
    image: "/images/p3.jpg",
    updated: "1 day ago"
  },
  {
    id: 4,
    title: "Outdoor Adventures",
    photos: 156,
    type: "Scene",
    image: "/images/outdoor.jpg",
    updated: "3 hours ago"
  },
  {
    id: 5,
    title: "Modern Interiors",
    photos: 89,
    type: "Scene",
    image: "/images/interior.jpg",
    updated: "6 hours ago"
  },
  {
    id: 6,
    title: "City Life",
    photos: 67,
    type: "Scene",
    image: "/images/city.jpg",
    updated: "1 day ago"
  },
  {
    id: 7,
    title: "Forest Collection",
    photos: 134,
    type: "Scene",
    image: "/images/forest.jpg",
    updated: "2 days ago"
  },
  {
    id: 8,
    title: "Beach Moments",
    photos: 234,
    type: "Scene",
    image: "/images/beach.jpg",
    updated: "3 days ago"
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

// ─── SUGGESTION CARD ───────────────────────────────────
function SuggestionCard({ item }) {
  return (
    <div className="bg-[#1c1430] border border-gray-800 rounded-xl p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <img src={item.image} className="w-10 h-10 rounded-lg object-cover" />
        <div>
          <h4 className="text-sm font-semibold text-white">{item.title}</h4>
          <p className="text-xs text-gray-500">{item.desc}</p>
        </div>
      </div>
      <button className="text-xs font-semibold text-yellow-400 hover:underline">
        + {item.action}
      </button>
    </div>
  )
}

// ─── FILTER BUTTON ─────────────────────────────────────
function FilterBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-xs font-semibold transition
        ${active
          ? "bg-yellow-500 text-black"
          : "bg-[#161026] border border-gray-800 text-gray-400 hover:text-white"}`}
    >
      {label}
    </button>
  )
}

// ─── SMART ALBUM CARD ──────────────────────────────────
function AlbumCard({ item }) {
  return (
    <div className="bg-[#161026] border border-gray-800/60 rounded-xl overflow-hidden hover:border-indigo-500/40 transition">

      {/* IMAGE */}
      <div className="h-40 relative">
        <img src={item.image} className="w-full h-full object-cover opacity-80" />

        {/* TYPE BADGE */}
        <div className="absolute top-2 left-2 bg-black/60 text-[10px] px-2 py-1 rounded text-white">
          {item.type}
        </div>

        {/* PHOTO COUNT */}
        <div className="absolute top-2 right-2 bg-black/60 text-[10px] px-2 py-1 rounded text-white">
          {item.photos} photos
        </div>

        {/* AI GENERATED */}
        <div className="absolute bottom-2 left-2 bg-yellow-500/90 text-black text-[10px] px-2 py-1 rounded font-semibold">
          AI Generated
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-sm font-semibold text-white">{item.title}</h3>
          <ChevronRight size={14} className="text-gray-500" />
        </div>

        {item.confidence && (
          <p className="text-[10px] text-green-400 mb-1">
            Confidence {item.confidence}
          </p>
        )}

        <p className="text-[10px] text-gray-500">
          Updated {item.updated}
        </p>
      </div>
    </div>
  )
}

// ─── MAIN PAGE ─────────────────────────────────────────
export default function SmartAlbumsPage() {
  const [activeFilter, setActiveFilter] = useState("All Albums")

  const filters = [
    "All Albums",
    "By Faces",
    "By Scenes",
    "By Events",
    "By Quality"
  ]

  return (
    <div className="min-h-screen bg-[#0f0a19] text-white p-6 md:p-8">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={18} className="text-yellow-400" />
            <h1 className="text-xl font-bold">Smart Albums</h1>
          </div>
          <p className="text-xs text-gray-500">
            AI-powered organization based on faces, scenes, events, and quality
          </p>
        </div>

        <button className="flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded-lg text-xs font-semibold">
          <Wand2 size={14} />
          Auto-Generate Albums
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Folder} label="Total Smart Albums" value="12" color="bg-yellow-500/20 text-yellow-400" />
        <StatCard icon={Users} label="Face Albums" value="3" color="bg-blue-500/20 text-blue-400" />
        <StatCard icon={ImageIcon} label="Scene Albums" value="4" color="bg-green-500/20 text-green-400" />
        <StatCard icon={Calendar} label="Event Albums" value="3" color="bg-purple-500/20 text-purple-400" />
      </div>

      {/* AI SUGGESTIONS */}
      <div className="bg-[#161026] border border-gray-800/60 rounded-xl p-5 mb-6">
        <div className="flex justify-between mb-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Sparkles size={14} className="text-yellow-400" />
            AI Suggestions
          </h3>
          <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
            3 New
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {suggestions.map(item => (
            <SuggestionCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map(f => (
          <FilterBtn
            key={f}
            label={f}
            active={activeFilter === f}
            onClick={() => setActiveFilter(f)}
          />
        ))}
      </div>

      {/* SMART ALBUMS GRID */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-semibold text-gray-300">
            All Smart Albums (12)
          </h2>
          <span className="text-xs text-gray-500">Sort by</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {smartAlbums.map(item => (
            <AlbumCard key={item.id} item={item} />
          ))}
        </div>
      </div>

    </div>
  )
}