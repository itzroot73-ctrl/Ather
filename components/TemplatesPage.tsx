
import React, { useState } from 'react';
import { Search, ChevronLeft, ArrowRight, Eye, User, Sparkles, X } from 'lucide-react';
import { TEMPLATES } from '../constants';

interface TemplatesPageProps {
  onBack: () => void;
  onUseTemplate: (prompt: string) => void;
}

export const TemplatesPage: React.FC<TemplatesPageProps> = ({ onBack, onUseTemplate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState('All');

  const allTags = ['All', ...Array.from(new Set(TEMPLATES.flatMap(t => t.tags)))];

  const filtered = TEMPLATES.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         t.desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = activeTag === 'All' || t.tags.includes(activeTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col font-sans">
      <nav className="h-20 border-b border-white/5 flex items-center justify-between px-12 bg-[#020202]/80 backdrop-blur-3xl sticky top-0 z-50">
        <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-[3px]">
          <ChevronLeft size={16} /> Exit Gallery
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white text-black flex items-center justify-center rounded-lg font-black text-lg">b</div>
          <span className="font-black text-[10px] uppercase tracking-[5px]">Blueprint Hub</span>
        </div>
        <div className="w-24" />
      </nav>

      <main className="max-w-7xl mx-auto w-full px-6 py-20">
        <div className="text-center mb-20 space-y-6">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/5 border border-blue-500/10 text-[9px] font-black text-blue-500 uppercase tracking-[4px]">
             <Sparkles size={12} /> Community Marketplace
           </div>
           <h1 className="text-6xl font-black tracking-tighter">Planetary Blueprints.</h1>
           <p className="text-zinc-500 text-lg max-w-xl mx-auto font-medium">Explore engineered solutions for every edge-native challenge.</p>
        </div>

        <div className="mb-16 space-y-8">
          <div className="max-w-2xl mx-auto relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors" size={20} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, stack, or architecture..."
              className="w-full bg-white/5 border border-white/10 rounded-[28px] py-6 pl-16 pr-8 text-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-zinc-800"
            />
            {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white"><X size={18} /></button>}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {allTags.map(tag => (
              <button 
                key={tag} 
                onClick={() => setActiveTag(tag)}
                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTag === tag ? 'bg-white text-black' : 'bg-white/5 text-zinc-500 border border-white/5 hover:border-white/20'}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filtered.map((t, i) => (
            <div key={i} className="group flex flex-col bg-[#080808] border border-white/5 rounded-[40px] overflow-hidden hover:border-blue-500/30 transition-all shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="h-64 relative overflow-hidden bg-zinc-900">
                 <img src={t.image} alt={t.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onError={(e) => { (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800`; }} />
                 <div className="absolute top-6 left-6 flex gap-2">
                    {t.tags.map(tag => <span key={tag} className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/10">{tag}</span>)}
                 </div>
              </div>
              <div className="p-10 flex flex-col flex-1">
                 <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-black tracking-tight group-hover:text-blue-400 transition-colors leading-tight">{t.title}</h3>
                    <div className="flex items-center gap-2 text-zinc-600 shrink-0"><Eye size={16} /> <span className="text-xs font-bold">1.2k</span></div>
                 </div>
                 <p className="text-zinc-500 text-base font-medium mb-12 line-clamp-3 leading-relaxed">{t.desc}</p>
                 <div className="mt-auto pt-10 border-t border-white/5 flex items-center justify-between">
                    <div className="flex flex-col">
                       <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Architect</span>
                       <span className="text-[11px] font-bold text-zinc-400">@{t.author}</span>
                    </div>
                    <button onClick={() => onUseTemplate(t.prompt)} className="px-8 py-3 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-zinc-200 active:scale-95 transition-all flex items-center gap-3 shadow-2xl shadow-white/5">Use Template <ArrowRight size={16} /></button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
