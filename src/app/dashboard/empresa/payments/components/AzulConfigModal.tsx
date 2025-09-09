import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Upload, Info, AlertCircle } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

interface AzulConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: AzulConfig) => void;
  initialConfig?: Partial<AzulConfig>;
}

interface AzulConfig {
  storeId: string;
  auth1: string;
  auth2: string;
  certificateFile?: File;
  privateKeyFile?: File;
  isTestMode: boolean;
  transactionFee: number;
}

export function AzulConfigModal({ isOpen, onClose, onSave, initialConfig }: AzulConfigModalProps) {
  const { t } = useI18n();
  const [config, setConfig] = useState<AzulConfig>({
    storeId: initialConfig?.storeId || '',
    auth1: initialConfig?.auth1 || '',
    auth2: initialConfig?.auth2 || '',
    isTestMode: initialConfig?.isTestMode ?? true,
    transactionFee: initialConfig?.transactionFee || 2.95
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AzulConfig, string>>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    const newErrors: Partial<Record<keyof AzulConfig, string>> = {};
    
    if (!config.storeId) {
      newErrors.storeId = t('payments.azul.validation.storeIdRequired');
    }
    if (!config.auth1) {
      newErrors.auth1 = t('payments.azul.validation.auth1Required');
    }
    if (!config.auth2) {
      newErrors.auth2 = t('payments.azul.validation.auth2Required');
    }
    
    // Solo requerir certificados si es nueva configuración
    if (!initialConfig && !config.isTestMode) {
      if (!config.certificateFile) {
        newErrors.certificateFile = t('payments.azul.validation.certificateRequired');
      }
      if (!config.privateKeyFile) {
        newErrors.privateKeyFile = t('payments.azul.validation.privateKeyRequired');
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(config);
  };

  const handleFileChange = (field: 'certificateFile' | 'privateKeyFile') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setConfig(prev => ({ ...prev, [field]: file }));
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="/payment-providers/azul.png" 
                  alt="Azul" 
                  className="h-8 object-contain"
                />
                <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t('payments.azul.configure')}
                </Dialog.Title>
              </div>
              <Dialog.Close asChild>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Información importante */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                  <p>{t('payments.azul.info.credentials')}</p>
                  <p>{t('payments.azul.info.certificates')}</p>
                  <p>{t('payments.azul.info.production')}</p>
                  <p className="font-semibold">{t('payments.azul.info.contact')}: 809-544-2985</p>
                </div>
              </div>
            </div>

            {/* Credenciales de API */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 dark:text-white">
                {t('payments.azul.credentials.title')}
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Store ID *
                </label>
                <input
                  type="text"
                  value={config.storeId}
                  onChange={(e) => {
                    setConfig(prev => ({ ...prev, storeId: e.target.value }));
                    setErrors(prev => ({ ...prev, storeId: undefined }));
                  }}
                  placeholder="39038540035"
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.storeId 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                  }`}
                />
                {errors.storeId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.storeId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('payments.azul.credentials.username')} (Auth1) *
                </label>
                <input
                  type="text"
                  value={config.auth1}
                  onChange={(e) => {
                    setConfig(prev => ({ ...prev, auth1: e.target.value }));
                    setErrors(prev => ({ ...prev, auth1: undefined }));
                  }}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.auth1 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                  }`}
                />
                {errors.auth1 && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.auth1}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('payments.azul.credentials.password')} (Auth2) *
                </label>
                <input
                  type="password"
                  value={config.auth2}
                  onChange={(e) => {
                    setConfig(prev => ({ ...prev, auth2: e.target.value }));
                    setErrors(prev => ({ ...prev, auth2: undefined }));
                  }}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.auth2 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                  }`}
                />
                {errors.auth2 && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.auth2}</p>
                )}
              </div>
            </div>

            {/* Certificados SSL */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 dark:text-white">
                {t('payments.azul.certificates.title')}
              </h3>
              
              {config.isTestMode ? (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      {t('payments.azul.certificates.notRequiredInTestMode')}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('payments.azul.certificates.pem')} (.pem) {!config.isTestMode && '*'}
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept=".pem"
                        onChange={handleFileChange('certificateFile')}
                        className="hidden"
                        id="certificate-file"
                      />
                      <label
                        htmlFor="certificate-file"
                        className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition-colors ${
                          errors.certificateFile
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        <Upload className="w-4 h-4" />
                        {config.certificateFile?.name || t('payments.azul.certificates.select')}
                      </label>
                    </div>
                    {errors.certificateFile && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.certificateFile}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('payments.azul.certificates.key')} (.key) {!config.isTestMode && '*'}
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept=".key"
                        onChange={handleFileChange('privateKeyFile')}
                        className="hidden"
                        id="private-key-file"
                      />
                      <label
                        htmlFor="private-key-file"
                        className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition-colors ${
                          errors.privateKeyFile
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        <Upload className="w-4 h-4" />
                        {config.privateKeyFile?.name || t('payments.azul.certificates.select')}
                      </label>
                    </div>
                    {errors.privateKeyFile && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.privateKeyFile}</p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Configuración del entorno */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 dark:text-white">
                {t('payments.azul.environment.title')}
              </h3>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="test-mode"
                  checked={config.isTestMode}
                  onChange={(e) => setConfig(prev => ({ ...prev, isTestMode: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="test-mode" className="text-sm text-gray-700 dark:text-gray-300">
                  {t('payments.azul.environment.testMode')}
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('payments.azul.environment.fee')} (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={config.transactionFee}
                  onChange={(e) => setConfig(prev => ({ ...prev, transactionFee: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Acciones */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('common.save')}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}