"use client"

import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { resetAuthState } from '@/redux/slices/authSlice';
import { toast } from 'sonner';
import {
  Search, Bell, ChevronDown,
  User, Settings, Shield, LogOut,
} from 'lucide-react';

/**
 * Reusable TopBar component
 *
 * Props:
 *  - title        {string}  — left-side page title, e.g. "Dashboard"
 *  - showStatus   {boolean} — show/hide the "System Active" pill (default: true)
 *  - statusText   {string}  — override the status label (default: "System Active")
 *  - searchPlaceholder {string} — input placeholder (default: "Search photos, albums…")
 *  - onSearch     {fn}      — called with the search string on change (optional)
 *  - rightExtra   {ReactNode} — any extra element rendered to the right of the bell
 *
 * Usage:
 *   import TopBar from '@/components/TopBar';
 *   <TopBar title="Upload" />
 *   <TopBar title="Gallery" showStatus={false} />
 */
export default function TopBar({
  title           = 'Dashboard',
  showStatus      = true,
  statusText      = 'System Active',
  searchPlaceholder = 'Search photos, albums, or tags…',
  onSearch,
  rightExtra,
}) {
  const [showDropdown, setShowDropdown]       = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [searchVal, setSearchVal]             = useState('');
  const dropdownRef = useRef(null);
  const dispatch    = useDispatch();
  const router      = useRouter();
  const { user }    = useSelector((state) => state.auth);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowDropdown(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    setSearchVal(e.target.value);
    onSearch?.(e.target.value);
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

        {/* Right: search + bell + optional extra + profile */}
        <div className="flex items-center gap-4">

          {/* Search */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
            <input
              type="text"
              value={searchVal}
              onChange={handleSearchChange}
              placeholder={searchPlaceholder}
              className="bg-[#1c1430] border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-xs w-48 md:w-64 outline-none focus:border-indigo-500 transition cursor-text"
            />
          </div>

          {/* Bell */}
          <button className="cursor-pointer relative p-2.5 bg-[#1c1430] border border-gray-800 rounded-xl text-gray-400 hover:text-white transition">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </button>

          {/* Slot for page-specific extras (e.g. an "Upload" button on the upload page) */}
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

                {/* User info */}
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

                {/* Menu items */}
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

                {/* Logout */}
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