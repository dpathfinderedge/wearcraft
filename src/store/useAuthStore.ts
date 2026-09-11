import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Address, ApiAddress, AuthCredentials, SignupData, UpdateProfileData } from '@/types/user';
import { apiClient } from '@/lib/api-client';
import { mapUserFromApi, mapAddressFromApi } from '@/lib/mappers';

interface AuthStore {
  user: User | null;
  addresses: Address[];
  isAuthenticated: boolean;
  hasHydrated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: AuthCredentials) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  // Load addresses from the backend (useful to refresh on-demand)
  loadAddresses: () => Promise<{ success: boolean; error?: string } | void>;
  updateProfile: (profile: UpdateProfileData) => Promise<{ success: boolean; error?: string }>;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
  
  // Address management
  addAddress: (address: Omit<Address, 'id'> & { isDefault?: boolean }) => Promise<{ success: boolean; error?: string }>;
  updateAddress: (addressId: string, address: Partial<Address>) => Promise<{ success: boolean; error?: string }>;
  removeAddress: (addressId: string) => Promise<{ success: boolean; error?: string }>;
  setDefaultAddress: (addressId: string) => Promise<{ success: boolean; error?: string }>;
  getDefaultAddress: () => Address | null;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      addresses: [],
      isAuthenticated: false,
      hasHydrated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.login({
            email: credentials.email,
            password: credentials.password,
          });

          if (response.success && response.data) {
            const { user } = response.data;
            const mappedUser = mapUserFromApi(user);
            const addresses = user.addresses?.map(mapAddressFromApi) || [];

            set({
              user: mappedUser,
              addresses,
              isAuthenticated: true,
              isLoading: false,
            });

            return { success: true };
          }

          set({ isLoading: false, error: response.error || 'Login failed' });
          return { success: false, error: response.error || 'Login failed' };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      signup: async (data) => {
        set({ isLoading: true, error: null });

        try {
          const nameParts = data.name.trim().split(' ');
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(' ') || nameParts[0];

          const response = await apiClient.signup({
            email: data.email,
            password: data.password,
            firstName,
            lastName,
            phone: data.phone,
          });

          if (response.success && response.data) {
            const { user } = response.data;
            const mappedUser = mapUserFromApi(user);

            set({
              user: mappedUser,
              addresses: [],
              isAuthenticated: true,
              isLoading: false,
            });

            return { success: true };
          }

          set({ isLoading: false, error: response.error || 'Signup failed' });
          return { success: false, error: response.error || 'Signup failed' };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Signup failed';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      logout: async () => {
        set({ isLoading: true });

        try {
          await apiClient.logout();

          set({
            user: null,
            addresses: [],
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });

          if (typeof window !== 'undefined') {
            localStorage.removeItem('wearcraft-cart-storage');
          }
        } catch {
          set({
            user: null,
            addresses: [],
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      checkAuth: async () => {
        set({ isLoading: true, error: null });
 
        try {
          const response = await apiClient.getCurrentUser();
 
          if (response.success && response.data) {
            const user = response.data;
            const mappedUser = mapUserFromApi(user);
            const addresses = user.addresses?.map(mapAddressFromApi) || [];
 
            set({
              user: mappedUser,
              addresses,
              isAuthenticated: true,
              isLoading: false,
            });
            return;
          }
 
          set({
            user: null,
            addresses: [],
            isAuthenticated: false,
            isLoading: false,
          });
        } catch {
          set({
            user: null,
            addresses: [],
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      // Fetch addresses from backend and update store (useful for on-demand refresh)
      loadAddresses: async () => {
        set({ isLoading: true, error: null });
        try {
          const resp = await apiClient.getAddresses();
          if (resp.success && resp.data) {
            const mapped = (resp.data || []).map(mapAddressFromApi);
            set({ addresses: mapped, isLoading: false });
            return { success: true };
          }
          set({ isLoading: false, error: resp.error || 'Failed to load addresses' });
          return { success: false, error: resp.error || 'Failed to load addresses' };
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load addresses';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },
 
      updateProfile: async (profile) => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.updateProfile(profile);

          if (response.success && response.data) {
            const user = response.data;
            const mappedUser = mapUserFromApi(user);

            set({ user: mappedUser, isLoading: false });
            return { success: true };
          }

          set({ isLoading: false, error: response.error || 'Failed to update profile' });
          return { success: false, error: response.error || 'Failed to update profile' };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      clearError: () => {
        set({ error: null });
      },

      addAddress: async (address) => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.createAddress({
            ...address,
            id: '',
          } as Address);

          if (response.success && response.data) {
            const newAddress = mapAddressFromApi(response.data as ApiAddress);
            set((state) => ({
              addresses: [newAddress, ...state.addresses],
              isLoading: false,
            }));
            return { success: true };
          }

          set({ isLoading: false, error: response.error || 'Failed to save address' });
          return { success: false, error: response.error || 'Failed to save address' };
        } catch (_error) {
          const errorMessage = _error instanceof Error ? _error.message : 'Failed to save address';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      updateAddress: async (addressId, addressData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.updateAddress(addressId, addressData as Address);

          if (response.success && response.data) {
            const updatedAddress = mapAddressFromApi(response.data as ApiAddress);
            set((state) => ({
              addresses: state.addresses.map((addr) =>
                addr.id === addressId ? updatedAddress : addr
              ),
              isLoading: false,
            }));
            return { success: true };
          }

          set({ isLoading: false, error: response.error || 'Failed to update address' });
          return { success: false, error: response.error || 'Failed to update address' };
        } catch (_error) {
          const errorMessage = _error instanceof Error ? _error.message : 'Failed to update address';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      removeAddress: async (addressId) => {
        set({ isLoading: true, error: null });

        try {
          if (addressId.startsWith('temp-')) {
            set((state) => ({
              addresses: state.addresses.filter((addr) => addr.id !== addressId),
              isLoading: false,
            }));
            return { success: true };
          }

          const response = await apiClient.deleteAddress(addressId);

          if (response.success) {
            set((state) => {
              const remainingAddresses = state.addresses.filter((addr) => addr.id !== addressId);
              if (remainingAddresses.length > 0 && !remainingAddresses.some((addr) => addr.isDefault)) {
                remainingAddresses[0].isDefault = true;
              }
              return { addresses: remainingAddresses, isLoading: false };
            });
            return { success: true };
          }

          set({ isLoading: false, error: response.error || 'Failed to delete address' });
          return { success: false, error: response.error || 'Failed to delete address' };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete address';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      setDefaultAddress: async (addressId) => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.updateAddress(addressId, { isDefault: true } as Partial<Address>);

          if (response.success && response.data) {
            set((state) => ({
              addresses: state.addresses.map((addr) => ({
                ...addr,
                isDefault: addr.id === addressId,
              })),
              isLoading: false,
            }));
            return { success: true };
          }

          set({ isLoading: false, error: response.error || 'Failed to set default address' });
          return { success: false, error: response.error || 'Failed to set default address' };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to set default address';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      getDefaultAddress: () => {
        return get().addresses.find((addr) => addr.isDefault) || null;
      },
    }),
    {
      name: 'wearcraft-auth-storage',
      // Don't persist isLoading or error
      partialize: (state) => ({
        user: state.user,
        addresses: state.addresses,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ hasHydrated: true });
      },
    }
  )
);


// From Here

// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';
// import { User, Address, AuthCredentials, SignupData } from '@/types/user';
// import { generateId } from '@/lib/utils';

// interface AuthStore {
//   user: User | null;
//   addresses: Address[];
//   isAuthenticated: boolean;
  
//   // Actions
//   login: (credentials: AuthCredentials) => Promise<{ success: boolean; error?: string }>;
//   signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
//   logout: () => void;
//   updateUser: (userData: Partial<User>) => void;
  
//   // Address management
//   addAddress: (address: Omit<Address, 'id'>) => void;
//   updateAddress: (addressId: string, address: Partial<Address>) => void;
//   removeAddress: (addressId: string) => void;
//   setDefaultAddress: (addressId: string) => void;
//   getDefaultAddress: () => Address | null;
// }

// export const useAuthStore = create<AuthStore>()(
//   persist(
//     (set, get) => ({
//       user: null,
//       addresses: [],
//       isAuthenticated: false,

//       login: async (credentials) => {
//         // Simulate API call
//         await new Promise((resolve) => setTimeout(resolve, 1000));

//         // Mock validation - in production, this would call your backend
//         if (!credentials.email || !credentials.password) {
//           return { success: false, error: 'Email and password are required' };
//         }

//         if (credentials.password.length < 6) {
//           return { success: false, error: 'Invalid email or password' };
//         }

//         // Mock successful login
//         const mockUser: User = {
//           id: generateId(),
//           email: credentials.email,
//           name: credentials.email.split('@')[0],
//           createdAt: new Date().toISOString(),
//         };

//         set({ user: mockUser, isAuthenticated: true });
//         return { success: true };
//       },

//       signup: async (data) => {
//         // Simulate API call
//         await new Promise((resolve) => setTimeout(resolve, 1000));

//         // Mock validation
//         if (!data.name || !data.email || !data.password) {
//           return { success: false, error: 'All fields are required' };
//         }

//         if (data.password.length < 6) {
//           return { success: false, error: 'Password must be at least 6 characters' };
//         }

//         // Mock successful signup
//         const mockUser: User = {
//           id: generateId(),
//           email: data.email,
//           name: data.name,
//           createdAt: new Date().toISOString(),
//         };

//         set({ user: mockUser, isAuthenticated: true });
//         return { success: true };
//       },

//       logout: () => {
//         set({ user: null, addresses: [], isAuthenticated: false });
//         // Also clear cart on logout
//         if (typeof window !== 'undefined') {
//           localStorage.removeItem('wearcraft-cart-storage');
//         }
//       },

//       updateUser: (userData) => {
//         set((state) => ({
//           user: state.user ? { ...state.user, ...userData } : null,
//         }));
//       },

//       addAddress: (address) => {
//         const newAddress: Address = {
//           ...address,
//           id: generateId(),
//           isDefault: get().addresses.length === 0, // First address is default
//         };

//         set((state) => ({
//           addresses: [...state.addresses, newAddress],
//         }));
//       },

//       updateAddress: (addressId, addressData) => {
//         set((state) => ({
//           addresses: state.addresses.map((addr) =>
//             addr.id === addressId ? { ...addr, ...addressData } : addr
//           ),
//         }));
//       },

//       removeAddress: (addressId) => {
//         set((state) => {
//           const remainingAddresses = state.addresses.filter(
//             (addr) => addr.id !== addressId
//           );

//           // If we removed the default address, make the first one default
//           if (remainingAddresses.length > 0 && !remainingAddresses.some(a => a.isDefault)) {
//             remainingAddresses[0].isDefault = true;
//           }

//           return { addresses: remainingAddresses };
//         });
//       },

//       setDefaultAddress: (addressId) => {
//         set((state) => ({
//           addresses: state.addresses.map((addr) => ({
//             ...addr,
//             isDefault: addr.id === addressId,
//           })),
//         }));
//       },

//       getDefaultAddress: () => {
//         return get().addresses.find((addr) => addr.isDefault) || null;
//       },
//     }),
//     {
//       name: 'wearcraft-auth-storage',
//     }
//   )
// );