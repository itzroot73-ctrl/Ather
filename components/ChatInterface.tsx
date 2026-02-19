
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Zap, Command, X, CheckCircle2, Loader2, Clock, ChevronRight, FileCode, Layers, Terminal as TerminalIcon, UserPlus, Square } from 'lucide-react';
import { ChatMessage, AIProvider } from '../types';
import { gemini, AIResponse } from '../services/geminiService';
import { PROVIDERS } from '../constants';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  provider: AIProvider;
  onProviderChange: (p: AIProvider) => void;
  onAgentAction: (response: AIResponse, updatedMessages: ChatMessage[]) => void;
  initialPrompt?: string;
  selectedModel: string;
  setSelectedModel: (m: string) => void;
  onInvite?: (username: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages,
  setMessages,
  provider, 
  onProviderChange, 
  onAgentAction, 
  initialPrompt,
  selectedModel,
  setSelectedModel,
  onInvite
}) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');
  const [thinkingTime, setThinkingTime] = useState(0);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const cancelRef = useRef<boolean>(false);

  const currentProviderData = PROVIDERS.find(p => p.id === provider) || PROVIDERS[0];

  useEffect(() => {
    // Only send if there are no messages yet
    if (initialPrompt && messages.length === 0) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (isTyping) {
      setThinkingTime(0);
      timerRef.current = window.setInterval(() => {
        setThinkingTime(prev => prev + 0.1);
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTyping]);

  const handleStop = () => {
    cancelRef.current = true;
    setIsTyping(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleSend = async (msg: string = input) => {
    if (!msg.trim() || isTyping) return;

    cancelRef.current = false;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: msg,
      timestamp: new Date(),
    };

    const updatedWithUser = [...messages, userMsg];
    setMessages(updatedWithUser);
    setInput('');
    setIsTyping(true);

    try {
      const response = await gemini.chatAndBuild(msg, messages, selectedModel);
      
      if (cancelRef.current) return;

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: response.explanation,
        timestamp: new Date(),
        status: 'completed',
        filesGenerated: response.files.map(f => f.path),
        plan: response.tasks.map(t => t.title)
      };

      const finalMessages = [...updatedWithUser, assistantMsg];
      setMessages(finalMessages);
      onAgentAction(response, finalMessages);
    } catch (err) {
      console.error(err);
      if (!cancelRef.current) {
        const errorMsg: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          text: "The engine encountered a sync error. Connection timed out.",
          timestamp: new Date()
        };
        const finalMessagesWithErr = [...updatedWithUser, errorMsg];
        setMessages(finalMessagesWithErr);
      }
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden relative bg-[#0D0D0D]">
      <div className="px-6 py-3 border-b border-white/5 flex items-center justify-between bg-[#0A0A0A]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
           <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Aether Core</span>
           <button 
             onClick={() => setShowInviteModal(true)}
             className="ml-2 flex items-center gap-2 px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all"
           >
             <UserPlus size={12} /> Invite
           </button>
        </div>
        <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest flex items-center gap-2">
           <Clock size={12} /> {thinkingTime.toFixed(1)}s
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-10 pb-44 custom-scrollbar">
        {messages.length === 0 && !isTyping && (
          <div className="h-full flex flex-col items-center justify-center opacity-40">
             <TerminalIcon size={24} className="text-zinc-600 mb-4" />
             <p className="text-[11px] font-bold uppercase tracking-[3px] text-zinc-600">Awaiting Commands</p>
          </div>
        )}
        
        {messages.map((m) => (
          <div key={m.id} className="flex flex-col gap-4 group animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className={`flex items-start gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 border ${m.role === 'user' ? 'bg-zinc-100 text-black border-white shadow-lg' : 'bg-[#111] text-blue-400 border-white/10 shadow-inner'}`}>
                {m.role === 'user' ? <Command size={16} /> : <Zap size={16} />}
              </div>
              <div className={`max-w-[85%] rounded-3xl px-6 py-4 text-[13px] leading-relaxed ${m.role === 'user' ? 'bg-[#1A1A1A] text-white border border-white/10' : 'text-zinc-300'}`}>
                {m.text}
                {m.role === 'assistant' && m.plan && m.plan.length > 0 && (
                  <div className="mt-6 space-y-2">
                    {m.plan.map((p, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2 bg-white/5 border border-white/5 rounded-xl text-[11px] text-zinc-400"><CheckCircle2 size={12} className="text-green-500/50" /> {p}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="w-9 h-9 rounded-2xl bg-[#111] border border-white/10 flex items-center justify-center"><Loader2 size={16} className="text-blue-500 animate-spin" /></div>
            <div className="bg-[#111]/50 px-6 py-5 rounded-3xl w-full max-w-[80%] border border-white/5 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles size={16} className="text-blue-400 animate-pulse" />
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-[3px]">Generating Architecture...</span>
              </div>
              <div className="absolute bottom-0 left-0 h-0.5 bg-blue-500/30 animate-[shimmer_2s_infinite]" style={{ width: '100%' }} />
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-8 left-0 right-0 px-6 z-20">
        <div className="max-w-xl mx-auto">
          <div className="bg-[#141414]/90 backdrop-blur-3xl border border-white/10 rounded-3xl p-3 flex flex-col gap-3 shadow-2xl">
            <textarea 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} 
              placeholder="Design something extraordinary..." 
              rows={1} 
              className="w-full bg-transparent border-none focus:ring-0 text-[14px] py-4 px-4 resize-none max-h-40 font-medium placeholder:text-zinc-800" 
            />
            <div className="flex items-center justify-between px-2 pb-1">
              <button onClick={() => setShowModelPicker(!showModelPicker)} className="group flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/5 text-zinc-500 hover:text-white transition-all">
                {currentProviderData.icon} <span className="text-[10px] font-black uppercase tracking-[2px]">{currentProviderData.models.find(m => m.id === selectedModel)?.name}</span>
              </button>
              
              {isTyping ? (
                <button 
                  onClick={handleStop} 
                  className="bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white p-3 rounded-2xl transition-all flex items-center gap-2 px-6"
                >
                  <Square size={14} fill="currentColor" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Stop</span>
                </button>
              ) : (
                <button 
                  onClick={() => handleSend()} 
                  disabled={!input.trim() || isTyping} 
                  className="bg-white text-black p-3 rounded-2xl hover:bg-zinc-200 disabled:opacity-20 disabled:cursor-not-allowed shadow-xl transition-all"
                >
                  <Send size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModelPicker && (
        <div className="absolute bottom-32 left-10 w-72 bg-[#111] border border-white/10 rounded-3xl shadow-2xl p-2 z-[100] animate-in fade-in zoom-in-95">
           <div className="px-4 py-3 border-b border-white/5 mb-2"><span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Available Engines</span></div>
           <div className="max-h-64 overflow-y-auto custom-scrollbar">
             {PROVIDERS.map(p => (
               <div key={p.id} className="mb-2">
                 <div className="px-4 py-2 text-[9px] font-black text-zinc-700 uppercase tracking-widest">{p.name}</div>
                 {p.models.map(m => (
                   <button key={m.id} onClick={() => { onProviderChange(p.id); setSelectedModel(m.id); setShowModelPicker(false); }} className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[12px] transition-all ${selectedModel === m.id ? 'bg-white/10 text-white shadow-inner border border-white/5' : 'text-zinc-600 hover:text-white hover:bg-white/5'}`}>
                     {m.name} {selectedModel === m.id && <CheckCircle2 size={12} className="text-blue-500" />}
                   </button>
                 ))}
               </div>
             ))}
           </div>
        </div>
      )}

      {showInviteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
           <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-sm rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95">
              <div className="text-center mb-8">
                <UserPlus size={32} className="text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-black">Invite Friend</h3>
                <p className="text-xs text-zinc-600 mt-2 font-medium">Collaborate on this project in real-time.</p>
              </div>
              <input 
                type="text" 
                value={inviteUsername}
                onChange={(e) => setInviteUsername(e.target.value)}
                placeholder="Enter handle (e.g. @devninja)"
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm mb-6 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
              />
              <div className="flex gap-4">
                 <button onClick={() => setShowInviteModal(false)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all">Cancel</button>
                 <button 
                  onClick={() => { if (onInvite && inviteUsername) { onInvite(inviteUsername); setShowInviteModal(false); setInviteUsername(''); } }} 
                  className="flex-1 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all"
                 >
                   Send Request
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
