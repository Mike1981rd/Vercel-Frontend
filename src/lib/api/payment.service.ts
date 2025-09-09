import { apiClient } from '@/lib/api/client';

export interface PaymentProvider {
  id: number;
  name: string;
  provider: string;
  isActive: boolean;
  isTestMode: boolean;
  transactionFee: number;
  logo?: string;
  storeId?: string;
  hasCertificate?: boolean;
  hasPrivateKey?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConfigureProviderDto {
  provider: string;
  name: string;
  storeId?: string;
  auth1?: string;
  auth2?: string;
  apiKey?: string;
  secretKey?: string;
  clientId?: string;
  clientSecret?: string;
  isTestMode: boolean;
  transactionFee: number;
}

export interface ProcessPaymentDto {
  amount: number;
  cardNumber: string;
  cardExpiry: string;
  cardCVC: string;
  cardHolderName: string;
  orderId: string;
  customerEmail?: string;
  customerPhone?: string;
  returnUrl?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  authorizationCode?: string;
  message: string;
  errorCode?: string;
  cardLastFour?: string;
  processedAt: string;
  additionalData?: Record<string, string>;
}

export const paymentService = {
  // Obtener proveedores de pago
  async getProviders(): Promise<PaymentProvider[]> {
    const response = await apiClient.get('/paymentprovider');
    return response.data;
  },

  // Configurar proveedor con archivos
  async configureProvider(config: ConfigureProviderDto, certificateFile?: File, privateKeyFile?: File): Promise<PaymentProvider> {
    const formData = new FormData();
    
    // Agregar campos básicos
    Object.entries(config).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    // Agregar archivos si existen
    if (certificateFile) {
      formData.append('certificateFile', certificateFile, certificateFile.name);
    }
    if (privateKeyFile) {
      formData.append('privateKeyFile', privateKeyFile, privateKeyFile.name);
    }

    // Debug: log FormData contents
    console.log('FormData contents:');
    for (let [key, value] of Array.from(formData.entries())) {
      console.log(`${key}:`, value);
    }

    try {
      const response = await apiClient.post('/paymentprovider/configure', formData);
      
      return response.data;
    } catch (error) {
      console.error('Error details:', error);
      throw error;
    }
  },

  // Activar/desactivar proveedor
  async toggleProvider(providerId: number): Promise<{ message: string; provider: PaymentProvider }> {
    const response = await apiClient.patch(`/paymentprovider/${providerId}/toggle`);
    return response.data;
  },

  // Eliminar proveedor
  async deleteProvider(providerId: number): Promise<void> {
    await apiClient.delete(`/paymentprovider/${providerId}`);
  },

  // Procesar pago
  async processPayment(payment: ProcessPaymentDto): Promise<PaymentResponse> {
    const response = await apiClient.post('/payment/process', payment);
    return response.data;
  },

  // Validar credenciales
  async validateCredentials(provider: string): Promise<{ isValid: boolean }> {
    const response = await apiClient.post('/payment/validate-credentials', { provider });
    return response.data;
  },

  // Obtener proveedores disponibles (no configurados)
  async getAvailableProviders(): Promise<Array<{
    provider: string;
    name: string;
    logo?: string;
    transactionFee: number;
    description?: string;
  }>> {
    const response = await apiClient.get('/paymentprovider/available');
    return response.data;
  }
};