import type { Context, Input, Next } from "hono";
import { env } from "hono/adapter";
import { HTTPException } from "hono/http-exception";
import { jwt, sign } from "hono/jwt";
import { HonoEnv, JWTPayload } from "../utils/HonoEnv";

export function jwtAccessTokenMiddleware<
  E extends HonoEnv = any,
  P extends string = string,
  I extends Input = {},
>(context: Context<E, P, I>, next: Next): Promise<Response | void> {
  return handleJWTAuthMiddleware(
    {
      secretName: "ACCESS_TOKEN_SECRET",
      cookieName: ACCESS_TOKEN_COOKIE_NAME,
    },
    context,
    next,
  );
}

export function jwtRefreshTokenMiddleware<
  E extends HonoEnv = any,
  P extends string = string,
  I extends Input = {},
>(context: Context<E, P, I>, next: Next): Promise<Response | void> {
  return handleJWTAuthMiddleware(
    {
      secretName: "REFRESH_TOKEN_SECRET",
      cookieName: REFRESH_TOKEN_COOKIE_NAME,
    },
    context,
    next,
  );
}

/**
 * JWT authentication middleware handler for Hono with a custom error format for the access token.
 */
function handleJWTAuthMiddleware<
  E extends HonoEnv = any,
  P extends string = string,
  I extends Input = {},
>(
  {
    secretName,
    cookieName,
  }: {
    secretName: JWTSecretKeyName;
    cookieName: string;
  },
  context: Context<E, P, I>,
  next: Next,
): Promise<Response | void> {
  const header = context.req.header();
  const jwtMiddleware = jwt({
    secret: getSigningSecret(context, secretName),
    // If `Authorization` is not present, the JWT token should be in the cookie
    cookie: header.authorization ? undefined : cookieName,
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
export async function signJWTPayload(secret: string, payload: JWTPayload) {
  return sign(payload, secret);
}

type JWTSecretKeyName = Extract<
  keyof HonoEnv["Bindings"],
  "REFRESH_TOKEN_SECRET" | "ACCESS_TOKEN_SECRET"
>;

export function getSigningSecret<
  E extends HonoEnv = any,
  P extends string = string,
  I extends Input = {},
>(context: Context<E, P, I>, secret: JWTSecretKeyName) {
  return env(context)?.[secret] ?? "SECRET";
}

export const ACCESS_TOKEN_COOKIE_NAME = "my-access-token";
export const REFRESH_TOKEN_COOKIE_NAME = "my-refresh-token";
