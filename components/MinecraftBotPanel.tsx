
import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Play,
  Square,
  Trash2,
  Plus,
  Settings,
  MessageSquare,
  Server,
  Activity,
  User,
  Terminal as TerminalIcon,
  X,
  Send,
  Loader2,
  Cpu,
  Monitor,
  RefreshCw,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
interface BotConfig {
  id: string;
  name: string;
  ip: string;
  status: 'offline' | 'connecting' | 'online';
  adMessage: string;
  adInterval: number;
}

interface ChatLog {
  botId: string;
  username: string;
  message: string;
  timestamp: number;
}

// --- Components ---

const GlassCard = ({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <div
    onClick={onClick}
    className={`glass rounded-3xl p-6 relative overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.03)] group ${className}`}
  >
    <div className="absolute inset-0 bg-white/[0.01] pointer-events-none group-hover:bg-white/[0.03] transition-colors" />
    {children}
  </div>
);

const MinecraftBotPanel: React.FC = () => {
  const [bots, setBots] = useState<BotConfig[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [logs, setLogs] = useState<ChatLog[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeBotId, setActiveBotId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Form State
  const [newBotName, setNewBotName] = useState('Bot_' + Math.floor(Math.random()*1000));
  const [newBotIp, setNewBotIp] = useState('');
  const [newBotAd, setNewBotAd] = useState('Join my server! IP: myserver.com');
  const [newBotInterval, setNewBotInterval] = useState(60000);

  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('connect', () => setIsConnected(true));
    newSocket.on('disconnect', () => setIsConnected(false));
    newSocket.on('bot-list', (botList: BotConfig[]) => setBots(botList));
    newSocket.on('bot-created', (bot: BotConfig) => setBots(prev => [...prev, bot]));
    newSocket.on('bot-status', ({ id, status }: { id: string, status: BotConfig['status'] }) => {
      setBots(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    });
    newSocket.on('bot-chat', (log: ChatLog) => {
      setLogs(prev => [...prev.slice(-99), { ...log, timestamp: Date.now() }]);
    });
    newSocket.on('bot-removed', (id: string) => {
      setBots(prev => prev.filter(b => b.id !== id));
      if (activeBotId === id) setActiveBotId(null);
    });

    newSocket.emit('get-bots');

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleCreateBot = () => {
    if (!newBotIp) return;
    socket?.emit('create-bot', {
      name: newBotName,
      ip: newBotIp,
      adMessage: newBotAd,
      adInterval: newBotInterval
    });
    setShowAddModal(false);
    setNewBotIp('');
    setNewBotName('Bot_' + Math.floor(Math.random()*1000));
  };

  const toggleBot = (bot: BotConfig) => {
    if (bot.status === 'offline') {
      socket?.emit('start-bot', bot.id);
    } else {
      socket?.emit('stop-bot', bot.id);
    }
  };

  const removeBot = (id: string) => {
    socket?.emit('remove-bot', id);
  };

  const activeBot = bots.find(b => b.id === activeBotId);
  const filteredLogs = logs.filter(l => l.botId === activeBotId);

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-100 p-8 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Background Glow */}
      <div className="fixed -top-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none animate-pulse" />
      <div className="fixed -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-purple-500/5 blur-[150px] rounded-full pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Header */}
      <header className="max-w-7xl mx-auto flex items-center justify-between mb-12 relative z-10">
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="w-14 h-14 bg-white text-black flex items-center justify-center rounded-2xl font-black text-3xl shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            B
          </motion.div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-[6px] bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
              Nexus Bot
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[2px] opacity-60">
                {isConnected ? 'Controller Core Active' : 'Connecting to Core...'}
              </p>
            </div>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-black text-xs font-black uppercase tracking-[3px] shadow-[0_10px_30px_rgba(255,255,255,0.1)] transition-all"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" /> New Instance
        </motion.button>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
        {/* Sidebar / Bot List */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[4px] flex items-center gap-2">
              <Activity size={14} className="text-blue-500" /> Instances ({bots.length})
            </h2>
            <RefreshCw size={12} className="text-zinc-700 hover:text-white cursor-pointer transition-colors" />
          </div>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            {bots.length === 0 && (
              <GlassCard className="py-20 text-center border-dashed border-white/10">
                <Cpu size={40} className="mx-auto mb-4 text-zinc-800" />
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[4px]">No bots initialized</p>
              </GlassCard>
            )}
            <AnimatePresence>
              {bots.map(bot => (
                <motion.div
                  key={bot.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                >
                  <GlassCard
                    onClick={() => setActiveBotId(bot.id)}
                    className={`border-l-4 group cursor-pointer ${
                      bot.status === 'online' ? 'border-l-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.05)]' :
                      bot.status === 'connecting' ? 'border-l-blue-500 animate-pulse' : 'border-l-transparent'
                    } ${activeBotId === bot.id ? 'bg-white/[0.08] ring-1 ring-white/10' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                          bot.status === 'online' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500'
                        }`}>
                          <User size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm tracking-wide truncate w-32">{bot.name}</h3>
                          <p className="text-[10px] text-zinc-500 font-medium tracking-wider truncate w-32 mt-0.5">{bot.ip}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleBot(bot); }}
                          className={`p-2.5 rounded-xl transition-all ${
                            bot.status === 'online' ? 'text-red-400 hover:bg-red-400/10' : 'text-emerald-400 hover:bg-emerald-400/10'
                          }`}
                        >
                          {bot.status === 'connecting' ? <Loader2 className="animate-spin" size={18} /> :
                           bot.status === 'online' ? <Square size={18} /> : <Play size={18} />}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeBot(bot.id); }}
                          className="p-2.5 text-zinc-600 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Main View / Bot Details & Console */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {activeBotId ? (
              <motion.div
                key={activeBotId}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-8"
              >
                {/* Bot Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GlassCard className="!p-8 md:col-span-2">
                    <div className="flex flex-wrap items-center justify-between gap-8">
                      <div className="flex items-center gap-8">
                        <div className="relative">
                          <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-[2.5rem] flex items-center justify-center border border-white/10 shadow-inner">
                            <Monitor size={40} className="text-blue-400" />
                          </div>
                          {activeBot?.status === 'online' && (
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-[#020202] flex items-center justify-center">
                              <Zap size={14} className="text-white fill-current" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-4">
                            <h2 className="text-3xl font-black uppercase tracking-[3px]">{activeBot?.name}</h2>
                            <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[2px] ${
                              activeBot?.status === 'online' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              'bg-zinc-800 text-zinc-500 border border-white/5'
                            }`}>
                              {activeBot?.status}
                            </div>
                          </div>
                          <div className="flex items-center gap-6 mt-3">
                            <p className="text-zinc-500 text-[11px] font-black uppercase tracking-[2px] flex items-center gap-2">
                              <Server size={14} className="text-zinc-700" /> {activeBot?.ip}
                            </p>
                            <p className="text-zinc-500 text-[11px] font-black uppercase tracking-[2px] flex items-center gap-2">
                              <ShieldCheck size={14} className="text-zinc-700" /> Ver: 1.21.1
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-10">
                        <div className="text-right">
                          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[3px] mb-2">Cycle Rate</p>
                          <p className="text-xl font-black">{(activeBot?.adInterval || 0) / 1000}<span className="text-xs text-zinc-600 ml-1">SEC</span></p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[3px] mb-2">Transmissions</p>
                          <p className="text-xl font-black">{filteredLogs.length}</p>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </div>

                {/* Console */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-4">
                    <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[5px] flex items-center gap-2">
                      <TerminalIcon size={14} className="text-purple-500" /> Neural Link Stream
                    </h2>
                    <div className="flex gap-4">
                      <button className="text-[9px] font-black text-zinc-600 uppercase tracking-widest hover:text-white transition-colors">Export Logs</button>
                      <button
                        onClick={() => setLogs(prev => prev.filter(l => l.botId !== activeBotId))}
                        className="text-[9px] font-black text-zinc-600 uppercase tracking-widest hover:text-red-400 transition-colors"
                      >
                        Purge
                      </button>
                    </div>
                  </div>
                  <div className="glass rounded-[3rem] h-[450px] flex flex-col overflow-hidden border border-white/5 shadow-2xl relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-blue-500/[0.02] pointer-events-none" />
                    <div className="flex-1 overflow-y-auto p-10 fira-code text-[13px] leading-relaxed scroll-smooth custom-scrollbar relative z-10">
                      {filteredLogs.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-800 space-y-6 opacity-40">
                          <div className="w-20 h-20 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center">
                            <MessageSquare size={32} />
                          </div>
                          <p className="uppercase tracking-[6px] text-[10px] font-black">Awaiting data packets...</p>
                        </div>
                      )}
                      {filteredLogs.map((log, i) => (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={i}
                          className="mb-3 group flex items-start gap-4"
                        >
                          <span className="text-zinc-700 text-[11px] font-medium shrink-0 pt-0.5">{new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}</span>
                          <div>
                            <span className="text-blue-500/80 font-black mr-3 text-[11px] uppercase tracking-wider">{log.username}</span>
                            <span className="text-zinc-400 group-hover:text-zinc-200 transition-colors">{log.message}</span>
                          </div>
                        </motion.div>
                      ))}
                      <div ref={logsEndRef} />
                    </div>
                    <div className="p-6 bg-white/[0.02] border-t border-white/5 flex gap-4 relative z-10">
                      <div className="relative flex-1 group">
                        <input
                          type="text"
                          placeholder="Broadcast manual message..."
                          className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-[13px] focus:outline-none focus:border-blue-500/30 transition-all placeholder:text-zinc-700"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-zinc-700 group-focus-within:text-blue-500/50 transition-colors">
                          <span className="text-[10px] font-black">CMD</span>
                          <div className="w-1 h-4 bg-current rounded-full" />
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-4 bg-white text-black rounded-2xl shadow-xl hover:bg-zinc-200 transition-colors"
                      >
                        <Send size={20} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-[700px] flex flex-col items-center justify-center space-y-10">
                <div className="relative">
                   <div className="absolute inset-0 bg-blue-500/20 blur-[60px] rounded-full" />
                   <Cpu size={100} className="text-zinc-800 relative z-10 animate-pulse" />
                </div>
                <div className="text-center relative z-10">
                  <h2 className="text-2xl font-black uppercase tracking-[12px] mb-4 text-zinc-500">Neural Gateway Idle</h2>
                  <p className="text-[10px] uppercase tracking-[6px] font-bold text-zinc-700 max-w-sm mx-auto leading-relaxed">
                    Select a core instance from the sidebar to establish a high-bandwidth uplink
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Add Bot Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-2xl glass rounded-[4rem] p-12 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10"
            >
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full" />

              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-10 right-10 text-zinc-600 hover:text-white transition-all hover:rotate-90"
              >
                <X size={32} />
              </button>

              <div className="mb-12 relative z-10">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-[3px] mb-6">
                  <Zap size={12} className="fill-current" /> System Initialization
                </div>
                <h2 className="text-4xl font-black uppercase tracking-[4px] mb-3">Deploy Core</h2>
                <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-[3px] opacity-60">Establish new instance connection protocol</p>
              </div>

              <div className="space-y-8 relative z-10">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[4px] px-1">Node Identifier</label>
                    <input
                      value={newBotName}
                      onChange={(e) => setNewBotName(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-[1.5rem] px-6 py-5 text-sm focus:outline-none focus:border-blue-500/40 focus:bg-white/[0.05] transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[4px] px-1">Target Address</label>
                    <input
                      value={newBotIp}
                      onChange={(e) => setNewBotIp(e.target.value)}
                      placeholder="IP / Domain"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-[1.5rem] px-6 py-5 text-sm focus:outline-none focus:border-blue-500/40 focus:bg-white/[0.05] transition-all placeholder:text-zinc-800"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[4px] px-1">Broadcast Payload</label>
                  <textarea
                    value={newBotAd}
                    onChange={(e) => setNewBotAd(e.target.value)}
                    rows={4}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-[1.5rem] px-6 py-5 text-sm focus:outline-none focus:border-blue-500/40 focus:bg-white/[0.05] transition-all resize-none"
                  />
                </div>

                <div className="flex items-center gap-10">
                   <div className="flex-1 space-y-3">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[4px] px-1">Transmission Cycle (ms)</label>
                    <input
                      type="number"
                      value={newBotInterval}
                      onChange={(e) => setNewBotInterval(parseInt(e.target.value))}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-[1.5rem] px-6 py-5 text-sm focus:outline-none focus:border-blue-500/40 focus:bg-white/[0.05] transition-all"
                    />
                  </div>
                  <div className="pt-8">
                     <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest text-right">Estimated load:<br/><span className="text-white">Minimal</span></p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateBot}
                  className="w-full py-6 bg-white text-black rounded-[2rem] font-black uppercase tracking-[6px] text-sm shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:shadow-[0_20px_60px_rgba(255,255,255,0.2)] transition-all mt-6"
                >
                  Confirm Deployment
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}} />
    </div>
  );
};

export default MinecraftBotPanel;
