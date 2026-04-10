"use client";

import { useEffect, useState } from "react";

export default function LoginPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/animations/login.json")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Animation load error:", err));
  }, []);

  // Inject CSS from JSON
  useEffect(() => {
    if (!data?.css) return;

    const style = document.createElement("style");
    style.innerHTML = data.css;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [data]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">

      {/* LEFT SIDE - FORM  */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-indigo-500 rounded flex items-center justify-center text-white text-xs">
                ✦
              </div>
              <h2 className="font-semibold text-gray-700">SmartEditor AI</h2>
            </div>

            <h1 className="text-3xl font-bold text-gray-800">Welcome</h1>
            <p className="text-gray-500 text-sm mt-1">
              Please enter your details
            </p>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="text-sm text-gray-600">Email address</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Password */}
          <div className="mb-2">
            <label className="text-sm text-gray-600">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Forgot */}
          <div className="text-right mb-5">
            <a href="#" className="text-sm text-indigo-500 hover:underline">
              Forgot password
            </a>
          </div>

          {/* Button */}
          <button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg font-medium transition">
            Sign in
          </button>

          {/* Google */}
          <button className="w-full mt-3 flex items-center justify-center gap-2 border py-2 rounded-lg hover:bg-gray-50 transition">
            <span>🌐</span>
            Sign in with Google
          </button>

          {/* Signup */}
          <p className="text-sm text-center mt-5 text-gray-600">
            Don’t have an account?{" "}
            <a href="/register" className="text-indigo-500 font-medium">
              Sign up
            </a>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - ANIMATION  */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col items-center justify-center text-white p-10">

        {data?.html ? (
          <div
            dangerouslySetInnerHTML={{ __html: data.html }}
          />
        ) : (
          <p>Loading animation...</p>
        )}

      </div>
    </div>
  );
}