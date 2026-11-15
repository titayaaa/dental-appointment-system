import jwt from 'jsonwebtoken';
import { AuthUserPayload } from '../types/auth.types';

const JWT_SECRET = process.env.JWT_SECRET || 'smilesync-dev-secret-key-change-in-prod';
const JWT_EXPIRES_IN = '24h';

export function generateToken(payload: AuthUserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): AuthUserPayload {
  return jwt.verify(token, JWT_SECRET) as AuthUserPayload;
}
