// Customer API integration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api';

export interface Customer {
  id: number;
  customerId: string;
  fullName: string;
  username: string;
  email: string;
  avatar?: string;
  phone?: string;
  country: string;
  status: string;
  accountBalance: number;
  totalSpent: number;
  totalOrders: number;
  loyaltyPoints: number;
  loyaltyTier: string;
  twoFactorEnabled: boolean;
  wishlistCount: number;
  couponsCount: number;
  createdAt: string;
  lastLoginAt?: string;
}

export interface CustomerDetail {
  // Include all Customer properties except ones we're redefining
  id: number;
  name?: string;
  email: string;
  phone?: string;
  status: string;
  lastOrderDate?: string;
  orderCount: number;
  totalSpent: number;
  city?: string;
  country?: string;
  createdAt: string;
  lastLoginAt?: string;
  // Additional detail properties
  firstName?: string;
  lastName?: string;
  username?: string;
  birthDate?: string;
  gender?: string;
  loyaltyTier?: string;
  preferredLanguage?: string;
  preferredCurrency?: string;
  companyName?: string;
  taxId?: string;
  twoFactorPhone?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  avatar?: string;
  isTwoFactorEnabled?: boolean;
  twoFactorEnabled?: boolean;
  recoveryEmail?: string;
  securityQuestions?: any[];
  devices?: CustomerDevice[];
  sessionTimeoutMinutes?: number;
  sessionTimeout?: number;
  billingEmail?: string;
  autoCharge?: boolean;
  paperlessBilling?: boolean;
  addresses: CustomerAddress[];
  paymentMethods: CustomerPaymentMethod[];
  notificationPreferences: CustomerNotificationPreference[] | any;
  recentDevices: CustomerDevice[];
  wishlistItems: CustomerWishlistItem[];
  coupons: CustomerCoupon[];
  
  // Legacy billing properties for backward compatibility
  billingAddress?: string;
  billingCity?: string;
  billingState?: string;
  billingCountry?: string;
  billingPostalCode?: string;
  billingApartment?: string;
}

export interface CustomerAddress {
  id: number;
  type: string;
  label: string;
  street: string;
  apartment?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  isDefault: boolean;
  createdAt: string;
  
  // Alternative property names for compatibility
  addressLine1?: string;
  addressLine2?: string;
  fullAddress?: string;
}

export interface CustomerPaymentMethod {
  id: number;
  cardType: string;
  cardholderName: string;
  last4Digits: string;
  expiryMonth: string;
  expiryYear: string;
  billingAddress?: string;
  isPrimary: boolean;
  createdAt: string;
  displayName?: string;
  expiryDate?: string;
  isExpired?: boolean;
}

export interface CustomerNotificationPreference {
  id: number;
  notificationType: string;
  displayName: string;
  description?: string;
  emailEnabled: boolean;
  browserEnabled: boolean;
  appEnabled: boolean;
}

export interface CustomerDevice {
  id: number;
  browser: string;
  deviceType: string;
  deviceName: string;
  operatingSystem: string;
  ipAddress: string;
  location: string;
  lastActivity: string;
  firstSeen: string;
  isTrusted: boolean;
  isActive: boolean;
  activityDisplay?: string;
  deviceDisplay?: string;
}

export interface CustomerWishlistItem {
  id: number;
  productId: number;
  productVariantId?: number;
  productName: string;
  productImage?: string;
  productPrice: number;
  inStock: boolean;
  addedAt: string;
  notifyOnPriceChange: boolean;
  notifyOnBackInStock: boolean;
}

export interface CustomerCoupon {
  id: number;
  code: string;
  description: string;
  discountAmount: number;
  discountType: string;
  minimumPurchase?: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  usageCount: number;
  maxUsageCount?: number;
  isValid?: boolean;
  isExpired?: boolean;
  canBeUsed?: boolean;
  status?: string;
  discountDisplay?: string;
  daysLeft?: number;
}

export interface CustomerFilter {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
  country?: string;
  loyaltyTier?: string;
  minSpent?: number;
  maxSpent?: number;
  sortBy?: string;
  sortDescending?: boolean;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateCustomerDto {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
  country: string;
  status?: string;
  initialBalance?: number;
  initialLoyaltyPoints?: number;
}

export interface UpdateCustomerDto {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  phone?: string;
  country?: string;
  status?: string;
  avatar?: string;
  accountBalance?: number;
  loyaltyPoints?: number;
  twoFactorEnabled?: boolean;
  twoFactorPhone?: string;
}

class CustomerAPI {
  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async getCustomers(filter?: CustomerFilter): Promise<PagedResult<Customer>> {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${API_URL}/customers?${params}`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error fetching customers:', response.status, error);
      throw new Error('Failed to fetch customers');
    }

    return response.json();
  }

  async getCustomer(id: number): Promise<CustomerDetail> {
    const response = await fetch(`${API_URL}/customers/${id}`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error fetching customer:', response.status, error);
      throw new Error('Failed to fetch customer');
    }

    const data = await response.json();
    
    // Map the backend response to our frontend model
    return {
      ...data,
      phoneNumber: data.phone || data.phoneNumber || '',
      avatarUrl: data.avatar || data.avatarUrl || ''
    };
  }

  async createCustomer(data: CreateCustomerDto): Promise<Customer> {
    const response = await fetch(`${API_URL}/customers`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error creating customer:', response.status, errorText);
      
      // Try to parse error message from response
      let errorMessage = 'Failed to create customer';
      try {
        const errorObj = JSON.parse(errorText);
        errorMessage = errorObj.error || errorObj.message || errorObj.detail || errorMessage;
      } catch {
        // If not JSON, use the text directly if it's not empty
        if (errorText && errorText.length < 200) {
          errorMessage = errorText;
        }
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async updateCustomer(id: number, data: UpdateCustomerDto): Promise<Customer> {
    const response = await fetch(`${API_URL}/customers/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error updating customer:', response.status, errorText);
      
      // Try to parse error message from response
      let errorMessage = 'Failed to update customer';
      try {
        const errorObj = JSON.parse(errorText);
        errorMessage = errorObj.error || errorObj.message || errorObj.detail || errorMessage;
      } catch {
        // If not JSON, use the text directly if it's not empty
        if (errorText && errorText.length < 200) {
          errorMessage = errorText;
        }
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async deleteCustomer(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/customers/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error deleting customer:', response.status, error);
      throw new Error('Failed to delete customer');
    }
  }

  async updateAvatar(id: number, data: { avatarUrl: string }): Promise<Customer> {
    const response = await fetch(`${API_URL}/customers/${id}/avatar`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error updating avatar:', response.status, error);
      throw new Error('Failed to update avatar');
    }

    return response.json();
  }


  async enableTwoFactor(id: number, phoneNumber: string): Promise<void> {
    const response = await fetch(`${API_URL}/customers/${id}/two-factor/enable`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ phoneNumber })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error enabling 2FA:', response.status, error);
      throw new Error('Failed to enable two-factor authentication');
    }
  }

  async disableTwoFactor(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/customers/${id}/two-factor/disable`, {
      method: 'POST',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error disabling 2FA:', response.status, error);
      throw new Error('Failed to disable two-factor authentication');
    }
  }

  async updateNotificationPreferences(id: number, preferences: any): Promise<void> {
    const response = await fetch(`${API_URL}/customers/${id}/notifications`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(preferences)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error updating notifications:', response.status, error);
      throw new Error('Failed to update notification preferences');
    }
  }

  async updateSecuritySettings(id: number, settings: any): Promise<void> {
    const response = await fetch(`${API_URL}/customers/${id}/security`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(settings)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error updating security settings:', response.status, error);
      throw new Error('Failed to update security settings');
    }
  }

  async changePassword(id: number, passwordData: any): Promise<void> {
    const response = await fetch(`${API_URL}/customers/${id}/change-password`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(passwordData)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error changing password:', response.status, error);
      throw new Error('Failed to change password');
    }
  }

  // Additional detail page methods
  async getById(id: number): Promise<CustomerDetail> {
    return this.getCustomer(id);
  }

  async revokeDevice(customerId: number, deviceId: number): Promise<void> {
    const response = await fetch(`${API_URL}/customers/${customerId}/devices/${deviceId}/revoke`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    if (!response.ok) throw new Error('Failed to revoke device');
  }

  async deleteAddress(customerId: number, addressId: number): Promise<void> {
    const response = await fetch(`${API_URL}/customers/${customerId}/addresses/${addressId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete address');
  }

  async setDefaultAddress(customerId: number, addressId: number): Promise<void> {
    const response = await fetch(`${API_URL}/customers/${customerId}/addresses/${addressId}/set-default`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    if (!response.ok) throw new Error('Failed to set default address');
  }

  async addAddress(customerId: number, address: any): Promise<CustomerAddress> {
    const response = await fetch(`${API_URL}/customers/${customerId}/addresses`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(address)
    });
    if (!response.ok) {
      const error = await response.text();
      console.error('Error adding address:', response.status, error);
      throw new Error('Failed to add address');
    }
    return response.json();
  }

  async updateAddress(customerId: number, addressId: number, address: any): Promise<CustomerAddress> {
    const response = await fetch(`${API_URL}/customers/${customerId}/addresses/${addressId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(address)
    });
    if (!response.ok) {
      const error = await response.text();
      console.error('Error updating address:', response.status, error);
      throw new Error('Failed to update address');
    }
    return response.json();
  }

  async getAddresses(customerId: number): Promise<CustomerAddress[]> {
    const response = await fetch(`${API_URL}/customers/${customerId}/addresses`, {
      headers: this.getHeaders()
    });
    if (!response.ok) {
      const error = await response.text();
      console.error('Error fetching addresses:', response.status, error);
      throw new Error('Failed to fetch addresses');
    }
    return response.json();
  }

  // Payments history (aggregated via reservations → payments)
  async getCustomerPaymentsByEmail(email: string): Promise<Array<{ reservationId: number; amount: number; method: string; status: string; date: string; transactionId?: string }>> {
    // 1) Fetch all reservations for the company, then filter by guest email
    const reservationsResp = await fetch(`${API_URL}/reservations`, { headers: this.getHeaders() });
    if (!reservationsResp.ok) {
      throw new Error('Failed to fetch reservations');
    }
    const reservations = await reservationsResp.json(); // Expect ReservationListDto[]
    const mine = (reservations || []).filter((r: any) => (r.guestEmail || '').toLowerCase() === email.toLowerCase());

    // 2) For each reservation, fetch payments
    const results: Array<{ reservationId: number; amount: number; method: string; status: string; date: string; transactionId?: string }> = [];
    for (const r of mine) {
      try {
        const payResp = await fetch(`${API_URL}/reservations/${r.id}/payments`, { headers: this.getHeaders() });
        if (!payResp.ok) continue;
        const payload = await payResp.json();
        const payments = payload?.data || payload || [];
        for (const p of payments) {
          results.push({
            reservationId: r.id,
            amount: p.amount ?? p.Amount ?? 0,
            method: p.paymentMethod ?? p.PaymentMethod ?? 'Card',
            status: p.status ?? p.Status ?? 'Completed',
            date: p.paymentDate ?? p.PaymentDate ?? new Date().toISOString(),
            transactionId: p.transactionId ?? p.TransactionId
          });
        }
      } catch {
        // ignore
      }
    }
    // Sort by date desc
    results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return results;
  }

  async deletePaymentMethod(customerId: number, paymentMethodId: number): Promise<void> {
    const response = await fetch(`${API_URL}/customers/${customerId}/payment-methods/${paymentMethodId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete payment method');
  }

  // Export data functionality
  exportToCSV(customers: Customer[]): void {
    const headers = ['Customer ID', 'Name', 'Email', 'Country', 'Total Spent', 'Orders', 'Status'];
    const rows = customers.map(c => [
      c.customerId,
      c.fullName,
      c.email,
      c.country,
      c.totalSpent.toFixed(2),
      c.totalOrders.toString(),
      c.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}

export const customerAPI = new CustomerAPI();
export const customersApi = customerAPI; // Alias for backward compatibility