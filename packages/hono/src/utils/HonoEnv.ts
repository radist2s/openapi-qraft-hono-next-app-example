import { Env } from "hono";
import { type JwtVariables } from "hono/jwt";
import { type Knex } from "knex";

export interface HonoEnv extends Env {
  Variables: {
    /**
     * Database connection will be shared across all middlewares and routers per request
     */
    db?: Knex;
  } & Partial<
    /**
     * Populated by the `jwtAuthMiddleware` or `jwtRefreshTokenMiddleware`
     */
    JwtVariables<JWTPayload>
  >;
  Bindings: {
    DB_FILE_PATH?: string;

    ACCESS_TOKEN_COOKIE_SECURE?: string;
    ACCESS_TOKEN_COOKIE_PATH?: string;
    ACCESS_TOKEN_COOKIE_DOMAIN?: string;
    ACCESS_TOKEN_COOKIE_SAME_SITE?: string;
    ACCESS_TOKEN_COOKIE_ALLOWED_ORIGINS?: string;

    REFRESH_TOKEN_COOKIE_SECURE?: string;
    REFRESH_TOKEN_COOKIE_DOMAIN?: string;
    REFRESH_TOKEN_COOKIE_PATH?: string;
    REFRESH_TOKEN_COOKIE_SAME_SITE?: string;
    REFRESH_TOKEN_COOKIE_ALLOWED_ORIGINS?: string; // TODO: Add support

    ACCESS_TOKEN_TTL?: string;
    ACCESS_TOKEN_SECRET?: string;
    REFRESH_TOKEN_TTL?: string;
    REFRESH_TOKEN_SECRET?: string;
  };
}

export type JWTPayload = {
  sub: string;
  user_id: string;
  role: "admin";
  exp: number;
  inCookie: boolean;
};
