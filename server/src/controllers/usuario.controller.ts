import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '@/config/prisma';
import { sendError, sendSuccess } from '@/utils/response';
import { AuthenticatedRequest } from '@/types';

// ── GET /usuarios ─────────────────────────────────────────────────────────────
export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const usuarios = await prisma.usuario.findMany({
      where: { deleted_at: null },
      select: {
        uuid: true,
        nombre: true,
        username: true,
        email: true,
        activo: true,
        created_at: true,
        updated_at: true,
        roles: {
          where: {
            desde: { lte: new Date() },
            OR: [{ hasta: null }, { hasta: { gte: new Date() } }],
          },
          select: {
            desde: true,
            hasta: true,
            rol: { select: { uuid: true, nombre: true } },
          },
        },
      },
    });

    sendSuccess(res, usuarios);
  } catch {
    sendError(res, 'Internal server error', 500);
  }
};

// ── GET /usuarios/:uuid ───────────────────────────────────────────────────────
export const getOne = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { uuid: req.params.uuid, deleted_at: null },
      select: {
        uuid: true,
        nombre: true,
        username: true,
        email: true,
        activo: true,
        created_at: true,
        updated_at: true,
        roles: {
          select: {
            desde: true,
            hasta: true,
            rol: { select: { uuid: true, nombre: true, descripcion: true } },
          },
        },
      },
    });

    if (!usuario) {
      sendError(res, 'Usuario not found', 404);
      return;
    }

    sendSuccess(res, usuario);
  } catch {
    sendError(res, 'Internal server error', 500);
  }
};

// ── POST /usuarios ────────────────────────────────────────────────────────────
export const create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { nombre, username, email, password } = req.body;

    const exists = await prisma.usuario.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (exists) {
      sendError(res, 'Email or username already in use', 400);
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        username,
        email,
        password: hashed,
        created_by: req.usuario.uuid,
      },
      select: { uuid: true, nombre: true, username: true, email: true, activo: true, created_at: true },
    });

    sendSuccess(res, usuario, 201);
  } catch {
    sendError(res, 'Internal server error', 500);
  }
};

// ── PATCH /usuarios/:uuid ─────────────────────────────────────────────────────
export const update = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { nombre, username, email, activo } = req.body;

    const exists = await prisma.usuario.findUnique({
      where: { uuid: req.params.uuid, deleted_at: null },
    });

    if (!exists) {
      sendError(res, 'Usuario not found', 404);
      return;
    }

    const usuario = await prisma.usuario.update({
      where: { uuid: req.params.uuid },
      data: {
        ...(nombre && { nombre }),
        ...(username && { username }),
        ...(email && { email }),
        ...(activo !== undefined && { activo }),
        updated_by: req.usuario.uuid,
      },
      select: { uuid: true, nombre: true, username: true, email: true, activo: true, updated_at: true },
    });

    sendSuccess(res, usuario);
  } catch {
    sendError(res, 'Internal server error', 500);
  }
};

// ── DELETE /usuarios/:uuid  (soft delete) ─────────────────────────────────────
export const remove = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const exists = await prisma.usuario.findUnique({
      where: { uuid: req.params.uuid, deleted_at: null },
    });

    if (!exists) {
      sendError(res, 'Usuario not found', 404);
      return;
    }

    await prisma.usuario.update({
      where: { uuid: req.params.uuid },
      data: {
        deleted_at: new Date(),
        deleted_by: req.usuario.uuid,
        activo: false,
      },
    });

    sendSuccess(res, { message: 'Usuario deleted' });
  } catch {
    sendError(res, 'Internal server error', 500);
  }
};
