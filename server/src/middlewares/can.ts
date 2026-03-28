import type { Request, Response, NextFunction } from 'express';
import { prisma } from '@/config/prisma';
import type { Accion, PermisoKey, RolUsuarioWithPermisos } from '@/types/rbac';
import { AuthenticatedRequest } from '@/types';

// ── cache ─────────────────────────────────────────────────────────────────────

interface CacheEntry {
  permisos: Set<PermisoKey>;
  exp: number;
}

const cache = new Map<number, CacheEntry>();
const TTL_MS = 60_000;

const buildPermisoKey = (accion: string, recurso: string): PermisoKey =>
  `${accion}:${recurso}` as PermisoKey;

// v7 — optional chaining on .rol is mandatory, relation can be null
const extractPermisos = (roles: RolUsuarioWithPermisos[]): Set<PermisoKey> =>
  new Set(
    roles.flatMap(ru =>
      (ru.rol?.permisos ?? [])
        .filter(rp => rp.permiso.activo)
        .map(rp => buildPermisoKey(rp.permiso.accion, rp.permiso.recurso))
    )
  );

const getPermisosUsuario = async (usuarioId: number): Promise<Set<PermisoKey>> => {
  const cached = cache.get(usuarioId);
  if (cached && cached.exp > Date.now()) return cached.permisos;

  const now = new Date();

  // v7 — omitUser filter on rol moved to where on the join table side
  // filtering by rol.activo inside include.where is removed in v7
  // use a nested where on the scalar field via relation filter instead
  const roles = await prisma.rolUsuario.findMany({
    where: {
      usuario_id: usuarioId,
      desde: { lte: now },
      OR: [{ hasta: null }, { hasta: { gte: now } }],
      rol: { activo: true },   // ← v7: relation filter moved to top-level where
    },
    include: {
      rol: {
        include: {
          permisos: {
            include: { permiso: true },   // no where on singular relation
          },
        },
      },
    },
  });

  const permisos = extractPermisos(roles);
  cache.set(usuarioId, { permisos, exp: Date.now() + TTL_MS });
  return permisos;
};

export const invalidarCache = (usuarioId: number): void => {
  cache.delete(usuarioId);
};

// ── middleware ─────────────────────────────────────────────────────────────────

export const can = (accion: Accion, recurso: string) =>
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {

    if (!req.usuario) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    const permisos = await getPermisosUsuario(req.usuario.id);
    const key = buildPermisoKey(accion, recurso);

    if (!permisos.has(key)) {
      res.status(403).json({ error: 'Sin permiso', required: key });
      return;
    }

    next();
  };