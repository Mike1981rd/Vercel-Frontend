'use client';

import React, { useState, useEffect } from 'react';
import { Palette, ChevronDown } from 'lucide-react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { cn } from '@/lib/utils';

export type ChatTheme = {
  id: string;
  name: string;
  description: string;
  colors: {
    background: string;
    chatBackground: string;
    messageIncoming: string;
    messageOutgoing: string;
    messageText: string;
    messageOutgoingText: string;
    headerBg: string;
    headerText: string;
    inputBg: string;
    inputText: string;
    border: string;
    hover: string;
    scrollbar: string;
  };
};

export const chatThemes: ChatTheme[] = [
  {
    id: 'default',
    name: 'WhatsApp Classic',
    description: 'Traditional WhatsApp colors',
    colors: {
      background: 'bg-gray-100',
      chatBackground: 'bg-[#e5ddd5]',
      messageIncoming: 'bg-white',
      messageOutgoing: 'bg-[#dcf8c6]',
      messageText: 'text-gray-900',
      messageOutgoingText: 'text-gray-900',
      headerBg: 'bg-[#128C7E]',
      headerText: 'text-white',
      inputBg: 'bg-gray-100',
      inputText: 'text-gray-900',
      border: 'border-gray-300',
      hover: 'hover:bg-[#25D366]/10',
      scrollbar: 'scrollbar-thin scrollbar-thumb-gray-400',
    },
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    description: 'Elegant dark theme',
    colors: {
      background: 'bg-gray-900',
      chatBackground: 'bg-gray-950',
      messageIncoming: 'bg-gray-800',
      messageOutgoing: 'bg-blue-900',
      messageText: 'text-white',
      messageOutgoingText: 'text-gray-100',
      headerBg: 'bg-gray-800',
      headerText: 'text-white',
      inputBg: 'bg-gray-800',
      inputText: 'text-white',
      border: 'border-gray-700',
      hover: 'hover:bg-gray-700/50',
      scrollbar: 'scrollbar-thin scrollbar-thumb-gray-600',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    description: 'Calming ocean colors',
    colors: {
      background: 'bg-blue-50',
      chatBackground: 'bg-gradient-to-br from-blue-100 via-cyan-50 to-teal-50',
      messageIncoming: 'bg-white',
      messageOutgoing: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      messageText: 'text-gray-900',
      messageOutgoingText: 'text-white',
      headerBg: 'bg-gradient-to-r from-blue-600 to-cyan-600',
      headerText: 'text-white',
      inputBg: 'bg-white',
      inputText: 'text-gray-900',
      border: 'border-blue-200',
      hover: 'hover:bg-blue-100',
      scrollbar: 'scrollbar-thin scrollbar-thumb-blue-400',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset Glow',
    description: 'Warm sunset colors',
    colors: {
      background: 'bg-orange-50',
      chatBackground: 'bg-gradient-to-br from-orange-100 via-pink-50 to-yellow-50',
      messageIncoming: 'bg-white',
      messageOutgoing: 'bg-gradient-to-r from-orange-400 to-pink-500',
      messageText: 'text-gray-900',
      messageOutgoingText: 'text-white',
      headerBg: 'bg-gradient-to-r from-orange-500 to-pink-600',
      headerText: 'text-white',
      inputBg: 'bg-white',
      inputText: 'text-gray-900',
      border: 'border-orange-200',
      hover: 'hover:bg-orange-100',
      scrollbar: 'scrollbar-thin scrollbar-thumb-orange-400',
    },
  },
  {
    id: 'forest',
    name: 'Forest Green',
    description: 'Natural forest theme',
    colors: {
      background: 'bg-green-50',
      chatBackground: 'bg-gradient-to-br from-green-100 via-emerald-50 to-lime-50',
      messageIncoming: 'bg-white',
      messageOutgoing: 'bg-gradient-to-r from-green-600 to-emerald-600',
      messageText: 'text-gray-900',
      messageOutgoingText: 'text-white',
      headerBg: 'bg-gradient-to-r from-green-700 to-emerald-700',
      headerText: 'text-white',
      inputBg: 'bg-white',
      inputText: 'text-gray-900',
      border: 'border-green-200',
      hover: 'hover:bg-green-100',
      scrollbar: 'scrollbar-thin scrollbar-thumb-green-400',
    },
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    description: 'Luxurious purple theme',
    colors: {
      background: 'bg-purple-50',
      chatBackground: 'bg-gradient-to-br from-purple-100 via-violet-50 to-indigo-50',
      messageIncoming: 'bg-white',
      messageOutgoing: 'bg-gradient-to-r from-purple-600 to-violet-600',
      messageText: 'text-gray-900',
      messageOutgoingText: 'text-white',
      headerBg: 'bg-gradient-to-r from-purple-700 to-violet-700',
      headerText: 'text-white',
      inputBg: 'bg-white',
      inputText: 'text-gray-900',
      border: 'border-purple-200',
      hover: 'hover:bg-purple-100',
      scrollbar: 'scrollbar-thin scrollbar-thumb-purple-400',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight Blue',
    description: 'Deep blue night theme',
    colors: {
      background: 'bg-slate-900',
      chatBackground: 'bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950',
      messageIncoming: 'bg-slate-800',
      messageOutgoing: 'bg-gradient-to-r from-indigo-600 to-blue-600',
      messageText: 'text-gray-100',
      messageOutgoingText: 'text-white',
      headerBg: 'bg-gradient-to-r from-slate-800 to-indigo-900',
      headerText: 'text-gray-100',
      inputBg: 'bg-slate-800',
      inputText: 'text-gray-100',
      border: 'border-slate-700',
      hover: 'hover:bg-slate-700',
      scrollbar: 'scrollbar-thin scrollbar-thumb-slate-600',
    },
  },
  {
    id: 'candy',
    name: 'Candy Shop',
    description: 'Sweet and playful colors',
    colors: {
      background: 'bg-pink-50',
      chatBackground: 'bg-gradient-to-br from-pink-100 via-rose-50 to-fuchsia-50',
      messageIncoming: 'bg-white',
      messageOutgoing: 'bg-gradient-to-r from-pink-500 to-rose-500',
      messageText: 'text-gray-900',
      messageOutgoingText: 'text-white',
      headerBg: 'bg-gradient-to-r from-pink-600 to-rose-600',
      headerText: 'text-white',
      inputBg: 'bg-white',
      inputText: 'text-gray-900',
      border: 'border-pink-200',
      hover: 'hover:bg-pink-100',
      scrollbar: 'scrollbar-thin scrollbar-thumb-pink-400',
    },
  },
];

interface ThemeSelectorProps {
  onThemeChange: (theme: ChatTheme) => void;
  currentTheme: ChatTheme;
}

export default function ThemeSelector({ onThemeChange, currentTheme }: ThemeSelectorProps) {
  const currentThemeName = chatThemes.find(t => t.id === currentTheme.id)?.name || 'Select theme';
  
  return (
    <div className="flex items-center space-x-1">
      <Palette className={`h-4 w-4 ${currentTheme.colors.headerText} opacity-70`} />
      <SelectPrimitive.Root value={currentTheme.id} onValueChange={(value) => {
        const theme = chatThemes.find(t => t.id === value);
        if (theme) onThemeChange(theme);
      }}>
        <SelectPrimitive.Trigger className={cn(
          "flex items-center justify-between space-x-1 px-2 py-1 rounded text-xs",
          "bg-transparent outline-none transition-colors",
          "hover:bg-white/10",
          currentTheme.colors.headerText
        )}>
          <SelectPrimitive.Value>{currentThemeName}</SelectPrimitive.Value>
          <ChevronDown className="h-3 w-3 opacity-70" />
        </SelectPrimitive.Trigger>
        
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content 
            className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-[9999]"
            position="popper"
            sideOffset={5}
          >
            <SelectPrimitive.Viewport className="p-1">
              {chatThemes.map((theme) => (
                <SelectPrimitive.Item
                  key={theme.id}
                  value={theme.id}
                  className="flex items-center space-x-2 px-2 py-1.5 text-xs rounded cursor-pointer outline-none hover:bg-gray-100 data-[highlighted]:bg-gray-100"
                >
                  <div className="flex space-x-0.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      theme.id === 'default' ? 'bg-[#128C7E]' :
                      theme.id === 'dark' ? 'bg-gray-800' :
                      theme.id === 'ocean' ? 'bg-blue-500' :
                      theme.id === 'sunset' ? 'bg-orange-500' :
                      theme.id === 'forest' ? 'bg-green-600' :
                      theme.id === 'purple' ? 'bg-purple-600' :
                      theme.id === 'midnight' ? 'bg-indigo-600' :
                      'bg-pink-500'
                    }`} />
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      theme.id === 'default' ? 'bg-[#dcf8c6]' :
                      theme.id === 'dark' ? 'bg-blue-900' :
                      theme.id === 'ocean' ? 'bg-cyan-400' :
                      theme.id === 'sunset' ? 'bg-pink-400' :
                      theme.id === 'forest' ? 'bg-emerald-500' :
                      theme.id === 'purple' ? 'bg-violet-500' :
                      theme.id === 'midnight' ? 'bg-blue-500' :
                      'bg-rose-400'
                    }`} />
                  </div>
                  <SelectPrimitive.ItemText>
                    <span className="font-medium text-gray-900">{theme.name}</span>
                  </SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
}