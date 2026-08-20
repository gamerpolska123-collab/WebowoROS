import { Request } from 'express';

export interface RequestWithUser extends Request {
  user?: {
    sub?: string;    // z JWT payload
    id?: string;     // z CurrentUser decorator lub innych źródeł
    email?: string;
    role?: string;
  };
}
