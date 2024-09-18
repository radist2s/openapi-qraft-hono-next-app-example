import { Knex } from "knex";
import { createFakeUser } from "../helpers/createFakeUser";

export async function up(knex: Knex) {
  await knex("users").insert(createFakeUser("20240425141133"));
}

export function down(knex: Knex) {
  knex("users").where("id", "20240425141133").del();
}
