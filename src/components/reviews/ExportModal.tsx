'use client';

import React from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { usePrimaryColor } from '@/contexts/PrimaryColorContext';
import { XIcon } from '@/components/ui/Icons';

interface ExportModalProps {
  onClose: () => void;
  onExport: (format: string) => void;
}

export function ExportModal({ onClose, onExport }: ExportModalProps) {
  const { t } = useI18n();
  const { primaryColor } = usePrimaryColor();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96 max-w-[90%] shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('reviews.exportData', 'Export Reviews')}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XIcon size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {t('reviews.exportDescription', 'Choose a format to export your reviews data')}
        </p>
        
        <div className="space-y-3">
          {/* Excel Option */}
          <button 
            onClick={() => onExport('excel')} 
            className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-4 group transition-colors"
          >
            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-left flex-1">
              <p className="font-medium text-gray-900 dark:text-white">Excel</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">.xls format</p>
            </div>
          </button>
          
          {/* CSV Option */}
          <button 
            onClick={() => onExport('csv')} 
            className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-4 group transition-colors"
          >
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-left flex-1">
              <p className="font-medium text-gray-900 dark:text-white">CSV</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">.csv format</p>
            </div>
          </button>
        </div>
        
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {t('common.cancel', 'Cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}