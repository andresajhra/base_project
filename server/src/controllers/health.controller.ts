import { Request, Response } from 'express';
import { sendSuccess } from '../utils/response';

export const healthCheck = (_req: Request, res: Response): void => {
  sendSuccess(res, { status: 'ok', uptime: process.uptime() });
};

export const healtchCheckProtected = (_req: Request, res: Response): void => {
  sendSuccess(res, { status: 'ok', uptime: process.uptime(), protected: true });
}
