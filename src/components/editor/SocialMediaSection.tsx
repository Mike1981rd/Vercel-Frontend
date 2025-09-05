'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SocialMediaConfig } from '@/types/theme/socialMedia';
import { socialPlatforms } from '@/types/theme/socialMedia';

interface SocialMediaSectionProps {
  config?: SocialMediaConfig;
  onChange?: (config: SocialMediaConfig) => void;
}

export function SocialMediaSection({ config = {}, onChange }: SocialMediaSectionProps) {

  const handleUrlChange = (platform: keyof SocialMediaConfig, value: string) => {
    if (onChange) {
      onChange({
        ...config,
        [platform]: value
      });
    }
  };

  // Order platforms as shown in the UI mockup
  const platformOrder: (keyof SocialMediaConfig)[] = [
    'instagram', 'facebook', 'twitter', 'youtube', 'shopify',
    'pinterest', 'tiktok', 'tumblr', 'snapchat', 'linkedin',
    'vimeo', 'flickr', 'reddit', 'email', 'behance',
    'discord', 'dublhub', 'medium', 'twitch', 'whatsapp',
    'viber', 'telegram'
  ];

  return (
    <div className="space-y-6">
      {/* Social Media Title */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Social media</h3>
        <p className="text-sm text-muted-foreground">
          Links to social profiles you add here will appear on your online store.
        </p>
      </div>

      {/* Social Media Links Grid */}
      <div className="space-y-4">
        {platformOrder.map((platform) => {
          const platformInfo = socialPlatforms[platform];
          const currentValue = config?.[platform] || '';
          
          return (
            <div key={platform} className="space-y-2">
              <Label htmlFor={`social-${platform}`} className="text-sm font-medium">
                {platformInfo.name}
              </Label>
              <div className="relative">
                <Input
                  id={`social-${platform}`}
                  type="url"
                  value={currentValue}
                  onChange={(e) => handleUrlChange(platform, e.target.value)}
                  placeholder={getPlaceholder(platform)}
                  className="w-full"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getPlaceholder(platform: keyof SocialMediaConfig): string {
  const placeholders: Record<keyof SocialMediaConfig, string> = {
    instagram: 'https://instagram.com/yourprofile',
    facebook: 'https://facebook.com/yourpage',
    twitter: 'https://twitter.com/yourhandle',
    youtube: 'https://youtube.com/@yourchannel',
    shopify: 'https://yourstore.myshopify.com',
    pinterest: 'https://pinterest.com/yourprofile',
    tiktok: 'https://tiktok.com/@yourhandle',
    tumblr: 'https://yourblog.tumblr.com',
    snapchat: 'https://snapchat.com/add/yourhandle',
    linkedin: 'https://linkedin.com/company/yourcompany',
    vimeo: 'https://vimeo.com/yourprofile',
    flickr: 'https://flickr.com/people/yourprofile',
    reddit: 'https://reddit.com/user/yourhandle',
    email: 'mailto:contact@example.com',
    behance: 'https://behance.net/yourportfolio',
    discord: 'https://discord.gg/yourinvite',
    dublhub: 'https://dublhub.com/yourprofile',
    medium: 'https://medium.com/@yourhandle',
    twitch: 'https://twitch.tv/yourchannel',
    whatsapp: 'https://wa.me/1234567890',
    viber: 'viber://add?number=1234567890',
    telegram: 'https://t.me/yourchannel'
  };
  
  return placeholders[platform] || '';
}