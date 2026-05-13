"use client"

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux'; 
import { uploadPhotoAction } from '../../../src/redux/slices/photoSlice'; 
import * as tf from '@tensorflow/tfjs';
import {
  CloudUpload, CheckCircle2, HardDrive, Bell, User, Search,
  X, FileImage, AlertCircle, Loader2, Upload
} from 'lucide-react';

const formatSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE  = 10 * 1024 * 1024;

export default function UploadPage() {
  const dispatch = useDispatch(); 
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [model, setModel] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [dragging, setDragging] = useState(false);

  const inputRef = useRef(null);

  // Fix Hydration & Load AI Model
  useEffect(() => {
    setMounted(true);
    async function loadModel() {
      try {
        const tModel = await tf.loadLayersModel('/model/model.json');
        setModel(tModel);
        setIsModelLoading(false);
      } catch (e) {
        console.error("AI Model Error:", e);
        setIsModelLoading(false);
      }
    }
    loadModel();
  }, []);

  const addFiles = useCallback((incoming) => {
    const valid = Array.from(incoming)
      .filter(f => ACCEPTED.includes(f.type) && f.size <= MAX_SIZE)
      .map(f => ({
        id: `${f.name}-${f.size}-${Date.now()}`, 
        name: f.name,
        size: f.size,
        rawFile: f, 
        status: 'waiting',
        category: null,
        preview: URL.createObjectURL(f),
      }));
    setFiles(prev => [...prev, ...valid]);
  }, []);

  const startUpload = async () => {
    if (!model || uploading) return;
    setUploading(true);

    for (const fileObj of files.filter(f => f.status === 'waiting')) {
      setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'uploading' } : f));

      try {
        // AI Analysis
        const img = new Image();
        img.src = fileObj.preview;
        const category = await new Promise((resolve) => {
          img.onload = async () => {
            const tensor = tf.browser.fromPixels(img).resizeNearestNeighbor([224, 224]).toFloat().expandDims();
            const predictions = await model.predict(tensor).data();
            const labels = ["Events", "Indoor", "Outdoor"]; 
            resolve(labels[predictions.indexOf(Math.max(...predictions))]);
          };
        });

        // Backend Upload
        const result = await dispatch(uploadPhotoAction({ file: fileObj.rawFile, category })).unwrap();
        
        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'done', category } : f));
      } catch (err) {
        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'error' } : f));
      }
    }
    setUploading(false);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0f0a19] text-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black mb-8">AI Smart Upload</h1>
        
        {/* Dropzone */}
        <div 
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current.click()}
          className={`border-2 border-dashed p-20 rounded-3xl text-center cursor-pointer transition-all ${dragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-700 bg-[#161026]'}`}
        >
          <input type="file" multiple ref={inputRef} className="hidden" onChange={e => addFiles(e.target.files)} />
          <CloudUpload className="mx-auto mb-4 text-gray-500" size={48} />
          <p className="font-bold">Click or drag images to sort with AI</p>
        </div>

        {/* File Queue */}
        {files.length > 0 && (
          <div className="mt-8 bg-[#161026] rounded-2xl border border-gray-800">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <span className="font-bold">Queue ({files.length})</span>
              <button 
                onClick={startUpload}
                disabled={uploading || isModelLoading}
                className="bg-indigo-600 px-6 py-2 rounded-xl font-bold hover:bg-indigo-500 disabled:opacity-50"
              >
                {uploading ? <Loader2 className="animate-spin" /> : "Start AI Process"}
              </button>
            </div>
            <div className="p-4 space-y-3">
              {files.map(f => (
                <div key={f.id} className="flex items-center gap-4 p-3 bg-[#1c1430] rounded-xl border border-gray-800">
                  <img src={f.preview} className="w-12 h-12 rounded object-cover" />
                  <div className="flex-1 text-xs">
                    <p className="font-bold">{f.name}</p>
                    {f.category && <span className="text-indigo-400 font-black uppercase">{f.category}</span>}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${f.status === 'done' ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-400'}`}>
                    {f.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}