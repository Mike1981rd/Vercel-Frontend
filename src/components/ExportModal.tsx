'use client';

import { X, FileText, FileSpreadsheet, Download } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: string) => void;
  primaryColor: string;
}

export function ExportModal({ isOpen, onClose, onExport, primaryColor }: ExportModalProps) {
  if (!isOpen) return null;

  const exportOptions = [
    { id: 'csv', name: 'CSV', icon: FileText, description: 'Archivo separado por comas' },
    { id: 'excel', name: 'Excel', icon: FileSpreadsheet, description: 'Hoja de cálculo de Microsoft Excel' },
    { id: 'pdf', name: 'PDF', icon: FileText, description: 'Documento portable' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Exportar Datos
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Export Options */}
        <div className="space-y-3">
          {exportOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                onExport(option.id);
                onClose();
              }}
              className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors group"
            >
              <div 
                className="p-3 rounded-lg bg-white dark:bg-gray-800 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <option.icon className="w-5 h-5" style={{ color: primaryColor }} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900 dark:text-white">
                  {option.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {option.description}
                </p>
              </div>
              <Download className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
            </button>
          ))}
        </div>

        {/* Cancel Button */}
        <button
          onClick={onClose}
          className="w-full mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}