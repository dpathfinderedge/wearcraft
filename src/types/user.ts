export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  createdAt: string;
  role?: 'CUSTOMER' | 'ADMIN';
}

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

export interface ApiAddress {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  role?: 'CUSTOMER' | 'ADMIN';
  addresses?: ApiAddress[];
}

export interface UserProfile extends User {
  firstName: string;
  lastName: string;
  phone?: string;
  addresses: Address[];
}

export interface UpdateProfileData {
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignupData extends AuthCredentials {
  name: string;
  phone?: string;
}