// // User Types
// export interface User {
//   id: string;
//   email: string;
//   name: string;
//   createdAt: string;
// }

// // API User Response (from backend)
// export interface ApiUser {
//   id: string;
//   email: string;
//   firstName: string;
//   lastName: string;
//   phone?: string;
//   createdAt: string;
//   updatedAt?: string;
//   addresses?: ApiAddress[];
// }

// // Address Types
// export interface Address {
//   id: string;
//   firstName: string;
//   lastName: string;
//   address: string;
//   city: string;
//   state: string;
//   zipCode: string;
//   country: string;
//   phone: string;
//   isDefault: boolean;
// }

// // API Address Response
// export interface ApiAddress {
//   id: string;
//   userId: string;
//   firstName: string;
//   lastName: string;
//   address: string;
//   city: string;
//   state: string;
//   zipCode: string;
//   country: string;
//   phone: string;
//   isDefault: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

// // Auth Credentials
// export interface AuthCredentials {
//   email: string;
//   password: string;
// }

// // Signup Data
// export interface SignupData {
//   name: string;
//   email: string;
//   password: string;
//   phone?: string;
// }

// // API Signup Data (matches backend)
// export interface ApiSignupData {
//   email: string;
//   password: string;
//   firstName: string;
//   lastName: string;
//   phone?: string;
// }


export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  createdAt: string;
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