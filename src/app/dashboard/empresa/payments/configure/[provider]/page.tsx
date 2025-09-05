'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TabsNavigation } from '@/components/empresa/TabsNavigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  Shield, 
  AlertCircle, 
  CheckCircle,
  FileText,
  Key,
  Store,
  CreditCard,
  Loader2
} from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { paymentService } from '@/lib/api/payment.service';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

interface ProviderConfig {
  name: string;
  logo: string;
  accentColor: string;
  fields: ConfigField[];
}

interface ConfigField {
  name: string;
  label: string;
  type: 'text' | 'password' | 'file' | 'number' | 'toggle';
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  icon?: React.ReactNode;
  accept?: string; // for file inputs
}

const providerConfigs: Record<string, ProviderConfig> = {
  azul: {
    name: 'Azul Dominicana',
    logo: '/payment-providers/azul.png',
    accentColor: '#0066CC',
    fields: [
      {
        name: 'storeId',
        label: 'Store ID',
        type: 'text',
        required: true,
        placeholder: '39038540035',
        helpText: 'ID único de tu tienda proporcionado por Azul',
        icon: <Store className="h-5 w-5" />
      },
      {
        name: 'auth1',
        label: 'Auth 1',
        type: 'password',
        required: true,
        placeholder: '••••••••',
        helpText: 'Primera clave de autenticación',
        icon: <Key className="h-5 w-5" />
      },
      {
        name: 'auth2',
        label: 'Auth 2',
        type: 'password',
        required: true,
        placeholder: '••••••••',
        helpText: 'Segunda clave de autenticación',
        icon: <Key className="h-5 w-5" />
      },
      {
        name: 'CertificateFile',
        label: 'Certificado SSL (.pem)',
        type: 'file',
        required: true,
        accept: '.pem',
        helpText: 'Certificado SSL proporcionado por Azul',
        icon: <FileText className="h-5 w-5" />
      },
      {
        name: 'PrivateKeyFile',
        label: 'Llave Privada (.key)',
        type: 'file',
        required: true,
        accept: '.key',
        helpText: 'Llave privada del certificado SSL',
        icon: <Key className="h-5 w-5" />
      },
      {
        name: 'transactionFee',
        label: 'Comisión por Transacción (%)',
        type: 'number',
        required: true,
        placeholder: '2.95',
        helpText: 'Porcentaje de comisión por transacción',
        icon: <CreditCard className="h-5 w-5" />
      },
      {
        name: 'isTestMode',
        label: 'Modo de Prueba',
        type: 'toggle',
        helpText: 'Activar para realizar pruebas sin procesar pagos reales'
      }
    ]
  },
  stripe: {
    name: 'Stripe',
    logo: '/payment-providers/stripe.png',
    accentColor: '#635BFF',
    fields: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        required: true,
        placeholder: 'pk_live_...',
        helpText: 'Tu clave pública de Stripe',
        icon: <Key className="h-5 w-5" />
      },
      {
        name: 'secretKey',
        label: 'Secret Key',
        type: 'password',
        required: true,
        placeholder: 'sk_live_...',
        helpText: 'Tu clave secreta de Stripe',
        icon: <Key className="h-5 w-5" />
      },
      {
        name: 'webhookSecret',
        label: 'Webhook Secret',
        type: 'password',
        placeholder: 'whsec_...',
        helpText: 'Clave secreta para verificar webhooks',
        icon: <Shield className="h-5 w-5" />
      },
      {
        name: 'transactionFee',
        label: 'Comisión por Transacción (%)',
        type: 'number',
        required: true,
        placeholder: '2.9',
        helpText: 'Porcentaje de comisión + $0.30 por transacción',
        icon: <CreditCard className="h-5 w-5" />
      },
      {
        name: 'isTestMode',
        label: 'Modo de Prueba',
        type: 'toggle',
        helpText: 'Usar claves de prueba de Stripe'
      }
    ]
  },
  paypal: {
    name: 'PayPal',
    logo: '/payment-providers/paypal.png',
    accentColor: '#003087',
    fields: [
      {
        name: 'clientId',
        label: 'Client ID',
        type: 'text',
        required: true,
        placeholder: 'AYSq3RDGsmBLJE-otTkBtM...',
        helpText: 'ID de cliente de tu app PayPal',
        icon: <Key className="h-5 w-5" />
      },
      {
        name: 'clientSecret',
        label: 'Client Secret',
        type: 'password',
        required: true,
        placeholder: '••••••••',
        helpText: 'Secreto de cliente de tu app PayPal',
        icon: <Key className="h-5 w-5" />
      },
      {
        name: 'transactionFee',
        label: 'Comisión por Transacción (%)',
        type: 'number',
        required: true,
        placeholder: '3.49',
        helpText: 'Porcentaje de comisión + $0.49 por transacción',
        icon: <CreditCard className="h-5 w-5" />
      },
      {
        name: 'isTestMode',
        label: 'Modo Sandbox',
        type: 'toggle',
        helpText: 'Usar ambiente sandbox de PayPal'
      }
    ]
  },
  cardnet: {
    name: 'Cardnet',
    logo: '/payment-providers/cardnet.png',
    accentColor: '#E84855',
    fields: [
      {
        name: 'storeId',
        label: 'Merchant ID',
        type: 'text',
        required: true,
        placeholder: 'MID-12345',
        helpText: 'ID de comercio proporcionado por Cardnet',
        icon: <Store className="h-5 w-5" />
      },
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        required: true,
        placeholder: '••••••••',
        helpText: 'Clave API de Cardnet',
        icon: <Key className="h-5 w-5" />
      },
      {
        name: 'secretKey',
        label: 'Secret Key',
        type: 'password',
        required: true,
        placeholder: '••••••••',
        helpText: 'Clave secreta de Cardnet',
        icon: <Key className="h-5 w-5" />
      },
      {
        name: 'transactionFee',
        label: 'Comisión por Transacción (%)',
        type: 'number',
        required: true,
        placeholder: '3.25',
        helpText: 'Porcentaje de comisión por transacción',
        icon: <CreditCard className="h-5 w-5" />
      },
      {
        name: 'isTestMode',
        label: 'Modo de Prueba',
        type: 'toggle',
        helpText: 'Activar para realizar pruebas sin procesar pagos reales'
      }
    ]
  },
  portal: {
    name: 'Portal Pagos',
    logo: '/payment-providers/portal.png',
    accentColor: '#7C3AED',
    fields: [
      {
        name: 'clientId',
        label: 'Client ID',
        type: 'text',
        required: true,
        placeholder: 'portal_client_12345',
        helpText: 'ID de cliente proporcionado por Portal',
        icon: <Key className="h-5 w-5" />
      },
      {
        name: 'clientSecret',
        label: 'Client Secret',
        type: 'password',
        required: true,
        placeholder: '••••••••',
        helpText: 'Secreto de cliente de Portal',
        icon: <Key className="h-5 w-5" />
      },
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        required: true,
        placeholder: '••••••••',
        helpText: 'Clave API de Portal',
        icon: <Key className="h-5 w-5" />
      },
      {
        name: 'transactionFee',
        label: 'Comisión por Transacción (%)',
        type: 'number',
        required: true,
        placeholder: '2.75',
        helpText: 'Porcentaje de comisión por transacción',
        icon: <CreditCard className="h-5 w-5" />
      },
      {
        name: 'isTestMode',
        label: 'Modo de Prueba',
        type: 'toggle',
        helpText: 'Activar ambiente de pruebas'
      }
    ]
  }
};

export default function ConfigureProviderPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useI18n();
  const provider = params.provider as string;
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState<Record<string, any>>({
    isTestMode: true,
    transactionFee: 2.95
  });
  const [files, setFiles] = useState<Record<string, File>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [existingProvider, setExistingProvider] = useState<any>(null);
  
  const config = providerConfigs[provider];
  
  useEffect(() => {
    if (!config) {
      router.push('/dashboard/empresa/payments');
    } else {
      loadExistingProvider();
    }
  }, [config, router]);

  const loadExistingProvider = async () => {
    try {
      setLoadingData(true);
      const providers = await paymentService.getProviders();
      const existing = providers.find((p: any) => p.provider === provider);
      
      if (existing) {
        setExistingProvider(existing);
        // Cargar datos existentes (solo los no sensibles)
        setFormData({
          isTestMode: existing.isTestMode ?? true,
          transactionFee: existing.transactionFee ?? 2.95,
          storeId: existing.storeId || '',
          // Las credenciales sensibles no se devuelven por seguridad
          auth1: '',
          auth2: '',
          apiKey: '',
          secretKey: '',
          clientId: '',
          clientSecret: '',
          webhookSecret: ''
        });
      }
    } catch (error) {
      console.error('Error loading provider:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (name: string, file: File | null) => {
    if (file) {
      setFiles(prev => ({ ...prev, [name]: file }));
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    config.fields.forEach(field => {
      if (field.required) {
        // Si es un campo de password y ya existe el proveedor, no es requerido
        if (field.type === 'password' && existingProvider) {
          return; // Skip validation for password fields when updating
        }
        
        if (field.type === 'file') {
          // Si ya existe el proveedor y tiene certificados, los archivos no son requeridos
          if (existingProvider) {
            if (field.name === 'CertificateFile' && existingProvider.hasCertificate) {
              return; // Skip if certificate already exists
            }
            if (field.name === 'PrivateKeyFile' && existingProvider.hasPrivateKey) {
              return; // Skip if private key already exists
            }
          }
          
          if (!files[field.name]) {
            newErrors[field.name] = `${field.label} es requerido`;
          }
        } else {
          if (!formData[field.name]) {
            newErrors[field.name] = `${field.label} es requerido`;
          }
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      const configData = {
        provider,
        name: config.name,
        isTestMode: true,
        transactionFee: 0,
        ...formData
      };

      console.log('Configurando proveedor:', configData);
      
      const result = await paymentService.configureProvider(
        configData,
        files.CertificateFile,
        files.PrivateKeyFile
      );

      console.log('Proveedor configurado:', result);
      toast.success(`${config.name} configurado exitosamente`);
      
      // Pequeño delay para que el usuario vea el mensaje
      setTimeout(() => {
        router.push('/dashboard/empresa/payments');
      }, 1000);
      
    } catch (error: any) {
      console.error('Error configurando proveedor:', error);
      
      // Mostrar mensaje de error más específico
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Error al configurar el proveedor');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!config) {
    return null;
  }

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-6">
        {/* Tabs Navigation */}
        <TabsNavigation />
        
        {/* Configuration Content */}
        <div className="mt-4 sm:mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="px-3 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between py-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-20">
                    <Image
                      src={config.logo}
                      alt={config.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h1 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white">
                      Configurar {config.name}
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Configure las credenciales y ajustes del proveedor
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-[75%] sm:w-auto flex items-center justify-center gap-2 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base text-white font-medium bg-primary-600 hover:bg-primary-700 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                  <span className="hidden sm:inline">Guardar Configuración</span>
                  <span className="sm:hidden">Guardar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
            <div className="flex flex-col items-center sm:items-stretch">
              {/* Existing Provider Notice */}
              {existingProvider && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-[75%] sm:w-full mb-6 rounded-xl bg-green-50 dark:bg-green-900/20 p-3 sm:p-4 flex items-start gap-3 mx-auto sm:mx-0"
                >
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-800 dark:text-green-300">
                    <p className="font-semibold mb-1">Proveedor configurado anteriormente</p>
                    <p>
                      Este proveedor ya tiene credenciales guardadas. Los campos sensibles no se muestran por seguridad.
                      {existingProvider.hasCertificate && existingProvider.hasPrivateKey && (
                        <span className="block mt-1">✓ Certificados SSL configurados</span>
                      )}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Security Notice */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-[75%] sm:w-full mb-6 sm:mb-8 rounded-xl bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 flex items-start gap-3 mx-auto sm:mx-0"
              >
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  <p className="font-semibold mb-1">Sus credenciales están seguras</p>
                  <p>
                    Todas las credenciales se encriptan con AES-256 antes de almacenarse. 
                    Los certificados SSL se guardan en un directorio seguro fuera del alcance público.
                  </p>
                </div>
              </motion.div>

              {/* Form Fields */}
              <div className="space-y-6 w-full flex flex-col items-center sm:items-stretch">
          {config.fields.map((field, index) => (
            <motion.div
              key={field.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="w-[75%] sm:w-full bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 mx-auto sm:mx-0"
            >
              <label className="block">
                <div className="flex items-center gap-2 mb-2">
                  {field.icon}
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">
                        {/* No mostrar asterisco si es password/file y ya existe el proveedor */}
                        {!((field.type === 'password' || 
                           (field.type === 'file' && existingProvider && 
                            ((field.name === 'CertificateFile' && existingProvider.hasCertificate) ||
                             (field.name === 'PrivateKeyFile' && existingProvider.hasPrivateKey)))) && 
                          existingProvider) && '*'}
                      </span>
                    )}
                  </span>
                  {/* Indicador de campo con datos guardados */}
                  {existingProvider && field.type === 'password' && (
                    <span className="text-xs text-green-600 dark:text-green-400 ml-auto">
                      ✓ Configurado
                    </span>
                  )}
                </div>
                
                {field.helpText && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {field.helpText}
                    {/* Mensaje adicional para campos de contraseña cuando se actualiza */}
                    {existingProvider && field.type === 'password' && (
                      <span className="block mt-1 text-blue-600 dark:text-blue-400">
                        Deje vacío para mantener la contraseña actual
                      </span>
                    )}
                  </p>
                )}

                {field.type === 'text' || field.type === 'password' ? (
                  <input
                    type={field.type}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    placeholder={
                      field.type === 'password' && existingProvider && !formData[field.name]
                        ? '••••••••'
                        : field.placeholder
                    }
                    className={`w-full rounded-lg border px-2 sm:px-4 py-1.5 sm:py-3 text-sm sm:text-base text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 transition-colors ${
                      errors[field.name]
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  />
                ) : field.type === 'number' ? (
                  <input
                    type="number"
                    step="0.01"
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, parseFloat(e.target.value))}
                    placeholder={field.placeholder}
                    className={`w-full rounded-lg border px-2 sm:px-4 py-1.5 sm:py-3 text-sm sm:text-base text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 transition-colors ${
                      errors[field.name]
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  />
                ) : field.type === 'file' ? (
                  <div>
                    <input
                      type="file"
                      accept={field.accept}
                      onChange={(e) => handleFileChange(field.name, e.target.files?.[0] || null)}
                      className="hidden"
                      id={field.name}
                    />
                    <label
                      htmlFor={field.name}
                      className={`flex flex-col sm:flex-row items-center justify-center gap-2 w-full rounded-lg border-2 border-dashed px-3 sm:px-4 py-6 sm:py-8 cursor-pointer transition-colors ${
                        errors[field.name]
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : existingProvider && 
                            ((field.name === 'CertificateFile' && existingProvider.hasCertificate) ||
                             (field.name === 'PrivateKeyFile' && existingProvider.hasPrivateKey))
                          ? 'border-green-300 dark:border-green-700 hover:border-green-400 dark:hover:border-green-600 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-900'
                      }`}
                    >
                      <Upload className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {files[field.name] 
                          ? files[field.name].name 
                          : existingProvider && 
                            ((field.name === 'CertificateFile' && existingProvider.hasCertificate) ||
                             (field.name === 'PrivateKeyFile' && existingProvider.hasPrivateKey))
                          ? `✓ Archivo configurado (seleccione solo si desea reemplazar)`
                          : `Seleccionar archivo ${field.accept}`}
                      </span>
                    </label>
                    {/* Mensaje para archivos existentes */}
                    {existingProvider && 
                     ((field.name === 'CertificateFile' && existingProvider.hasCertificate) ||
                      (field.name === 'PrivateKeyFile' && existingProvider.hasPrivateKey)) && (
                      <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                        El archivo actual se mantendrá si no selecciona uno nuevo
                      </p>
                    )}
                  </div>
                ) : field.type === 'toggle' ? (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData[field.name] || false}
                      onChange={(e) => handleInputChange(field.name, e.target.checked)}
                      className="h-5 w-5 rounded border-gray-300 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Activar modo de prueba
                    </span>
                  </label>
                ) : null}

                {errors[field.name] && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors[field.name]}
                  </p>
                )}
              </label>
            </motion.div>
          ))}
              </div>

              {/* Test Mode Warning */}
              {formData.isTestMode && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-[75%] sm:w-full mt-6 rounded-xl bg-amber-50 dark:bg-amber-900/20 p-3 sm:p-4 flex items-start gap-3 mx-auto sm:mx-0"
                >
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800 dark:text-amber-300">
                    <p className="font-semibold mb-1">Modo de Prueba Activado</p>
                    <p>
                      Las transacciones no serán procesadas realmente. 
                      Desactive el modo de prueba cuando esté listo para procesar pagos reales.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}