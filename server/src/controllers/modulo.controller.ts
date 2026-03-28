import { Request, Response } from 'express';
import { prisma } from '@/config/prisma';
import { sendError, sendSuccess } from '@/utils/response';

// ── GET /modulos ──────────────────────────────────────────────────────────────
export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const modulos = await prisma.modulo.findMany({
      select: {
        uuid: true,
        nombre: true,
        ruta_base: true,
        permisos: {
          where: { activo: true },
          select: { uuid: true, accion: true, recurso: true, activo: true },
        },
      },
    });

    sendSuccess(res, modulos);
  } catch {
    sendError(res, 'Internal server error', 500);
  }
};

// ── GET /modulos/:uuid ────────────────────────────────────────────────────────
export const getOne = async (req: Request, res: Response): Promise<void> => {
  try {
    const modulo = await prisma.modulo.findUnique({
      where: { uuid: req.params.uuid },
      select: {
        uuid: true,
        nombre: true,
        ruta_base: true,
        permisos: {
          select: { uuid: true, accion: true, recurso: true, activo: true },
        },
      },
    });

    if (!modulo) {
      sendError(res, 'Modulo not found', 404);
      return;
    }

    sendSuccess(res, modulo);
  } catch {
    sendError(res, 'Internal server error', 500);
  }
};

// ── POST /modulos ─────────────────────────────────────────────────────────────
export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, ruta_base } = req.body;

    const modulo = await prisma.modulo.create({
      data: { nombre, ruta_base },
      select: { uuid: true, nombre: true, ruta_base: true },
    });

    sendSuccess(res, modulo, 201);
  } catch {
    sendError(res, 'Internal server error', 500);
  }
};

// ── PATCH /modulos/:uuid ──────────────────────────────────────────────────────
export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, ruta_base } = req.body;

    const exists = await prisma.modulo.findUnique({ where: { uuid: req.params.uuid } });
    if (!exists) {
      sendError(res, 'Modulo not found', 404);
      return;
    }

    const modulo = await prisma.modulo.update({
      where: { uuid: req.params.uuid },
      data: {
        ...(nombre && { nombre }),
        ...(ruta_base && { ruta_base }),
      },
      select: { uuid: true, nombre: true, ruta_base: true },
    });

    sendSuccess(res, modulo);
  } catch {
    sendError(res, 'Internal server error', 500);
  }
};

// ── DELETE /modulos/:uuid ─────────────────────────────────────────────────────
export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    const exists = await prisma.modulo.findUnique({ where: { uuid: req.params.uuid } });
    if (!exists) {
      sendError(res, 'Modulo not found', 404);
      return;
    }

    // Hard delete — los módulos no tienen soft delete en el schema
    await prisma.modulo.delete({ where: { uuid: req.params.uuid } });

    sendSuccess(res, { message: 'Modulo deleted' });
  } catch {
    sendError(res, 'Internal server error', 500);
  }
};
