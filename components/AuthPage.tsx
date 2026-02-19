
import React, { useState } from 'react';
import { Mail, Lock, Github, ArrowRight, ChevronLeft, User, Loader2, Chrome, AlertCircle, ShieldAlert } from 'lucide-react';
import { db } from '../services/databaseService';
import { UserProfile } from '../types';

interface AuthPageProps {
  onAuthSuccess: (user: UserProfile) => void;
  onCancel: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess, onCancel }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic Client-side validation
    if (!email.trim() || !password.trim()) {
      setError('Please provide all necessary access coordinates.');
      return;
    }

    if (mode === 'register' && !username.trim()) {
      setError('A handle (username) is required for Nexus registration.');
      return;
    }

    setIsProcessing(true);

    try {
      if (mode === 'register') {
        const user = await db.signUpWithPassword(email, password, username);
        onAuthSuccess(user);
      } else {
        const user = await db.signInWithPassword(email, password);
        onAuthSuccess(user);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected failure occurred in the auth node.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setError('');
    setIsProcessing(true);
    try {
      await db.signInWithProvider(provider);
    } catch (err: any) {
      setError(`Social Link Failure: ${err.message}`);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
      
      <div className="w-full max-w-lg relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <button 
          onClick={onCancel} 
          disabled={isProcessing}
          className="mb-8 flex items-center gap-2 text-zinc-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-[3px] disabled:opacity-30"
        >
          <ChevronLeft size={16} /> Exit Link
        </button>

        <div className="bg-[#080808] border border-white/10 rounded-[40px] p-10 shadow-2xl backdrop-blur-3xl relative overflow-hidden">
          {isProcessing && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-20 flex items-center justify-center">
               <div className="flex flex-col items-center gap-4">
                  <Loader2 size={40} className="animate-spin text-blue-500" />
                  <span className="text-[10px] font-black uppercase tracking-[5px] text-zinc-400">Verifying Identity...</span>
               </div>
            </div>
          )}

          <div className="text-center mb-10">
            <div className="w-14 h-14 bg-white text-black flex items-center justify-center rounded-[20px] font-black text-2xl mx-auto mb-6 shadow-2xl">A</div>
            <h1 className="text-3xl font-black tracking-tighter text-white mb-2">
              {mode === 'login' ? 'Secure Login' : 'New Identity'}
            </h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[4px]">Aether Multi-Engine Auth</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Universal Handle</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-blue-500" size={18} />
                  <input 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    placeholder="e.g. neuro_dev" 
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-zinc-900" 
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">System Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-blue-500" size={18} />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="name@nexus.ai" 
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-zinc-900" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Access Cipher</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-blue-500" size={18} />
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-zinc-900" 
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 animate-shake">
                <ShieldAlert className="text-red-500 shrink-0 mt-0.5" size={16} />
                <div className="text-red-400 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                  {error}
                </div>
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={isProcessing}
              className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-[3px] text-xs flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all active:scale-95 shadow-xl disabled:opacity-50"
            >
              {mode === 'login' ? 'Sync Profile' : 'Link Profile'} 
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-8 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-white/5"></div>
              <span className="text-[9px] font-black text-zinc-800 uppercase tracking-[4px]">Unified Providers</span>
              <div className="h-px flex-1 bg-white/5"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleSocialLogin('google')}
                disabled={isProcessing}
                className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 py-3.5 rounded-2xl hover:bg-white/10 transition-all active:scale-95 group"
              >
                <Chrome size={18} className="text-zinc-600 group-hover:text-blue-400 transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-white">Google</span>
              </button>
              <button 
                onClick={() => handleSocialLogin('github')}
                disabled={isProcessing}
                className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 py-3.5 rounded-2xl hover:bg-white/10 transition-all active:scale-95 group"
              >
                <Github size={18} className="text-zinc-600 transition-colors group-hover:text-white" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-white">GitHub</span>
              </button>
            </div>
          </div>
          
          <div className="mt-10 text-center">
            <button 
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} 
              disabled={isProcessing}
              className="text-[10px] font-black uppercase tracking-[2px] text-zinc-600 hover:text-white transition-colors disabled:opacity-30"
            >
              {mode === 'login' ? "New operative? Create Profile" : "Existing operative? Sync instead"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
