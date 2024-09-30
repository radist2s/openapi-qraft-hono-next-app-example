import type { ResponseConfig } from "@asteasolutions/zod-to-openapi";
import { z } from "@hono/zod-openapi";
import { ValidationIssueSchema } from "../ValidationIssueSchema";

export function createValidationResponseConfig() {
  return {
    content: {
      "application/json": {
        schema: z
          .object({
            issues: z.array(ValidationIssueSchema),
          })
          .openapi("ValidationErrorResponse"),
      },
    },
    description: "Validation Error",
  } satisfies ResponseConfig;
}
