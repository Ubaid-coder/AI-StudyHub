'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Loader2 
} from 'lucide-react';
import { loginUser, registerUser } from '@/services/auth.service';

export default function AuthPage() {
  const router = useRouter();
  
  // Tab state: true for Login, false for Register
  const [isLogin, setIsLogin] = useState(true);
  
  // Form input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);

  // Switch between Login and Register tabs
  const toggleAuthMode = (loginMode: boolean) => {
    setIsLogin(loginMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // Handle Login
        await loginUser({ email, password });
        toast.success('Welcome back! Logging you in...');
        router.push('/'); // Redirect on success
      } else {
        // Handle Registration
        await registerUser({ name, email, password });
        toast.success('Account created successfully! Please sign in.');
        
        // Switch to login tab and clear fields
        setIsLogin(true);
        setPassword('');
      }
    } catch (error: any) {
      const serverMessage = 
        error.response?.data?.message || 'Something went wrong. Please try again.';
      toast.error(serverMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1F242E] flex items-center justify-center p-4 font-sans text-[#F3F4F6]">
      <div className="w-full max-w-md bg-[#181C24] rounded-2xl border border-gray-800 p-8 shadow-2xl">
        
        {/* Header / Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-[#3B82F6]/10 rounded-xl border border-[#3B82F6]/20 mb-3">
            <Sparkles className="w-8 h-8 text-[#60A5FA]" />
          </div>
          <h1 className="text-2xl font-bold tracking-wide text-white">AI-StudyHub</h1>
          <p className="text-xs text-gray-400 mt-1">
            {isLogin ? 'Welcome back! Sign in to continue.' : 'Create an account to get started.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#1F242E] p-1 rounded-xl mb-6 border border-gray-800">
          <button
            type="button"
            onClick={() => toggleAuthMode(true)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              isLogin 
                ? 'bg-[#3B82F6] text-white shadow' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => toggleAuthMode(false)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              !isLogin 
                ? 'bg-[#3B82F6] text-white shadow' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name Field (Register Mode Only) */}
          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Full Name
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-gray-500 absolute left-3.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-[#1F242E] text-sm text-white placeholder-gray-500 rounded-xl pl-10 pr-4 py-3 border border-gray-700/60 focus:outline-none focus:border-[#3B82F6] transition"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className="w-full bg-[#1F242E] text-sm text-white placeholder-gray-500 rounded-xl pl-10 pr-4 py-3 border border-gray-700/60 focus:outline-none focus:border-[#3B82F6] transition"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#1F242E] text-sm text-white placeholder-gray-500 rounded-xl pl-10 pr-4 py-3 border border-gray-700/60 focus:outline-none focus:border-[#3B82F6] transition"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 bg-[#3B82F6] hover:bg-blue-600 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
              </>
            ) : (
              <>
                <span>{isLogin ? 'Sign In' : 'Register'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Switch Prompt */}
        <div className="mt-6 text-center text-xs text-gray-400">
          {isLogin ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => toggleAuthMode(false)}
                className="text-[#60A5FA] hover:underline font-medium"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => toggleAuthMode(true)}
                className="text-[#60A5FA] hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}