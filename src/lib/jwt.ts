import jwt from 'jsonwebtoken';
import { UserRole } from './auth';

const JWT_SECRET = (process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production') as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as any);
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    // Validate token format
    if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
      console.error('JWT verification failed: Invalid token format');
      return null;
    }
    
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    console.error('JWT decode failed:', error);
    return null;
  }
}
