import type { Context, Input, Next } from "hono";
import { env } from "hono/adapter";
import knex from "knex";
import { createDbConfig } from "../db/createDbConfig";
import { HonoEnv } from "../utils/HonoEnv";

/**
 * Creates a database connection and destroys it after the request is processed.
 */
export async function dbConnectionMiddleware<
  E extends HonoEnv = any,
  P extends string = string,
  I extends Input = {},
>(context: Context<E, P, I>, next: Next): Promise<Response | void> {
  const db = knex(createDbConfig(env(context)?.DB_FILE_PATH));
  context.set("db", db);
  void (await next());
  void (await db.destroy());
}
