"use client"

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { uploadPhotoAction } from '../../../src/redux/slices/photoSlice';
import * as tf from '@tensorflow/tfjs';
import TopBar from '../../../components/TopBar';

// ── Icons ─────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 18, className = '', strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);
const IcUpload = ({ size, className }) => <Icon size={size} className={className} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12V4m0 0L8 8m4-4l4 4" />;
const IcCheck  = ({ size, className }) => <Icon size={size} className={className} d="M20 6L9 17l-5-5" />;
const IcX      = ({ size, className }) => <Icon size={size} className={className} d="M18 6L6 18M6 6l12 12" />;
const IcAlert  = ({ size, className }) => <Icon size={size} className={className} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />;
const IcImage  = ({ size, className }) => <Icon size={size} className={className} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 20M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" />;
const IcGrid   = ({ size, className }) => <Icon size={size} className={className} d="M3 3h7v7H3zM3 14h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7z" strokeWidth={1.5} />;
const IcList   = ({ size, className }) => <Icon size={size} className={className} d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />;
const IcStar   = ({ size, className }) => <Icon size={size} className={className} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />;
const IcZap    = ({ size, className }) => <Icon size={size} className={className} d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />;
const IcDisk   = ({ size, className }) => <Icon size={size} className={className} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />;
const IcLoader = ({ size, className }) => <Icon size={size} className={`animate-spin ${className}`} d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />;

// ── Constants ─────────────────────────────────────────────────────────────
const ACCEPTED = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE  = 10 * 1024 * 1024;

// ── AI Label Maps ─────────────────────────────────────────────────────────
const ENV_LABELS    = ['Events', 'Outdoor', 'Indoor'];
const PEOPLE_LABELS = ['Solo', 'Two persons', 'Group'];

const CATEGORIES = {
  Events:    { icon: '🎉', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.4)',  desc: 'Gatherings & Parties', gradient: 'linear-gradient(135deg,#f59e0b,#ef4444)' },
  Outdoor:   { icon: '🌿', color: '#10b981', bg: 'rgba(16,185,129,0.15)',  border: 'rgba(16,185,129,0.4)',  desc: 'Nature & Landscapes',    gradient: 'linear-gradient(135deg,#10b981,#06b6d4)' },
  Indoor:    { icon: '🏠', color: '#6366f1', bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.4)', desc: 'Rooms & Interiors',     gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
  'Solo':       { icon: '👤', color: '#38bdf8', bg: 'rgba(56,189,248,0.15)', border: 'rgba(56,189,248,0.4)' },
  'Two persons': { icon: '👥', color: '#ec4899', bg: 'rgba(236,72,153,0.15)', border: 'rgba(236,72,153,0.4)' },
  'Group':       { icon: '👪', color: '#a855f7', bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.4)' }
};

const formatSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// ── Toast System ──────────────────────────────────────────────────────────
let toastId = 0;
function ToastContainer({ toasts, onRemove }) {
  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', borderRadius: 12,
          background: t.type === 'success' ? 'linear-gradient(135deg,#059669,#10b981)'
            : t.type === 'error'   ? 'linear-gradient(135deg,#dc2626,#ef4444)'
            : t.type === 'warning' ? 'linear-gradient(135deg,#d97706,#f59e0b)'
            : 'linear-gradient(135deg,#4f46e5,#7c3aed)',
          color: '#fff', fontSize: 13, fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.15)',
          backdropFilter: 'blur(12px)',
          animation: 'toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          pointerEvents: 'all', minWidth: 280, maxWidth: 380,
        }}>
          <span style={{ fontSize: 16 }}>
            {t.type === 'success' ? '✓' : t.type === 'error' ? '✗' : t.type === 'warning' ? '⚠' : 'ℹ'}
          </span>
          <span style={{ flex: 1 }}>{t.message}</span>
          <button onClick={() => onRemove(t.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 2, borderRadius: 4, display: 'flex', alignItems: 'center' }}>
            <IcX size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Category Badge ────────────────────────────────────────────────────────
function CategoryBadge({ category, style: extraStyle = {} }) {
  if (!category) return null;
  const cat = CATEGORIES[category] || { icon: '📂', color: '#94a3b8', bg: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.4)' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 20,
      background: cat.bg, border: `1px solid ${cat.border}`,
      color: cat.color, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
      whiteSpace: 'nowrap',
      ...extraStyle,
    }}>
      {cat.icon} {category}
    </span>
  );
}

// ── Status Chip ───────────────────────────────────────────────────────────
function StatusChip({ status }) {
  const cfg = {
    waiting:   { label: 'Ready',      bg: 'rgba(100,116,139,0.2)', color: '#94a3b8' },
    uploading: { label: 'Analyzing…', bg: 'rgba(99,102,241,0.2)',  color: '#818cf8' },
    done:      { label: 'Done',       bg: 'rgba(16,185,129,0.2)',  color: '#34d399' },
    error:     { label: 'Failed',     bg: 'rgba(239,68,68,0.2)',   color: '#f87171' },
  }[status] || { label: status, bg: 'rgba(100,116,139,0.2)', color: '#94a3b8' };

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 20,
      background: cfg.bg, color: cfg.color,
      fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
    }}>
      {status === 'uploading' && <IcLoader size={10} />}
      {status === 'done'      && <IcCheck  size={10} />}
      {status === 'error'     && <IcAlert  size={10} />}
      {cfg.label}
    </span>
  );
}

// ── Grid File Card (With Embedded Confidence Vectors) ─────────────────────
function FileCard({ file, onRemove }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', borderRadius: 14, overflow: 'hidden',
        aspectRatio: '1 / 1', cursor: 'pointer',
        border: file.status === 'done' ? '2px solid rgba(16,185,129,0.5)' : '2px solid rgba(255,255,255,0.06)',
        transform: hovered ? 'scale(1.03)' : 'scale(1)',
        transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: hovered ? '0 16px 40px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.3)',
      }}
    >
      {file.preview ? (
        <img src={file.preview} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IcImage size={40} />
        </div>
      )}

      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.92) 0%,rgba(0,0,0,0.3) 60%,transparent 100%)' }} />

      <div style={{ position: 'absolute', top: 8, left: 8, right: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <StatusChip status={file.status} />
        {file.status !== 'uploading' && (
          <button
            onClick={e => { e.stopPropagation(); onRemove(file.id); }}
            style={{
              background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff',
              width: 24, height: 24, borderRadius: 8, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: hovered ? 1 : 0, transition: 'opacity 0.2s',
            }}
          >
            <IcX size={12} />
          </button>
        )}
      </div>

      {file.status === 'uploading' && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.1)' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', width: `${file.progress}%`, transition: 'width 0.3s ease' }} />
        </div>
      )}

      <div style={{ position: 'absolute', bottom: 8, left: 8, right: 8 }}>
        {/* Dual dynamic badge matrix */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
          {file.category && <CategoryBadge category={file.category} />}
          {file.peopleTag && <CategoryBadge category={file.peopleTag} />}
        </div>
        
        {/* Real-time confidence metrics panel */}
        {(file.envBreakdown || file.peopleBreakdown) && (
          <div style={{ 
            background: 'rgba(4,2,14,0.75)', 
            padding: '5px 7px', 
            borderRadius: 8, 
            marginBottom: 6,
            fontSize: 10,
            border: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(4px)'
          }}>
            {file.envBreakdown && (
              <div style={{ color: '#a5b4fc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ opacity: 0.85 }}>Environment ({file.envBreakdown[0].label}):</span>
                <span style={{ fontWeight: 800, fontFamily: 'monospace' }}>{file.envBreakdown[0].confidence}%</span>
              </div>
            )}
            {file.peopleBreakdown && (
              <div style={{ color: '#f472b6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 }}>
                <span style={{ opacity: 0.85 }}>Population ({file.peopleBreakdown[0].label}):</span>
                <span style={{ fontWeight: 800, fontFamily: 'monospace' }}>{file.peopleBreakdown[0].confidence}%</span>
              </div>
            )}
          </div>
        )}

        <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {file.name}
        </p>
      </div>

      {file.status === 'done' && (
        <div style={{
          position: 'absolute', top: -6, right: -6,
          width: 22, height: 22, borderRadius: '50%',
          background: 'linear-gradient(135deg,#059669,#10b981)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(16,185,129,0.5)',
          animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          <IcCheck size={11} />
        </div>
      )}
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({ icon: IconComp, label, value, unit, accent }) {
  return (
    <div
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '20px 22px', cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = accent + '60'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
    >
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: accent + '15', filter: 'blur(20px)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: accent + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent }}>
          <IconComp size={18} />
        </div>
        <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>{value}</span>
        {unit && <span style={{ fontSize: 12, color: '#64748b' }}>{unit}</span>}
      </div>
    </div>
  );
}

// ── Taxonomy Summary Card ─────────────────────────────────────────────────
function CategorySummaryCard({ category, count, files }) {
  const cat = CATEGORIES[category] || { icon: '📂', color: '#fff', gradient: 'linear-gradient(135deg,#64748b,#475569)', desc: 'Image cluster' };
  const [exp, setExp] = useState(false);
  const catFiles = files.filter(f => (f.category === category || f.peopleTag === category) && f.status === 'done');

  return (
    <div
      style={{ background: cat.bg || 'rgba(255,255,255,0.02)', border: `1px solid ${cat.border || 'rgba(255,255,255,0.08)'}`, borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }}
      onClick={() => setExp(x => !x)}
    >
      <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: cat.gradient || 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
          {cat.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: cat.color }}>{category}</p>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{cat.desc || 'Sorted results'}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 24, fontWeight: 800, color: cat.color, lineHeight: 1 }}>{count}</span>
          <p style={{ margin: '2px 0 0', fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>photos</p>
        </div>
      </div>
      {exp && catFiles.length > 0 && (
        <div style={{ borderTop: `1px solid ${cat.border || 'rgba(255,255,255,0.08)'}`, padding: '10px 12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(56px,1fr))', gap: 6 }}>
            {catFiles.map(f => (
              <div key={f.id} style={{ aspectRatio: '1/1', borderRadius: 8, overflow: 'hidden', border: `1px solid ${cat.border || 'rgba(255,255,255,0.08)'}` }}>
                {f.preview && <img src={f.preview} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page Component ───────────────────────────────────────────────────
export default function UploadPage() {
  const dispatch = useDispatch();
  const [files, setFiles]               = useState([]);
  const [dragging, setDragging]         = useState(false);
  const [uploading, setUploading]       = useState(false);
  
  // Custom Machine Learning Structural States
  const [envModel, setEnvModel]         = useState(null);
  const [peopleModel, setPeopleModel]   = useState(null);
  const [modelLoading, setModelLoading] = useState(true);
  
  const [viewMode, setViewMode]         = useState('grid');
  const [toasts, setToasts]             = useState([]);
  const inputRef = useRef(null);

  const addToast = useCallback((message, type = 'info') => {
    const id = ++toastId;
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 5000);
  }, []);

  const removeToast = useCallback((id) => setToasts(p => p.filter(t => t.id !== id)), []);

  // ── STEP 1: LOAD DUAL CUSTOM AI CORES (WITH MOUNT TRACKER CLEANUP) ──
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        // Load Core Layer 1: Environment Metrics
        const mEnv = await tf.loadLayersModel('/model/model.json');
        if (isMounted) setEnvModel(mEnv);

        // Load Core Layer 2: Population Structures (People Folder Structure)
        const mPeople = await tf.loadLayersModel('/model/people/model.json');
        if (isMounted) setPeopleModel(mPeople);

        if (isMounted) {
          setModelLoading(false);
          addToast('Dual custom AI cores synchronized!', 'success');
        }
      } catch (e) {
        console.error("TensorFlow system initialization failure:", e);
        if (isMounted) {
          setModelLoading(false);
          addToast('Failed to load local AI model files', 'error');
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [addToast]);

  const readyCount = files.filter(f => f.status === 'waiting').length;
  const doneCount  = files.filter(f => f.status === 'done').length;
  const errorCount = files.filter(f => f.status === 'error').length;
  const totalBytes = files.reduce((acc, f) => acc + f.size, 0);

  const combineLabels = [...ENV_LABELS, ...PEOPLE_LABELS];
  const categoryCounts = combineLabels.reduce((acc, l) => {
    acc[l] = files.filter(f => f.category === l || f.peopleTag === l).length;
    return acc;
  }, {});

  const addFiles = useCallback((incoming) => {
    const valid = Array.from(incoming).map(f => {
      if (!ACCEPTED.includes(f.type)) { addToast(`${f.name} — unsupported file type`, 'warning'); return null; }
      if (f.size > MAX_SIZE)          { addToast(`${f.name} exceeds 10 MB limit`, 'warning'); return null; }
      return { 
        id: `${f.name}-${Date.now()}-${Math.random()}`, 
        name: f.name, size: f.size, type: f.type, rawFile: f, 
        status: 'waiting', progress: 0, 
        category: null, peopleTag: null,
        envBreakdown: null, peopleBreakdown: null,
        preview: URL.createObjectURL(f) 
      };
    }).filter(Boolean);
    if (valid.length) { setFiles(p => [...p, ...valid]); addToast(`${valid.length} image${valid.length > 1 ? 's' : ''} added to queue`, 'success'); }
  }, [addToast]);

  const removeFile = (id) => { setFiles(p => p.filter(f => f.id !== id)); addToast('File removed from queue', 'info'); };
  const clearAll   = ()   => { setFiles([]); addToast('All files cleared', 'info'); };

  // ── STEP 2: DUAL-LAYER CONFIDENCE INFERENCE PIPELINE ──
  const startUpload = async () => {
    if (!readyCount) return;
    if (!envModel || !peopleModel) { addToast('Neural processing engines loading…', 'warning'); return; }
    setUploading(true);
    const waiting = files.filter(f => f.status === 'waiting');
    let ok = 0;

    for (const fileObj of waiting) {
      setFiles(p => p.map(f => f.id === fileObj.id ? { ...f, status: 'uploading', progress: 20 } : f));
      try {
        const img = new Image();
        img.src = fileObj.preview;
        
        const analysis = await new Promise((res, rej) => {
          img.onload = async () => {
            try {
              // Normalize image dimensions to standard 224x224 execution arrays
              const tensor = tf.tidy(() =>
                tf.browser.fromPixels(img).resizeNearestNeighbor([224, 224]).toFloat().div(127.5).sub(1).expandDims()
              );

              // Engine Prediction Core 1: Context Environment Location
              const envPreds = await envModel.predict(tensor).data();
              const envArray = Array.from(envPreds);
              const maxEnvIdx = envArray.indexOf(Math.max(...envArray));
              const detectedEnv = ENV_LABELS[maxEnvIdx];
              
              // Map out complete environment structural arrays sorted by highest confidence score
              const envBreakdown = ENV_LABELS.map((label, idx) => ({
                label,
                confidence: Math.round(envArray[idx] * 100)
              })).sort((a, b) => b.confidence - a.confidence);

              setFiles(p => p.map(f => f.id === fileObj.id ? { ...f, progress: 60 } : f));

              // Engine Prediction Core 2: Population Multi-density Vectors
              const peoplePreds = await peopleModel.predict(tensor).data();
              const peopleArray = Array.from(peoplePreds);
              const maxPeopleIdx = peopleArray.indexOf(Math.max(...peopleArray));
              const detectedPeople = PEOPLE_LABELS[maxPeopleIdx];

              // Map out population structural density values sorted by highest confidence score
              const peopleBreakdown = PEOPLE_LABELS.map((label, idx) => ({
                label,
                confidence: Math.round(peopleArray[idx] * 100)
              })).sort((a, b) => b.confidence - a.confidence);

              tensor.dispose(); // Prevent client browser memory overhead
              res({ detectedEnv, detectedPeople, envBreakdown, peopleBreakdown });
            } catch (e) { rej(e); }
          };
          img.onerror = () => rej('Image loading failure');
        });

        // ── STEP 3: DISPATCH VECTOR CLASSIFICATIONS TO REDUX CORE BACKEND ──
        await dispatch(uploadPhotoAction({ 
          file: fileObj.rawFile, 
          category: analysis.detectedEnv,    
          peopleTag: analysis.detectedPeople 
        })).unwrap();

        setFiles(p => p.map(f => f.id === fileObj.id ? { 
          ...f, 
          status: 'done', 
          progress: 100, 
          category: analysis.detectedEnv,
          peopleTag: analysis.detectedPeople,
          envBreakdown: analysis.envBreakdown,
          peopleBreakdown: analysis.peopleBreakdown
        } : f));

        addToast(`${fileObj.name} routed to system database`, 'success');
        ok++;
      } catch (err) {
        console.error("Deep analysis tracking exception for file:", fileObj.name, err);
        setFiles(p => p.map(f => f.id === fileObj.id ? { ...f, status: 'error' } : f));
        addToast(`Deep analysis failed: ${fileObj.name}`, 'error');
      }
    }
    setUploading(false);
    if (ok > 0) addToast(`${ok} files processed, verified, and safely recorded!`, 'success');
  };

  const hasDoneCategories = combineLabels.some(l => categoryCounts[l] > 0);

  const aiStatusPill = (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 7,
      padding: '5px 12px', borderRadius: 20,
      background: modelLoading ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
      border: `1px solid ${modelLoading ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'}`,
      cursor: 'default',
    }}>
      <div style={{
        width: 7, height: 7, borderRadius: '50%',
        background: modelLoading ? '#f59e0b' : '#10b981',
        animation: modelLoading ? 'pulse 1s infinite' : 'none',
      }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: modelLoading ? '#f59e0b' : '#10b981', letterSpacing: '0.04em' }}>
        {modelLoading ? 'SYNCING AI' : 'AI DUAL NETWORKS ONLINE'}
      </span>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(145deg,#040210 0%,#0b0820 40%,#0f0c1e 100%)', fontFamily: "'DM Sans',system-ui,sans-serif", color: '#e2e8f0' }}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* ── HEADER NAVIGATION TOP BAR ── */}
      <div style={{ background: 'rgba(4,2,16,0.85)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ padding: '16px 32px' }}>
          <TopBar title="Upload Smart Photos" showStatus={false} searchPlaceholder="Search files…" rightExtra={aiStatusPill} />
        </div>
      </div>

      {/* ── CORE LAYOUT FRAME ── */}
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 32px 80px' }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 4, height: 28, borderRadius: 2, background: 'linear-gradient(to bottom,#6366f1,#8b5cf6)' }} />
            <h2 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.03em' }}>Upload &amp; Extract</h2>
          </div>
          <p style={{ margin: 0, marginLeft: 16, fontSize: 14, color: '#475569' }}>
            Drop files — our customized deep networks simultaneously resolve environment contexts &amp; population structures.
          </p>
        </div>

        {/* Dynamic Tracking Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
          <StatCard icon={IcUpload} label="Ready"      value={readyCount}  accent="#6366f1" />
          <StatCard icon={IcCheck}  label="Completed"  value={doneCount}   accent="#10b981" />
          <StatCard icon={IcAlert}  label="Failed"     value={errorCount}  accent="#ef4444" />
          <StatCard icon={IcDisk}   label="Total Size" value={formatSize(totalBytes).split(' ')[0]} unit={formatSize(totalBytes).split(' ')[1] || 'B'} accent="#f59e0b" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: hasDoneCategories ? '1fr 320px' : '1fr', gap: 24 }}>
          {/* Main Drag-Drop Interaction Frame */}
          <div>
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
              onClick={() => !uploading && inputRef.current?.click()}
              style={{
                borderRadius: 20,
                border: dragging ? '2px solid #6366f1' : '2px dashed rgba(255,255,255,0.12)',
                background: dragging ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)',
                padding: '48px 24px', textAlign: 'center', cursor: 'pointer',
                transition: 'all 0.25s', transform: dragging ? 'scale(1.01)' : 'scale(1)',
                marginBottom: 24,
              }}
            >
              <input ref={inputRef} type="file" multiple accept={ACCEPTED.join(',')} style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
              <div style={{
                width: 72, height: 72, borderRadius: 20, margin: '0 auto 20px',
                background: dragging ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s', transform: dragging ? 'scale(1.1) rotate(-3deg)' : 'scale(1)',
                color: dragging ? '#818cf8' : '#475569',
              }}>
                <IcUpload size={32} />
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: dragging ? '#818cf8' : '#94a3b8' }}>
                {dragging ? 'Release to add files' : 'Drop smart photos here or click to browse'}
              </h3>
              <p style={{ margin: '0 0 24px', fontSize: 13, color: '#334155' }}>JPEG, PNG, GIF, WebP · max 10 MB each</p>
            </div>

            {/* Managed Active Queue Grid */}
            {files.length > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>Queue</span>
                    <span style={{ padding: '3px 10px', borderRadius: 20, background: 'rgba(99,102,241,0.2)', color: '#818cf8', fontSize: 11, fontWeight: 700 }}>{files.length}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 3, gap: 2 }}>
                      {[['grid', IcGrid], ['list', IcList]].map(([mode, Ic]) => (
                        <button key={mode} onClick={() => setViewMode(mode)} style={{
                          background: viewMode === mode ? 'rgba(99,102,241,0.3)' : 'none',
                          border: 'none', borderRadius: 8, padding: '5px 8px',
                          color: viewMode === mode ? '#818cf8' : '#475569', cursor: 'pointer', display: 'flex', transition: 'all 0.2s',
                        }}>
                          <Ic size={14} />
                        </button>
                      ))}
                    </div>

                    {!uploading && (
                      <button onClick={clearAll} style={{
                        background: 'none', border: '1px solid rgba(239,68,68,0.2)',
                        color: '#ef4444', padding: '6px 12px', borderRadius: 9,
                        fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.2s',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                      >
                        <IcX size={12} /> Clear All
                      </button>
                    )}

                    <button onClick={startUpload} disabled={!readyCount || uploading || !envModel || !peopleModel} style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      padding: '8px 18px', borderRadius: 10, border: 'none',
                      background: readyCount && !uploading && envModel && peopleModel ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : 'rgba(255,255,255,0.06)',
                      color: readyCount && !uploading && envModel && peopleModel ? '#fff' : '#334155',
                      fontSize: 13, fontWeight: 700,
                      cursor: readyCount && !uploading && envModel && peopleModel ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s',
                      boxShadow: readyCount && !uploading && envModel && peopleModel ? '0 4px 14px rgba(99,102,241,0.35)' : 'none',
                    }}>
                      {uploading ? <><IcLoader size={14} /> Analyzing Structural Vectors…</> : <><IcZap size={14} /> {envModel && peopleModel ? `Upload ${readyCount}` : 'Mounting Tensors…'}</>}
                    </button>
                  </div>
                </div>

                <div style={{ padding: 20, maxHeight: 'calc(100vh - 380px)', overflowY: 'auto' }}>
                  {viewMode === 'grid' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 14 }}>
                      {files.map(f => <FileCard key={f.id} file={f} onRemove={removeFile} />)}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {files.map(f => (
                        <div key={f.id} style={{
                          display: 'flex', alignItems: 'center', gap: 14,
                          padding: '10px 14px', borderRadius: 12,
                          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                          cursor: 'pointer', transition: 'all 0.2s',
                        }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                        >
                          <div style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            {f.preview && <img src={f.preview} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                              <span style={{ fontSize: 11, color: '#475569' }}>{formatSize(f.size)}</span>
                              <div style={{ display: 'flex', gap: 4 }}>
                                {f.category && <CategoryBadge category={f.category} />}
                                {f.peopleTag && <CategoryBadge category={f.peopleTag} />}
                              </div>
                            </div>
                          </div>
                          <StatusChip status={f.status} />
                          {f.status !== 'uploading' && (
                            <button onClick={() => removeFile(f.id)} style={{
                              background: 'none', border: 'none', color: '#475569', cursor: 'pointer',
                              padding: 4, borderRadius: 6, display: 'flex', transition: 'color 0.2s',
                            }}
                              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                              onMouseLeave={e => e.currentTarget.style.color = '#475569'}
                            >
                              <IcX size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Container: Taxonomy Sidebar Summary */}
          {hasDoneCategories && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <IcStar size={16} style={{ color: '#6366f1' }} />
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Unified Taxonomy</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {combineLabels.map(label => categoryCounts[label] > 0 && (
                  <CategorySummaryCard key={label} category={label} count={categoryCounts[label]} files={files} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}