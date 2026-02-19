
import React from 'react';
import { Cpu, Globe, Zap, Settings, Layout } from 'lucide-react';
import { AIProvider, FileItem, ProviderInfo } from './types';

export const PROVIDERS: ProviderInfo[] = [
  { 
    id: AIProvider.GEMINI, 
    name: 'Google Gemini', 
    icon: <Zap className="w-4 h-4 text-blue-400" />,
    models: [
      { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash' },
      { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro' },
      { id: 'gemini-flash-lite-latest', name: 'Gemini Flash Lite' }
    ]
  },
  { 
    id: AIProvider.OPENAI, 
    name: 'OpenAI', 
    icon: <Globe className="w-4 h-4 text-green-400" />,
    models: [
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'o1-preview', name: 'OpenAI o1' }
    ]
  },
  { 
    id: AIProvider.GROQ, 
    name: 'Groq', 
    icon: <Cpu className="w-4 h-4 text-orange-400" />,
    models: [
      { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' }
    ]
  },
  { 
    id: AIProvider.NVIDIA, 
    name: 'NVIDIA', 
    icon: <Settings className="w-4 h-4 text-emerald-400" />,
    models: [
      { id: 'llama-3.1-405b-instruct', name: 'Llama 3.1 405B' },
      { id: 'nemotron-70b-instruct', name: 'Nemotron 70B' }
    ]
  },
  { 
    id: AIProvider.OPENROUTER, 
    name: 'OpenRouter', 
    icon: <Layout className="w-4 h-4 text-purple-400" />,
    models: [
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
      { id: 'meta-llama/llama-3.1-405b', name: 'Llama 3.1 (Router)' }
    ]
  },
];

export const TEMPLATES = [
  {
    title: "Quantum SaaS Dashboard",
    desc: "A high-performance analytics platform with real-time charts, user management, and edge-native data processing.",
    prompt: "Build a high-performance SaaS dashboard using Next.js 14, Tailwind, and Recharts. Include KPI cards for Revenue, Users, and Conversion. Add a sidebar with navigation and a user profile dropdown. Ensure it's fully responsive and uses a dark-themed aesthetic.",
    image: "https://images.unsplash.com/photo-1551288049-bbda38a5f01e?auto=format&fit=crop&q=80&w=800",
    tags: ["SaaS", "Analytics", "Charts"],
    author: "Aether Team"
  },
  {
    title: "Global Commerce Pro",
    desc: "Ultra-fast storefront optimized for Cloudflare Images and D1 database. Full cart logic and checkout flow.",
    prompt: "Create a modern e-commerce storefront. Features: product grid with category filters, a slide-out shopping cart, product detail pages, and a checkout summary. Style it like a premium tech brand with clean typography and subtle hover animations.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
    tags: ["E-com", "Edge", "D1"],
    author: "Community"
  },
  {
    title: "Neural Image Forge",
    desc: "AI-driven image generation workspace with gallery, history, and prompt optimization tools.",
    prompt: "Develop an AI Image Generator UI. UI elements: large prompt input area with 'Magic' enhance button, a results gallery with masonry layout, and a history sidebar. Integrate themed presets like 'Cyberpunk', 'Realistic', and 'Anime'.",
    image: "https://images.unsplash.com/photo-1675271591211-126ad94e495d?auto=format&fit=crop&q=80&w=800",
    tags: ["AI", "Generative", "Workspace"],
    author: "Aether Team"
  }
];

// Changed to empty array to ensure new projects start with zero files until AI generates them.
export const INITIAL_FILES: FileItem[] = [];
