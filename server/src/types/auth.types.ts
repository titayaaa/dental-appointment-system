import { Role } from '@prisma/client';
import { Request } from 'express';

export interface AuthUserPayload {
  id: string;
  email: string;
  fullName: string;
  role: Role;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}
