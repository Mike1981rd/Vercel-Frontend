'use client';

import { useEffect } from 'react';
import logger from '@/lib/logger';

export function LoggerInitializer() {
  useEffect(() => {
    // Initialize logger when component mounts
    logger.init();
    
    // Log initialization
    console.log('🔍 Frontend logger initialized - All errors will be logged to files');
    
    // Cleanup on unmount
    return () => {
      logger.destroy();
    };
  }, []);

  return null;
}