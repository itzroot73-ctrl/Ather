
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { Terminal } from './components/Terminal';
import { LandingPage } from './components/LandingPage';
import { TemplatesPage } from './components/TemplatesPage';
import { AuthPage } from './components/AuthPage';
import { INITIAL_FILES, PROVIDERS } from './constants';
import { AIProvider, FileItem, ProjectTask, Project, UserProfile, ChatMessage } from './types';
import { AIResponse } from './services/geminiService';
import { db } from './services/databaseService';
import { Monitor, Rocket, Home, FileCode, FolderOpen, Folder, Menu, Loader2, Code2, Database } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'editor' | 'auth' | 'templates'>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [provider, setProvider] = useState<AIProvider>(AIProvider.GEMINI);
  const [model, setModel] = useState<string>(PROVIDERS[0].models[0].id);
  const [activeTab, setActiveTab] = useState('chat');
  const [viewMode, setViewMode] = useState<'chat' | 'preview' | 'code'>('chat');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [initialPrompt, setInitialPrompt] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const session = await db.getSession();
      if (session) {
        try {
          const profile = await db.syncProfileFromSession(session);
          handleAuthSuccess(profile);
        } catch (err) {
          console.error("Auth sync error:", err);
        }
      } else {
        const savedUser = localStorage.getItem('aether_user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
          refreshProjects(parsedUser.email);
        }
      }
      setIsInitializing(false);
    };
    initAuth();

    const { data: authListener } = db.onAuthChange(async (session) => {
      if (session) {
        const profile = await db.syncProfileFromSession(session);
        handleAuthSuccess(profile);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const refreshProjects = async (email: string = user?.email || '') => {
    if (!email) return;
    const userProjects = await db.getUserProjects(email);
    setProjects(userProjects);
  };

  const handleAuthSuccess = (u: UserProfile) => {
    setUser(u);
    setIsAuthenticated(true);
    localStorage.setItem('aether_user', JSON.stringify(u));
    refreshProjects(u.email);
    setView(prev => prev === 'auth' ? 'landing' : prev);
  };

  const handleLogout = async () => {
    await db.signOut();
    setIsAuthenticated(false);
    setUser(null);
    setProjects([]);
    setView('landing');
  };

  const handleAgentAction = async (response: AIResponse, updatedMessages: ChatMessage[]) => {
    if (response.tasks) {
      setTasks(prev => [...prev, ...response.tasks.map(t => ({ ...t, status: 'completed' as const }))]);
    }
    
    let updatedFiles = [...files];
    if (response.files && response.files.length > 0) {
      response.files.forEach(af => {
        const parts = af.path.split('/');
        let currentLevel = updatedFiles;
        parts.forEach((part, index) => {
          const isFile = index === parts.length - 1;
          let existing = currentLevel.find(item => item.name === part);
          if (isFile) {
            if (existing) {
              existing.content = af.content;
            } else {
              const newFile: FileItem = { name: part, type: 'file', content: af.content };
              currentLevel.push(newFile);
              if (!selectedFile) setSelectedFile(newFile);
            }
          } else {
            if (!existing) {
              existing = { name: part, type: 'folder', children: [], isOpen: true };
              currentLevel.push(existing);
            }
            currentLevel = existing.children!;
          }
        });
      });
      setFiles(updatedFiles);
    }

    if (currentProject && user) {
      const updatedProject = { 
        ...currentProject, 
        files: updatedFiles, 
        messages: updatedMessages,
        lastUpdated: Date.now() 
      };
      setCurrentProject(updatedProject);
      await db.saveProject(updatedProject);
      refreshProjects(user.email);
    }
  };

  const handleStartProject = async (prompt: string, prov: AIProvider, modelId: string) => {
    if (!isAuthenticated || !user) { setView('auth'); return; }
    
    const newProject: Project = {
      id: Math.random().toString(36).substring(7),
      ownerId: user.email,
      name: prompt.split(' ').slice(0, 3).join(' ') + '...',
      description: prompt,
      lastUpdated: Date.now(),
      files: [],
      messages: []
    };
    
    setProvider(prov);
    setModel(modelId);
    setCurrentProject(newProject);
    setInitialPrompt(prompt);
    setChatMessages([]);
    setFiles([]);
    setSelectedFile(null);
    setTasks([]);
    setView('editor');
    setViewMode('chat');
    
    await db.saveProject(newProject);
    refreshProjects(user.email);
  };

  const handleOpenProject = (project: Project) => {
    if (!isAuthenticated) { setView('auth'); return; }
    setCurrentProject(project);
    setFiles(project.files || []);
    setChatMessages(project.messages || []);
    setSelectedFile(project.files && project.files.length > 0 ? (project.files[0].children?.[0] || project.files[0]) : null);
    setInitialPrompt('');
    setView('editor');
    setViewMode('chat');
  };

  const renderFileTree = (items: FileItem[], depth = 0) => {
    if (items.length === 0) return null;
    return items.map(item => (
      <div key={item.name} className="flex flex-col">
        {item.type === 'folder' ? (
          <>
            <div 
              className="flex items-center gap-2 px-4 py-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-white/[0.02] mb-1 cursor-pointer"
              style={{ paddingLeft: `${depth * 16 + 16}px` }}
            >
              <Folder size={12} className="text-zinc-600" /> {item.name}
            </div>
            {item.children && renderFileTree(item.children, depth + 1)}
          </>
        ) : (
          <button 
            onClick={() => setSelectedFile(item)} 
            className={`w-full flex items-center gap-3 px-4 py-2 text-[13px] rounded-xl transition-all mb-1 ${
              selectedFile?.name === item.name && selectedFile?.content === item.content
                ? 'bg-white/10 text-white border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]' 
                : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
            }`}
            style={{ paddingLeft: `${depth * 16 + 16}px` }}
          >
            <FileCode size={14} className={selectedFile?.name === item.name ? 'text-blue-400' : 'text-zinc-700'} /> 
            <span className="truncate">{item.name}</span>
          </button>
        )}
      </div>
    ));
  };

  if (isInitializing) {
    return (
      <div className="h-screen w-full bg-[#020202] flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 bg-white text-black flex items-center justify-center rounded-2xl font-black text-3xl shadow-2xl animate-pulse">A</div>
        <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-black uppercase tracking-[5px]">
          <Loader2 size={16} className="animate-spin text-blue-500" /> Connecting to Nexus
        </div>
      </div>
    );
  }

  if (view === 'auth') return <AuthPage onAuthSuccess={handleAuthSuccess} onCancel={() => setView('landing')} />;
  if (view === 'templates') return <TemplatesPage onBack={() => setView('landing')} onUseTemplate={(p) => handleStartProject(p, provider, model)} />;
  if (view === 'landing') return (
    <LandingPage 
      onStartProject={handleStartProject} 
      onOpenProject={handleOpenProject} 
      recentProjects={projects} 
      selectedProvider={provider} 
      setSelectedProvider={setProvider} 
      selectedModel={model} 
      setSelectedModel={setModel} 
      isAuthenticated={isAuthenticated} 
      user={user} 
      onLoginClick={() => setView('auth')} 
      onLogoutClick={handleLogout} 
      onSeeMoreTemplates={() => setView('templates')}
      onRefreshProjects={refreshProjects}
    />
  );

  return (
    <div className="flex h-screen w-full bg-[#050505] text-zinc-100 selection:bg-blue-500/30 overflow-hidden relative font-sans">
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-50 h-full transition-transform duration-300 shadow-2xl lg:shadow-none`}>
        <Sidebar currentProvider={provider} onProviderChange={setProvider} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0A0A0A]">
          <div className="flex items-center gap-6">
            <button onClick={() => setView('landing')} className="p-2 text-zinc-500 hover:text-white transition-all"><Home size={20} /></button>
            <div className="h-4 w-px bg-white/10" />
            <span className="text-white font-black text-xs uppercase tracking-[3px] truncate max-w-md">{currentProject?.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-[#111] p-1 rounded-xl border border-white/5">
              <button onClick={() => setViewMode('preview')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'preview' ? 'bg-white text-black' : 'text-zinc-600'}`}>Preview</button>
              <button onClick={() => setViewMode('code')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'code' ? 'bg-white text-black' : 'text-zinc-600'}`}>Files</button>
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-[2px] shadow-xl"><Rocket size={16} /> Deploy</button>
          </div>
        </header>
        <div className="flex-1 flex overflow-hidden">
          <div className="w-[450px] h-full border-r border-white/5 flex flex-col bg-[#080808]">
            <ChatInterface 
              messages={chatMessages}
              setMessages={setChatMessages}
              provider={provider} 
              onProviderChange={setProvider} 
              onAgentAction={handleAgentAction} 
              initialPrompt={initialPrompt} 
              selectedModel={model} 
              setSelectedModel={setModel} 
            />
          </div>
          <div className="flex-1 flex flex-col bg-[#020202] relative h-full overflow-hidden">
            {viewMode === 'preview' ? (
              <div className="flex-1 flex flex-col relative p-10 overflow-hidden">
                <div className="flex-1 flex flex-col items-center justify-center space-y-10 bg-[#080808] border border-white/5 rounded-[40px] shadow-inner text-center relative">
                  <Monitor size={64} className="text-zinc-800" />
                  <h3 className="text-zinc-500 font-black uppercase tracking-[8px]">Virtual Preview Active</h3>
                </div>
                <div className="absolute bottom-10 left-10 right-10 h-64 rounded-[32px] border border-white/10 overflow-hidden bg-[#080808]/95 backdrop-blur-3xl"><Terminal /></div>
              </div>
            ) : (
              <div className="flex-1 flex overflow-hidden">
                <div className="w-72 border-r border-white/5 bg-[#0A0A0A] p-6 space-y-4 overflow-y-auto custom-scrollbar shrink-0">
                  <div className="px-4 py-2 bg-white/5 rounded-lg text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-3"><FolderOpen size={14} /> Source</div>
                  {files.length > 0 ? (
                    renderFileTree(files)
                  ) : (
                    <div className="py-20 text-center flex flex-col items-center gap-4 px-4">
                      <Database size={24} className="text-zinc-800" />
                      <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest leading-relaxed">No files linked to this Nexus Node yet.</p>
                    </div>
                  )}
                </div>
                <div className="flex-1 bg-[#020202] overflow-hidden flex flex-col">
                  {selectedFile ? (
                    <>
                      <div className="h-14 border-b border-white/5 flex items-center px-10 bg-[#080808]">
                        <span className="text-[12px] text-zinc-400 font-black uppercase tracking-[4px] truncate">{selectedFile.name}</span>
                      </div>
                      <pre className="flex-1 p-10 fira-code text-[14px] leading-relaxed text-zinc-400 overflow-auto custom-scrollbar"><code>{selectedFile.content}</code></pre>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center gap-8 opacity-20">
                      <Code2 size={80} />
                      <p className="text-[14px] font-black uppercase tracking-[10px]">Awaiting Core Generation</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
