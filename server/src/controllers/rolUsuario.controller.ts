import { Request, Response } from 'express';
import { prisma } from '@/config/prisma';
import { sendError, sendSuccess } from '@/utils/response';
import { AuthenticatedRequest } from '@/types';
import { invalidarCache } from '@/middlewares/can';

// ── POST /rol-usuario  — asignar rol a usuario ────────────────────────────────
export const assign = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { usuario_uuid, rol_uuid, desde, hasta } = req.body;

    // Resolver uuids → ids internos
    const usuario = await prisma.usuario.findUnique({ where: { uuid: usuario_uuid } });
    if (!usuario) { sendError(res, 'Usuario not found', 404); return; }

    const rol = await prisma.rol.findUnique({ where: { uuid: rol_uuid } });
    if (!rol) { sendError(res, 'Rol not found', 404); return; }

    const rolUsuario = await prisma.rolUsuario.create({
      data: {
        usuario_id: usuario.id,
        rol_id: rol.id,
        desde: desde ? new Date(desde) : new Date(),
        hasta: hasta ? new Date(hasta) : null,
      },
      select: {
        uuid: true,
        desde: true,
        hasta: true,
        rol: { select: { uuid: true, nombre: true } },
        usuario: { select: { uuid: true, nombre: true, email: true } },
      },
    });

    // Invalidar cache de permisos del usuario
    invalidarCache(usuario.id);

    sendSuccess(res, rolUsuario, 201);
  } catch {
    sendError(res, 'Internal server error', 500);
  }
};

// ── PATCH /rol-usuario/:uuid  — actualizar vigencia ──────────────────────────
export const update = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { desde, hasta } = req.body;

    const exists = await prisma.rolUsuario.findUnique({ where: { uuid: req.params.uuid } });
    if (!exists) { sendError(res, 'RolUsuario not found', 404); return; }

    const rolUsuario = await prisma.rolUsuario.update({
      where: { uuid: req.params.uuid },
      data: {
        ...(desde && { desde: new Date(desde) }),
        ...(hasta !== undefined && { hasta: hasta ? new Date(hasta) : null }),
      },
      select: {
        uuid: true,
        desde: true,
        hasta: true,
        rol: { select: { uuid: true, nombre: true } },
        usuario: { select: { uuid: true, nombre: true } },
      },
    });

    // Invalidar cache del usuario afectado
    invalidarCache(exists.usuario_id);

    sendSuccess(res, rolUsuario);
  } catch {
    sendError(res, 'Internal server error', 500);
  }
};

// ── DELETE /rol-usuario/:uuid  — revocar rol ──────────────────────────────────
export const revoke = async (_req: Request, res: Response): Promise<void> => {
  try {
    const exists = await prisma.rolUsuario.findUnique({ where: { uuid: _req.params.uuid } });
    if (!exists) { sendError(res, 'RolUsuario not found', 404); return; }

    await prisma.rolUsuario.delete({ where: { uuid: _req.params.uuid } });

    // Invalidar cache del usuario afectado
    invalidarCache(exists.usuario_id);

    sendSuccess(res, { message: 'Rol revoked from usuario' });
  } catch {
    sendError(res, 'Internal server error', 500);
  }
};
