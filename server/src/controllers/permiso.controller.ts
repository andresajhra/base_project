import { Request, Response } from 'express';
import { prisma } from '@/config/prisma';
import { sendError, sendSuccess } from '@/utils/response';

// ── GET /permisos ─────────────────────────────────────────────────────────────
export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const permisos = await prisma.permiso.findMany({
      where: { activo: true },
      select: {
        uuid: true,
        accion: true,
        recurso: true,
        activo: true,
        modulo: { select: { uuid: true, nombre: true, ruta_base: true } },
      },
    });

    sendSuccess(res, permisos);
  } catch {
    sendError(res, 'Internal server error', 500);
  }
};

// ── GET /permisos/:uuid ───────────────────────────────────────────────────────
export const getOne = async (req: Request, res: Response): Promise<void> => {
  try {
    const permiso = await prisma.permiso.findUnique({
      where: { uuid: req.params.uuid },
      select: {
        uuid: true,
        accion: true,
        recurso: true,
        activo: true,
        modulo: { select: { uuid: true, nombre: true, ruta_base: true } },
      },
    });

    if (!permiso) {
      sendError(res, 'Permiso not found', 404);
      return;
    }

    sendSuccess(res, permiso);
  } catch {
    sendError(res, 'Internal server error', 500);
  }
};

// ── POST /permisos ────────────────────────────────────────────────────────────
export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { modulo_uuid, accion, recurso } = req.body;

    // Resolver modulo_uuid → id interno
    const modulo = await prisma.modulo.findUnique({ where: { uuid: modulo_uuid } });
    if (!modulo) {
      sendError(res, 'Modulo not found', 404);
      return;
    }

    const permiso = await prisma.permiso.create({
      data: { modulo_id: modulo.id, accion, recurso },
      select: {
        uuid: true,
        accion: true,
        recurso: true,
        activo: true,
        modulo: { select: { uuid: true, nombre: true } },
      },
    });

    sendSuccess(res, permiso, 201);
  } catch {
    sendError(res, 'Internal server error', 500);
  }
};

// ── PATCH /permisos/:uuid ─────────────────────────────────────────────────────
export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const { accion, recurso, activo } = req.body;

    const exists = await prisma.permiso.findUnique({ where: { uuid: req.params.uuid } });
    if (!exists) {
      sendError(res, 'Permiso not found', 404);
      return;
    }

    const permiso = await prisma.permiso.update({
      where: { uuid: req.params.uuid },
      data: {
        ...(accion && { accion }),
        ...(recurso && { recurso }),
        ...(activo !== undefined && { activo }),
      },
      select: { uuid: true, accion: true, recurso: true, activo: true },
    });

    sendSuccess(res, permiso);
  } catch {
    sendError(res, 'Internal server error', 500);
  }
};

// ── DELETE /permisos/:uuid ────────────────────────────────────────────────────
export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    const exists = await prisma.permiso.findUnique({ where: { uuid: req.params.uuid } });
    if (!exists) {
      sendError(res, 'Permiso not found', 404);
      return;
    }

    // Soft delete — desactivar en lugar de eliminar
    await prisma.permiso.update({
      where: { uuid: req.params.uuid },
      data: { activo: false },
    });

    sendSuccess(res, { message: 'Permiso deactivated' });
  } catch {
    sendError(res, 'Internal server error', 500);
  }
};
