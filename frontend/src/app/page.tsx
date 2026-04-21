"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setAuth } from "@/store/slices/authSlice";
import { jwtDecode } from "jwt-decode";

export default function AuthPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  const handleSignup = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Signup failed");
      setShowOtp(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "OTP verification failed");
      
      // Verification successful, switch to login
      setShowOtp(false);
      setIsLogin(true);
      setOtp("");
      setError("Email verified! Please log in.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login failed");
      
      const token = data.access_token;
      const decoded: any = jwtDecode(token);
      
      dispatch(setAuth({
        token,
        userId: parseInt(decoded.sub),
        email: decoded.email,
      }));
      
      router.push("/chat");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && !showOtp) {
      await handleSignup();
    } else if (!isLogin && showOtp) {
      await handleVerifyOtp();
    } else {
      await handleLogin();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 relative overflow-hidden text-zinc-50">
      
      {/* Background Orbs for Premium feel */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-[128px] opacity-60 mix-blend-screen pointer-events-none transform -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[128px] opacity-60 mix-blend-screen pointer-events-none transform translate-x-1/3 translate-y-1/3"></div>
      
      <div className="relative z-10 w-full max-w-md p-8 bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-2xl transition-all duration-300">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            {isLogin ? "Welcome back" : "Create an account"}
          </h1>
          <p className="text-sm text-zinc-400">
            {showOtp 
              ? "We've sent a verification code to your email." 
              : "Enter your credentials to continue to Terminal."}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!showOtp ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300 ml-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition text-zinc-100 placeholder-zinc-600"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300 ml-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition text-zinc-100 placeholder-zinc-600"
                />
              </div>
            </>
          ) : (
            <div className="space-y-2 animate-in fade-in zoom-in duration-300">
              <label className="text-sm font-medium text-zinc-300 ml-1">Secure Code</label>
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000 000"
                className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition text-zinc-100 placeholder-zinc-700"
                maxLength={6}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-semibold rounded-xl shadow-lg hover:shadow-primary/25 transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-zinc-900"
          >
            {loading ? "Processing..." : showOtp ? "Verify & Enter" : isLogin ? "Sign In" : "Continue with Email"}
          </button>
        </form>

        {!showOtp && (
          <div className="mt-8 text-center text-sm text-zinc-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:text-primary-hover font-medium transition-colors"
            >
              {isLogin ? "Sign Up" : "Log In"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
