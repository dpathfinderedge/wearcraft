import { Address, ApiAddress, ApiUser, UpdateProfileData } from '@/types/user';
import { ApiOrder } from '@/types/order';
import { mapAddressToApi } from '@/lib/mappers';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: options?.signal || controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        credentials: 'include', // Important for cookies
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        error: error instanceof DOMException && error.name === 'AbortError'
          ? 'The request timed out. Please try again.'
          : error instanceof Error
            ? error.message
            : 'An error occurred',
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  async signup(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<ApiResponse<{ user: ApiUser; token: string }>> {
    return this.request<{ user: ApiUser; token: string }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }): Promise<ApiResponse<{ user: ApiUser; token: string }>> {
    return this.request<{ user: ApiUser; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request<ApiUser>('/api/auth/me');
  }

  async getProfile() {
    return this.request<ApiUser>('/api/user/profile');
  }

  async getProducts(params?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    size?: string;
    featured?: boolean;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = `/api/products${queryString ? `?${queryString}` : ''}`;

    return this.request(endpoint);
  }

  async getProduct(id: string) {
    return this.request(`/api/products/${id}`);
  }

  async createOrder(data: {
    items: Array<{
      productId: string;
      name: string;
      price: number;
      quantity: number;
      size?: string;
      color?: string;
      image: string;
    }>;
    address: {
      firstName: string;
      lastName: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      phone: string;
    };
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    paymentMethod?: string;
    paymentReference?: string;
    notes?: string;
  }): Promise<ApiResponse<ApiOrder>> {
    return this.request<ApiOrder>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyPaystackPayment(reference: string): Promise<ApiResponse<{ verified: boolean; reference: string }>> {
      return this.request<{ verified: boolean; reference: string }>('/api/paystack/verify', {
      method: 'POST',
      body: JSON.stringify({ reference }),
    });
  }

  async getOrders(): Promise<ApiResponse<ApiOrder[]>> {
    return this.request<ApiOrder[]>('/api/orders');
  }

  async getOrder(id: string): Promise<ApiResponse<ApiOrder>> {
    return this.request<ApiOrder>(`/api/orders/${id}`);
  }

  async updateProfile(data: UpdateProfileData): Promise<ApiResponse<ApiUser>> {
    return this.request<ApiUser>('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getAddresses(): Promise<ApiResponse<ApiAddress[]>> {
    return this.request<ApiAddress[]>('/api/user/addresses');
  }

  async createAddress(data: Omit<Address, 'id'>): Promise<ApiResponse<ApiAddress>> {
    const requestData = mapAddressToApi({ ...data, id: '' } as Address);
    return this.request<ApiAddress>('/api/user/addresses', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  async updateAddress(id: string, data: Partial<Address>): Promise<ApiResponse<ApiAddress>> {
    const requestData: Partial<Record<string, unknown>> = {};
    if (data.firstName !== undefined) requestData.firstName = data.firstName;
    if (data.lastName !== undefined) requestData.lastName = data.lastName;
    if (data.street !== undefined) requestData.address = data.street;
    if (data.city !== undefined) requestData.city = data.city;
    if (data.state !== undefined) requestData.state = data.state;
    if (data.postalCode !== undefined) requestData.zipCode = data.postalCode;
    if (data.country !== undefined) requestData.country = data.country;
    if (data.phone !== undefined) requestData.phone = data.phone;
    if (data.isDefault !== undefined) requestData.isDefault = data.isDefault;

    return this.request<ApiAddress>(`/api/user/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(requestData),
    });
  }

  async deleteAddress(id: string) {
    return this.request(`/api/user/addresses/${id}`, {
      method: 'DELETE',
    });
  }

  async createReview(productId: string, data: {
    rating: number;
    title?: string;
    comment: string;
  }) {
    return this.request(`/api/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getReviews(productId: string) {
    return this.request(`/api/products/${productId}/reviews`);
  }

  async getWishlist(): Promise<ApiResponse<unknown[]>> {
    return this.request<unknown[]>('/api/wishlist');
  }

  async addToWishlist(productId: string, productName?: string) {
    return this.request('/api/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId, productName }),
    });
  }

  async removeFromWishlist(productId: string) {
    return this.request(`/api/wishlist/${productId}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();