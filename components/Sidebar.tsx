
import React from 'react';
import { AIProvider } from '../types';
import { MessageCircle, Box, ShieldCheck, Settings } from 'lucide-react';

interface SidebarProps {
  currentProvider: AIProvider;
  onProviderChange: (p: AIProvider) => void;
  activeTab: string;
  onTabChange: (t: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="w-20 border-r border-white/5 bg-[#050505] flex flex-col items-center py-8 gap-10 shrink-0 z-30">
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 bg-white text-black flex items-center justify-center rounded-[18px] font-black text-2xl shadow-[0_10px_30px_rgba(255,255,255,0.2)] cursor-pointer hover:scale-110 hover:-rotate-6 transition-all active:scale-95 group relative">
          A
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-black" />
        </div>
      </div>

      <nav className="flex flex-col gap-6">
        {[
          { id: 'chat', icon: <MessageCircle size={22} />, tooltip: 'Agent Console' },
          { id: 'files', icon: <Box size={22} />, tooltip: 'Project Core' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all relative group ${
              activeTab === item.id ? 'bg-white/10 text-white shadow-lg ring-1 ring-white/10' : 'text-zinc-600 hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            {item.icon}
            <div className="absolute left-full ml-4 px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-[2px] text-white opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all shadow-2xl scale-95 group-hover:scale-100 origin-left">
              {item.tooltip}
            </div>
            {activeTab === item.id && <div className="absolute left-0 top-3 bottom-3 w-1 bg-white rounded-r-full shadow-[0_0_10px_white]" />}
          </button>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-6">
        <button className="w-14 h-14 flex items-center justify-center rounded-2xl text-zinc-700 hover:text-blue-400 hover:bg-blue-400/5 transition-all">
          <ShieldCheck size={22} />
        </button>
        <button className="w-14 h-14 flex items-center justify-center rounded-2xl text-zinc-700 hover:text-zinc-200 hover:bg-white/5 transition-all">
          <Settings size={22} />
        </button>
      </div>
    </div>
  );
};
