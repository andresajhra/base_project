// ─── rol.routes.ts ────────────────────────────────────────────────────────────
import { IRouter, Router } from 'express';
import * as rolController from '@/controllers/rol.controller';
import { auth } from '@/middlewares/auth';
import { can } from '@/middlewares/can';
import { wrap } from '@/types';

const router: IRouter = Router();

router.get('/',           auth, can('read',   'roles'), rolController.getAll);
router.get('/:uuid',      auth, can('read',   'roles'), rolController.getOne);
router.post('/',          auth, can('create', 'roles'), wrap(rolController.create));
router.patch('/:uuid',    auth, can('update', 'roles'), rolController.update);
router.delete('/:uuid',   auth, can('delete', 'roles'), rolController.remove);

export default router;
