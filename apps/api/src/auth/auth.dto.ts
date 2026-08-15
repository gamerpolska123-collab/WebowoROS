import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ─── Zod Schemas (runtime validation) ───

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

// ─── Swagger DTO Classes (documentation only) ───

export class RegisterDtoClass {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  email: string;

  @ApiProperty({ example: '+48123456789', description: 'Phone number' })
  phone: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'Password (min 8 chars)', minLength: 8 })
  password: string;

  @ApiProperty({ example: 'Jan', description: 'First name' })
  firstName: string;

  @ApiProperty({ example: 'Kowalski', description: 'Last name' })
  lastName: string;
}

export class LoginDtoClass {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  email: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'Password' })
  password: string;
}

export class RefreshTokenDtoClass {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...', description: 'Refresh token' })
  refreshToken: string;
}

export class CsrfResponseDto {
  @ApiProperty({ example: 'a1b2c3d4e5f6...', description: 'CSRF token for state-changing requests' })
  csrfToken: string;
}

export class AuthUserResponseDto {
  @ApiProperty({ example: 'clz123abc' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'Jan' })
  firstName: string;

  @ApiProperty({ example: 'Kowalski' })
  lastName: string;

  @ApiProperty({ example: 'customer', enum: ['customer', 'admin', 'kitchen', 'driver'] })
  role: string;
}

export class RegisterResponseDto {
  @ApiProperty({ type: AuthUserResponseDto })
  user: AuthUserResponseDto;

  @ApiProperty({ example: 'Registration successful' })
  message: string;
}

export class LoginResponseDto {
  @ApiProperty({ type: AuthUserResponseDto })
  user: AuthUserResponseDto;
}

export class MessageResponseDto {
  @ApiProperty({ example: 'Operation successful' })
  message: string;
}
