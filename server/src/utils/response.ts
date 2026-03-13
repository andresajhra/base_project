import { Response } from 'express';
import { ApiResponse } from '@/types';

export const sendSuccess = <T>(res: Response, data: T, status = 200): Response => {
  const body: ApiResponse<T> = { success: true, data };
  return res.status(status).json(body);
};

export const sendError = (res: Response, message: string, status = 500): Response => {
  const body: ApiResponse = { success: false, message };
  return res.status(status).json(body);
};
