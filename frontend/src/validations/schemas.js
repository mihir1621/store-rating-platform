import { z } from 'zod';

const passwordRegexUpper = /[A-Z]/;
const passwordRegexSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

export const signupSchema = z.object({
  name: z.string()
    .min(20, 'Name must be at least 20 characters')
    .max(60, 'Name must not exceed 60 characters'),
  email: z.string()
    .email('Enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(16, 'Password must not exceed 16 characters')
    .refine(val => passwordRegexUpper.test(val), 'Password must contain at least one uppercase letter')
    .refine(val => passwordRegexSpecial.test(val), 'Password must contain at least one special character'),
  address: z.string()
    .min(1, 'Address is required')
    .max(400, 'Address must not exceed 400 characters'),
});

export const createUserSchema = signupSchema.extend({
  role: z.enum(['admin', 'user', 'owner'], {
    errorMap: () => ({ message: 'Role must be admin, user, or owner' })
  }),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'New password must be at least 8 characters')
    .max(16, 'New password must not exceed 16 characters')
    .refine(val => passwordRegexUpper.test(val), 'New password must contain at least one uppercase letter')
    .refine(val => passwordRegexSpecial.test(val), 'New password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const storeSchema = z.object({
  name: z.string().min(1, 'Store name is required').max(60, 'Store name must not exceed 60 characters'),
  email: z.string().email('Enter a valid store email'),
  address: z.string().min(1, 'Store address is required').max(400, 'Address must not exceed 400 characters'),
  ownerId: z.string().optional().nullable(),
});
