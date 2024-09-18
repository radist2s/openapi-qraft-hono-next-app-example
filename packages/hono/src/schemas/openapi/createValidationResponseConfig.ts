import type { ResponseConfig } from "@asteasolutions/zod-to-openapi/dist/openapi-registry";
import { z } from "@hono/zod-openapi";
import { ValidationIssueSchema } from "../ValidationIssueSchema";

export function createValidationResponseConfig(): ResponseConfig {
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
  };
}
