import { Router, IRouter } from 'express';
import { register, login, refresh, me } from '@/controllers/auth.controller';
import { auth } from '@/middlewares/auth';

const router: IRouter = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/me', auth, me);

export default router;