import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { prisma } from '@/config/prisma';
import type { Accion, PermisoKey, RolUsuarioWithPermisos } from '@/types/rbac';
import type { AuthenticatedRequest } from '@/types';

// ── cache ─────────────────────────────────────────────────────────────────────

interface CacheEntry {
  permisos: Set<PermisoKey>;
  is_superadmin: boolean;
  exp: number;
}

const cache = new Map<number, CacheEntry>();
const TTL_MS = 60_000;

const buildPermisoKey = (accion: string, recurso: string): PermisoKey =>
  `${accion}:${recurso}` as PermisoKey;

const extractPermisos = (roles: RolUsuarioWithPermisos[]): Set<PermisoKey> =>
  new Set(
    roles.flatMap(ru =>
      (ru.rol?.permisos ?? [])
        .filter(rp => rp.permiso.activo)
        .map(rp => buildPermisoKey(rp.permiso.accion, rp.permiso.recurso))
    )
  );

const getPermisosUsuario = async (usuarioId: number) => {
  const cached = cache.get(usuarioId);
  if (cached && cached.exp > Date.now()) return cached;

  const now = new Date();

  const roles = await prisma.rolUsuario.findMany({
    where: {
      usuario_id: usuarioId,
      desde: { lte: now },
      OR: [{ hasta: null }, { hasta: { gte: now } }],
      rol: { activo: true },
    },
    include: {
      rol: {
        include: {
          permisos: { include: { permiso: true } },
        },
      },
    },
  });

  const is_superadmin = roles.some(ru => ru.rol?.is_superadmin === true);
  const permisos = extractPermisos(roles);
  const entry = { permisos, is_superadmin, exp: Date.now() + TTL_MS };
  cache.set(usuarioId, entry);
  return entry;
};

export const invalidarCache = (usuarioId: number): void => {
  cache.delete(usuarioId);
};

// ── middleware ────────────────────────────────────────────────────────────────

export const can = (accion: Accion, recurso: string): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { usuario } = req as AuthenticatedRequest;

    if (!usuario) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    const { permisos, is_superadmin } = await getPermisosUsuario(usuario.id);

    if (is_superadmin) { next(); return; }

    const key = buildPermisoKey(accion, recurso);
    if (!permisos.has(key)) {
      res.status(403).json({ error: 'Sin permiso', required: key });
      return;
    }

    next();
  };