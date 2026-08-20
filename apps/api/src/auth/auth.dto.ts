import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ─── Zod Schemas (runtime validation) ───

export const RegisterDtoSchema = z.object({
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(9, 'Phone number too short').max(15, 'Phone number too long'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  firstName: z.string().min(1, 'First name required').max(50),
  lastName: z.string().min(1, 'Last name required').max(50),
});

export type RegisterDto = z.infer<typeof RegisterDtoSchema>;

export const LoginDtoSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().min(9).max(15).optional(),
  password: z.string().min(1, 'Password required'),
}).refine((data) => data.email || data.phone, {
  message: 'Either email or phone is required',
  path: ['email'],
});

export type LoginDto = z.infer<typeof LoginDtoSchema>;

export const PhoneLoginDtoSchema = z.object({
  phone: z.string().min(9, 'Phone number too short').max(15, 'Phone number too long'),
  password: z.string().min(1, 'Password required'),
});

export type PhoneLoginDto = z.infer<typeof PhoneLoginDtoSchema>;

export const SendSmsCodeDtoSchema = z.object({
  phone: z.string().min(9, 'Phone number too short').max(15, 'Phone number too long'),
});

export type SendSmsCodeDto = z.infer<typeof SendSmsCodeDtoSchema>;

export const VerifySmsCodeDtoSchema = z.object({
  phone: z.string().min(9, 'Phone number too short').max(15, 'Phone number too long'),
  code: z.string().length(4, 'Code must be 4 digits'),
});

export type VerifySmsCodeDto = z.infer<typeof VerifySmsCodeDtoSchema>;

export const SetPasswordDtoSchema = z.object({
  phone: z.string().min(9, 'Phone number too short').max(15, 'Phone number too long'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  confirmPassword: z.string().min(8, 'Confirm password required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type SetPasswordDto = z.infer<typeof SetPasswordDtoSchema>;

export const RefreshTokenDtoSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token required'),
});

export type RefreshTokenDto = z.infer<typeof RefreshTokenDtoSchema>;

// ─── Swagger DTO Classes (documentation only) ───

export class RegisterDtoClass {
  @ApiPropertyOptional({ example: 'user@example.com', description: 'User email address (optional for customers)' })
  email?: string;

  @ApiProperty({ example: '+48123456789', description: 'Phone number (required)' })
  phone!: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'Password (min 8 chars)', minLength: 8 })
  password!: string;

  @ApiProperty({ example: 'Jan', description: 'First name' })
  firstName!: string;

  @ApiProperty({ example: 'Kowalski', description: 'Last name' })
  lastName!: string;
}

export class LoginDtoClass {
  @ApiPropertyOptional({ example: 'user@example.com', description: 'User email address' })
  email?: string;

  @ApiPropertyOptional({ example: '+48123456789', description: 'Phone number' })
  phone?: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'Password' })
  password!: string;
}

export class PhoneLoginDtoClass {
  @ApiProperty({ example: '+48123456789', description: 'Phone number' })
  phone!: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'Password' })
  password!: string;
}

export class SendSmsCodeDtoClass {
  @ApiProperty({ example: '+48123456789', description: 'Phone number to send SMS code to' })
  phone!: string;
}

export class VerifySmsCodeDtoClass {
  @ApiProperty({ example: '+48123456789', description: 'Phone number' })
  phone!: string;

  @ApiProperty({ example: '5555', description: '4-digit SMS verification code' })
  code!: string;
}

export class SetPasswordDtoClass {
  @ApiProperty({ example: '+48123456789', description: 'Phone number' })
  phone!: string;

  @ApiProperty({ example: 'NewPass123!', description: 'New password (min 8 chars)', minLength: 8 })
  password!: string;

  @ApiProperty({ example: 'NewPass123!', description: 'Confirm password', minLength: 8 })
  confirmPassword!: string;
}

export class RefreshTokenDtoClass {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...', description: 'Refresh token' })
  refreshToken!: string;
}

export class CsrfResponseDto {
  @ApiProperty({ example: 'a1b2c3d4e5f6...', description: 'CSRF token for state-changing requests' })
  csrfToken!: string;
}

export class AuthUserResponseDto {
  @ApiProperty({ example: 'clz123abc' })
  id!: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  email?: string;

  @ApiProperty({ example: '+48123456789' })
  phone!: string;

  @ApiProperty({ example: 'Jan' })
  firstName!: string;

  @ApiProperty({ example: 'Kowalski' })
  lastName!: string;

  @ApiProperty({ example: 'customer', enum: ['guest', 'customer', 'admin', 'kitchen', 'driver'] })
  role!: string;

  @ApiProperty({ example: false, description: 'Whether phone has been verified via SMS' })
  isPhoneVerified!: boolean;
}

export class RegisterResponseDto {
  @ApiProperty({ type: AuthUserResponseDto })
  user!: AuthUserResponseDto;

  @ApiProperty({ example: 'Registration successful' })
  message!: string;
}

export class LoginResponseDto {
  @ApiProperty({ type: AuthUserResponseDto })
  user!: AuthUserResponseDto;
}

export class MessageResponseDto {
  @ApiProperty({ example: 'Operation successful' })
  message!: string;
}

export class SmsCodeResponseDto {
  @ApiProperty({ example: 'SMS code sent successfully' })
  message!: string;

  @ApiProperty({ example: '5555', description: 'Demo code — in production this is sent via SMS' })
  demoCode?: string;
}

export class VerifyCodeResponseDto {
  @ApiProperty({ example: true, description: 'Whether the code is valid' })
  valid!: boolean;

  @ApiProperty({ example: 'Phone verified successfully' })
  message!: string;

  @ApiProperty({ example: false, description: 'Whether user already has a password set' })
  hasPassword!: boolean;
}
