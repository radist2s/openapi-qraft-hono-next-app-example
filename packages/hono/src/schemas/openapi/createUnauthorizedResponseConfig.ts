import type { ResponseConfig } from "@asteasolutions/zod-to-openapi";
import { z } from "@hono/zod-openapi";

export function createUnauthorizedResponseConfig() {
  return {
    content: {
      "application/json": {
        schema: z
          .object({
            issues: z.array(
              z.object({
                path: z.array(z.string()),
                message: z.string(),
                fatal: z.boolean(),
                code: z.literal("unauthorized"),
              }),
            ),
          })
          .openapi("UnauthorizedErrorResponse"),
      },
    },
    description: "Unauthorized Error",
  } satisfies ResponseConfig;
}
