import { z } from "@hono/zod-openapi";

export function createUserJsonPayloadSchema() {
  return z.object({
    name: z
      .string()
      .min(1, "User name must be at least 1 character long")
      .describe("User name")
      .openapi({ example: "John Doe" }),
    age: z
      .number()
      .describe("User age")
      .min(1, "User age must be a number between 1 and 150")
      .max(150, "User age must be a number between 1 and 150")
      .openapi({ example: 30 }),
  });
}
