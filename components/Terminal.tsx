
import React, { useState, useRef, useEffect } from 'react';
import { TerminalLine } from '../types';

export const Terminal: React.FC = () => {
  const [lines, setLines] = useState<TerminalLine[]>([
    { text: 'Aether OS v1.0.4 loaded', type: 'output' },
    { text: 'Ready for deployment tasks...', type: 'output' },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newLines: TerminalLine[] = [...lines, { text: `user@aether:~$ ${input}`, type: 'input' }];
    
    // Simple command simulation
    const cmd = input.toLowerCase().trim();
    if (cmd === 'ls') {
      newLines.push({ text: 'src/  package.json  README.md  node_modules/', type: 'output' });
    } else if (cmd === 'npm run build') {
      newLines.push({ text: 'Creating an optimized production build...', type: 'output' });
      newLines.push({ text: 'Compiled successfully in 1.4s', type: 'output' });
    } else if (cmd === 'clear') {
      setLines([]);
      setInput('');
      return;
    } else {
      newLines.push({ text: `Command not found: ${cmd}`, type: 'error' });
    }

    setLines(newLines);
    setInput('');
  };

  return (
    <div className="h-full bg-black/40 p-4 fira-code text-sm flex flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1">
        {lines.map((l, i) => (
          <div key={i} className={`${l.type === 'error' ? 'text-red-400' : l.type === 'input' ? 'text-zinc-400' : 'text-white'}`}>
            {l.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleCommand} className="mt-2 flex">
        <span className="text-zinc-500 mr-2">user@aether:~$</span>
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="bg-transparent flex-1 outline-none text-white border-none p-0 focus:ring-0"
        />
      </form>
    </div>
  );
};
