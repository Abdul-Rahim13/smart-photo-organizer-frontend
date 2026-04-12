"use client";

import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { CameraIcon, MailIcon, LockIcon } from "../login/icon";
import { HiOutlineEye, HiOutlineEyeOff, HiArrowLeft, HiOutlineMail, HiCheckCircle } from "react-icons/hi";

// ✅ Entire flow client-only — prevents hydration errors
const ForgetForm = dynamic(() => Promise.resolve(function Form() {
  const [step, setStep] = useState(1); // 1 = email, 2 = code, 3 = new password, 4 = success
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  // Handle OTP input — auto jump to next box
  function handleCodeChange(val, idx) {
    if (!/^\d*$/.test(val)) return;
    const updated = [...code];
    updated[idx] = val.slice(-1);
    setCode(updated);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  }

  function handleCodeKeyDown(e, idx) {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  }

  function handleCodePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const updated = [...code];
    pasted.split("").forEach((char, i) => { updated[i] = char; });
    setCode(updated);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  }

  const steps = [
    { num: 1, label: "Email" },
    { num: 2, label: "Verify" },
    { num: 3, label: "Reset" },
  ];

  return (
    <div className="w-full max-w-sm">

      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 shrink-0">
          <CameraIcon />
        </div>
        <span className="text-sm font-semibold text-gray-800 tracking-tight">SmartEditor AI</span>
      </div>

      {/* Step indicators — only show on steps 1-3 */}
      {step !== 4 && (
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s.num ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                  {step > s.num ? (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                    </svg>
                  ) : s.num}
                </div>
                <span className={`text-xs font-medium ${step >= s.num ? "text-violet-600" : "text-gray-400"}`}>{s.label}</span>
              </div>
              {i < steps.length - 1 && <div className={`flex-1 h-px w-8 ${step > s.num ? "bg-violet-400" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>
      )}

      {/* ── STEP 1: Enter Email ── */}
      {step === 1 && (
        <div>
          <a href="/login" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-600 transition mb-6">
            <HiArrowLeft className="w-3.5 h-3.5" /> Back to login
          </a>

          <h1 className="login-heading text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-2">Forgot password?</h1>
          <p className="text-sm text-gray-400 leading-relaxed mb-8">No worries! Enter your email and we will send you a reset code.</p>

          <div className="mb-6">
            <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wide">Email address</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 flex items-center"><MailIcon /></span>
              <input type="email" placeholder="you@example.com" className="w-full pl-9 pr-4 py-3 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-500 transition placeholder:text-gray-400" />
            </div>
          </div>

          <button onClick={() => setStep(2)} className="cursor-pointer w-full py-3 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white text-sm font-bold tracking-wide rounded-xl transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-300 active:translate-y-0 active:shadow-none">
            Send reset code
          </button>
        </div>
      )}

      {/* ── STEP 2: Enter OTP Code ── */}
      {step === 2 && (
        <div>
          <button type="button" onClick={() => setStep(1)} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-600 transition mb-6">
            <HiArrowLeft className="cursor-pointer w-3.5 h-3.5" /> Back
          </button>

          <h1 className="login-heading text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-2">Check your email</h1>
          <p className="text-sm text-gray-400 leading-relaxed mb-1">We sent a 6-digit code to</p>
          <p className="text-sm font-semibold text-violet-600 mb-8">your@email.com</p>

          {/* OTP boxes */}
          <div className="flex gap-2 justify-between mb-6" onPaste={handleCodePaste}>
            {code.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(e.target.value, idx)}
                onKeyDown={(e) => handleCodeKeyDown(e, idx)}
                className={`w-12 h-12 text-center text-lg font-bold text-gray-900 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-500 transition ${digit ? "border-violet-400 bg-violet-50" : "border-gray-200"}`}
              />
            ))}
          </div>

          <button onClick={() => setStep(3)} className="cursor-pointer w-full py-3 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white text-sm font-bold tracking-wide rounded-xl transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-300 active:translate-y-0 active:shadow-none mb-4">
            Verify code
          </button>

          {/* Resend */}
          <p className="text-xs text-gray-400 text-center">
            {"Didn't receive the code?"}{" "}
            <button type="button" className="cursor-pointer text-violet-600 font-semibold hover:underline">Resend</button>
          </p>
        </div>
      )}

      {/* ── STEP 3: New Password ── */}
      {step === 3 && (
        <div>
          <button type="button" onClick={() => setStep(2)} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-600 transition mb-6">
            <HiArrowLeft className="cursor-pointer w-3.5 h-3.5" /> Back
          </button>

          <h1 className="login-heading text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-2">Set new password</h1>
          <p className="text-sm text-gray-400 leading-relaxed mb-8">Your new password must be different from your previous one.</p>

          {/* New Password */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wide">New password</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 flex items-center"><LockIcon /></span>
              <input type={showPassword ? "text" : "password"} placeholder="Enter new password" className="w-full pl-9 pr-10 py-3 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-500 transition placeholder:text-gray-400" />
              <button type="button" onClick={() => setShowPassword((p) => !p)} className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-600 transition">
                {showPassword ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1.5 ml-1">Must be at least 8 characters.</p>
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wide">Confirm password</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 flex items-center"><LockIcon /></span>
              <input type={showConfirm ? "text" : "password"} placeholder="Confirm new password" className="w-full pl-9 pr-10 py-3 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-500 transition placeholder:text-gray-400" />
              <button type="button" onClick={() => setShowConfirm((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-600 transition">
                {showConfirm ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button onClick={() => setStep(4)} className="cursor-pointer w-full py-3 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white text-sm font-bold tracking-wide rounded-xl transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-300 active:translate-y-0 active:shadow-none">
            Reset password
          </button>
        </div>
      )}

      {/* ── STEP 4: Success ── */}
      {step === 4 && (
        <div className="flex flex-col items-center text-center">
          {/* Success icon */}
          <div className="w-16 h-16 rounded-full bg-violet-50 flex items-center justify-center mb-6">
            <HiCheckCircle className="w-9 h-9 text-violet-600" />
          </div>

          <h1 className="login-heading text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-2">Password reset!</h1>
          <p className="text-sm text-gray-400 leading-relaxed mb-8">Your password has been successfully reset. Click below to log in.</p>

          <a href="/login" className="w-full block py-3 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white text-sm font-bold tracking-wide rounded-xl text-center transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-300">
            Back to login
          </a>
        </div>
      )}

    </div>
  );
}), { ssr: false });

export default function ForgetPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">

      {/* Subtle background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-200/30 blur-3xl rounded-full pointer-events-none" />

      {/* Card */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl shadow-gray-100/60 border border-gray-100 px-8 py-10">
        <ForgetForm />
      </div>

    </div>
  );
}