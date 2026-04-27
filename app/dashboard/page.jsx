"use client"

import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  LayoutDashboard, Image as ImageIcon, Upload, Activity, 
  Layers, Trash2, Cpu, Settings, Search, Bell, User,
  AlertCircle, CheckCircle, Database, Star, Wand2,
  Users, FolderHeart, ShieldCheck, HardDrive, Clock, Plus
} from 'lucide-react';

// EXACT DATA FROM YOUR IMAGES
const uploadData = [
  { day: 'Mon', value: 45 }, { day: 'Tue', value: 52 }, { day: 'Wed', value: 48 }, 
  { day: 'Thu', value: 70 }, { day: 'Fri', value: 65 }, { day: 'Sat', value: 58 }, { day: 'Sun', value: 48 }
];

const qualityData = [
  { name: 'Excellent', value: 45, color: '#10b981' },
  { name: 'Good', value: 30, color: '#f59e0b' },
  { name: 'Poor', value: 15, color: '#ef4444' },
  { name: 'Blurry', value: 10, color: '#6b7280' },
];

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-[#0f0a19] text-gray-100">
      
      {/* SIDEBAR - Exactly like image */}
      <aside className="w-64 bg-[#161026] border-r border-gray-800 flex flex-col hidden lg:flex">
        <div className="p-6 flex items-center gap-2">
          <div className="bg-yellow-500 text-black px-1.5 py-0.5 rounded font-bold text-sm">AI</div>
          <span className="text-xl font-bold tracking-tight">Smart Photo</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <NavItem icon={LayoutDashboard} label="Dashboard" active />
          <NavItem icon={ImageIcon} label="Gallery" />
          <NavItem icon={Upload} label="Upload" />
          <NavItem icon={Activity} label="Processing" />
          <NavItem icon={Layers} label="Albums" />
          <NavItem icon={Trash2} label="Trash" />
          <NavItem icon={Cpu} label="AI Models" />
          <NavItem icon={Settings} label="Settings" />
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-8">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Welcome Back, Abdul! 👋</h1>
            <p className="text-gray-400 text-sm">Monitor your AI photo analysis and library stats.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Search photos..." 
                className="bg-[#1c1430] border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-sm w-64 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button className="bg-[#1c1430] p-2 rounded-xl border border-gray-800 text-gray-400"><Bell size={20}/></button>
            <div className="flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded-xl font-medium">
              <User size={18}/> Abdul
            </div>
          </div>
        </header>

        {/* AI PROGRESS CARD - Full Width */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-6 mb-8 relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md"><Cpu size={24}/></div>
              <div>
                <h3 className="text-lg font-bold">AI Engine Processing</h3>
                <p className="text-indigo-100 text-xs font-light">Analyzing lighting, blur, and facial features in real-time.</p>
              </div>
            </div>
            <div className="text-3xl font-black">67%</div>
          </div>
          <div className="w-full bg-black/20 h-3 rounded-full overflow-hidden">
            <div className="bg-white h-full transition-all duration-1000 w-[67%] shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
          </div>
        </div>

        {/* TOP STATS - 3 COLUMN GRID */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <MainStat title="Total Library" value="1,248" sub="Photos" icon={ImageIcon} trend="+12%" />
          <MainStat title="Processing" value="42" sub="In Queue" icon={Activity} trend="Active" color="text-yellow-500" />
          <MainStat title="AI Cleaned" value="156" sub="Duplicates" icon={ShieldCheck} trend="-24%" color="text-green-500" />
        </div>

        {/* 2-COLUMN SECTION: CHART & LIST */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* UPLOAD ACTIVITY CHART */}
          <div className="lg:col-span-2 bg-[#161026] border border-gray-800 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold">Upload Activity</h3>
              <select className="bg-[#1c1430] text-xs border border-gray-800 rounded-lg px-2 py-1 outline-none">
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={uploadData}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                  <Tooltip contentStyle={{backgroundColor: '#1c1430', border: 'none', borderRadius: '12px'}} />
                  <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fill="url(#colorVal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RECENT ACTIVITY LIST - Exactly like image card */}
          <div className="bg-[#161026] border border-gray-800 rounded-3xl p-6">
            <h3 className="font-bold mb-6 flex items-center gap-2"><Clock size={18} className="text-yellow-500"/> Recent Activity</h3>
            <div className="space-y-6">
              <ActivityItem icon={Upload} title="Batch Upload" time="2m ago" desc="12 photos added" />
              <ActivityItem icon={Wand2} title="Auto Enhanced" time="15m ago" desc="8 photos optimized" />
              <ActivityItem icon={Users} title="Face Tagging" time="1h ago" desc="4 new people identified" />
              <ActivityItem icon={Trash2} title="Cleanup" time="3h ago" desc="Low quality removed" />
            </div>
            <button className="w-full mt-6 py-2 text-xs font-medium text-gray-500 hover:text-white border border-gray-800 rounded-xl transition">View Full Logs</button>
          </div>
        </div>

        {/* BOTTOM SECTION: QUALITY & MINI STATS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* QUALITY DISTRIBUTION PIE */}
          <div className="bg-[#161026] border border-gray-800 rounded-3xl p-6 flex flex-col items-center">
            <h3 className="font-bold self-start mb-4">Quality Score</h3>
            <div className="h-48 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={qualityData} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                    {qualityData.map((entry, index) => <Cell key={index} fill={entry.color} stroke="none" />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold">84%</span>
                <span className="text-[10px] text-gray-500 uppercase">Avg Score</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full mt-4">
              {qualityData.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{backgroundColor: d.color}}></div>
                  <span className="text-[10px] text-gray-400">{d.name} ({d.value}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4-GRID MINI STATS - Matching image */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <div className="grid grid-cols-2 gap-4 h-fit">
               <MiniStat icon={Users} label="People" val="47" color="text-blue-400" />
               <MiniStat icon={FolderHeart} label="Favorites" val="128" color="text-red-400" />
               <MiniStat icon={HardDrive} label="Storage" val="4.2GB" color="text-purple-400" />
               <MiniStat icon={Star} label="Best Shots" val="24" color="text-yellow-400" />
            </div>
            
            {/* QUICK ACTION BUTTONS */}
            <div className="grid grid-cols-2 gap-4">
               <ActionButton icon={Plus} label="New Upload" primary />
               <ActionButton icon={Layers} label="Create Album" />
               <ActionButton icon={Wand2} label="AI Optimize" />
               <ActionButton icon={Settings} label="Config AI" />
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

// --- SUB-COMPONENTS FOR CLEAN CODE ---

function NavItem({ icon: Icon, label, active = false }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/20' : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'}`}>
      <Icon size={20} />
      <span className="font-medium text-sm">{label}</span>
    </div>
  );
}

function MainStat({ title, value, sub, icon: Icon, trend, color = "text-indigo-400" }) {
  return (
    <div className="bg-[#161026] border border-gray-800 rounded-3xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="bg-gray-800/50 p-2.5 rounded-xl"><Icon size={22} className={color} /></div>
        <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">{trend}</span>
      </div>
      <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <h2 className="text-3xl font-bold">{value}</h2>
        <span className="text-gray-500 text-xs">{sub}</span>
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, val, color }) {
  return (
    <div className="bg-[#161026] border border-gray-800 rounded-2xl p-4 flex items-center gap-4 transition hover:bg-[#1c1430]">
      <div className={`p-2 bg-gray-800/50 rounded-lg ${color}`}><Icon size={18} /></div>
      <div>
        <p className="text-[10px] text-gray-500 uppercase leading-none mb-1">{label}</p>
        <p className="text-lg font-bold leading-none">{val}</p>
      </div>
    </div>
  );
}

function ActivityItem({ icon: Icon, title, time, desc }) {
  return (
    <div className="flex items-start gap-4">
      <div className="bg-gray-800/50 p-2 rounded-xl text-indigo-400 mt-1"><Icon size={16}/></div>
      <div className="flex-1">
        <div className="flex justify-between">
          <p className="text-sm font-bold">{title}</p>
          <span className="text-[10px] text-gray-500">{time}</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, primary = false }) {
  return (
    <button className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all active:scale-95 ${primary ? 'bg-indigo-600 border-indigo-500 hover:bg-indigo-700' : 'bg-[#1c1430] border-gray-800 hover:bg-gray-800 text-gray-400 hover:text-white'}`}>
      <Icon size={24} />
      <span className="text-[10px] font-bold uppercase">{label}</span>
    </button>
  );
}