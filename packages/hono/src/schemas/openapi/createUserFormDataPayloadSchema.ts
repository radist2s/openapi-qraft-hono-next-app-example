import { z } from "@hono/zod-openapi";

export function createUserFormDataPayloadSchema() {
  return z.object({
    name: z
      .string()
      .describe("User name")
      .min(1, "User name must be at least 1 character long")
      .openapi({ example: "John Doe" }),
    age: z.coerce
      .number()
      .min(1, "User age must be a number between 1 and 150")
      .max(150, "User age must be a number between 1 and 150")
      .describe("User age")
      .openapi({ example: 30 }),
  });
}
