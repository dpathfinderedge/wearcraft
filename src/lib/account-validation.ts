import { z } from 'zod';

export const profileUpdateSchema = z.object({
  firstName: z.string().trim().min(2, 'First name must be at least 2 characters').max(100),
  lastName: z.string().trim().min(2, 'Last name must be at least 2 characters').max(100),
  phone: z.string().trim().max(40).optional().refine(
    (phone) => phone === undefined || phone.length === 0 || phone.length >= 7,
    'Phone number must be at least 7 characters'
  ),
}).strict();

const addressFields = {
  firstName: z.string().trim().min(2, 'First name must be at least 2 characters').max(100),
  lastName: z.string().trim().min(2, 'Last name must be at least 2 characters').max(100),
  address: z.string().trim().min(5, 'Address is required').max(300),
  city: z.string().trim().min(2, 'City is required').max(100),
  state: z.string().trim().min(2, 'State is required').max(100),
  zipCode: z.string().trim().min(3, 'Postal code is required').max(30),
  country: z.string().trim().min(2, 'Country is required').max(100),
  phone: z.string().trim().min(7, 'Phone number is required').max(40),
  isDefault: z.boolean().optional(),
};

export const addressCreateSchema = z.object(addressFields).strict();

export const addressUpdateSchema = z.object({
  ...addressFields,
}).partial().strict().refine(
  (address) => Object.values(address).some((value) => value !== undefined),
  { message: 'At least one address field must be provided' }
);
