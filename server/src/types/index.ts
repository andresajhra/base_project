import { Request, Response, NextFunction } from 'express';

export type Controller = (req: Request, res: Response, next: NextFunction) => void | Promise<void>;

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface JwtPayload {
  id: number;
  email: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
  };
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}