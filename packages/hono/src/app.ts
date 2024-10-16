import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { csrfMiddleware } from "./middlewares/csrfMiddleware";
import { ACCESS_TOKEN_COOKIE_NAME } from "./middlewares/jwtAuthMiddleware";
import { mountRoutes } from "./routers";
import { type HonoEnv } from "./utils/HonoEnv";

const app = new OpenAPIHono<HonoEnv>({
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

/**
 * CSRF protection middleware
 */
app.use("*", csrfMiddleware);

/**
 * Database connection middleware.
 *
 * Disabled for the example, as only the `users` router uses the database connection.
 */
// app.use("*", dbConnectionMiddleware);

// JWT authentication security scheme definition (in cookie) (affects only the final OpenAPI document)
app.openAPIRegistry.registerComponent("securitySchemes", "cookieAuth", {
  type: "apiKey",
  in: "cookie",
  name: ACCESS_TOKEN_COOKIE_NAME,
});

// JWT authentication security scheme definition (in authorization header) (affects only the final OpenAPI document)
app.openAPIRegistry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  in: "cookie",
  scheme: "bearer",
  bearerFormat: "JWT",
});

// The OpenAPI documentation will be available at /doc
app.doc31("/doc", {
  openapi: "3.1.0",
  info: {
    version: "1.0.0",
    title: "My API",
  },
});

app.get(
  "/doc/ui",
  apiReference({
    spec: {
      url: "/api/doc",
    },
  }),
);

// Mount the actual application routes
mountRoutes(app);

export default app;
