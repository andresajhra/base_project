/*
  Warnings:

  - The `created_by` column on the `foo` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updated_by` column on the `foo` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deleted_by` column on the `foo` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `created_by` column on the `usuario` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `deleted_by` column on the `usuario` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updated_by` column on the `usuario` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[uuid]` on the table `foo` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `modulo` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `permiso` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `rol` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `rol_permiso` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `rol_usuario` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "foo" ADD COLUMN     "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "created_by",
ADD COLUMN     "created_by" UUID,
DROP COLUMN "updated_by",
ADD COLUMN     "updated_by" UUID,
DROP COLUMN "deleted_by",
ADD COLUMN     "deleted_by" UUID;

-- AlterTable
ALTER TABLE "modulo" ADD COLUMN     "uuid" UUID NOT NULL DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "permiso" ADD COLUMN     "uuid" UUID NOT NULL DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "rol" ADD COLUMN     "uuid" UUID NOT NULL DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "rol_permiso" ADD COLUMN     "uuid" UUID NOT NULL DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "rol_usuario" ADD COLUMN     "uuid" UUID NOT NULL DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "usuario" ADD COLUMN     "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "created_by",
ADD COLUMN     "created_by" UUID,
DROP COLUMN "deleted_by",
ADD COLUMN     "deleted_by" UUID,
DROP COLUMN "updated_by",
ADD COLUMN     "updated_by" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "foo_uuid_key" ON "foo"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "modulo_uuid_key" ON "modulo"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "permiso_uuid_key" ON "permiso"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "rol_uuid_key" ON "rol"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "rol_permiso_uuid_key" ON "rol_permiso"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "rol_usuario_uuid_key" ON "rol_usuario"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_uuid_key" ON "usuario"("uuid");
