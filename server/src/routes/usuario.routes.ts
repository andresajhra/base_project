// ─── usuario.routes.ts ────────────────────────────────────────────────────────
import { Router, IRouter } from 'express';
import * as usuarioController from '@/controllers/usuario.controller';
import { auth } from '@/middlewares/auth';
import { can } from '@/middlewares/can';
import { wrap } from '@/types';

const router: IRouter = Router();

router.get('/',           auth, can('read',   'usuarios'), usuarioController.getAll);
router.get('/:uuid',      auth, can('read',   'usuarios'), usuarioController.getOne);
router.post('/',          auth, can('create', 'usuarios'), wrap(usuarioController.create));
router.patch('/:uuid',    auth, can('update', 'usuarios'), wrap(usuarioController.update));
router.delete('/:uuid',   auth, can('delete', 'usuarios'), wrap(usuarioController.remove));

export default router;
