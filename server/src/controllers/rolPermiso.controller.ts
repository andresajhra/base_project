import { Request, Response } from 'express';
import { prisma } from '@/config/prisma';
import { sendError, sendSuccess } from '@/utils/response';

// ── POST /rol-permiso  — asignar permiso a rol ────────────────────────────────
export const assign = async (req: Request, res: Response): Promise<void> => {
  try {
    const { rol_uuid, permiso_uuid } = req.body;

    // Resolver uuids → ids internos
    const rol = await prisma.rol.findUnique({ where: { uuid: rol_uuid } });
    if (!rol) { sendError(res, 'Rol not found', 404); return; }

    const permiso = await prisma.permiso.findUnique({ where: { uuid: permiso_uuid } });
    if (!permiso) { sendError(res, 'Permiso not found', 404); return; }

    const rolPermiso = await prisma.rolPermiso.create({
      data: { rol_id: rol.id, permiso_id: permiso.id },
      select: {
        uuid: true,
        granted_at: true,
        rol: { select: { uuid: true, nombre: true } },
        permiso: { select: { uuid: true, accion: true, recurso: true } },
      },
    });

    sendSuccess(res, rolPermiso, 201);
  } catch {
    sendError(res, 'Internal server error', 500);
  }
};

// ── DELETE /rol-permiso/:uuid  — revocar permiso de rol ──────────────────────
export const revoke = async (req: Request, res: Response): Promise<void> => {
  try {
    const exists = await prisma.rolPermiso.findUnique({ where: { uuid: req.params.uuid } });
    if (!exists) { sendError(res, 'RolPermiso not found', 404); return; }

    await prisma.rolPermiso.delete({ where: { uuid: req.params.uuid } });

    sendSuccess(res, { message: 'Permiso revoked from rol' });
  } catch {
    sendError(res, 'Internal server error', 500);
  }
};

// ── GET /rol-permiso/rol/:uuid  — ver permisos de un rol ─────────────────────
export const getByRol = async (req: Request, res: Response): Promise<void> => {
  try {
    const rol = await prisma.rol.findUnique({ where: { uuid: req.params.uuid } });
    if (!rol) { sendError(res, 'Rol not found', 404); return; }

    const permisos = await prisma.rolPermiso.findMany({
      where: { rol_id: rol.id },
      select: {
        uuid: true,
        granted_at: true,
        permiso: {
          select: {
            uuid: true,
            accion: true,
            recurso: true,
            activo: true,
            modulo: { select: { uuid: true, nombre: true } },
          },
        },
      },
    });

    sendSuccess(res, permisos);
  } catch {
    sendError(res, 'Internal server error', 500);
  }
};
