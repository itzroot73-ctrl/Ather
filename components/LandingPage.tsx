
import React, { useState } from 'react';
import { 
  Send, Sparkles, Clock, ChevronRight, Plus, FolderOpen, Code2, Rocket, 
  Layout, Github, MessageSquare, Zap, ChevronDown, Cpu, Globe, Settings, 
  Terminal as TerminalIcon, LogIn, User, Shield, Zap as ZapIcon, 
  Box, Menu, X, ArrowRight, Bell, MoreVertical, Edit2, Trash2, UserPlus
} from 'lucide-react';
import { Project, AIProvider, UserProfile } from '../types';
import { PROVIDERS, TEMPLATES } from '../constants';
import { db } from '../services/databaseService';

interface LandingPageProps {
  onStartProject: (prompt: string, provider: AIProvider, modelId: string) => void;
  onOpenProject: (project: Project) => void;
  recentProjects: Project[];
  selectedProvider: AIProvider;
  setSelectedProvider: (p: AIProvider) => void;
  selectedModel: string;
  setSelectedModel: (m: string) => void;
  isAuthenticated: boolean;
  user: UserProfile | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onSeeMoreTemplates: () => void;
  onRefreshProjects: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onStartProject, 
  onOpenProject, 
  recentProjects,
  selectedProvider,
  setSelectedProvider,
  selectedModel,
  setSelectedModel,
  isAuthenticated,
  user,
  onLoginClick,
  onLogoutClick,
  onSeeMoreTemplates,
  onRefreshProjects
}) => {
  const [prompt, setPrompt] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [showProviderMenu, setShowProviderMenu] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [importMode, setImportMode] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  // Action Modals State
  const [renamingProject, setRenamingProject] = useState<Project | null>(null);
  const [invitingProject, setInvitingProject] = useState<Project | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [inviteHandle, setInviteHandle] = useState('');

  const currentProviderData = PROVIDERS.find(p => p.id === selectedProvider) || PROVIDERS[0];
  const currentModelName = currentProviderData.models.find(m => m.id === selectedModel)?.name || 'Select Model';
  const homeTemplates = TEMPLATES.slice(0, 3);

  const handleStart = (p: string = prompt) => {
    if (p.trim()) onStartProject(p, selectedProvider, selectedModel);
  };

  const handleImport = () => {
    if (sourceUrl.trim()) {
      onStartProject(`Analyze source: ${sourceUrl}. Reconstruct as a high-performance app.`, selectedProvider, selectedModel);
    }
  };

  const handleRename = async () => {
    if (renamingProject && newName.trim()) {
      try {
        await db.renameProject(renamingProject.id, newName.trim());
        onRefreshProjects();
        setRenamingProject(null);
        setNewName('');
      } catch (err) {
        console.error("Rename failed:", err);
      }
    }
  };

  const handleDelete = async () => {
    if (deletingProjectId) {
      try {
        await db.deleteProject(deletingProjectId);
        onRefreshProjects();
        setDeletingProjectId(null);
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#020202] flex flex-col text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[180px] rounded-full animate-pulse" />
        <div className="absolute bottom-[5%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/5 blur-[150px] rounded-full animate-pulse delay-1000" />
      </div>

      {/* Navigation */}
      <nav className="h-20 border-b border-white/5 flex items-center justify-between px-6 lg:px-12 bg-[#020202]/80 backdrop-blur-3xl fixed top-0 w-full z-50">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 bg-white text-black flex items-center justify-center rounded-xl font-black text-xl shadow-2xl transition-transform group-hover:-rotate-6">A</div>
          <span className="font-black text-sm uppercase tracking-[5px] hidden sm:block">Aether Code AI</span>
        </div>
        
        <div className="hidden lg:flex items-center gap-10">
           <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-[10px] font-black uppercase tracking-[4px] text-zinc-500 hover:text-white transition-all">Home Engine</button>
           <button onClick={onSeeMoreTemplates} className="text-[10px] font-black uppercase tracking-[4px] text-zinc-500 hover:text-white transition-all">Blueprint Hub</button>
           <button onClick={() => scrollToSection('projects')} className="text-[10px] font-black uppercase tracking-[4px] text-zinc-500 hover:text-white transition-all">Archive</button>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)} className={`flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all ${showUserMenu ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'}`}>
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400"><User size={12} /></div>
                <span className="text-[10px] font-black uppercase tracking-widest">@{user?.username}</span>
                <ChevronDown size={14} className={`text-zinc-600 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>
              {showUserMenu && (
                <div className="absolute top-full right-0 mt-3 w-56 bg-[#0A0A0A]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl p-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-300">
                   <div className="px-4 py-3 border-b border-white/5 mb-1">
                      <p className="text-[11px] text-zinc-300 truncate font-medium">{user?.email}</p>
                   </div>
                   <button onClick={onLogoutClick} className="w-full text-left px-4 py-2.5 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 rounded-xl transition-all">Kill Session</button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={onLoginClick} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-[2px] hover:bg-zinc-200 transition-all shadow-xl active:scale-95">Link Core Account</button>
          )}
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-zinc-400 hover:text-white lg:hidden transition-colors"><Menu size={24} /></button>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center pt-40 lg:pt-56 pb-20 px-6 max-w-7xl mx-auto w-full relative z-10">
        <div className="text-center space-y-10 mb-20">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-zinc-300 uppercase tracking-[4px] shadow-2xl">
            <Sparkles size={12} className="text-blue-400 animate-pulse" />
            Universal Multi-Engine Engineering
          </div>
          <h1 className="text-5xl sm:text-7xl lg:text-9xl font-black tracking-tighter leading-[0.85] text-balance">
            Zero Code. <br /><span className="bg-gradient-to-r from-white via-blue-400 to-indigo-600 bg-clip-text text-transparent">Infinite builds.</span>
          </h1>
          <p className="text-zinc-500 text-sm lg:text-xl max-w-2xl mx-auto leading-relaxed font-medium">Planetary-scale autonomous builds powered by Gemini 3, Groq, and NVIDIA.</p>
        </div>

        {/* Console Interface */}
        <div className="w-full max-w-5xl relative group mb-32">
          <div className="relative bg-[#080808]/95 border border-white/10 rounded-[40px] p-2 shadow-2xl backdrop-blur-3xl overflow-hidden ring-1 ring-white/5">
            <div className="flex items-center justify-between px-8 py-5 border-b border-white/5">
               <div className="flex items-center gap-8">
                  <button onClick={() => setImportMode(false)} className={`text-[10px] font-black uppercase tracking-[3px] transition-all pb-2 border-b-2 ${!importMode ? 'text-white border-blue-500 shadow-[0_4px_10px_rgba(59,130,246,0.3)]' : 'text-zinc-600 border-transparent hover:text-white'}`}>Build Engine</button>
                  <button onClick={() => setImportMode(true)} className={`text-[10px] font-black uppercase tracking-[3px] transition-all pb-2 border-b-2 ${importMode ? 'text-white border-blue-500 shadow-[0_4px_10px_rgba(59,130,246,0.3)]' : 'text-zinc-600 border-transparent hover:text-white'}`}>Source Import</button>
               </div>
            </div>

            <div className="p-4">
              {!importMode ? (
                <textarea
                  autoFocus
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Design a real-time analytics dashboard with dynamic state management..."
                  className="w-full bg-transparent border-none focus:ring-0 text-xl lg:text-2xl py-10 px-10 resize-none min-h-[250px] placeholder:text-zinc-900 leading-relaxed font-medium fira-code custom-scrollbar"
                />
              ) : (
                <div className="py-16 px-10 space-y-10 min-h-[250px]">
                   <div className="space-y-4">
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[4px] ml-1">Connect Source Repository</p>
                      <div className="relative group">
                         <Github className="absolute left-8 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-white transition-colors" size={24} />
                         <input 
                           type="text" 
                           value={sourceUrl}
                           onChange={(e) => setSourceUrl(e.target.value)}
                           placeholder="https://github.com/aether-core/nexus-v2" 
                           className="w-full bg-white/[0.03] border border-white/10 rounded-[30px] py-8 pl-20 pr-10 text-xl text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-zinc-900"
                         />
                      </div>
                   </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap items-center justify-between gap-6 px-10 pb-8 pt-4 border-t border-white/5">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <button onClick={() => { setShowProviderMenu(!showProviderMenu); setShowModelMenu(false); }} className={`flex items-center gap-3 px-5 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${showProviderMenu ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 border-white/5 text-zinc-500 hover:text-white hover:bg-white/10'}`}>
                    {currentProviderData.icon} {currentProviderData.name.split(' ')[0]} <ChevronDown size={14} className={`text-zinc-700 transition-transform ${showProviderMenu ? 'rotate-180' : ''}`} />
                  </button>
                  {showProviderMenu && (
                    <div className="absolute bottom-full left-0 mb-4 w-64 bg-[#111]/95 backdrop-blur-3xl border border-white/10 rounded-3xl p-2 z-[100] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                      {PROVIDERS.map(p => (
                        <button key={p.id} onClick={() => { setSelectedProvider(p.id); setSelectedModel(p.models[0].id); setShowProviderMenu(false); }} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedProvider === p.id ? 'bg-white/10 text-white' : 'text-zinc-600 hover:text-white hover:bg-white/5'}`}>
                          {p.icon} {p.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button onClick={() => { setShowModelMenu(!showModelMenu); setShowProviderMenu(false); }} className={`flex items-center gap-3 px-5 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${showModelMenu ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 border-white/5 text-zinc-500 hover:text-white hover:bg-white/10'}`}>
                    <Cpu size={14} /> {currentModelName} <ChevronDown size={14} className={`text-zinc-700 transition-transform ${showModelMenu ? 'rotate-180' : ''}`} />
                  </button>
                  {showModelMenu && (
                    <div className="absolute bottom-full left-0 mb-4 w-72 bg-[#111]/95 backdrop-blur-3xl border border-white/10 rounded-3xl p-2 z-[100] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                      {currentProviderData.models.map(m => (
                        <button key={m.id} onClick={() => { setSelectedModel(m.id); setShowModelMenu(false); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedModel === m.id ? 'bg-white/10 text-white' : 'text-zinc-600 hover:text-white hover:bg-white/5'}`}>
                          {m.name} {selectedModel === m.id && <ZapIcon size={12} className="text-blue-500" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={() => importMode ? handleImport() : handleStart()} 
                className="bg-white text-black px-12 py-5 rounded-[26px] text-[11px] font-black uppercase tracking-[4px] hover:bg-zinc-200 transition-all flex items-center gap-4 shadow-2xl active:scale-95 group shadow-white/5"
              >
                {importMode ? 'Synchronize' : 'Initiate Build'} 
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Project Archive */}
        <section id="projects" className="w-full max-w-6xl scroll-mt-40 mb-20">
          <div className="flex items-center justify-between mb-16 border-b border-white/5 pb-10">
            <h2 className="text-[12px] font-black text-zinc-600 uppercase tracking-[12px] flex items-center gap-6"><TerminalIcon size={24} className="text-blue-500" /> Storage Archive</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {recentProjects.length > 0 ? (
              recentProjects.map(project => (
                <div key={project.id} className="group bg-[#080808] border border-white/10 rounded-[50px] p-12 hover:border-blue-500/30 transition-all cursor-pointer flex flex-col h-full shadow-2xl relative ring-1 ring-white/5 overflow-visible">
                  {/* Action Menu Button */}
                  <div className="absolute top-8 right-8 z-20">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === project.id ? null : project.id); }}
                      className="p-2 text-zinc-600 hover:text-white hover:bg-white/5 rounded-full transition-all"
                    >
                      <MoreVertical size={20} />
                    </button>
                    {openMenuId === project.id && (
                      <div className="absolute top-full right-0 mt-2 w-48 bg-[#111] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                        <button onClick={(e) => { e.stopPropagation(); setRenamingProject(project); setNewName(project.name); setOpenMenuId(null); }} className="w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all flex items-center gap-3">
                          <Edit2 size={14} /> Rename
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setInvitingProject(project); setOpenMenuId(null); }} className="w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all flex items-center gap-3">
                          <UserPlus size={14} /> Invite
                        </button>
                        <div className="h-px bg-white/5 my-1" />
                        <button onClick={(e) => { e.stopPropagation(); setDeletingProjectId(project.id); setOpenMenuId(null); }} className="w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 rounded-xl transition-all flex items-center gap-3">
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </div>

                  <div onClick={() => onOpenProject(project)} className="flex-1 flex flex-col">
                    <h3 className="font-black text-xl mb-4 uppercase tracking-[2px] truncate group-hover:text-blue-400 transition-colors pr-8">{project.name}</h3>
                    <p className="text-sm text-zinc-600 line-clamp-2 font-medium flex-1 mb-10 leading-relaxed">{project.description}</p>
                    <div className="text-[10px] text-zinc-800 font-black uppercase tracking-[4px] pt-10 border-t border-white/5 flex justify-between items-center">
                      <span className="flex items-center gap-2"><Clock size={14} /> {new Date(project.lastUpdated).toLocaleDateString()}</span>
                      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-32 border-2 border-dashed border-white/10 rounded-[60px] flex flex-col items-center justify-center text-zinc-800 space-y-8 bg-white/[0.01]">
                <Box size={40} className="opacity-20" />
                <p className="text-[14px] font-black uppercase tracking-[10px] opacity-40">No records found</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Action Modals */}
      {renamingProject && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-sm rounded-[32px] p-8 shadow-2xl">
            <h3 className="text-xl font-black mb-6 uppercase tracking-widest">Rename Project</h3>
            <input 
              type="text" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm mb-6 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
            <div className="flex gap-4">
              <button onClick={() => setRenamingProject(null)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white">Cancel</button>
              <button onClick={handleRename} className="flex-1 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest">Update</button>
            </div>
          </div>
        </div>
      )}

      {invitingProject && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-sm rounded-[32px] p-8 shadow-2xl">
            <h3 className="text-xl font-black mb-6 uppercase tracking-widest">Invite to {invitingProject.name}</h3>
            <input 
              type="text" 
              value={inviteHandle}
              onChange={(e) => setInviteHandle(e.target.value)}
              placeholder="Friend's handle (@username)"
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm mb-6 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
            <div className="flex gap-4">
              <button onClick={() => setInvitingProject(null)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white">Cancel</button>
              <button onClick={() => setInvitingProject(null)} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">Send Invite</button>
            </div>
          </div>
        </div>
      )}

      {deletingProjectId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-sm rounded-[32px] p-8 shadow-2xl">
            <div className="text-center mb-8">
              <Trash2 size={40} className="text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-black uppercase tracking-widest text-white">Wipe Archive?</h3>
              <p className="text-xs text-zinc-600 mt-2">This action is irreversible. All data nodes will be purged.</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setDeletingProjectId(null)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white">Abort</button>
              <button onClick={handleDelete} className="flex-1 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">Execute Purge</button>
            </div>
          </div>
        </div>
      )}

      <footer className="py-20 px-12 border-t border-white/5 text-[10px] font-black text-zinc-800 uppercase tracking-[10px] text-center">© 2024 Aether Code AI Engineering.</footer>
    </div>
  );
};
