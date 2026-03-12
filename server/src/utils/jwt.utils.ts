import jwt, { SignOptions } from 'jsonwebtoken';
import { jwtConfig } from '@/config/jwt.config';
import { JwtPayload } from '@/types';

const signOptions = (expiresIn: string): SignOptions => ({
  expiresIn: expiresIn as SignOptions['expiresIn'],
});

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, jwtConfig.secret, signOptions(jwtConfig.expiresIn));
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, jwtConfig.refreshSecret, signOptions(jwtConfig.refreshExpiresIn));
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, jwtConfig.secret) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, jwtConfig.refreshSecret) as JwtPayload;
};