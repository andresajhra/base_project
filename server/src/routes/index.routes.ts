import { Router, IRouter } from 'express';
import healthRouter from './health.routes';
import authRouter from './auth.routes';
import usuarioRouter from './usuario.routes';
import rolRouter from './rol.routes';
import moduloRouter from './modulo.routes';
import permisoRouter from './permiso.routes';
import rolUsuarioRouter from './rolUsuario.routes';
import rolPermisoRouter from './rolPermiso.routes';

const router: IRouter = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/usuarios', usuarioRouter);
router.use('/roles', rolRouter);
router.use('/modulos', moduloRouter);
router.use('/permisos', permisoRouter);
router.use('/rol-usuario', rolUsuarioRouter);
router.use('/rol-permiso', rolPermisoRouter);

export default router;
