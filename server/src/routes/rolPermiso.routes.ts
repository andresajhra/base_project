// ─── rolPermiso.routes.ts ─────────────────────────────────────────────────────
import { IRouter, Router } from 'express';
import * as rolPermisoController from '@/controllers/rolPermiso.controller';
import { auth } from '@/middlewares/auth';
import { can } from '@/middlewares/can';

const router: IRouter = Router();

router.get('/rol/:uuid', auth, can('read', 'permisos'), rolPermisoController.getByRol);
router.post('/', auth, can('create', 'permisos'), rolPermisoController.assign);
router.delete('/:uuid', auth, can('delete', 'permisos'), rolPermisoController.revoke);

export default router;
