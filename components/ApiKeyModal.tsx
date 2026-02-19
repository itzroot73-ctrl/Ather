
import React, { useState } from 'react';
import { X, Key, ShieldCheck, AlertCircle } from 'lucide-react';
import { AIProvider } from '../types';

interface ApiKeyModalProps {
  provider: AIProvider;
  onClose: () => void;
  onSave: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ provider, onClose, onSave }) => {
  const [key, setKey] = useState('');

  const handleSave = () => {
    if (key.trim()) {
      onSave(key.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#111] border border-white/10 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Key size={20} className="text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-white">Configure {provider}</h3>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">API Key Required</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl flex gap-3">
            <AlertCircle size={18} className="text-orange-400 shrink-0" />
            <p className="text-xs text-orange-200/80 leading-relaxed">
              To use {provider} models, you need to provide your own API key. This key is stored locally in your browser.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400 ml-1">Your API Key</label>
            <input
              autoFocus
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 text-[10px] text-zinc-500 bg-zinc-900/50 p-2 rounded-lg">
            <ShieldCheck size={12} className="text-green-500" />
            <span>Encrypted and saved locally only.</span>
          </div>
        </div>

        <div className="p-4 bg-white/5 border-t border-white/5 flex gap-2">
          <button 
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-all shadow-lg active:scale-95"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
