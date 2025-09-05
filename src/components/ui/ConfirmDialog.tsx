'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'red' | 'green' | 'blue';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'blue'
}: ConfirmDialogProps) {
  const getConfirmButtonColor = () => {
    switch (confirmColor) {
      case 'red':
        return 'bg-red-600 hover:bg-red-700';
      case 'green':
        return 'bg-green-600 hover:bg-green-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
              {/* Header */}
              <div className="flex items-start p-6">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {title}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {message}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="ml-auto flex-shrink-0 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 px-6 pb-6">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${getConfirmButtonColor()}`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}