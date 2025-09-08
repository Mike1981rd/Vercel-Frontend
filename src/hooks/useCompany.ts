'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getApiEndpoint } from '@/lib/api-url';

export interface Company {
  id: number;
  name: string;
  domain?: string;
  customDomain?: string;
  subdomain?: string;
  logo?: string;
  logoSize?: number;
  primaryColor?: string;
  secondaryColor?: string;
  isActive: boolean;

  // Profile Section
  phoneNumber?: string;
  contactEmail?: string;
  senderEmail?: string;

  // Billing Information
  legalBusinessName?: string;
  country?: string;
  region?: string;
  address?: string;
  apartment?: string;
  city?: string;
  state?: string;
  postalCode?: string;

  // Time Zone & Units
  timeZone?: string;
  metricSystem?: string;
  weightUnit?: string;

  // Store Currency
  currency?: string;

  // Order ID Format
  orderIdPrefix?: string;
  orderIdSuffix?: string;

  createdAt: string;
  updatedAt: string;
}

export interface UpdateCompanyRequest {
  name?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  phoneNumber?: string;
  contactEmail?: string;
  senderEmail?: string;
  legalBusinessName?: string;
  country?: string;
  region?: string;
  address?: string;
  apartment?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  timeZone?: string;
  metricSystem?: string;
  weightUnit?: string;
  currency?: string;
  orderIdPrefix?: string;
  orderIdSuffix?: string;
}

export function useCompany() {
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch current company data
  const fetchCompany = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get('/company/current');
      setCompany(response.data as Company);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401 || status === 404 || status === 500) {
        try {
          const companyId = (typeof window !== 'undefined' && localStorage.getItem('companyId')) || '1';
          const url = getApiEndpoint(`/company/${companyId}/public`);
          const res = await fetch(url, { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            setCompany(data as Company);
            setError(null);
          } else {
            setError('Error loading company information');
          }
        } catch (e) {
          setError('Error loading company information');
        }
      } else {
        console.error('Error fetching company:', err);
        setError(err.response?.data?.message || 'Error loading company information');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Update company data
  const updateCompany = async (data: UpdateCompanyRequest): Promise<Company> => {
    try {
      setError(null);
      
      const response = await api.put('/company/current', data);
      const updatedCompany = response.data;
      
      setCompany(updatedCompany as Company);
      return updatedCompany as Company;
    } catch (err: any) {
      console.error('Error updating company:', err);
      console.error('Error response:', err.response?.data);
      const errorMessage = err.response?.data?.message || err.response?.data?.errors || 'Error updating company information';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Upload logo
  const uploadLogo = async (file: File): Promise<string> => {
    try {
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/company/current/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const logoUrl = (response.data as any).logoUrl;
      
      // Update company data with new logo
      if (company) {
        setCompany({
          ...company,
          logo: logoUrl,
          updatedAt: new Date().toISOString(),
        });
      }
      
      return logoUrl;
    } catch (err: any) {
      console.error('Error uploading logo:', err);
      const errorMessage = err.response?.data?.message || 'Error uploading logo';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Get company config (public data)
  const getCompanyConfig = async () => {
    try {
      const response = await api.get('/company/config');
      return response.data;
    } catch (err: any) {
      console.error('Error fetching company config:', err);
      throw new Error(err.response?.data?.message || 'Error loading company configuration');
    }
  };

  // Refresh company data
  const refreshCompany = () => {
    fetchCompany();
  };

  // Load company data on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCompany();
    } else {
      // Evitar llamadas públicas automáticas en login para no ensuciar consola
      setIsLoading(false);
    }
  }, []);

  return {
    company,
    isLoading,
    error,
    updateCompany,
    uploadLogo,
    getCompanyConfig,
    refreshCompany,
    refetch: fetchCompany, // Alias for compatibility
  };
}
