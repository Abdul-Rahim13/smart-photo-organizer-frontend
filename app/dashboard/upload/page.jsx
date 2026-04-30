"use client"

import React, { useState, useRef, useCallback } from 'react';
import {
  CloudUpload, CheckCircle2, HardDrive, Bell, User, Search,
  X, FileImage, AlertCircle, Loader2, Upload, RefreshCw, Eye
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const ACCEPTED = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE  = 10 * 1024 * 1024; // 10 MB

const statusStyles = {
  waiting:    { color: 'text-gray-400',   bg: 'bg-gray-700/40',   label: 'Waiting'    },
  uploading:  { color: 'text-blue-400',   bg: 'bg-blue-500/15',   label: 'Uploading'  },
  done:       { color: 'text-green-400',  bg: 'bg-green-500/15',  label: 'Done'       },
  error:      { color: 'text-red-400',    bg: 'bg-red-500/15',    label: 'Error'      },
};

// ── Sub-components ────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, unit, iconColor, iconBg }) {
  return (
    <div className="bg-[#161026] border border-gray-800 rounded-2xl p-5 flex items-center justify-between group hover:border-gray-700 transition-all duration-200">
      <div>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">{label}</p>
        <div className="flex items-end gap-1.5">
          <span className="text-2xl font-black text-white">{value}</span>
          {unit && <span className="text-xs text-gray-500 font-medium mb-0.5">{unit}</span>}
        </div>
      </div>
      <div className={`${iconBg} ${iconColor} p-3 rounded-xl`}>
        <Icon size={22} />
      </div>
    </div>
  );
}

function FileRow({ file, onRemove }) {
  const { color, bg, label } = statusStyles[file.status];
  return (
    <div className={`flex items-center gap-4 p-3.5 rounded-xl border transition-all duration-200
      ${file.status === 'done'  ? 'border-green-500/20 bg-green-500/5'  :
        file.status === 'error' ? 'border-red-500/20 bg-red-500/5'      :
        'border-gray-800 bg-[#1c1430]/50'}`}>

      {/* Thumbnail / icon */}
      <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden">
        {file.preview
          ? <img src={file.preview} alt={file.name} className="w-full h-full object-cover"/>
          : <FileImage size={18} className="text-gray-500"/>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-100 truncate">{file.name}</p>
        <p className="text-[10px] text-gray-500 mt-0.5">{formatSize(file.size)}</p>

        {/* Progress bar */}
        {file.status === 'uploading' && (
          <div className="mt-1.5 h-1 bg-gray-800 rounded-full overflow-hidden w-full">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${file.progress}%` }}/>
          </div>
        )}
      </div>

      {/* Status badge */}
      <span className={`hidden sm:flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${bg} ${color} shrink-0`}>
        {file.status === 'uploading' && <Loader2 size={10} className="animate-spin"/>}
        {file.status === 'done'      && <CheckCircle2 size={10}/>}
        {file.status === 'error'     && <AlertCircle size={10}/>}
        {label}
      </span>

      {/* Remove */}
      {file.status !== 'uploading' && (
        <button onClick={() => onRemove(file.id)}
          className="text-gray-600 hover:text-red-400 transition cursor-pointer shrink-0 p-1">
          <X size={14}/>
        </button>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function UploadPage() {
  const [files, setFiles]       = useState([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  // ── Stats derived from files list
  const readyCount    = files.filter(f => f.status === 'waiting').length;
  const doneCount     = files.filter(f => f.status === 'done').length;
  const totalBytes    = files.reduce((acc, f) => acc + f.size, 0);

  // ── Add files helper
  const addFiles = useCallback((incoming) => {
    const valid = Array.from(incoming)
      .filter(f => ACCEPTED.includes(f.type) && f.size <= MAX_SIZE)
      .map(f => ({
        id:       `${f.name}-${Date.now()}-${Math.random()}`,
        name:     f.name,
        size:     f.size,
        type:     f.type,
        status:   'waiting',
        progress: 0,
        preview:  f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
      }));
    setFiles(prev => [...prev, ...valid]);
  }, []);

  // ── Drag handlers
  const onDragOver  = (e) => { e.preventDefault(); setDragging(true);  };
  const onDragLeave = ()  => setDragging(false);
  const onDrop      = (e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); };

  // ── Remove
  const removeFile = (id) => setFiles(prev => prev.filter(f => f.id !== id));
  const clearAll   = ()   => setFiles([]);

  // ── Simulate upload
  const startUpload = () => {
    if (!readyCount) return;
    setUploading(true);

    const waiting = files.filter(f => f.status === 'waiting');
    waiting.forEach((file, idx) => {
      // Start each file with a small stagger
      setTimeout(() => {
        setFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'uploading', progress: 0 } : f));

        // Simulate progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 20;
          if (progress >= 100) {
            clearInterval(interval);
            const success = Math.random() > 0.1; // 90% success rate
            setFiles(prev => prev.map(f =>
              f.id === file.id ? { ...f, status: success ? 'done' : 'error', progress: 100 } : f
            ));
            // Check if all done
            if (idx === waiting.length - 1) setUploading(false);
          } else {
            setFiles(prev => prev.map(f => f.id === file.id ? { ...f, progress: Math.min(progress, 95) } : f));
          }
        }, 150);
      }, idx * 400);
    });
  };

  return (
    <div className="flex h-screen bg-[#0f0a19] text-gray-100 overflow-hidden">

      <main className="flex-1 h-full overflow-y-auto custom-scrollbar p-6 md:p-8">

        {/* ── HEADER */}
        <header className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold">Dashboard</h2>
            <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/>
              <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider">System Active</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15}/>
              <input type="text" placeholder="Search photos, albums, or tags..."
                className="bg-[#1c1430] border border-gray-800 rounded-xl py-2 pl-9 pr-4 text-xs w-56 outline-none focus:border-indigo-500 transition"/>
            </div>
            <button className="p-2.5 bg-[#1c1430] border border-gray-800 rounded-xl text-gray-400 hover:text-white transition cursor-pointer">
              <Bell size={17}/>
            </button>
            <button className="flex items-center gap-2 bg-[#4f46e5] px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#4338ca] transition shadow-lg shadow-indigo-600/20 cursor-pointer">
              <User size={15}/> Abdul
            </button>
          </div>
        </header>

        {/* ── PAGE TITLE */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white mb-1">Upload Photos</h1>
          <p className="text-sm text-gray-500">Upload your images to start AI-powered organisation</p>
        </div>

        {/* ── STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard icon={CloudUpload}   label="Ready to Upload"       value={readyCount}               iconColor="text-yellow-400"  iconBg="bg-yellow-400/10"/>
          <StatCard icon={CheckCircle2}  label="Successfully Uploaded" value={doneCount}                iconColor="text-green-400"   iconBg="bg-green-400/10"/>
          <StatCard icon={HardDrive}     label="Total Size"            value={formatSize(totalBytes).split(' ')[0]} unit={formatSize(totalBytes).split(' ')[1] || 'B'} iconColor="text-blue-400" iconBg="bg-blue-400/10"/>
        </div>

        {/* ── DROP ZONE */}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-10 md:p-16 flex flex-col items-center justify-center text-center transition-all duration-200 mb-6 cursor-pointer
            ${dragging
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-gray-700 bg-[#161026] hover:border-gray-600 hover:bg-[#1c1430]'
            }`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPTED.join(',')}
            className="hidden"
            onChange={e => addFiles(e.target.files)}
          />

          {/* Icon */}
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all duration-200
            ${dragging ? 'bg-indigo-600/30 text-indigo-400' : 'bg-gray-800 text-gray-400'}`}>
            <CloudUpload size={30}/>
          </div>

          <h3 className="text-lg font-black text-white mb-2">
            {dragging ? 'Drop your images here' : 'Upload Images'}
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Drag and drop your images or click to browse
          </p>

          <button
            onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}
            className="bg-[#facc15] text-[#0f0a19] font-black text-sm px-8 py-3 rounded-xl hover:bg-yellow-300 transition-all duration-200 active:scale-95 cursor-pointer shadow-lg shadow-yellow-500/10">
            Browse Files
          </button>

          <p className="text-[11px] text-gray-600 mt-5">
            Supported formats: JPG, PNG, GIF, WEBP &nbsp;·&nbsp; Max size 10 MB per file
          </p>
        </div>

        {/* ── FILE LIST */}
        {files.length > 0 && (
          <div className="bg-[#161026] border border-gray-800 rounded-2xl overflow-hidden">

            {/* List header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-sm text-white">
                  Selected Files
                </h3>
                <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black px-2.5 py-1 rounded-full">
                  {files.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* Clear all */}
                {!uploading && (
                  <button onClick={clearAll}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 hover:text-red-400 transition cursor-pointer px-3 py-1.5 rounded-lg hover:bg-red-500/10">
                    <X size={13}/> Clear All
                  </button>
                )}
                {/* Retry errored */}
                {files.some(f => f.status === 'error') && !uploading && (
                  <button onClick={() => setFiles(p => p.map(f => f.status === 'error' ? {...f, status:'waiting', progress:0} : f))}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-orange-400 hover:text-orange-300 transition cursor-pointer px-3 py-1.5 rounded-lg hover:bg-orange-500/10">
                    <RefreshCw size={13}/> Retry Errors
                  </button>
                )}
                {/* Upload button */}
                <button
                  onClick={startUpload}
                  disabled={!readyCount || uploading}
                  className={`flex items-center gap-2 text-xs font-black px-4 py-2 rounded-xl transition-all cursor-pointer
                    ${readyCount && !uploading
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                      : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}>
                  {uploading
                    ? <><Loader2 size={14} className="animate-spin"/> Uploading…</>
                    : <><Upload size={14}/> Upload {readyCount > 0 ? `(${readyCount})` : ''}</>
                  }
                </button>
              </div>
            </div>

            {/* File rows */}
            <div className="p-4 space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
              {files.map(file => (
                <FileRow key={file.id} file={file} onRemove={removeFile}/>
              ))}
            </div>

            {/* Footer summary */}
            {doneCount > 0 && (
              <div className="px-5 py-3 border-t border-gray-800 bg-green-500/5 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-green-400"/>
                <span className="text-xs text-green-400 font-semibold">
                  {doneCount} file{doneCount > 1 ? 's' : ''} uploaded successfully
                </span>
                <button className="ml-auto flex items-center gap-1.5 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition cursor-pointer">
                  <Eye size={12}/> View in Gallery
                </button>
              </div>
            )}
          </div>
        )}

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