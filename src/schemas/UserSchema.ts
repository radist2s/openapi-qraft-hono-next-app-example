import { z } from "@hono/zod-openapi";

export const UserSchema = z
  .object({
    id: z
      .string()
      .describe("User ID")
      .openapi({ description: "The user's ID" }),
    name: z
      .string()
      .describe("User name")
      .openapi({ example: "John Doe", description: "The user's name" }),
    age: z
      .number()
      .describe("User age")
      .openapi({ example: 30, description: "The user's age" }),
    created: z
      .string()
      .describe("User created date")
      .openapi({ description: "The user's created date", format: "date-time" }),
  })
  .openapi("User");
