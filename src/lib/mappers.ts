import { Address } from '@/types/user';

type ApiAddressShape = Record<string, unknown>;

type ApiUserShape = Record<string, unknown>;

/**
 * Maps our Address type to API Address format
 * Frontend uses: street, postalCode
 * Backend uses: address, zipCode
 */
export function mapAddressToApi(address: Address) {
  return {
    firstName: address.firstName,
    lastName: address.lastName,
    address: address.street, // Frontend 'street' -> API 'address'
    city: address.city,
    state: address.state,
    zipCode: address.postalCode, // Frontend 'postalCode' -> API 'zipCode'
    country: address.country,
    phone: address.phone,
    isDefault: address.isDefault,
  };
}

/**
 * Maps API Address to our Address type
 */
export function mapAddressFromApi(apiAddress: ApiAddressShape): Address {
  return {
    id: String(apiAddress.id),
    firstName: String(apiAddress.firstName),
    lastName: String(apiAddress.lastName),
    street: String(apiAddress.address), // API 'address' -> Frontend 'street'
    city: String(apiAddress.city),
    state: String(apiAddress.state),
    postalCode: String(apiAddress.zipCode), // API 'zipCode' -> Frontend 'postalCode'
    country: String(apiAddress.country),
    phone: String(apiAddress.phone),
    isDefault: Boolean(apiAddress.isDefault),
  };
}

/**
 * Maps API User to our User type
 */
export function mapUserFromApi(apiUser: ApiUserShape) {
  return {
    id: String(apiUser.id),
    email: String(apiUser.email),
    name: `${String(apiUser.firstName || '')} ${String(apiUser.lastName || '')}`.trim(),
    avatar: undefined, // Add if API provides avatar
    phone: apiUser.phone ? String(apiUser.phone) : undefined,
    createdAt: String(apiUser.createdAt),
  };
}