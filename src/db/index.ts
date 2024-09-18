import knex from "knex";
import { config } from "./knexfile";
import { z } from "@hono/zod-openapi";
import type { UserSchema } from "@/schemas/UserSchema";

// Can only be imported from SSR files
const db = knex(config);

export async function getUsers({
  page,
  limit,
}: {
  page: number;
  limit: number;
}): Promise<User[]> {
  return db
    .table("users")
    .limit(limit)
    .offset((page - 1) * limit)
    .orderBy("created", "desc")
    .select("*");
}

export async function createUser(
  user: Omit<Partial<z.infer<typeof UserSchema>>, "id">,
): Promise<User> {
  return db.table("users").insert(user);
}

export async function updateUser({
  id,
  ...userRest
}: { id: string } & Partial<z.infer<typeof UserSchema>>): Promise<User> {
  await db.table("users").where({ id }).update(userRest);
  const user = await getUserById(id);
  if (!user) throw new Error("User not found");
  return user;
}

export async function getUserById(
  id: string,
): Promise<z.infer<typeof UserSchema> | undefined> {
  return db.table("users").where("id", id).first();
}

export type User = z.infer<typeof UserSchema>;
