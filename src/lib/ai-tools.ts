import type { ComponentType } from 'react';
import { RiOpenaiFill } from 'react-icons/ri';
import {
  SiClaude,
  SiDeepseek,
  SiGooglegemini,
  SiNodedotjs,
  SiOllama,
  SiPython,
  SiTelegram,
} from 'react-icons/si';
import HermesIcon from '@/components/HermesIcon';

export type AiTool = { label: string; Icon: ComponentType<{ size?: number | string; className?: string }>; color: string };

// Модели и инструменты, с которыми я работаю: плитки в Skills и карусель в hero.
export const AI_TOOLS: AiTool[] = [
  { label: 'Claude', Icon: SiClaude, color: '#d97757' },
  { label: 'Claude Code', Icon: SiClaude, color: '#e8a17f' },
  { label: 'Codex', Icon: RiOpenaiFill, color: '#e8e8e8' },
  { label: 'GPT', Icon: RiOpenaiFill, color: '#10a37f' },
  { label: 'Hermes Agent', Icon: HermesIcon, color: '#c9b8ff' },
  { label: 'Gemini', Icon: SiGooglegemini, color: '#8e75ff' },
  { label: 'DeepSeek', Icon: SiDeepseek, color: '#4d6bfe' },
  { label: 'Ollama', Icon: SiOllama, color: '#ffffff' },
  { label: 'Telegram', Icon: SiTelegram, color: '#29a9eb' },
  { label: 'Python', Icon: SiPython, color: '#ffd43b' },
  { label: 'Node.js', Icon: SiNodedotjs, color: '#5fa04e' },
];
