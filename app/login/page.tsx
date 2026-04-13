"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API_URL = "https://wow-lifestyle-backend-1.onrender.com/api";

interface User {
  _id: string;
  fullname: string;
  email: string;
  mobilenumber: string;
  role: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    _id: string;
    fullname: string;
    email: string;
    mobilenumber: string;
    role: string;
    token: string;
  };
}

// 1. Rename your main component to AuthPageContent
function AuthPageContent() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // Form States
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [mobilenumber, setMobilenumber] = useState("");
  const [password, setPassword] = useState("");

  // Check for error in URL params
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'google_auth_failed') {
      setError('Google authentication failed. Please try again.');
    }
  }, [searchParams]);

  // Check if user is already logged in and redirect based on ROLE
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token) {
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.role === 'admin') {
            router.push('/admin/dashboard');
            return;
          }
        } catch (e) {
          console.error("Error parsing user data", e);
        }
      }
      // Fallback for regular users or if user data fails to parse
      router.push('/');
    }
  }, [router]);

  const validateForm = () => {
    if (!email || !password) {
      setError("Email and password are required");
      return false;
    }

    if (!isLogin) {
      if (!fullname || !mobilenumber) {
        setError("All fields are required for registration");
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("Please enter a valid email address");
        return false;
      }

      const mobileRegex = /^[6-9]\d{9}$/;
      if (!mobileRegex.test(mobilenumber.replace(/\D/g, ''))) {
        setError("Please enter a valid 10-digit mobile number");
        return false;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters long");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      let response;
      let data: AuthResponse;

      if (isLogin) {
        // Handle Login
        response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ 
            email: email.trim(), 
            password: password 
          }),
        });

        data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Login failed');
        }

        if (data.success && data.data) {
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('user', JSON.stringify(data.data));

          setSuccessMessage("Logged in successfully!");
          setShowSuccess(true);
          
          // Redirect based on ROLE
          const destination = data.data.role === 'admin' ? '/admin/dashboard' : '/';
          
          setTimeout(() => {
            router.push(destination);
          }, 1500);
        }
      } else {
        // Handle Sign Up
        response = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ 
            fullname: fullname.trim(),
            email: email.trim(),
            mobilenumber: mobilenumber.replace(/\D/g, ''),
            password: password
          }),
        });

        data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Registration failed');
        }

        if (data.success && data.data) {
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('user', JSON.stringify(data.data));

          setSuccessMessage("Account created successfully!");
          setShowSuccess(true);
          
          // Redirect based on ROLE
          const destination = data.data.role === 'admin' ? '/admin/dashboard' : '/';
          
          setTimeout(() => {
            router.push(destination);
          }, 1500);
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);    
    setError("");
    setFullname("");
    setMobilenumber("");
    setPassword("");
  };

  return (
    <>
      {/* Background Glow */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-96 w-96 rounded-full bg-yellow-600/20 blur-[100px]"></div>
      <div className="pointer-events-none absolute top-0 left-0 h-64 w-64 rounded-full bg-orange-500/10 blur-[80px]"></div>

      {/* Error Toast */}
      {error && (
        <div className="absolute top-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-red-500/90 px-6 py-3 text-sm text-white backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccess && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-sm scale-100 rounded-3xl bg-white p-8 text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <svg className="h-10 w-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
            <h3 className="mb-2 text-2xl font-bold text-gray-900">Success!</h3>
            <p className="text-gray-500">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Auth Card */}
      <div className={`relative z-10 w-full max-w-md overflow-hidden rounded-[2.5rem] bg-gray-900/40 p-8 shadow-2xl backdrop-blur-xl ring-1 ring-white/10 sm:p-10 transition-all duration-500 ${showSuccess ? 'scale-95 opacity-50 blur-sm' : 'scale-100 opacity-100'}`}>
        
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-medium tracking-tight text-white/90">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {isLogin 
              ? "Sign in to your account" 
              : "Join us to get started"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name (Sign Up Only) */}
          <div className={`transition-all duration-300 ease-in-out ${!isLogin ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <div className="relative mb-4">
              <input
                type="text"
                required={!isLogin}
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                placeholder="Full Name"
                className="w-full rounded-full border border-white/10 bg-black/20 px-6 py-4 text-sm text-white placeholder-gray-500 transition-colors focus:border-yellow-500/50 focus:bg-black/40 focus:outline-none"
              />
            </div>
          </div>

          {/* Mobile Number (Sign Up Only) */}
          <div className={`transition-all duration-300 ease-in-out ${!isLogin ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <div className="relative mb-4">
              <input
                type="tel"
                required={!isLogin}
                value={mobilenumber}
                onChange={(e) => setMobilenumber(e.target.value)}
                placeholder="Mobile Number"
                maxLength={10}
                className="w-full rounded-full border border-white/10 bg-black/20 px-6 py-4 text-sm text-white placeholder-gray-500 transition-colors focus:border-yellow-500/50 focus:bg-black/40 focus:outline-none"
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full rounded-full border border-white/10 bg-black/20 px-6 py-4 text-sm text-white placeholder-gray-500 transition-colors focus:border-yellow-500/50 focus:bg-black/40 focus:outline-none"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-full border border-white/10 bg-black/20 px-6 py-4 text-sm text-white placeholder-gray-500 transition-colors focus:border-yellow-500/50 focus:bg-black/40 focus:outline-none pr-14"
            />
            
            {/* Yellow Arrow Button */}
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-yellow-400 text-black shadow-lg transition-transform hover:scale-105 hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              )}
            </button>
          </div>
        </form>

        {/* Divider & Socials */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest text-gray-500">
            <span className="bg-transparent px-2 backdrop-blur-xl">Or continue with</span>
          </div>
        </div>

        <div className="space-y-3">
          <button 
            onClick={handleGoogleLogin}
            className="flex w-full items-center justify-between rounded-full border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-white/10"
          >
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>Google</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 text-gray-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        <p className="mt-10 text-center text-sm text-gray-500">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={toggleMode}
            className="font-medium text-yellow-400 hover:text-yellow-300 hover:underline transition-colors"
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </>
  );
}

// 2. Export a new default component that wraps the content in Suspense
export default function AuthPage() {
  return (
    <section className="fixed inset-0 z-[9999] flex h-screen w-full items-center justify-center bg-black px-4 text-white overflow-hidden">
      <Suspense 
        fallback={
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent"></div>
            <p className="text-sm text-gray-400 tracking-widest uppercase">Loading...</p>
          </div>
        }
      >
        <AuthPageContent />
      </Suspense>
    </section>
  );
}