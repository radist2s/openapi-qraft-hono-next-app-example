import type { Knex } from "knex";
import type { UserSchema } from "../schemas/UserSchema";
import { z } from "@hono/zod-openapi";

export async function getUsers(
  {
    page,
    limit,
  }: {
    page: number;
    limit: number;
  },
  db: Knex,
): Promise<User[]> {
  return db
    .table("users")
    .limit(limit)
    .offset((page - 1) * limit)
    .orderBy("created", "desc")
    .select("*");
}

export async function createUser(
  userData: Omit<Partial<z.infer<typeof UserSchema>>, "id">,
  db: Knex,
): Promise<User> {
  const inserted = await db.table("users").insert(userData);
  if (!inserted.length) throw new Error("User not inserted");
  const user = await getUserById(String(inserted[0]), db);
  if (!user) throw new Error("User not found");
  return user;
}

export async function updateUser(
  { id, ...userRest }: { id: string } & Partial<z.infer<typeof UserSchema>>,
  db: Knex,
): Promise<User> {
  await db.table("users").where({ id }).update(userRest);
  const user = await getUserById(id, db);
  if (!user) throw new Error("User not found");
  return user;
}

export async function getUserById(
  id: string,
  db: Knex,
): Promise<z.infer<typeof UserSchema> | undefined> {
  return db.table("users").where("id", id).first();
}

export type User = z.infer<typeof UserSchema>;
