import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '@/config/prisma';

import {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '@/utils/jwt.utils';

import { AuthResponse } from '@/types';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      res.status(400).json({ error: 'Email already in use' });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed },
    });

    const payload = { id: user.id, email: user.email };
    const response: AuthResponse = {
      token: generateToken(payload),
      refreshToken: generateRefreshToken(payload),
      user: { id: user.id, email: user.email },
    };

    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const payload = { id: user.id, email: user.email };
    const response: AuthResponse = {
      token: generateToken(payload),
      refreshToken: generateRefreshToken(payload),
      user: { id: user.id, email: user.email },
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(401).json({ error: 'No refresh token provided' });
      return;
    }

    const payload = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    const newPayload = { id: user.id, email: user.email };
    res.json({
      token: generateToken(newPayload),
      refreshToken: generateRefreshToken(newPayload),
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
};

export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, createdAt: true },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};