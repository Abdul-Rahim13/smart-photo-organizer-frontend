"use client"

import React, { useState } from 'react';
import {
  User, Lock, Bell, Shield, Palette, Cpu,
  Camera, Mail, Globe, Eye, EyeOff, Save,
  RotateCcw, ChevronRight, Check, X,
  Smartphone, Moon, Sun, Volume2, VolumeX,
  Download, Trash2, AlertTriangle, Info,
  CheckCircle, ToggleLeft, ToggleRight, Key
} from 'lucide-react';

// ─── SECTION NAV CONFIG ───────────────────────────────────────────────────────
const navItems = [
  { key: "profile",       label: "Profile",        icon: User,      color: "text-indigo-400",  bg: "bg-indigo-500/10"  },
  { key: "security",      label: "Security",        icon: Lock,      color: "text-yellow-400",  bg: "bg-yellow-500/10"  },
  { key: "notifications", label: "Notifications",   icon: Bell,      color: "text-rose-400",    bg: "bg-rose-500/10"    },
  { key: "privacy",       label: "Privacy",         icon: Shield,    color: "text-green-400",   bg: "bg-green-500/10"   },
  { key: "appearance",    label: "Appearance",      icon: Palette,   color: "text-purple-400",  bg: "bg-purple-500/10"  },
  { key: "storage",       label: "Storage & Data",  icon: Cpu,       color: "text-cyan-400",    bg: "bg-cyan-500/10"    },
];

// ─── REUSABLE COMPONENTS ──────────────────────────────────────────────────────

function SectionHeader({ title, desc, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="flex items-start gap-3 mb-6 pb-5 border-b border-gray-800/60">
      <div className={`${iconBg} ${iconColor} p-2.5 rounded-xl shrink-0`}>
        <Icon size={18} />
      </div>
      <div>
        <h3 className="font-black text-white text-base">{title}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

function FieldLabel({ children, required }) {
  return (
    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

function TextInput({ value, onChange, placeholder, type = "text", disabled }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full bg-[#0f0a19] border border-gray-700/60 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/50 transition disabled:opacity-40 disabled:cursor-not-allowed"
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-[#0f0a19] border border-gray-700/60 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/50 transition resize-none"
    />
  );
}

function Toggle({ checked, onChange, label, desc, danger }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5 border-b border-gray-800/40 last:border-0">
      <div className="min-w-0">
        <p className={`text-sm font-semibold ${danger ? 'text-red-400' : 'text-gray-200'}`}>{label}</p>
        {desc && <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{desc}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`shrink-0 w-11 h-6 rounded-full border transition-all duration-300 cursor-pointer relative
          ${checked
            ? danger ? 'bg-red-500/20 border-red-500/40' : 'bg-indigo-500/20 border-indigo-500/40'
            : 'bg-gray-800 border-gray-700'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 shadow-md
          ${checked
            ? danger ? 'left-5 bg-red-400' : 'left-5 bg-indigo-400'
            : 'left-0.5 bg-gray-500'}`}
        />
      </button>
    </div>
  );
}

function SelectField({ value, onChange, options, label }) {
  return (
    <div>
      {label && <FieldLabel>{label}</FieldLabel>}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-[#0f0a19] border border-gray-700/60 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50 transition cursor-pointer appearance-none"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function DangerZoneItem({ label, desc, btnLabel, btnIcon: Icon, onClick }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-gray-800/40 last:border-0">
      <div>
        <p className="text-sm font-semibold text-red-400">{label}</p>
        <p className="text-[11px] text-gray-500 mt-0.5">{desc}</p>
      </div>
      <button
        onClick={onClick}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-bold cursor-pointer transition shrink-0"
      >
        {Icon && <Icon size={12} />} {btnLabel}
      </button>
    </div>
  );
}

// ─── SECTIONS ─────────────────────────────────────────────────────────────────

function ProfileSection({ data, onChange }) {
  return (
    <div className="space-y-5">
      <SectionHeader title="Profile Settings" desc="Manage your personal information and public profile" icon={User} iconBg="bg-indigo-500/10" iconColor="text-indigo-400" />

      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-3xl font-black text-white select-none">
            {data.name?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <button className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-[#1c1430] border border-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition cursor-pointer">
            <Camera size={12} />
          </button>
        </div>
        <div>
          <p className="text-sm font-bold text-white">{data.name || "Your Name"}</p>
          <p className="text-xs text-gray-500">{data.email || "your@email.com"}</p>
          <button className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold mt-1.5 cursor-pointer transition">
            Change Avatar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><FieldLabel required>Full Name</FieldLabel><TextInput value={data.name} onChange={v => onChange("name", v)} placeholder="Abdul" /></div>
        <div><FieldLabel required>Username</FieldLabel><TextInput value={data.username} onChange={v => onChange("username", v)} placeholder="@abdul" /></div>
        <div className="sm:col-span-2"><FieldLabel required>Email Address</FieldLabel><TextInput value={data.email} onChange={v => onChange("email", v)} placeholder="abdul@example.com" type="email" /></div>
        <div><FieldLabel>Phone</FieldLabel><TextInput value={data.phone} onChange={v => onChange("phone", v)} placeholder="+1 234 567 890" type="tel" /></div>
        <div><FieldLabel>Website</FieldLabel><TextInput value={data.website} onChange={v => onChange("website", v)} placeholder="https://yoursite.com" /></div>
        <div className="sm:col-span-2"><FieldLabel>Bio</FieldLabel><TextArea value={data.bio} onChange={v => onChange("bio", v)} placeholder="AI Photo Organizer User" rows={3} /></div>
      </div>
    </div>
  );
}

function SecuritySection({ data, onChange }) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = data.newPassword?.length >= 12 ? "Strong" : data.newPassword?.length >= 8 ? "Medium" : data.newPassword?.length > 0 ? "Weak" : null;
  const strengthColor = strength === "Strong" ? "bg-green-500" : strength === "Medium" ? "bg-yellow-500" : "bg-red-500";
  const strengthText  = strength === "Strong" ? "text-green-400" : strength === "Medium" ? "text-yellow-400" : "text-red-400";
  const strengthW     = strength === "Strong" ? "w-full" : strength === "Medium" ? "w-2/3" : "w-1/3";

  return (
    <div className="space-y-6">
      <SectionHeader title="Security" desc="Update your password and manage account security" icon={Lock} iconBg="bg-yellow-500/10" iconColor="text-yellow-400" />

      <div className="space-y-4">
        <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">Change Password</h4>

        {/* Current password */}
        <div>
          <FieldLabel>Current Password</FieldLabel>
          <div className="relative">
            <TextInput value={data.currentPassword} onChange={v => onChange("currentPassword", v)} placeholder="Enter current password" type={showCurrent ? "text" : "password"} />
            <button onClick={() => setShowCurrent(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer transition">
              {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* New password */}
        <div>
          <FieldLabel>New Password</FieldLabel>
          <div className="relative">
            <TextInput value={data.newPassword} onChange={v => onChange("newPassword", v)} placeholder="At least 8 characters" type={showNew ? "text" : "password"} />
            <button onClick={() => setShowNew(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer transition">
              {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {strength && (
            <div className="mt-2">
              <div className="h-1 bg-gray-800 rounded-full overflow-hidden mb-1">
                <div className={`h-full rounded-full transition-all ${strengthColor} ${strengthW}`} />
              </div>
              <p className={`text-[10px] font-bold ${strengthText}`}>Password strength: {strength}</p>
            </div>
          )}
        </div>

        {/* Confirm */}
        <div>
          <FieldLabel>Confirm New Password</FieldLabel>
          <div className="relative">
            <TextInput value={data.confirmPassword} onChange={v => onChange("confirmPassword", v)} placeholder="Repeat new password" type={showConfirm ? "text" : "password"} />
            <button onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer transition">
              {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {data.confirmPassword && data.newPassword !== data.confirmPassword && (
            <p className="text-[10px] text-red-400 font-bold mt-1 flex items-center gap-1"><X size={10} /> Passwords don't match</p>
          )}
          {data.confirmPassword && data.newPassword === data.confirmPassword && data.newPassword && (
            <p className="text-[10px] text-green-400 font-bold mt-1 flex items-center gap-1"><Check size={10} /> Passwords match</p>
          )}
        </div>

        <button className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer">
          <Key size={14} /> Change Password
        </button>
      </div>

      <div className="border-t border-gray-800/60 pt-5 space-y-1">
        <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Sessions & Access</h4>
        <Toggle label="Two-Factor Authentication" desc="Add an extra layer of security to your account" checked={data.twoFactor} onChange={v => onChange("twoFactor", v)} />
        <Toggle label="Login Notifications" desc="Get notified when a new device logs in" checked={data.loginNotify} onChange={v => onChange("loginNotify", v)} />
        <Toggle label="Session Timeout" desc="Auto-logout after 30 minutes of inactivity" checked={data.sessionTimeout} onChange={v => onChange("sessionTimeout", v)} />
      </div>
    </div>
  );
}

function NotificationsSection({ data, onChange }) {
  return (
    <div className="space-y-5">
      <SectionHeader title="Notifications" desc="Choose what alerts and updates you receive" icon={Bell} iconBg="bg-rose-500/10" iconColor="text-rose-400" />

      <div className="border-b border-gray-800/60 pb-5">
        <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Push Notifications</h4>
        <div className="space-y-1">
          <Toggle label="Processing Complete" desc="When AI finishes processing your photos" checked={data.processing} onChange={v => onChange("processing", v)} />
          <Toggle label="Smart Album Created" desc="When a new smart album is generated" checked={data.smartAlbum} onChange={v => onChange("smartAlbum", v)} />
          <Toggle label="Storage Warnings" desc="When your storage is running low" checked={data.storageWarn} onChange={v => onChange("storageWarn", v)} />
          <Toggle label="Shared Album Updates" desc="When someone adds photos to a shared album" checked={data.sharedAlbum} onChange={v => onChange("sharedAlbum", v)} />
        </div>
      </div>

      <div>
        <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Email Digests</h4>
        <SelectField
          label="Digest Frequency"
          value={data.digestFreq}
          onChange={v => onChange("digestFreq", v)}
          options={[
            { value: "daily",   label: "Daily Digest"   },
            { value: "weekly",  label: "Weekly Digest"  },
            { value: "monthly", label: "Monthly Digest" },
            { value: "never",   label: "Never"          },
          ]}
        />
        <div className="space-y-1 mt-4">
          <Toggle label="Marketing Emails" desc="Product updates, tips, and announcements" checked={data.marketing} onChange={v => onChange("marketing", v)} />
          <Toggle label="Security Alerts" desc="Important security and account notices" checked={data.securityAlerts} onChange={v => onChange("securityAlerts", v)} />
        </div>
      </div>
    </div>
  );
}

function PrivacySection({ data, onChange }) {
  return (
    <div className="space-y-5">
      <SectionHeader title="Privacy" desc="Control who can see your content and data" icon={Shield} iconBg="bg-green-500/10" iconColor="text-green-400" />

      <div className="space-y-4">
        <SelectField label="Profile Visibility" value={data.profileVisibility} onChange={v => onChange("profileVisibility", v)}
          options={[
            { value: "public",  label: "Public — Anyone can view" },
            { value: "friends", label: "Friends only"             },
            { value: "private", label: "Private — Only me"        },
          ]}
        />
        <SelectField label="Default Album Privacy" value={data.albumDefault} onChange={v => onChange("albumDefault", v)}
          options={[
            { value: "private", label: "Private" },
            { value: "shared",  label: "Shared"  },
            { value: "public",  label: "Public"  },
          ]}
        />
      </div>

      <div className="border-t border-gray-800/60 pt-5 space-y-1">
        <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Data & Analytics</h4>
        <Toggle label="Usage Analytics" desc="Help improve the app by sharing anonymous usage data" checked={data.analytics} onChange={v => onChange("analytics", v)} />
        <Toggle label="AI Model Training" desc="Allow your photos to improve AI accuracy (anonymized)" checked={data.aiTraining} onChange={v => onChange("aiTraining", v)} />
        <Toggle label="Face Recognition" desc="Allow AI to identify and group faces" checked={data.faceRecog} onChange={v => onChange("faceRecog", v)} />
        <Toggle label="Location Metadata" desc="Show location info from photo EXIF data" checked={data.locationMeta} onChange={v => onChange("locationMeta", v)} />
      </div>

      {/* Danger zone */}
      <div className="border border-red-500/15 rounded-2xl p-4 mt-2">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={14} className="text-red-400" />
          <h4 className="text-xs font-black uppercase tracking-widest text-red-400">Danger Zone</h4>
        </div>
        <DangerZoneItem label="Export My Data" desc="Download all your photos and account data" btnLabel="Export" btnIcon={Download} onClick={() => {}} />
        <DangerZoneItem label="Clear All Data" desc="Permanently remove all photos and albums" btnLabel="Clear" btnIcon={Trash2} onClick={() => {}} />
        <DangerZoneItem label="Delete Account" desc="Permanently delete your account and all associated data" btnLabel="Delete" btnIcon={X} onClick={() => {}} />
      </div>
    </div>
  );
}

function AppearanceSection({ data, onChange }) {
  const themes = [
    { key: "dark",   label: "Dark",   icon: Moon,  preview: "bg-gray-900" },
    { key: "light",  label: "Light",  icon: Sun,   preview: "bg-gray-100" },
    { key: "system", label: "System", icon: Smartphone, preview: "bg-gray-600" },
  ];

  const accents = [
    { key: "indigo", color: "bg-indigo-500" },
    { key: "violet", color: "bg-violet-500" },
    { key: "rose",   color: "bg-rose-500"   },
    { key: "cyan",   color: "bg-cyan-500"   },
    { key: "green",  color: "bg-green-500"  },
    { key: "yellow", color: "bg-yellow-500" },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader title="Appearance" desc="Personalize how the app looks and feels" icon={Palette} iconBg="bg-purple-500/10" iconColor="text-purple-400" />

      <div>
        <FieldLabel>Theme</FieldLabel>
        <div className="grid grid-cols-3 gap-3">
          {themes.map(t => {
            const Icon = t.icon;
            const active = data.theme === t.key;
            return (
              <button
                key={t.key}
                onClick={() => onChange("theme", t.key)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition cursor-pointer
                  ${active ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300' : 'border-gray-700/60 bg-[#0f0a19] text-gray-400 hover:border-gray-500'}`}
              >
                <Icon size={20} />
                <span className="text-[11px] font-bold">{t.label}</span>
                {active && <Check size={12} className="text-indigo-400" />}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <FieldLabel>Accent Color</FieldLabel>
        <div className="flex items-center gap-3 flex-wrap">
          {accents.map(a => (
            <button
              key={a.key}
              onClick={() => onChange("accent", a.key)}
              className={`w-8 h-8 rounded-full ${a.color} cursor-pointer transition-all flex items-center justify-center
                ${data.accent === a.key ? 'ring-2 ring-offset-2 ring-offset-[#0f0a19] ring-white/50 scale-110' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
            >
              {data.accent === a.key && <Check size={14} className="text-white" />}
            </button>
          ))}
        </div>
      </div>

      <div>
        <SelectField label="Font Size" value={data.fontSize} onChange={v => onChange("fontSize", v)}
          options={[
            { value: "sm",  label: "Small"  },
            { value: "md",  label: "Medium (default)" },
            { value: "lg",  label: "Large"  },
          ]}
        />
      </div>

      <div className="border-t border-gray-800/60 pt-4 space-y-1">
        <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Interface</h4>
        <Toggle label="Compact Mode" desc="Show more content with reduced spacing" checked={data.compact} onChange={v => onChange("compact", v)} />
        <Toggle label="Animations" desc="Enable smooth transitions and micro-interactions" checked={data.animations} onChange={v => onChange("animations", v)} />
        <Toggle label="Auto-play Videos" desc="Videos play automatically when browsing" checked={data.autoplay} onChange={v => onChange("autoplay", v)} />
      </div>
    </div>
  );
}

function StorageSection({ data, onChange }) {
  const used = 38.4;
  const total = 100;
  const pct = (used / total) * 100;

  return (
    <div className="space-y-6">
      <SectionHeader title="Storage & Data" desc="Monitor usage and manage storage preferences" icon={Cpu} iconBg="bg-cyan-500/10" iconColor="text-cyan-400" />

      {/* Storage meter */}
      <div className="bg-[#0f0a19] border border-gray-800/50 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-white">Storage Used</p>
          <p className="text-xs text-gray-500">{used} GB of {total} GB</p>
        </div>
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden mb-3">
          <div
            className="h-full rounded-full bg-cyan-500 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Photos",  value: "28.1 GB", color: "bg-cyan-500"    },
            { label: "Albums",  value: "7.2 GB",  color: "bg-indigo-500"  },
            { label: "Trash",   value: "3.1 GB",  color: "bg-red-500"     },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full shrink-0 ${color}`} />
              <div>
                <p className="text-[10px] text-gray-500">{label}</p>
                <p className="text-xs font-bold text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <SelectField label="Auto-Backup Frequency" value={data.backupFreq} onChange={v => onChange("backupFreq", v)}
          options={[
            { value: "realtime", label: "Real-time"  },
            { value: "daily",    label: "Daily"      },
            { value: "weekly",   label: "Weekly"     },
            { value: "off",      label: "Disabled"   },
          ]}
        />
        <SelectField label="Photo Upload Quality" value={data.uploadQuality} onChange={v => onChange("uploadQuality", v)}
          options={[
            { value: "original",  label: "Original (largest)"   },
            { value: "high",      label: "High Quality"         },
            { value: "standard",  label: "Standard"             },
          ]}
        />
      </div>

      <div className="border-t border-gray-800/60 pt-4 space-y-1">
        <Toggle label="Auto-Delete Trash" desc="Automatically delete trashed photos after 30 days" checked={data.autoDelete} onChange={v => onChange("autoDelete", v)} />
        <Toggle label="Compress Duplicates" desc="Save space by compressing detected duplicates" checked={data.compressDup} onChange={v => onChange("compressDup", v)} />
        <Toggle label="Offline Cache" desc="Cache recent photos for offline viewing" checked={data.offlineCache} onChange={v => onChange("offlineCache", v)} />
      </div>

      <div className="flex gap-3">
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 text-xs font-bold cursor-pointer transition">
          <Download size={13} /> Export Data
        </button>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-bold cursor-pointer transition">
          <Trash2 size={13} /> Clear Cache
        </button>
      </div>
    </div>
  );
}

// ─── DEFAULT STATE ─────────────────────────────────────────────────────────────
const defaultState = {
  profile:       { name: "Abdul", username: "@abdul", email: "abdul@example.com", phone: "", website: "", bio: "AI Photo Organizer User" },
  security:      { currentPassword: "", newPassword: "", confirmPassword: "", twoFactor: false, loginNotify: true, sessionTimeout: false },
  notifications: { processing: true, smartAlbum: true, storageWarn: true, sharedAlbum: false, digestFreq: "weekly", marketing: false, securityAlerts: true },
  privacy:       { profileVisibility: "private", albumDefault: "private", analytics: true, aiTraining: false, faceRecog: true, locationMeta: true },
  appearance:    { theme: "dark", accent: "indigo", fontSize: "md", compact: false, animations: true, autoplay: false },
  storage:       { backupFreq: "daily", uploadQuality: "original", autoDelete: true, compressDup: false, offlineCache: true },
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [active,  setActive]  = useState("profile");
  const [state,   setState]   = useState(defaultState);
  const [saved,   setSaved]   = useState(false);
  const [dirty,   setDirty]   = useState(false);

  const updateSection = (section, key, value) => {
    setState(prev => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
    setDirty(true);
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setDirty(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    setState(defaultState);
    setDirty(false);
    setSaved(false);
  };

  const cfg = navItems.find(n => n.key === active);

  return (
    <div className="min-h-screen bg-[#0f0a19] text-gray-100">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-[#0f0a19]/95 backdrop-blur-sm border-b border-gray-800/60 px-6 md:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-white">Settings</h2>
            <p className="text-[11px] text-gray-500">Manage your account preferences</p>
          </div>
          <div className="flex items-center gap-3">
            {dirty && (
              <span className="text-[10px] font-bold text-yellow-400 flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" /> Unsaved changes
              </span>
            )}
            <button
              onClick={handleReset}
              className="flex items-center gap-2 bg-[#1c1430] border border-gray-700 hover:border-gray-500 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition cursor-pointer"
            >
              <RotateCcw size={13} /> Reset to Default
            </button>
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer shadow-lg
                ${saved
                  ? 'bg-green-600 shadow-green-500/20 text-white'
                  : 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-yellow-500/20'}`}
            >
              {saved ? <><CheckCircle size={13} /> Saved!</> : <><Save size={13} /> Save Changes</>}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-0">

        {/* ── SIDEBAR NAV ────────────────────────────────────────────────── */}
        <aside className="lg:w-56 shrink-0 border-b lg:border-b-0 lg:border-r border-gray-800/60 p-4 lg:p-6 lg:min-h-[calc(100vh-73px)]">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = active === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActive(item.key)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer w-full text-left
                    ${isActive
                      ? `${item.bg} ${item.color} border border-current/20`
                      : 'text-gray-500 hover:text-gray-200 hover:bg-white/3'}`}
                >
                  <Icon size={15} />
                  {item.label}
                  {isActive && <ChevronRight size={12} className="ml-auto hidden lg:block opacity-60" />}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ── CONTENT AREA ───────────────────────────────────────────────── */}
        <main className="flex-1 p-6 md:p-8 max-w-2xl">
          {active === "profile"       && <ProfileSection       data={state.profile}       onChange={(k, v) => updateSection("profile",       k, v)} />}
          {active === "security"      && <SecuritySection      data={state.security}      onChange={(k, v) => updateSection("security",      k, v)} />}
          {active === "notifications" && <NotificationsSection data={state.notifications} onChange={(k, v) => updateSection("notifications", k, v)} />}
          {active === "privacy"       && <PrivacySection       data={state.privacy}       onChange={(k, v) => updateSection("privacy",       k, v)} />}
          {active === "appearance"    && <AppearanceSection    data={state.appearance}    onChange={(k, v) => updateSection("appearance",    k, v)} />}
          {active === "storage"       && <StorageSection       data={state.storage}       onChange={(k, v) => updateSection("storage",       k, v)} />}
        </main>
      </div>

    </div>
  );
}