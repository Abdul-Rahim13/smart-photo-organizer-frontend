"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { CameraIcon, MailIcon, LockIcon, GoogleIcon } from "../login/icon";
import { HiOutlineEye, HiOutlineEyeOff, HiOutlineUser } from "react-icons/hi";

const ClientAnimation = dynamic(
  () => Promise.resolve(({ html }) => <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: html }} />),
  { ssr: false }
);

// ✅ Entire form is client-only — prevents all hydration errors from browser extensions
const RegisterForm = dynamic(() => Promise.resolve(function Form() {
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="w-full max-w-sm">

      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 shrink-0">
          <CameraIcon />
        </div>
        <span className="text-sm font-semibold text-gray-800 tracking-tight">SmartEditor AI</span>
      </div>

      {/* Heading — largest, heaviest */}
      <h1 className="login-heading text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-2">Create an account</h1>

      {/* Subheading — small, light */}
      <p className="text-sm font-normal text-gray-400 leading-relaxed mb-8">Unleash your creativity with AI.</p>

      {/* Name */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wide">
          Name <span className="text-violet-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 flex items-center">
            <HiOutlineUser className="w-4 h-4" />
          </span>
          <input type="text" placeholder="Enter your name" className="w-full pl-9 pr-4 py-3 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-500 transition placeholder:text-gray-400" />
        </div>
      </div>

      {/* Email */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wide">
          Email address <span className="text-violet-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 flex items-center">
            <MailIcon />
          </span>
          <input type="email" placeholder="Enter your email" className="w-full pl-9 pr-4 py-3 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-500 transition placeholder:text-gray-400" />
        </div>
      </div>

      {/* Password */}
      <div className="mb-2">
        <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wide">
          Password <span className="text-violet-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 flex items-center">
            <LockIcon />
          </span>
          <input type={showPassword ? "text" : "password"} placeholder="Create a password" className="w-full pl-9 pr-10 py-3 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-500 transition placeholder:text-gray-400" />
          <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-600 transition">
            {showPassword ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
          </button>
        </div>
        {/* Helper — smallest text, muted */}
        <p className="text-xs text-gray-400 mt-1.5 ml-1">Must be at least 8 characters.</p>
      </div>

      {/* Terms checkbox */}
      <div className="flex items-start gap-2.5 mb-6 mt-4">
        <button type="button" onClick={() => setAgreed((a) => !a)} className={`w-4 h-4 mt-0.5 rounded shrink-0 border flex items-center justify-center transition ${agreed ? "bg-violet-600 border-violet-600" : "border-gray-300 bg-white"}`}>
          {agreed && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
            </svg>
          )}
        </button>
        <p className="text-xs text-gray-500 leading-relaxed">
          I agree to the{" "}
          <a href="/terms" className="text-violet-600 font-semibold hover:underline">Terms &amp; Conditions</a>
        </p>
      </div>

      {/* Create Account — primary CTA */}
      <button className="w-full py-3 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white text-sm font-bold tracking-wide rounded-xl transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-300 active:translate-y-0 active:shadow-none mb-3">
        Create account
      </button>

      {/* Google — secondary */}
      <button className="w-full py-3 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium border border-gray-200 rounded-xl flex items-center justify-center gap-2.5 transition">
        <GoogleIcon />
        Sign up with Google
      </button>

      {/* Login link — smallest text */}
      <p className="text-xs text-gray-500 text-center mt-7">
        Already have an account?{" "}
        <a href="/login" className="text-violet-600 font-semibold hover:underline">Log in</a>
      </p>

    </div>
  );
}), { ssr: false });

export default function RegisterPage() {
  const [data, setData] = useState(null);
  const styleInjected = useRef(false);

  useEffect(() => {
    fetch("/animations/register.json")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Animation load error:", err));
  }, []);

  useEffect(() => {
    if (!data?.css || styleInjected.current) return;
    styleInjected.current = true;
    const style = document.createElement("style");
    style.id = "register-anim-style";
    style.innerHTML = data.css + `.scene { background: transparent !important; border-radius: 0 !important; box-shadow: none !important; width: 100% !important; height: 100% !important; min-height: 100% !important; padding: 0 !important; }`;
    document.head.appendChild(style);
  }, [data]);

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL — Animation ── */}
      <div className="hidden md:flex md:w-1/2 bg-violet-600 relative overflow-hidden items-center justify-center">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-violet-400/20 blur-3xl pointer-events-none" />
        <div className="w-full h-full flex items-center justify-center">
          {data?.html ? (
            <ClientAnimation html={data.html} />
          ) : (
            <div className="flex flex-col items-center gap-6 opacity-50">
              <div className="w-28 h-28 rounded-full border-2 border-dashed border-white/40 animate-spin" />
              <div className="flex flex-col items-center gap-2.5">
                <div className="w-44 h-4 rounded-lg bg-white/20" />
                <div className="w-32 h-3 rounded-lg bg-white/10" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL — Form ── */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12 bg-white">
        <RegisterForm />
      </div>

    </div>
  );
}