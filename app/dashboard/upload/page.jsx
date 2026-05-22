"use client"

import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addPhotoToStore } from '../../../src/redux/slices/photoSlice';
import TopBar from '../../../components/TopBar';
import axios from 'axios';

// ── CUSTOM INLINE SVG GRAPHICS ───────────────────────────────────────────
const IconRenderer = ({ pathString, size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d={pathString} />
  </svg>
);

const FolderIcon = () => <IconRenderer color="#eab308" pathString="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" size={24} />;
const UploadIcon = () => <IconRenderer pathString="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12V4m0 0L8 8m4-4l4 4" size={16} />;

// ── SYSTEM NAVIGATION VARIABLES ──────────────────────────────────────────
const TAXONOMY_THEMES  = ['Party', 'Event', 'Trip', 'General'];
const TAXONOMY_ENVS    = ['Indoor', 'Outdoor'];
const TAXONOMY_SOCIALS = ['Solo', 'Couple', 'Group', 'Empty'];

const DISPLAY_THEMES = {
  Party:   { em: '🕺', tint: '#ec4899', desc: 'Social gathering events' },
  Event:   { em: '🎉', tint: '#f59e0b', desc: 'Conferences & milestones' },
  Trip:    { em: '✈️', tint: '#10b981', desc: 'Travel & scenery pictures' },
  General: { em: '📷', tint: '#94a3b8', desc: 'Unassigned collections' },
  Indoor:  { em: '🏠', tint: '#6366f1', desc: 'Inside structures' },
  Outdoor: { em: '🌿', tint: '#06b6d4', desc: 'Outside environments' },
  Solo:    { em: '👤', tint: '#38bdf8', desc: 'Single subjects' },
  Couple:  { em: '👥', tint: '#f43f5e', desc: 'Pair settings' },
  Group:   { em: '👪', tint: '#a855f7', desc: 'Multiple individuals' },
  Empty:   { em: '🖼️', tint: '#64748b', desc: 'No persons found' },
};

export default function RebuiltUploadDashboard() {
  const dispatch = useDispatch();
  const fileSelectorRef = useRef(null);

  // Buffer lists for keeping track of local state
  const [stagingQueue, setStagingQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Folder Browsing Navigation Drilling Tiers
  const [drillLevel1, setDrillLevel1] = useState(null); // Filter by Master Theme Category
  const [drillLevel2, setDrillLevel2] = useState(null); // Filter by Spatial Environment Zone
  const [drillLevel3, setDrillLevel3] = useState(null); // Filter by Social Distribution Configuration

  // Connect cleanly to Redux structure for indexing representations
  const globalPhotosList = useSelector((state) => state.photos?.items || []);

  const ingestSelectedFiles = (e) => {
    const selected = e.target.files;
    if (!selected) return;

    const formatted = Array.from(selected).map(file => ({
      uniqueId: `${file.name}-${Date.now()}-${Math.random()}`,
      name: file.name,
      blobUrl: URL.createObjectURL(file),
      binaryPointer: file,
      processingStatus: 'waiting', // waiting | active | success | error
    }));

    setStagingQueue(prev => [...prev, ...formatted]);
  };

  // ── CORE AUTOMATED PIPELINE AGGREGATOR (UPDATED TO INCLUDE DB SAVE LOGIC) ──
  const dispatchBatchAnalysis = async () => {
    if (isProcessing || !stagingQueue.some(item => item.processingStatus === 'waiting')) return;
    setIsProcessing(true);

    const activeWorkingQueue = [...stagingQueue];

    for (let currentItem of activeWorkingQueue) {
      if (currentItem.processingStatus !== 'waiting') continue;

      // Update file state row to active visual loader indicator
      setStagingQueue(prev => prev.map(el => el.uniqueId === currentItem.uniqueId ? { ...el, processingStatus: 'active' } : el));

      try {
        const payloadForm = new FormData();
        payloadForm.append('file', currentItem.binaryPointer);

        // 🔒 EXTRACTION CRITICAL FIX: Fetch your token payload from browser storage
        const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';

        const serverResponse = await axios.post('/api/analyze', payloadForm, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            // Passing the bearer auth token ensures Express app saves with user id mapping rules
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        });

        if (serverResponse.data && serverResponse.data.success) {
          const processedPayload = serverResponse.data;

          // Backend response returns saved photos array configuration cleanly
          const dbInstanceRecord = Array.isArray(processedPayload.data) 
            ? processedPayload.data[0] 
            : (processedPayload.photo || processedPayload.data);

          const displayAsset = {
            ...dbInstanceRecord,
            // Fallback preview validation properties
            url: dbInstanceRecord?.imageUrl || dbInstanceRecord?.url || currentItem.blobUrl 
          };

          // Update staging queue item status to success
          setStagingQueue(prev => prev.map(el => el.uniqueId === currentItem.uniqueId ? { ...el, processingStatus: 'success' } : el));

          // Dispatch to global Redux store with correct flat structure
          dispatch(addPhotoToStore(displayAsset));

        } else {
          throw new Error('API returned unsuccessful response');
        }
      } catch (err) {
        console.error("Ingestion item analysis mapping error:", err);
        setStagingQueue(prev => prev.map(el => el.uniqueId === currentItem.uniqueId ? { ...el, processingStatus: 'error' } : el));
      }
    }
    setIsProcessing(false);
  };

  // ── DYNAMIC COMPUTER INTERFACE FILTER MATRICES ─────────────────────────
  const activePartitionedAssets = globalPhotosList.filter(photo => {
    if (drillLevel1 && photo.category !== drillLevel1) return false;
    if (drillLevel2 && photo.environment !== drillLevel2) return false;
    if (drillLevel3 && photo.socialGroup !== drillLevel3) return false;
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#09070f', color: '#f1f5f9', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      <TopBar title="AI Multi-Tier Classification Vault Portal" />

      <main style={{ maxWidth: 1200, margin: '0 auto', marginTop: 30 }}>
        
        {/* TOP COMPONENT BLOCK: Ingestion Control Terminal */}
        <section style={{ backgroundColor: '#13111c', border: '1px solid #231f33', borderRadius: 16, padding: 24, marginBottom: 32 }}>
          <h2 style={{ marginTop: 0, fontSize: 18, fontWeight: 700 }}>1. Ingestion Control Ingest Module</h2>
          <p style={{ color: '#94a3b8', fontSize: 13, marginTop: -6, marginBottom: 20 }}>Select raw file representations to run neural mapping engines across custom parameters.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            <div style={{ padding: 16, background: '#1c1929', borderRadius: 12, border: '1px solid #2d2842' }}>
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Staged Items Ready</div>
              <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4, color: '#6366f1' }}>{stagingQueue.filter(i => i.processingStatus === 'waiting').length}</div>
            </div>
            <div style={{ padding: 16, background: '#1c1929', borderRadius: 12, border: '1px solid #2d2842' }}>
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Processed Current Run</div>
              <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4, color: '#10b981' }}>{stagingQueue.filter(i => i.processingStatus === 'success').length}</div>
            </div>
            <div style={{ padding: 16, background: '#1c1929', borderRadius: 12, border: '1px solid #2d2842' }}>
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Total Active Memory Vault Items</div>
              <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4, color: '#f59e0b' }}>{globalPhotosList.length}</div>
            </div>
          </div>

          <div 
            onClick={() => fileSelectorRef.current?.click()}
            style={{ border: '2px dashed #312b4d', borderRadius: 12, padding: '30px 20px', textAlign: 'center', cursor: 'pointer', background: '#181524', transition: 'border-color 0.2s' }}
          >
            <input ref={fileSelectorRef} type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={ingestSelectedFiles} />
            <span style={{ display: 'inline-flex', padding: 10, background: '#231f38', borderRadius: 50, marginBottom: 10 }}><UploadIcon /></span>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Click here to look up image binaries locally</div>
            <div style={{ fontSize: 11, color: '#4b5563', marginTop: 4 }}>Supports JPEG, PNG, WEBP formats</div>
          </div>

          {/* Local Selection Render List View */}
          {stagingQueue.length > 0 && (
            <div style={{ marginTop: 24, borderTop: '1px solid #231f33', paddingTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h4 style={{ margin: 0, fontSize: 14 }}>Staged Pipelines Processing Queue</h4>
                <button 
                  onClick={dispatchBatchAnalysis} 
                  disabled={isProcessing || !stagingQueue.some(i => i.processingStatus === 'waiting')}
                  style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 8, fontWeight: 600, fontSize: 12, cursor: 'pointer', opacity: isProcessing ? 0.6 : 1 }}
                >
                  {isProcessing ? "Computing Matrix Nodes..." : "Execute Classification Layers"}
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 12 }}>
                {stagingQueue.map(item => (
                  <div key={item.uniqueId} style={{ position: 'relative', aspectRatio: '1/1', background: '#000', borderRadius: 10, overflow: 'hidden', border: '1px solid #2d2842' }}>
                    <img src={item.blobUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: item.processingStatus === 'active' ? 0.4 : 1 }} alt="Thumb Preview" />
                    <div style={{
                      position: 'absolute', bottom: 6, left: 6, right: 6, padding: '3px 0', borderRadius: 4, fontSize: 10, fontWeight: 700, textAlign: 'center', color: '#fff',
                      background: item.processingStatus === 'success' ? 'rgba(16,185,129,0.85)' : item.processingStatus === 'active' ? 'rgba(99,102,241,0.85)' : item.processingStatus === 'error' ? 'rgba(239,68,68,0.85)' : 'rgba(0,0,0,0.7)'
                    }}>
                      {item.processingStatus === 'success' ? '✓ Processed' : item.processingStatus === 'active' ? 'Analyzing…' : item.processingStatus === 'error' ? '⚠️ Fault' : 'Ready'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* BOTTOM COMPONENT BLOCK: Multi-Tier Folder Taxonomy Tree */}
        <section style={{ backgroundColor: '#13111c', border: '1px solid #231f33', borderRadius: 16, padding: 24 }}>
          <h2 style={{ marginTop: 0, fontSize: 18, fontWeight: 700 }}>2. Indexed Relational Taxonomy Explorer</h2>
          
          {/* Virtual File System Dynamic Path Breadcrumbs */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: '#64748b', background: '#09070f', padding: '12px 16px', borderRadius: 10, margin: '14px 0 24px 0', border: '1px solid #1c1929' }}>
            <span style={{ cursor: 'pointer', color: '#6366f1', fontWeight: 600 }} onClick={() => { setDrillLevel1(null); setDrillLevel2(null); setDrillLevel3(null); }}>root_vault</span>
            {drillLevel1 && <><span style={{ color: '#334155' }}>/</span><span style={{ cursor: 'pointer', color: '#6366f1', fontWeight: 600 }} onClick={() => { setDrillLevel2(null); setDrillLevel3(null); }}>{drillLevel1}</span></>}
            {drillLevel2 && <><span style={{ color: '#334155' }}>/</span><span style={{ cursor: 'pointer', color: '#6366f1', fontWeight: 600 }} onClick={() => setDrillLevel3(null)}>{drillLevel2}</span></>}
            {drillLevel3 && <><span style={{ color: '#334155' }}>/</span><span style={{ color: '#f8fafc', fontWeight: 600 }}>{drillLevel3}</span></>}
          </div>

          {/* DRILL LEVEL 1: Master Category Theme Folder Layout Grid */}
          {!drillLevel1 ? (
            <div>
              <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 14, fontWeight: 500 }}>📁 Tier 1 Directories: Primary Category Themes</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
                {TAXONOMY_THEMES.map(theme => {
                  const dataStyle = DISPLAY_THEMES[theme];
                  const matchCount = globalPhotosList.filter(p => p.category === theme).length;
                  return (
                    <div key={theme} onClick={() => setDrillLevel1(theme)} style={{ background: '#1c1929', border: '1px solid #2d2842', borderRadius: 12, padding: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}>
                      <FolderIcon />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: dataStyle.tint }}>{theme}/</div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>{matchCount} mapped objects</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : !drillLevel2 ? (
            /* DRILL LEVEL 2: Indoor / Outdoor Spatial Folder Layout Grid */
            <div>
              <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 14, fontWeight: 500 }}>📁 Tier 2 Subdirectories: Spatial Environment Zones</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
                {TAXONOMY_ENVS.map(env => {
                  const dataStyle = DISPLAY_THEMES[env];
                  const matchCount = globalPhotosList.filter(p => p.category === drillLevel1 && p.environment === env).length;
                  return (
                    <div key={env} onClick={() => setDrillLevel2(env)} style={{ background: '#1c1929', border: '1px solid #2d2842', borderRadius: 12, padding: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}>
                      <FolderIcon />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: dataStyle.tint }}>{env}/</div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>{matchCount} objects classified</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : !drillLevel3 ? (
            /* DRILL LEVEL 3: Social Group Density Folder Layout Grid */
            <div>
              <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 14, fontWeight: 500 }}>📁 Tier 3 Subdirectories: Social Composition Density</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
                {TAXONOMY_SOCIALS.map(social => {
                  const dataStyle = DISPLAY_THEMES[social];
                  const matchCount = globalPhotosList.filter(p => p.category === drillLevel1 && p.environment === drillLevel2 && p.socialGroup === social).length;
                  return (
                    <div key={social} onClick={() => setDrillLevel3(social)} style={{ background: '#1c1929', border: '1px solid #2d2842', borderRadius: 12, padding: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}>
                      <FolderIcon />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: dataStyle.tint }}>{social}/</div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>{matchCount} assets matched</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ARCHIVE FINAL TERMINUS VIEW: Categorized Image Cards Matrix Display */
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>🖼️ Target Image Partitions Matches ({activePartitionedAssets.length})</div>
                <button onClick={() => setDrillLevel3(null)} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>← Back to Layouts</button>
              </div>

              {activePartitionedAssets.length === 0 ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: '#475569', fontSize: 13 }}>This folder path partition is currently empty.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
                  {activePartitionedAssets.map(photo => (
                    <div key={photo._id} style={{ backgroundColor: '#1c1929', border: '1px solid #2d2842', borderRadius: 14, overflow: 'hidden' }}>
                      <div style={{ width: '100%', height: 140, background: '#000' }}>
                        <img src={photo.url} alt={photo.title || 'Classified Vault Item'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ padding: 14 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{photo.title || 'Untitled Photo'}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, fontSize: 11, color: '#64748b' }}>
                          <span>Pipeline Score:</span>
                          <span style={{ color: '#10b981', fontWeight: 800 }}>{photo.qualityScore || 90}%</span>
                        </div>
                        {/* Show classification tags so you can verify it worked */}
                        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {[photo.category, photo.environment, photo.socialGroup].filter(Boolean).map(tag => (
                            <span key={tag} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: '#2d2842', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}