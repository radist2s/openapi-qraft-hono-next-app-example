import { type Knex } from "knex";
import { createFakeUser } from "../helpers/createFakeUser";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex.schema.dropTableIfExists("users");

  // Inserts seed entries
  await knex.schema.createTable("users", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.tinyint("age");
    table.timestamp("created").defaultTo(knex.fn.now()).index();
  });

  await knex("users").insert(
    new Array(59).fill(0).map((_, index) => createFakeUser(String(index))),
  );
}
