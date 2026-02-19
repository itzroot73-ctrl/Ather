
import React from 'react';

export enum AIProvider {
  GEMINI = 'Gemini',
  OPENAI = 'OpenAI',
  GROQ = 'Groq',
  NVIDIA = 'NVIDIA',
  OPENROUTER = 'OpenRouter'
}

export interface Model {
  id: string;
  name: string;
}

export interface ProviderInfo {
  id: AIProvider;
  name: string;
  icon: React.ReactNode;
  models: Model[];
}

export interface FileItem {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  isOpen?: boolean;
  children?: FileItem[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  status?: 'thinking' | 'writing' | 'completed';
  filesGenerated?: string[];
  plan?: string[];
}

export interface ProjectTask {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface TerminalLine {
  text: string;
  type: 'input' | 'output' | 'error';
}

export interface Project {
  id: string;
  ownerId: string; // Link to user email/id
  name: string;
  description: string;
  lastUpdated: number;
  files: FileItem[];
  messages: ChatMessage[];
  collaborators?: string[];
}

export interface UserProfile {
  email: string;
  username: string;
  avatar?: string;
  createdAt: number;
}

export interface AppNotification {
  id: string;
  type: 'invite' | 'system';
  from: string;
  projectId?: string;
  projectName?: string;
  read: boolean;
  timestamp: number;
}
