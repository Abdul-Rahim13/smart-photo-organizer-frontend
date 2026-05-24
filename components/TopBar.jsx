"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { resetAuthState } from '@/redux/slices/authSlice';
import { toast } from 'sonner';
import {
  Search, Bell, ChevronDown, X, CheckCircle, AlertCircle, Info,
  User, Settings, Shield, LogOut, Trash2, Upload, FolderHeart, Wand2, Star, Volume2, VolumeX
} from 'lucide-react';

// ─── NOTIFICATION SYSTEM ─────────────────────────────────────────────────────
const NOTIFICATIONS_KEY = 'app_notifications';
const SOUND_ENABLED_KEY = 'sound_enabled';

// Audio context for notification sound
let audioContext = null;
let notificationSound = null;

// Initialize audio
const initAudio = () => {
  if (typeof window === 'undefined') return;
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
};

// Play notification sound
const playNotificationSound = () => {
  if (typeof window === 'undefined') return;
  
  const soundEnabled = localStorage.getItem(SOUND_ENABLED_KEY) !== 'false';
  if (!soundEnabled) return;
  
  try {
    initAudio();
    
    // Create a simple beep sound using Web Audio API
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 880; // 880 Hz (A5 note)
    gainNode.gain.value = 0.3;
    
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5);
    oscillator.stop(audioContext.currentTime + 0.5);
    
    // Resume audio context if suspended
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
  } catch (err) {
    console.warn('Cannot play sound:', err);
  }
};

// Helper functions for notifications
const getNotificationsFromStorage = () => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(NOTIFICATIONS_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveNotificationsToStorage = (notifications) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
};

const addNotification = (title, message, type = 'info', link = null) => {
  const newNotification = {
    id: Date.now(),
    title,
    message,
    type,
    link,
    timestamp: new Date().toISOString(),
    read: false
  };
  const existing = getNotificationsFromStorage();
  const updated = [newNotification, ...existing].slice(0, 50);
  saveNotificationsToStorage(updated);
  
  // Play sound for notification
  playNotificationSound();
  
  // Show browser notification if permitted
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body: message });
  }
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('newNotification', { detail: newNotification }));
  }
  
  return newNotification;
};

// Request notification permission
const requestNotificationPermission = async () => {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

// Toggle sound
const toggleSound = () => {
  const current = localStorage.getItem(SOUND_ENABLED_KEY) !== 'false';
  const newValue = !current;
  localStorage.setItem(SOUND_ENABLED_KEY, newValue.toString());
  return newValue;
};

const isSoundEnabled = () => {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(SOUND_ENABLED_KEY) !== 'false';
};

const markNotificationAsRead = (id) => {
  const notifications = getNotificationsFromStorage();
  const updated = notifications.map(n => 
    n.id === id ? { ...n, read: true } : n
  );
  saveNotificationsToStorage(updated);
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('notificationsUpdated'));
  }
};

const markAllAsRead = () => {
  const notifications = getNotificationsFromStorage();
  const updated = notifications.map(n => ({ ...n, read: true }));
  saveNotificationsToStorage(updated);
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('notificationsUpdated'));
  }
};

const deleteNotification = (id) => {
  const notifications = getNotificationsFromStorage();
  const updated = notifications.filter(n => n.id !== id);
  saveNotificationsToStorage(updated);
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('notificationsUpdated'));
  }
};

const clearAllNotifications = () => {
  saveNotificationsToStorage([]);
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('notificationsUpdated'));
  }
};

// ─── NOTIFICATION PANEL COMPONENT ───────────────────────────────────────────
function NotificationPanel({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    const loadNotifications = () => {
      setNotifications(getNotificationsFromStorage());
    };
    
    loadNotifications();
    
    const handleUpdate = () => {
      loadNotifications();
    };
    
    window.addEventListener('notificationsUpdated', handleUpdate);
    window.addEventListener('newNotification', handleUpdate);
    
    return () => {
      window.removeEventListener('notificationsUpdated', handleUpdate);
      window.removeEventListener('newNotification', handleUpdate);
    };
  }, []);
  
  const getIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle size={14} className="text-green-400" />;
      case 'error': return <AlertCircle size={14} className="text-red-400" />;
      case 'warning': return <AlertCircle size={14} className="text-yellow-400" />;
      default: return <Info size={14} className="text-blue-400" />;
    }
  };
  
  const getTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <div className="absolute right-0 top-12 w-96 bg-[#1c1430] border border-gray-700/50 rounded-2xl shadow-2xl z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-[#1a1430]">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-yellow-400" />
          <span className="text-sm font-bold text-white">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
            >
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="text-[10px] text-red-400 hover:text-red-300 transition cursor-pointer"
            >
              Clear all
            </button>
          )}
          <button onClick={onClose} className="text-gray-500 hover:text-white transition cursor-pointer">
            <X size={14} />
          </button>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell size={32} className="text-gray-700 mb-2" />
            <p className="text-xs text-gray-500">No notifications yet</p>
            <p className="text-[9px] text-gray-600 mt-1">You'll see notifications here</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`px-4 py-3 border-b border-gray-800 hover:bg-white/5 transition cursor-pointer ${!notif.read ? 'bg-indigo-500/5' : ''}`}
              onClick={() => {
                markNotificationAsRead(notif.id);
                if (notif.link) {
                  window.location.href = notif.link;
                }
                onClose();
              }}
            >
              <div className="flex gap-3">
                <div className="shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-white">{notif.title}</p>
                    <span className="text-[9px] text-gray-500 shrink-0">{getTimeAgo(notif.timestamp)}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">{notif.message}</p>
                  {!notif.read && (
                    <div className="mt-1 flex justify-end">
                      <span className="text-[8px] text-indigo-400">● New</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── SEARCH RESULTS PANEL ───────────────────────────────────────────────────
function SearchResultsPanel({ query, results, onClose, onResultClick }) {
  if (!query) return null;
  
  return (
    <div className="absolute left-0 top-12 w-96 bg-[#1c1430] border border-gray-700/50 rounded-2xl shadow-2xl z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-[#1a1430]">
        <div className="flex items-center gap-2">
          <Search size={14} className="text-indigo-400" />
          <span className="text-sm font-bold text-white">Search Results</span>
          <span className="text-[10px] text-gray-500">{results.total} results</span>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition cursor-pointer">
          <X size={14} />
        </button>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {results.photos?.length > 0 && (
          <div className="p-2">
            <p className="text-[9px] text-gray-500 uppercase tracking-wider px-2 py-1">Photos</p>
            {results.photos.slice(0, 5).map(photo => (
              <div
                key={photo.id}
                onClick={() => onResultClick(`/dashboard/photos?view=${photo.id}`, photo.title)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-900/30 to-indigo-900/30 overflow-hidden shrink-0">
                  {photo.imageUrl ? (
                    <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Search size={12} className="text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{photo.title}</p>
                  <p className="text-[9px] text-gray-500">{photo.category || 'General'}</p>
                </div>
              </div>
            ))}
            {results.photos.length > 5 && (
              <button className="w-full text-center text-[9px] text-indigo-400 py-2 hover:bg-white/5 transition">
                +{results.photos.length - 5} more photos
              </button>
            )}
          </div>
        )}
        
        {results.albums?.length > 0 && (
          <div className="p-2 border-t border-gray-800">
            <p className="text-[9px] text-gray-500 uppercase tracking-wider px-2 py-1">Albums</p>
            {results.albums.slice(0, 3).map(album => (
              <div
                key={album.id}
                onClick={() => onResultClick(`/dashboard/albums?view=${album.id}`, album.name)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-900/30 to-amber-900/30 flex items-center justify-center">
                  <FolderHeart size={14} className="text-yellow-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{album.name}</p>
                  <p className="text-[9px] text-gray-500">{album.photosCount || 0} photos</p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {results.photos?.length === 0 && results.albums?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Search size={24} className="text-gray-700 mb-2" />
            <p className="text-xs text-gray-500">No results found</p>
            <p className="text-[9px] text-gray-600 mt-1">Try searching for something else</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SOUND TOGGLE BUTTON ────────────────────────────────────────────────────
function SoundToggleButton() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  useEffect(() => {
    setSoundEnabled(isSoundEnabled());
    // Request notification permission on mount
    requestNotificationPermission();
  }, []);
  
  const handleToggle = () => {
    const newState = toggleSound();
    setSoundEnabled(newState);
    toast.success(newState ? '🔊 Sound notifications enabled' : '🔇 Sound notifications disabled');
  };
  
  return (
    <button
      onClick={handleToggle}
      className="cursor-pointer p-2.5 bg-[#1c1430] border border-gray-800 rounded-xl text-gray-400 hover:text-white transition"
      title={soundEnabled ? 'Disable sound' : 'Enable sound'}
    >
      {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
    </button>
  );
}

// ─── MAIN TOPBAR COMPONENT ──────────────────────────────────────────────────
export default function TopBar({
  title           = 'Dashboard',
  showStatus      = true,
  statusText      = 'System Active',
  searchPlaceholder = 'Search photos, albums, or tags…',
  onSearch,
  rightExtra,
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [searchResults, setSearchResults] = useState({ photos: [], albums: [], total: 0 });
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const photosState = useSelector((state) => state.photos);
  const albumsState = useSelector((state) => state.albums);
  
  const photos = photosState?.items || [];
  const albums = albumsState?.items || [];

  // Load unread count
  useEffect(() => {
    const loadUnreadCount = () => {
      const notifications = getNotificationsFromStorage();
      const unread = notifications.filter(n => !n.read).length;
      setUnreadNotificationCount(unread);
    };
    
    loadUnreadCount();
    
    const handleUpdate = () => loadUnreadCount();
    window.addEventListener('notificationsUpdated', handleUpdate);
    window.addEventListener('newNotification', handleUpdate);
    
    return () => {
      window.removeEventListener('notificationsUpdated', handleUpdate);
      window.removeEventListener('newNotification', handleUpdate);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowDropdown(false);
      if (notificationsRef.current && !notificationsRef.current.contains(e.target))
        setShowNotifications(false);
      if (searchRef.current && !searchRef.current.contains(e.target))
        setShowSearchResults(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    if (searchVal.trim().length < 2) {
      setSearchResults({ photos: [], albums: [], total: 0 });
      setShowSearchResults(false);
      onSearch?.('');
      return;
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      const photoArray = Array.isArray(photos) ? photos : [];
      const albumArray = Array.isArray(albums) ? albums : [];
      
      const matchedPhotos = photoArray.filter(p => 
        (p.title || '').toLowerCase().includes(searchVal.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(searchVal.toLowerCase())
      );
      
      const matchedAlbums = albumArray.filter(a => 
        (a.title || a.name || '').toLowerCase().includes(searchVal.toLowerCase())
      );
      
      setSearchResults({
        photos: matchedPhotos,
        albums: matchedAlbums,
        total: matchedPhotos.length + matchedAlbums.length
      });
      setShowSearchResults(true);
      onSearch?.(searchVal);
    }, 300);
    
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchVal, photos, albums, onSearch]);

  const handleSearchChange = (e) => {
    setSearchVal(e.target.value);
  };

  const handleResultClick = (url, name) => {
    setShowSearchResults(false);
    setSearchVal('');
    router.push(url);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch(resetAuthState());
    setShowLogoutModal(false);
    toast.success('Logged out successfully');
    router.replace('/login');
  };

  const userName     = user?.name  || 'Abdul';
  const userEmail    = user?.email || 'user@example.com';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const firstName    = userName.split(' ')[0];

  // Expose addNotification function globally for other components
  if (typeof window !== 'undefined') {
    window.addNotification = addNotification;
  }

  return (
    <>
      {/* ── TOP BAR ──────────────────────────────────────────────────── */}
      <header className="flex flex-wrap justify-between items-center mb-10 gap-4">

        {/* Left: title + status pill */}
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold">{title}</h2>

          {showStatus && (
            <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider">
                {statusText}
              </span>
            </div>
          )}
        </div>

        {/* Right: search + bell + sound toggle + optional extra + profile */}
        <div className="flex items-center gap-4">

          {/* Search */}
          <div className="relative hidden sm:block" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
            <input
              type="text"
              value={searchVal}
              onChange={handleSearchChange}
              placeholder={searchPlaceholder}
              className="bg-[#1c1430] border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-xs w-48 md:w-64 outline-none focus:border-indigo-500 transition cursor-text"
            />
            {searchVal && (
              <button
                onClick={() => {
                  setSearchVal('');
                  setShowSearchResults(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
            {showSearchResults && (
              <SearchResultsPanel
                query={searchVal}
                results={searchResults}
                onClose={() => setShowSearchResults(false)}
                onResultClick={handleResultClick}
              />
            )}
          </div>

          {/* Sound Toggle Button */}
          <SoundToggleButton />

          {/* Bell with notification count */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="cursor-pointer relative p-2.5 bg-[#1c1430] border border-gray-800 rounded-xl text-gray-400 hover:text-white transition"
            >
              <Bell size={18} />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <NotificationPanel onClose={() => setShowNotifications(false)} />
            )}
          </div>

          {/* Slot for page-specific extras */}
          {rightExtra}

          {/* Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(prev => !prev)}
              className="cursor-pointer flex items-center gap-2 bg-[#4f46e5] px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#4338ca] transition shadow-lg shadow-indigo-600/20"
            >
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[9px] font-black">
                {userInitials}
              </div>
              {firstName}
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown panel */}
            {showDropdown && (
              <div className="absolute right-0 top-12 w-64 bg-[#1c1430] border border-gray-700/50 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="px-4 py-4 border-b border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-sm font-black text-indigo-300">
                      {userInitials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{userName}</p>
                      <p className="text-[10px] text-gray-400 truncate">{userEmail}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 bg-green-500/10 px-2.5 py-1.5 rounded-lg border border-green-500/20 w-fit">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span className="text-[10px] text-green-400 font-bold">Active Session</span>
                  </div>
                </div>

                <div className="p-2">
                  <DropdownItem
                    icon={User}
                    label="My Profile"
                    sub="View your profile"
                    onClick={() => { setShowDropdown(false); router.push('/dashboard/settings'); }}
                  />
                  <DropdownItem
                    icon={Settings}
                    label="Settings"
                    sub="App preferences"
                    onClick={() => { setShowDropdown(false); router.push('/dashboard/settings'); }}
                  />
                  <DropdownItem
                    icon={Shield}
                    label="Security"
                    sub="Password & privacy"
                    onClick={() => { setShowDropdown(false); router.push('/dashboard/settings'); }}
                  />
                </div>

                <div className="p-2 border-t border-gray-800">
                  <button
                    onClick={() => { setShowDropdown(false); setShowLogoutModal(true); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                      <LogOut size={15} className="text-red-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold">Logout</p>
                      <p className="text-[10px] text-gray-500">Sign out of your account</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── LOGOUT MODAL ─────────────────────────────────────────────── */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.6)' }}
        >
          <div className="bg-[#1c1430] border border-gray-700/50 rounded-2xl p-8 w-full max-w-sm mx-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
              <LogOut size={24} className="text-red-400" />
            </div>
            <h2 className="text-white text-xl font-bold text-center mb-2">Sign out?</h2>
            <p className="text-gray-400 text-sm text-center leading-relaxed mb-8">
              Are you sure you want to logout? You will need to sign in again to access your dashboard.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-300 text-sm font-medium hover:bg-gray-800/50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="flex-1 py-3 rounded-xl bg-red-500/90 hover:bg-red-500 text-white text-sm font-bold transition cursor-pointer"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Internal sub-component ───────────────────────────────────────────────
function DropdownItem({ icon: Icon, label, sub, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:bg-white/5 transition cursor-pointer group"
    >
      <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20 transition">
        <Icon size={15} className="text-gray-400 group-hover:text-indigo-400 transition" />
      </div>
      <div className="text-left">
        <p className="text-xs font-bold text-white">{label}</p>
        <p className="text-[10px] text-gray-500">{sub}</p>
      </div>
    </button>
  );
}

// ─── EXPORT NOTIFICATION FUNCTIONS FOR USE IN OTHER PAGES ───────────────────
export { addNotification, markNotificationAsRead, getNotificationsFromStorage, requestNotificationPermission };