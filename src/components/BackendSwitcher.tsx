'use client';

import { useBackendConfig } from '@/hooks/useBackendConfig';
import { useState } from 'react';

export function BackendSwitcher() {
  const { config, switchBackend, backends } = useBackendConfig();
  const [isOpen, setIsOpen] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);

  // Only show in development or if explicitly enabled
  const isDev = process.env.NODE_ENV === 'development';
  const isEnabled = process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_TRACKING === 'true';
  
  if (!isDev && !isEnabled) return null;

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
          style={{ borderColor: config.color }}
        >
          <div 
            className="w-3 h-3 rounded-full animate-pulse"
            style={{ backgroundColor: config.color }}
          />
          <span className="text-sm font-medium">
            Backend: {config.name}
          </span>
          <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute bottom-full mb-2 right-0 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold">Select Backend</h3>
            </div>
            
            <div className="p-2">
              {backends.map((backend) => (
                <button
                  key={backend.provider}
                  onClick={() => {
                    switchBackend(backend.provider);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    config.provider === backend.provider ? 'bg-gray-100 dark:bg-gray-700' : ''
                  }`}
                >
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: backend.color }}
                  />
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{backend.name}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {backend.apiUrl}
                    </div>
                  </div>
                  {config.provider === backend.provider && (
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowPerformance(!showPerformance)}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                {showPerformance ? 'Hide' : 'Show'} Performance Metrics
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Performance Metrics Panel */}
      {showPerformance && (
        <div className="fixed bottom-20 right-4 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-40">
          <h4 className="text-sm font-semibold mb-3">Performance Metrics</h4>
          <div id="performance-metrics" className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span>Current Backend:</span>
              <span className="font-mono">{config.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Avg Response Time:</span>
              <span className="font-mono" id="avg-response-time">-</span>
            </div>
            <div className="flex justify-between">
              <span>Total Requests:</span>
              <span className="font-mono" id="total-requests">0</span>
            </div>
            <div className="flex justify-between">
              <span>Failed Requests:</span>
              <span className="font-mono text-red-500" id="failed-requests">0</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}