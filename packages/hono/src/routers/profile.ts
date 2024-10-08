import type { OpenAPIHono } from "@hono/zod-openapi";
import { createRoute, z } from "@hono/zod-openapi";
import { jwtAccessTokenMiddleware } from "../middlewares/jwtAuthMiddleware";
import { createUnauthorizedResponseConfig } from "../schemas/openapi/createUnauthorizedResponseConfig";
import { createValidationResponseConfig } from "../schemas/openapi/createValidationResponseConfig";
import { accessSecuritySchema } from "../schemas/openapi/security";
import { HonoEnv } from "../utils/HonoEnv";

export function mountProfileRoutes(app: OpenAPIHono<HonoEnv>) {
  app.openapi(
    createRoute({
      method: "get",
      path: "/profile",
      operationId: "getProfile",
      description: "Get user profile",
      security: accessSecuritySchema,
      responses: {
        200: {
          content: {
            "application/json": {
              schema: z.object({
                email: z.string().openapi({
                  example: "john.doe@example.com",
                }),
              }),
            },
          },
          description: "Success response with JWT token in JSON",
        },
        422: createValidationResponseConfig(),
        401: createUnauthorizedResponseConfig(),
      },
      middleware: jwtAccessTokenMiddleware,
    }),
    async (context) => {
      const jwtPayload = context.get("jwtPayload");
      if (!jwtPayload) throw new Error("No access token");
      return context.json({ email: jwtPayload.user_id }, 200);
    },
  );
}
