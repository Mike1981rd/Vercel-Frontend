import { apiClient } from './client';

export interface Policy {
  id: number;
  companyId: number;
  type: string;
  title: string;
  content: string;
  isRequired: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  icon?: string;
  description?: string;
}

export interface UpdatePolicyDto {
  title: string;
  content: string;
  isRequired: boolean;
  isActive: boolean;
}

export const policiesApi = {
  // Get all policies for the company
  getAll: async (): Promise<Policy[]> => {
    const response = await apiClient.get('/policies');
    return response.data;
  },

  // Get a specific policy by type
  getByType: async (type: string): Promise<Policy> => {
    const response = await apiClient.get(`/policies/${type}`);
    return response.data;
  },

  // Update a policy
  update: async (type: string, data: UpdatePolicyDto): Promise<{ message: string; policy: Policy }> => {
    const response = await apiClient.put(`/policies/${type}`, data);
    return response.data;
  },

  // Initialize all policies for the company
  initialize: async (): Promise<{ message: string }> => {
    const response = await apiClient.post('/policies/initialize');
    return response.data;
  }
};