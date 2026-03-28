// ─── modulo.routes.ts ─────────────────────────────────────────────────────────
import { IRouter, Router } from 'express';
import * as moduloController from '@/controllers/modulo.controller';
import { auth } from '@/middlewares/auth';
import { can } from '@/middlewares/can';

const router: IRouter = Router();

router.get('/',           auth, can('read',   'modulos'), moduloController.getAll);
router.get('/:uuid',      auth, can('read',   'modulos'), moduloController.getOne);
router.post('/',          auth, can('create', 'modulos'), moduloController.create);
router.patch('/:uuid',    auth, can('update', 'modulos'), moduloController.update);
router.delete('/:uuid',   auth, can('delete', 'modulos'), moduloController.remove);

export default router;
