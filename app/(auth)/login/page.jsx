"use client";
import { useRouter } from "next/navigation"; 
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from 'next/link';
import { CameraIcon, MailIcon, LockIcon, GoogleIcon } from "../login/icon";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { loginUser, resetAuthState  } from "@/redux/slices/authSlice";

const ClientAnimation = dynamic(
  () => Promise.resolve(({ html }) => <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: html }} />),
  { ssr: false }
);

const LoginForm = dynamic(() => Promise.resolve(function Form() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const dispatch = useDispatch();
  const {loading, error, loginSuccess} = useSelector((state) => state.auth)
  const isSubmitting = loading;

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (loading) return;

    toast.dismiss();   
    toast.loading("Signing in...");

    dispatch(loginUser(formData));
  };

  useEffect(() => {
    if(loginSuccess) {
      toast.dismiss();
      toast.success("Login successful 🎉");

      setFormData({
        email: "",
        password: "",
      });

      dispatch(resetAuthState());

      setTimeout(() => {
        router.push("/dashboard")
      }, 1200);
    }

    if (error){
      toast.dismiss();
      toast.error(error?.message || error || "Login failed");
    }
  }, [loginSuccess, error, router, dispatch]);

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm">

      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 shrink-0">
          <CameraIcon />
        </div>
        <span className="text-sm font-semibold text-gray-800 tracking-tight">SmartEditor AI</span>
      </div>

      {/* Heading — largest, heaviest */}
      <h1 className="login-heading text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-2">Welcome back</h1>

      {/* Subheading — small, light */}
      <p className="text-sm font-normal text-gray-400 leading-relaxed mb-9">Sign in to continue to your account</p>

      {/* Email */}
      <div className="mb-5">
        <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wide">Email address</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 flex items-center"><MailIcon /></span>
          <input 
          type="email" 
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com" className="w-full pl-9 pr-4 py-3 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-500 transition placeholder:text-gray-400" />
        </div>
      </div>

      {/* Password */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-600 mb-1.5 tracking-wide">Password</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 flex items-center"><LockIcon /></span>
          <input 
          type={showPassword ? "text" : "password"} 
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password" className="w-full pl-9 pr-10 py-3 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-500 transition placeholder:text-gray-400" />
          <button type="button" onClick={() => setShowPassword((p) => !p)} className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-600 transition">
            {showPassword ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Forgot */}
      <div className="mb-6">
        <Link href="/forget-password" className="text-xs font-medium text-violet-600 hover:text-violet-700 hover:underline transition-colors">
          Forgot password?
        </Link>
      </div>

      <button 
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 text-white text-sm font-bold tracking-wide rounded-xl transition
            ${isSubmitting
              ? "bg-violet-400 cursor-not-allowed"
              : "bg-violet-600 hover:bg-violet-700 active:bg-violet-800 cursor-pointer"
            }
          `}
        >
          {loading ? "Signing in..." : "Sign in"}
      </button>
      
      {/* Google */}
      <button
      className="cursor-pointer w-full py-3 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium border border-gray-200 rounded-xl flex items-center justify-center gap-2.5 transition">
        <GoogleIcon />
        Continue with Google
      </button>

      {/* Register */}
      <p className="text-xs text-gray-500 text-center mt-7">
        {"Don't have an account?"}{" "}
        <a href="/register" className="text-violet-600 font-semibold hover:underline">Sign up</a>
      </p>

    </form>
  );
}), { ssr: false });

export default function LoginPage() {
  const [data, setData] = useState(null);
  const styleInjected = useRef(false);

  useEffect(() => {
    fetch("/animations/login.json")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Animation load error:", err));
  }, []);

  useEffect(() => {
    if (!data?.css || styleInjected.current) return;
    styleInjected.current = true;
    const style = document.createElement("style");
    style.id = "login-anim-style";
    style.innerHTML = data.css + `.scene2 { background: transparent !important; border-radius: 0 !important; box-shadow: none !important; width: 100% !important; height: 100% !important; min-height: 100% !important; padding: 0 !important; }`;
    document.head.appendChild(style);
  }, [data]);

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL ── */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12 bg-white">
        <LoginForm />
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="hidden md:flex md:w-1/2 bg-violet-600 relative overflow-hidden items-center justify-center">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 rounded-full bg-violet-400/20 blur-3xl pointer-events-none" />
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

    </div>
  );
}