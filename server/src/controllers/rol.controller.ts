import { Request, Response } from 'express';
import { prisma } from '@/config/prisma';
import { sendError, sendSuccess } from '@/utils/response';
import { AuthenticatedRequest } from '@/types';

// ── GET /roles ────────────────────────────────────────────────────────────────
export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const roles = await prisma.rol.findMany({
      where: { activo: true },
      select: {
        uuid: true,
        nombre: true,
        descripcion: true,
        activo: true,
        parent: { select: { uuid: true, nombre: true } },
        permisos: {
          select: {
            permiso: {
              select: { uuid: true, accion: true, recurso: true, modulo: { select: { uuid: true, nombre: true } } },
            },
          },
        },
      },
    });

    sendSuccess(res, roles);
  } catch {
    sendError(res, 'Internal server error', 500);
  }
};

// ── GET /roles/:uuid ──────────────────────────────────────────────────────────
export const getOne = async (req: Request, res: Response): Promise<void> => {
  try {
    const rol = await prisma.rol.findUnique({
      where: { uuid: req.params.uuid },
      select: {
        uuid: true,
        nombre: true,
        descripcion: true,
        activo: true,
        parent: { select: { uuid: true, nombre: true } },
        hijos: { select: { uuid: true, nombre: true } },
        permisos: {
          select: {
            permiso: {
              select: { uuid: true, accion: true, recurso: true, modulo: { select: { uuid: true, nombre: true } } },
            },
          },
        },
      },
    });

    if (!rol) {
      sendError(res, 'Rol not found', 404);
      return;
    }

    sendSuccess(res, rol);
  } catch {
    sendError(res, 'Internal server error', 500);
  }
};

// ── POST /roles ───────────────────────────────────────────────────────────────
export const create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { nombre, descripcion, parent_uuid } = req.body;

    // Resolver parent_uuid → id interno
    let parent_rol_id: number | undefined;
    if (parent_uuid) {
      const parent = await prisma.rol.findUnique({ where: { uuid: parent_uuid } });
      if (!parent) {
        sendError(res, 'Parent rol not found', 404);
        return;
      }
      parent_rol_id = parent.id;
    }

    const rol = await prisma.rol.create({
      data: { nombre, descripcion, parent_rol_id },
      select: { uuid: true, nombre: true, descripcion: true, activo: true },
    });

    sendSuccess(res, rol, 201);
  } catch {
    sendError(res, 'Internal server error', 500);
  }
};

// ── PATCH /roles/:uuid ────────────────────────────────────────────────────────
export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, descripcion, activo, parent_uuid } = req.body;

    const exists = await prisma.rol.findUnique({ where: { uuid: req.params.uuid } });
    if (!exists) {
      sendError(res, 'Rol not found', 404);
      return;
    }

    let parent_rol_id: number | null | undefined;
    if (parent_uuid !== undefined) {
      if (parent_uuid === null) {
        parent_rol_id = null; // quitar herencia
      } else {
        const parent = await prisma.rol.findUnique({ where: { uuid: parent_uuid } });
        if (!parent) {
          sendError(res, 'Parent rol not found', 404);
          return;
        }
        parent_rol_id = parent.id;
      }
    }

    const rol = await prisma.rol.update({
      where: { uuid: req.params.uuid },
      data: {
        ...(nombre && { nombre }),
        ...(descripcion !== undefined && { descripcion }),
        ...(activo !== undefined && { activo }),
        ...(parent_rol_id !== undefined && { parent_rol_id }),
      },
      select: { uuid: true, nombre: true, descripcion: true, activo: true },
    });

    sendSuccess(res, rol);
  } catch {
    sendError(res, 'Internal server error', 500);
  }
};

// ── DELETE /roles/:uuid ───────────────────────────────────────────────────────
export const remove = async (_req: Request, res: Response): Promise<void> => {
  try {
    const exists = await prisma.rol.findUnique({ where: { uuid: _req.params.uuid } });
    if (!exists) {
      sendError(res, 'Rol not found', 404);
      return;
    }

    // Soft delete — desactivar en lugar de eliminar
    await prisma.rol.update({
      where: { uuid: _req.params.uuid },
      data: { activo: false },
    });

    sendSuccess(res, { message: 'Rol deactivated' });
  } catch {
    sendError(res, 'Internal server error', 500);
  }
};
