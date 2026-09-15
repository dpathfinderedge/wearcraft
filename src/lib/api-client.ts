import { Address, ApiAddress, ApiUser, UpdateProfileData } from '@/types/user';
import { ApiOrder } from '@/types/order';
import { mapAddressToApi } from '@/lib/mappers';
import { ProductReview, ReviewSummary } from '@/types/review';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AdminReview {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  verified: boolean;
  published: boolean;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
  product: { name: string };
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | null;
  category: 'mens' | 'womens' | 'unisex' | 'accessories';
  images: string[];
  sizes: string[];
  colors: string[];
  material: string | null;
  care: string | null;
  featured: boolean;
  inStock: boolean;
  stockCount: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  _count: { reviews: number; wishlist: number };
}

export type AdminProductInput = Omit<AdminProduct, 'id' | 'rating' | 'reviewCount' | 'createdAt' | 'updatedAt' | '_count'>;

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
    productName?: string;
    rating: number;
    title: string;
    comment: string;
  }): Promise<ApiResponse<ProductReview>> {
    return this.request<ProductReview>(`/api/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getReviews(productId: string, productName?: string): Promise<ApiResponse<{
    reviews: ProductReview[];
    summary: ReviewSummary;
  }>> {
    const query = productName ? `?name=${encodeURIComponent(productName)}` : '';
    return this.request(`/api/products/${productId}/reviews${query}`);
  }

  async getAdminReviews(): Promise<ApiResponse<AdminReview[]>> {
    return this.request<AdminReview[]>('/api/admin/reviews');
  }

  async moderateReview(id: string, published: boolean): Promise<ApiResponse<AdminReview>> {
    return this.request<AdminReview>(`/api/admin/reviews/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ published }),
    });
  }

  async deleteReview(id: string): Promise<ApiResponse<{ id: string }>> {
    return this.request<{ id: string }>(`/api/admin/reviews/${id}`, {
      method: 'DELETE',
    });
  }

  async getAdminProducts(): Promise<ApiResponse<AdminProduct[]>> {
    return this.request<AdminProduct[]>('/api/admin/products');
  }

  async createAdminProduct(data: AdminProductInput): Promise<ApiResponse<AdminProduct>> {
    return this.request<AdminProduct>('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdminProduct(id: string, data: Partial<AdminProductInput>): Promise<ApiResponse<AdminProduct>> {
    return this.request<AdminProduct>(`/api/admin/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAdminProduct(id: string): Promise<ApiResponse<{ id: string }>> {
    return this.request<{ id: string }>(`/api/admin/products/${id}`, {
      method: 'DELETE',
    });
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