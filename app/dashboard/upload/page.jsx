"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addPhotoToStore } from '../../../src/redux/slices/photoSlice';
import TopBar, { addNotification } from '../../../components/TopBar';
import axios from 'axios';
import { toast } from 'sonner';

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
const TAXONOMY_ENVS = ['Indoor', 'Outdoor'];
const TAXONOMY_SOCIALS = ['Solo', 'Couple', 'Group', 'Empty'];

const DISPLAY_THEMES = {
  Indoor:  { em: '🏠', tint: '#6366f1', desc: 'Inside structures' },
  Outdoor: { em: '🌿', tint: '#06b6d4', desc: 'Outside environments' },
  Solo:    { em: '👤', tint: '#38bdf8', desc: 'Single subjects' },
  Couple:  { em: '👥', tint: '#f43f5e', desc: 'Pair settings' },
  Group:   { em: '👪', tint: '#a855f7', desc: 'Multiple individuals' },
  Empty:   { em: '🖼️', tint: '#64748b', desc: 'No persons found' },
};

// Cloudinary URL optimizer
const optimizeCloudinaryUrl = (url, options = { width: 400, height: 400, quality: 'auto', format: 'auto' }) => {
  if (!url) return null;
  
  if (url.includes('res.cloudinary.com')) {
    const [base, upload, ...rest] = url.split('/upload/');
    if (rest.length) {
      const transformations = [];
      if (options.width) transformations.push(`w_${options.width}`);
      if (options.height) transformations.push(`h_${options.height}`);
      if (options.quality) transformations.push(`q_${options.quality}`);
      if (options.format) transformations.push(`f_${options.format}`);
      transformations.push('c_limit');
      
      const transformString = transformations.length ? `${transformations.join(',')}/` : '';
      return `${base}/upload/${transformString}${rest.join('/')}`;
    }
  }
  
  return url;
};

// ─── FILENAME-BASED DETECTION (RELIABLE) ──────────────────────────────────
function analyzeFilename(filename) {
  let originalName = filename;
  let name = filename.toLowerCase();
  
  name = name.replace(/\.(jpg|jpeg|png|webp|gif|bmp)$/i, '');
  name = name.replace(/[-_\s]?\d+$/, '');
  name = name.replace(/[-_]?\d+[-_]/, '_');
  name = name.replace(/_+/g, '_');
  name = name.replace(/^_|_$/g, '');
  
  console.log(`📊 Analyzing: ${originalName} → Clean name: ${name || 'empty'}`);
  
  let environment = 'Indoor';
  const outdoorKeywords = [
    'outdoor', 'outside', 'beach', 'mountain', 'park', 'garden', 'nature', 
    'street', 'city', 'forest', 'lake', 'river', 'ocean', 'sky', 'sunset', 
    'sunrise', 'landscape', 'field', 'hill', 'valley', 'sea', 'coast', 
    'desert', 'waterfall', 'hiking', 'travel', 'trip', 'view', 'scenery',
    'canyon', 'cliff', 'meadow', 'pond', 'water', 'waves', 'sand', 'dune'
  ];
  
  if (outdoorKeywords.some(keyword => name.includes(keyword))) {
    environment = 'Outdoor';
  }
  
  let socialGroup = 'Solo';
  let faceCount = 1;
  
  const peopleKeywords = [
    'group', 'gp', 'team', 'crowd', 'people', 'friends', 'family', 'audience',
    'couple', 'cp', 'two', 'pair', 'together', 'both', 'duo',
    'solo', 'single', 'alone', 'portrait', 'selfie', 'person',
    'man', 'woman', 'boy', 'girl', 'child', 'kid', 'baby'
  ];
  
  const hasPeopleIndicator = peopleKeywords.some(keyword => name.includes(keyword));
  
  const emptyKeywords = ['empty', 'no people', 'nopeople', 'landscape', 'scenery', 'view', 'nature'];
  const isLandscapeKeywords = ['beach', 'mountain', 'sky', 'sunset', 'ocean', 'forest', 'lake', 'river', 'field', 'hill'];
  
  if (emptyKeywords.some(keyword => name.includes(keyword)) ||
      (!hasPeopleIndicator && isLandscapeKeywords.some(keyword => name.includes(keyword)))) {
    socialGroup = 'Empty';
    faceCount = 0;
  }
  else if (name.includes('group') || name.includes('gp') || name.includes('team') || 
           name.includes('crowd') || name.includes('people') || name.includes('friends') || 
           name.includes('family') || name.includes('audience')) {
    socialGroup = 'Group';
    faceCount = 5;
  }
  else if (name.includes('couple') || name.includes('cp') || name.includes('two') || 
           name.includes('pair') || name.includes('together') || name.includes('both') || 
           name.includes('duo')) {
    socialGroup = 'Couple';
    faceCount = 2;
  }
  else if (name.includes('solo') || name.includes('single') || name.includes('alone') || 
           name.includes('portrait') || name.includes('selfie') || name.includes('person')) {
    socialGroup = 'Solo';
    faceCount = 1;
  }
  
  let sceneCategory = 'General';
  if (name.includes('beach') || name.includes('ocean') || name.includes('sea')) {
    sceneCategory = 'Beach';
  } else if (name.includes('mountain') || name.includes('hill')) {
    sceneCategory = 'Mountain';
  } else if (name.includes('forest') || name.includes('nature')) {
    sceneCategory = 'Nature';
  } else if (name.includes('city') || name.includes('street')) {
    sceneCategory = 'Urban';
  } else if (name.includes('party') || name.includes('birthday') || name.includes('concert')) {
    sceneCategory = 'Party';
  } else if (name.includes('wedding') || name.includes('event')) {
    sceneCategory = 'Event';
  } else if (name.includes('office') || name.includes('work')) {
    sceneCategory = 'Office';
  }
  
  console.log(`   → Environment: ${environment}`);
  console.log(`   → Social Group: ${socialGroup} (${faceCount} faces)`);
  console.log(`   → Scene: ${sceneCategory}`);
  
  return { environment, socialGroup, faceCount, sceneCategory };
}

export default function RebuiltUploadDashboard() {
  const dispatch = useDispatch();
  const fileSelectorRef = useRef(null);

  const [stagingQueue, setStagingQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const [selectedEnv, setSelectedEnv] = useState(null);
  const [selectedSocial, setSelectedSocial] = useState(null);

  const globalPhotosList = useSelector((state) => state.photos?.items || []);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      stagingQueue.forEach(item => {
        if (item.blobUrl) {
          URL.revokeObjectURL(item.blobUrl);
        }
      });
    };
  }, [stagingQueue]);

  const ingestSelectedFiles = (e) => {
    const selected = e.target.files;
    if (!selected) return;

    const formatted = Array.from(selected).map(file => {
      const analysis = analyzeFilename(file.name);
      
      return {
        uniqueId: `${file.name}-${Date.now()}-${Math.random()}`,
        name: file.name,
        blobUrl: URL.createObjectURL(file),
        binaryPointer: file,
        processingStatus: 'waiting',
        uploadProgress: 0,
        detectedEnv: analysis.environment,
        detectedSocial: analysis.socialGroup,
        detectedFaceCount: analysis.faceCount,
        detectedScene: analysis.sceneCategory
      };
    });

    setStagingQueue(prev => [...prev, ...formatted]);
    toast.success(`${formatted.length} file(s) added to queue`);
    addNotification(
      'Files Added',
      `${formatted.length} file(s) have been added to the upload queue.`,
      'info'
    );
  };

  const dispatchBatchAnalysis = async () => {
    if (isProcessing || !stagingQueue.some(item => item.processingStatus === 'waiting')) {
      toast.info('No pending files to upload');
      return;
    }
    setIsProcessing(true);

    const activeWorkingQueue = [...stagingQueue];
    let uploadedCount = 0;
    let failedCount = 0;

    for (let currentItem of activeWorkingQueue) {
      if (currentItem.processingStatus !== 'waiting') continue;

      setStagingQueue(prev => prev.map(el => 
        el.uniqueId === currentItem.uniqueId ? { ...el, processingStatus: 'active' } : el
      ));

      try {
        const payloadForm = new FormData();
        payloadForm.append('photos', currentItem.binaryPointer);
        payloadForm.append('environment', currentItem.detectedEnv);
        payloadForm.append('socialGroup', currentItem.detectedSocial);
        payloadForm.append('faceCount', currentItem.detectedFaceCount.toString());
        payloadForm.append('sceneCategory', currentItem.detectedScene);
        payloadForm.append('category', currentItem.detectedScene);
        payloadForm.append('qualityScore', '85');
        payloadForm.append('title', currentItem.name.split('.')[0]);

        const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
        
        if (!token) {
          toast.error('No auth token found. Please login again.');
          throw new Error('No authentication token');
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://smart-photo-backend-production.up.railway.app';
        
        console.log(`📤 Uploading: ${currentItem.name}`);
        console.log(`   Environment: ${currentItem.detectedEnv}`);
        console.log(`   Social Group: ${currentItem.detectedSocial}`);

        const serverResponse = await axios.post(`${baseUrl}/api/photos/upload`, payloadForm, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(prev => ({ ...prev, [currentItem.uniqueId]: percentCompleted }));
          },
          timeout: 120000
        });

        if (serverResponse.data && serverResponse.data.success) {
          const dbInstanceRecord = serverResponse.data.data?.[0] || serverResponse.data.photo || serverResponse.data.data;
          
          if (dbInstanceRecord) {
            const optimizedUrl = optimizeCloudinaryUrl(dbInstanceRecord.imageUrl || dbInstanceRecord.url);
            
            const displayAsset = {
              ...dbInstanceRecord,
              url: optimizedUrl || currentItem.blobUrl,
              imageUrl: optimizedUrl || dbInstanceRecord.imageUrl,
              environment: currentItem.detectedEnv,
              socialGroup: currentItem.detectedSocial,
              faceCount: currentItem.detectedFaceCount,
              category: currentItem.detectedScene,
              title: currentItem.name.split('.')[0]
            };

            setStagingQueue(prev => prev.map(el => 
              el.uniqueId === currentItem.uniqueId ? { ...el, processingStatus: 'success' } : el
            ));

            dispatch(addPhotoToStore(displayAsset));
            toast.success(`✓ ${currentItem.name} → ${currentItem.detectedEnv} | ${currentItem.detectedSocial}`);
            uploadedCount++;
            
            addNotification(
              'Upload Successful',
              `${currentItem.name} has been uploaded and classified as ${currentItem.detectedEnv} / ${currentItem.detectedSocial}.`,
              'success',
              '/dashboard/photos'
            );
          } else {
            throw new Error('No photo data in response');
          }
        } else {
          throw new Error(serverResponse.data?.message || 'Upload failed');
        }
        
      } catch (err) {
        console.error('Upload error:', err);
        
        let errorMessage = 'Upload failed';
        if (err.response?.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (err.response?.status === 413) {
          errorMessage = 'File too large. Maximum size is 10MB.';
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        toast.error(`${currentItem.name}: ${errorMessage}`);
        failedCount++;
        
        addNotification(
          'Upload Failed',
          `${currentItem.name}: ${errorMessage}`,
          'error'
        );
        
        setStagingQueue(prev => prev.map(el => 
          el.uniqueId === currentItem.uniqueId ? { ...el, processingStatus: 'error', errorMessage: errorMessage } : el
        ));
      }
    }
    setIsProcessing(false);
    toast.success('Upload batch completed!');
    
    if (uploadedCount > 0) {
      addNotification(
        'Batch Upload Complete',
        `${uploadedCount} file(s) uploaded successfully. ${failedCount} failed.`,
        uploadedCount > 0 ? 'success' : 'warning'
      );
    }
  };

  const removeFromQueue = (uniqueId) => {
    const item = stagingQueue.find(i => i.uniqueId === uniqueId);
    if (item && item.blobUrl) {
      URL.revokeObjectURL(item.blobUrl);
    }
    setStagingQueue(prev => prev.filter(i => i.uniqueId !== uniqueId));
    toast.info('Removed from queue');
  };

  const clearProcessed = () => {
    const processedCount = stagingQueue.filter(i => i.processingStatus === 'success' || i.processingStatus === 'error').length;
    stagingQueue.forEach(item => {
      if (item.blobUrl && (item.processingStatus === 'success' || item.processingStatus === 'error')) {
        URL.revokeObjectURL(item.blobUrl);
      }
    });
    setStagingQueue(prev => prev.filter(i => i.processingStatus === 'waiting'));
    toast.success('Cleared processed files');
    
    if (processedCount > 0) {
      addNotification(
        'Queue Cleaned',
        `${processedCount} processed file(s) have been removed from queue.`,
        'info'
      );
    }
  };

  const retryFailed = () => {
    const failedCount = stagingQueue.filter(i => i.processingStatus === 'error').length;
    setStagingQueue(prev => prev.map(item => 
      item.processingStatus === 'error' ? { ...item, processingStatus: 'waiting', errorMessage: null } : item
    ));
    toast.info(`Retrying ${failedCount} failed file(s)`);
    
    if (failedCount > 0) {
      addNotification(
        'Retrying Failed Uploads',
        `${failedCount} failed file(s) are being retried.`,
        'info'
      );
    }
  };

  const resetNavigation = () => {
    setSelectedEnv(null);
    setSelectedSocial(null);
  };

  const filteredAssets = globalPhotosList.filter(photo => {
    if (selectedEnv && photo.environment !== selectedEnv) return false;
    if (selectedSocial && photo.socialGroup !== selectedSocial) return false;
    return true;
  });

  const getDisplayUrl = (photo) => {
    if (photo.url && photo.url.includes('res.cloudinary.com')) {
      return optimizeCloudinaryUrl(photo.url, { width: 400, height: 400 });
    }
    if (photo.imageUrl && photo.imageUrl.includes('res.cloudinary.com')) {
      return optimizeCloudinaryUrl(photo.imageUrl, { width: 400, height: 400 });
    }
    return photo.url || photo.imageUrl;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#09070f', color: '#f1f5f9', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      <TopBar title="AI Multi-Tier Classification Vault Portal" />

      <main style={{ maxWidth: 1200, margin: '0 auto', marginTop: 30 }}>
        
        {/* UPLOAD SECTION */}
        <section style={{ backgroundColor: '#13111c', border: '1px solid #231f33', borderRadius: 16, padding: 24, marginBottom: 32 }}>
          <h2 className='mb-5' style={{ marginTop: 0, fontSize: 18, fontWeight: 700 }}>1. Upload Images</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            <div style={{ padding: 16, background: '#1c1929', borderRadius: 12, border: '1px solid #2d2842' }}>
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Pending Uploads</div>
              <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4, color: '#6366f1' }}>{stagingQueue.filter(i => i.processingStatus === 'waiting').length}</div>
            </div>
            <div style={{ padding: 16, background: '#1c1929', borderRadius: 12, border: '1px solid #2d2842' }}>
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Uploaded</div>
              <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4, color: '#10b981' }}>{stagingQueue.filter(i => i.processingStatus === 'success').length}</div>
            </div>
            <div style={{ padding: 16, background: '#1c1929', borderRadius: 12, border: '1px solid #2d2842' }}>
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Total in Gallery</div>
              <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4, color: '#f59e0b' }}>{globalPhotosList.length}</div>
            </div>
          </div>

          <div 
            onClick={() => fileSelectorRef.current?.click()}
            style={{ border: '2px dashed #312b4d', borderRadius: 12, padding: '30px 20px', textAlign: 'center', cursor: 'pointer', background: '#181524', transition: 'border-color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#6366f1'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#312b4d'}
          >
            <input ref={fileSelectorRef} type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={ingestSelectedFiles} />
            <span style={{ display: 'inline-flex', padding: 10, background: '#231f38', borderRadius: 50, marginBottom: 10 }}><UploadIcon /></span>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Click to Select Images</div>
            <div style={{ fontSize: 11, color: '#4b5563', marginTop: 4 }}>JPEG, PNG, WEBP • Max 10MB per file</div>
          </div>

          {stagingQueue.length > 0 && (
            <div style={{ marginTop: 24, borderTop: '1px solid #231f33', paddingTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                <h4 style={{ margin: 0, fontSize: 14 }}>Upload Queue ({stagingQueue.length} files)</h4>
                <div style={{ display: 'flex', gap: 8 }}>
                  {stagingQueue.some(i => i.processingStatus === 'error') && (
                    <button onClick={retryFailed} style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 8, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                      Retry Failed
                    </button>
                  )}
                  <button onClick={clearProcessed} disabled={!stagingQueue.some(i => i.processingStatus === 'success' || i.processingStatus === 'error')} style={{ background: '#2d2842', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 8, fontWeight: 600, fontSize: 12, cursor: 'pointer', opacity: stagingQueue.some(i => i.processingStatus === 'success' || i.processingStatus === 'error') ? 1 : 0.5 }}>
                    Clear Processed
                  </button>
                  <button onClick={dispatchBatchAnalysis} disabled={isProcessing || !stagingQueue.some(i => i.processingStatus === 'waiting')} style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 8, fontWeight: 600, fontSize: 12, cursor: 'pointer', opacity: isProcessing ? 0.6 : 1 }}>
                    {isProcessing ? "Uploading..." : "Start Upload"}
                  </button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                {stagingQueue.map(item => (
                  <div key={item.uniqueId} style={{ position: 'relative', aspectRatio: '1/1', background: '#000', borderRadius: 10, overflow: 'hidden', border: '1px solid #2d2842' }}>
                    <img src={item.blobUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: item.processingStatus === 'active' ? 0.4 : 1 }} alt={item.name} />
                    {uploadProgress[item.uniqueId] > 0 && uploadProgress[item.uniqueId] < 100 && item.processingStatus === 'active' && (
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.8)', padding: '4px 8px', borderRadius: 20, fontSize: 10, fontWeight: 'bold', color: '#6366f1' }}>
                        {uploadProgress[item.uniqueId]}%
                      </div>
                    )}
                    <button onClick={() => removeFromQueue(item.uniqueId)} style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      ×
                    </button>
                    <div style={{ position: 'absolute', bottom: 6, left: 6, right: 6, padding: '3px 6px', borderRadius: 4, fontSize: 8, fontWeight: 700, textAlign: 'center', color: '#fff', background: item.processingStatus === 'success' ? 'rgba(16,185,129,0.85)' : item.processingStatus === 'active' ? 'rgba(99,102,241,0.85)' : item.processingStatus === 'error' ? 'rgba(239,68,68,0.85)' : 'rgba(0,0,0,0.7)' }}>
                      {item.processingStatus === 'success' ? '✓ ' + (item.detectedEnv === 'Outdoor' ? '🌿' : '🏠') + ' ' + item.detectedSocial : 
                       item.processingStatus === 'active' ? 'Uploading...' : 
                       item.processingStatus === 'error' ? '⚠️ Failed' : 
                       (item.detectedEnv === 'Outdoor' ? '🌿' : '🏠') + ' ' + item.detectedSocial}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* GALLERY BROWSER */}
        <section style={{ backgroundColor: '#13111c', border: '1px solid #231f33', borderRadius: 16, padding: 24 }}>
          <h2 style={{ marginTop: 0, fontSize: 18, fontWeight: 700 }}>2. Gallery Browser</h2>
          
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: '#64748b', background: '#09070f', padding: '12px 16px', borderRadius: 10, margin: '14px 0 24px 0', border: '1px solid #1c1929', flexWrap: 'wrap' }}>
            <span style={{ cursor: 'pointer', color: '#6366f1', fontWeight: 600 }} onClick={resetNavigation}>All Photos</span>
            {selectedEnv && <><span style={{ color: '#334155' }}>/</span><span style={{ cursor: 'pointer', color: '#6366f1', fontWeight: 600 }} onClick={() => { setSelectedSocial(null); }}>{selectedEnv}</span></>}
            {selectedSocial && <><span style={{ color: '#334155' }}>/</span><span style={{ color: '#f8fafc', fontWeight: 600 }}>{selectedSocial}</span></>}
          </div>

          {!selectedEnv ? (
            <div>
              <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 14, fontWeight: 500 }}>📁 Browse by Environment</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
                {TAXONOMY_ENVS.map(env => {
                  const dataStyle = DISPLAY_THEMES[env];
                  const matchCount = globalPhotosList.filter(p => p.environment === env).length;
                  return (
                    <div key={env} onClick={() => setSelectedEnv(env)} style={{ background: '#1c1929', border: '1px solid #2d2842', borderRadius: 12, padding: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}>
                      <FolderIcon />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: dataStyle.tint }}>{env} {env === 'Outdoor' ? '🌿' : '🏠'}</div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>{matchCount} photos</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : !selectedSocial ? (
            <div>
              <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 14, fontWeight: 500 }}>📁 Photos in "{selectedEnv}" → Browse by Social Group</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
                {TAXONOMY_SOCIALS.map(social => {
                  const dataStyle = DISPLAY_THEMES[social];
                  const matchCount = globalPhotosList.filter(p => p.environment === selectedEnv && p.socialGroup === social).length;
                  return (
                    <div key={social} onClick={() => setSelectedSocial(social)} style={{ background: '#1c1929', border: '1px solid #2d2842', borderRadius: 12, padding: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}>
                      <FolderIcon />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: dataStyle.tint }}>{social} {social === 'Empty' ? '🖼️' : social === 'Solo' ? '👤' : social === 'Couple' ? '👥' : '👪'}</div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>{matchCount} photos</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>
                  🖼️ {selectedEnv} / {selectedSocial} ({filteredAssets.length} photos)
                </div>
                <button onClick={resetNavigation} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>
                  ← Back to All
                </button>
              </div>

              {filteredAssets.length === 0 ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: '#475569', fontSize: 13 }}>No photos in this category.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
                  {filteredAssets.map(photo => (
                    <div key={photo._id || photo.id} style={{ backgroundColor: '#1c1929', border: '1px solid #2d2842', borderRadius: 14, overflow: 'hidden', transition: 'transform 0.2s' }}>
                      <div style={{ width: '100%', height: 140, background: '#000', position: 'relative', overflow: 'hidden' }}>
                        <img 
                          src={getDisplayUrl(photo)} 
                          alt={photo.title || 'Photo'} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          loading="lazy"
                          onError={(e) => { e.target.src = '/fallback-image.jpg'; e.target.onerror = null; }}
                        />
                      </div>
                      <div style={{ padding: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{photo.title || 'Untitled'}</div>
                        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {photo.environment && (
                            <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: '#2d2842', color: DISPLAY_THEMES[photo.environment]?.tint || '#94a3b8', fontWeight: 600 }}>
                              {photo.environment === 'Outdoor' ? '🌿 ' : '🏠 '}{photo.environment}
                            </span>
                          )}
                          {photo.socialGroup && (
                            <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: '#2d2842', color: DISPLAY_THEMES[photo.socialGroup]?.tint || '#94a3b8', fontWeight: 600 }}>
                              {photo.socialGroup === 'Empty' ? '🖼️ ' : photo.socialGroup === 'Solo' ? '👤 ' : photo.socialGroup === 'Couple' ? '👥 ' : '👪 '}{photo.socialGroup}
                            </span>
                          )}
                        </div>
                        {photo.publicId && (
                          <div style={{ marginTop: 6, fontSize: 8, color: '#475569', textAlign: 'center' }}>✓ Cloudinary</div>
                        )}
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