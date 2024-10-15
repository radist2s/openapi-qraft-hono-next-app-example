import type { ResponseConfig } from "@asteasolutions/zod-to-openapi";
import type { OpenAPIHono } from "@hono/zod-openapi";
import type { CookieOptions } from "hono/utils/cookie";
import { createRoute, z } from "@hono/zod-openapi";
import { type Context } from "hono";
import { env } from "hono/adapter";
import { deleteCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { sign } from "hono/jwt";
import {
  createSession,
  deleteSession,
  getSessionById,
  renewSession,
} from "../db";
import { dbConnectionMiddleware } from "../middlewares/dbConnectionMiddleware";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  getSigningSecret,
  jwtAccessTokenMiddleware,
  jwtRefreshTokenMiddleware,
  REFRESH_TOKEN_COOKIE_NAME,
} from "../middlewares/jwtAuthMiddleware";
import { createUnauthorizedResponseConfig } from "../schemas/openapi/createUnauthorizedResponseConfig";
import { createValidationResponseConfig } from "../schemas/openapi/createValidationResponseConfig";
import {
  accessSecuritySchema,
  refreshSecuritySchema,
} from "../schemas/openapi/security";
import { expires } from "../utils/expires";
import { HonoEnv, JWTPayload } from "../utils/HonoEnv";

export function mountSignInRoutes(app: OpenAPIHono<HonoEnv>) {
  app.openapi(
    createRoute({
      method: "post",
      path: "/auth/login",
      operationId: "login",
      description: "Sign in",
      request: {
        query: createReturnModeQuerySchema(),
        body: {
          required: true,
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
        201: createSuccessAuthResponseConfig(),
        422: createValidationResponseConfig(),
      },
      middleware: dbConnectionMiddleware,
    }),
    async (context) => {
      const isFormDataRequest = context.req.raw.headers
        ?.get("Content-Type")
        ?.includes("multipart/form-data");

      const signInPayload = isFormDataRequest
        ? context.req.valid("form")
        : context.req.valid("json");

      const { mode } = context.req.valid("query");

      if (!context.var.db) throw new Error("No database connection");

      const session = await createSession(
        {
          user_agent: context.req.header()["user-agent"] ?? "",
          user_id: signInPayload.email,
        },
        context.var.db,
      );

      if (!session)
        throw new HTTPException(400, {
          message: "Failed to create session",
        });

      return processSessionResponse(context, mode, session);
    },
  );

  app.openapi(
    createRoute({
      method: "post",
      path: "/auth/refresh",
      operationId: "refresh",
      description: "Refresh the access token",
      security: refreshSecuritySchema,
      request: {
        query: createReturnModeQuerySchema(),
      },
      responses: {
        201: createSuccessAuthResponseConfig(),
        422: createValidationResponseConfig(),
      },
      middleware: [jwtRefreshTokenMiddleware, dbConnectionMiddleware],
    }),
    async (context) => {
      if (!context.var.db) throw new Error("No database connection");

      const refreshToken = context.get("jwtPayload");
      if (!refreshToken)
        throw new HTTPException(403, {
          message: "No refresh token",
        });

      const session = await getSessionById(refreshToken.sub, context.var.db);
      if (!session)
        throw new HTTPException(400, {
          message: "Invalid refresh token",
        });

      // todo::add session expiration check based on the `session.created` and `refreshToken.exp`

      await renewSession(session.uuid, context.var.db);

      const { mode } = context.req.valid("query");

      return processSessionResponse(context, mode, session);
    },
  );

  app.openapi(
    createRoute({
      method: "post",
      path: "/auth/logout",
      operationId: "logout",
      description: "Sign out",
      security: accessSecuritySchema,
      responses: {
        205: {
          headers: z.object({
            "set-cookie": z
              .string()
              .openapi({
                example: `${ACCESS_TOKEN_COOKIE_NAME}=; ${REFRESH_TOKEN_COOKIE_NAME}=`,
              })
              .openapi({
                description: "Cookies removal header",
              }),
          }),
          description: "Success response with cookies removal",
        },
        401: createUnauthorizedResponseConfig(),
      },
      middleware: [jwtAccessTokenMiddleware, dbConnectionMiddleware],
    }),
    async (context) => {
      if (!context.var.db) throw new Error("No database connection");

      const jwtPayload = context.get("jwtPayload");
      if (!jwtPayload) throw new Error("No access token");

      if (jwtPayload?.inCookie) {
        deleteCookie(context, REFRESH_TOKEN_COOKIE_NAME);
        deleteCookie(context, ACCESS_TOKEN_COOKIE_NAME);
      }

      await deleteSession(jwtPayload.sub, context.var.db);

      return context.body(null, 205);
    },
  );
}

async function processSessionResponse(
  context: Context<HonoEnv>,
  mode: "cookie" | "json" | "hybrid",
  {
    uuid,
    user_id,
  }: {
    uuid: string;
    user_id: string;
  },
) {
  const {
    ACCESS_TOKEN_TTL = "15m",
    ACCESS_TOKEN_COOKIE_SECURE,
    ACCESS_TOKEN_COOKIE_PATH = "/",
    ACCESS_TOKEN_COOKIE_DOMAIN,
    ACCESS_TOKEN_COOKIE_SAME_SITE,
    REFRESH_TOKEN_TTL = "10d",
    REFRESH_TOKEN_COOKIE_SECURE,
    REFRESH_TOKEN_COOKIE_PATH = "/",
    REFRESH_TOKEN_COOKIE_DOMAIN,
    REFRESH_TOKEN_COOKIE_SAME_SITE,
  } = env(context);

  const refreshTokenExpires = expires(REFRESH_TOKEN_TTL);

  const tokenCommonPayload: Pick<JWTPayload, "sub" | "user_id" | "role"> = {
    sub: uuid,
    user_id: user_id,
    role: "admin",
  };

  const refreshToken = await sign(
    {
      ...tokenCommonPayload,
      inCookie: mode === "cookie" || mode === "hybrid",
      exp: refreshTokenExpires.getTime(),
    } satisfies JWTPayload,
    getSigningSecret(context, "REFRESH_TOKEN_SECRET"),
  );

  const accessTokenExpires = expires(ACCESS_TOKEN_TTL);
  const accessToken = await sign(
    {
      ...tokenCommonPayload,
      inCookie: mode === "cookie",
      exp: accessTokenExpires.getTime(),
    } satisfies JWTPayload,
    getSigningSecret(context, "ACCESS_TOKEN_SECRET"),
  );

  if (mode === "cookie" || mode === "hybrid")
    setCookie(context, REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      path: REFRESH_TOKEN_COOKIE_PATH,
      domain: REFRESH_TOKEN_COOKIE_DOMAIN,
      expires: refreshTokenExpires,
      httpOnly: true,
      sameSite: REFRESH_TOKEN_COOKIE_SAME_SITE as CookieOptions["sameSite"],
      secure: Boolean(REFRESH_TOKEN_COOKIE_SECURE),
    });

  if (mode === "cookie") {
    setCookie(context, ACCESS_TOKEN_COOKIE_NAME, accessToken, {
      path: ACCESS_TOKEN_COOKIE_PATH,
      domain: ACCESS_TOKEN_COOKIE_DOMAIN,
      expires: accessTokenExpires,
      httpOnly: true,
      sameSite: ACCESS_TOKEN_COOKIE_SAME_SITE as CookieOptions["sameSite"],
      secure: Boolean(ACCESS_TOKEN_COOKIE_SECURE),
    });

    return context.text("", 201);
  }

  return context.json(
    { access_token: accessToken, refresh_token: refreshToken },
    201,
  );
}

function createReturnModeQuerySchema() {
  return z.object({
    mode: z
      .enum(["cookie", "json", "hybrid"])
      .optional()
      .default("json")
      .openapi({
        example: "json",
        description:
          "The mode to return the token. The `hybrid` mode will set the refresh token in the cookie" +
          " and the access token in the JSON response.",
      }),
  });
}

function createSuccessAuthResponseConfig() {
  return {
    headers: z.object({
      "set-cookie": z
        .string()
        .openapi({
          example: `${ACCESS_TOKEN_COOKIE_NAME}=eyJhbG...; ${REFRESH_TOKEN_COOKIE_NAME}=eyJhbG...`,
        })
        .openapi({
          description:
            "If the `mode` is `cookie` or `hybrid`, the cookie will be set.",
        }),
    }),
    content: {
      "text/plain": {
        schema: z.string().min(0),
      },
      "application/json": {
        schema: z
          .object({
            access_token: z.string().openapi({
              example: "eyJhbG...",
              description: "The token to be used in the Authorization header",
            }),
            refresh_token: z.string().openapi({
              example: "eyJhbG...",
              description: "The token to be used to refresh the `access_token`",
            }),
          })
          .openapi({
            description:
              "If the `mode` is `json`, the `access_token` and `refresh_token` will be returned.",
          }),
      },
    },
    description: "Success response with JWT token in JSON",
  } satisfies ResponseConfig;
}
