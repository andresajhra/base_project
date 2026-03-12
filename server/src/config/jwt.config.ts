import { env } from "@/config/env";

export const jwtConfig = {
  secret: env.JWT_SECRET as string,
  expiresIn: env.JWT_EXPIRES_IN || '7d',
  refreshSecret: env.JWT_REFRESH_SECRET as string,
  refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN || '30d',
};