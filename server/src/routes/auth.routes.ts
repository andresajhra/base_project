import { IRouter, Router } from 'express';
import * as authController from '@/controllers/auth.controller';
import { auth } from '@/middlewares/auth';
import { wrap } from '@/types';
 
const router: IRouter = Router();
 
router.post('/register',    authController.register);
router.post('/login',       authController.login);
router.post('/refresh',     authController.refresh);
router.post('/logout',      authController.logout);
router.post('/logout-all',  authController.logoutAll);
router.get('/me',           auth, wrap(authController.me));
 
export default router;
 