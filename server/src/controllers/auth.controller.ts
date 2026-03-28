import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '@/config/prisma';

import {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '@/utils/jwt.utils';

import { AuthResponse } from '@/types';
import { sendError, sendSuccess } from '@/utils/response';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, nombre } = req.body;

    const exists = await prisma.usuario.findUnique({ where: { email } });
    if (exists) {
      sendError(res, 'Email already in use', 400);
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.usuario.create({
      data: { email, password: hashed, nombre },
    });

    const payload = { id: user.id, email: user.email, nombre: user.nombre };
    const response: AuthResponse = {
      token: generateToken(payload),
      refreshToken: generateRefreshToken(payload),
      usuario: { id: user.id, email: user.email, nombre: user.nombre },
    };

    sendSuccess(res, response, 201);
  } catch (error) {
    sendError(res, 'Internal server error', 500);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.usuario.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      sendError(res, 'Invalid credentials', 401);
      return;
    }

    const payload = { id: user.id, email: user.email, nombre: user.nombre };
    const response: AuthResponse = {
      token: generateToken(payload),
      refreshToken: generateRefreshToken(payload),
      usuario: { id: user.id, email: user.email, nombre: user.nombre },
    };

    sendSuccess(res, response);
  } catch (error) {
    sendError(res, 'Internal server error', 500);
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      sendError(res, 'No refresh token provided', 401);
      return;
    }

    const payload = verifyRefreshToken(refreshToken);
    const user = await prisma.usuario.findUnique({ where: { id: payload.id } });

    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    const newPayload = { id: user.id, email: user.email, nombre: user.nombre };
    sendSuccess(res, {
      token: generateToken(newPayload),
      refreshToken: generateRefreshToken(newPayload),
    });
  } catch (error) {
    sendError(res, 'Invalid or expired refresh token', 401);
  }
};

export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.usuario.findUnique({
      where: { id: req.usuario!.id },
      select: { id: true, email: true, created_at: true },
    });

    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    sendSuccess(res, user);
  } catch (error) {
    sendError(res, 'Internal server error', 500);
  }
};