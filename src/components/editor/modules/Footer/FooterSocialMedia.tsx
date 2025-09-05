/**
 * @file FooterSocialMedia.tsx
 * @max-lines 200
 * @module Footer
 * @created 2025-01-15
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FooterSocialMediaProps {
  socialMedia: Record<string, string>;
  onChange: (socialMedia: Record<string, string>) => void;
}

const socialPlatforms = [
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/your-profile' },
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/your-page' },
  { key: 'twitter', label: 'Twitter / X', placeholder: 'https://twitter.com/your-handle' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@your-channel' },
  { key: 'pinterest', label: 'Pinterest', placeholder: 'https://pinterest.com/your-profile' },
  { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@your-profile' },
  { key: 'reddit', label: 'Reddit', placeholder: 'https://reddit.com/r/your-subreddit' },
  { key: 'tumblr', label: 'Tumblr', placeholder: 'https://your-blog.tumblr.com' },
  { key: 'snapchat', label: 'Snapchat', placeholder: 'https://snapchat.com/add/your-username' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/your-company' },
  { key: 'vimeo', label: 'Vimeo', placeholder: 'https://vimeo.com/your-channel' },
  { key: 'flickr', label: 'Flickr', placeholder: 'https://flickr.com/photos/your-profile' },
  { key: 'behance', label: 'Behance', placeholder: 'https://behance.net/your-portfolio' },
  { key: 'discord', label: 'Discord', placeholder: 'https://discord.gg/your-server' },
  { key: 'dribbble', label: 'Dribbble', placeholder: 'https://dribbble.com/your-profile' },
  { key: 'medium', label: 'Medium', placeholder: 'https://medium.com/@your-profile' },
  { key: 'twitch', label: 'Twitch', placeholder: 'https://twitch.tv/your-channel' },
  { key: 'whatsapp', label: 'WhatsApp', placeholder: 'https://wa.me/your-number' },
  { key: 'video', label: 'Video', placeholder: 'https://your-video-url.com' },
  { key: 'telegram', label: 'Telegram', placeholder: 'https://t.me/your-channel' },
  { key: 'email', label: 'Email', placeholder: 'mailto:your@email.com' },
  { key: 'balance', label: 'Balance', placeholder: 'https://balance.com/your-profile' }
];

export default function FooterSocialMedia({ socialMedia, onChange }: FooterSocialMediaProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSocialChange = (key: string, value: string) => {
    onChange({
      ...socialMedia,
      [key]: value
    });
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left mb-3"
      >
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Configuración del tema
        </h3>
        {isExpanded ? 
          <ChevronUp className="w-4 h-4 text-gray-500" /> : 
          <ChevronDown className="w-4 h-4 text-gray-500" />
        }
      </button>
      
      {isExpanded && (
        <div className="space-y-3">
          {socialPlatforms.map(platform => (
            <div key={platform.key}>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                {platform.label}
              </label>
              <input
                type="url"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md 
                          focus:outline-none focus:ring-1 focus:ring-blue-500 
                          dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                value={socialMedia[platform.key] || ''}
                onChange={(e) => handleSocialChange(platform.key, e.target.value)}
                placeholder={platform.placeholder}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}