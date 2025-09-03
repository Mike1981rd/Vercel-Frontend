// Newsletter Subscribers API functions

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266';

interface NewsletterSubscriber {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  isActive: boolean;
  sourcePage: string;
  sourceCampaign: string;
  language: string;
  acceptedMarketing: boolean;
  acceptedTerms: boolean;
  optInDate: string;
  optOutDate?: string;
  convertedToCustomer: boolean;
  customerId?: number;
  convertedAt?: string;
  createdAt: string;
  updatedAt: string;
  daysSinceSubscription: number;
  isConverted: boolean;
}

interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface SubscriberStatistics {
  totalActive: number;
  totalInactive: number;
  totalConverted: number;
  thisMonth: number;
  conversionRate: number;
}

interface CreateSubscriberDto {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  sourcePage?: string;
  sourceCampaign?: string;
  language?: string;
  acceptedMarketing?: boolean;
  acceptedTerms?: boolean;
}

interface UpdateSubscriberDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isActive?: boolean;
  language?: string;
  acceptedMarketing?: boolean;
  unsubscribeReason?: string;
}

interface ConvertToCustomerDto {
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  birthDate?: string;
  gender?: string;
  password?: string;
}

interface PublicSubscribeDto {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  sourcePage?: string;
  sourceCampaign?: string;
  language?: string;
  acceptedMarketing: boolean;
  acceptedTerms: boolean;
  companyDomain?: string;
}

class NewsletterSubscribersAPI {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Get paginated subscribers with filters
  async getSubscribers(
    page: number = 1, 
    pageSize: number = 20, 
    status: string = '', 
    search: string = ''
  ): Promise<PagedResult<NewsletterSubscriber>> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      status,
      search
    });

    const response = await fetch(`${API_BASE_URL}/api/newslettersubscribers?${params}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    }

    return response.json();
  }

  // Get subscriber by ID
  async getSubscriberById(id: number): Promise<NewsletterSubscriber> {
    const response = await fetch(`${API_BASE_URL}/api/newslettersubscribers/${id}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    }

    return response.json();
  }

  // Create new subscriber
  async createSubscriber(data: CreateSubscriberDto): Promise<NewsletterSubscriber> {
    const response = await fetch(`${API_BASE_URL}/api/newslettersubscribers`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    }

    return response.json();
  }

  // Update subscriber
  async updateSubscriber(id: number, data: UpdateSubscriberDto): Promise<NewsletterSubscriber> {
    const response = await fetch(`${API_BASE_URL}/api/newslettersubscribers/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    }

    return response.json();
  }

  // Delete subscriber (soft delete)
  async deleteSubscriber(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/newslettersubscribers/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    }
  }

  // Convert subscriber to customer
  async convertToCustomer(id: number, data: ConvertToCustomerDto): Promise<NewsletterSubscriber> {
    const response = await fetch(`${API_BASE_URL}/api/newslettersubscribers/${id}/convert-to-customer`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    }

    return response.json();
  }

  // Toggle subscriber status
  async toggleSubscriberStatus(id: number, isActive: boolean): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/newslettersubscribers/${id}/toggle-status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(isActive)
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    }
  }

  // Get recent subscribers
  async getRecentSubscribers(days: number = 30): Promise<NewsletterSubscriber[]> {
    const response = await fetch(`${API_BASE_URL}/api/newslettersubscribers/recent?days=${days}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    }

    return response.json();
  }

  // Get statistics
  async getStatistics(): Promise<SubscriberStatistics> {
    const response = await fetch(`${API_BASE_URL}/api/newslettersubscribers/statistics`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    }

    return response.json();
  }

  // Bulk operations
  async bulkUpdateStatus(subscriberIds: number[], isActive: boolean): Promise<NewsletterSubscriber[]> {
    const response = await fetch(`${API_BASE_URL}/api/newslettersubscribers/bulk/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ subscriberIds, isActive })
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    }

    return response.json();
  }

  async bulkDelete(subscriberIds: number[]): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/newslettersubscribers/bulk`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ subscriberIds })
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    }

    return response.json();
  }

  // Public API methods (no auth required)
  static async publicSubscribe(data: PublicSubscribeDto): Promise<{ success: boolean; message: string; subscriber: any }> {
    const response = await fetch(`${API_BASE_URL}/api/public/newsletter/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Subscription failed');
    }

    return response.json();
  }

  static async publicUnsubscribe(email: string, reason?: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/public/newsletter/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, reason })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Unsubscribe failed');
    }

    return response.json();
  }

  static async checkSubscriptionStatus(email: string): Promise<{ subscribed: boolean; subscribedAt?: string; language?: string }> {
    const response = await fetch(`${API_BASE_URL}/api/public/newsletter/status/${encodeURIComponent(email)}`, {
      method: 'GET'
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const newsletterSubscribersAPI = new NewsletterSubscribersAPI();

// Export types
export type {
  NewsletterSubscriber,
  PagedResult,
  SubscriberStatistics,
  CreateSubscriberDto,
  UpdateSubscriberDto,
  ConvertToCustomerDto,
  PublicSubscribeDto
};

// Export class for static methods
export { NewsletterSubscribersAPI };

// Export default instance
export default newsletterSubscribersAPI;