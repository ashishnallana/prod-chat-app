"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { login, signup, verifyOtp, clearError } from "../store/slices/authSlice";

export default function AuthPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { token, loading, error, email: unverifiedEmail } = useAppSelector((state) => state.auth);

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);

  // If we already have a JWT safely generated, jump to chat.
  useEffect(() => {
    if (token) {
      router.push("/chat");
    }
  }, [token, router]);

  // Clear errors dynamically when switching tabs
  useEffect(() => {
    dispatch(clearError());
    setShowOtp(false);
  }, [isLogin, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (showOtp) {
      const resultAction = await dispatch(verifyOtp({ email: unverifiedEmail || email, otp }));
      if (verifyOtp.fulfilled.match(resultAction)) {
        // Once OTP verified, instantly trigger a login token request to dive into chat
        dispatch(login({ email: unverifiedEmail || email, password }));
      }
      return;
    }

    if (isLogin) {
      dispatch(login({ email, password }));
    } else {
      const resultAction = await dispatch(signup({ email, password }));
      if (signup.fulfilled.match(resultAction)) {
        setShowOtp(true);
      }
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
            <div className="mb-4 text-xs bg-red-950/40 text-red-400 border border-red-900 rounded p-2 text-center animate-pulse">
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
            className="w-full py-3 mt-4 flex items-center justify-center bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-semibold rounded-xl shadow-lg transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-zinc-900"
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
