'use client';

import { useEffect } from 'react';
import logger from '@/lib/logger';

export function LoggerInitializer() {
  useEffect(() => {
    // Default to silent logs in development to isolate issues
    try {
      if (process.env.NODE_ENV !== 'production') {
        localStorage.setItem('WB_SILENT_CONSOLE', '1');
      }
    } catch {}
    // Initialize logger when component mounts
    logger.init();
    // Optional: silent console message based on localStorage flag
    try {
      const silent = typeof window !== 'undefined' && localStorage.getItem('WB_SILENT_CONSOLE') === '1';
      if (!silent) {
        console.log('🔍 Frontend logger initialized');
      }
    } catch {}
    
    // Cleanup on unmount
    return () => {
      logger.destroy();
    };
  }, []);

  return null;
}
