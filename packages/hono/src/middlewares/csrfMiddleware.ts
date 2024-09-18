import type { Context, Input, Next } from "hono";
import { env } from "hono/adapter";
import { csrf } from "hono/csrf";
import wcmatch from "wildcard-match";
import { HonoEnv } from "../utils/HonoEnv";

export function csrfMiddleware<
  E extends HonoEnv = any,
  P extends string = string,
  I extends Input = {},
>(context: Context<E, P, I>, next: Next): Promise<Response | void> {
  return csrf({
    origin: (origin, context) => {
      const isMutationMethod =
        context.req.method === "POST" ||
        context.req.method === "PUT" ||
        context.req.method === "PATCH" ||
        context.req.method === "DELETE";

      // CSRF protection is not required for non-mutation methods
      if (!isMutationMethod) return true;

      const header = context.req.header();

      // Bearer authorization does not require CSRF protection
      if (header.authorization) return true;

      const allowedOrigins = env(
        context,
      )?.ACCESS_TOKEN_COOKIE_ALLOWED_ORIGINS?.split(",") ?? [
        header["x-forwarded-host"] || header["host"],
      ];

      return wcmatch(allowedOrigins, { separator: "." })(new URL(origin).host);
    },
  })(context, next);
}
