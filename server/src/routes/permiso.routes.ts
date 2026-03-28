// ─── permiso.routes.ts ────────────────────────────────────────────────────────
import { IRouter, Router } from 'express';
import * as permisoController from '@/controllers/permiso.controller';
import { auth } from '@/middlewares/auth';
import { can } from '@/middlewares/can';

const router: IRouter = Router();

router.get('/',           auth, can('read',   'permisos'), permisoController.getAll);
router.get('/:uuid',      auth, can('read',   'permisos'), permisoController.getOne);
router.post('/',          auth, can('create', 'permisos'), permisoController.create);
router.patch('/:uuid',    auth, can('update', 'permisos'), permisoController.update);
router.delete('/:uuid',   auth, can('delete', 'permisos'), permisoController.remove);

export default router;
