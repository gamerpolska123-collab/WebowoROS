import { z } from 'zod';

export const RegisterDtoSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().min(9, 'Phone number too short').max(15, 'Phone number too long'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  firstName: z.string().min(1, 'First name required').max(50),
  lastName: z.string().min(1, 'Last name required').max(50),
});

export type RegisterDto = z.infer<typeof RegisterDtoSchema>;

export const LoginDtoSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password required'),
});

export type LoginDto = z.infer<typeof LoginDtoSchema>;

export const RefreshTokenDtoSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token required'),
});

export type RefreshTokenDto = z.infer<typeof RefreshTokenDtoSchema>;
