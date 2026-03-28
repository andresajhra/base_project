import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '@/config/prisma';

import {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '@/utils/jwt.utils';

import { AuthResponse, AuthenticatedRequest } from '@/types';
import { sendError, sendSuccess } from '@/utils/response';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, nombre, username } = req.body;
    const exists = await prisma.usuario.findUnique({ where: { email } });
    if (exists) {
      sendError(res, 'Email already in use', 400);
      return;
    }
    
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.usuario.create({
      data: { email, password: hashed, nombre, username },
    });
    
    console.log('Registering user:', { email, nombre, username });
    // JWT transporta uuid, nunca el id interno
    const payload = { id: user.uuid, email: user.email, nombre: user.nombre };
    const response: AuthResponse = {
      token: generateToken(payload),
      refreshToken: generateRefreshToken(payload),
      usuario: { uuid: user.uuid, email: user.email, nombre: user.nombre },
    };

    sendSuccess(res, response, 201);
  } catch (error) {
    sendError(res, 'Internal server error', 500);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, password } = req.body; // identifier = email o username

    const user = await prisma.usuario.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
        ],
      },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      sendError(res, 'Invalid credentials', 401);
      return;
    }

    // JWT transporta uuid, nunca el id interno
    const payload = { id: user.uuid, email: user.email, nombre: user.nombre };
    const response: AuthResponse = {
      token: generateToken(payload),
      refreshToken: generateRefreshToken(payload),
      usuario: { uuid: user.uuid, email: user.email, nombre: user.nombre },
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

    // payload.id es uuid (string)
    const payload = verifyRefreshToken(refreshToken);
    const user = await prisma.usuario.findUnique({ where: { uuid: payload.id } });

    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    const newPayload = { id: user.uuid, email: user.email, nombre: user.nombre };
    sendSuccess(res, {
      token: generateToken(newPayload),
      refreshToken: generateRefreshToken(newPayload),
    });
  } catch (error) {
    sendError(res, 'Invalid or expired refresh token', 401);
  }
};

export const me = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // req.usuario ya tiene el objeto completo (lo setea auth middleware)
    // solo seleccionamos los campos públicos para la respuesta
    const user = await prisma.usuario.findUnique({
      where: { uuid: req.usuario.uuid },
      select: { uuid: true, nombre: true, email: true, created_at: true },
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