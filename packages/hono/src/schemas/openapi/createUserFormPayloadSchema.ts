import { z } from "@hono/zod-openapi";

export function createUserFormPayloadSchema() {
  return z.object({
    name: z
      .string()
      .describe("User name")
      .min(1, "User name must be at least 1 character long")
      .openapi({ example: "John Doe" }),
    age: z
      .string()
      .describe("User age")
      .transform((val) => Number(val))
      .pipe(
        z
          .number()
          .min(1, "User age must be a number between 1 and 150")
          .max(150, "User age must be a number between 1 and 150"),
      )
      .openapi({ example: "30" }),
  });
}
