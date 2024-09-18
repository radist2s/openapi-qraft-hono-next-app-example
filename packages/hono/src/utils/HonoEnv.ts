import { Env } from "hono";
import { type Knex } from "knex";

export interface HonoEnv extends Env {
  Variables: {
    /**
     * JWT payload will be shared across all middlewares and routers per request
     * Populated by the `jwtAuthMiddleware`
     */
    jwtPayload: JWTPayload;
    /**
     * Database connection will be shared across all middlewares and routers per request
     */
    db: Knex;
  };
  Bindings: {
    DB_FILE_PATH?: string;
    ACCESS_TOKEN_COOKIE_SECURE?: string;
    ACCESS_TOKEN_COOKIE_SAME_SITE?: string;
    ACCESS_TOKEN_COOKIE_ALLOWED_ORIGINS?: string;
    JWT_TTL?: string;
    JWT_SECRET?: string;
  };
}

export type JWTPayload = {
  sub: string;
  role: "admin";
  exp: number;
  inCookie: boolean;
};
