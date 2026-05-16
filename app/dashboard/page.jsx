"use client"

import React from 'react';
import { 
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { 
  Image as ImageIcon, Upload, AlertCircle, CheckCircle, Star, Plus, Wand2, 
  LayoutGrid, Clock, FolderHeart, HardDrive, Users
} from 'lucide-react';
import TopBar from '../../components/TopBar';

// --- MOCK DATA ---
const uploadData = [
  { name: 'Jan', val: 65 }, { name: 'Feb', val: 78 }, { name: 'Mar', val: 90 }, 
  { name: 'Apr', val: 85 }, { name: 'May', val: 95 }, { name: 'Jun', val: 115 }
];
const miniBarData = [
  { v: 40 }, { v: 70 }, { v: 45 }, { v: 90 }, { v: 65 }, { v: 80 }
];
const miniPieData = [
  { value: 25, color: '#ef4444' }, 
  { value: 75, color: '#374151' }, 
];
const recentPhotos = [
  { id: 1, title: "Beach Sunset",      cat: "Outdoor", score: "95%", color: "bg-blue-900/20"    },
  { id: 2, title: "Family Gathering",  cat: "Indoor",  score: "90%", color: "bg-orange-900/20"  },
  { id: 3, title: "City Lights",       cat: "Urban",   score: "85%", color: "bg-purple-900/20"  },
  { id: 4, title: "Mountain View",     cat: "Outdoor", score: "92%", color: "bg-emerald-900/20" },
];

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-[#0f0a19] text-gray-100 overflow-hidden">

      {/* SCROLLABLE MAIN CONTENT */}
      <main className="flex-1 h-full overflow-y-auto custom-scrollbar p-8">

        {/* ── TOP BAR ─────────────────────────────────────────────── */}
        <TopBar
          title="Dashboard"
          showStatus={true}
          statusText="System Active"
          searchPlaceholder="Search photos, albums, or tags..."
        />

        {/* WELCOME */}
        <h1 className="text-2xl font-bold mb-2">Welcome Back! 👋</h1>
        <p className="text-gray-400 text-sm mb-8 font-light">Here's what's happening with your photos today.</p>

        {/* TOP STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#161026] border border-gray-800 rounded-3xl p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Total Photos</p>
                <h2 className="text-3xl font-black">120</h2>
                <p className="text-[10px] mt-1 text-green-500 font-medium">↑ 12% vs last week</p>
              </div>
              <div className="w-16 h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={uploadData.slice(2)}>
                    <Area type="monotone" dataKey="val" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-[#161026] border border-gray-800 rounded-3xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Blurry Photos</p>
                <h2 className="text-3xl font-black">5</h2>
                <p className="text-[10px] mt-1 text-red-500 font-medium">↓ 25% vs last week</p>
              </div>
              <div className="w-14 h-14 relative shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={miniPieData} innerRadius={18} outerRadius={25} paddingAngle={0} dataKey="value" stroke="none" startAngle={90} endAngle={-270}>
                      {miniPieData.map((e, i) => <Cell key={i} fill={e.color}/>)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <AlertCircle size={12} className="text-red-500"/>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#161026] border border-gray-800 rounded-3xl p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">AI Processed</p>
                <h2 className="text-3xl font-black">115</h2>
                <p className="text-[10px] mt-1 text-green-500 font-medium">↑ 8% vs last week</p>
              </div>
              <div className="w-16 h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={miniBarData}>
                    <Bar dataKey="v" fill="#10b981" radius={[2, 2, 0, 0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="col-span-1 lg:col-span-2 space-y-6">
            <div className="bg-[#161026] border border-gray-800 rounded-3xl p-6">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-bold">Upload Activity</h3>
                <div className="flex bg-black/20 p-1 rounded-lg">
                  <button className="px-3 py-1 text-[10px] bg-indigo-600 rounded-md cursor-pointer">Week</button>
                  <button className="px-3 py-1 text-[10px] text-gray-500 hover:text-gray-300 transition cursor-pointer">Month</button>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={uploadData}>
                    <defs>
                      <linearGradient id="yellowGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#facc15" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#facc15" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={{ backgroundColor: '#1c1430', border: 'none', borderRadius: '12px' }}/>
                    <Area type="monotone" dataKey="val" stroke="#facc15" strokeWidth={3} fill="url(#yellowGrad)"/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MiniStat label="Faces Detected" val="47"     icon={Users}      color="text-indigo-400" bg="bg-indigo-400/10"/>
              <MiniStat label="Smart Albums"   val="12"     icon={LayoutGrid}  color="text-green-400"  bg="bg-green-400/10"/>
              <MiniStat label="Avg Quality"    val="92%"    icon={Star}        color="text-yellow-400" bg="bg-yellow-400/10"/>
              <MiniStat label="Storage Used"   val="2.4 GB" icon={HardDrive}   color="text-orange-400" bg="bg-orange-400/10"/>
            </div>
          </div>

          <div className="bg-[#161026] border border-gray-800 rounded-3xl p-6 flex flex-col">
            <h3 className="font-bold mb-6 flex items-center gap-2 text-white">
              <Clock size={16} className="text-yellow-500"/> Recent Activity
            </h3>
            <div className="space-y-5 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-96">
              <LogItem text="12 photos uploaded"    time="5m ago"  icon={Upload}       color="bg-indigo-500/20 text-indigo-400"/>
              <LogItem text="AI analysis complete"  time="10m ago" icon={CheckCircle}  color="bg-green-500/20 text-green-400"/>
              <LogItem text='New Album "Vacation"'  time="1h ago"  icon={FolderHeart}  color="bg-purple-500/20 text-purple-400"/>
              <LogItem text="Cleanup completed"     time="2h ago"  icon={Users}        color="bg-red-500/20 text-red-400"/>
              <LogItem text="Auto-enhanced 8 pics"  time="3h ago"  icon={Wand2}        color="bg-yellow-500/20 text-yellow-400"/>
            </div>
            <button className="w-full mt-6 py-3 border border-gray-800 text-[10px] font-bold text-yellow-500 rounded-xl uppercase tracking-widest hover:bg-yellow-500/5 transition cursor-pointer">
              View All Logs →
            </button>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <ActionButton icon={Plus}        label="New Upload"    primary />
          <ActionButton icon={FolderHeart} label="Create Album" />
          <ActionButton icon={Users}       label="Review Trash" />
          <ActionButton icon={Wand2}       label="AI Optimize"  />
        </div>

        {/* RECENT PHOTOS */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl text-white">Recent Library</h3>
            <button className="text-xs text-yellow-500 hover:underline font-bold uppercase tracking-wider cursor-pointer">
              View All Gallery →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentPhotos.map(p => (
              <div key={p.id} className="bg-[#161026] rounded-2xl overflow-hidden border border-gray-800 cursor-pointer hover:border-indigo-500 transition-all group">
                <div className={`h-40 ${p.color} relative flex items-center justify-center`}>
                  <ImageIcon className="opacity-10 text-white" size={48}/>
                  <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-green-400 border border-green-500/30">
                    {p.score} AI
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"/>
                  <div className="absolute bottom-3 left-3">
                    <p className="text-xs font-bold text-white">{p.title}</p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1 font-medium">
                      <span className="w-1 h-1 bg-indigo-500 rounded-full"/> {p.cat}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2d2a3d; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4f46e5; }
      `}</style>
    </div>
  );
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function MiniStat({ label, val, icon: Icon, color, bg }) {
  return (
    <div className="bg-[#161026] border border-gray-800 rounded-2xl p-4 flex items-center gap-4 hover:bg-[#1c1430] transition cursor-default">
      <div className={`${bg} ${color} p-2.5 rounded-xl shrink-0`}><Icon size={18}/></div>
      <div className="overflow-hidden">
        <p className="text-[8px] text-gray-500 uppercase tracking-widest mb-0.5 whitespace-nowrap">{label}</p>
        <p className="text-lg font-bold leading-none">{val}</p>
      </div>
    </div>
  );
}

function LogItem({ text, time, icon: Icon, color }) {
  return (
    <div className="flex gap-4">
      <div className={`${color} p-2 rounded-lg h-fit shrink-0`}><Icon size={14}/></div>
      <div className="min-w-0">
        <p className="text-xs font-bold leading-tight truncate text-white">{text}</p>
        <p className="text-[9px] text-gray-500 mt-1">{time}</p>
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, primary = false }) {
  return (
    <button className={`cursor-pointer flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border transition-all hover:-translate-y-1 active:scale-95
      ${primary
        ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30'
        : 'bg-[#1c1430] border-gray-800 hover:bg-gray-800 text-gray-400'
      }`}>
      <Icon size={24} className={primary ? 'text-indigo-400' : 'text-gray-400'}/>
      <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
    </button>
  );
}