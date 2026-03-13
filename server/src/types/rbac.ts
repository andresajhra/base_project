import { Prisma } from '@/generated/prisma/client';

// v7 — Prisma.validator signature no longer takes a generic type parameter
// before: Prisma.validator<Prisma.RolUsuarioDefaultArgs>()({ ... })
// after:  Prisma.validator('RolUsuario', 'default', 'strict')({ ... })

const rolUsuarioInclude = {
  include: {
    rol: {
      include: {
        permisos: {
          include: {
            permiso: true,
          },
        },
      },
    },
  },
} satisfies Prisma.RolUsuarioDefaultArgs; 

export type RolUsuarioWithPermisos = Prisma.RolUsuarioGetPayload<
  typeof rolUsuarioInclude
>;

export type RolWithPermisos = NonNullable<RolUsuarioWithPermisos['rol']>;
export type RolPermiso      = RolWithPermisos['permisos'][number];
export type Permiso         = RolPermiso['permiso'];

export type Accion    = 'create' | 'read' | 'update' | 'delete';
export type PermisoKey = `${Accion}:${string}`;