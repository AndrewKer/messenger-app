import jwt, { SignOptions } from 'jsonwebtoken';
import { AUTH_CONFIG } from '@/lib/authConfig';

export interface JwtPayload {
  username: string;
  role: string;
  [key: string]: string | number | boolean;
}

export const generateToken = (payload: JwtPayload): string => {
  const signOptions: SignOptions = {
    expiresIn: AUTH_CONFIG.JWT_EXPIRES_IN,
  };

  return jwt.sign(payload, AUTH_CONFIG.JWT_SECRET, signOptions);
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, AUTH_CONFIG.JWT_SECRET, {
      algorithms: ['HS256'],
    });
    return decoded as JwtPayload;
  } catch (error) {
    return null;
  }
};

export const validateToken = (token: string): boolean => {
  return verifyToken(token) !== null;
};