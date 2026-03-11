import { Request, Response, NextFunction } from 'express';

export type Controller = (req: Request, res: Response, next: NextFunction) => void | Promise<void>;

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}
