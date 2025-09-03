'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import WhatsAppNav from '../components/WhatsAppNav';
import GreenApiConfig from '../components/GreenApiConfig';
import { ArrowLeft } from 'lucide-react';

export default function WhatsAppConfigPage() {
  const router = useRouter();

  return (
    <div className="w-full h-full bg-gray-50 dark:bg-gray-900">
      {/* Elegant minimal header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/whatsapp/chat')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
              aria-label="Volver al chat"
            >
              <ArrowLeft className="h-6 w-6 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors" />
            </button>
            
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Configuración de WhatsApp
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Conecta tu cuenta de WhatsApp Business
              </p>
            </div>
          </div>

          {/* Status indicator */}
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Green API</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-6 pt-4">
        <WhatsAppNav />
      </div>

      {/* Configuration Form with padding */}
      <div className="p-6">
        <GreenApiConfig />
      </div>
    </div>
  );
}