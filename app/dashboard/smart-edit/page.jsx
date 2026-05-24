"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
  Camera, Upload, X, Download, Loader2, Sparkles,
  Wand2, Eraser, Paintbrush, Contrast, Sun, Moon,
  Crop, RotateCw, FlipHorizontal, FlipVertical,
  Undo, Redo, Save, Trash2, Check, AlertCircle,
  Image as ImageIcon, Layers, Palette, Scissors, RefreshCw,
  Droplet, Brush, Heart, Star, Cloud, Sunset, Search
} from 'lucide-react';
import TopBar, { addNotification } from '../../../components/TopBar';

// ─── CUSTOM ICON COMPONENTS (Defined FIRST before they are used) ─────────────
const TreePineIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m8 15 4-7 4 7" />
    <path d="M4 21h16" />
    <path d="M12 8V5" />
  </svg>
);

const BeachIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 12a9 9 0 0 0-9-9 9 9 0 1 0 9 9z" />
    <path d="M12 3v18" />
    <path d="m12 3 6 6" />
    <path d="m12 3-6 6" />
  </svg>
);

const MountainIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m3 15 3-3 3 3 3-3 3 3 3-3 3 3" />
    <path d="M21 21H3" />
  </svg>
);

const ForestIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2v10" />
    <path d="m6 12 6 6 6-6" />
    <path d="M4 22h16" />
  </svg>
);

const CityIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="8" width="4" height="14" />
    <rect x="8" y="4" width="4" height="18" />
    <rect x="14" y="6" width="4" height="16" />
    <rect x="20" y="10" width="4" height="12" />
  </svg>
);

const CoffeeIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
    <line x1="6" x2="6" y1="2" y2="4" />
    <line x1="10" x2="10" y1="2" y2="4" />
    <line x1="14" x2="14" y1="2" y2="4" />
  </svg>
);

const WaterIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2v20" />
    <path d="M12 2c-2 3-5 5-8 5" />
    <path d="M12 2c2 3 5 5 8 5" />
  </svg>
);

// ─── FILTER PRESETS ─────────────────────────────────────────────────────────
const filters = [
  { id: 'none', name: 'Original', icon: ImageIcon, effect: '' },
  { id: 'grayscale', name: 'Grayscale', icon: Contrast, effect: 'grayscale(100%)' },
  { id: 'sepia', name: 'Sepia', icon: Palette, effect: 'sepia(100%)' },
  { id: 'vintage', name: 'Vintage', icon: Sun, effect: 'sepia(30%) brightness(1.1) contrast(1.2)' },
  { id: 'cool', name: 'Cool', icon: Moon, effect: 'brightness(1.05) contrast(1.1) saturate(1.2)' },
  { id: 'warm', name: 'Warm', icon: Sun, effect: 'sepia(15%) brightness(1.05) saturate(1.15)' },
  { id: 'dramatic', name: 'Dramatic', icon: Contrast, effect: 'contrast(1.3) brightness(0.95)' },
  { id: 'soft', name: 'Soft', icon: Sparkles, effect: 'brightness(1.05) blur(0.5px)' },
];

// ─── ADJUSTMENT CONTROLS ────────────────────────────────────────────────────
const adjustments = [
  { id: 'brightness', label: 'Brightness', min: 0, max: 200, default: 100, icon: Sun },
  { id: 'contrast', label: 'Contrast', min: 0, max: 200, default: 100, icon: Contrast },
  { id: 'saturation', label: 'Saturation', min: 0, max: 200, default: 100, icon: Palette },
  { id: 'blur', label: 'Blur', min: 0, max: 10, default: 0, icon: Sparkles },
];

// ─── COLOR BACKGROUND PRESETS ───────────────────────────────────────────────
const colorPresets = [
  { id: 'transparent', name: 'Transparent', icon: Droplet, color: 'bg-gray-500', type: 'transparent' },
  { id: 'white', name: 'White', icon: ImageIcon, color: 'bg-white', type: 'color', value: '#FFFFFF' },
  { id: 'black', name: 'Black', icon: ImageIcon, color: 'bg-black', type: 'color', value: '#000000' },
  { id: 'blue', name: 'Blue', icon: ImageIcon, color: 'bg-blue-500', type: 'color', value: '#3B82F6' },
  { id: 'green', name: 'Green', icon: ImageIcon, color: 'bg-green-500', type: 'color', value: '#22C55E' },
  { id: 'purple', name: 'Purple', icon: ImageIcon, color: 'bg-purple-500', type: 'color', value: '#A855F7' },
  { id: 'pink', name: 'Pink', icon: ImageIcon, color: 'bg-pink-500', type: 'color', value: '#EC4899' },
  { id: 'orange', name: 'Orange', icon: ImageIcon, color: 'bg-orange-500', type: 'color', value: '#F97316' },
];

// ─── GRADIENT BACKGROUND PRESETS ────────────────────────────────────────────
const gradientPresets = [
  { id: 'gradient-sunset', name: 'Sunset', icon: Sunset, gradient: 'linear-gradient(135deg, #FF6B6B, #FF8E53)' },
  { id: 'gradient-ocean', name: 'Ocean', icon: Cloud, gradient: 'linear-gradient(135deg, #00C9FF, #92FE9D)' },
  { id: 'gradient-aurora', name: 'Aurora', icon: Sparkles, gradient: 'linear-gradient(135deg, #11998E, #38EF7D)' },
  { id: 'gradient-sunrise', name: 'Sunrise', icon: Sun, gradient: 'linear-gradient(135deg, #F2994A, #F2C94C)' },
  { id: 'gradient-forest', name: 'Forest', icon: TreePineIcon, gradient: 'linear-gradient(135deg, #134E5E, #71B280)' },
  { id: 'gradient-midnight', name: 'Midnight', icon: Moon, gradient: 'linear-gradient(135deg, #232526, #414345)' },
];

// ─── STOCK IMAGE BACKGROUNDS (Unsplash - Free to use) ───────────────────────
const stockBackgrounds = [
  { id: 'beach', name: 'Beach', icon: BeachIcon, url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&h=1080&fit=crop' },
  { id: 'mountain', name: 'Mountain', icon: MountainIcon, url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&h=1080&fit=crop' },
  { id: 'forest', name: 'Forest', icon: ForestIcon, url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop' },
  { id: 'city', name: 'City', icon: CityIcon, url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&h=1080&fit=crop' },
  { id: 'coffee', name: 'Coffee Shop', icon: CoffeeIcon, url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1920&h=1080&fit=crop' },
  { id: 'sunset-beach', name: 'Sunset Beach', icon: Sunset, url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&h=1080&fit=crop' },
  { id: 'snow-mountain', name: 'Snow Mountain', icon: MountainIcon, url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&h=1080&fit=crop' },
  { id: 'lake', name: 'Lake', icon: WaterIcon, url: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=1920&h=1080&fit=crop' },
  { id: 'night-city', name: 'Night City', icon: CityIcon, url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1920&h=1080&fit=crop' },
  { id: 'garden', name: 'Garden', icon: ForestIcon, url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1920&h=1080&fit=crop' },
];

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
export default function AIStudioPage() {
  const [originalImage, setOriginalImage] = useState(null);
  const [editedImage, setEditedImage] = useState(null);
  const [subjectImage, setSubjectImage] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [adjustmentValues, setAdjustmentValues] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cameraDevices, setCameraDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [showBgOptions, setShowBgOptions] = useState(false);
  const [selectedBgPreset, setSelectedBgPreset] = useState(null);
  const [customBgColor, setCustomBgColor] = useState('#3B82F6');
  const [bgTab, setBgTab] = useState('colors');
  const [searchStockTerm, setSearchStockTerm] = useState('');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);
  const bgCanvasRef = useRef(null);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || {});

  // Filter stock backgrounds by search term
  const filteredStockBackgrounds = stockBackgrounds.filter(bg =>
    bg.name.toLowerCase().includes(searchStockTerm.toLowerCase())
  );

  // Get available camera devices
  const getCameraDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setCameraDevices(videoDevices);
      if (videoDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error("Error getting camera devices:", err);
    }
  };

  // Save to history
  const saveToHistory = useCallback((image) => {
    if (!image) return;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(image);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Undo action
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setEditedImage(history[historyIndex - 1]);
      toast.info("Undo successful");
      addNotification('Action Undone', 'Last edit has been undone.', 'info');
    } else {
      toast.error("Nothing to undo");
    }
  };

  // Redo action
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setEditedImage(history[historyIndex + 1]);
      toast.info("Redo successful");
      addNotification('Action Redone', 'Last edit has been reapplied.', 'info');
    } else {
      toast.error("Nothing to redo");
    }
  };

  // Apply filter and adjustments to image
  const applyTransformations = useCallback((img, filter, adjustments) => {
    if (!img) return Promise.resolve(img);
    
    const canvas = canvasRef.current;
    if (!canvas) return Promise.resolve(img);
    
    const ctx = canvas.getContext('2d');
    const imgElement = new Image();
    imgElement.src = img;
    imgElement.crossOrigin = "Anonymous";
    
    return new Promise((resolve) => {
      imgElement.onload = () => {
        canvas.width = imgElement.width;
        canvas.height = imgElement.height;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const filterEffect = filters.find(f => f.id === filter)?.effect || '';
        const brightnessVal = adjustments.brightness / 100;
        const contrastVal = adjustments.contrast / 100;
        const saturationVal = adjustments.saturation / 100;
        const blurVal = adjustments.blur;
        
        const cssFilter = `${filterEffect} brightness(${brightnessVal}) contrast(${contrastVal}) saturate(${saturationVal}) blur(${blurVal}px)`;
        
        ctx.filter = cssFilter;
        ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
        
        const transformedImage = canvas.toDataURL('image/jpeg', 0.9);
        resolve(transformedImage);
      };
      imgElement.onerror = () => {
        resolve(img);
      };
    });
  }, []);

  // Apply background to subject
  const applyBackground = useCallback((subjectImg, bgData) => {
    if (!subjectImg) return Promise.resolve(subjectImg);
    
    const canvas = bgCanvasRef.current;
    if (!canvas) return Promise.resolve(subjectImg);
    
    const ctx = canvas.getContext('2d');
    const subjectElement = new Image();
    subjectElement.src = subjectImg;
    subjectElement.crossOrigin = "Anonymous";
    
    return new Promise((resolve) => {
      subjectElement.onload = () => {
        canvas.width = subjectElement.width;
        canvas.height = subjectElement.height;
        
        if (bgData.type === 'transparent') {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const checkerSize = 20;
          for (let i = 0; i < canvas.width; i += checkerSize) {
            for (let j = 0; j < canvas.height; j += checkerSize) {
              ctx.fillStyle = (Math.floor(i / checkerSize) + Math.floor(j / checkerSize)) % 2 === 0 ? '#e5e5e5' : '#a3a3a3';
              ctx.fillRect(i, j, checkerSize, checkerSize);
            }
          }
        } else if (bgData.type === 'color') {
          ctx.fillStyle = bgData.value;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (bgData.type === 'gradient') {
          const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          const colors = bgData.value.match(/#[A-Fa-f0-9]{6}/g);
          if (colors) {
            colors.forEach((color, idx) => {
              gradient.addColorStop(idx / (colors.length - 1), color);
            });
          }
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (bgData.type === 'image') {
          const bgImg = new Image();
          bgImg.crossOrigin = "Anonymous";
          bgImg.src = bgData.url;
          
          bgImg.onload = () => {
            const scale = Math.max(canvas.width / bgImg.width, canvas.height / bgImg.height);
            const x = (canvas.width - bgImg.width * scale) / 2;
            const y = (canvas.height - bgImg.height * scale) / 2;
            ctx.drawImage(bgImg, x, y, bgImg.width * scale, bgImg.height * scale);
            ctx.drawImage(subjectElement, 0, 0, canvas.width, canvas.height);
            const resultImage = canvas.toDataURL('image/png');
            resolve(resultImage);
          };
          bgImg.onerror = () => {
            ctx.drawImage(subjectElement, 0, 0, canvas.width, canvas.height);
            const resultImage = canvas.toDataURL('image/png');
            resolve(resultImage);
          };
          return;
        }
        
        ctx.drawImage(subjectElement, 0, 0, canvas.width, canvas.height);
        const resultImage = canvas.toDataURL('image/png');
        resolve(resultImage);
      };
      subjectElement.onerror = () => {
        resolve(subjectImg);
      };
    });
  }, []);

  // Update edited image when adjustments change
  useEffect(() => {
    if (originalImage) {
      applyTransformations(originalImage, selectedFilter, adjustmentValues).then(setEditedImage);
    }
  }, [originalImage, selectedFilter, adjustmentValues, applyTransformations]);

  // Save to history when edited image changes
  useEffect(() => {
    if (editedImage && editedImage !== history[historyIndex]) {
      saveToHistory(editedImage);
    }
  }, [editedImage, saveToHistory, historyIndex]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Start camera
  const startCamera = async () => {
    setCameraError(null);
    setShowCamera(true);
    setIsCameraReady(false);
    
    try {
      await getCameraDevices();
      
      const constraints = {
        video: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : { facingMode: 'user' },
        audio: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setIsCameraReady(true);
        };
      }
    } catch (err) {
      console.error("Camera error:", err);
      setCameraError("Unable to access camera. Please check permissions.");
      toast.error("Camera access denied");
      setShowCamera(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
    setIsCameraReady(false);
  };

  // Switch camera device
  const switchCamera = async () => {
    if (cameraDevices.length <= 1) {
      toast.info("No other camera devices available");
      return;
    }
    
    const currentIndex = cameraDevices.findIndex(d => d.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % cameraDevices.length;
    const nextDeviceId = cameraDevices[nextIndex].deviceId;
    setSelectedDeviceId(nextDeviceId);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: nextDeviceId } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      toast.success(`Switched to ${cameraDevices[nextIndex].label || 'camera'}`);
    } catch (err) {
      console.error("Switch camera error:", err);
      toast.error("Failed to switch camera");
    }
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && isCameraReady) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const photoDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setOriginalImage(photoDataUrl);
      setEditedImage(photoDataUrl);
      stopCamera();
      toast.success("Photo captured successfully!");
      addNotification('Photo Captured', 'Your photo has been captured successfully.', 'success');
    } else {
      toast.error("Camera not ready. Please wait.");
    }
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageDataUrl = reader.result;
        setOriginalImage(imageDataUrl);
        setEditedImage(imageDataUrl);
        toast.success("Image uploaded successfully!");
        addNotification('Image Uploaded', 'Your image has been uploaded successfully.', 'success');
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("Please select a valid image file");
    }
  };

  // Background removal using remove.bg API
  const removeBackground = async () => {
    if (!editedImage) return;
    
    setIsProcessing(true);
    toast.loading("Removing background...", { id: 'bg-remove' });
    
    try {
      const blob = await fetch(editedImage).then(r => r.blob());
      const formData = new FormData();
      formData.append('image_file', blob);
      formData.append('size', 'auto');
      
      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': 'yoEFmq9z9tS5vjYrjFpHfcrQ',
        },
        body: formData,
      });
      
      const resultBlob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const bgRemovedImage = reader.result;
        setSubjectImage(bgRemovedImage);
        setEditedImage(bgRemovedImage);
        setOriginalImage(bgRemovedImage);
        setShowBgOptions(true);
        toast.success("Background removed successfully! Now choose a new background.", { id: 'bg-remove' });
        addNotification('Background Removed', 'Background has been removed successfully. You can now choose a new background.', 'success');
      };
      reader.readAsDataURL(resultBlob);
    } catch (error) {
      console.error("Background removal error:", error);
      toast.error("Failed to remove background. Please try again.", { id: 'bg-remove' });
      addNotification('Background Removal Failed', 'Failed to remove background. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Apply background change
  const handleBackgroundChange = async (preset) => {
    if (!subjectImage) return;
    
    setIsProcessing(true);
    setSelectedBgPreset(preset);
    
    try {
      const newImage = await applyBackground(subjectImage, preset);
      setEditedImage(newImage);
      toast.success("Background changed successfully!");
      addNotification('Background Changed', `Background changed to "${preset.name || 'Custom'}" successfully.`, 'success');
    } catch (error) {
      console.error("Background change error:", error);
      toast.error("Failed to change background");
      addNotification('Background Change Failed', 'Failed to change background. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Save image to database
  const saveToDatabase = async () => {
    if (!editedImage) {
      toast.error("No image to save");
      return;
    }
    
    setIsProcessing(true);
    toast.loading("Saving image...", { id: 'save' });
    
    try {
      const blob = await fetch(editedImage).then(r => r.blob());
      const formData = new FormData();
      formData.append('photos', blob);
      formData.append('title', `AI Studio Edit ${new Date().toLocaleString()}`);
      formData.append('sceneCategory', 'AI Edited');
      formData.append('qualityScore', '95');
      
      const token = localStorage.getItem('token');
      const response = await fetch('https://smart-photo-backend-production.up.railway.app/api/photos/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success("Image saved to your gallery!", { id: 'save' });
        addNotification('Image Saved', 'Your edited image has been saved to your gallery.', 'success', '/dashboard/photos');
        setTimeout(() => {
          handleReset();
        }, 2000);
      } else {
        throw new Error(data.message || "Save failed");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save image. Please try again.", { id: 'save' });
      addNotification('Save Failed', 'Failed to save image. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Download image
  const downloadImage = () => {
    if (!editedImage) {
      toast.error("No image to download");
      return;
    }
    
    const link = document.createElement('a');
    link.download = `ai-edited-photo-${Date.now()}.png`;
    link.href = editedImage;
    link.click();
    toast.success("Download started!");
    addNotification('Download Started', 'Your image download has started.', 'info');
  };

  // Reset all edits
  const handleReset = () => {
    setOriginalImage(null);
    setEditedImage(null);
    setSubjectImage(null);
    setSelectedFilter('none');
    setAdjustmentValues({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
    });
    setHistory([]);
    setHistoryIndex(-1);
    setShowCamera(false);
    setShowBgOptions(false);
    setSelectedBgPreset(null);
    stopCamera();
    toast.info("Reset complete");
    addNotification('Reset Complete', 'All edits have been reset.', 'info');
  };

  // Update adjustment value
  const updateAdjustment = (id, value) => {
    setAdjustmentValues(prev => ({ ...prev, [id]: value }));
  };

  // Apply rotation
  const applyRotate = () => {
    if (!editedImage) return;
    
    const img = new Image();
    img.src = editedImage;
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = img.height;
      canvas.height = img.width;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      const rotatedImage = canvas.toDataURL('image/jpeg', 0.9);
      setEditedImage(rotatedImage);
      toast.success("Image rotated");
      addNotification('Image Rotated', 'Your image has been rotated 90 degrees.', 'info');
    };
  };

  return (
    <div className="m-7 min-h-screen bg-[#0a0815] text-gray-100">
      <TopBar title="AI Studio" showStatus={false} />
      
      {/* Hidden canvases for transformations */}
      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={bgCanvasRef} className="hidden" />
      
      <div className="p-6 lg:p-8">
        {/* Camera Modal */}
        {showCamera && (
          <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={stopCamera}>
            <div className="relative max-w-3xl w-full bg-[#161026] rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-white font-bold">Take a Photo</h3>
                <button onClick={stopCamera} className="text-gray-400 hover:text-white transition cursor-pointer">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-4">
                <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {!isCameraReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                      <Loader2 size={32} className="text-indigo-400 animate-spin" />
                      <p className="ml-3 text-gray-400">Starting camera...</p>
                    </div>
                  )}
                  {cameraError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90">
                      <AlertCircle size={40} className="text-red-400 mb-3" />
                      <p className="text-red-400 text-center">{cameraError}</p>
                      <button
                        onClick={startCamera}
                        className="mt-4 px-4 py-2 bg-indigo-600 rounded-lg text-sm"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-center gap-4 mt-4">
                  {cameraDevices.length > 1 && (
                    <button
                      onClick={switchCamera}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-medium transition cursor-pointer flex items-center gap-2"
                    >
                      <RefreshCw size={16} /> Switch Camera
                    </button>
                  )}
                  <button
                    onClick={capturePhoto}
                    disabled={!isCameraReady}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl text-white font-bold transition cursor-pointer flex items-center gap-2"
                  >
                    <Camera size={18} /> Capture Photo
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-medium transition cursor-pointer flex items-center gap-2"
                  >
                    <Upload size={16} /> Upload Instead
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        
        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Tools */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#161026] border border-gray-800/70 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Wand2 size={16} className="text-purple-400" />
                Editing Tools
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={startCamera}
                  disabled={isProcessing}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 hover:border-indigo-500/60 transition cursor-pointer disabled:opacity-50"
                >
                  <Camera size={24} className="text-indigo-400" />
                  <span className="text-xs font-medium">Take Photo</span>
                </button>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 hover:border-cyan-500/60 transition cursor-pointer disabled:opacity-50"
                >
                  <Upload size={24} className="text-cyan-400" />
                  <span className="text-xs font-medium">Upload</span>
                </button>
                
                <button
                  onClick={removeBackground}
                  disabled={!editedImage || isProcessing}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 hover:border-emerald-500/60 transition cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 size={24} className="animate-spin text-emerald-400" /> : <Scissors size={24} className="text-emerald-400" />}
                  <span className="text-xs font-medium">Remove BG</span>
                </button>
                
                <button
                  onClick={applyRotate}
                  disabled={!editedImage || isProcessing}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-rose-600/20 to-pink-600/20 border border-rose-500/30 hover:border-rose-500/60 transition cursor-pointer disabled:opacity-50"
                >
                  <RotateCw size={24} className="text-rose-400" />
                  <span className="text-xs font-medium">Rotate</span>
                </button>
                
                <button
                  onClick={handleUndo}
                  disabled={historyIndex <= 0 || isProcessing}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition cursor-pointer disabled:opacity-50"
                >
                  <Undo size={24} className="text-gray-400" />
                  <span className="text-xs font-medium">Undo</span>
                </button>
                
                <button
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1 || isProcessing}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition cursor-pointer disabled:opacity-50"
                >
                  <Redo size={24} className="text-gray-400" />
                  <span className="text-xs font-medium">Redo</span>
                </button>
                
                <button
                  onClick={handleReset}
                  disabled={isProcessing}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/30 hover:border-red-500/60 transition cursor-pointer disabled:opacity-50"
                >
                  <Trash2 size={24} className="text-red-400" />
                  <span className="text-xs font-medium">Reset</span>
                </button>
              </div>
            </div>
            
            {/* Background Options - Show after BG removal */}
            {showBgOptions && subjectImage && (
              <div className="bg-[#161026] border border-gray-800/70 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers size={16} className="text-purple-400" />
                    Change Background
                  </h3>
                  <div className="flex gap-1 bg-[#0f0a19] rounded-lg p-1">
                    <button
                      onClick={() => setBgTab('colors')}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer ${bgTab === 'colors' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      Colors
                    </button>
                    <button
                      onClick={() => setBgTab('gradients')}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer ${bgTab === 'gradients' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      Gradients
                    </button>
                    <button
                      onClick={() => setBgTab('stock')}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer ${bgTab === 'stock' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      Stock Images
                    </button>
                  </div>
                </div>
                
                {/* Colors Tab */}
                {bgTab === 'colors' && (
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {colorPresets.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => handleBackgroundChange({ type: preset.type, value: preset.value, name: preset.name })}
                        disabled={isProcessing}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition cursor-pointer
                          ${selectedBgPreset?.name === preset.name 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-[#0f0a19] border border-gray-700 text-gray-400 hover:text-white'}`}
                      >
                        <div className={`w-6 h-6 rounded-full ${preset.color.includes('bg-') ? preset.color : `bg-[${preset.value}]`}`} 
                             style={preset.value && !preset.color.includes('bg-') ? { backgroundColor: preset.value } : {}} />
                        <span className="text-[9px]">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Gradients Tab */}
                {bgTab === 'gradients' && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {gradientPresets.map((preset) => {
                      const Icon = preset.icon;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => handleBackgroundChange({ type: 'gradient', value: preset.gradient, name: preset.name })}
                          disabled={isProcessing}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer
                            ${selectedBgPreset?.name === preset.name 
                              ? 'bg-indigo-600 text-white' 
                              : 'bg-[#0f0a19] border border-gray-700 text-gray-400 hover:text-white'}`}
                        >
                          <div className="w-4 h-4 rounded" style={{ background: preset.gradient }} />
                          <Icon size={12} />
                          {preset.name}
                        </button>
                      );
                    })}
                  </div>
                )}
                
                {/* Stock Images Tab */}
                {bgTab === 'stock' && (
                  <div>
                    <div className="relative mb-3">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        value={searchStockTerm}
                        onChange={(e) => setSearchStockTerm(e.target.value)}
                        placeholder="Search backgrounds..."
                        className="w-full bg-[#0f0a19] border border-gray-700/60 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/50 transition"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                      {filteredStockBackgrounds.map((bg) => {
                        const Icon = bg.icon;
                        return (
                          <button
                            key={bg.id}
                            onClick={() => handleBackgroundChange({ type: 'image', url: bg.url, name: bg.name })}
                            disabled={isProcessing}
                            className="group relative aspect-video rounded-lg overflow-hidden border border-gray-700 hover:border-indigo-500 transition cursor-pointer"
                          >
                            <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                              <span className="text-[10px] font-medium text-white">{bg.name}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Custom Color Picker */}
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <p className="text-xs text-gray-400 mb-2">Custom Color</p>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={customBgColor}
                      onChange={(e) => setCustomBgColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-[#0f0a19] border border-gray-700"
                    />
                    <button
                      onClick={() => handleBackgroundChange({ type: 'color', value: customBgColor, name: 'Custom' })}
                      disabled={isProcessing}
                      className="flex-1 px-3 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-xs text-cyan-400 hover:bg-cyan-500/20 transition cursor-pointer disabled:opacity-50"
                    >
                      Apply Color
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Filters Section */}
            {editedImage && (
              <div className="bg-[#161026] border border-gray-800/70 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Paintbrush size={16} className="text-purple-400" />
                  Filters
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {filters.map((filter) => {
                    const Icon = filter.icon;
                    return (
                      <button
                        key={filter.id}
                        onClick={() => setSelectedFilter(filter.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer
                          ${selectedFilter === filter.id 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-[#0f0a19] border border-gray-700 text-gray-400 hover:text-white'}`}
                      >
                        <Icon size={14} />
                        {filter.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Adjustments Section */}
            {editedImage && (
              <div className="bg-[#161026] border border-gray-800/70 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Contrast size={16} className="text-yellow-400" />
                  Adjustments
                </h3>
                <div className="space-y-4">
                  {adjustments.map((adj) => {
                    const Icon = adj.icon;
                    return (
                      <div key={adj.id}>
                        <label className="flex items-center justify-between text-xs text-gray-400 mb-2">
                          <span className="flex items-center gap-2">
                            <Icon size={12} /> {adj.label}
                          </span>
                          <span>{adjustmentValues[adj.id]}{adj.id === 'blur' ? 'px' : '%'}</span>
                        </label>
                        <input
                          type="range"
                          min={adj.min}
                          max={adj.max}
                          value={adjustmentValues[adj.id]}
                          onChange={(e) => updateAdjustment(adj.id, parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          {/* Center Panel - Image Preview */}
          <div className="lg:col-span-2">
            <div className="bg-[#161026] border border-gray-800/70 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ImageIcon size={16} className="text-indigo-400" />
                  Preview
                </h3>
                {editedImage && (
                  <div className="flex gap-2">
                    <button
                      onClick={downloadImage}
                      disabled={isProcessing}
                      className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-xs text-cyan-400 hover:bg-cyan-500/20 transition cursor-pointer disabled:opacity-50"
                    >
                      <Download size={12} className="inline mr-1" /> Download
                    </button>
                    <button
                      onClick={saveToDatabase}
                      disabled={isProcessing}
                      className="px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg text-xs text-green-400 hover:bg-green-500/20 transition cursor-pointer disabled:opacity-50"
                    >
                      {isProcessing ? <Loader2 size={12} className="animate-spin inline mr-1" /> : <Save size={12} className="inline mr-1" />}
                      Save
                    </button>
                  </div>
                )}
              </div>
              
              <div className="aspect-video bg-[#0f0a19] rounded-xl border border-gray-800 flex items-center justify-center overflow-hidden">
                {editedImage ? (
                  <img
                    src={editedImage}
                    alt="Edited preview"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="text-center p-8">
                    <Camera size={48} className="text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No image loaded</p>
                    <p className="text-gray-600 text-xs mt-1">Take a photo or upload an image to start editing</p>
                    <div className="flex gap-3 mt-4 justify-center">
                      <button
                        onClick={startCamera}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-medium transition cursor-pointer"
                      >
                        <Camera size={14} className="inline mr-1" /> Take Photo
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-xs font-medium transition cursor-pointer"
                      >
                        <Upload size={14} className="inline mr-1" /> Upload Image
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* AI Processing Indicator */}
              {isProcessing && (
                <div className="mt-4 flex items-center justify-center gap-2 text-yellow-400 text-sm">
                  <Loader2 size={16} className="animate-spin" />
                  Processing your image...
                </div>
              )}
            </div>
            
            {/* Info Banner */}
            <div className="mt-4 flex items-start gap-3 bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4">
              <Sparkles size={16} className="text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-indigo-300">AI-Powered Studio</p>
                <p className="text-[10px] text-gray-400">
                  1. Take a photo or upload an image<br />
                  2. Click "Remove BG" to remove background<br />
                  3. Choose a new background from Colors, Gradients, or Stock Images<br />
                  4. Apply filters and adjustments<br />
                  5. Save or download your creation!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}