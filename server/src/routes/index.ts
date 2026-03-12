import { Router, IRouter } from 'express';
import healthRouter from './health.routes';
import authRouter from './auth.routes';
const router: IRouter = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);

// Add your routes here:
// router.use('/users', usersRouter);

export default router;
