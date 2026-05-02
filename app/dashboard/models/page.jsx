"use client"

import React, { useState } from 'react';
import {
  Cpu, CheckCircle, RefreshCw, MemoryStick, Image as ImageIcon,
  Target, ScanFace, Layers, Zap, ShieldCheck, Sparkles, Eye,
  Info, Upload, Power, AlertCircle, TrendingUp, Activity,
  ChevronDown, ChevronUp, RotateCcw, X, Clock
} from 'lucide-react';

// ─── MODEL DATA ───────────────────────────────────────────────────────────────
const initialModels = [
  {
    id: 1,
    name: "Face Detection Model",
    desc: "Detects and recognizes faces in photos with high accuracy",
    icon: ScanFace,
    iconBg: "bg-indigo-500/15",
    iconColor: "text-indigo-400",
    active: true,
    version: "v2.4.1",
    size: "124 MB",
    accuracy: 98.5,
    speedLabel: "Fast",
    speedColor: "text-green-400",
    processed: 1247,
    memory: 156,
    updated: "Jan 15, 2024",
    tags: ["face", "recognition"],
  },
  {
    id: 2,
    name: "Scene Classification Model",
    desc: "Classifies photos into categories like outdoor, indoor, urban, etc.",
    icon: Layers,
    iconBg: "bg-cyan-500/15",
    iconColor: "text-cyan-400",
    active: true,
    version: "v1.8.3",
    size: "89 MB",
    accuracy: 96.2,
    speedLabel: "Very Fast",
    speedColor: "text-green-400",
    processed: 2891,
    memory: 112,
    updated: "Jan 10, 2024",
    tags: ["scene", "classification"],
  },
  {
    id: 3,
    name: "Quality Assessment Model",
    desc: "Analyzes image quality including blur, noise, and exposure",
    icon: ShieldCheck,
    iconBg: "bg-yellow-500/15",
    iconColor: "text-yellow-400",
    active: false,
    version: "v3.1.0",
    size: "156 MB",
    accuracy: 94.8,
    speedLabel: "Medium",
    speedColor: "text-yellow-400",
    processed: 0,
    memory: 0,
    updated: "Jan 12, 2024",
    tags: ["quality", "blur"],
  },
  {
    id: 4,
    name: "Object Detection Model",
    desc: "Identifies objects and elements within photos",
    icon: Target,
    iconBg: "bg-rose-500/15",
    iconColor: "text-rose-400",
    active: true,
    version: "v4.2.0",
    size: "203 MB",
    accuracy: 97.3,
    speedLabel: "Medium",
    speedColor: "text-yellow-400",
    processed: 1893,
    memory: 234,
    updated: "Jan 9, 2024",
    tags: ["object", "detection"],
  },
  {
    id: 5,
    name: "Image Enhancement Model",
    desc: "Automatically enhances photo quality, color, and sharpness",
    icon: Sparkles,
    iconBg: "bg-purple-500/15",
    iconColor: "text-purple-400",
    active: false,
    version: "v2.0.5",
    size: "178 MB",
    accuracy: 95.7,
    speedLabel: "Slow",
    speedColor: "text-orange-400",
    processed: 0,
    memory: 0,
    updated: "Jan 5, 2024",
    tags: ["enhancement", "color"],
  },
];

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, iconBg, iconColor, sub }) {
  return (
    <div className="bg-[#161026] border border-gray-800/70 rounded-2xl p-5 flex items-center gap-4 hover:border-indigo-500/20 transition-all duration-300 cursor-default group">
      <div className={`${iconBg} ${iconColor} p-3 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">{label}</p>
        <p className="text-2xl font-black text-white leading-none">{value}</p>
        {sub && <p className="text-[10px] text-gray-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── ACCURACY BAR ─────────────────────────────────────────────────────────────
function AccuracyBar({ value }) {
  return (
    <div>
      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1.5">Accuracy</p>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-800/80 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-700"
            style={{ width: `${value}%` }}
          />
        </div>
        <span className="text-xs font-black text-green-400 w-12 text-right">{value}%</span>
      </div>
    </div>
  );
}

// ─── MODEL CARD ───────────────────────────────────────────────────────────────
function ModelCard({ model, onToggle, onInfo }) {
  const [loading, setLoading] = useState(false);
  const Icon = model.icon;

  const handleToggle = () => {
    setLoading(true);
    setTimeout(() => {
      onToggle(model.id);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className={`bg-[#13101f] border rounded-2xl p-6 flex flex-col gap-5 transition-all duration-300
      ${model.active
        ? 'border-gray-700/50 hover:border-indigo-500/30'
        : 'border-gray-800/40 hover:border-gray-700/50 opacity-90 hover:opacity-100'}`}>

      {/* ── Model header ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`${model.iconBg} ${model.iconColor} p-2.5 rounded-xl flex-shrink-0`}>
            <Icon size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-black text-white">{model.name}</h3>
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-black
                ${model.active
                  ? 'bg-green-500/10 border-green-500/25 text-green-400'
                  : 'bg-gray-500/10 border-gray-500/25 text-gray-500'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${model.active ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
                {model.active ? 'Active' : 'Inactive'}
              </div>
            </div>
            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{model.desc}</p>
          </div>
        </div>
      </div>

      {/* ── Meta grid ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#0f0a19] border border-gray-800/50 rounded-xl p-3">
          <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mb-1">Version</p>
          <p className="text-sm font-black text-white">{model.version}</p>
        </div>
        <div className="bg-[#0f0a19] border border-gray-800/50 rounded-xl p-3">
          <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mb-1">Size</p>
          <p className="text-sm font-black text-white">{model.size}</p>
        </div>
      </div>

      {/* ── Accuracy bar ── */}
      <div className="bg-[#0f0a19] border border-gray-800/50 rounded-xl p-3">
        <AccuracyBar value={model.accuracy} />
      </div>

      {/* ── Speed ── */}
      <div className="bg-[#0f0a19] border border-gray-800/50 rounded-xl p-3">
        <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mb-1">Speed</p>
        <p className={`text-sm font-black ${model.speedColor}`}>{model.speedLabel}</p>
      </div>

      {/* ── Stats row (only when active) ── */}
      {model.active && (
        <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
          <div className="flex items-center gap-1.5">
            <ImageIcon size={11} className="text-gray-600" />
            Processed: <span className="text-gray-300 font-bold">{model.processed.toLocaleString()} images</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cpu size={11} className="text-gray-600" />
            Memory: <span className="text-gray-300 font-bold">{model.memory} MB</span>
          </div>
        </div>
      )}

      {/* ── Load / Unload button ── */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer border
            ${model.active
              ? 'bg-red-500/10 border-red-500/25 text-red-400 hover:bg-red-500/20'
              : 'bg-green-500/15 border-green-500/30 text-green-400 hover:bg-green-500/25'}`}
        >
          {loading
            ? <><RefreshCw size={13} className="animate-spin" /> {model.active ? 'Unloading...' : 'Loading...'}</>
            : model.active
              ? <><Power size={13} /> Unload Model</>
              : <><Upload size={13} /> Load Model</>}
        </button>
        <button
          onClick={() => onInfo(model)}
          className="w-9 h-9 rounded-xl bg-[#0f0a19] border border-gray-800/50 text-gray-500 hover:text-white hover:border-gray-600 flex items-center justify-center transition cursor-pointer flex-shrink-0"
        >
          <Info size={14} />
        </button>
      </div>

      {/* ── Last updated ── */}
      <div className="flex items-center gap-1.5 -mt-2">
        <Clock size={10} className="text-gray-700" />
        <p className="text-[10px] text-gray-600">Last updated: {model.updated}</p>
      </div>
    </div>
  );
}

// ─── INFO MODAL ───────────────────────────────────────────────────────────────
function InfoModal({ model, onClose }) {
  const Icon = model.icon;
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#161026] border border-gray-700/60 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className={`${model.iconBg} ${model.iconColor} p-2.5 rounded-xl`}>
              <Icon size={18} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">{model.name}</h3>
              <p className="text-[10px] text-gray-500">{model.version} • {model.size}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-xs text-gray-400 leading-relaxed">{model.desc}</p>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Accuracy",    value: `${model.accuracy}%`,   color: "text-green-400"  },
              { label: "Speed",       value: model.speedLabel,        color: model.speedColor  },
              { label: "Status",      value: model.active ? "Active" : "Inactive", color: model.active ? "text-green-400" : "text-gray-500" },
              { label: "Memory",      value: model.active ? `${model.memory} MB` : "—", color: "text-white" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[#0f0a19] border border-gray-800/50 rounded-xl p-3">
                <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mb-1">{label}</p>
                <p className={`text-sm font-black ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {model.active && (
            <div className="bg-[#0f0a19] border border-gray-800/50 rounded-xl p-3 flex items-center gap-2">
              <TrendingUp size={14} className="text-indigo-400 flex-shrink-0" />
              <p className="text-xs text-gray-400">
                Processed <span className="text-white font-bold">{model.processed.toLocaleString()}</span> images since last load
              </p>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Clock size={11} className="text-gray-600" />
            <p className="text-[11px] text-gray-600">Last updated: {model.updated}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function AIModelsPage() {
  const [models,   setModels]   = useState(initialModels);
  const [infoModel,setInfoModel]= useState(null);
  const [checking, setChecking] = useState(false);
  const [toast,    setToast]    = useState(null);

  const activeCount  = models.filter(m => m.active).length;
  const totalMemory  = models.filter(m => m.active).reduce((s, m) => s + m.memory, 0);
  const totalImages  = models.reduce((s, m) => s + m.processed, 0);
  const avgAccuracy  = (models.reduce((s, m) => s + m.accuracy, 0) / models.length).toFixed(1);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const toggleModel = id => {
    setModels(prev => prev.map(m => {
      if (m.id !== id) return m;
      const nowActive = !m.active;
      showToast(nowActive ? `${m.name} loaded` : `${m.name} unloaded`, nowActive ? "success" : "warn");
      return { ...m, active: nowActive };
    }));
  };

  const checkUpdates = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      showToast("All models are up to date ✓");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0f0a19] text-gray-100 p-6 md:p-8">

      {/* ── INFO MODAL ──────────────────────────────────────────────────── */}
      {infoModel && <InfoModal model={infoModel} onClose={() => setInfoModel(null)} />}

      {/* ── TOAST ──────────────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-2xl text-xs font-bold
          ${toast.type === 'warn'
            ? 'bg-yellow-900/80 border-yellow-500/40 text-yellow-200'
            : 'bg-green-900/80 border-green-500/40 text-green-200'}`}>
          {toast.type === 'warn' ? <Power size={13} /> : <CheckCircle size={13} />}
          {toast.msg}
        </div>
      )}

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-yellow-500/10 p-2 rounded-xl">
              <Cpu size={20} className="text-yellow-400" />
            </div>
            <h2 className="text-xl font-bold text-white">AI Models</h2>
          </div>
          <p className="text-xs text-gray-500 font-medium ml-1">Manage and monitor your AI processing models</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Active badge */}
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-2 rounded-xl">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[11px] font-black text-green-400">{activeCount} Models Active</span>
          </div>

          {/* Check for updates */}
          <button
            onClick={checkUpdates}
            disabled={checking}
            className="flex items-center gap-2 bg-[#1c1430] border border-gray-700 hover:border-gray-500 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-300 hover:text-white transition cursor-pointer"
          >
            {checking
              ? <><RefreshCw size={13} className="animate-spin" /> Checking...</>
              : <><RefreshCw size={13} /> Check for Updates</>}
          </button>
        </div>
      </header>

      {/* ── STAT CARDS ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Active Models"
          value={`${activeCount}/${models.length}`}
          icon={CheckCircle}
          iconBg="bg-green-500/10"
          iconColor="text-green-400"
          sub="models running"
        />
        <StatCard
          label="Memory Usage"
          value={totalMemory}
          icon={Cpu}
          iconBg="bg-indigo-500/10"
          iconColor="text-indigo-400"
          sub="MB allocated"
        />
        <StatCard
          label="Images Processed"
          value={totalImages.toLocaleString()}
          icon={ImageIcon}
          iconBg="bg-yellow-500/10"
          iconColor="text-yellow-400"
          sub="total across models"
        />
        <StatCard
          label="Avg Accuracy"
          value={`${avgAccuracy}%`}
          icon={Target}
          iconBg="bg-rose-500/10"
          iconColor="text-rose-400"
          sub="across all models"
        />
      </div>

      {/* ── AVAILABLE MODELS HEADER ─────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Activity size={15} className="text-indigo-400" />
          Available Models
          <span className="text-[10px] text-gray-600 bg-gray-800/60 border border-gray-700/40 px-2 py-0.5 rounded-full font-bold">
            {models.length}
          </span>
        </h3>
      </div>

      {/* ── MODEL CARDS GRID ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        {models.map(model => (
          <ModelCard
            key={model.id}
            model={model}
            onToggle={toggleModel}
            onInfo={m => setInfoModel(m)}
          />
        ))}
      </div>

      {/* ── INFO FOOTER ─────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 bg-[#161026] border border-indigo-500/15 rounded-2xl px-5 py-4">
        <div className="bg-indigo-500/10 p-2 rounded-xl flex-shrink-0 mt-0.5">
          <Info size={15} className="text-indigo-400" />
        </div>
        <div>
          <p className="text-xs font-bold text-indigo-300 mb-0.5">About AI Models</p>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            These AI models power the intelligent features of your photo organizer.
            Loading a model consumes system memory but enables real-time processing.
            Unload models you're not actively using to free up resources.
          </p>
        </div>
      </div>

    </div>
  );
}