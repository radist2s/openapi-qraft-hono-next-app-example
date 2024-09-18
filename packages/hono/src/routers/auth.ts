import type { OpenAPIHono } from "@hono/zod-openapi";
import type { CookieOptions } from "hono/utils/cookie";
import { createRoute, z } from "@hono/zod-openapi";
import { env } from "hono/adapter";
import { deleteCookie, setCookie } from "hono/cookie";
import {
  jwtAuthMiddleware,
  JWTTokenCookieName,
  signJWTPayload,
} from "../middlewares/jwtAuthMiddleware";
import { createUnauthorizedResponseConfig } from "../schemas/openapi/createUnauthorizedResponseConfig";
import { createValidationResponseConfig } from "../schemas/openapi/createValidationResponseConfig";
import { security } from "../schemas/openapi/security";
import { expires } from "../utils/expires";
import { HonoEnv } from "../utils/HonoEnv";

export function mountSignInRoutes(app: OpenAPIHono<HonoEnv>) {
  app.openapi(
    createRoute({
      method: "post",
      path: "/auth/login",
      operationId: "login",
      description: "Sign in",
      request: {
        query: z.object({
          mode: z.enum(["cookie", "json"]).optional().default("json").openapi({
            example: "json",
            description: "The mode to return the token",
          }),
        }),
        body: {
          content: {
            "multipart/form-data": {
              schema: z.object({
                email: z
                  .string()
                  .email()
                  .openapi({ example: "john.doe@example.com" }),
                password: z.string().min(1).openapi({ example: "123456" }),
              }),
            },
            "application/json": {
              schema: z.object({
                email: z
                  .string()
                  .email()
                  .openapi({ example: "john.doe@example.com" }),
                password: z.string().min(1).openapi({ example: "123456" }),
              }),
            },
          },
        },
      },
      responses: {
        204: {
          headers: z.object({
            Cookie: z.string().openapi({
              example: `${JWTTokenCookieName}=1234`,
            }),
          }),
          description: "Success response with JWT token in the cookie",
        },
        200: {
          content: {
            "application/json": {
              schema: z.object({
                token: z.string().openapi({
                  example: "eyJhbG...",
                }),
              }),
            },
          },
          description: "Success response with JWT token in JSON",
        },
        422: createValidationResponseConfig(),
      },
    }),
    async (context) => {
      const isFormDataRequest = context.req.raw.headers
        ?.get("Content-Type")
        ?.includes("multipart/form-data");

      const signInPayload = isFormDataRequest
        ? context.req.valid("form")
        : context.req.valid("json");

      const { mode } = context.req.valid("query");

      const { JWT_TTL = "1d", ...envVars } = env(context);

      const exp = expires(JWT_TTL);

      const token = await signJWTPayload(context, {
        sub: signInPayload.email,
        role: "admin",
        exp: exp.getTime(),
        inCookie: mode === "cookie",
      });

      if (mode === "cookie") {
        setCookie(context, JWTTokenCookieName, token, {
          path: "/",
          expires: exp,
          httpOnly: true,
          sameSite:
            envVars.ACCESS_TOKEN_COOKIE_SAME_SITE as CookieOptions["sameSite"],
          secure: Boolean(envVars.ACCESS_TOKEN_COOKIE_SECURE),
        });

        return context.body(null, 204);
      }

      return context.json({ token }, 200);
    },
  );

  app.openapi(
    createRoute({
      method: "post",
      path: "/auth/logout",
      operationId: "logout",
      description: "Sign out",
      security,
      responses: {
        204: {
          headers: z.object({
            Cookie: z.string().openapi({
              example: `${JWTTokenCookieName}=''`,
            }),
          }),
          description: "Success response with removed JWT token in the cookie",
        },
        422: createValidationResponseConfig(),
        401: createUnauthorizedResponseConfig(),
      },
      middleware: jwtAuthMiddleware,
    }),
    async (context) => {
      const jwtPayload = context.get("jwtPayload");
      if (jwtPayload?.inCookie) deleteCookie(context, JWTTokenCookieName);
      else {
        // If the JWT token is not in the cookie, we need to revoke the token.
        // Skipped in the example
      }
      return context.body(null, 204);
    },
  );
}
