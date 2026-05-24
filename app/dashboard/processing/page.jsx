"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
  Cpu, CheckCircle, Clock, Layers, Zap, RefreshCw, Filter,
  Image as ImageIcon, PlayCircle, PauseCircle, AlertTriangle, 
  Loader2, Trash2, Eye, Star
} from 'lucide-react';
import TopBar from '../../../components/TopBar';
import { fetchAllPhotos, updatePhotoMetadata, toggleStarred } from '../../../src/redux/slices/photoSlice';

// ─── STATUS CONFIGURATION ────────────────────────────────────────────────────────
const statusConfig = {
  queued:     { label: "Queued",     color: "text-gray-400",   bg: "bg-gray-500/15", dot: "bg-gray-400" },
  analyzing:  { label: "Analyzing",  color: "text-blue-400",   bg: "bg-blue-500/15", dot: "bg-blue-400" },
  processing: { label: "Processing", color: "text-yellow-400", bg: "bg-yellow-500/15", dot: "bg-yellow-400" },
  complete:   { label: "Complete",   color: "text-green-400",  bg: "bg-green-500/15", dot: "bg-green-400" },
};

// ─── CIRCULAR PROGRESS ─────────────────────────────────────────────────────────
const CircularProgress = React.memo(({ percent, status }) => {
  const r = 32;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  const fillColor = status === "complete" ? "#22c55e" : status === "analyzing" ? "#3b82f6" : "#facc15";

  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg width="80" height="80" className="-rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#1e1a2e" strokeWidth="6"/>
        <circle
          cx="40" cy="40" r={r} fill="none"
          stroke={fillColor} strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.3s ease" }}
        />
      </svg>
      <span className="absolute text-xs font-black text-white">{percent}%</span>
    </div>
  );
});
CircularProgress.displayName = 'CircularProgress';

// ─── STAT CARD ────────────────────────────────────────────────────────────────
const StatCard = React.memo(({ label, value, icon: Icon, color }) => (
  <div className="bg-[#161026] border border-gray-800/70 rounded-2xl p-4 flex items-center gap-3">
    <div className={`p-2 rounded-xl ${color} bg-opacity-10`}>
      <Icon size={18} className={color} />
    </div>
    <div>
      <p className="text-[9px] text-gray-500 uppercase tracking-wider font-bold">{label}</p>
      <p className="text-xl font-black text-white">{value}</p>
    </div>
  </div>
));
StatCard.displayName = 'StatCard';

// ─── QUEUE CARD ──────────────────────────────────────────────────────────────
const QueueCard = React.memo(({ item, onRetry, onView, onStar }) => {
  const cfg = statusConfig[item.status];
  const [menuOpen, setMenuOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="bg-[#161026] border border-gray-800/70 rounded-xl overflow-hidden hover:border-indigo-500/30 transition-all duration-300 group">
      <div className="h-36 relative overflow-hidden bg-gradient-to-br from-purple-900/30 to-indigo-900/30">
        {item.imageUrl && (
          <img 
            src={item.imageUrl} 
            alt={item.title} 
            className="w-full h-full object-cover transition-all duration-500"
            onLoad={() => setImageLoaded(true)}
            style={{ opacity: imageLoaded ? 1 : 0.6 }}
          />
        )}
        
        {/* Progress Overlay */}
        {item.status !== 'complete' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <CircularProgress percent={item.progress} status={item.status} />
          </div>
        )}

        {/* Status Badge */}
        <div className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${cfg.color} ${cfg.bg}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${item.status !== 'complete' ? 'animate-pulse' : ''}`} />
          {cfg.label}
        </div>

        {/* Menu Button */}
        <div className="absolute bottom-2 right-2">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-gray-400 hover:text-white transition opacity-0 group-hover:opacity-100"
          >
            <MoreVerticalIcon size={11} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 bottom-7 w-32 bg-[#1c1430] border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
              <button onClick={() => { onView(item); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] text-gray-300 hover:bg-white/5">
                <Eye size={10} /> View
              </button>
              <button onClick={() => { onStar(item); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] text-yellow-400 hover:bg-white/5">
                <Star size={10} /> Star
              </button>
              {item.status !== 'complete' && (
                <button onClick={() => { onRetry(item); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] text-blue-400 hover:bg-white/5">
                  <RefreshCw size={10} /> Retry
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="text-xs font-bold text-white truncate flex-1">{item.title}</p>
          {item.isStarred && <Star size={10} className="text-yellow-400 fill-yellow-400 shrink-0" />}
        </div>
        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${item.status === 'complete' ? 'bg-green-500' : item.status === 'analyzing' ? 'bg-blue-500' : 'bg-yellow-500'}`}
            style={{ width: `${item.progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-[8px] text-gray-500">{item.stage}</p>
          <p className={`text-[9px] font-bold ${cfg.color}`}>{item.progress}%</p>
        </div>
      </div>
    </div>
  );
});
QueueCard.displayName = 'QueueCard';

// ─── LIST ROW ────────────────────────────────────────────────────────────────
const QueueRow = React.memo(({ item, onRetry, onView, onStar }) => {
  const cfg = statusConfig[item.status];

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800/40 hover:bg-white/5 transition group">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-900/30 to-indigo-900/30 overflow-hidden shrink-0 flex items-center justify-center">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <ImageIcon size={16} className="text-gray-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-white truncate">{item.title}</p>
          {item.isStarred && <Star size={10} className="text-yellow-400 fill-yellow-400 shrink-0" />}
        </div>
        <p className="text-[9px] text-gray-500">{item.stage}</p>
      </div>
      <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${cfg.color} ${cfg.bg}`}>
        {cfg.label}
      </div>
      <div className="w-24 flex items-center gap-2">
        <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${item.status === 'complete' ? 'bg-green-500' : item.status === 'analyzing' ? 'bg-blue-500' : 'bg-yellow-500'}`}
            style={{ width: `${item.progress}%` }}
          />
        </div>
        <span className={`text-[9px] font-bold w-8 text-right ${cfg.color}`}>{item.progress}%</span>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
        <button onClick={() => onView(item)} className="p-1 text-gray-500 hover:text-white">
          <Eye size={12} />
        </button>
        <button onClick={() => onStar(item)} className="p-1 text-gray-500 hover:text-yellow-400">
          <Star size={12} />
        </button>
        {item.status !== 'complete' && (
          <button onClick={() => onRetry(item)} className="p-1 text-gray-500 hover:text-blue-400">
            <RefreshCw size={12} />
          </button>
        )}
      </div>
    </div>
  );
});
QueueRow.displayName = 'QueueRow';

// Helper for MoreVertical icon
const MoreVerticalIcon = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function ProcessingPage() {
  const dispatch = useDispatch();
  const { items: photos, loading: reduxLoading } = useSelector((state) => state.photos);
  
  const [viewMode, setViewMode] = useState('grid');
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [processingItems, setProcessingItems] = useState([]);
  
  const progressIntervalRef = useRef(null);
  const filters = ['All', 'Queued', 'Analyzing', 'Processing', 'Complete', 'Starred'];

  // Load photos on mount
  useEffect(() => {
    dispatch(fetchAllPhotos());
  }, [dispatch]);

  // Initialize processing items from photos
  useEffect(() => {
    if (photos && photos.length > 0 && processingItems.length === 0) {
      const initialized = photos.slice(0, 50).map((photo, index) => {
        const randomProgress = Math.floor(Math.random() * 101);
        let status = 'queued';
        let stage = 'Waiting';
        
        if (randomProgress === 100) {
          status = 'complete';
          stage = 'Complete';
        } else if (randomProgress > 70) {
          status = 'processing';
          stage = 'Finalizing...';
        } else if (randomProgress > 40) {
          status = 'analyzing';
          stage = 'Analyzing...';
        } else if (randomProgress > 0) {
          status = 'processing';
          stage = 'Processing...';
        }
        
        return {
          id: photo._id || photo.id,
          title: photo.title || `Photo ${index + 1}`,
          imageUrl: photo.url || photo.imageUrl,
          status,
          progress: randomProgress,
          stage,
          isStarred: photo.starred || false,
        };
      });
      setProcessingItems(initialized);
    }
  }, [photos, processingItems.length]);

  // Progress simulation - updates every 1.5 seconds
  useEffect(() => {
    if (isPaused || processingItems.length === 0) return;
    
    progressIntervalRef.current = setInterval(() => {
      setProcessingItems(prev => {
        let hasChanges = false;
        const newItems = prev.map(item => {
          if (item.status === 'complete' || item.progress >= 100) return item;
          
          hasChanges = true;
          let newProgress = Math.min(item.progress + Math.floor(Math.random() * 8) + 2, 100);
          let newStatus = item.status;
          let newStage = item.stage;
          
          if (newProgress === 100) {
            newStatus = 'complete';
            newStage = 'Complete!';
            toast.success(`✨ ${item.title} processed!`);
          } else if (newProgress > 80) {
            newStatus = 'processing';
            newStage = 'Finalizing...';
          } else if (newProgress > 50) {
            newStatus = 'analyzing';
            newStage = 'Analyzing...';
          } else if (newProgress > 20) {
            newStatus = 'processing';
            newStage = 'Processing...';
          }
          
          return { ...item, progress: newProgress, status: newStatus, stage: newStage };
        });
        
        return hasChanges ? newItems : prev;
      });
    }, 1500);
    
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPaused, processingItems.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  // Handle retry for failed/queued items
  const handleRetry = useCallback((item) => {
    toast.info(`🔄 Re-analyzing: ${item.title}`);
    setProcessingItems(prev => prev.map(i => 
      i.id === item.id ? { ...i, progress: 5, status: 'analyzing', stage: 'Restarting...' } : i
    ));
    
    // Update backend metadata
    setTimeout(() => {
      dispatch(updatePhotoMetadata({
        id: item.id,
        metadata: { aiProcessed: true, processedAt: new Date().toISOString() }
      })).catch(console.error);
    }, 500);
  }, [dispatch]);

  // Handle starring a photo
  const handleStar = useCallback(async (item) => {
    setProcessingItems(prev => prev.map(i => 
      i.id === item.id ? { ...i, isStarred: !i.isStarred } : i
    ));
    toast.success(item.isStarred ? 'Removed from starred' : '⭐ Added to favorites');
    try {
      await dispatch(toggleStarred(item.id)).unwrap();
    } catch (error) {
      console.error('Star failed:', error);
    }
  }, [dispatch]);

  // Handle view photo
  const handleView = useCallback((item) => {
    window.location.href = `/dashboard/photos?view=${item.id}`;
  }, []);

  // Handle clear completed items
  const handleClearCompleted = useCallback(() => {
    setProcessingItems(prev => prev.filter(i => i.status !== 'complete'));
    toast.success('Cleared completed items');
  }, []);

  // Handle resume all
  const handleResumeAll = useCallback(() => {
    setIsPaused(false);
    toast.success('▶️ Queue resumed');
  }, []);

  // Handle pause queue
  const handlePauseQueue = useCallback(() => {
    setIsPaused(true);
    toast.warning('⏸️ Queue paused');
  }, []);

  // Memoized filtered items for performance
  const filteredItems = useMemo(() => {
    let items = processingItems;
    
    if (filter === 'Starred') {
      items = items.filter(i => i.isStarred);
    } else if (filter !== 'All') {
      items = items.filter(i => i.status === filter.toLowerCase());
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      items = items.filter(i => i.title?.toLowerCase().includes(term));
    }
    
    return items;
  }, [processingItems, filter, searchTerm]);

  // Memoized stats
  const stats = useMemo(() => ({
    total: processingItems.length,
    queued: processingItems.filter(i => i.status === 'queued').length,
    analyzing: processingItems.filter(i => i.status === 'analyzing').length,
    processing: processingItems.filter(i => i.status === 'processing').length,
    complete: processingItems.filter(i => i.status === 'complete').length,
    starred: processingItems.filter(i => i.isStarred).length,
  }), [processingItems]);

  const overallProgress = processingItems.length > 0 
    ? Math.round(processingItems.reduce((sum, i) => sum + i.progress, 0) / processingItems.length)
    : 0;

  // Loading state
  if (reduxLoading && processingItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#0f0a19] flex items-center justify-center">
        <Loader2 size={40} className="text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0a19] text-gray-100">
      <TopBar 
        title="AI Processing" 
        showStatus={true}
        statusText={isPaused ? "Paused" : (overallProgress === 100 ? "Complete" : "Processing")}
        statusColor={isPaused ? "yellow" : (overallProgress === 100 ? "green" : "yellow")}
        searchPlaceholder="Search photos..."
        onSearch={setSearchTerm}
      />

      <div className="p-4 lg:p-6">
        {/* Stats Row */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <StatCard label="Total" value={stats.total} icon={ImageIcon} color="text-indigo-400" />
          <StatCard label="Queued" value={stats.queued} icon={Clock} color="text-gray-400" />
          <StatCard label="Analyzing" value={stats.analyzing} icon={Cpu} color="text-blue-400" />
          <StatCard label="Processing" value={stats.processing} icon={RefreshCw} color="text-yellow-400" />
          <StatCard label="Complete" value={stats.complete} icon={CheckCircle} color="text-green-400" />
          <StatCard label="Starred" value={stats.starred} icon={Star} color="text-yellow-400" />
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex bg-[#161026] border border-gray-800 rounded-lg p-0.5">
            {filters.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer
                  ${filter === f ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                {f}
              </button>
            ))}
          </div>

          <div className="flex bg-[#161026] border border-gray-800 rounded-lg p-0.5">
            <button onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition cursor-pointer ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
              <Layers size={14}/>
            </button>
            <button onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition cursor-pointer ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
              <Filter size={14}/>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {processingItems.length > 0 && overallProgress < 100 && !isPaused && (
          <div className="mb-5 bg-[#1c1430] border border-gray-800 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                <Cpu size={10} className="text-yellow-400" />
                AI Progress
              </span>
              <span className="text-xs font-black text-indigo-400">{overallProgress}%</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <p className="text-[8px] text-gray-500 mt-1">{stats.complete}/{stats.total} photos processed</p>
          </div>
        )}

        {/* Paused Banner */}
        {isPaused && overallProgress < 100 && (
          <div className="mb-5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-center">
            <p className="text-[10px] text-yellow-400">⏸️ Queue paused - Click "Resume All" to continue</p>
          </div>
        )}

        {/* Complete Banner */}
        {overallProgress === 100 && processingItems.length > 0 && (
          <div className="mb-5 bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
            <p className="text-[10px] text-green-400">✅ All {stats.total} photos have been processed!</p>
          </div>
        )}

        {/* Content Grid/List */}
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertTriangle size={40} className="text-gray-700 mb-3"/>
            <p className="text-gray-400 font-semibold text-sm">No items found</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredItems.map(item => (
              <QueueCard 
                key={item.id} 
                item={item} 
                onRetry={handleRetry}
                onView={handleView}
                onStar={handleStar}
              />
            ))}
          </div>
        ) : (
          <div className="bg-[#161026] border border-gray-800/70 rounded-xl overflow-hidden">
            <div className="px-4 py-2 bg-slate-900/30 border-b border-gray-800">
              <div className="grid grid-cols-[40px_1fr_80px_80px_80px] gap-3 text-[9px] font-bold uppercase text-gray-500">
                <span>Preview</span><span>Name</span><span>Status</span><span>Progress</span><span>Actions</span>
              </div>
            </div>
            {filteredItems.map(item => (
              <QueueRow 
                key={item.id} 
                item={item} 
                onRetry={handleRetry}
                onView={handleView}
                onStar={handleStar}
              />
            ))}
          </div>
        )}

        {/* Action Buttons */}
        {processingItems.length > 0 && overallProgress < 100 && (
          <div className="flex gap-3 mt-6">
            <button 
              onClick={handleResumeAll}
              disabled={!isPaused}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                !isPaused ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              <PlayCircle size={14}/> Resume All
            </button>
            <button 
              onClick={handlePauseQueue}
              disabled={isPaused}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                isPaused ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed' : 'bg-[#1c1430] border border-gray-800 hover:border-gray-600 text-gray-300'
              }`}
            >
              <PauseCircle size={14}/> Pause Queue
            </button>
            <button 
              onClick={handleClearCompleted}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1c1430] border border-gray-800 hover:border-red-500/40 text-red-400 text-xs font-bold transition cursor-pointer ml-auto"
            >
              <Trash2 size={14}/> Clear Completed
            </button>
          </div>
        )}
      </div>
    </div>
  );
}