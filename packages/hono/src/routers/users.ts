import type { OpenAPIHono } from "@hono/zod-openapi";
import { createRoute, z } from "@hono/zod-openapi";
import { createUser, getUserById, getUsers, updateUser } from "../db";
import { dbConnectionMiddleware } from "../middlewares/dbConnectionMiddleware";
import { jwtAccessTokenMiddleware } from "../middlewares/jwtAuthMiddleware";
import { createUnauthorizedResponseConfig } from "../schemas/openapi/createUnauthorizedResponseConfig";
import { createUserFormPayloadSchema } from "../schemas/openapi/createUserFormPayloadSchema";
import { createUserJsonPayloadSchema } from "../schemas/openapi/createUserJsonPayloadSchema";
import { createValidationResponseConfig } from "../schemas/openapi/createValidationResponseConfig";
import { accessSecuritySchema } from "../schemas/openapi/security";
import { UserSchema } from "../schemas/UserSchema";
import { HonoEnv } from "../utils/HonoEnv";

export function mountUsersRoutes(app: OpenAPIHono<HonoEnv>) {
  app.openapi(
    createRoute({
      method: "get",
      path: "/users/{id}",
      description: "Get user",
      request: {
        params: z.object({
          id: z.string().openapi({ example: "1234" }), // specify '{id}' as a path parameter
        }),
      },
      responses: {
        200: {
          content: {
            "application/json": { schema: UserSchema },
          },
          description: "Retrieve the user",
        },
      },
      middleware: dbConnectionMiddleware,
    }),
    async (context) => {
      if (!context.var.db) throw new Error("No database connection");

      const { id } = context.req.valid("param");
      return context.json(await getUserById(id, context.var.db));
    },
  );

  app.openapi(
    createRoute({
      method: "get",
      path: "/users",
      description: "Get users",
      request: {
        query: z.object({
          page: z // specify '?page' as a query parameter
            .preprocess(
              // convert string to number
              (val) => Number(val) || undefined,
              z.number().min(1).optional().default(1), // specify the type and minimum value of the query parameter
            )
            .openapi({ example: 2 }), // add an example value to be used in the OpenAPI documentation

          limit: z
            .preprocess(
              (val) => Number(val) || undefined,
              z.number().min(1).max(100).optional().default(10),
            )
            .openapi({ example: 10 }),
        }),
      },
      responses: {
        200: {
          content: {
            "application/json": { schema: z.array(UserSchema) },
          },
          description: "Retrieve users",
        },
      },
      middleware: dbConnectionMiddleware,
    }),
    async (context) => {
      if (!context.var.db) throw new Error("No database connection");

      const { page, limit } = context.req.valid("query");
      return context.json(await getUsers({ page, limit }, context.var.db));
    },
  );

  app.openapi(
    createRoute({
      method: "post",
      path: "/users",
      description: "Create user",
      security: accessSecuritySchema,
      request: {
        body: {
          content: {
            "multipart/form-data": {
              schema: createUserFormPayloadSchema().openapi(
                "UserCreatePayloadFormData",
              ),
            },
            "application/json": {
              schema: createUserJsonPayloadSchema().openapi(
                "UserCreatePayloadJson",
              ),
            },
          },
        },
      },
      responses: {
        200: {
          content: {
            "application/json": { schema: UserSchema },
          },
          description: "Success response",
        },
        422: createValidationResponseConfig(),
        401: createUnauthorizedResponseConfig(),
      },
      middleware: [jwtAccessTokenMiddleware, dbConnectionMiddleware],
    }),
    async (context) => {
      if (!context.var.db) throw new Error("No database connection");

      const newUserPayload = context.req.raw.headers
        ?.get("Content-Type")
        ?.includes("multipart/form-data")
        ? context.req.valid("form")
        : context.req.valid("json");

      return context.json(
        await createUser(newUserPayload, context.var.db),
        200,
      );
    },
  );

  app.openapi(
    createRoute({
      method: "put",
      path: "/users",
      description: "Update user",
      security: accessSecuritySchema,
      request: {
        body: {
          content: {
            "multipart/form-data": {
              schema: createUserFormPayloadSchema()
                .merge(
                  z.object({
                    id: z.string().min(1).openapi({ example: "1234" }),
                  }),
                )
                .openapi("UserUpdatePayloadFormData"),
            },
            "application/json": {
              schema: createUserJsonPayloadSchema()
                .merge(
                  z.object({
                    id: z.string().min(1).openapi({ example: "1234" }),
                  }),
                )
                .openapi("UserUpdatePayloadJson"),
            },
          },
        },
      },
      responses: {
        200: {
          content: {
            "application/json": { schema: UserSchema },
          },
          description: "Success response",
        },
        422: createValidationResponseConfig(),
        401: createUnauthorizedResponseConfig(),
      },
      middleware: [jwtAccessTokenMiddleware, dbConnectionMiddleware],
    }),
    async (context) => {
      if (!context.var.db) throw new Error("No database connection");

      const userToUpdate = context.req.raw.headers
        ?.get("Content-Type")
        ?.includes("multipart/form-data")
        ? context.req.valid("form")
        : context.req.valid("json");

      return context.json(await updateUser(userToUpdate, context.var.db), 200);
    },
  );
}
