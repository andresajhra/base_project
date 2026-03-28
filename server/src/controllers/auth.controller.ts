import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { prisma } from '@/config/prisma';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '@/utils/jwt.utils';
import { jwtConfig } from '@/config/jwt.config';
import type { AuthResponse, AuthenticatedRequest } from '@/types';
import { sendError, sendSuccess } from '@/utils/response';

// ── helpers ───────────────────────────────────────────────────────────────────

// Hashear el refresh token antes de guardarlo en BD
// Si alguien accede a la BD no obtiene tokens válidos
const hashToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');

// Calcular fecha de expiración del refresh token
const refreshExpiresAt = () => {
  const ms = parseDurationToMs(jwtConfig.refreshExpiresIn || '7d');
  return new Date(Date.now() + ms);
};

const parseDurationToMs = (duration: string): number => {
  const unit = duration.slice(-1);
  const value = parseInt(duration.slice(0, -1));
  const units: Record<string, number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return value * (units[unit] ?? 86_400_000);
};

// ── register ──────────────────────────────────────────────────────────────────
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, nombre, username } = req.body;

    const exists = await prisma.usuario.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (exists) { sendError(res, 'Email or username already in use', 400); return; }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.usuario.create({
      data: { email, password: hashed, nombre, username },
    });

    const payload = { id: user.uuid, email: user.email, nombre: user.nombre };
    const refreshToken = generateRefreshToken(payload);

    await prisma.refreshToken.create({
      data: {
        token: hashToken(refreshToken),
        usuario_id: user.id,
        expires_at: refreshExpiresAt(),
      },
    });

    const response: AuthResponse = {
      token: generateToken(payload),
      refreshToken,
      usuario: { uuid: user.uuid, email: user.email, nombre: user.nombre },
    };

    sendSuccess(res, response, 201);
  } catch {
    sendError(res, 'Internal server error', 500);
  }
};

// ── login ─────────────────────────────────────────────────────────────────────
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, password } = req.body;

    const user = await prisma.usuario.findFirst({
      where: { OR: [{ email: identifier }, { username: identifier }] },
    });

    if (!user || !user.activo) { sendError(res, 'Invalid credentials', 401); return; }
    if (!(await bcrypt.compare(password, user.password))) {
      sendError(res, 'Invalid credentials', 401);
      return;
    }

    const payload = { id: user.uuid, email: user.email, nombre: user.nombre };
    const refreshToken = generateRefreshToken(payload);

    // Guardar refresh token hasheado en BD
    await prisma.refreshToken.create({
      data: {
        token: hashToken(refreshToken),
        usuario_id: user.id,
        expires_at: refreshExpiresAt(),
      },
    });

    const response: AuthResponse = {
      token: generateToken(payload),
      refreshToken,
      usuario: { uuid: user.uuid, email: user.email, nombre: user.nombre },
    };

    sendSuccess(res, response);
  } catch {
    sendError(res, 'Internal server error', 500);
  }
};

// ── refresh ───────────────────────────────────────────────────────────────────
export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) { sendError(res, 'No refresh token provided', 401); return; }

    // Verificar firma JWT
    const payload = verifyRefreshToken(refreshToken);

    // Verificar que el token existe en BD y no expiró
    const stored = await prisma.refreshToken.findUnique({
      where: { token: hashToken(refreshToken) },
      include: { usuario: true },
    });

    if (!stored || stored.expires_at < new Date()) {
      sendError(res, 'Invalid or expired refresh token', 401);
      return;
    }

    if (!stored.usuario.activo) {
      sendError(res, 'Usuario inactivo', 401);
      return;
    }

    // Rotation — eliminar el token usado y generar uno nuevo
    await prisma.refreshToken.delete({ where: { id: stored.id } });

    const newPayload = { id: stored.usuario.uuid, email: stored.usuario.email, nombre: stored.usuario.nombre };
    const newRefreshToken = generateRefreshToken(newPayload);

    await prisma.refreshToken.create({
      data: {
        token: hashToken(newRefreshToken),
        usuario_id: stored.usuario_id,
        expires_at: refreshExpiresAt(),
      },
    });

    sendSuccess(res, {
      token: generateToken(newPayload),
      refreshToken: newRefreshToken,
    });
  } catch {
    sendError(res, 'Invalid or expired refresh token', 401);
  }
};

// ── logout ────────────────────────────────────────────────────────────────────
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) { sendError(res, 'No refresh token provided', 400); return; }

    // Eliminar el refresh token de la BD — el access token expira solo (15m)
    await prisma.refreshToken.deleteMany({
      where: { token: hashToken(refreshToken) },
    });

    sendSuccess(res, { message: 'Logged out successfully' });
  } catch {
    sendError(res, 'Internal server error', 500);
  }
};

// ── logout all — cerrar todas las sesiones del usuario ───────────────────────
export const logoutAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) { sendError(res, 'No refresh token provided', 400); return; }

    const payload = verifyRefreshToken(refreshToken);
    const user = await prisma.usuario.findUnique({ where: { uuid: payload.id } });
    if (!user) { sendError(res, 'User not found', 404); return; }

    // Eliminar TODOS los refresh tokens del usuario
    await prisma.refreshToken.deleteMany({ where: { usuario_id: user.id } });

    sendSuccess(res, { message: 'All sessions closed' });
  } catch {
    sendError(res, 'Internal server error', 500);
  }
};

// ── me ────────────────────────────────────────────────────────────────────────
export const me = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.usuario.findUnique({
      where: { uuid: req.usuario.uuid },
      select: {
        uuid: true,
        nombre: true,
        username: true,
        email: true,
        activo: true,
        created_at: true,
        roles: {
          where: {
            desde: { lte: new Date() },
            OR: [{ hasta: null }, { hasta: { gte: new Date() } }],
          },
          select: {
            rol: { select: { uuid: true, nombre: true, is_superadmin: true } },
          },
        },
      },
    });

    if (!user) { sendError(res, 'User not found', 404); return; }

    sendSuccess(res, user);
  } catch {
    sendError(res, 'Internal server error', 500);
  }
};