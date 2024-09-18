import type { Context, Input, Next } from "hono";
import { env } from "hono/adapter";
import { HTTPException } from "hono/http-exception";
import { jwt, sign } from "hono/jwt";
import { HonoEnv, JWTPayload } from "../utils/HonoEnv";

/**
 * JWT authentication middleware for Hono with a custom error format.
 */
export function jwtAuthMiddleware<
  E extends HonoEnv = any,
  P extends string = string,
  I extends Input = {},
>(context: Context<E, P, I>, next: Next): Promise<Response | void> {
  const header = context.req.header();
  const jwtMiddleware = jwt({
    secret: getJWTSecret(context),
    // If `Authorization` is not present, the JWT token should be in the cookie
    cookie: header.authorization ? undefined : JWTTokenCookieName,
  });
  return jwtMiddleware(context, next).catch((error) => {
    if (!(error instanceof HTTPException) || error.status !== 401) throw error;

    const extendedHeaders = new Headers(error.res?.headers);
    extendedHeaders.set("Content-Type", "application/json");
    // Custom 401 error format in favor of client-side type safety
    const unauthorizedError = {
      issues: [
        {
          path: [],
          message: error.message,
          fatal: true,
          code: "unauthorized",
        },
      ],
    };

    throw new HTTPException(error.status, {
      message: error.message,
      cause: error.cause,
      res: new Response(JSON.stringify(unauthorizedError), {
        ...error.res,
        headers: extendedHeaders,
      }),
    });
  });
}

/**
 * Signs a JWT payload with the secret from the environment and returns the token.
 */
export async function signJWTPayload<
  E extends HonoEnv = any,
  P extends string = string,
  I extends Input = {},
>(context: Context<E, P, I>, payload: JWTPayload) {
  return sign(payload, getJWTSecret(context));
}

function getJWTSecret<
  E extends HonoEnv = any,
  P extends string = string,
  I extends Input = {},
>(context: Context<E, P, I>) {
  return env(context)?.JWT_SECRET ?? "SECRET";
}

export const JWTTokenCookieName = "my-jwt-token";
