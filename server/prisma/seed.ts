// import { PrismaClient } from '@/generated/prisma/client';
// import { PrismaClient } from "../src/generated/prisma/client";
import { prisma } from '../src/config/prisma';
import bcrypt from 'bcrypt';

// const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // ── 1. Rol SUPERADMIN ───────────────────────────────────────────────────────
  const rolSuperadmin = await prisma.rol.upsert({
    where: { nombre: 'SUPERADMIN' },
    update: {},
    create: {
      nombre: 'SUPERADMIN',
      descripcion: 'Acceso total al sistema — bypasea verificación de permisos',
      is_superadmin: true,
      activo: true,
    },
  });

  console.log(`✅ Rol creado: ${rolSuperadmin.nombre} (uuid: ${rolSuperadmin.uuid})`);

  // ── 2. Usuario admin ────────────────────────────────────────────────────────
  const passwordPlain = process.env.SEED_ADMIN_PASSWORD ?? 'Admin1234!';
  const passwordHash  = await bcrypt.hash(passwordPlain, 12);

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      nombre:   'Administrador',
      username: 'admin',
      email:    'admin@admin.com',
      password: passwordHash,
      activo:   true,
    },
  });

  console.log(`✅ Usuario creado: ${admin.username} (uuid: ${admin.uuid})`);

  // ── 3. Asignar rol SUPERADMIN al admin ──────────────────────────────────────
  await prisma.rolUsuario.upsert({
    where: {
      rol_id_usuario_id: {
        rol_id:     rolSuperadmin.id,
        usuario_id: admin.id,
      },
    },
    update: {},
    create: {
      rol_id:     rolSuperadmin.id,
      usuario_id: admin.id,
      desde:      new Date(),
      hasta:      null, // indefinido
    },
  });

  console.log(`✅ Rol SUPERADMIN asignado a ${admin.username}`);

  // ── 4. Módulos base del sistema ─────────────────────────────────────────────
  const modulos = [
    { nombre: 'Usuarios',  ruta_base: '/usuarios'  },
    { nombre: 'Roles',     ruta_base: '/roles'      },
    { nombre: 'Módulos',   ruta_base: '/modulos'    },
    { nombre: 'Permisos',  ruta_base: '/permisos'   },
  ];

  for (const mod of modulos) {
    await prisma.modulo.upsert({
      where:  { ruta_base: mod.ruta_base } as never,
      update: {},
      create: mod,
    });
  }

  console.log(`✅ Módulos base creados: ${modulos.map(m => m.nombre).join(', ')}`);

  console.log('\n🎉 Seed completado.');
  console.log('─────────────────────────────────────');
  console.log(`   Email:    admin@admin.com`);
  console.log(`   Username: admin`);
  console.log(`   Password: ${passwordPlain}`);
  console.log('─────────────────────────────────────');
  console.log('⚠️  Cambiá la contraseña después del primer login.\n');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });