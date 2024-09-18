import type { OpenAPIHono } from "@hono/zod-openapi";
import { HonoEnv } from "../utils/HonoEnv";
import { mountSignInRoutes } from "./auth";
import { mountProfileRoutes } from "./profile";
import { mountUsersRoutes } from "./users";

export function mountRoutes(app: OpenAPIHono<HonoEnv>) {
  mountSignInRoutes(app);
  mountProfileRoutes(app);
  mountUsersRoutes(app);
}
