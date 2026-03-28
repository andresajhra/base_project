import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '@/config/prisma';
import type { JwtPayload } from '@/types';

export const auth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Token requerido' });
    return;
  }

  try {
    // El JWT transporta uuid, nunca el id interno
    const { id: uuid } = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    const usuario = await prisma.usuario.findUnique({
      where: { uuid },
    });

    if (!usuario || !usuario.activo) {
      res.status(401).json({ error: 'Usuario inactivo o no existe' });
      return;
    }

    req.usuario = usuario;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};
