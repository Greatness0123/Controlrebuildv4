import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Key, Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

const EntryPage: React.FC = () => {
  const [view, setView] = useState<'welcome' | 'login' | 'pin'>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (window.electronAPI) {
        const res = await window.electronAPI.ipcInvoke('login-with-email', email, password);
        if (res.success) {
          setView('pin');
        } else {
          setError(res.message || 'Login failed');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        if (window.electronAPI) {
            const res = await window.electronAPI.ipcInvoke('verify-pin', pin);
            if (res.valid) {
                // Done
            } else {
                setError('Invalid PIN');
            }
        }
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-[#0d0d0d] p-6">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {view === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="text-center space-y-8"
            >
              <div className="flex justify-center">
                <div className="w-24 h-24 bg-black dark:bg-white rounded-3xl flex items-center justify-center shadow-2xl">
                  <Shield size={48} className="text-white dark:text-black" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-black tracking-tighter">CONTROL</h1>
                <p className="text-gray-500 font-medium">Your universal desktop automation agent</p>
              </div>
              <button
                onClick={() => setView('login')}
                className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity group"
              >
                Get Started <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {view === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight">Welcome Back</h2>
                <p className="text-gray-500 text-sm">Log in to your Control account</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-border rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium outline-none focus:ring-1 ring-black/5"
                      placeholder="name@company.com"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Password</label>
                  <div className="relative">
                    <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-border rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium outline-none focus:ring-1 ring-black/5"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                {error && <p className="text-xs text-red-500 font-bold ml-1">{error}</p>}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-lg"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Sign In'}
                </button>
              </form>
              <button
                onClick={() => setView('welcome')}
                className="w-full text-xs font-bold text-gray-400 hover:text-black dark:hover:text-white transition-colors"
              >
                Back to start
              </button>
            </motion.div>
          )}

          {view === 'pin' && (
            <motion.div
              key="pin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-8"
            >
              <div className="space-y-2">
                <CheckCircle2 size={48} className="mx-auto text-green-500 mb-4" />
                <h2 className="text-3xl font-black tracking-tight">Security Check</h2>
                <p className="text-gray-500 text-sm">Enter your 4-digit security PIN</p>
              </div>
              <form onSubmit={handlePinSubmit} className="space-y-6">
                <input
                  type="password"
                  maxLength={4}
                  autoFocus
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-border rounded-2xl py-6 text-center text-3xl font-black tracking-[1em] outline-none focus:ring-1 ring-black/5"
                  placeholder="••••"
                />
                <button
                  type="submit"
                  disabled={isLoading || pin.length !== 4}
                  className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-lg"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Unlock Access'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EntryPage;
