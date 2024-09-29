import { type Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("sessions");

  await knex.schema.createTable("sessions", (table) => {
    table.uuid("uuid").defaultTo(knex.fn.uuid()).primary();
    table.string("user_id").notNullable();
    table.string("user_agent").notNullable();
    table.timestamp("renewed").nullable().index();
    table.timestamp("created").defaultTo(knex.fn.now()).index();
  });
}
