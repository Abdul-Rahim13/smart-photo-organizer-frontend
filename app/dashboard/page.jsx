"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { 
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { 
  Image as ImageIcon, Upload, AlertCircle, CheckCircle, Star, Plus, Wand2, 
  LayoutGrid, Clock, FolderHeart, HardDrive, Users, Trash2, FolderOpen
} from 'lucide-react';
import TopBar from '../../components/TopBar';
import { fetchAllPhotos } from '../../src/redux/slices/photoSlice';
import { fetchAlbums } from '../../src/redux/slices/albumSlice';

// Helper function defined BEFORE it's used
const getRandomColor = () => {
  const colors = [
    'bg-blue-900/20', 'bg-orange-900/20', 'bg-purple-900/20', 
    'bg-emerald-900/20', 'bg-rose-900/20', 'bg-cyan-900/20',
    'bg-indigo-900/20', 'bg-yellow-900/20'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Helper function for time ago
const getTimeAgo = (date) => {
  if (isNaN(date.getTime())) return 'recently';
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
};

export default function Dashboard() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { items: photos, loading: photosLoading } = useSelector((state) => state.photos);
  const { items: albums, loading: albumsLoading } = useSelector((state) => state.albums);
  const { user } = useSelector((state) => state.auth || {});

  const [recentActivity, setRecentActivity] = useState([]);
  const [uploadTrend, setUploadTrend] = useState([]);
  const [stats, setStats] = useState({
    totalPhotos: 0,
    blurryPhotos: 0,
    aiProcessed: 0,
    totalAlbums: 0,
    totalFaces: 0,
    avgQuality: 0,
    storageUsed: 0,
    starredPhotos: 0,
    trashedPhotos: 0
  });

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchAllPhotos());
    dispatch(fetchAlbums());
  }, [dispatch]);

  // Calculate real stats from photos
  useEffect(() => {
    if (photos && photos.length > 0) {
      // Create a copy of the array to avoid mutation issues
      const photoArray = [...(Array.isArray(photos) ? photos : photos.data || [])];
      
      if (photoArray.length === 0) return;
      
      // Calculate quality scores
      const qualityScores = photoArray.map(p => p.qualityScore || p.score || 0);
      const avgQuality = qualityScores.length > 0 
        ? Math.round(qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length) 
        : 0;
      
      // Count blurry photos (quality < 40)
      const blurryCount = photoArray.filter(p => (p.qualityScore || p.score || 0) < 40).length;
      
      // Count AI processed (quality > 70 or has AI metadata)
      const aiProcessedCount = photoArray.filter(p => (p.qualityScore || p.score || 0) >= 70 || p.aiProcessed).length;
      
      // Count starred photos
      const starredCount = photoArray.filter(p => p.isStarred || p.starred).length;
      
      // Count trashed photos
      const trashedCount = photoArray.filter(p => p.isTrashed).length;
      
      // Calculate total faces
      const totalFaces = photoArray.reduce((sum, p) => sum + (p.faceCount || p.faces || 0), 0);
      
      // Calculate storage used (estimate 5MB per photo)
      const storageUsed = (photoArray.length * 5) / 1024; // in GB
      
      setStats({
        totalPhotos: photoArray.length,
        blurryPhotos: blurryCount,
        aiProcessed: aiProcessedCount,
        totalAlbums: albums?.length || 0,
        totalFaces: totalFaces,
        avgQuality: avgQuality,
        storageUsed: parseFloat(storageUsed.toFixed(1)),
        starredPhotos: starredCount,
        trashedPhotos: trashedCount
      });

      // Generate upload trend data (last 6 months)
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const trend = [];
      
      for (let i = 5; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12;
        const monthPhotos = photoArray.filter(p => {
          const date = new Date(p.createdAt || p.uploadedAt);
          return !isNaN(date.getTime()) && date.getMonth() === monthIndex;
        });
        trend.push({
          name: monthNames[monthIndex],
          val: monthPhotos.length
        });
      }
      setUploadTrend(trend);

      // Generate recent activity from photos
      const sortedPhotos = [...photoArray].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.uploadedAt);
        const dateB = new Date(b.createdAt || b.uploadedAt);
        return dateB - dateA;
      });
      
      const recentPhotos_ = sortedPhotos.slice(0, 5);
      
      const activities = recentPhotos_.map(photo => ({
        id: photo._id || photo.id,
        text: `"${photo.title || 'Untitled'}" ${(photo.qualityScore || photo.score || 0) >= 70 ? 'processed' : 'uploaded'}`,
        time: getTimeAgo(new Date(photo.createdAt || photo.uploadedAt || Date.now())),
        icon: (photo.qualityScore || photo.score || 0) >= 70 ? CheckCircle : Upload,
        color: (photo.qualityScore || photo.score || 0) >= 70 ? 'bg-green-500/20 text-green-400' : 'bg-indigo-500/20 text-indigo-400'
      }));
      
      setRecentActivity(activities);
    }
  }, [photos, albums]);

  // Mini bar data for AI processed chart
  const miniBarData = useMemo(() => [
    { v: Math.min(stats.aiProcessed * 0.4, 100) },
    { v: Math.min(stats.aiProcessed * 0.7, 100) },
    { v: Math.min(stats.aiProcessed * 0.5, 100) },
    { v: Math.min(stats.aiProcessed * 0.9, 100) },
    { v: Math.min(stats.aiProcessed * 0.65, 100) },
    { v: Math.min(stats.aiProcessed * 0.8, 100) }
  ], [stats.aiProcessed]);

  // Mini pie data for blurry vs good photos
  const miniPieData = useMemo(() => [
    { value: stats.blurryPhotos, color: '#ef4444' },
    { value: Math.max(stats.totalPhotos - stats.blurryPhotos, 1), color: '#374151' }
  ], [stats.blurryPhotos, stats.totalPhotos]);

  // Recent photos for display
  const recentPhotos = useMemo(() => {
    if (!photos) return [];
    // Create a copy to avoid mutation
    const photoArray = [...(Array.isArray(photos) ? photos : photos.data || [])];
    if (photoArray.length === 0) return [];
    
    // Sort using a copy of the array
    const sortedPhotos = [...photoArray].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.uploadedAt);
      const dateB = new Date(b.createdAt || b.uploadedAt);
      return dateB - dateA;
    });
    
    return sortedPhotos.slice(0, 4).map(p => ({
      id: p._id || p.id,
      title: p.title || 'Untitled',
      cat: p.sceneCategory || p.category || 'General',
      score: `${p.qualityScore || p.score || 0}%`,
      color: getRandomColor(),
      imageUrl: p.imageUrl || p.url
    }));
  }, [photos]);

  // Navigation handlers
  const handleQuickAction = useCallback((action) => {
    switch(action) {
      case 'upload':
        router.push('/dashboard/upload');
        break;
      case 'album':
        router.push('/dashboard/albums');
        break;
      case 'trash':
        router.push('/dashboard/trash');
        break;
      case 'ai':
        router.push('/dashboard/smart-edit');
        break;
      default:
        break;
    }
  }, [router]);

  const isLoading = photosLoading && albumsLoading;

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
        <h1 className="text-2xl font-bold mb-2">Welcome Back, {user?.name?.split(' ')[0] || 'User'}! 👋</h1>
        <p className="text-gray-400 text-sm mb-8 font-light">Here's what's happening with your photos today.</p>

        {/* TOP STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#161026] border border-gray-800 rounded-3xl p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Total Photos</p>
                <h2 className="text-3xl font-black">{stats.totalPhotos.toLocaleString()}</h2>
                <p className="text-[10px] mt-1 text-green-500 font-medium">
                  {stats.totalPhotos > 0 ? '↑ Active library' : 'Upload your first photo'}
                </p>
              </div>
              <div className="w-16 h-12">
                {uploadTrend.length > 0 && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={uploadTrend}>
                      <Area type="monotone" dataKey="val" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2}/>
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#161026] border border-gray-800 rounded-3xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Blurry / Low Quality</p>
                <h2 className="text-3xl font-black">{stats.blurryPhotos}</h2>
                <p className="text-[10px] mt-1 text-red-500 font-medium">
                  {stats.blurryPhotos > 0 ? 'Needs review' : 'All photos are clear'}
                </p>
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
                  {stats.blurryPhotos > 0 ? (
                    <AlertCircle size={12} className="text-red-500"/>
                  ) : (
                    <CheckCircle size={12} className="text-green-500"/>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#161026] border border-gray-800 rounded-3xl p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">AI Processed</p>
                <h2 className="text-3xl font-black">{stats.aiProcessed}</h2>
                <p className="text-[10px] mt-1 text-green-500 font-medium">
                  {stats.aiProcessed}/{stats.totalPhotos} photos
                </p>
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
                <h3 className="font-bold">Upload Activity (Last 6 Months)</h3>
              </div>
              <div className="h-64">
                {uploadTrend.length > 0 && uploadTrend.some(t => t.val > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={uploadTrend}>
                      <defs>
                        <linearGradient id="yellowGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#facc15" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#facc15" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false}/>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1c1430', border: 'none', borderRadius: '12px' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="val" stroke="#facc15" strokeWidth={3} fill="url(#yellowGrad)"/>
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No upload data available</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MiniStat label="Faces Detected" val={stats.totalFaces.toLocaleString()} icon={Users} color="text-indigo-400" bg="bg-indigo-400/10"/>
              <MiniStat label="Smart Albums"   val={stats.totalAlbums} icon={LayoutGrid} color="text-green-400" bg="bg-green-400/10"/>
              <MiniStat label="Avg Quality"    val={`${stats.avgQuality}%`} icon={Star} color="text-yellow-400" bg="bg-yellow-400/10"/>
              <MiniStat label="Storage Used"   val={`${stats.storageUsed} GB`} icon={HardDrive} color="text-orange-400" bg="bg-orange-400/10"/>
            </div>
          </div>

          <div className="bg-[#161026] border border-gray-800 rounded-3xl p-6 flex flex-col">
            <h3 className="font-bold mb-6 flex items-center gap-2 text-white">
              <Clock size={16} className="text-yellow-500"/> Recent Activity
            </h3>
            <div className="space-y-5 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-96">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, idx) => (
                  <LogItem 
                    key={idx}
                    text={activity.text} 
                    time={activity.time}  
                    icon={activity.icon}       
                    color={activity.color}
                  />
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>No recent activity</p>
                  <p className="text-xs mt-2">Upload photos to see activity</p>
                </div>
              )}
            </div>
            <button 
              onClick={() => router.push('/dashboard/gallery')}
              className="w-full mt-6 py-3 border border-gray-800 text-[10px] font-bold text-yellow-500 rounded-xl uppercase tracking-widest hover:bg-yellow-500/5 transition cursor-pointer"
            >
              View All Photos →
            </button>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <ActionButton icon={Upload} label="New Upload" primary onClick={() => handleQuickAction('upload')} />
          <ActionButton icon={FolderHeart} label="Create Album" onClick={() => handleQuickAction('album')} />
          <ActionButton icon={Trash2} label="Review Trash" onClick={() => handleQuickAction('trash')} />
          <ActionButton icon={Wand2} label="AI Optimize" onClick={() => handleQuickAction('ai')} />
        </div>

        {/* RECENT PHOTOS */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl text-white">Recent Library</h3>
            <button 
              onClick={() => router.push('/dashboard/gallery')}
              className="text-xs text-yellow-500 hover:underline font-bold uppercase tracking-wider cursor-pointer"
            >
              View All Gallery →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentPhotos.length > 0 ? (
              recentPhotos.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => router.push(`/dashboard/photos?view=${p.id}`)}
                  className="bg-[#161026] rounded-2xl overflow-hidden border border-gray-800 cursor-pointer hover:border-indigo-500 transition-all group"
                >
                  <div className={`h-40 ${p.color} relative flex items-center justify-center overflow-hidden`}>
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="opacity-10 text-white" size={48}/>
                    )}
                    <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-green-400 border border-green-500/30">
                      {p.score} AI
                    </div>
                    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-transparent to-transparent"/>
                    <div className="absolute bottom-3 left-3">
                      <p className="text-xs font-bold text-white">{p.title}</p>
                      <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1 font-medium">
                        <span className="w-1 h-1 bg-indigo-500 rounded-full"/> {p.cat}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-4 text-center py-12 bg-[#161026] rounded-2xl border border-gray-800">
                <ImageIcon size={48} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500">No photos yet</p>
                <button 
                  onClick={() => handleQuickAction('upload')}
                  className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
                >
                  Upload your first photo →
                </button>
              </div>
            )}
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

function ActionButton({ icon: Icon, label, primary = false, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`cursor-pointer flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border transition-all hover:-translate-y-1 active:scale-95
      ${primary
        ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30'
        : 'bg-[#1c1430] border-gray-800 hover:bg-gray-800 text-gray-400'
      }`}>
      <Icon size={24} className={primary ? 'text-indigo-400' : 'text-gray-400'}/>
      <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
    </button>
  );
}