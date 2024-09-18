import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { UserSchema } from "@/schemas/UserSchema";
import { ZodIssueUnionSchema } from "@/schemas/ZodIssueUnionSchema";
import { createUser, getUserById, getUsers, updateUser } from "@/db";
import { ResponseConfig } from "@asteasolutions/zod-to-openapi/dist/openapi-registry";

export const app = new OpenAPIHono({
  defaultHook: (result, context) => {
    if (!result.success) {
      return context.json(
        {
          issues: result.error.issues,
        },
        422,
      );
    }
  },
}).basePath("/api");

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
  }),
  async (context) => {
    const { id } = context.req.valid("param");
    return context.json(await getUserById(id));
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
            (val) => Number(val),
            z.number().min(1).optional().default(1), // specify the type and minimum value of the query parameter
          )
          .openapi({ example: 2 }), // add an example value to be used in the OpenAPI documentation

        limit: z
          .preprocess(
            (val) => Number(val),
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
  }),
  async (context) => {
    const { page, limit } = context.req.valid("query");
    return context.json(await getUsers({ page, limit }));
  },
);

app.openapi(
  createRoute({
    method: "post",
    path: "/users",
    description: "Create user",
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
      422: zodValidationResponseConfig(),
    },
  }),
  async (context) => {
    const newUser = context.req.raw.headers
      ?.get("Content-Type")
      ?.includes("multipart/form-data")
      ? context.req.valid("form")
      : context.req.valid("json");

    return context.json(await createUser(newUser), 200);
  },
);

app.openapi(
  createRoute({
    method: "put",
    path: "/users",
    description: "Update user",
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
      422: zodValidationResponseConfig(),
    },
  }),
  async (context) => {
    const userToUpdate = context.req.raw.headers
      ?.get("Content-Type")
      ?.includes("multipart/form-data")
      ? context.req.valid("form")
      : context.req.valid("json");

    return context.json(await updateUser(userToUpdate), 200);
  },
);

// The OpenAPI documentation will be available at /doc
app.doc31("/doc", {
  openapi: "3.1.0",
  info: {
    version: "1.0.0",
    title: "My API",
  },
});

function createUserFormPayloadSchema() {
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

function createUserJsonPayloadSchema() {
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

function zodValidationResponseConfig(): ResponseConfig {
  return {
    content: {
      "application/json": {
        schema: z
          .object({
            issues: z.array(ZodIssueUnionSchema),
          })
          .openapi("ValidationErrorResponse"),
      },
    },
    description: "Validation Error",
  };
}
