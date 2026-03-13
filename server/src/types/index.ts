import { Request, Response, NextFunction } from 'express';
import type { Usuario } from '@/generated/prisma/client';

export type Controller = (req: Request, res: Response, next: NextFunction) => void | Promise<void>;

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface JwtPayload {
  id: number;
  email: string;
  nombre: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  usuario: {
    id: number;
    email: string;
    nombre: string;
  };
}

declare global {
  namespace Express {
    interface Request {
      usuario?: JwtPayload;
    }
    interface Request {
      Usuario?: Usuario;
    }
  }
}




export type AuthenticatedRequest = Express.Request & {
  usuario: Usuario;   // non-optional — only use after auth middleware
};