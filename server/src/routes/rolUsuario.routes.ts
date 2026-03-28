// ─── rolUsuario.routes.ts ─────────────────────────────────────────────────────
import { IRouter, Router } from 'express';
import * as rolUsuarioController from '@/controllers/rolUsuario.controller';
import { auth } from '@/middlewares/auth';
import { can } from '@/middlewares/can';
import { wrap } from '@/types';

const router: IRouter = Router();

router.post('/',          auth, can('create', 'roles'), wrap(rolUsuarioController.assign));
router.patch('/:uuid',    auth, can('update', 'roles'), wrap(rolUsuarioController.update));
router.delete('/:uuid',   auth, can('delete', 'roles'), rolUsuarioController.revoke);

export default router;
