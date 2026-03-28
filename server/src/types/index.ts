import { Request, Response, NextFunction } from 'express';
import type { Usuario } from '@/generated/prisma/client';

export type Controller = (req: Request, res: Response, next: NextFunction) => void | Promise<void>;

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface JwtPayload {
  id: string;    // uuid del usuario (nunca el id interno)
  email: string;
  nombre: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  usuario: {
    uuid: string;
    email: string;
    nombre: string;
  };
}

// AuthenticatedRequest — usar en handlers protegidos por auth()
// No usar declare global para evitar conflictos de tipos con Express router
export interface AuthenticatedRequest extends Request {
  usuario: Usuario;
}

// Permite usar AuthenticatedRequest en Express router sin errores de tipo.
// Usar así en las rutas:
//   router.post('/', auth, can(...), wrap(controller.create));
export const wrap = (
  fn: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>
) => (req: Request, res: Response, next: NextFunction) => fn(req as AuthenticatedRequest, res, next);